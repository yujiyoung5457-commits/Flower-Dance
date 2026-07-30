import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const productsRef = () => collection(db, 'products')

const ensureDb = () => {
  if (db) return
  const error = new Error('Firebase is not configured.')
  error.code = 'firebase/not-configured'
  throw error
}

const normalizeProduct = (data) => ({
  name: String(data.name || '').trim(),
  category: String(data.category || '').trim(),
  categoryValue: String(data.categoryValue || '').trim(),
  price: Number(data.price),
  discountRate: Number(data.discountRate || 0),
  stock: Math.max(0, Math.trunc(Number(data.stock || 0))),
  lowStockThreshold: Math.max(0, Math.trunc(Number(data.lowStockThreshold ?? 5))),
  image: String(data.image || '').trim(),
  description: String(data.description || '').trim(),
  isRecommended: Boolean(data.isRecommended),
  ...(data.sourceId ? { sourceId: String(data.sourceId) } : {}),
})

const updateProductStock = async (id, stock) => {
  ensureDb()
  const nextStock = Number(stock)
  if (!Number.isInteger(nextStock) || nextStock < 0) {
    const error = new Error('재고는 0 이상의 정수만 입력할 수 있습니다.')
    error.code = 'product/invalid-stock'
    throw error
  }
  await updateDoc(doc(db, 'products', id), {
    stock: nextStock,
    updatedAt: serverTimestamp(),
  })
}

const updateProductRecommendation = async (id, isRecommended) => {
  ensureDb()
  await updateDoc(doc(db, 'products', id), {
    isRecommended: Boolean(isRecommended),
    updatedAt: serverTimestamp(),
  })
}

const getProducts = async () => {
  ensureDb()
  const snapshot = await getDocs(productsRef())
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
}

const subscribeProducts = (onProducts, onError) => {
  ensureDb()
  return onSnapshot(
    productsRef(),
    (snapshot) => {
      const products = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
      onProducts(products)
    },
    onError,
  )
}

const getProduct = async (id) => {
  ensureDb()
  const snapshot = await getDoc(doc(db, 'products', id))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

const saveProduct = async (data, id) => {
  ensureDb()
  const payload = { ...normalizeProduct(data), updatedAt: serverTimestamp() }
  if (id) {
    await updateDoc(doc(db, 'products', id), payload)
    return id
  }
  const saved = await addDoc(productsRef(), { ...payload, createdAt: serverTimestamp() })
  return saved.id
}

const removeProduct = async (id) => {
  ensureDb()
  await deleteDoc(doc(db, 'products', id))
}

const migrateProducts = async () => {
  ensureDb()
  const existing = await getProducts()
  const sourceIds = new Set(existing.map((item) => String(item.sourceId || '')))
  const response = await fetch('/data/products-fixed.json')
  if (!response.ok) throw new Error('Product JSON could not be loaded.')
  const items = await response.json()
  const migrationTargets = items.filter((item) => !sourceIds.has(String(item.id)))
  await Promise.all(migrationTargets.map((item) => saveProduct({
    ...item,
    sourceId: String(item.id),
    description: item.description || '',
    stock: item.stock || 0,
    lowStockThreshold: item.lowStockThreshold ?? 5,
    isRecommended: Boolean(item.isRecommended),
  })))
  return migrationTargets.length
}

export {
  getProduct,
  getProducts,
  migrateProducts,
  removeProduct,
  saveProduct,
  subscribeProducts,
  updateProductRecommendation,
  updateProductStock,
}
