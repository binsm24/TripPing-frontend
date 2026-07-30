import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
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

// TODO: 로그인 연동 후 실제 사용자 이름으로 교체
const USER_NAME = '유진';

export default function ThreeSelect() {
  const navigate = useNavigate();

  const handleArchive = () => {
    navigate('/archive');
  };

  const handleSelectCategory = (categoryKey) => {
    // TODO: 여행 조건 입력 화면 라우트 연결
    navigate('/condition', { state: { category: categoryKey } });
  };

  return (
    <MobileLayout>
      <div className="three-select">
        <div className="three-select__topbar">
          <button type="button" className="three-select__archive-btn" onClick={handleArchive} aria-label="보관함">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4h16v3H4V4zm1 5h14v11H5V9zm3 2v2h8v-2H8z" />
            </svg>
          </button>
        </div>

        <div className="three-select__hero">
          <img src={symbol} alt="" className="three-select__symbol" />
          <p className="three-select__greeting">
            안녕하세요, {USER_NAME} 님.
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
    </MobileLayout>
  );
}