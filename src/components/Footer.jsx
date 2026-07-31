import React from 'react'
import styles from './Footer.module.scss'

const Footer = () => {
  return (
    <footer>
      {/* 왼쪽 */}
      <div className={styles.left}>
        <img src="/img/logo.svg" alt="로고 이미지" />
        <div className={styles.menu}>
          <div className={styles.one}>
            <h2>아이와 반려 동물이 함께 쓸 수 있는 제품</h2>
            <h2><strong>플라워 댄스가 만듭니다.</strong></h2>
          </div>
          <div className={styles.two}>
            <Link to='/products'>전체상품</Link>
            <Link to='/loadmap'>오시는길</Link>
            <Link to='/products'>학생 포트폴리오</Link>
            <Link to='/products'>비상업적 포폴입니다</Link>
          </div>
            <br /><br />
          <div className={styles.three}>
            본 사이트는 비상업적 포트폴리오 용도로 작성되었습니다.
            <br />
모든 이미지 및 콘텐츠의 저작권은 제작자에게 있으며, 허가 없는 무단 도용 및 사용을 금합니다.
          </div>
        </div>
      </div>

      {/* 오른쪽 */}
      <div className={styles.right}>
        
      </div>
    </footer>
  )
}

export default Footer



