// src/components/kakaoMap.js
// 카카오맵 JS SDK를 동적으로 로드하는 공용 유틸.
// MainSpots·ExpandSelection의 지도/마커 표시에서 재사용합니다.
//
// .env 의 VITE_KAKAO_MAP_KEY 값을 사용합니다.
// (카카오 개발자 콘솔 > 내 애플리케이션 > 플랫폼에 이 사이트 도메인이 등록되어 있어야 합니다.)

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

export function loadKakaoMapScript() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao)
      return
    }

    // 다른 화면에서 이미 스크립트 삽입을 시작한 경우, 그 로드가 끝나기를 같이 기다림
    // (module-scope Promise 캐싱과 달리 이 방식은 컴포넌트 리마운트에도 안전하게 동작)
    const existingScript = document.getElementById('kakao-map-sdk')
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        window.kakao.maps.load(() => resolve(window.kakao))
      })
      existingScript.addEventListener('error', reject)
      return
    }

    const script = document.createElement('script')
    script.id = 'kakao-map-sdk'
    // 지도/마커 표시만 쓰면 되는 상태라 services 라이브러리는 안 붙임.
    // (예전엔 주소<->좌표, 좌표->지역명 변환에 썼는데, 이제 그 값들이 다 백엔드 API 응답으로
    // 직접 오게 되면서 프론트에서 Geocoder를 쓸 일이 없어짐)
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`
    script.async = true
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// 현재 테마(index.css)에 정의된 CSS 변수 색상을 그대로 읽어와 마커 아이콘 색으로 사용합니다.
export function getCssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name)
  return value ? value.trim() : fallback
}