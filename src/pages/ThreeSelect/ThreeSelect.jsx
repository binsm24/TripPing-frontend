import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookMarked, ChevronLeft, LogOut } from 'lucide-react';
import MobileLayout from '../../components/MobileLayout';
import ConfirmModal from '../../components/ConfirmModal';
import {
  getUserName,
  formatDisplayName,
  isLoggedIn,
  logout,
  startKakaoLogin,
  handleKakaoRedirect,
} from '../../components/auth';
import symbol from '../../assets/symbol.png';
import natureImg from '../../assets/nature.jpg';
import cityImg from '../../assets/city.jpg';
import complexImg from '../../assets/complex.jpg';
import './ThreeSelect.css';

const CATEGORIES = [
  { key: 'nature', title: '자연', subtitle: '산, 숲, 계곡, 힐링', image: natureImg },
  { key: 'city', title: '도시', subtitle: '쇼핑, 카페, 맛집, 문화', image: cityImg },
  { key: 'complex', title: '복합', subtitle: '자연+도시, 둘 다 즐기기', image: complexImg },
];

export default function ThreeSelect() {
  const navigate = useNavigate();
  // isLoggedIn/getUserName은 localStorage를 읽는 함수라 그 자체로는 리렌더를 안 일으킴.
  // 카카오 로그인 리다이렉트 처리가 끝난 뒤 화면을 갱신시키기 위한 트리거용 상태.
  const [, setAuthTick] = useState(0);
  const loggedIn = isLoggedIn();
  // 카카오 로그인 닉네임이 있으면 그 이름, 비회원이면 '여행자'
  const displayName = formatDisplayName(getUserName());
  // 비회원이 보관함 버튼을 눌렀을 때, 화면 이동 없이 그 자리에서 띄우는 로그인 안내 팝업
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // /select는 카카오 로그인 Redirect URI. 카카오에서 ?code=...를 달고 돌아온 경우에만
  // 백엔드로 로그인 처리를 위임하고, 평소 방문(코드 없음)일 땐 아무 일도 안 일어남.
  useEffect(() => {
    handleKakaoRedirect()
      .then((handled) => {
        if (handled) setAuthTick((v) => v + 1); // 로그인 성공 -> loggedIn/displayName 다시 계산되도록 리렌더
      })
      .catch((err) => {
        // TODO: 토스트/모달 등 디자인이 정해지면 alert 대신 그걸로 교체
        console.error('카카오 로그인 실패:', err);
        alert(err.message || '카카오 로그인에 실패했습니다.');
      });
  }, []);

  const handleArchive = () => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    navigate('/storage');
  };

  const handleLogin = () => {
    // '이전 화면'이라는 게 실제 방문 히스토리에 의존하면(예: 보관함을 거쳐 왔을 때) 예측이
    // 어려워서, 항상 명시적으로 로그인 화면으로 보냄
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    // getAuthToken() 기반으로 loggedIn을 매 렌더마다 다시 계산하는 구조라, 로그아웃 후
    // 화면이 확실히 갱신되도록 로그인 화면으로 이동시킴
    navigate('/login');
  };

  const handleSelectCategory = (categoryKey) => {
    // TODO: 여행 조건 입력 화면 라우트 연결
    navigate('/condition', { state: { category: categoryKey } });
  };

  return (
    <MobileLayout>
      <div className="three-select">
        <div className="three-select__topbar">
          {/* 좌측 상단은 로그인 상태에 따라 역할이 바뀌는 하나의 슬롯:
              비회원 -> 로그인 화면 진입점 / 회원 -> 로그아웃.
              MainSpots, ExpandSelection과 동일한 위치·스타일을 유지 */}
          {!loggedIn ? (
            <button
              type="button"
              className="three-select__back-btn"
              onClick={handleLogin}
              aria-label="로그인 화면으로"
            >
              <ChevronLeft size={22} color="var(--color-text)" />
            </button>
          ) : (
            <button
              type="button"
              className="three-select__back-btn"
              onClick={handleLogout}
              aria-label="로그아웃"
            >
              <LogOut size={18} color="var(--color-text)" />
            </button>
          )}
          <button
            type="button"
            className="three-select__archive-btn"
            onClick={handleArchive}
            aria-label="보관함"
          >
            <BookMarked size={20} />
          </button>
        </div>

        <div className="three-select__hero">
          <img src={symbol} alt="" className="three-select__symbol" />
          <p className="three-select__greeting">
            안녕하세요, {displayName} 님.
            <br />
            어디로 떠나고 싶으신가요?
          </p>
        </div>

        <div className="three-select__cards">
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              type="button"
              className="select-card"
              onClick={() => handleSelectCategory(category.key)}
            >
              <img src={category.image} alt={category.title} />
              <div className="select-card__overlay" />
              <div className="select-card__text">
                <p className="select-card__title">{category.title}</p>
                <p className="select-card__subtitle">{category.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={showLoginPrompt}
        title="로그인이 필요해요"
        message={'지금은 기록을 남길 수 없습니다.\n간단한 로그인 후 함께해보세요!'}
        confirmLabel="카카오 로그인"
        confirmVariant="kakao"
        cancelLabel="다음에 할게요"
        onCancel={() => setShowLoginPrompt(false)}
        onConfirm={() => {
          setShowLoginPrompt(false)
          startKakaoLogin()
        }}
      />
    </MobileLayout>
  );
}