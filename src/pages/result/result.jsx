// src/pages/result/result.jsx
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, Share2, FlagTriangleRight, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Media } from '@whiteguru/capacitor-plugin-media';

import MobileLayout from '../../components/MobileLayout';
import symbolW from '../../assets/symbolW.png';
import logoW from '../../assets/logoW.png';

import './result.css';

function isPermissionError(err) {
  const text = `${err?.message ?? ''} ${err?.code ?? ''}`.toLowerCase();
  return text.includes('permission') || text.includes('denied');
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const courseData = location.state?.result;

  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const cardRef = useRef(null);
  const listRef = useRef(null);

  const [lineRect, setLineRect] = useState({ top: 0, height: 0 });

  useEffect(() => {
    if (!courseData) {
      navigate('/select', { replace: true });
    }
  }, [courseData, navigate]);

  const measureLine = useCallback(() => {
    const listEl = listRef.current;
    if (!listEl) return { top: 0, height: 0 };

    const pins = listEl.querySelectorAll('.result-card__place-pin');
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

  if (!courseData) return null;

  const tags = courseData.tags ?? [];
  const placeCount = courseData.places?.length ?? 0;

  // ---------- 이미지 캡처 ----------
  const captureCard = async () => {
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

    let canvas;
    try {
      canvas = await html2canvas(cardEl, {
        useCORS: true,
        backgroundColor: null,
        scale: Math.min(window.devicePixelRatio || 2, 3),
      });
    } catch (e) {
      canvas = await html2canvas(cardEl, {
        allowTaint: true,
        backgroundColor: null,
        scale: 2,
      });
    } finally {
      cardEl.classList.remove('is-capturing');
      listEl.style.maxHeight = prevMaxHeight;
      listEl.style.overflowY = prevOverflow;
      setLineRect(measureLine());
    }

    return canvas;
  };

  const writeCapturedFile = async (dataUrl) => {
    const fileName = `tripping_${courseData.courseId}_${Date.now()}.png`;
    const base64Data = dataUrl.split(',')[1];

    const writeResult = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    return writeResult.uri;
  };

  const handleSaveImage = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const canvas = await captureCard();
      const dataUrl = canvas.toDataURL('image/png');

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
  };

  const handleShareImage = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const canvas = await captureCard();
      const dataUrl = canvas.toDataURL('image/png');

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
  };

  return (
    <MobileLayout background="#F5F7F8">
      {/* ── 상단 헤더: 좌(이동 그룹) / 우(액션 그룹) ── */}
      <header className="result-header">
        <div className="result-header__group">
          <button
            className="result-header__box result-header__back"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="result-header__box result-header__home"
            onClick={() => navigate('/select')}
            aria-label="홈으로"
          >
            <img src={symbolW} alt="" />
          </button>
        </div>

        <div className="result-header__group">
          <button
            className="result-header__box result-header__action"
            onClick={handleSaveImage}
            disabled={saving}
            aria-label="이미지 저장"
          >
            <Download size={20} />
          </button>
          <button
            className="result-header__box result-header__action"
            onClick={handleShareImage}
            disabled={sharing}
            aria-label="공유하기"
          >
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* ── 코스 결과 카드 ── */}
      <div className="result-card" ref={cardRef}>
        <div className="result-card__top">
          <h1 className="result-card__title">{courseData.courseTitle}</h1>
          <p className="result-card__desc">{courseData.description}</p>

          {tags.length > 0 && (
            <div className="result-card__tags">
              {tags.map((tag) => (
                <span key={tag} className="result-card__tag">
                  <span className="result-card__tag-text">{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="result-card__inner">
          <div
            className="result-card__map"
            role="img"
            aria-label="코스 지도"
            style={courseData.mapImageUrl ? { backgroundImage: `url("${courseData.mapImageUrl}")` } : undefined}
          />

          <ul className="result-card__list" ref={listRef}>
            {placeCount > 1 && (
              <span
                className="result-card__list-line"
                style={{ top: `${lineRect.top}px`, height: `${lineRect.height}px` }}
                aria-hidden="true"
              />
            )}
            {courseData.places.map((place) => {
              const isMain = place.order === 1;
              return (
                <li key={place.placeId} className="result-card__place">
                  <span className="result-card__place-pin">
                    <MapPin
                      size={20}
                      preserveAspectRatio="none"
                      color="var(--color-accent, #ff9f5a)"
                      fill={isMain ? 'none' : 'var(--color-accent, #ff9f5a)'}
                    />
                  </span>
                  <div
                    className="result-card__place-thumb"
                    role="img"
                    aria-label={place.name}
                    style={place.imageUrl ? { backgroundImage: `url("${place.imageUrl}")` } : undefined}
                  />
                  <div>
                    <span className="result-card__place-name">{place.name}</span>
                    {place.description && (
                      <p className="result-card__place-desc">{place.description}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="result-card__meta">
            <span>
              <FlagTriangleRight size={17} /> 총 {placeCount}곳 방문
            </span>
            <span>
              <Clock size={17} /> 예상 소요시간: {courseData.estimatedDuration ?? '약 -시간'}
            </span>
          </div>
        </div>

        <div className="result-card__watermark">
          <span className="result-card__watermark-label">made with</span>
          <div className="result-card__watermark-brand">
            <img src={symbolW} alt="" />
            <img src={logoW} alt="TripPing" />
          </div>
        </div>
      </div>

      {/* ── 하단 버튼 (완독 후 전환용) ── */}
      <div className="result-actions">
        <button
          className="result-actions__save"
          onClick={handleSaveImage}
          disabled={saving}
        >
          {saving ? '저장 중...' : '이미지 저장'}
        </button>
        <button
          className="result-actions__share"
          onClick={handleShareImage}
          disabled={sharing}
        >
          <Share2 size={18} /> {sharing ? '공유 준비 중...' : '공유하기'}
        </button>
      </div>
    </MobileLayout>
  );
}