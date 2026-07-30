import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import styles from './Login.module.scss'

const SignUp = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const signUp = useAuthStore((state) => state.signUp)
  const errorMessage = useAuthStore((state) => state.error)
  const isSubmitting = useAuthStore((state) => state.loading)

  const submitSignup = async (event) => {
    event.preventDefault()
    const isSignedUp = await signUp(email, password, nickname)
    if (isSignedUp) {
      navigate('/')
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.loginArea}>
        <h1>SIGN UP</h1>

        <form className={styles.form} onSubmit={submitSignup}>
          <input
            type='text'
            value={nickname}
            placeholder='닉네임을 입력해 주세요'
            aria-label='닉네임'
            onChange={(event) => setNickname(event.target.value)}
            required
          />
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
            placeholder='비밀번호는 6자 이상 입력해 주세요'
            aria-label='비밀번호'
            minLength='6'
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {errorMessage && <p className={styles.errorMessage} role='alert'>{errorMessage}</p>}
          <button className={styles.loginButton} type='submit' disabled={isSubmitting}>
            {isSubmitting ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <div className={styles.socials} aria-label='소셜 회원가입'>
          <button className={`${styles.socialButton} ${styles.naver}`} aria-label='네이버 회원가입'>N</button>
          <button className={`${styles.socialButton} ${styles.google}`} aria-label='구글 회원가입'>
            <img src='/img/google.png' alt='' />
          </button>
          <button className={`${styles.socialButton} ${styles.facebook}`} aria-label='페이스북 회원가입'>f</button>
          <button className={`${styles.socialButton} ${styles.kakao}`} aria-label='카카오 회원가입'>k</button>
          <button className={`${styles.socialButton} ${styles.apple}`} aria-label='애플 회원가입'>
            <img src='/img/apple.png' alt='' />
          </button>
        </div>

        <p className={styles.signupText}>
          이미 회원이신가요? <Link to='/login'>로그인 바로가기</Link>
        </p>
      </section>

      <div className={styles.characterArea}>
        <img src='/img/cotti-plush02.png' alt='Flower Dance 로고' />
      </div>
    </main>
  )
}

export default SignUp
