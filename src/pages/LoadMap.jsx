import { useEffect, useRef, useState } from 'react'
import styles from './LoadMap.module.scss'

const STORE_ADDRESS = '경기 안산시 상록구 광덕1로 375 강우프라자 5층'
const STORE_NAME = '플라워 댄스 (안산본점)'
const FALLBACK_POSITION = { lat: 37.315, lng: 126.838 }

const loadKakaoMapSdk = (appKey) => new Promise((resolve, reject) => {
  if (window.kakao?.maps) {
    window.kakao.maps.load(resolve)
    return
  }

  const existingScript = document.querySelector('script[data-kakao-map-sdk]')
  if (existingScript) {
    existingScript.addEventListener('load', () => window.kakao.maps.load(resolve), { once: true })
    existingScript.addEventListener('error', reject, { once: true })
    return
  }

  const script = document.createElement('script')
  script.dataset.kakaoMapSdk = 'true'
  script.async = true
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`
  script.onload = () => window.kakao.maps.load(resolve)
  script.onerror = () => reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
  document.head.appendChild(script)
})

const LoadMap = () => {
  const mapRef = useRef(null)
  const [mapError, setMapError] = useState('')

  useEffect(() => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY
    if (!appKey) {
      setMapError('카카오맵 키가 설정되지 않았습니다.')
      return undefined
    }

    let isActive = true
    loadKakaoMapSdk(appKey)
      .then(() => {
        if (!isActive || !mapRef.current) return
        const { kakao } = window
        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(FALLBACK_POSITION.lat, FALLBACK_POSITION.lng),
          level: 3,
        })
        const geocoder = new kakao.maps.services.Geocoder()
        geocoder.addressSearch(STORE_ADDRESS, (result, status) => {
          if (!isActive) return
          const position = status === kakao.maps.services.Status.OK
            ? new kakao.maps.LatLng(result[0].y, result[0].x)
            : new kakao.maps.LatLng(FALLBACK_POSITION.lat, FALLBACK_POSITION.lng)
          map.setCenter(position)
          const marker = new kakao.maps.Marker({ position })
          marker.setMap(map)
          const infoWindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:10px 14px;min-width:190px;font-size:13px;line-height:1.5;"><strong>${STORE_NAME}</strong><br/>${STORE_ADDRESS}</div>`,
          })
          infoWindow.open(map, marker)
        })
      })
      .catch(() => {
        if (isActive) setMapError('지도를 불러오지 못했습니다. 카카오 Developers의 플랫폼 도메인 설정을 확인해 주세요.')
      })
    return () => { isActive = false }
  }, [])

  return (
    <main className={styles.page}>
      <header className={styles.titleArea}>
        <p>VISIT US</p><h1>오시는 길</h1><span>플라워 댄스 안산본점에서 만나요</span>
      </header>
      <section className={styles.content}>
        <div className={styles.mapWrap}>
          <div ref={mapRef} className={styles.map} aria-label='플라워 댄스 안산본점 지도' />
          {mapError && <p className={styles.mapError}>{mapError}</p>}
        </div>
        <aside className={styles.storeInfo}>
          <img src='/img/wlcome.png' alt='어서오세요' />
          <h2>{STORE_NAME}</h2><p>{STORE_ADDRESS}</p><p>경기 안산시 상록구 일동 715-3</p>
          <a href='https://map.kakao.com/link/search/경기 안산시 상록구 광덕1로 375 강우프라자 5층' target='_blank' rel='noreferrer'>카카오맵에서 길찾기</a>
        </aside>
      </section>
    </main>
  )
}

export default LoadMap
