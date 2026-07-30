import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const ensureWishlistApiConfigured = () => {
  if (db) return
  const error = new Error('Firebase is not configured.')
  error.code = 'firebase/not-configured'
  throw error
}

const getUserWishlistItems = async (uid) => {
  ensureWishlistApiConfigured()
  const snapshot = await getDocs(collection(db, 'wishlists', uid, 'items'))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

const addUserWishlistItem = async (uid, product) => {
  ensureWishlistApiConfigured()
  const itemId = String(product.id)
  await setDoc(doc(db, 'wishlists', uid, 'items', itemId), {
    productId: itemId,
    name: product.name,
    image: product.image || '',
    category: product.category || '',
    price: Number(product.price || 0),
    discountRate: Number(product.discountRate || 0),
  })
}

const deleteUserWishlistItem = async (uid, itemId) => {
  ensureWishlistApiConfigured()
  await deleteDoc(doc(db, 'wishlists', uid, 'items', String(itemId)))
}

export { addUserWishlistItem, deleteUserWishlistItem, getUserWishlistItems }
