import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import styles from './Login.module.scss'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore((state) => state.login)
  const errorMessage = useAuthStore((state) => state.error)
  const isSubmitting = useAuthStore((state) => state.loading)

  const submitLogin = async (event) => {
    event.preventDefault()
    const isLoggedIn = await login(email, password)
    if (isLoggedIn) {
      navigate('/')
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.loginArea}>
        <h1>LOGIN</h1>

        <form className={styles.form} onSubmit={submitLogin}>
          <input
            type='email'
            value={email}
            placeholder='이메일을 입력해 주세요'
            aria-label='이메일'
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            type='password'
            value={password}
            placeholder='비밀번호를 입력해 주세요'
            aria-label='비밀번호'
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {errorMessage && <p className={styles.errorMessage} role='alert'>{errorMessage}</p>}
          <button className={styles.loginButton} type='submit' disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className={styles.socials} aria-label='소셜 로그인'>
          <button className={`${styles.socialButton} ${styles.naver}`} aria-label='네이버 로그인'>N</button>
          <button className={`${styles.socialButton} ${styles.google}`} aria-label='구글 로그인'>
            <img src='/img/google.png' alt='구글' />
          </button>
          <button className={`${styles.socialButton} ${styles.facebook}`} aria-label='페이스북 로그인'>f</button>
          <button className={`${styles.socialButton} ${styles.kakao}`} aria-label='카카오 로그인'>k</button>
          <button className={`${styles.socialButton} ${styles.apple}`} aria-label='애플 로그인'>
            <img src='/img/apple.png' alt='애플' />
          </button>
        </div>

        <p className={styles.signupText}>
          아직 회원이 아니신가요? <Link to='/signup'>회원가입 바로가기</Link>
        </p>
      </section>

      <div className={styles.characterArea}>
        <img src='/img/cotti-plush01.png' alt='꽃을 들고 있는 강아지 캐릭터' />
      </div>
    </main>
  )
}

export default Login
