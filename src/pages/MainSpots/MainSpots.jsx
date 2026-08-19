import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  MapPin,
  Clock,
  Ticket,
  Car,
  PawPrint,
  Phone,
  ImageOff,
} from 'lucide-react'
import MobileLayout from '../../components/MobileLayout'
import './MainSpots.css'

// TODO: 아래는 임시(더미) 데이터입니다.
// 실제로는 이전 화면(조건 입력 화면)에서 넘어온 사용자 조건을 AI API로 보내면,
// AI가 경기도 내 관광지 중 3곳을 추천해서 이 형태의 데이터로 내려줍니다.
// 백엔드 연동 시 이 배열을 API 응답으로 교체하면 됩니다.
const SPOTS = [
  {
    id: 'majang-lake-1',
    name: '파주 마장호수',
    summary:
      '파주시에 위치한 인공 호수로, 출렁다리와 잘 정비된 둘레길이 있어 가족 단위 방문객에게 적합한 산책 코스입니다.',
    // TODO: 관광지 썸네일 이미지 경로. 지금은 이미지 파일이 없어서 자리표시자를 씁니다.
    thumbnail: null,
    // 지도 위 핀 위치 (임시 좌표, % 기준). 실제로는 카카오맵 API가 좌표를 받아 표시합니다.
    pin: { top: '46%', left: '16%' },
    address: '경기 파주시 광탄면 기산로 313',
    hours: ['11월~2월 09:00~17:00', '3월~4월 09:00~18:00', '5월~10월 09:00~20:00'],
    fee: '무료',
    parking: '마장호수 공영주차장: 제 1~7 주차장\n주차비: 1일 기준 2000원(일반승용)',
    pet: '반려동물 동반 가능',
    phone: '031-950-1901',
  },
  {
    id: 'majang-lake-2',
    name: '파주 마장호수',
    summary:
      '파주시에 위치한 인공 호수로, 출렁다리와 잘 정비된 둘레길이 있어 가족 단위 방문객에게 적합한 산책 코스입니다.',
    thumbnail: null,
    pin: { top: '16%', left: '64%' },
    address: '경기 파주시 광탄면 기산로 313',
    hours: ['11월~2월 09:00~17:00', '3월~4월 09:00~18:00', '5월~10월 09:00~20:00'],
    fee: '무료',
    parking: '마장호수 공영주차장: 제 1~7 주차장\n주차비: 1일 기준 2000원(일반승용)',
    pet: '반려동물 동반 가능',
    phone: '031-950-1901',
  },
  {
    id: 'majang-lake-3',
    name: '파주 마장호수',
    summary:
      '파주시에 위치한 인공 호수로, 출렁다리와 잘 정비된 둘레길이 있어 가족 단위 방문객에게 적합한 산책 코스입니다.',
    thumbnail: null,
    pin: { top: '64%', left: '66%' },
    address: '경기 파주시 광탄면 기산로 313',
    hours: ['11월~2월 09:00~17:00', '3월~4월 09:00~18:00', '5월~10월 09:00~20:00'],
    fee: '무료',
    parking: '마장호수 공영주차장: 제 1~7 주차장\n주차비: 1일 기준 2000원(일반승용)',
    pet: '반려동물 동반 가능',
    phone: '031-950-1901',
  },
]

function MainSpots() {
  const navigate = useNavigate()

  // 상세 화면으로 열려 있는 장소 (null이면 목록 화면). 오직 "관광지명" 클릭으로만 바뀝니다.
  const [openSpotId, setOpenSpotId] = useState(null)
  // 사용자가 선택(체크)한 장소 - 한 곳만 선택 가능 (지도 핀/카드 테두리 주황색)
  const [selectedId, setSelectedId] = useState(null)
  // 카드 몸통 클릭 또는 지도 핀 클릭으로 "지금 보고 있는" 장소
  // (목록 카드의 회색 제목 배경 + 진한 그림자, 지도 핀 확대에 사용. 선택과는 무관)
  const [focusedId, setFocusedId] = useState(null)

  const openSpot = openSpotId ? SPOTS.find((s) => s.id === openSpotId) : null
  const canSubmit = selectedId !== null

  // 지도에서 핀을 클릭했을 때 목록에서 해당 카드로 스크롤해서 보여주기 위한 ref
  const cardRefs = useRef({})

  useEffect(() => {
    // 상세 화면이 아니라 목록 화면이고, 포커스된 카드가 있을 때만 스크롤
    if (!openSpotId && focusedId && cardRefs.current[focusedId]) {
      cardRefs.current[focusedId].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [focusedId, openSpotId])

  const handleToggleSelect = (id, e) => {
    e.stopPropagation()
    setSelectedId((prev) => (prev === id ? null : id))
  }

  // 카드 몸통(제목 제외) 클릭 → 지도에서 위치 확인용 포커스만 줌
  const handleFocusCard = (id) => {
    setFocusedId(id)
  }

  // 관광지명 클릭 → 상세 설명 화면으로 이동
  const handleOpenDetail = (id, e) => {
    e.stopPropagation()
    setOpenSpotId(id)
  }

  // 지도 핀 클릭 → 상세 화면이 열려있으면 목록으로 돌아가면서, 해당 카드에 포커스
  const handlePinClick = (id) => {
    setOpenSpotId(null)
    setFocusedId(id)
  }

  const handleBack = () => {
    if (openSpotId) {
      setOpenSpotId(null)
      return
    }
    // /spots로 바로 접속해서 뒤로 갈 히스토리가 없는 경우 홈으로 이동
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    // TODO: 다음 화면(코스 확장 추천 등)으로 이동하는 로직 연결
    console.log('선택한 관광지:', selectedId)
  }

  return (
    <MobileLayout>
      <div className="main-spots">
        <div className="main-spots__map">
          {/*
            TODO: 이 영역을 카카오맵 SDK 컴포넌트로 교체하세요.
            지금은 지도 없이 배경 + 핀만 흉내낸 자리표시자(placeholder)입니다.
            핀 좌표(pin.top/left)는 실제로는 관광지의 위경도를 지도 컴포넌트가
            화면 좌표로 변환해서 그려줍니다.
          */}
          <div className="main-spots__map-placeholder">
            {SPOTS.map((spot) => {
              const isSelected = selectedId === spot.id
              const isBig = isSelected || focusedId === spot.id || openSpotId === spot.id
              return (
                <button
                  key={spot.id}
                  type="button"
                  className={`main-spots__pin ${isBig ? 'main-spots__pin--big' : ''}`}
                  style={{ top: spot.pin.top, left: spot.pin.left }}
                  onClick={() => handlePinClick(spot.id)}
                  aria-label={`${spot.name} 위치`}
                >
                  <MapPin
                    size={30}
                    color={isSelected ? 'var(--color-accent)' : 'var(--color-primary)'}
                    fill={isSelected ? 'var(--color-accent)' : 'var(--color-primary)'}
                    strokeWidth={1.5}
                  />
                </button>
              )
            })}
          </div>

          <button className="main-spots__back-btn" aria-label="뒤로 가기" onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="main-spots__sheet">
          {openSpot ? (
            <div className="main-spots__detail-wrap">
              <SpotCard
                spot={openSpot}
                selected={selectedId === openSpot.id}
                expanded
                onToggleSelect={(e) => handleToggleSelect(openSpot.id, e)}
              />
            </div>
          ) : (
            <div className="main-spots__list">
              {SPOTS.map((spot) => (
                <SpotCard
                  key={spot.id}
                  ref={(el) => (cardRefs.current[spot.id] = el)}
                  spot={spot}
                  selected={selectedId === spot.id}
                  focused={focusedId === spot.id}
                  onFocusCard={() => handleFocusCard(spot.id)}
                  onOpenDetail={(e) => handleOpenDetail(spot.id, e)}
                  onToggleSelect={(e) => handleToggleSelect(spot.id, e)}
                />
              ))}
            </div>
          )}

          <div className="main-spots__footer">
            <button
              className="main-spots__submit-btn"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              선택 완료 →
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}

function SpotCard({
  spot,
  selected,
  focused = false,
  expanded = false,
  onFocusCard,
  onOpenDetail,
  onToggleSelect,
  ref,
}) {
  return (
    <div
      ref={ref}
      className={[
        'spot-card',
        selected ? 'spot-card--selected' : '',
        focused ? 'spot-card--focused' : '',
        expanded ? 'spot-card--expanded' : '',
      ].join(' ').trim()}
      onClick={!expanded ? onFocusCard : undefined}
      role={!expanded ? 'button' : undefined}
      tabIndex={!expanded ? 0 : undefined}
    >
      <div className="spot-card__top">
        <div className="spot-card__thumb">
          {spot.thumbnail ? (
            <img src={spot.thumbnail} alt={spot.name} />
          ) : (
            <ImageOff size={20} className="spot-card__thumb-placeholder-icon" />
          )}
        </div>
        <div className="spot-card__info">
          <h3
            className={`spot-card__title ${!expanded ? 'spot-card__title--link' : ''}`}
            onClick={!expanded ? onOpenDetail : undefined}
          >
            {spot.name}
          </h3>
          <p className={`spot-card__summary ${expanded ? '' : 'spot-card__summary--clamp'}`}>
            {spot.summary}
          </p>
        </div>
        <button
          type="button"
          className={`spot-card__check ${selected ? 'spot-card__check--active' : ''}`}
          aria-label="이 장소 선택"
          onClick={onToggleSelect}
        >
          <Check size={14} />
        </button>
      </div>

      {expanded && (
        <div className="spot-card__details">
          <DetailRow icon={MapPin} text={spot.address} />
          <DetailRow icon={Clock} text={spot.hours.join('\n')} />
          <DetailRow icon={Ticket} text={spot.fee} />
          <DetailRow icon={Car} text={spot.parking} />
          <DetailRow icon={PawPrint} text={spot.pet} />
          <DetailRow icon={Phone} text={spot.phone} />
        </div>
      )}
    </div>
  )
}

function DetailRow({ icon: Icon, text }) {
  return (
    <div className="detail-row">
      <Icon size={17} className="detail-row__icon" />
      <span className="detail-row__text">{text}</span>
    </div>
  )
}

export default MainSpots
