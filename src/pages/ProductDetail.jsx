import React,{useEffect, useRef, useState} from 'react'
import { Link, useParams } from 'react-router-dom'
import styles from './ProductDetail.module.scss'
import QuantityControl from '../components/QuantityControl'
import { loadLocal, saveLocal } from '../utils/localStorage'
import { subscribeAuthState } from '../firebase/authApi'
import { addUserCartItem, deleteUserCartItem, getUserCartItems } from '../firebase/cartApi'
import { getProduct } from '../firebase/productApi'

const ProductDetail = () => {
  const {id} =useParams()
  const [product, setProduct]=useState(null)
  const [subDetail, setSubDetail]=useState(null)
  const [isLoading, setIsLoading]=useState(true)
  const [quantity, setQuantity]=useState(1)
  const [isLike, setIsLike]=useState(false)
  const [isInCart, setIsInCart]=useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const section2Ref = useRef(null)

  useEffect(() => subscribeAuthState(setCurrentUser), [])
 
  useEffect(()=>{
    const loadPro=async()=>{
      try {
        const [selectedProduct, detailRes] = await Promise.all([
          getProduct(id),
          fetch('/data/subDetail.json'),
        ])
        const detailData = await detailRes.json()
        const sourceId = String(selectedProduct?.sourceId || '')
        const selectDetail = detailData.find((item) => sourceId === String(item.id))

        setProduct(selectedProduct)
        setSubDetail(selectDetail ?? null)
      } catch (error) {
        console.error('상품 정보를 불러오지 못했습니다.', error)
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadPro()
  }, [id])
  useEffect(() => {
    if (product && !currentUser) {
      setIsLike(loadLocal('wishlist', []).some((item) => String(item.id) === String(product.id)))
      setIsInCart(loadLocal('cart', []).some((item) => String(item.id) === String(product.id)))
    }
    if (product && currentUser) {
      getUserCartItems(currentUser.uid)
        .then((items) => setIsInCart(items.some((item) => String(item.id) === String(product.id))))
        .catch(() => setIsInCart(false))
    }
  }, [currentUser, product])
  useEffect(() => {
    const section2Images = section2Ref.current?.querySelectorAll('img')
    if (!section2Images?.length) return undefined

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add(styles.imageVisible)
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.3 })

    section2Images.forEach((image) => observer.observe(image))
    return () => observer.disconnect()
  }, [subDetail])
  if(isLoading){
    return <p>상품을 불러오는 중입니다.....</p>
  }
  if(!product){
    return (
      <>
      <p>상품을 찾을 수 없습니다</p>
      <Link to='/products'>상품 목록으로 이동</Link>
      </>
    )
  }

  const discountPrice = product.price - (product.price * product.discountRate) / 100
  const totalPrice = quantity * discountPrice
  const isSoldOut = Number(product.stock || 0) === 0
  const isLowStock = !isSoldOut && Number(product.stock) <= Number(product.lowStockThreshold ?? 5)
  const changeWish = () => {
    const wishlist = loadLocal('wishlist', [])
    const isInWishlist = wishlist.some((item) => String(item.id) === String(product.id))
    const nextWishlist = isInWishlist
      ? wishlist.filter((item) => String(item.id) !== String(product.id))
      : [...wishlist, product]

    saveLocal('wishlist', nextWishlist)
    setIsLike(!isInWishlist)
  }
   const addToCart=async()=>{
    if (isSoldOut) {
      window.alert('품절된 상품은 장바구니에 담을 수 없습니다.')
      return
    }
    if (currentUser) {
      try {
        if (!isInCart) await addUserCartItem(currentUser.uid, product, quantity)
        setIsInCart(true)
        window.alert('장바구니에 상품을 담았습니다.')
      } catch (error) {
        console.error('장바구니를 저장하지 못했습니다.', error)
        window.alert(
          error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied'
            ? '장바구니 저장 권한이 없습니다. Firestore 보안 규칙을 확인해 주세요.'
            : error?.message || '장바구니에 상품을 담지 못했습니다.',
        )
      }
      return
    }

    const currentCart = loadLocal('cart', [])
    const isAlreadyInCart = currentCart.some((item) => String(item.id) === String(product.id))
    if (isAlreadyInCart) {
      saveLocal('cart', currentCart.filter((item) => String(item.id) !== String(product.id)))
      setIsInCart(false)
      return
    }
    const saveCart=window.localStorage.getItem('cart')
    //로컬의 저장된 긴 문자열 배열로 변환
    const cart=saveCart ? JSON.parse(saveCart) : []
    //장바구니 아이템과 상세 페이지 아이템이 동일한가
    const findItem= cart.find((item)=>String(item.id)===String(product.id))
    //새롭게 추가되는 아이템 만들기
    const newItem= {...product, price:discountPrice, quantity}

    //여기는 수량만 더할 것인지 새 상품을 추가 할 것인지
    const updateCart= findItem ? 
    cart.map((item)=>(
        String(item.id)===String(product.id) ?
        { ...item, quantity : item.quantity+quantity} //수량증가
        : item //그랗지 않으면 원래 상품 목록
    ))
    : [...cart, newItem] //새 아이템 추가

  window.localStorage.setItem('cart',JSON.stringify(updateCart))
  setIsInCart((current) => !current)
    
  }

  const orderNow = async () => {
    if (isSoldOut) {
      window.alert('품절된 상품은 구매할 수 없습니다.')
      return
    }
    if (currentUser) {
      try {
        if (!isInCart) await addUserCartItem(currentUser.uid, product, quantity)
        setIsInCart(true)
        window.location.assign('/cart')
      } catch (error) {
        console.error('바로구매를 진행하지 못했습니다.', error)
        window.alert(
          error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied'
            ? '장바구니 저장 권한이 없습니다. Firestore 보안 규칙을 확인해 주세요.'
            : error?.message || '바로구매를 진행하지 못했습니다.',
        )
      }
      return
    }
    const cart = loadLocal('cart', [])
    const exists = cart.some((item) => String(item.id) === String(product.id))
    if (!exists) saveLocal('cart', [...cart, { ...product, price: discountPrice, quantity }])
    window.location.assign('/cart')
  }
  return (
    <div className={styles.middle}>
    <Link to='/products' className={styles.middle2}>Product Catalog</Link>
    <section className={styles.section}>
      
      <div className={styles.imgBox}>
        <img src={product.image} alt={product.name} />
      </div>
      <div className={styles.impoBox}>
        <p className={styles.pi}>{product.category}</p>
        <h1 className={styles.h}>{product.name}</h1>
        {product.description && <p className={styles.lastPrice}>{product.description}</p>}
        <div className={styles.priseArea}>
          {
            product.discountRate > 0 && (
              <>
              <span>{product.discountRate}%</span>
              <del>{product.price.toLocaleString()}원<br /></del>
              </>
            )
          }
          <strong>↪{discountPrice.toLocaleString()}원</strong>

          <div className={styles.deliveryArea}>
            <span>배송비 3,000원</span>
            <strong>50,000원 이상 구매시 무료 배송</strong>
          </div>
          <div className={styles.QuantityArea}>
            <span>수량</span>
            {!isSoldOut && <QuantityControl quantity={quantity} setQuantity={setQuantity} maxQuantity={product.stock}/>}
            {isSoldOut && <strong>품절</strong>}
            {isLowStock && <strong>품절 임박 · {product.stock}개 남음</strong>}
            {product.stock != null && <small>재고 {product.stock}개</small>}
          </div>
            <div className={styles.finalPrice}>
              <h2>총 상품금액: <strong>{totalPrice.toLocaleString()}</strong></h2>
              <div className={styles.btnLast}>
                <button onClick={changeWish}>
                  {
                    isLike ? '🥰찜완료' : '😶찜하기'
                  }
                </button>
                <button
                  onClick={addToCart}
                  className={isInCart ? styles.inCart : ''}
                  aria-pressed={isInCart}
                  disabled={isSoldOut && !isInCart}
                >
                  장바구니 담기
                </button>
                <button onClick={orderNow} disabled={isSoldOut}>바로구매</button>
              </div>

            </div>
        </div>
      </div>
    </section>
    <section ref={section2Ref} className={styles.section2}>
      {subDetail && (
        <>
          <h2>엄마와 아이를 위한 {subDetail.name}</h2>
          <div className={styles.imgBox2}>
            <img src={subDetail.image} alt={subDetail.name} />
          </div>
          <div className={styles.imgBox3}>
            <p>{subDetail.description}</p>
            <div className={styles.detailImages}>
              {subDetail.detailImages?.map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${subDetail.name} 상세 이미지`} />
              ))}
            </div>
          </div>
        </>
      )}
      {/*
      <h2>엄마와 아이를 위한 {subDetail.json의name}</h2>
        <div className={styles.imgBox2}>
          <img src={subDetail.json의image} alt={subDetail.json의name} />
        </div>
         <div className={styles.imgBox3}>
          <h2>{subDetail.json의description}</h2>
            <img src={subDetail.json의detailImages} alt="" />
        </div>
      */}
    </section>
    </div>
  )
}                          

export default ProductDetail
