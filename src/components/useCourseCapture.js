import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import * as htmlToImage from 'html-to-image';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Media } from '@whiteguru/capacitor-plugin-media';

function isPermissionError(err) {
  const text = `${err?.message ?? ''} ${err?.code ?? ''}`.toLowerCase();
  return text.includes('permission') || text.includes('denied');
}

export function useCourseCapture(courseData) {
  const cardRef = useRef(null);
  const listRef = useRef(null);

  const [lineRect, setLineRect] = useState({ top: 0, height: 0 });
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  // 첫 핀 중심 ~ 마지막 핀 중심까지의 점선 위치를 실제 DOM 기준으로 측정
  const measureLine = useCallback(() => {
    const listEl = listRef.current;
    if (!listEl) return { top: 0, height: 0 };

    const pins = listEl.querySelectorAll('.course-result-card__place-pin');
    if (pins.length < 2) return { top: 0, height: 0 };

    const listTop = listEl.getBoundingClientRect().top;
    const firstPinRect = pins[0].getBoundingClientRect();
    const lastPinRect = pins[pins.length - 1].getBoundingClientRect();
    const top = firstPinRect.top + firstPinRect.height / 2 - listTop;
    const bottom = lastPinRect.top + lastPinRect.height / 2 - listTop;
    return { top, height: Math.max(bottom - top, 0) };
  }, []);

  useLayoutEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    setLineRect(measureLine());

    const resizeObserver = new ResizeObserver(() => setLineRect(measureLine()));
    resizeObserver.observe(listEl);

    return () => resizeObserver.disconnect();
  }, [courseData?.places, measureLine]);

  // ---------- 이미지 캡처 (html-to-image 적용) ----------
  const captureCard = useCallback(async () => {
    const cardEl = cardRef.current;
    const listEl = listRef.current;
    const prevMaxHeight = listEl.style.maxHeight;
    const prevOverflow = listEl.style.overflowY;

    cardEl.classList.add('is-capturing');
    listEl.style.maxHeight = 'none';
    listEl.style.overflowY = 'visible';

    flushSync(() => {
      setLineRect(measureLine());
    });

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));

    let dataUrl;
    try {
      // 픽셀 레티나 배율 적용 (pixelRatio: 2)
      dataUrl = await htmlToImage.toPng(cardEl, {
        pixelRatio: 2,
        cacheBust: true,
        width: cardEl.offsetWidth,
        height: cardEl.offsetHeight,
        style: {
          margin: '0',
          transform: 'none',
        },
      });
    } catch (e) {
      console.error('Capture error, retrying once...', e);
      dataUrl = await htmlToImage.toPng(cardEl, {
        pixelRatio: 2,
        cacheBust: true,
        width: cardEl.offsetWidth,
        height: cardEl.offsetHeight,
        style: {
          margin: '0',
          transform: 'none',
        },
      });
    } finally {
      cardEl.classList.remove('is-capturing');
      listEl.style.maxHeight = prevMaxHeight;
      listEl.style.overflowY = prevOverflow;
      setLineRect(measureLine());
    }

    return dataUrl;
  }, [measureLine]);

  const writeCapturedFile = useCallback(
    async (dataUrl) => {
      const fileName = `tripping_${courseData.courseId}_${Date.now()}.png`;
      const base64Data = dataUrl.split(',')[1];

      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      return writeResult.uri;
    },
    [courseData?.courseId]
  );

  // ---------- 갤러리 저장 ----------
  const handleSaveImage = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const dataUrl = await captureCard();

      if (Capacitor.isNativePlatform()) {
        const fileUri = await writeCapturedFile(dataUrl);

        try {
          await Media.savePhoto({ path: fileUri, album: { name: 'TripPing' } });
          alert('갤러리에 카드가 저장되었습니다!');
        } catch (mediaErr) {
          if (isPermissionError(mediaErr)) {
            alert(
              '갤러리 저장 권한이 꺼져 있어요.\n설정 > 앱 > TripPing > 권한에서 "사진 및 동영상"을 허용한 뒤 다시 시도해주세요.'
            );
            return;
          }
          throw mediaErr;
        }
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `tripping_${courseData.courseId}.png`;
        link.click();
      }
    } catch (err) {
      console.error(err);
      alert('이미지 저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }, [saving, captureCard, writeCapturedFile, courseData?.courseId]);

  // ---------- 공유 ----------
  const handleShareImage = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const dataUrl = await captureCard();

      if (Capacitor.isNativePlatform()) {
        const fileUri = await writeCapturedFile(dataUrl);

        await Share.share({
          title: courseData.courseTitle,
          url: fileUri,
          dialogTitle: '코스 카드 공유',
        });
        return;
      }

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `tripping_${courseData.courseId}.png`, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: courseData.courseTitle,
          files: [file],
        });
      } else {
        alert('웹 미리보기에서는 공유시트를 지원하지 않아요. 이미지를 다운로드할게요.');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `tripping_${courseData.courseId}.png`;
        link.click();
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error(err);
        alert('이미지 공유에 실패했어요. 다시 시도해주세요.');
      }
    } finally {
      setSharing(false);
    }
  }, [sharing, captureCard, writeCapturedFile, courseData?.courseId, courseData?.courseTitle]);

  return {
    cardRef,
    listRef,
    lineRect,
    saving,
    sharing,
    handleSaveImage,
    handleShareImage,
  };
}