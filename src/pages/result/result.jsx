// src/pages/result/result.jsx
// 이 화면은 순수 표시 전용. API 호출(코스 생성/지역 변환/보관함 저장)은
// prepareCourseResult()에서 미리 끝내고, 완성된 데이터를 location.state로 받아서 그리기만 함.
// (화면 사이 로딩은 별도 로딩 화면에서 prepareCourseResult 호출 후 이 화면으로 navigate)
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, MessageCircle, FlagTriangleRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import MobileLayout from '../../components/MobileLayout'; // 실제 경로에 맞게 조정
import symbolW from '../../assets/symbolW.png'; // 홈 버튼 (primary 사각 버튼 위 흰색 심볼)
import logoW from '../../assets/logoW.png'; // "made with TripPing" 워터마크용

import './result.css';

// 카카오 SDK JS 키 - 환경변수로 관리 권장
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

// TODO: 로딩 화면에 이미 있는 닉네임 헬퍼(4자 truncate, 카카오 로그인명, 기본값 '여행자')로 교체할 것
function getGreetingName(rawName) {
  if (!rawName) return '여행자';
  return rawName.length > 4 ? rawName.slice(0, 4) : rawName;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // 로딩 화면에서 prepareCourseResult() 결과를 그대로 넘겨받음
  // { courseId, courseTitle, description, mapImageUrl, places: [{order, placeId, name, imageUrl, description}], tags: [...], estimatedDuration }
  const courseData = location.state?.result;

  const [saving, setSaving] = useState(false);

  const cardRef = useRef(null);
  const listRef = useRef(null);

  // 첫 핀 ~ 마지막 핀을 잇는 점선 위치 (장소 개수/항목 높이가 달라져도 항상 재계산됨)
  const [lineRect, setLineRect] = useState({ top: 0, height: 0 });

  // 필요한 데이터 없이 이 화면으로 바로 들어온 경우 처리 (직접 URL 접근 등)
  useEffect(() => {
    if (!courseData) {
      navigate('/', { replace: true });
    }
  }, [courseData, navigate]);

  // 첫 핀 중심 ~ 마지막 핀 중심까지의 점선 위치를 실제 DOM 기준으로 측정.
  // ResizeObserver를 쓰기 때문에 이미지 로딩으로 항목 높이가 바뀌거나,
  // 캡처 시 max-height가 풀려서 리스트가 펼쳐질 때도 자동으로 다시 계산됨.
  useLayoutEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const updateLine = () => {
      const pins = listEl.querySelectorAll('.result-card__place-pin');
      if (pins.length < 2) {
        setLineRect({ top: 0, height: 0 });
        return;
      }
      const listTop = listEl.getBoundingClientRect().top;
      const firstPinRect = pins[0].getBoundingClientRect();
      const lastPinRect = pins[pins.length - 1].getBoundingClientRect();
      const top = firstPinRect.top + firstPinRect.height / 2 - listTop;
      const bottom = lastPinRect.top + lastPinRect.height / 2 - listTop;
      setLineRect({ top, height: Math.max(bottom - top, 0) });
    };

    updateLine();

    const resizeObserver = new ResizeObserver(updateLine);
    resizeObserver.observe(listEl);

    return () => resizeObserver.disconnect();
  }, [courseData?.places]);

  if (!courseData) return null; // 리다이렉트 되는 동안 아무것도 그리지 않음

  const tags = courseData.tags ?? [];
  const placeCount = courseData.places?.length ?? 0;

  // ---------- 이미지 캡처 (스크롤로 잘린 리스트를 캡처 시엔 전체 펼침) ----------
  const captureCard = async () => {
    const listEl = listRef.current;
    const prevMaxHeight = listEl.style.maxHeight;
    const prevOverflow = listEl.style.overflowY;

    listEl.style.maxHeight = 'none';
    listEl.style.overflowY = 'visible';

    // 스타일 변경이 실제 반영될 때까지 한 프레임 대기
    // (ResizeObserver가 이 시점에 점선 위치도 같이 재계산해줌)
    await new Promise((resolve) => requestAnimationFrame(resolve));

    let canvas;
    try {
      canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: Math.min(window.devicePixelRatio || 2, 3),
      });
    } catch (e) {
      // 외부 이미지 CORS 문제로 실패하면 화질 저하를 감수하고 재시도
      canvas = await html2canvas(cardRef.current, {
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2,
      });
    } finally {
      listEl.style.maxHeight = prevMaxHeight;
      listEl.style.overflowY = prevOverflow;
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
        // 네이티브(안드로이드): 파일로 쓴 뒤 공유 시트를 통해 "저장" (갤러리 자동저장 원하면
        // @capacitor-community/media 같은 플러그인 설치 후 교체 필요)
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
        // 웹(개발 중 브라우저 테스트): 바로 다운로드
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

    // 공유 클릭 시 이동할 웹 페이지 - 실제 공유용 상세 페이지 라우트가 없다면
    // 언니와 상의해서 결정 필요 (임시로 origin 기반 경로 사용)
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
      <header className="result-header">
        <button
          className="result-header__back result-header__box"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <ChevronLeft size={20} />
        </button>
        {/* TODO: 실제 로그인 유저명 연결 - 지금은 항상 '여행자'로 표시됨 */}
        <p className="result-header__greeting">
          {getGreetingName(courseData.userName)}님, 이제 떠나볼까요?
        </p>
        <button
          className="result-header__home result-header__box"
          onClick={() => navigate('/')}
          aria-label="홈으로"
        >
          <img src={symbolW} alt="" />
        </button>
      </header>

      <div className="result-card" ref={cardRef}>
        <div className="result-card__top">
          <h1 className="result-card__title">{courseData.courseTitle}</h1>
          <p className="result-card__desc">{courseData.description}</p>

          {tags.length > 0 && (
            <div className="result-card__tags">
              {tags.map((tag) => (
                <span key={tag} className="result-card__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="result-card__inner">
          <div className="result-card__map">
            <img src={courseData.mapImageUrl} alt="코스 지도" crossOrigin="anonymous" />
          </div>

          <ul className="result-card__list" ref={listRef}>
            {placeCount > 1 && (
              <span
                className="result-card__list-line"
                style={{ top: `${lineRect.top}px`, height: `${lineRect.height}px` }}
                aria-hidden="true"
              />
            )}
            {courseData.places.map((place) => {
              const isMain = place.order === 1; // 메인 관광지 = 순서 1번
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
                  <img src={place.imageUrl} alt={place.name} crossOrigin="anonymous" />
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
            {/* 필드명은 임시("estimatedDuration") - 백엔드에서 확정되면 여기만 교체 */}
            <span>
              <Clock size={17} /> 예상 소요시간: {courseData.estimatedDuration ?? '약 -시간'}
            </span>
          </div>
        </div>

        <div className="result-card__watermark">
          <span className="result-card__watermark-label">made with</span>
          <div className="result-card__watermark-brand">
            <img src={symbolW} size={25} alt="" />
            <img src={logoW} size={25} alt="TripPing" />
          </div>
        </div>
      </div>

      <div className="result-actions">
        <button
          className="result-actions__save"
          onClick={handleSaveImage}
          disabled={saving}
        >
          {saving ? '저장 중...' : '이미지 저장'}
        </button>
        <button className="result-actions__kakao" onClick={handleShareKakao}>
          <MessageCircle size={18} fill="currentColor" /> 카카오톡 공유
        </button>
      </div>
    </MobileLayout>
  );
}