// src/pages/result/api.js
// 결과 화면 전용 API/유틸을 한 파일로 모음: 코스 생성, 보관함 저장, 오케스트레이션
//
// 좌표 -> 지역명 변환은 여기서 REST로 하지 않음. Expansion 화면이 카카오맵 SDK를
// 이미 로드한 김에 coord2RegionCode(services 라이브러리, JS 키만 사용)로 미리 계산해서
// regionTag 문자열로 넘겨주고, 여기서는 그 값을 그대로 받아쓰기만 함.
// (REST 키/Authorization 헤더/도메인 별도 등록 불필요 - src/components/kakaoMap.js 참고)
import { apiPost } from '../../api/client';
import { isLoggedIn, getUserId } from '../../components/auth';

// ---------- 코스 생성: POST /api/courses ----------
async function createCourse(mainPlaceId, selectedPlaceIds) {
  return apiPost('/api/courses', { mainPlaceId, selectedPlaceIds });
}

// ---------- 보관함 저장: POST /api/saved-courses (userId는 쿼리 파라미터) ----------
async function saveCourse(courseId, userId) {
  return apiPost(`/api/saved-courses?userId=${encodeURIComponent(userId)}`, { courseId });
}

const formatTag = (t) =>
  typeof t === 'string' ? (t.startsWith('#') ? t : `#${t}`) : null;

// CourseResponse -> CourseResultView(courseData)가 기대하는 형태로 변환.
// CoursePlaceResponse에는 'description'이 아니라 'summary'로 내려오는 것만 맞춰주면 나머지는 동일.
function adaptCourseResponse(courseData, extraTags) {
  const places = (courseData.places ?? []).map((p) => ({
    ...p,
    description: p.summary,
  }));

  // 태그 순서: 유형 - 지역 - 동행자 - AI가 생성한 태그들
  const tags = [...extraTags, ...(courseData.tags ?? [])]
    .map(formatTag)
    .filter(Boolean);

  return { ...courseData, places, tags };
}

/**
 * 결과 화면에 필요한 모든 데이터를 미리 준비한다.
 * 로딩 화면에서 이 함수 하나만 호출하고, resolve 되면 결과 화면으로 navigate 하면 됨.
 *
 * @param {object} params
 * @param {string} params.mainPlaceId
 * @param {string[]} params.selectedPlaceIds - Expansion에서 추가로 선택한 장소 ID 목록
 *   (mainPlaceId 자체를 포함해야 하는지는 스웨거 예시가 애매해서, 일단 안 겹치게 mainPlaceId를
 *   앞에 붙여서 보냄. 실제 동작 확인되면 이 부분 조정 필요)
 * @param {string} params.travelType - 자연/도시/복합 (앞 단계 사용자 선택)
 * @param {string} params.companion - 동행자 (앞 단계 사용자 선택)
 * @param {string|null} params.regionTag - Expansion 화면에서 카카오맵 SDK(coord2RegionCode)로
 *   미리 변환해둔 지역명(시/군/구)
 * @returns {Promise<object>} 결과 화면에서 바로 쓸 수 있는 완성된 코스 데이터 (tags 배열 포함)
 */
export async function prepareCourseResult({
  mainPlaceId,
  selectedPlaceIds,
  travelType,
  companion,
  regionTag,
}) {
  // CourseCreateRequest 예시를 보면 selectedPlaceIds에 mainPlaceId도 포함된 형태라
  // 그에 맞춰 합쳐서 보냄 (중복 없이)
  const allPlaceIds = Array.from(new Set([mainPlaceId, ...selectedPlaceIds]));
  const courseData = await createCourse(mainPlaceId, allPlaceIds);

  // 보관함 자동 저장(회원만) - 결과 화면 진입을 지연시키지 않도록 fire-and-forget
  const userId = getUserId();
  if (isLoggedIn() && userId) {
    saveCourse(courseData.courseId, userId).catch((err) => {
      if (err.status === 409) return; // 이미 저장된 코스 - 정상 케이스
      console.error('보관함 자동 저장 실패:', err.message);
    });
  }

  return adaptCourseResponse(courseData, [travelType, regionTag, companion]);
}