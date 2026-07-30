import { useEffect, useState } from 'react'
import styles from './IntroVideo.module.scss'

const IntroVideo = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  // ?곸긽??湲몃뜲 ?뺤? ?붽컙???놁쓽 ?곸긽??5珥??덈줈 醫낅즺?⑸땲??
  useEffect(() => {
    const fadeTimeoutId = window.setTimeout(() => setIsFadingOut(true), 4000)
    const timeoutId = window.setTimeout(onFinish, 5000)
    return () => {
      window.clearTimeout(fadeTimeoutId)
      window.clearTimeout(timeoutId)
    }
  }, [onFinish])

  return (
    <div className={`${styles.intro} ${isFadingOut ? styles.fadeOut : ''}`}>
      <img
        className={styles.coverLogo}
        src='/logo(movie).svg'
        alt='영상 로고 가림'
      />
      <video
        className={styles.video}
        src='/img/movie01.mp4'
        autoPlay
        muted
        playsInline
        preload='auto'
        onCanPlay={(event) => {
          event.currentTarget.play().catch(onFinish)
        }}
        onEnded={onFinish}
        onError={onFinish}
      />
    </div>
  )
}

export default IntroVideo
