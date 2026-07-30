import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import loginBack from '../../assets/login_back.jpg';
import logoW from '../../assets/logoW.png';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 연동
  };

  const handleGuest = () => {
    navigate('/home');
  };

  return (
    <MobileLayout>
      <div className="login">
        <div
          className="login__hero"
          style={{ backgroundImage: `url(${loginBack})` }}
        >
          <img src={logoW} alt="TripPing" className="login__logo" />
        </div>

        <div className="login__panel">
          <h1 className="login__title">로그인</h1>

          <button type="button" className="login__btn login__btn--kakao" onClick={handleKakaoLogin}>
            <svg className="login__btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.86 5.19 4.66 6.59-.2.74-.73 2.68-.84 3.1-.13.51.19.5.4.37.16-.1 2.56-1.74 3.6-2.45.7.1 1.42.15 2.18.15 5.52 0 10-3.48 10-7.76C22 6.48 17.52 3 12 3z" />
            </svg>
            카카오 로그인
          </button>

          <button type="button" className="login__btn login__btn--guest" onClick={handleGuest}>
            로그인 없이 사용하기
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}