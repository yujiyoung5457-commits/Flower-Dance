import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const noticesRef = () => collection(db, 'notices')
const ensureConfigured = () => {
  if (db) return
  const error = new Error('Firebase가 설정되지 않았습니다.')
  error.code = 'firebase/not-configured'
  throw error
}
const sortLatest = (items) => items.sort(
  (a, b) => (b.updateAt?.toMillis?.() || 0) - (a.updateAt?.toMillis?.() || 0),
)

const getNotices = async () => {
  ensureConfigured()
  const snapshot = await getDocs(noticesRef())
  return sortLatest(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
}
const getNotice = async (id) => {
  ensureConfigured()
  const snapshot = await getDoc(doc(db, 'notices', id))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}
const saveNotice = async ({ title, content, authorUid }, id) => {
  ensureConfigured()
  const payload = {
    title: String(title || '').trim(),
    content: String(content || '').trim(),
    authorUid: String(authorUid || ''),
    updateAt: serverTimestamp(),
  }
  if (id) {
    await updateDoc(doc(db, 'notices', id), payload)
    return id
  }
  const saved = await addDoc(noticesRef(), payload)
  return saved.id
}
const removeNotice = async (id) => {
  ensureConfigured()
  await deleteDoc(doc(db, 'notices', id))
}

export { getNotice, getNotices, removeNotice, saveNotice }
