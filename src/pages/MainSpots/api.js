// src/pages/MainSpots/api.js
// POST /api/recommendations - ConditionInput에서 입력한 조건으로 메인 관광지 3곳 추천받기.
// 실제 호출은 loading.jsx가 함 (next.path === '/spots'일 때).
import { apiPost } from '../../api/client';

// ConditionInput의 companion 키(alone/friend/pet/parents/kid/partner) ->
// 백엔드 RecommendationRequest.companion enum.
// 백엔드 enum이 UI의 6종(혼자/친구/반려동물/부모님/아이/연인)과 동일하게 확장돼서,
// 화면 표시용 라벨(COMPANION_LABELS)을 그대로 API 요청값으로도 씀 - 별도 근사 매핑 불필요.
const CATEGORY_TO_TRAVEL_TYPE = {
  nature: '자연',
  city: '도시',
  complex: '복합',
};

// ConditionInput의 COMPANION_TYPES 키 -> 실제 한글 라벨.
// 화면 표시(결과 태그 등)와 API 요청값(companion) 양쪽에 다 씀.
export const COMPANION_LABELS = {
  alone: '혼자',
  friend: '친구',
  pet: '반려동물',
  parents: '부모님',
  kid: '아이',
  partner: '연인',
};

export function getTravelTypeLabel(category) {
  return CATEGORY_TO_TRAVEL_TYPE[category] ?? '자연';
}

export function getCompanionLabel(companion) {
  return COMPANION_LABELS[companion] ?? companion;
}

/**
 * ConditionInput에서 넘어온 화면 state를 RecommendationRequest 형태로 변환.
 * @param {object} condition - { category, age, companion, region, extraRequest }
 */
export function buildRecommendationRequest(condition) {
  const { category, age, companion, region, extraRequest } = condition;

  return {
    travelType: CATEGORY_TO_TRAVEL_TYPE[category] ?? '자연',
    age: Number(age),
    companion: COMPANION_LABELS[companion] ?? companion,
    // '없음'(선호 지역 미선택)이면 region 필드 자체를 생략
    ...(region && region !== '없음' ? region: {}),
    ...(extraRequest ? { requirement: extraRequest } : {}),
  };
}

// RecommendedPlace -> MainSpots 화면(SpotCard)이 쓰는 spot 형태로 변환.
// 주소/영업시간/요금/주차/반려동물/전화는 이 API 응답에 없어서(RecommendedPlace 스키마 참고)
// 우선 "정보 없음"으로 채워둠. 상세 내용은 추후 백엔드 스펙 변경 시 다시 채우면 됨.
function adaptPlace(place) {
  return {
    id: place.placeId,
    name: place.name,
    summary: place.summary,
    thumbnail: place.imageUrl || null,
    lat: place.latitude,
    lng: place.longitude,
    address: '정보 없음',
    hours: ['정보 없음'],
    fee: '정보 없음',
    parking: '정보 없음',
    pet: '정보 없음',
    phone: '정보 없음',
  };
}

/**
 * @param {object} condition - ConditionInput에서 넘어온 state
 * @returns {Promise<{ recommendationSessionId: string, title: string, spots: object[] }>}
 */
export async function recommendMainSpots(condition) {
  const body = buildRecommendationRequest(condition);
  const data = await apiPost('/api/recommendations', body);

  return {
    recommendationSessionId: data.recommendationSessionId,
    title: data.title,
    spots: (data.places ?? []).map(adaptPlace),
  };
}