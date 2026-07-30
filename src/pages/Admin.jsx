import styles from './Admin.module.scss'
import { Link } from 'react-router-dom'

const Admin = () => {
  return (
    <main className={styles.page}>
      <section className={styles.adminLayout}>
        <aside className={styles.sidebar}>
          <p>ADMIN MENU</p>
          <Link className={styles.active} to='/admin'>대시보드</Link>
          <Link to='/admin/members'>회원 관리</Link>
          <Link to='/admin/products'>상품·재고 관리</Link>
          <Link to='/admin/recommended'>추천상품 관리</Link>
          <Link to='/admin/notices'>공지사항 관리</Link>
        </aside>
        <div className={styles.content}>
      <section className={styles.hero}>
        <p>ADMIN PAGE</p>
        <h1>관리자 대시보드</h1>
        <span>상품과 주문 관리 기능을 이곳에서 확인할 수 있습니다.</span>
      </section>

      <section className={styles.menu}>
        <article>
          <p>PRODUCT</p>
          <h2>상품 관리</h2>
          <span>상품 등록과 수정 기능이 연결될 영역입니다.</span>
          <Link to='/admin/products'>상품 관리로 이동</Link>
        </article>
        <article>
          <p>ORDER</p>
          <h2>주문 관리</h2>
          <span>주문 현황과 배송 처리 기능이 연결될 영역입니다.</span>
          <Link to='/mypage'>주문 내역 확인</Link>
        </article>
        <article>
          <p>MEMBER</p>
          <h2>회원 관리</h2>
          <span>회원 정보와 권한을 확인할 영역입니다.</span>
          <Link to='/mypage'>내 회원 정보</Link>
        </article>
      </section>
        </div>
      </section>
    </main>
  )
}

export default Admin
