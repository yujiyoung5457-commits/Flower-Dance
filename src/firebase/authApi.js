import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import { auth, missingFirebaseEnvironmentKeys } from './firebase'

const ensureFirebaseConfigured = () => {
  if (auth) return

  const error = new Error('Firebase is not configured.')
  error.code = 'firebase/not-configured'
  error.missingKeys = missingFirebaseEnvironmentKeys
  throw error
}

const signUpWithEmail = async ({ email, password, nickname }) => {
  ensureFirebaseConfigured()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const { user } = credential

  await updateProfile(user, { displayName: nickname })

  return user
}

const loginWithEmail = async ({ email, password }) => {
  ensureFirebaseConfigured()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

const logout = () => {
  ensureFirebaseConfigured()
  return signOut(auth)
}

const updateCurrentUserPassword = async ({ currentPassword, newPassword }) => {
  ensureFirebaseConfigured()

  const currentUser = auth.currentUser
  if (!currentUser?.email) {
    const error = new Error('No authenticated user.')
    error.code = 'auth/no-current-user'
    throw error
  }

  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
  await reauthenticateWithCredential(currentUser, credential)
  await updatePassword(currentUser, newPassword)
}

const subscribeAuthState = (callback) => {
  if (!auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}

const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return '이미 가입된 이메일입니다.'
    case 'auth/invalid-email':
      return '이메일 형식을 확인해 주세요.'
    case 'auth/weak-password':
      return '비밀번호는 6자 이상으로 입력해 주세요.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    case 'auth/too-many-requests':
      return '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.'
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해 주세요.'
    case 'auth/operation-not-allowed':
      return 'Firebase Console에서 이메일/비밀번호 로그인을 활성화해 주세요.'
    case 'auth/requires-recent-login':
      return '보안을 위해 다시 로그인한 후 비밀번호를 변경해 주세요.'
    case 'auth/no-current-user':
      return '로그인 정보를 다시 확인해 주세요.'
    case 'user/profile-not-found':
      return '회원 정보 문서를 찾을 수 없습니다. 회원가입 상태를 확인해 주세요.'
    case 'user/profile-create-failed':
      return '기본 회원 정보를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.'
    case 'firebase/not-configured':
      return `Firebase 설정을 확인해 주세요: ${error.missingKeys.join(', ')}`
    case 'permission-denied':
    case 'firestore/permission-denied':
      return '회원 정보 저장 권한이 없습니다. 보안 규칙을 확인해 주세요.'
    default:
      return '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }
}

const getAuthErrorMessageKorean = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return '이미 가입된 이메일입니다.'
    case 'auth/invalid-email':
      return '이메일 형식을 확인해 주세요.'
    case 'auth/weak-password':
      return '비밀번호는 6자 이상으로 입력해 주세요.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    case 'auth/too-many-requests':
      return '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.'
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해 주세요.'
    case 'auth/operation-not-allowed':
      return 'Firebase Console에서 이메일/비밀번호 로그인을 활성화해 주세요.'
    case 'auth/requires-recent-login':
      return '보안을 위해 다시 로그인한 후 비밀번호를 변경해 주세요.'
    case 'auth/no-current-user':
      return '로그인 정보를 다시 확인해 주세요.'
    case 'user/profile-not-found':
      return '회원 정보 문서를 찾을 수 없습니다. 회원가입 상태를 확인해 주세요.'
    case 'user/profile-create-failed':
      return '기본 회원 정보를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.'
    case 'firebase/not-configured':
      return `Firebase 설정을 확인해 주세요. ${error.missingKeys?.join(', ') || ''}`
    case 'permission-denied':
    case 'firestore/permission-denied':
      return '회원 정보 접근 권한이 없습니다. 보안 규칙을 확인해 주세요.'
    default:
      return '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }
}

export {
  getAuthErrorMessageKorean as getAuthErrorMessage,
  loginWithEmail,
  logout,
  signUpWithEmail,
  subscribeAuthState,
  updateCurrentUserPassword,
}
