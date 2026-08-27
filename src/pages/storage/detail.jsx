// src/pages/storage/StorageDetail.jsx
// 보관함 목록에서 카드를 눌러 들어오는 상세 화면.
// result.jsx(코스 생성 직후 화면)와 시각적으로는 비슷하지만, 폴더/파일 자체를 분리했음:
// - 데이터: location.state가 아니라 항상 savedCourseId로 GET /api/saved-courses/{savedCourseId} 조회
// - 헤더: 뒤로가기 버튼만 (인사말/홈버튼 없음)
// - 클래스명: archive-detail__* (result-card__*와 겹치지 않게 완전히 분리)
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, MessageCircle, FlagTriangleRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
 
import MobileLayout from '../../components/MobileLayout';
import { getAuthToken } from '../../components/auth';
import symbolW from '../../assets/symbolW.png'; // 워터마크용 (헤더에는 안 씀)
import logoW from '../../assets/logoW.png';
import { mockCourseResult } from '../result/mockData';
 
import './detail.css';
 
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
 
// ---------- 보관함 상세 조회: GET /api/saved-courses/{savedCourseId} ----------
// 응답 형태는 결과 화면의 courseData와 동일하다고 가정
// (courseId, courseTitle, description, mapImageUrl, places, tags, estimatedDuration 등).
// 실제 필드명이 다르면 이 함수 안에서만 매핑해주면 됨 - 아래 렌더링 코드는 안 건드려도 됨.
async function fetchSavedCourseDetail(savedCourseId) {
  const res = await fetch(`${BASE_URL}/api/saved-courses/${savedCourseId}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
 
  const json = await res.json();
 
  if (!res.ok || !json.success) {
    const error = new Error(json.message || '코스 상세 조회에 실패했습니다.');
    error.status = json.status ?? res.status;
    throw error;
  }
 
  return json.data;
}
 
export default function StorageDetail() {
  const { savedCourseId } = useParams();
  const navigate = useNavigate();
 
  const [courseData, setCourseData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
 
  const cardRef = useRef(null);
  const listRef = useRef(null);
  const [lineRect, setLineRect] = useState({ top: 0, height: 0 });
 
  // savedCourseId로 상세 데이터 조회
  useEffect(() => {
    let ignore = false;
 
    fetchSavedCourseDetail(savedCourseId)
      .then((data) => {
        if (!ignore) setCourseData(data);
      })
      .catch((err) => {
        // TODO: GET /api/saved-courses/{savedCourseId} 백엔드 연동되면 이 fallback은 제거하고
        // 위 setLoadError(err)만 남기면 됨. 지금은 API가 없어서 항상 실패하므로,
        // 화면 확인이 가능하도록 목업 데이터로 대체함.
        console.warn('[보관함 상세] 조회 실패, 목업 데이터로 대체합니다:', err.message);
        if (!ignore) setCourseData({ ...mockCourseResult, courseId: savedCourseId });
      });
 
    return () => {
      ignore = true;
    };
  }, [savedCourseId]);
 
  // 첫 핀 중심 ~ 마지막 핀 중심까지의 점선 위치를 실제 DOM 기준으로 측정
  const measureLine = useCallback(() => {
    const listEl = listRef.current;
    if (!listEl) return { top: 0, height: 0 };
 
    const pins = listEl.querySelectorAll('.archive-detail__place-pin');
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
 
  // 조회 실패
  if (loadError) {
    return (
      <MobileLayout background="#F5F7F8">
        <header className="archive-detail-header">
          <button
            className="archive-detail-header__back"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            <ChevronLeft size={20} />
          </button>
        </header>
        <p style={{ padding: '24px', textAlign: 'center' }}>
          코스를 불러오지 못했어요.
        </p>
      </MobileLayout>
    );
  }
 
  // 조회 전 (로딩 중)
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
 
  const handleSaveImage = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const canvas = await captureCard();
      const dataUrl = canvas.toDataURL('image/png');
 
      if (Capacitor.isNativePlatform()) {
        const fileName = `tripping_${courseData.courseId}_${Date.now()}.png`;
        const base64Data = dataUrl.split(',')[1];
 
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });
 
        await Share.share({
          title: courseData.courseTitle,
          url: writeResult.uri,
          dialogTitle: '코스 카드 저장/공유',
        });
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
 
  // ---------- 카카오톡 공유 ----------
  const handleShareKakao = () => {
    if (!window.Kakao) {
      alert('카카오 SDK 로드에 실패했어요.');
      return;
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }
 
    const shareUrl = `${window.location.origin}/course/${courseData.courseId}`;
 
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: courseData.courseTitle,
        description: courseData.description,
        imageUrl: courseData.mapImageUrl,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      buttons: [
        {
          title: '코스 보러가기',
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
      ],
    });
  };
 
  return (
    <MobileLayout background="#F5F7F8">
      <header className="archive-detail-header">
        <button
          className="archive-detail-header__back"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <ChevronLeft size={20} />
        </button>
      </header>
 
      <div className="archive-detail-card" ref={cardRef}>
        <div className="archive-detail-card__top">
          <h1 className="archive-detail-card__title">{courseData.courseTitle}</h1>
          <p className="archive-detail-card__desc">{courseData.description}</p>
 
          {tags.length > 0 && (
            <div className="archive-detail-card__tags">
              {tags.map((tag) => (
                <span key={tag} className="archive-detail-card__tag">
                  <span className="archive-detail-card__tag-text">{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>
 
        <div className="archive-detail-card__inner">
          {/* html2canvas가 <img object-fit:cover>를 원본 크기 그대로 캡처하는 문제 방지 위해
              background-image + background-size:cover 사용 (result.jsx와 동일 이유) */}
          <div
            className="archive-detail-card__map"
            role="img"
            aria-label="코스 지도"
            style={courseData.mapImageUrl ? { backgroundImage: `url("${courseData.mapImageUrl}")` } : undefined}
          />
 
          <ul className="archive-detail-card__list" ref={listRef}>
            {placeCount > 1 && (
              <span
                className="archive-detail-card__list-line"
                style={{ top: `${lineRect.top}px`, height: `${lineRect.height}px` }}
                aria-hidden="true"
              />
            )}
            {courseData.places.map((place) => {
              const isMain = place.order === 1;
              return (
                <li key={place.placeId} className="archive-detail-card__place">
                  <span className="archive-detail__place-pin">
                    <MapPin
                      size={20}
                      preserveAspectRatio="none"
                      color="var(--color-accent, #ff9f5a)"
                      fill={isMain ? 'none' : 'var(--color-accent, #ff9f5a)'}
                    />
                  </span>
                  <div
                    className="archive-detail-card__place-thumb"
                    role="img"
                    aria-label={place.name}
                    style={place.imageUrl ? { backgroundImage: `url("${place.imageUrl}")` } : undefined}
                  />
                  <div>
                    <span className="archive-detail-card__place-name">{place.name}</span>
                    {place.description && (
                      <p className="archive-detail-card__place-desc">{place.description}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
 
          <div className="archive-detail-card__meta">
            <span>
              <FlagTriangleRight size={17} /> 총 {placeCount}곳 방문
            </span>
            <span>
              <Clock size={17} /> 예상 소요시간: {courseData.estimatedDuration ?? '약 -시간'}
            </span>
          </div>
        </div>
 
        <div className="archive-detail-card__watermark">
          <span className="archive-detail-card__watermark-label">made with</span>
          <div className="archive-detail-card__watermark-brand">
            <img src={symbolW} alt="" />
            <img src={logoW} alt="TripPing" />
          </div>
        </div>
      </div>
 
      <div className="archive-detail-actions">
        <button
          className="archive-detail-actions__save"
          onClick={handleSaveImage}
          disabled={saving}
        >
          {saving ? '저장 중...' : '이미지 저장'}
        </button>
        <button className="archive-detail-actions__kakao" onClick={handleShareKakao}>
          <MessageCircle size={18} fill="currentColor" /> 카카오톡 공유
        </button>
      </div>
    </MobileLayout>
  );
}