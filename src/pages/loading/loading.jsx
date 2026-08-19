import { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import './loading.css';
import symbolW from '../../assets/symbolW.png';
import { mockCourseResult } from '../result/mockData';

// 지금은 백엔드가 없어서 임의로 정해둔 값. 실제로는 "AI 응답(추천/코스 생성 등)이
// 도착하는 시점"에 로딩이 끝나야 하므로, 이 값과 setTimeout은 최종적으로 삭제되고
// 아래 useEffect가 실제 API 호출을 await 하는 형태로 바뀔 예정.
const PLACEHOLDER_DELAY_MS = 1800;

function formatDisplayName(name) {
  if (!name) return '여행자';
  return name.length > 4 ? `${name.slice(0, 4)}...` : name;
}

function buildPhrases(userName) {
  return [
    { highlight: formatDisplayName(userName), rest: ' 님의 선호를\n분석하고 있어요!' },
    { rest: '여행을 예쁘게\n그려내고 있어요!' },
    { rest: '완벽한 여행을 위해\n신중하게 고르고 있어요...' },
    { rest: '여행은 언제나\n우리 마음을 설레게 해요!' },
    { rest: '소중한 추억을 쌓으러\n함께 떠나볼까요?' },
    { rest: '여행을 준비하는 지금이\n가장 설레는 순간이에요!' },
  ];
}

/**
 * 화면과 화면 사이에서 공통으로 쓰이는 로딩 화면.
 *
 * 이전 화면에서 다음과 같은 형태로 navigate 해서 진입합니다:
 *   navigate('/loading', {
 *     state: {
 *       userName: '유진',              // (선택) 인사 문구용
 *       next: {
 *         path: '/spots',              // 로딩이 끝난 뒤 이동할 경로
 *         state: { ...다음 화면에 필요한 데이터 },
 *       },
 *     },
 *   });
 *
 * next 정보 없이 이 경로로 직접 들어온 경우(새로고침 등)에는 랜딩으로 되돌려보냅니다.
 */
export default function LoadingScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  const { userName, next } = location.state ?? {};

  const phrases = useMemo(() => buildPhrases(userName), [userName]);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const lastIndexRef = useRef(0);

  // 문구 랜덤 로테이션
  useEffect(() => {
    const pickRandomIndex = (exclude) => {
      let idx;
      do {
        idx = 1 + Math.floor(Math.random() * (phrases.length - 1));
      } while (phrases.length > 2 && idx === exclude);
      return idx;
    };

    const FIRST_DELAY = 7000;
    const INTERVAL_DELAY = 5000;

    let intervalId;

    const timeoutId = setTimeout(() => {
      const nextIndex = pickRandomIndex(lastIndexRef.current);
      lastIndexRef.current = nextIndex;
      setPhraseIndex(nextIndex);
      setFadeKey((prev) => prev + 1);

      intervalId = setInterval(() => {
        const idx = pickRandomIndex(lastIndexRef.current);
        lastIndexRef.current = idx;
        setPhraseIndex(idx);
        setFadeKey((prev) => prev + 1);
      }, INTERVAL_DELAY);
    }, FIRST_DELAY);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [phrases.length]);

  // 다음 화면으로의 실제 이동 처리
  useEffect(() => {
    if (!next?.path) {
      // next 정보 없이 로딩 화면에 바로 들어온 경우 - 처음으로 되돌림
      navigate('/', { replace: true });
      return;
    }

    // TODO: 실제 AI/백엔드 연동 시 아래 setTimeout을 지우고
    //   const data = await someApiCall(next.state);   // AI 응답이 오면 그 시점에 resolve
    //   navigate(next.path, { state: { ...next.state, ...data }, replace: true });
    // 형태의 비동기 호출로 교체하면 됨. (= AI 응답 준비 완료 == 로딩 종료)
    const timer = setTimeout(() => {
      // /result로 가는데 아직 실제 코스 생성 결과(result)가 없다면(백엔드 미연동 상태)
      // 화면이 비어보이지 않도록 목업 결과로 대체해서 넘겨줌.
      const resolvedState =
        next.path === '/result' && !next.state?.result
          ? { ...next.state, result: { ...mockCourseResult, userName } }
          : next.state;

      navigate(next.path, { state: resolvedState, replace: true });
    }, PLACEHOLDER_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, navigate]);

  const currentPhrase = phrases[phraseIndex];
  const lines = currentPhrase.rest.split('\n');

  return (
    <MobileLayout background="var(--color-primary)">
      <div className="loading-screen">
        <div className="loading-content">
          <img
            src={symbolW}
            alt=""
            className="loading-symbol"
            aria-hidden="true"
          />

          <p key={fadeKey} className="loading-caption">
            {currentPhrase.highlight && (
              <strong className="loading-caption-highlight">
                {currentPhrase.highlight}
              </strong>
            )}
            {lines.map((line, i) => (
              <span key={i}>
                {line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
