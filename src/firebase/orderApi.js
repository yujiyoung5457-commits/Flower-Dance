import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
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

const createOrder = async ({ uid, items, paymentMethod, subtotal, deliveryFee, totalPrice }) => {
  ensureOrderApiConfigured()

  const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
  const firstProductName = items[0]?.name || items[0]?.productName || '상품'
  const productName = items.length > 1
    ? `${firstProductName} 외 ${items.length - 1}개`
    : firstProductName

  const savedOrder = await addDoc(collection(db, 'orders'), {
    userId: uid,
    productName,
    quantity,
    subtotal: Number(subtotal || 0),
    deliveryFee: Number(deliveryFee || 0),
    totalPrice: Number(totalPrice || 0),
    paymentMethod,
    status: '결제완료',
    items: items.map((item) => ({
      productId: String(item.id || item.productId || ''),
      name: item.name || item.productName || '상품',
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      discountRate: Number(item.discountRate || 0),
    })),
    createAt: serverTimestamp(),
  })

  return savedOrder.id
}

export { createOrder, getUserOrders }
