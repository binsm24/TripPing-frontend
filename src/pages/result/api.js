// src/pages/result/api.js
// 결과 화면 전용 API/유틸을 한 파일로 모음: 코스 생성, 보관함 저장, 오케스트레이션
//
// 좌표 -> 지역명 변환은 여기서 REST로 하지 않음. Expansion 화면이 카카오맵 SDK를
// 이미 로드한 김에 coord2RegionCode(services 라이브러리, JS 키만 사용)로 미리 계산해서
// regionTag 문자열로 넘겨주고, 여기서는 그 값을 그대로 받아쓰기만 함.
// (REST 키/Authorization 헤더/도메인 별도 등록 불필요 - src/components/kakaoMap.js 참고)
import { getAuthToken, isLoggedIn } from '../../components/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// ---------- 코스 생성: POST /api/courses ----------
async function createCourse(recommendationId, selectedPlaceIds) {
  const res = await fetch(`${BASE_URL}/api/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recommendationId, selectedPlaceIds }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    const error = new Error(json.message || '코스 생성에 실패했습니다.');
    error.status = json.status ?? res.status;
    throw error;
  }

  return json.data;
}

// ---------- 보관함 저장: POST /api/saved-courses/{courseId} ----------
async function saveCourse(courseId, token) {
  const res = await fetch(`${BASE_URL}/api/saved-courses/${courseId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    const error = new Error(json.message || '보관함 저장에 실패했습니다.');
    error.status = json.status ?? res.status;
    throw error;
  }

  return json.data;
}

const formatTag = (t) =>
  typeof t === 'string' ? (t.startsWith('#') ? t : `#${t}`) : null;

/**
 * 결과 화면에 필요한 모든 데이터를 미리 준비한다.
 * 로딩 화면에서 이 함수 하나만 호출하고, resolve 되면 결과 화면으로 navigate 하면 됨.
 *
 * @param {object} params
 * @param {number} params.recommendationId
 * @param {number[]} params.selectedPlaceIds
 * @param {string} params.travelType - 자연/도시/복합 (앞 단계 사용자 선택)
 * @param {string} params.companion - 동행자 (앞 단계 사용자 선택)
 * @param {string|null} params.regionTag - Expansion 화면에서 카카오맵 SDK(coord2RegionCode)로
 *   미리 변환해둔 지역명(시/군/구). 좌표가 아니라 변환된 문자열을 그대로 받음.
 * @returns {Promise<object>} 결과 화면에서 바로 쓸 수 있는 완성된 코스 데이터 (tags 배열 포함)
 */
export async function prepareCourseResult({
  recommendationId,
  selectedPlaceIds,
  travelType,
  companion,
  regionTag,
}) {
  const courseData = await createCourse(recommendationId, selectedPlaceIds);

  // 보관함 자동 저장(회원만) - 결과 화면 진입을 지연시키지 않도록 fire-and-forget
  if (isLoggedIn()) {
    saveCourse(courseData.courseId, getAuthToken()).catch((err) => {
      if (err.status === 409) return; // 이미 저장된 코스 - 정상 케이스
      console.error('보관함 자동 저장 실패:', err.message);
    });
  }

  // 태그 순서: 유형 - 지역 - 동행자 - AI 생성 태그
  const aiTag = Array.isArray(courseData?.tag) ? courseData.tag[0] : courseData?.tag;
  const tags = [travelType, regionTag, companion, aiTag].map(formatTag).filter(Boolean);

  return { ...courseData, tags };
}