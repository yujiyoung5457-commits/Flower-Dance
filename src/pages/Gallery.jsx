import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Gallery.module.scss'
import {
  deletePhotozoneArtwork,
  getPhotozoneArtworks,
  updatePhotozoneArtwork,
} from '../utils/photozoneGalleryStorage'

const truncateMessage = (message) => {
  if (!message) return '작성한 메시지가 없습니다.'
  return message.length > 28 ? `${message.slice(0, 28)}...` : message
}

const includePendingArtwork = (items, pendingArtwork) => {
  if (!pendingArtwork || items.some((item) => item.id === pendingArtwork.id)) return items
  return [pendingArtwork, ...items]
}

const Gallery = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [galleryItems, setGalleryItems] = useState([])
  const [sharedItems, setSharedItems] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingMessage, setEditingMessage] = useState('')
  const [personalPage, setPersonalPage] = useState(1)
  const galleryDragRef = useRef(null)
  const personalPageSize = 12
  const totalPersonalPages = Math.max(1, Math.ceil(galleryItems.length / personalPageSize))
  const activePersonalPage = Math.min(personalPage, totalPersonalPages)
  const visibleGalleryItems = galleryItems.slice(
    (activePersonalPage - 1) * personalPageSize,
    activePersonalPage * personalPageSize,
  )

  useEffect(() => {
    Promise.all([getPhotozoneArtworks(), getPhotozoneArtworks(true)])
      .then(([personalItems, sharedArtworkItems]) => {
        const pendingArtwork = state?.artwork
        setGalleryItems(includePendingArtwork(personalItems, pendingArtwork))
        setSharedItems(includePendingArtwork(sharedArtworkItems, pendingArtwork?.shared ? pendingArtwork : null))
      })
      .catch(() => {
        setGalleryItems([])
        setSharedItems([])
      })
  }, [state])

  const deleteArtwork = (id) => {
    deletePhotozoneArtwork(id)
      .then(() => {
        setGalleryItems((items) => items.filter((item) => item.id !== id))
        setSharedItems((items) => items.filter((item) => item.id !== id))
      })
  }

  const startEdit = (item) => {
    navigate('/photozone', { state: { artwork: item } })
  }

  const saveEdit = (id) => {
    updatePhotozoneArtwork(id, editingMessage)
      .then(() => {
        const updateMessage = (items) => items.map((item) => (
          item.id === id ? { ...item, message: editingMessage } : item
        ))
        setGalleryItems(updateMessage)
        setSharedItems(updateMessage)
        setEditingId(null)
      })
  }

  const startGalleryDrag = (event) => {
    if (event.button !== 0) return
    galleryDragRef.current = { startX: event.clientX, startScrollLeft: event.currentTarget.scrollLeft }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveGalleryDrag = (event) => {
    if (!galleryDragRef.current) return
    const distance = event.clientX - galleryDragRef.current.startX
    if (Math.abs(distance) > 3) event.preventDefault()
    event.currentTarget.scrollLeft = galleryDragRef.current.startScrollLeft - distance
  }

  const endGalleryDrag = () => {
    galleryDragRef.current = null
  }

  return (
    <main className={styles.page}>
      <h1>Gallery</h1>
      <section className={styles.shared}>
        <p className={styles.shareTitle}>~ 자랑할게요 ~</p>
        <h2>공유 페이지</h2>
        <p>자랑하기로 공유한 사진이에요.</p>
        <div className={`${styles.grid} ${styles.gallerySlider}`} onPointerDown={startGalleryDrag} onPointerMove={moveGalleryDrag} onPointerUp={endGalleryDrag} onPointerCancel={endGalleryDrag}>
          {sharedItems.map((item) => (
            <article className={styles.card} key={item.id}>
              <img src={item.image} alt='공유한 포토존 사진' />
              <p>{truncateMessage(item.message)}</p>
            </article>
          ))}
        </div>
        {sharedItems.length === 0 && <p className={styles.empty}>아직 공유된 사진이 없습니다.</p>}
      </section>
      <section className={styles.personal}>
        <h2>나의 사진 보관함</h2>
      <section className={`${styles.grid} ${styles.personalGrid}`}>
        {visibleGalleryItems.map((item) => (
          <article className={styles.card} key={item.id}>
            <img src={item.image} alt='저장한 포토존 사진' />
            {editingId === item.id ? (
              <input
                value={editingMessage}
                onChange={(event) => setEditingMessage(event.target.value)}
                aria-label='메모 수정'
              />
            ) : <p>{truncateMessage(item.message)}</p>}
            <div className={styles.cardActions}>
              {editingId === item.id ? (
                <button type='button' onClick={() => saveEdit(item.id)}>저장</button>
              ) : (
                <button type='button' onClick={() => startEdit(item)}>수정</button>
              )}
              <button type='button' onClick={() => deleteArtwork(item.id)}>삭제</button>
            </div>
          </article>
        ))}
      </section>
      {galleryItems.length === 0 && <p className={styles.empty}>저장된 사진이 없습니다.</p>}
      {totalPersonalPages > 1 && (
        <nav className={styles.pagination} aria-label='개인 사진 보관함 페이지'>
          <button type='button' onClick={() => setPersonalPage((page) => Math.max(1, page - 1))} disabled={activePersonalPage === 1}>&lt;&lt;</button>
          {Array.from({ length: totalPersonalPages }, (_, index) => index + 1).map((page) => (
            <button
              type='button'
              key={page}
              className={page === activePersonalPage ? styles.activePage : ''}
              onClick={() => setPersonalPage(page)}
            >
              {page}
            </button>
          ))}
          <button type='button' onClick={() => setPersonalPage((page) => Math.min(totalPersonalPages, page + 1))} disabled={activePersonalPage === totalPersonalPages}>&gt;&gt;</button>
        </nav>
      )}
      </section>
      <Link to='/photozone' className={styles.back}>Photozone으로 돌아가기</Link>
    </main>
  )
}

export default Gallery
