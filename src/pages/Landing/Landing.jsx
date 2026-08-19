import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import logoW from '../../assets/logoW.png';
import './Landing.css';

const TAGLINE_DELAY_MS = 1200;
// 태그라인이 보인 뒤 로그인 화면으로 자동 전환되기까지의 추가 대기 시간
const NAVIGATE_DELAY_MS = 1500;

export default function Landing() {
  const navigate = useNavigate();
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTagline(true), TAGLINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, TAGLINE_DELAY_MS + NAVIGATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <MobileLayout background="var(--color-primary)">
      <div className="landing">
        <img src={logoW} alt="TripPing" className="landing__logo" />
        <p className={`landing__tagline ${showTagline ? 'is-visible' : ''}`}>
          당신의 삶을 특별하게 만드는 여행
        </p>
      </div>
    </MobileLayout>
  );
}