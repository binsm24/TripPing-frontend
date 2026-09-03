// src/components/auth.js
// TODO: 카카오 로그인 SDK 연동 (언니 담당). startKakaoLogin() 안에서 카카오 SDK로
// accessToken을 받은 뒤 loginWithKakao(accessToken)를 호출하면 나머지(세션 저장 등)는
// 이 파일이 알아서 처리함.
import { apiPost } from '../api/client';

const TOKEN_KEY = 'tripping_auth_token';
const USER_ID_KEY = 'tripping_user_id';
const USER_NAME_KEY = 'tripping_user_name';

// TODO(백엔드 연동 테스트용): 카카오 로그인 SDK가 아직 없어서 실제 로그인을 못 해보는 동안,
// 보관함 등 회원 전용 API를 미리 테스트할 수 있게 만든 개발용 스위치.
// .env에 VITE_DEV_FORCE_LOGIN=true 를 넣으면 항상 로그인된 것처럼 취급하고,
// 실제 로그인 세션이 없으면 아래 TEMP_DEV_USER_ID를 userId로 사용함.
// 카카오 로그인이 실제로 붙으면 이 스위치는 꺼두거나(.env에서 제거) 통째로 지우면 됨.
const DEV_FORCE_LOGIN = import.meta.env.VITE_DEV_FORCE_LOGIN === 'true';
const TEMP_DEV_USER_ID = 'dev-test-user-1';

export function startKakaoLogin() {
  // TODO: 카카오 SDK Kakao.Auth.login() 등으로 accessToken을 받아온 뒤
  //   loginWithKakao(accessToken) 호출로 교체
}

// POST /api/auth/kakao - 카카오 accessToken으로 TripPing 로그인/회원가입
export async function loginWithKakao(kakaoAccessToken) {
  const data = await apiPost('/api/auth/kakao', { accessToken: kakaoAccessToken });
  setSession({ userId: data.userId, token: data.accessToken, nickname: data.nickname });
  return data;
}

// 로그인 성공 시 세션 저장
function setSession({ userId, token, nickname }) {
  if (userId != null) localStorage.setItem(USER_ID_KEY, String(userId));
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (nickname) localStorage.setItem(USER_NAME_KEY, nickname);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  // TODO: 카카오 로그아웃 API(Kakao.Auth.logout())도 함께 호출할 것
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// 보관함 등 userId 쿼리 파라미터가 필요한 API에서 사용.
// 실제 로그인 세션이 있으면 그 userId, 없고 DEV_FORCE_LOGIN이면 임시 테스트 ID, 그 외엔 null.
export function getUserId() {
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored) return stored;
  return DEV_FORCE_LOGIN ? TEMP_DEV_USER_ID : null;
}

export function isLoggedIn() {
  if (DEV_FORCE_LOGIN) return true;
  return !!getAuthToken();
}

// 인사말/입력 라벨 등에서 공통으로 쓰는 표시용 이름.
export function getUserName() {
  return localStorage.getItem(USER_NAME_KEY);
}

// 카카오 로그인 닉네임이 있으면 그대로(4자 넘으면 말줄임), 없으면(비회원) '여행자'.
export function formatDisplayName(name) {
  if (!name) return '여행자';
  return name.length > 4 ? `${name.slice(0, 4)}...` : name;
}