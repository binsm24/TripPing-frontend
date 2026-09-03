// src/pages/MainSpots/api.js
// POST /api/recommendations - ConditionInput에서 입력한 조건으로 메인 관광지 3곳 추천받기.
// 실제 호출은 loading.jsx가 함 (next.path === '/spots'일 때).
import { apiPost } from '../../api/client';

// ConditionInput의 companion 키(alone/friend/pet/parents/kid/partner) ->
// 백엔드 RecommendationRequest.companion enum(연인/아이/가족/친구).
//
// TODO(팀 확인 필요): '혼자'와 '반려동물'은 백엔드 enum에 아예 없어서 정확히 대응되는 값이
// 없음. 일단 아래처럼 그나마 가까운 값으로 임시 매핑해뒀는데, 실제로 어떻게 취급할지는
// 백엔드/기획과 맞춰서 정해야 함 (enum에 추가할지, 프론트에서 다른 값으로 보낼지 등).
const COMPANION_ENUM_MAP = {
  alone: '친구', // TODO: 임시값. '혼자' 대응 enum 없음
  friend: '친구',
  pet: '가족', // TODO: 임시값. '반려동물' 대응 enum 없음
  parents: '가족',
  kid: '아이',
  partner: '연인',
};

const CATEGORY_TO_TRAVEL_TYPE = {
  nature: '자연',
  city: '도시',
  complex: '복합',
};

// ConditionInput의 COMPANION_TYPES 키 -> 실제 한글 라벨.
// 위 COMPANION_ENUM_MAP과 다른 용도: 이건 결과 화면 태그 등 "화면에 보여줄 텍스트"용이고,
// COMPANION_ENUM_MAP은 "백엔드 enum에 맞춰 보내야 하는 값"용이라 각각 따로 둠.
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
    companion: COMPANION_ENUM_MAP[companion] ?? '친구',
    // '없음'(선호 지역 미선택)이면 region 필드 자체를 생략
    ...(region && region !== '없음' ? { region: `경기도 ${region}` } : {}),
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