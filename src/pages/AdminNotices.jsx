import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../firebase/firebase'
import { getNotices, removeNotice, saveNotice } from '../firebase/noticeApi'
import styles from './AdminProductManager.module.scss'

const PAGE_SIZE = 10
const EMPTY_FORM = { title: '', content: '' }

const AdminNotices = () => {
  const [notices, setNotices] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadNotices = async () => {
    setIsLoading(true)
    try {
      const items = await getNotices()
      setNotices(items)
      setPage((current) => Math.min(current, Math.max(1, Math.ceil(items.length / PAGE_SIZE))))
    } catch {
      setError('공지사항을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadNotices() }, [])

  const totalPages = Math.max(1, Math.ceil(notices.length / PAGE_SIZE))
  const pageNotices = useMemo(() => notices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [notices, page])

  const submitNotice = async (event) => {
    event.preventDefault()
    if (!auth?.currentUser) {
      setError('관리자 로그인이 필요합니다.')
      return
    }
    setIsSaving(true); setError(''); setMessage('')
    try {
      await saveNotice({ ...form, authorUid: auth.currentUser.uid }, editingId || undefined)
      setMessage(editingId ? '공지사항을 수정했습니다.' : '공지사항을 작성했습니다.')
      setForm(EMPTY_FORM); setEditingId('')
      await loadNotices()
    } catch (saveError) {
      setError(saveError?.code?.includes('permission-denied') ? '공지사항 작성 권한이 없습니다.' : '공지사항을 저장하지 못했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const startEdit = (notice) => {
    setEditingId(notice.id)
    setForm({ title: notice.title || '', content: notice.content || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteNotice = async (notice) => {
    if (!window.confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`)) return
    try {
      await removeNotice(notice.id)
      setNotices((items) => items.filter((item) => item.id !== notice.id))
      if (editingId === notice.id) { setEditingId(''); setForm(EMPTY_FORM) }
      setMessage('공지사항을 삭제했습니다.')
    } catch {
      setError('공지사항을 삭제할 권한이 없거나 삭제에 실패했습니다.')
    }
  }

  return <main className={styles.page}>
    <section className={styles.layout}>
      <aside className={styles.sidebar}>
        <p>ADMIN MENU</p>
        <Link to='/admin'>대시보드</Link><Link to='/admin/members'>회원 관리</Link>
        <Link to='/admin/products'>상품·재고 관리</Link><Link to='/admin/recommended'>추천상품 관리</Link>
        <Link className={styles.active} to='/admin/notices'>공지사항 관리</Link>
      </aside>
      <section className={styles.content}>
        <div className={styles.titleRow}><div><p>NOTICE MANAGEMENT</p><h1>공지사항 관리</h1></div></div>
        {error && <p className={styles.error}>{error}</p>}{message && <p className={styles.success}>{message}</p>}
        <form className={styles.form} onSubmit={submitNotice}>
          <h2>{editingId ? '공지사항 수정' : '공지사항 작성'}</h2>
          <label className={styles.full}>제목<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label className={styles.full}>내용<textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required /></label>
          <div className={styles.formActions}><button disabled={isSaving}>{isSaving ? '저장 중' : editingId ? '수정 저장' : '공지 등록'}</button>{editingId && <button type='button' onClick={() => { setEditingId(''); setForm(EMPTY_FORM) }}>수정 취소</button>}</div>
        </form>
        <section className={styles.productSection}>
          <h2>공지사항 {notices.length}개</h2>
          {isLoading ? <p>불러오는 중입니다...</p> : notices.length === 0 ? <p>등록된 공지사항이 없습니다.</p> : <>
            <ul className={styles.productList}>{pageNotices.map((notice) => <li key={notice.id}><div><strong>{notice.title}</strong><span>{notice.updateAt?.toDate?.().toLocaleString('ko-KR') || '저장 중'}</span></div><div className={styles.itemActions}><button onClick={() => startEdit(notice)}>수정</button><button onClick={() => deleteNotice(notice)}>삭제</button></div></li>)}</ul>
            <nav className={styles.pagination}>
              <button onClick={() => setPage(1)} disabled={page === 1}>«</button><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? styles.currentPage : ''} onClick={() => setPage(number)}>{number}</button>)}
              <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>›</button><button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </nav>
          </>}
        </section>
      </section>
    </section>
  </main>
}

export default AdminNotices
