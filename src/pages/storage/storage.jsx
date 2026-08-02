import { useEffect, useState } from 'react';
import MobileLayout from '../../components/MobileLayout';
import ArchiveCard from './ArchiveCard';
import symbolImg from '../../assets/symbolW.png';
import './storage.css';
import { BookMarked } from 'lucide-react'

// 계획된 API: GET /api/saved-courses
const SAVED_COURSES_ENDPOINT = '/api/saved-courses';

// TODO: 백엔드(GET /api/saved-courses) 연동 전까지 사용하는 목업 데이터입니다.
// 응답 필드명은 백엔드 스펙 확정되면 아래 형태에 맞춰 조정해주세요.
// { savedCourseId, title, tags, createdAt, mapImageUrl }
const MOCK_COURSES = [
  {
    savedCourseId: 'saved-1',
    title: '마장호수 물길따라 힐링 코스',
    tags: ['자연', '파주', '부모님', '힐링'],
    createdAt: '2026-07-13',
    mapImageUrl: null, // 실제로는 결과 카드에서 생성된 지도 이미지를 그대로 사용
  },
  {
    savedCourseId: 'saved-2',
    title: '마장호수 물길따라 힐링 코스',
    tags: ['자연', '파주', '부모님', '힐링'],
    createdAt: '2026-07-10',
    mapImageUrl: null,
  },
];

function formatDate(isoDate) {
  const d = new Date(isoDate);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}.`;
}

/**
 * 보관함(나의 여행 기록) 화면.
 *
 * @param {Array} [coursesOverride] - 스토리북/테스트용으로 목록을 직접 주입하고 싶을 때 사용.
 *   전달하지 않으면 GET /api/saved-courses를 호출해서 가져옵니다 (실패 시 목업 데이터로 폴백).
 * @param {() => void} [onNavigateHome] - 우상단 심볼 버튼 클릭 시 호출. 미전달 시 콘솔 로그만 출력.
 * @param {(savedCourseId: string) => void} [onSelectCourse] - 카드 클릭 시 호출.
 *   미전달 시 콘솔 로그만 출력. 실제로는 GET /api/saved-courses/{savedCourseId}로 상세 조회하는
 *   상세 결과 화면으로 이동하게 됩니다.
 */
export default function storage({ courses: coursesOverride, onNavigateHome, onSelectCourse }) {
  const [fetchedCourses, setFetchedCourses] = useState(MOCK_COURSES);

  useEffect(() => {
    if (coursesOverride) return; // 목록이 주입된 경우 fetch 생략

    let ignore = false;

    async function fetchSavedCourses() {
      try {
        const res = await fetch(SAVED_COURSES_ENDPOINT);
        if (!res.ok) {
          throw new Error(`GET ${SAVED_COURSES_ENDPOINT} 실패: ${res.status}`);
        }
        const data = await res.json();
        if (!ignore) setFetchedCourses(data);
      } catch (err) {
        // 백엔드 미구현 단계이므로 목업 데이터 유지
        console.warn('[보관함] 목록 조회 실패, 목업 데이터로 대체합니다:', err.message);
      }
    }

    fetchSavedCourses();
    return () => {
      ignore = true;
    };
  }, [coursesOverride]);

  const courses = coursesOverride ?? fetchedCourses;

  // 최신순 정렬: 새로운 기록이 항상 최상단에 오도록 보장 (API 응답 순서에 의존하지 않음)
  const sortedCourses = [...courses].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const hasCourses = sortedCourses.length > 0;

  const handleHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    // TODO: 홈 화면 구현 완료 후 실제 경로로 연결
    console.log('[보관함] 홈으로 이동');
  };

  const handleSelectCourse = (savedCourseId) => {
    if (onSelectCourse) {
      onSelectCourse(savedCourseId);
      return;
    }
    // TODO: 상세 결과 화면 구현 완료 후 GET /api/saved-courses/{savedCourseId} 연결
    console.log('[보관함] 상세 결과로 이동:', savedCourseId);
  };

  return (
    <MobileLayout background="linear-gradient(180deg, #ffffff 0%, var(--color-ground) 40%, var(--color-sub) 100%)">
      <div className="archive-page">
        <header className="archive-header">
          <div className="archive-header__text">
            <h1 className="archive-header__title"> 
              <BookMarked size={24} /> 
              <span>나의 여행 기록</span>
            </h1>
            <p className="archive-header__subtitle">
              {hasCourses ? '마음에 둔 여행, 열어볼까요?' : '새로운 기록을 남겨보세요.'}
            </p>
          </div>

          <button
            type="button"
            className="archive-header__home-button"
            onClick={handleHome}
            aria-label="홈으로 이동"
          >
            <img src={symbolImg} alt="" />
          </button>
        </header>

        <div className="archive-list-wrap">
          <div className="archive-list">
            {sortedCourses.map((course) => (
              <ArchiveCard
                key={course.savedCourseId}
                mapImageUrl={course.mapImageUrl}
                title={course.title}
                tags={course.tags.slice(0, 2)}
                date={formatDate(course.createdAt)}
                onClick={() => handleSelectCourse(course.savedCourseId)}
              />
            ))}

            {/* 목록 가장 마지막에 항상 존재하는 반투명 장식 카드. 클릭해도 아무 동작 없음. */}
            <div className="archive-list__placeholder" aria-hidden="true" />
          </div>

          {/* 카드 자체를 흐리게 하지 않고, 하늘색 그라데이션 박스를 목록 위에 얹어서 하단을 가림 (높이 153) */}
          <div className="archive-list__fade" aria-hidden="true" />
        </div>
      </div>
    </MobileLayout>
  );
}