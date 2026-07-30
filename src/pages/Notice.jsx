import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNotices } from '../firebase/noticeApi'
import styles from './Notice.module.scss'

const PAGE_SIZE = 10
const formatDate = (timestamp) => timestamp?.toDate ? timestamp.toDate().toLocaleDateString('ko-KR') : '-'

const Notice = () => {
  const [notices, setNotices] = useState([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getNotices().then(setNotices).catch(() => setError('공지사항을 불러오지 못했습니다.')).finally(() => setIsLoading(false))
  }, [])

  const totalPages = Math.max(1, Math.ceil(notices.length / PAGE_SIZE))
  const pageNotices = useMemo(() => notices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [notices, page])

  return <main className={styles.page}>
    <header><p>NOTICE</p><h1>공지사항</h1><span>Flower Dance의 새로운 소식을 확인해 주세요.</span></header>
    {isLoading ? <p>공지사항을 불러오는 중입니다...</p> : error ? <p className={styles.error}>{error}</p> : notices.length === 0 ? <p className={styles.empty}>등록된 공지사항이 없습니다.</p> : <>
      <ul className={styles.list}>{pageNotices.map((notice) => <li key={notice.id}><Link to={`/notice/${notice.id}`}>{notice.title}</Link><time>{formatDate(notice.updateAt)}</time></li>)}</ul>
      <nav className={styles.pagination} aria-label='공지사항 페이지'>
        <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
        <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>‹</button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? styles.active : ''} onClick={() => setPage(number)}>{number}</button>)}
        <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>›</button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
      </nav>
    </>}
  </main>
}

export default Notice
