// src/pages/result/api.js
// 결과 화면 전용 API/유틸을 한 파일로 모음: 코스 생성, 보관함 저장, 오케스트레이션
//
// tags는 백엔드가 이미 완성된 형태로 내려줌(예: ["자연","산책","수원여행","친구와 함께"]).
// 실제 응답 테스트로 확인된 부분이라, 프론트에서 travelType/지역/동행자를 따로 조합해서
// 앞에 붙이지 않음(중복 태그가 생겼었음).
import { apiPost } from '../../api/client';
import { isLoggedIn, getUserId } from '../../components/auth';

// ---------- 코스 생성: POST /api/courses ----------
// 실제 테스트해보니 CourseCreateRequest는 RecommendationRequest와 거의 같은 조건 필드에
// mainPlaceId/recommendationSessionId/selectedPlaceIds가 추가된 형태였음 (스웨거 스키마만
// 보고 짰을 땐 mainPlaceId+selectedPlaceIds만 필요한 줄 알았는데 실제로는 더 필요했음).
async function createCourse({
  mainPlaceId,
  recommendationSessionId,
  region,
  travelType,
  age,
  companion,
  requirement,
  selectedPlaceIds,
}) {
  return apiPost('/api/courses', {
    mainPlaceId,
    recommendationSessionId,
    ...(region ? { region } : {}),
    travelType,
    age,
    companion,
    ...(requirement ? { requirement } : {}),
    // 실제 테스트 요청에서 selectedPlaceIds에 mainPlaceId가 안 겹쳐 있었음 -> 그대로 보냄
    selectedPlaceIds,
  });
}

// ---------- 보관함 저장: POST /api/saved-courses (userId는 쿼리 파라미터) ----------
async function saveCourse(courseId, userId) {
  return apiPost(`/api/saved-courses?userId=${encodeURIComponent(userId)}`, { courseId });
}

const formatTag = (t) =>
  typeof t === 'string' ? (t.startsWith('#') ? t : `#${t}`) : null;

// CourseResponse -> CourseResultView(courseData)가 기대하는 형태로 변환.
// CoursePlaceResponse에는 'description'이 아니라 'summary'로 내려오는 것만 맞춰주면 나머지는 동일.
// tags는 실제 응답에서 이미 완성된 형태로 옴(예: ["자연","산책","수원여행","친구와 함께","카페투어"]).
// 프론트에서 travelType/지역/동행자를 따로 조합해서 앞에 붙이면 중복 태그가 생겨서, 그대로 씀.
function adaptCourseResponse(courseData) {
  const places = (courseData.places ?? []).map((p) => ({
    ...p,
    description: p.summary,
  }));

  const tags = (courseData.tags ?? []).map(formatTag).filter(Boolean);

  return { ...courseData, places, tags };
}

/**
 * 결과 화면에 필요한 모든 데이터를 미리 준비한다.
 * 로딩 화면에서 이 함수 하나만 호출하고, resolve 되면 결과 화면으로 navigate 하면 됨.
 *
 * @param {object} params
 * @param {string} params.mainPlaceId
 * @param {string} params.recommendationSessionId
 * @param {string[]} params.selectedPlaceIds - Expansion에서 추가로 선택한 장소 ID 목록
 *   (mainPlaceId는 포함하지 않음 - 실제 응답 확인 결과 겹치면 안 됨)
 * @param {string} [params.region] - 선호 지역 (예: '수원')
 * @param {string} params.travelType - 자연/도시/복합
 * @param {number} params.age
 * @param {string} params.companion - 동행자
 * @param {string} [params.requirement] - 추가 요구사항
 * @returns {Promise<object>} 결과 화면에서 바로 쓸 수 있는 완성된 코스 데이터 (tags 배열 포함)
 */
export async function prepareCourseResult({
  mainPlaceId,
  recommendationSessionId,
  selectedPlaceIds,
  region,
  travelType,
  age,
  companion,
  requirement,
}) {
  const courseData = await createCourse({
    mainPlaceId,
    recommendationSessionId,
    region,
    travelType,
    age,
    companion,
    requirement,
    selectedPlaceIds,
  });

  // 보관함 자동 저장(회원만) - 결과 화면 진입을 지연시키지 않도록 fire-and-forget
  const userId = getUserId();
  if (isLoggedIn() && userId) {
    saveCourse(courseData.courseId, userId).catch((err) => {
      if (err.status === 409) return; // 이미 저장된 코스 - 정상 케이스
      console.error('보관함 자동 저장 실패:', err.message);
    });
  }

  return adaptCourseResponse(courseData);
}