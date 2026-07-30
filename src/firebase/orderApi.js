import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'

const ensureOrderApiConfigured = () => {
  if (db) return

  const error = new Error('Firebase is not configured.')
  error.code = 'firebase/not-configured'
  throw error
}

const getOrderTimestamp = (createAt) => (createAt?.toMillis ? createAt.toMillis() : 0)

const getUserOrders = async (uid) => {
  ensureOrderApiConfigured()

  const ordersQuery = query(
    collection(db, 'orders'),
    where('userId', '==', uid),
  )
  const orderSnapshot = await getDocs(ordersQuery)

  return orderSnapshot.docs
    .map((orderDocument) => ({ id: orderDocument.id, ...orderDocument.data() }))
    .sort((firstOrder, secondOrder) => getOrderTimestamp(secondOrder.createAt) - getOrderTimestamp(firstOrder.createAt))
}

export { getUserOrders }
