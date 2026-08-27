import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Compass, MapPin } from 'lucide-react';
import MobileLayout from '../../components/MobileLayout';
import './ExpandSelection.css';

// MOCK DATA (추가 추천 관광지 목록)
const MOCK_MAIN_PLACE = {
  placeId: 'main-01',
  name: '파주 마장호수',
  top: '30%',
  left: '40%',
};

const MOCK_PLACES = [
  {
    placeId: 'place-01',
    name: '와우동 우동전문점',
    category: '식당',
    summary: '효능이 매력적인 우동 전문점. 설명이 두 줄로 이상 반응하는 경우 상단으로 이동합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=300',
    top: '50%',
    left: '50%',
  },
  {
    placeId: 'place-02',
    name: '레드브릿지 베이커리 카페',
    category: '카페',
    summary: '마장호수 출렁다리가 전체적으로 보이는 아름다운 커리 카페',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300',
    top: '25%',
    left: '65%',
  },
  {
    placeId: 'place-03',
    name: '기산리와',
    category: '관광지',
    summary: '조용하고 조각적인 전시를 즐길 수 있는 문화 공간',
    imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=300',
    top: '70%',
    left: '70%',
  },
  {
    placeId: 'place-04',
    name: 'B코스',
    category: '관광지',
    summary: '가족들과 함께 산책하는 것은 독점적인 코스입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300',
    top: '15%',
    left: '20%',
  },
];

const CATEGORIES = ['전체', '관광지', '식당', '카페'];

export default function ExpandSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = location.state ?? {};

  const cardRefs = useRef(new Map());

  // 1. 선택된 장소 ID 목록 (N/4 개수 카운트 연동)
  const [selectedIds, setSelectedIds] = useState([]);
  // 2. 현재 클릭하여 열람 중인 장소 ID (관광지명 회색 배경 & 핀 하이라이트)
  const [clickedPlaceId, setClickedPlaceId] = useState(null);
  // 3. 카테고리 필터 상태
  const [activeCategory, setActiveCategory] = useState('전체');

  // [핵심 기능 1] 우상단 원형 체크 표시 토글
  const handleToggleCheck = (e, id) => {
    e.stopPropagation();

    setSelectedIds((prevSelected) => {
      const isAlreadySelected = prevSelected.includes(id);

      if (isAlreadySelected) {
        return prevSelected.filter((item) => item !== id);
      } else {
        if (prevSelected.length >= 4) {
          alert('최대 4개까지 선택 가능합니다.');
          return prevSelected;
        }
        return [...prevSelected, id];
      }
    });
  };

  // [핵심 기능 2] 카드 본체 클릭 -> 이동/열람
  const handleCardClick = (id) => {
    setClickedPlaceId(id);

    const cardNode = cardRefs.current.get(id);
    if (cardNode) {
      cardNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const filteredPlaces = MOCK_PLACES.filter((place) => {
    if (activeCategory === '전체') return true;
    return place.category === activeCategory;
  });

  // [핵심 기능 3] 코스 만들기 -> 결과 이동
  const handleCreateCourse = () => {
    navigate('/loading', {
      state: {
        next: {
          path: '/result',
          state: { ...incomingState, selectedPlaceIds: selectedIds },
        },
      },
    });
  };

  return (
    <MobileLayout>
      {/* -------------------- 1. Map Area -------------------- */}
      <div className="map-wrapper">
        <button
          className="back-button web-app-btn"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={24} color="var(--color-text)" />
        </button>

        <div className="map-mock-view">
          <div className="map-grid-pattern" />

          {/* 메인 관광지 핀 */}
          <div
            className="mock-pin main-pin"
            style={{ top: MOCK_MAIN_PLACE.top, left: MOCK_MAIN_PLACE.left }}
          >
            <div className="main-pin-badge">
              <Compass size={18} color="#ffffff" />
            </div>
          </div>

          {/* 추가 관광지 핀 목록 */}
          {MOCK_PLACES.map((place) => {
            const isSelected = selectedIds.includes(place.placeId);
            const isClicked = clickedPlaceId === place.placeId;

            return (
              <button
                key={place.placeId}
                className={`mock-pin ${isSelected ? 'selected' : ''} ${isClicked ? 'active' : ''}`}
                style={{ top: place.top, left: place.left }}
                onClick={() => handleCardClick(place.placeId)}
              >
                <MapPin
                  size={isClicked ? 32 : 26}
                  fill={isSelected ? 'var(--color-accent)' : 'var(--color-primary)'}
                  stroke="none"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------- 2. Bottom Sheet Area -------------------- */}
      <div className="sheet-container">
        <div className="sheet-header">
          <div className="main-place-tag">
            <Compass size={18} color="var(--color-accent)" />
            {MOCK_MAIN_PLACE.name}
          </div>

          <div className="filter-row">
            <div className="category-group web-app-scroll-x">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`chip web-app-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="count-badge">{selectedIds.length}/4 선택</span>
          </div>
        </div>

        {/* Card List (하단 버튼 아래로 스크롤) */}
        <div className="card-list web-app-scroll-y">
          {filteredPlaces.map((place) => {
            const isSelected = selectedIds.includes(place.placeId);
            const isClicked = clickedPlaceId === place.placeId;

            return (
              <div
                key={place.placeId}
                className={`place-card web-app-card ${isSelected ? 'selected' : ''} ${isClicked ? 'active' : ''}`}
                onClick={() => handleCardClick(place.placeId)}
                ref={(node) => cardRefs.current.set(place.placeId, node)}
              >
                <img src={place.imageUrl} alt={place.name} className="card-thumb" />

                <div className="card-info">
                  <div className={`card-title-badge ${isClicked ? 'active' : ''}`}>
                    <h3 className="card-title">{place.name}</h3>
                  </div>
                  <p
                    className="card-summary"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                    }}
                  >
                    {place.summary}
                  </p>
                </div>

                <div
                  className={`check-circle-btn ${isSelected ? 'checked' : ''}`}
                  onClick={(e) => handleToggleCheck(e, place.placeId)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${place.name} 선택`}
                >
                  <Check size={14} color={isSelected ? '#ffffff' : '#D1D5DB'} strokeWidth={3} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button (하단 고정) */}
        <div className="cta-wrapper">
          <button className="cta-button web-app-btn" onClick={handleCreateCourse}>
            코스 만들기 -&gt;
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}