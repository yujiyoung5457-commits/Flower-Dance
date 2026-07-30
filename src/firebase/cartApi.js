import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const ensureCartApiConfigured = () => {
  if (db) return

  const error = new Error('Firebase is not configured.')
  error.code = 'firebase/not-configured'
  throw error
}

const getUserCartItems = async (uid) => {
  ensureCartApiConfigured()

  const cartSnapshot = await getDocs(collection(db, 'carts', uid, 'items'))
  return cartSnapshot.docs.map((cartDocument) => ({
    id: cartDocument.id,
    ...cartDocument.data(),
  }))
}

const deleteUserCartItem = async (uid, itemId) => {
  ensureCartApiConfigured()
  await deleteDoc(doc(db, 'carts', uid, 'items', itemId))
}

const addUserCartItem = async (uid, product, quantity = 1) => {
  ensureCartApiConfigured()

  const itemId = String(product.id)
  const itemRef = doc(db, 'carts', uid, 'items', itemId)
  const productRef = doc(db, 'products', itemId)
  await runTransaction(db, async (transaction) => {
    const productSnapshot = await transaction.get(productRef)
    const itemSnapshot = await transaction.get(itemRef)
    const currentStock = Number(productSnapshot.data()?.stock ?? product.stock ?? 0)
    const nextQuantity = (itemSnapshot.data()?.quantity || 0) + quantity
    if (currentStock <= 0 || nextQuantity > currentStock) {
      const error = new Error('재고가 부족하여 장바구니에 담을 수 없습니다.')
      error.code = 'cart/insufficient-stock'
      throw error
    }

    transaction.set(itemRef, {
      productId: itemId,
      productName: product.name,
      name: product.name,
      image: product.image || '',
      category: product.category || '',
      price: Number(product.price || 0),
      discountRate: Number(product.discountRate || 0),
      quantity: nextQuantity,
      stock: currentStock,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  })
}

const updateUserCartItemQuantity = async (uid, itemId, quantity) => {
  ensureCartApiConfigured()
  await updateDoc(doc(db, 'carts', uid, 'items', String(itemId)), {
    quantity,
    updatedAt: serverTimestamp(),
  })
}

const clearUserCart = async (uid) => {
  ensureCartApiConfigured()
  const cartItems = await getUserCartItems(uid)
  await Promise.all(cartItems.map((item) => deleteUserCartItem(uid, item.id)))
}

export {
  addUserCartItem,
  clearUserCart,
  deleteUserCartItem,
  getUserCartItems,
  updateUserCartItemQuantity,
}
