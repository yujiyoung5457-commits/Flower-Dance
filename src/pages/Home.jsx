import { useEffect, useRef, useState } from 'react'
import MainBanner from '../components/MainBanner'
import CategoryMenu from '../components/CategoryMenu'
import ProductList from '../components/ProductList'
import styles from './Home.module.scss'
import { subscribeProducts } from '../firebase/productApi'

// 밝기: 1이 기본값. 숫자가 작을수록 어둡고, 클수록 밝습니다. 권장 범위 0.5~1.5
// (이미지의 묵직한 분위기를 위해 기존 0.88에서 미세하게 더 낮춥니다)
const COTTI_BRIGHTNESS = 0.85; // [수정] 0.88 -> 0.85 (조금 더 묵직하게)

// 채도: 1이 원본 색상입니다. 0은 흑백, 0.8은 차분하게, 1.2는 선명하게 보입니다.
// (가을의 차분하고 빛바랜 느낌을 위해 기존 0.7에서 더 낮춰 '뮤트톤'을 만듭니다)
const COTTI_SATURATION = 0.6; // [수정] 0.7 -> 0.5 (매우 중요: 차분한 뮤트톤)

// 색온도: 1이 중립입니다. 1보다 작으면 차갑게, 크면 따뜻하게 표현합니다.
// (예시 이미지의 그 짙은 앰버/호박색 빛을 위해 값을 과감하게 올립니다)
const COTTI_TEMPERATURE = 1.6; // [수정] 1.2 -> 1.6 (핵심: 노을 같은 따뜻함 추가)

// 대비: 1이 기본값. 낮으면 부드럽고, 높으면 명암 차이가 커져 선명해집니다.
// (세련된 입체감을 위해 기존의 높은 대비를 유지하거나 미세하게 조정합니다)
const COTTI_CONTRAST = 1.35; // [수정] 1.3 -> 1.35 (입체감 유지)

// 섀도우: 1이 기본값. 어두운 영역의 밝기를 조절합니다. 낮을수록 음영이 진해집니다.
// (깊이감 있는 그림자를 위해 기존의 낮은 값을 유지합니다)
const COTTI_SHADOWS = 0.6; // 유지

// 하이라이트: 1이 기본값. 밝은 영역의 밝기를 조절합니다.
// (밝은 곳이 튀지 않게 눌러주어 전체적인 톤을 차분하게 정리합니다)
const COTTI_HIGHLIGHTS = 0.8; // [수정] 0.8 -> 0.7 (조금 더 차분하게)

// 옵저버 할 수 있을까?



const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// 어두운 영역과 밝은 영역을 각각 조절하는 색조 곡선입니다.
// COTTI_SHADOWS와 COTTI_HIGHLIGHTS 값을 실제 화면 보정에 연결합니다.
const COTTI_TONE_TABLE = [
  0,
  0.25 * clamp(COTTI_SHADOWS, 0, 1.5),
  0.5,
  0.5 + 0.25 * clamp(COTTI_HIGHLIGHTS, 0, 1.5),
  1,
].join(' ')

const getTemperatureFilter = (temperature) => {
  const difference = clamp(temperature - 1, -1, 1)
  const strength = Math.abs(difference) * 0.22

  return difference >= 0
    ? `sepia(${strength}) hue-rotate(-6deg)`
    : `sepia(${strength}) hue-rotate(174deg)`
}

const COTTI_COLOR_FILTER = [
  'url(#cotti-tone-curve)',
  `brightness(${COTTI_BRIGHTNESS})`,
  `saturate(${COTTI_SATURATION})`,
  `contrast(${COTTI_CONTRAST})`,
  getTemperatureFilter(COTTI_TEMPERATURE),
].join(' ')

const Home = () => {
  const [homeProps, setHomeProps]=useState([])
  const homeContentRef = useRef(null)
  useEffect(()=>{
    // Firestore 변경을 실시간 구독하여 관리자 재고 수정이 홈에도 즉시 반영됩니다.
    const unsubscribe = subscribeProducts((productsData) => {
      const recommended = productsData.filter((item) => item.isRecommended)
      setHomeProps((recommended.length > 0 ? recommended : productsData).slice(0, 4))
    }, (error) => {
      console.error('추천 상품을 불러오지 못했습니다.', error)
      setHomeProps([])
    })
    return unsubscribe
  }, [])
  useEffect(() => {
    const imageRevealItems = homeContentRef.current?.querySelectorAll(
      `.${styles.section2} > img, .${styles.imgBox3} img, .${styles.slide}, .${styles.coti}`,
    )
    const textRevealItems = homeContentRef.current?.querySelectorAll(
      `.${styles.txtBox} h1, .${styles.txtBox} span`,
    )
    const pickTextItems = homeContentRef.current?.querySelectorAll(
      `.${styles.our}, .${styles.chu}`,
    )
    const pickCards = homeContentRef.current?.querySelectorAll(`.${styles.pickList} article`)
    const articleImages = homeContentRef.current?.querySelectorAll(`.${styles.article1} > img, .${styles.article2} > img`)
    const articleTextItems = homeContentRef.current?.querySelectorAll(`.${styles.articleText} p, .${styles.articleText} strong, .${styles.articleText} span`)
    const revealItems = [
      ...(imageRevealItems || []),
      ...(textRevealItems || []),
      ...(pickTextItems || []),
      ...(pickCards || []),
      ...(articleImages || []),
      ...(articleTextItems || []),
    ]
    if (!revealItems.length) return undefined

    const directions = [styles.revealUp, styles.revealLeft, styles.revealUp, styles.revealUp, styles.revealRight]
    imageRevealItems.forEach((item, index) => item.classList.add(directions[index] || styles.revealUp))
    ;[...(textRevealItems || []), ...(pickTextItems || [])].forEach((item, index) => {
      item.classList.add(styles.revealUp)
      item.style.transitionDelay = `${index * 180}ms`
    })
    pickCards.forEach((item, index) => {
      item.classList.add(styles.revealPickCard)
      item.style.transitionDelay = `${index * 120}ms`
    })
    articleImages.forEach((item, index) => {
      item.classList.add(styles.revealLeft)
      item.style.transitionDelay = `${index * 180}ms`
    })
    articleTextItems.forEach((item, index) => {
      item.classList.add(styles.revealDown)
      item.style.transitionDelay = `${index * 180}ms`
    })

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add(styles.revealed)
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.25 })

    let animationFrame = requestAnimationFrame(() => {
      animationFrame = requestAnimationFrame(() => {
        revealItems.forEach((item) => observer.observe(item))
      })
    })
    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
  }, [homeProps])
  return (
    <div ref={homeContentRef}>
      <MainBanner />
      <CategoryMenu />
      <strong className={styles.our}>Our Picks</strong>
      <h2 className={styles.chu}>추천 상품</h2>
      <div className={styles.pickList}>
        <ProductList products={homeProps} />
      </div>


      <section className={styles.section1}>
        <div className={styles.imgBox}>
          <img className={styles.cottiPlush} src='/img/cotti-plush03.png' alt='코티 캐릭터' />
          <svg className={styles.colorFilter} aria-hidden='true'>
            <defs>
              <filter id='cotti-tone-curve' colorInterpolationFilters='sRGB'>
                <feComponentTransfer>
                  <feFuncR type='table' tableValues={COTTI_TONE_TABLE} />
                  <feFuncG type='table' tableValues={COTTI_TONE_TABLE} />
                  <feFuncB type='table' tableValues={COTTI_TONE_TABLE} />
                </feComponentTransfer>
              </filter>
            </defs>
          </svg>
          <div className={styles.modelColorGrade} style={{ filter: COTTI_COLOR_FILTER }}>
            <model-viewer
              className={styles.cottiModel}
              src='/img/cotti-3D.glb'
              alt='회전하는 코티 3D 모델'
              auto-rotate
              rotation-per-second='28deg'
              camera-controls
              disable-zoom
              interaction-prompt='none'
              shadow-intensity='1'
              environment-image='neutral'
              exposure={COTTI_BRIGHTNESS}
              camera-orbit='180deg 75deg 98%'
            />
          </div>
        </div>

        <div className={styles.txtBox}>
            <h1>코티 (COTTI)</h1>
            <span>솜(Cotton)과 토끼가 만나 탄생한 세상에서 가장 포근한 아기 토끼.</span>
            <span>낮잠과 당근죽을 사랑하는 완벽한 토끼지만,<br /> 다들 강아지로 오해하는 통에 365일 볼이 시무룩하게 부풀어 있습니다.</span>
            <span>억울함이 묻어나는 저 표정, 실은 진짜 토끼랍니다!</span>
        </div>
      </section>

      <section className={styles.section2}>
        <img src="/img/cotti-plush04.png" alt="코티" />
        <div className={styles.imgBox3}>
          <img src="/img/cotti-plush05.png" alt="코티" />
          <img src="/img/cotti-plush08.png" alt="코티" />
        </div>
      </section>

      <section className={styles.imgBox4}>
        <div className={styles.slide}>
          <div className={styles.slideTrack}>
          <img src="/img/cotti-plush09.png" alt="코티" />
          <img src="/img/cotti-plush10.png" alt="코티" />
          <img src="/img/cotti-plush11.png" alt="코티" />
          </div>
        </div>
        <img className={styles.coti} src='/img/cotti-plush02.png' alt='코티' />

      </section>

      <article className={styles.article1}>
        <img src="/img/cotti-plush15.png" alt="cotti" />
        <img src="/img/cotti-plush16.png" alt="공놀이 중인 코티" />
        <div className={styles.articleText}>
          <p>“미용용으로도 쓰이는 의료기기급 안전 소재 PPSU”</p>
          <strong>우리 아이도, 반려동물도<br />믿고 쓸 수 있는<br />친환경 소재인<br />PPSU(폴리페닐설폰)으로<br />만들었어요~!</strong>
          <span>의료기기에도 사용될 만큼 열과 충격에 매우 강합니다.<br />일상 소품뿐 아니라 변형이 없어서<br />정말 오래 쓰고 친환경적이에요.</span>
        </div>
      </article>

      <article className={styles.article2}>
        <div className={styles.articleText}>
          <p>“옥수수 전분에서 추출한 순수 식물성 PLA 소재”</p>
          <strong>옥수수 전분에서 추출한<br />PLA 소재를<br />친환경 이유식 식기,<br />치기 좋고 스푼·포크 등<br />아이의 입에 닿는 모든 것에..!</strong>
          <span>옥수수 전분 추출 starch(천분)에서 추출한 100% 식물성 소재입니다.<br />미세플라스틱이나 독성 물질 걱정이 없고<br />물에 묻어 간단히 헹궈도 깨끗이 잘 헹궈집니다.</span>
        </div>
        <img src="/img/cotti-plush17.png" alt="침대 위의 코티" />
        <img src="/img/cotti-plush18.png" alt="공놀이 중인 코티" />
      </article>

      <section className={styles.last}>
        <img src="/img/cotti-plush19.png" alt="마지막 배너(홈의)" />
      </section>
    </div>
  )
}

export default Home
