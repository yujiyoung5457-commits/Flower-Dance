import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import { getUserOrders } from '../firebase/orderApi'
import useAuthStore from '../store/authStore'
import { savePhotozoneArtwork } from '../utils/photozoneGalleryStorage'
import styles from './Photozone.module.scss'

const PHOTOZONE_MESSAGE_KEY = 'photozone-message'
const FRAME_COLORS = ['gold', 'brown', 'ivory', 'pink', 'mint']
const FRAME_FILTERS = {
  gold: 'sepia(0.35) saturate(1.1)',
  brown: 'sepia(0.7) saturate(0.8) brightness(0.75)',
  ivory: 'grayscale(0.5) sepia(0.2) brightness(1.2)',
  pink: 'sepia(0.2) saturate(0.7) hue-rotate(290deg) brightness(1.15)',
  mint: 'sepia(0.2) saturate(0.8) hue-rotate(120deg) brightness(1.05)',
}

const loadImage = (imageSource) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = reject
  image.src = imageSource
})

const createGalleryImage = async ({ imageSource, stickers, isFrameApplied, frameSource, frameColor, size }) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.min(1200, Math.max(1, Math.round(size.width * 2)))
  canvas.height = Math.min(1600, Math.max(1, Math.round(size.height * 2)))
  const context = canvas.getContext('2d')
  const photo = await loadImage(imageSource)
  const photoScale = Math.max(canvas.width / photo.naturalWidth, canvas.height / photo.naturalHeight)
  const photoWidth = photo.naturalWidth * photoScale
  const photoHeight = photo.naturalHeight * photoScale

  context.drawImage(photo, (canvas.width - photoWidth) / 2, (canvas.height - photoHeight) / 2, photoWidth, photoHeight)

  if (isFrameApplied) {
    const frame = await loadImage(frameSource)
    context.filter = FRAME_FILTERS[frameColor]
    context.drawImage(frame, 0, canvas.height * -0.02, canvas.width, canvas.height * 1.04)
    context.filter = 'none'
  }

  await Promise.all(stickers.map(async (sticker) => {
    const stickerImage = await loadImage(sticker.src)
    const stickerWidth = canvas.width * 0.18
    const stickerHeight = stickerWidth * (stickerImage.naturalHeight / stickerImage.naturalWidth)
    context.drawImage(
      stickerImage,
      (canvas.width * sticker.x) / 100 - stickerWidth / 2,
      (canvas.height * sticker.y) / 100 - stickerHeight / 2,
      stickerWidth,
      stickerHeight,
    )
  }))

  return canvas.toDataURL('image/jpeg', 0.86)
}

const getSavedMessage = () => {
  try {
    return localStorage.getItem(PHOTOZONE_MESSAGE_KEY) || ''
  } catch {
    return ''
  }
}

const Photozone = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const editingArtwork = state?.artwork
  const user = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const [message, setMessage] = useState(() => editingArtwork?.message || getSavedMessage())
  const [isSaved, setIsSaved] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(() => editingArtwork?.sourceImage || editingArtwork?.image || null)
  const [photoData, setPhotoData] = useState(() => editingArtwork?.sourceImage || editingArtwork?.image || null)
  const [isFrameApplied, setIsFrameApplied] = useState(() => editingArtwork?.isFrameApplied || false)
  const [frameSource, setFrameSource] = useState(() => editingArtwork?.frameSource || '/img/ack-01-01.svg')
  const [frameColor, setFrameColor] = useState(() => editingArtwork?.frameColor || 'gold')
  const [stickers, setStickers] = useState(() => editingArtwork?.stickers || [])
  const [isAccessNoticeOpen, setIsAccessNoticeOpen] = useState(false)
  const fileInputRef = useRef(null)
  const pictureRef = useRef(null)
  const draggingStickerId = useRef(null)

  useEffect(() => {
    if (!user) {
      setHasPurchased(false)
      return undefined
    }

    let isActive = true
    getUserOrders(user.uid)
      .then((orders) => { if (isActive) setHasPurchased(orders.length > 0) })
      .catch(() => { if (isActive) setHasPurchased(false) })
    return () => { isActive = false }
  }, [user])

  const canDecorate = isAdmin || hasPurchased === true

  useEffect(() => {
    if (hasPurchased !== null && !canDecorate) setIsAccessNoticeOpen(true)
  }, [canDecorate, hasPurchased])

  const saveMessage = () => {
    try {
      localStorage.setItem(PHOTOZONE_MESSAGE_KEY, message)
      setIsSaved(true)
    } catch {
      setIsSaved(false)
    }
  }

  const openPhotoPicker = () => {
    if (!canDecorate) {
      setIsAccessNoticeOpen(true)
      return
    }
    fileInputRef.current?.click()
  }

  const loadPhoto = (event) => {
    const [file] = event.target.files
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result)
      setPhotoData(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleFrameControls = (event) => {
    const index = Array.from(event.currentTarget.querySelectorAll('button')).indexOf(event.target)
    if (index === 5) {
      setIsFrameApplied(false)
      return
    }
    if (index >= 0) setFrameColor(FRAME_COLORS[index])
  }

  const saveArtwork = async (shareArtwork = false) => {
    if (!canDecorate || !photoData) return false

    let artwork = null
    try {
      const pictureBounds = pictureRef.current?.getBoundingClientRect()
      const galleryImage = await createGalleryImage({
        imageSource: photoData,
        stickers,
        isFrameApplied,
        frameSource,
        frameColor,
        size: pictureBounds || { width: 600, height: 800 },
      })
      artwork = {
        id: Date.now(),
        image: galleryImage,
        sourceImage: photoData,
        message,
        stickers,
        isFrameApplied,
        frameSource,
        frameColor,
      }
      const savedArtwork = { ...artwork, shared: shareArtwork }
      await savePhotozoneArtwork(savedArtwork)
      return savedArtwork
    } catch {
      return artwork ? { ...artwork, shared: shareArtwork } : false
    }
  }

  const handleActionButtons = async (event) => {
    const index = Array.from(event.currentTarget.querySelectorAll('button')).indexOf(event.target)
    if (index === 0) navigate('/gallery')
    if (index === 1) window.print()
    if (index === 2) {
      const artwork = await saveArtwork(true)
      if (artwork) navigate('/gallery', { state: { artwork } })
    }
    if (index === 3) {
      const artwork = await saveArtwork()
      if (artwork) navigate('/gallery', { state: { artwork } })
    }
  }

  const startEmojiDrag = (event) => {
    if (!canDecorate) {
      setIsAccessNoticeOpen(true)
      event.preventDefault()
      return
    }
    if (event.target.tagName !== 'IMG') return
    event.dataTransfer.setData('application/photozone-emoji', event.target.currentSrc)
  }

  const placeEmoji = (event) => {
    event.preventDefault()
    if (!canDecorate) {
      setIsAccessNoticeOpen(true)
      return
    }
    if (!photoUrl) return

    const emojiSrc = event.dataTransfer.getData('application/photozone-emoji')
    if (!emojiSrc) return

    const pictureBounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - pictureBounds.left) / pictureBounds.width) * 100
    const y = ((event.clientY - pictureBounds.top) / pictureBounds.height) * 100

    setStickers((currentStickers) => [...currentStickers, {
      id: `${Date.now()}-${currentStickers.length}`,
      src: emojiSrc,
      x,
      y,
    }])
  }

  const startStickerDrag = (event, stickerId) => {
    event.stopPropagation()
    draggingStickerId.current = stickerId
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveSticker = (event) => {
    if (!draggingStickerId.current) return

    const pictureBounds = pictureRef.current.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((event.clientX - pictureBounds.left) / pictureBounds.width) * 100))
    const y = Math.min(100, Math.max(0, ((event.clientY - pictureBounds.top) / pictureBounds.height) * 100))

    setStickers((currentStickers) => currentStickers.map((sticker) => (
      sticker.id === draggingStickerId.current ? { ...sticker, x, y } : sticker
    )))
  }

  const endStickerDrag = () => {
    draggingStickerId.current = null
  }

  if (user && hasPurchased === null) return <Loading>구매 이력을 확인하고 있습니다...</Loading>

  return (
  <section className={styles.root}>
    <div className={styles.imoji}>
       <span>~이모티콘 장식~</span>
       <div className={styles.imjArea} onDragStart={startEmojiDrag}>
        <img src="/img/imj01.png" alt="이모티콘" />
        <img src="/img/imj02.png" alt="이모티콘" />
        <img src="/img/imj03.png" alt="이모티콘" />
        <img src="/img/imj04.png" alt="이모티콘" />
        <img src="/img/imj05.png" alt="이모티콘" />
        <img src="/img/imj06.png" alt="이모티콘" />
        <img src="/img/imj07.png" alt="이모티콘" />
        <img src="/img/imj08.png" alt="이모티콘" />
        <img src="/img/imj09.png" alt="이모티콘" />
        <img src="/img/imj10.png" alt="이모티콘" />
        <img src="/img/imj11.png" alt="이모티콘" />
        <img src="/img/imj12.png" alt="이모티콘" />
       </div>
    </div>
{/* ---------- */}
    <div ref={pictureRef} className={styles.picture} onClick={openPhotoPicker} onPointerMove={moveSticker} onPointerUp={endStickerDrag} onDragOver={(event) => event.preventDefault()} onDrop={placeEmoji} role='button' tabIndex='0' onKeyDown={(event) => event.key === 'Enter' && openPhotoPicker()}>
        <input ref={fileInputRef} className={styles.fileInput} type='file' accept='image/*' onChange={loadPhoto} />
        {photoUrl && <img className={styles.photoPreview} src={photoUrl} alt='선택한 사진' />}
        {stickers.map((sticker) => (
          <img
            key={sticker.id}
            className={styles.sticker}
            src={sticker.src}
            alt='배치한 이모티콘'
            style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
            onPointerDown={(event) => startStickerDrag(event, sticker.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ))}
        {photoUrl && isFrameApplied && <img className={styles.framePreview} src={frameSource} alt='' style={{ filter: FRAME_FILTERS[frameColor] }} />}
        <span>사진 불러오기 <br /> click!</span>
    </div>
{/* ---------- */}
    <article className={styles.art}>
        <div className={styles.artArea}>
            <div className={styles.ack} onClick={(event) => {
              if (!canDecorate) return setIsAccessNoticeOpen(true)
              if (event.target.tagName === 'IMG') setFrameSource(event.target.currentSrc)
              setIsFrameApplied(true)
            }}>
                <img src="/img/1.svg" alt="액자" />
                <img src="/img/2.svg" alt="액자" />
                <img src="/img/3.svg" alt="액자" />
                <img src="/img/4.svg" alt="액자" />
            </div>
            <div className={styles.ackBTN} onClick={(event) => canDecorate ? handleFrameControls(event) : setIsAccessNoticeOpen(true)}>
                <button></button>
                <button></button>
                <button></button>
                <button></button>
                <button></button>
                <button>액자 지우기</button>
            </div>
            <span>액자의 색을 바꿔 보세요!</span>
        </div>
        <div className={styles.txtArea}>
          <textarea
            value={message}
            disabled={!canDecorate}
            onChange={(event) => {
              setMessage(event.target.value)
              setIsSaved(false)
            }}
            placeholder='하고싶은 말 적기!'
            aria-label='하고 싶은 말 입력'
          />
          <button type='button' hidden onClick={canDecorate ? saveMessage : () => setIsAccessNoticeOpen(true)}>
            {isSaved ? '저장됨' : '저장'}
          </button>
        </div>
    </article>
{/* ---------- */}
    <div className={styles.buttons} onClick={handleActionButtons}>
    <button>갤러리로 가기</button>
    <button>인쇄하기(pdf)</button>
    <button>자랑하기♥</button>
    <button>저장하기</button>
    </div>
    {isAccessNoticeOpen && (
      <div className={styles.accessNotice} role='alertdialog' aria-modal='true'>
        <p>구매를 하시면<br />사진을 꾸밀 수 있어요~!</p>
        <button type='button' onClick={() => setIsAccessNoticeOpen(false)}>알겠어요 ♡</button>
      </div>
    )}
  </section>
  )
}

export default Photozone
