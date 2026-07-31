import styles from './ScrollButtons.module.scss'

const ScrollButtons = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  return (
    <div className={styles.buttons} aria-label='페이지 이동'>
      <button type='button' onClick={scrollToTop}>TOP</button>
      <button type='button' onClick={scrollToBottom} aria-label='페이지 아래로 이동'>▼</button>
    </div>
  )
}

export default ScrollButtons
