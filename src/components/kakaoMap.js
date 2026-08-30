// src/components/kakaoMap.js
// 카카오맵 JS SDK를 동적으로 로드하는 공용 유틸.
// MainSpots(주소->좌표 Geocoding), ExpandSelection(지도 표시) 등 여러 화면에서 재사용합니다.
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
    // services 라이브러리: 주소<->좌표 변환(Geocoder), 좌표->지역명 변환(coord2RegionCode)에 필요
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`
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

// 좌표 -> 지역명(시/군/구) 변환. REST API 키/도메인 등록 없이 JS 키(Maps SDK)만으로 동작합니다.
// SDK가 로드된 상태(loadKakaoMapScript 완료 후)에서만 호출 가능합니다.
export function getRegionTagViaSDK(kakao, latitude, longitude) {
  return new Promise((resolve) => {
    if (!kakao?.maps?.services || !latitude || !longitude) {
      resolve(null)
      return
    }
    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.coord2RegionCode(longitude, latitude, (result, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        resolve(null)
        return
      }
      // 행정동(H) 우선, 없으면 법정동(B) 첫 결과로 대체
      const region = result.find((r) => r.region_type === 'H') ?? result[0]
      resolve(region?.region_2depth_name || region?.region_1depth_name || null)
    })
  })
}