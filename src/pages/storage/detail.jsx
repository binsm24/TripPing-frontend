// src/pages/storage/detail.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import MobileLayout from '../../components/MobileLayout';
import CourseResultView from '../../components/CourseResultView';
import { getSavedCourseDetail } from './api';
import { mockCourseResult } from '../result/mockData';

export default function StorageDetail() {
  const { savedCourseId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let ignore = false;

    // api.js의 getSavedCourseDetail 함수 호출
    getSavedCourseDetail(savedCourseId)
      .then((data) => {
        if (!ignore) setCourseData(data);
      })
      .catch((err) => {
        console.warn('[보관함 상세] 조회 실패, 목업 데이터로 대체합니다:', err.message);
        // 백엔드 API 연동 검증 단계에서 실패 시 화면 테스트를 위해 목업 폴백 유지
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

  // 데이터 로딩 중
  if (!courseData) return null;

  return (
    <MobileLayout background="#F5F7F8">
      <CourseResultView courseData={courseData} />
    </MobileLayout>
  );
}