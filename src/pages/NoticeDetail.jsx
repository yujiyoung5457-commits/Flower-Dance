import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getNotice } from '../firebase/noticeApi'
import styles from './NoticeDetail.module.scss'

const NoticeDetail = () => {
  const { id } = useParams()
  const [notice, setNotice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    getNotice(id).then((item) => item ? setNotice(item) : setError('공지사항을 찾을 수 없습니다.')).catch(() => setError('공지사항을 불러오지 못했습니다.')).finally(() => setIsLoading(false))
  }, [id])
  if (isLoading) return <main className={styles.page}><p>공지사항을 불러오는 중입니다...</p></main>
  if (error) return <main className={styles.page}><p>{error}</p><Link to='/notice'>목록으로</Link></main>
  return <main className={styles.page}>
    <p className={styles.eyebrow}>NOTICE</p><h1>{notice.title}</h1>
    <time>{notice.updateAt?.toDate?.().toLocaleString('ko-KR') || '-'}</time>
    <article>{notice.content}</article>
    <Link className={styles.back} to='/notice'>공지사항 목록으로</Link>
  </main>
}

export default NoticeDetail
