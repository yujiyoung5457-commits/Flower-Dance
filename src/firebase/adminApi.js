import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from './firebase'

const getAdminMembers = async () => {
  if (!db) {
    const error = new Error('Firebase is not configured.')
    error.code = 'firebase/not-configured'
    throw error
  }

  const memberSnapshot = await getDocs(query(collection(db, 'users'), orderBy('createAt', 'desc')))
  return memberSnapshot.docs.map((member) => ({ id: member.id, ...member.data() }))
}

export { getAdminMembers }
