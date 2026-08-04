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