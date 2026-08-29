// src/api/auth.js
// TODO: 로그인(카카오) 연동 완료 후, 실제 토큰 저장 방식(localStorage / Context 등)에 맞춰 교체할 것.
// 지금은 회원/비회원 분기 로직을 미리 짤 수 있도록 더미로만 처리함.

export function getAuthToken() {
  // 임시: 항상 로그인 안 된 상태(비회원)로 취급
  return null;
}

export function isLoggedIn() {
  return !!getAuthToken();
}

// TODO: 카카오 로그인 연동 후, 로그인 응답으로 받은 실제 닉네임을 저장해뒀다가
// 여기서 반환하도록 교체. 지금은 항상 비회원 취급이라 null을 반환하고,
// 화면에는 formatDisplayName()이 대신 '여행자'로 보여줌.
export function getUserName() {
  return isLoggedIn() ? null /* TODO: 실제 카카오 닉네임 */ : null;
}

// 인사말/입력 라벨 등에서 공통으로 쓰는 표시용 이름.
// 카카오 로그인 닉네임이 있으면 그대로(4자 넘으면 말줄임), 없으면(비회원) '여행자'.
export function formatDisplayName(name) {
  if (!name) return '여행자';
  return name.length > 4 ? `${name.slice(0, 4)}...` : name;
}