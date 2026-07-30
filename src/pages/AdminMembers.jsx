import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminMembers } from '../firebase/adminApi'
import { getAuthErrorMessage } from '../firebase/authApi'
import styles from './AdminMembers.module.scss'

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return '가입일 정보 없음'
  return timestamp.toDate().toLocaleDateString('ko-KR')
}

const AdminMembers = () => {
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getAdminMembers()
      .then(setMembers)
      .catch((error) => setErrorMessage(getAuthErrorMessage(error)))
      .finally(() => setIsLoading(false))
  }, [])

  return <main className={styles.page}>
    <section className={styles.layout}>
      <aside className={styles.sidebar}>
        <p>ADMIN MENU</p>
        <Link to='/admin'>대시보드</Link>
        <Link className={styles.active} to='/admin/members'>회원 관리</Link>
        <Link to='/admin/products'>상품·재고 관리</Link>
        <Link to='/admin/recommended'>추천상품 관리</Link>
        <Link to='/admin/notices'>공지사항 관리</Link>
      </aside>
      <section className={styles.content}>
        <p>MEMBER MANAGEMENT</p>
        <h1>회원 관리</h1>
        {isLoading ? <p>회원 정보를 불러오는 중입니다...</p> : errorMessage ? <p className={styles.error}>{errorMessage}</p> : (
          <div className={styles.table}>
            <div className={styles.head}><b>닉네임</b><b>이메일</b><b>가입일</b></div>
            {members.map((member) => <div className={styles.row} key={member.id}><span>{member.nickname || '-'}</span><span>{member.email || '-'}</span><span>{formatDate(member.createAt)}</span></div>)}
          </div>
        )}
      </section>
    </section>
  </main>
}

export default AdminMembers
