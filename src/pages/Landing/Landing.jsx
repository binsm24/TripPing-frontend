import { useEffect, useState } from 'react';
import MobileLayout from '../../components/MobileLayout';
import logoW from '../../assets/logoW.png';
import './Landing.css';

const TAGLINE_DELAY_MS = 1200;

export default function Landing() {
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTagline(true), TAGLINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

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