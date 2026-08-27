import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
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

const SPOTS = [
  {
    id: 'majang-lake-1',
    name: '파주 마장호수',
    summary:
      '파주시에 위치한 인공 호수로, 출렁다리와 잘 정비된 둘레길이 있어 가족 단위 방문객에게 적합한 산책 코스입니다.',
    thumbnail: null,
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
    name: '파주 마장호수 2호점',
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
    name: '파주 마장호수 3호점',
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
  const location = useLocation()
  const conditionState = location.state ?? {}

  const [openSpotId, setOpenSpotId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [focusedId, setFocusedId] = useState(null)

  const openSpot = openSpotId ? SPOTS.find((s) => s.id === openSpotId) : null
  const canSubmit = selectedId !== null

  const cardRefs = useRef({})

  useEffect(() => {
    if (!openSpotId && focusedId && cardRefs.current[focusedId]) {
      cardRefs.current[focusedId].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [focusedId, openSpotId])

  const handleToggleSelect = (id, e) => {
    e.stopPropagation()
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const handleFocusCard = (id) => {
    setFocusedId(id)
  }

  const handleOpenDetail = (id, e) => {
    e.stopPropagation()
    setOpenSpotId(id)
  }

  const handlePinClick = (id) => {
    setOpenSpotId(null)
    setFocusedId(id)
  }

  const handleBack = () => {
    if (openSpotId) {
      setOpenSpotId(null)
      return
    }
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate('/select')
    }
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    const selectedSpot = SPOTS.find((s) => s.id === selectedId)
    navigate('/loading', {
      state: {
        next: {
          path: '/expansion',
          state: { ...conditionState, mainSpot: selectedSpot },
        },
      },
    })
  }

  return (
    <MobileLayout>
      <div className="main-spots">
        <div className="main-spots__map">
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
            <ChevronLeft size={24} color="var(--color-text)" />
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

          {/* Floating CTA 영역 */}
          <div className="main-spots__cta-wrapper">
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