// src/pages/storage/detail.jsx
// 보관함 목록에서 카드를 눌러 들어오는 상세 화면.
// result.jsx와 헤더/카드/저장·공유 버튼을 완전히 동일하게 쓰기로 해서
// components/CourseResult/CourseResultView를 그대로 공유함.
// 이 파일이 하는 일은 "savedCourseId로 API 조회"와 "로딩/에러 상태 표시" 뿐임.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import MobileLayout from '../../components/MobileLayout';
import CourseResultView from '../../components/CourseResultView';
import { getAuthToken } from '../../components/auth';
import { mockCourseResult } from '../result/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// ---------- 보관함 상세 조회: GET /api/saved-courses/{savedCourseId} ----------
// 응답 형태는 결과 화면의 courseData와 동일하다고 가정
// (courseId, courseTitle, description, mapImageUrl, places, tags, estimatedDuration 등).
// 실제 필드명이 다르면 이 함수 안에서만 매핑해주면 됨 - CourseResultView는 안 건드려도 됨.
async function fetchSavedCourseDetail(savedCourseId) {
  const res = await fetch(`${BASE_URL}/api/saved-courses/${savedCourseId}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    const error = new Error(json.message || '코스 상세 조회에 실패했습니다.');
    error.status = json.status ?? res.status;
    throw error;
  }

  return json.data;
}

export default function StorageDetail() {
  const { savedCourseId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetchSavedCourseDetail(savedCourseId)
      .then((data) => {
        if (!ignore) setCourseData(data);
      })
      .catch((err) => {
        // TODO: GET /api/saved-courses/{savedCourseId} 백엔드 연동되면 이 fallback은 제거하고
        // 위 setLoadError(err)만 남기면 됨. 지금은 API가 없어서 항상 실패하므로,
        // 화면 확인이 가능하도록 목업 데이터로 대체함.
        console.warn('[보관함 상세] 조회 실패, 목업 데이터로 대체합니다:', err.message);
        if (!ignore) setCourseData({ ...mockCourseResult, courseId: savedCourseId });
      });

    return () => {
      ignore = true;
    };
  }, [savedCourseId]);

  if (loadError) {
    return (
      <MobileLayout background="#F5F7F8">
        <header className="course-result-header">
          <div className="course-result-header__group">
            <button
              className="course-result-header__box course-result-header__back"
              onClick={() => navigate(-1)}
              aria-label="뒤로가기"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </header>
        <p style={{ padding: '24px', textAlign: 'center' }}>코스를 불러오지 못했어요.</p>
      </MobileLayout>
    );
  }

  // 조회 전 (로딩 중)
  if (!courseData) return null;

  return (
    <MobileLayout background="#F5F7F8">
      <CourseResultView courseData={courseData} />
    </MobileLayout>
  );
}