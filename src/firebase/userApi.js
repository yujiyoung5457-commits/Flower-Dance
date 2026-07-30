import { doc, getDoc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { auth, db } from './firebase'

const ensureUserApiConfigured = () => {
  if (auth && db) return

  const error = new Error('Firebase is not configured.')
  error.code = 'firebase/not-configured'
  throw error
}

const getUserProfile = async (uid) => {
  ensureUserApiConfigured()

  const userSnapshot = await getDoc(doc(db, 'users', uid))
  if (!userSnapshot.exists()) {
    const error = new Error('User profile does not exist.')
    error.code = 'user/profile-not-found'
    throw error
  }

  return userSnapshot.data()
}

const getOrCreateUserProfile = async (user) => {
  ensureUserApiConfigured()

  const userRef = doc(db, 'users', user.uid)
  const profile = await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef)
    if (userSnapshot.exists()) {
      return userSnapshot.data()
    }

    const nickname = user.displayName || user.email?.split('@')[0] || '회원'
    transaction.set(userRef, {
      email: user.email,
      nickname,
      role: 'user',
      createAt: serverTimestamp(),
    })

    return null
  })

  // 새 문서는 serverTimestamp()가 반영된 값을 다시 읽어 반환합니다.
  if (profile) return profile

  const createdSnapshot = await getDoc(userRef)
  if (!createdSnapshot.exists()) {
    const error = new Error('User profile could not be created.')
    error.code = 'user/profile-create-failed'
    throw error
  }

  return createdSnapshot.data()
}

const getUser = (user) => getOrCreateUserProfile(user)

const updateUserNickname = async (uid, nickname) => {
  ensureUserApiConfigured()

  await updateDoc(doc(db, 'users', uid), { nickname })

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: nickname })
  }
}

export { getOrCreateUserProfile, getUser, getUserProfile, updateUserNickname }
