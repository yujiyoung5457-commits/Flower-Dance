import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// 실제 값은 .env 파일에만 작성하고, Vite에서는 import.meta.env로 읽습니다.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const firebaseEnvironmentKeys = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
}

// 실제 값은 노출하지 않고, 설정되지 않은 변수 이름만 진단에 사용합니다.
const missingFirebaseEnvironmentKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => firebaseEnvironmentKeys[key])

// 환경변수가 없을 때도 Header 등 공통 UI가 흰 화면이 되지 않도록 초기화를 보류합니다.
const isFirebaseConfigured = missingFirebaseEnvironmentKeys.length === 0

// 개발 중 HMR로 모듈이 다시 실행되어도 Firebase App을 하나만 유지합니다.
const app = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null

const auth = app ? getAuth(app) : null
const db = app ? getFirestore(app) : null

export { app, auth, db, isFirebaseConfigured, missingFirebaseEnvironmentKeys }
