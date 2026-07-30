import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, updateProductRecommendation } from '../firebase/productApi'
import styles from './AdminProductManager.module.scss'

const PAGE_SIZE = 10
const MAX_RECOMMENDED_PRODUCTS = 400

const AdminRecommended = () => {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError('상품 목록을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [])

  const recommendedCount = products.filter((product) => product.isRecommended).length
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const pageProducts = useMemo(
    () => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, products],
  )

  const toggleRecommendation = async (product) => {
    const nextRecommended = !product.isRecommended
    if (nextRecommended && recommendedCount >= MAX_RECOMMENDED_PRODUCTS) {
      setError(`추천상품은 최대 ${MAX_RECOMMENDED_PRODUCTS}개까지만 설정할 수 있습니다.`)
      setMessage('')
      return
    }

    setSavingId(product.id)
    setError('')
    setMessage('')
    try {
      await updateProductRecommendation(product.id, nextRecommended)
      setProducts((items) => items.map((item) =>
        item.id === product.id ? { ...item, isRecommended: nextRecommended } : item
      ))
      setMessage(nextRecommended ? `${product.name}을(를) 추천상품으로 설정했습니다.` : `${product.name}의 추천을 해제했습니다.`)
    } catch (saveError) {
      setError(
        saveError?.code === 'permission-denied' || saveError?.code === 'firestore/permission-denied'
          ? '추천상품 변경 권한이 없습니다. 관리자 계정과 보안 규칙을 확인해 주세요.'
          : '추천상품을 변경하지 못했습니다.',
      )
    } finally {
      setSavingId('')
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <p>ADMIN MENU</p>
          <Link to='/admin'>대시보드</Link>
          <Link to='/admin/members'>회원 관리</Link>
          <Link to='/admin/products'>상품·재고 관리</Link>
          <Link className={styles.active} to='/admin/recommended'>추천상품 관리</Link>
          <Link to='/admin/notices'>공지사항 관리</Link>
        </aside>

        <section className={styles.content}>
          <div className={styles.titleRow}>
            <div>
              <p>RECOMMENDED PRODUCTS</p>
              <h1>추천상품 관리</h1>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <section className={styles.productSection}>
            <div className={styles.listTitle}>
              <h2>전체 상품 {products.length}개</h2>
              <p>추천상품 {recommendedCount} / {MAX_RECOMMENDED_PRODUCTS}개</p>
            </div>

            {isLoading ? <p>상품 목록을 불러오는 중입니다...</p> : products.length === 0 ? <p>등록된 상품이 없습니다.</p> : (
              <>
                <ul className={styles.productList}>
                  {pageProducts.map((product) => (
                    <li key={product.id}>
                      <img src={product.image} alt='' />
                      <div>
                        <strong>{product.name || '상품명 없음'}</strong>
                        <span>{Number(product.price || 0).toLocaleString('ko-KR')}원</span>
                      </div>
                      {product.isRecommended && <b>추천</b>}
                      <div className={styles.itemActions}>
                        <button
                          type='button'
                          disabled={savingId === product.id}
                          onClick={() => toggleRecommendation(product)}
                        >
                          {savingId === product.id ? '저장 중' : product.isRecommended ? '추천 해제' : '추천'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <nav className={styles.pagination} aria-label='추천상품 목록 페이지'>
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

export default AdminRecommended
