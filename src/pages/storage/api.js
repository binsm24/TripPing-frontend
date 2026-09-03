// src/pages/storage/api.js
import { apiGet } from '../../api/client';
import { getUserId } from '../../components/auth';

// SavedCourseSummaryResponse -> ArchiveCard가 기대하는 형태로 변환.
// title(X) -> courseTitle(O), tags는 이 응답에 아예 없어서 빈 배열로 채움
// (목록 화면에서는 태그를 안 보여줘도 되면 이대로 두고, 보여줘야 하면 백엔드에
//  요약 응답에도 tags를 내려달라고 요청해야 함).
function adaptSummary(item) {
  return {
    savedCourseId: item.savedCourseId,
    title: item.courseTitle,
    tags: [], // TODO: SavedCourseSummaryResponse에 tags 필드가 없음
    createdAt: item.createdAt,
    mapImageUrl: item.mapImageUrl || null,
  };
}

// GET /api/saved-courses?userId=...
export async function getSavedCourses() {
  const userId = getUserId();
  if (!userId) return [];
  const data = await apiGet(`/api/saved-courses?userId=${encodeURIComponent(userId)}`);
  return (data ?? []).map(adaptSummary);
}

// SavedCourseDetailResponse -> CourseResultView(courseData)가 기대하는 형태로 변환.
// (result/api.js의 adaptCourseResponse와 동일하게 summary -> description만 맞춰주면 됨)
function adaptDetail(detail) {
  const places = (detail.places ?? []).map((p) => ({
    ...p,
    description: p.summary,
  }));
  const tags = (detail.tags ?? []).map((t) => (t.startsWith('#') ? t : `#${t}`));
  return { ...detail, places, tags };
}

// GET /api/saved-courses/{savedCourseId}
// (스웨거상 이 엔드포인트는 userId 파라미터를 받지 않음 - 목록 조회와 다름)
export async function getSavedCourseDetail(savedCourseId) {
  const data = await apiGet(`/api/saved-courses/${savedCourseId}`);
  return adaptDetail(data);
}