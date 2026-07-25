import { useEffect, useRef, useState, useMemo } from 'react';
import MobileLayout from '../../components/MobileLayout';
import './loading.css';
import symbolW from '../../assets/symbolW.png';

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

export default function LoadingScreen({ userName }) {
  const phrases = useMemo(() => buildPhrases(userName), [userName]);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const lastIndexRef = useRef(0);

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

  const currentPhrase = phrases[phraseIndex];
  const lines = currentPhrase.rest.split('\n');

  return (
    <MobileLayout background="var(--color-primary)"> {}
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