import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import './ConditionInput.css';

const CATEGORY_LABELS = {
  nature: '자연',
  city: '도시',
  complex: '복합',
};

const COMPANION_TYPES = [
  {
    key: 'alone',
    label: '혼자',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    key: 'friend',
    label: '친구',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="9" cy="8" r="3.2" />
        <circle cx="17" cy="9" r="2.6" />
        <path d="M3 20c0-3.6 2.8-6.4 6-6.4s6 2.8 6 6.4" />
        <path d="M14.5 14c2.6.3 4.5 2.6 4.5 5.6" />
      </svg>
    ),
  },
  {
    key: 'pet',
    label: '반려동물',
    icon: (
      <svg viewBox="0 0 24 24" className="icon-filled">
        <ellipse cx="12" cy="17" rx="5.5" ry="4" />
        <circle cx="5" cy="9" r="2.2" />
        <circle cx="9.5" cy="5.5" r="2.2" />
        <circle cx="14.5" cy="5.5" r="2.2" />
        <circle cx="19" cy="9" r="2.2" />
      </svg>
    ),
  },
  {
    key: 'parents',
    label: '부모님',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M3 12 12 4l9 8" />
        <path d="M5 10.5V20h5v-6h4v6h5v-9.5" />
      </svg>
    ),
  },
  {
    key: 'kid',
    label: '아이',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2c2.8 1.8 4 5.4 3.2 9.6l-.8 3.4" />
        <path d="M12 2c-2.8 1.8-4 5.4-3.2 9.6l.8 3.4" />
        <path d="M9 15l-2.5 2.5M15 15l2.5 2.5" />
        <circle cx="12" cy="8" r="1.6" />
        <path d="M10 19h4l-1 3h-2z" />
      </svg>
    ),
  },
  {
    key: 'partner',
    label: '연인',
    icon: (
      <svg viewBox="0 0 24 24" className="icon-filled">
        <path d="M12 20.5 4.5 13c-2-2-2-5.2 0-7.1 2-1.9 5-1.6 6.7.4l.8.9.8-.9c1.7-2 4.7-2.3 6.7-.4 2 1.9 2 5.1 0 7.1z" />
      </svg>
    ),
  },
];

const REGIONS = [
  '없음',
  '고양시',
  '과천시',
  '광명시',
  '광주시',
  '구리시',
  '군포시',
  '김포시',
  '남양주시',
  '동두천시',
  '부천시',
  '성남시',
  '수원시',
  '시흥시',
  '안산시',
  '안성시',
  '안양시',
  '양주시',
  '여주시',
  '오산시',
  '용인시',
  '의왕시',
  '의정부시',
  '이천시',
  '파주시',
  '평택시',
  '포천시',
  '하남시',
  '화성시',
];

const MAX_REQUEST_LENGTH = 500;

export default function ConditionInput() {
  const navigate = useNavigate();
  const location = useLocation();

  const category = location.state?.category ?? 'nature';
  const categoryLabel = CATEGORY_LABELS[category] ?? '자연';

  const [age, setAge] = useState('');
  const [companion, setCompanion] = useState(null);
  const [region, setRegion] = useState('없음');
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [extraRequest, setExtraRequest] = useState('');

  const isFormComplete = useMemo(
    () => age.trim() !== '' && companion !== null,
    [age, companion]
  );

  const handleBack = () => {
    navigate(-1);
  };

  const handleAgeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAge(value);
  };

  const handleSelectRegion = (city) => {
    setRegion(city);
    setIsRegionOpen(false);
  };

  const handleSubmit = () => {
    if (!isFormComplete) return;
    // TODO: 결과 화면 라우트 연결
    navigate('/result', {
      state: { category, age, companion, region, extraRequest },
    });
  };

  return (
    <MobileLayout>
      <div className="condition">
        <div className="condition__topbar">
          <button type="button" className="condition__back-btn" onClick={handleBack} aria-label="뒤로 가기">
            <svg viewBox="0 0 24 24">
              <path d="M15 5 8 12l7 7" />
            </svg>
          </button>
          <span className="condition__category-badge">
            {categoryLabel} <span>선택</span>
          </span>
        </div>

        <section className="condition__card condition__age-card">
          <label className="condition__label" htmlFor="age-input">
            <svg viewBox="0 0 24 24" className="condition__label-icon">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
            유진 님의 나이
          </label>
          <div className="condition__age-field">
            <input
              id="age-input"
              type="text"
              inputMode="numeric"
              value={age}
              onChange={handleAgeChange}
              className="condition__age-input"
            />
            <span className="condition__age-suffix">세</span>
          </div>
        </section>

        <section className="condition__card">
          <p className="condition__label">
            <svg viewBox="0 0 24 24" className="condition__label-icon">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
            </svg>
            동행자 유형
          </p>
          <div className="condition__companion-grid">
            {COMPANION_TYPES.map((type) => (
              <button
                key={type.key}
                type="button"
                className={`condition__companion-btn ${companion === type.key ? 'is-selected' : ''}`}
                onClick={() => setCompanion(type.key)}
              >
                <span className="condition__companion-icon">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </section>

        <section className="condition__card">
          <label className="condition__label" htmlFor="region-search">
            <svg viewBox="0 0 24 24" className="condition__label-icon">
              <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
            선호 지역
          </label>
          <div className="condition__region-field">
            <svg viewBox="0 0 24 24" className="condition__region-search-icon">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M20 20l-4.5-4.5" />
            </svg>
            <span id="region-search" className="condition__region-value">{region}</span>
            <button
              type="button"
              className={`condition__region-toggle ${isRegionOpen ? 'is-open' : ''}`}
              onClick={() => setIsRegionOpen((prev) => !prev)}
              aria-label="지역 목록 열기"
            >
              <svg viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          {isRegionOpen && (
            <ul className="condition__region-list">
              {REGIONS.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    className={`condition__region-item ${region === city ? 'is-selected' : ''}`}
                    onClick={() => handleSelectRegion(city)}
                  >
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="condition__card">
          <p className="condition__label">
            <span className="condition__plus-icon">+</span>
            추가 요구 사항
          </p>
          <textarea
            className="condition__textarea"
            maxLength={MAX_REQUEST_LENGTH}
            placeholder={'예시:\n· 맛집 위주로\n· 걷기 싫어요\n· 실내 활동 선호\n· ...'}
            value={extraRequest}
            onChange={(e) => setExtraRequest(e.target.value)}
          />
          <span className="condition__textarea-count">
            {extraRequest.length}/{MAX_REQUEST_LENGTH}
          </span>
        </section>

        <button
          type="button"
          className={`condition__submit-btn ${isFormComplete ? 'is-active' : ''}`}
          disabled={!isFormComplete}
          onClick={handleSubmit}
        >
          여행지 추천 받기 →
        </button>
      </div>
    </MobileLayout>
  );
}