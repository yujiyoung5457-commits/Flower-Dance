import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getProducts,
  migrateProducts,
  removeProduct,
  saveProduct,
  updateProductRecommendation,
  updateProductStock,
} from '../firebase/productApi'
import styles from './AdminProductManager.module.scss'

const PAGE_SIZE = 10
const MAX_RECOMMENDED_PRODUCTS = 400
const EMPTY_FORM = {
  name: '', category: '', categoryValue: '', price: '', discountRate: '0',
  stock: '0', lowStockThreshold: '5', image: '', description: '', isRecommended: false,
}

const koreanError = (error, action) => {
  if (error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied') {
    return `${action} 권한이 없습니다. 관리자 계정과 Firestore 보안 규칙을 확인해 주세요.`
  }
  if (error?.code === 'product/invalid-stock') return error.message
  return `${action} 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`
}

const getStockStatus = (product) => {
  const stock = Number(product.stock || 0)
  const threshold = Number(product.lowStockThreshold ?? 5)
  if (stock === 0) return { text: '품절', className: styles.soldOut }
  if (stock <= threshold) return { text: '품절 임박', className: styles.lowStock }
  return { text: '판매 중', className: styles.inStock }
}

const AdminProductManager = () => {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [stockSavingId, setStockSavingId] = useState('')
  const [recommendSavingId, setRecommendSavingId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const nextProducts = await getProducts()
      setProducts(nextProducts)
      setPage((current) => Math.min(current, Math.max(1, Math.ceil(nextProducts.length / PAGE_SIZE))))
    } catch (loadError) {
      setError(koreanError(loadError, '상품 조회'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const pageProducts = useMemo(
    () => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, products],
  )
  const recommendedCount = products.filter((product) => product.isRecommended).length

  const updateField = ({ target }) => {
    const { name, value, checked, type } = target
    if ((name === 'stock' || name === 'lowStockThreshold') && value !== '' && !/^\d+$/.test(value)) return
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
  }

  const resetForm = () => { setForm(EMPTY_FORM); setEditingId('') }

  const submitProduct = async (event) => {
    event.preventDefault()
    const editingProduct = products.find((product) => product.id === editingId)
    const addsRecommendation = form.isRecommended && !editingProduct?.isRecommended
    if (addsRecommendation && recommendedCount >= MAX_RECOMMENDED_PRODUCTS) {
      setError(`추천상품은 최대 ${MAX_RECOMMENDED_PRODUCTS}개까지만 설정할 수 있습니다.`)
      return
    }
    setBusy(true); setError(''); setMessage('')
    try {
      await saveProduct(form, editingId || undefined)
      setMessage(editingId ? '상품을 수정했습니다.' : '상품을 등록했습니다.')
      resetForm()
      await loadProducts()
    } catch (saveError) {
      setError(koreanError(saveError, editingId ? '상품 수정' : '상품 등록'))
    } finally { setBusy(false) }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name || '', category: product.category || '',
      categoryValue: product.categoryValue || '', price: String(product.price ?? ''),
      discountRate: String(product.discountRate ?? 0), stock: String(product.stock ?? 0),
      lowStockThreshold: String(product.lowStockThreshold ?? 5), image: product.image || '',
      description: product.description || '', isRecommended: Boolean(product.isRecommended),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const changeStock = async (product, value) => {
    if (value === '' || !/^\d+$/.test(value)) return
    const stock = Number(value)
    setStockSavingId(product.id); setError(''); setMessage('')
    try {
      await updateProductStock(product.id, stock)
      setProducts((items) => items.map((item) => item.id === product.id ? { ...item, stock } : item))
      setMessage(`${product.name} 재고를 ${stock}개로 저장했습니다.`)
    } catch (stockError) {
      setError(koreanError(stockError, '재고 저장'))
    } finally { setStockSavingId('') }
  }

  const toggleRecommendation = async (product) => {
    const nextRecommended = !product.isRecommended
    if (nextRecommended && recommendedCount >= MAX_RECOMMENDED_PRODUCTS) {
      setError(`추천상품은 최대 ${MAX_RECOMMENDED_PRODUCTS}개까지만 설정할 수 있습니다.`)
      setMessage('')
      return
    }
    setRecommendSavingId(product.id); setError(''); setMessage('')
    try {
      await updateProductRecommendation(product.id, nextRecommended)
      setProducts((items) => items.map((item) =>
        item.id === product.id ? { ...item, isRecommended: nextRecommended } : item
      ))
      setMessage(nextRecommended ? `${product.name}을(를) 추천상품으로 설정했습니다.` : `${product.name}의 추천을 해제했습니다.`)
    } catch (recommendError) {
      setError(koreanError(recommendError, '추천상품 변경'))
    } finally {
      setRecommendSavingId('')
    }
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) return
    try {
      await removeProduct(product.id)
      setProducts((items) => items.filter((item) => item.id !== product.id))
      setMessage('상품을 삭제했습니다.')
    } catch (deleteError) { setError(koreanError(deleteError, '상품 삭제')) }
  }

  const migrateJson = async () => {
    if (!window.confirm('기존 JSON 상품을 Firestore로 옮기시겠습니까?')) return
    setBusy(true); setError('')
    try {
      const count = await migrateProducts()
      setMessage(`${count}개 상품을 마이그레이션했습니다.`)
      await loadProducts()
    } catch (migrationError) { setError(koreanError(migrationError, '상품 마이그레이션')) }
    finally { setBusy(false) }
  }

  return (
    <main className={styles.page}>
      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <p>ADMIN MENU</p>
          <Link to='/admin'>대시보드</Link>
          <Link to='/admin/members'>회원 관리</Link>
          <Link className={styles.active} to='/admin/products'>상품·재고 관리</Link>
          <Link to='/admin/recommended'>추천상품 관리</Link>
          <Link to='/admin/notices'>공지사항 관리</Link>
        </aside>
        <section className={styles.content}>
          <div className={styles.titleRow}>
            <div><p>PRODUCT MANAGEMENT</p><h1>상품·재고 관리</h1></div>
            <button type='button' onClick={migrateJson} disabled={busy}>JSON 상품 마이그레이션</button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}
          <form className={styles.form} onSubmit={submitProduct}>
            <h2>{editingId ? '상품 수정' : '상품 등록'}</h2>
            <label>상품명<input name='name' value={form.name} onChange={updateField} required /></label>
            <label>카테고리<input name='category' value={form.category} onChange={updateField} required /></label>
            <label>카테고리 값(value)<input name='categoryValue' value={form.categoryValue} onChange={updateField} required /></label>
            <label>가격<input name='price' type='number' min='0' value={form.price} onChange={updateField} required /></label>
            <label>할인률<input name='discountRate' type='number' min='0' max='100' value={form.discountRate} onChange={updateField} /></label>
            <label>재고<input name='stock' type='number' min='0' step='1' value={form.stock} onChange={updateField} required /></label>
            <label>품절 임박 기준<input name='lowStockThreshold' type='number' min='0' step='1' value={form.lowStockThreshold} onChange={updateField} required /></label>
            <label className={styles.full}>이미지 경로 또는 URL<input name='image' value={form.image} onChange={updateField} required /></label>
            <label className={styles.full}>설명<textarea name='description' value={form.description} onChange={updateField} required /></label>
            <label className={styles.check}><input name='isRecommended' type='checkbox' checked={form.isRecommended} onChange={updateField} />추천상품으로 표시</label>
            <div className={styles.formActions}>
              <button type='submit' disabled={busy}>{editingId ? '수정 저장' : '상품 등록'}</button>
              {editingId && <button type='button' onClick={resetForm}>수정 취소</button>}
            </div>
          </form>
          <section className={styles.productSection}>
            <div className={styles.listTitle}>
              <h2>등록 상품 {products.length}개</h2>
              <p>추천상품 {recommendedCount} / {MAX_RECOMMENDED_PRODUCTS}개</p>
            </div>
            {isLoading ? <p>상품 목록을 불러오는 중입니다...</p> : products.length === 0 ? <p>등록된 상품이 없습니다.</p> : (
              <>
                <ul className={styles.productList}>
                  {pageProducts.map((product) => {
                    const status = getStockStatus(product)
                    return (
                      <li key={product.id}>
                        <img src={product.image} alt='' />
                        <div><strong>{product.name || '상품명 없음'}</strong><span>{Number(product.price || 0).toLocaleString('ko-KR')}원</span></div>
                        <span className={`${styles.stockStatus} ${status.className}`}>{status.text}</span>
                        <label className={styles.stockEditor}>
                          재고
                          <input
                            type='number' min='0' step='1' value={product.stock ?? 0}
                            disabled={stockSavingId === product.id}
                            onChange={(event) => changeStock(product, event.target.value)}
                          />
                          개
                        </label>
                        {product.isRecommended && <b>추천</b>}
                        <div className={styles.itemActions}>
                          <button
                            type='button'
                            disabled={recommendSavingId === product.id}
                            onClick={() => toggleRecommendation(product)}
                          >
                            {product.isRecommended ? '추천 해제' : '추천'}
                          </button>
                          <button type='button' onClick={() => startEdit(product)}>수정</button>
                          <button type='button' onClick={() => deleteProduct(product)}>삭제</button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <nav className={styles.pagination} aria-label='상품 목록 페이지'>
                  <button type='button' onClick={() => setPage(1)} disabled={page === 1}>«</button>
                  <button type='button' onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                    <button key={number} type='button' className={page === number ? styles.currentPage : ''} onClick={() => setPage(number)}>{number}</button>
                  ))}
                  <button type='button' onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>›</button>
                  <button type='button' onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
                </nav>
              </>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}

export default AdminProductManager
