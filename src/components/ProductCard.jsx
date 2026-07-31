import { Link, useNavigate } from 'react-router-dom'
import styles from './ProductCard.module.scss'
// import styles from 'ProductList.module.scss'
import { useState } from 'react'
import { loadLocal, saveLocal } from '../utils/localStorage'
import { useEffect } from 'react'
import { subscribeAuthState } from '../firebase/authApi'
import { addUserCartItem, deleteUserCartItem, getUserCartItems } from '../firebase/cartApi'
import {
  addUserWishlistItem,
  deleteUserWishlistItem,
  getUserWishlistItems,
} from '../firebase/wishlistApi'

const ProductCard = ({ product, onWishItem }) => {
  const navigate = useNavigate()
  const [isLike, setIsLike] = useState(() =>
    loadLocal('wishlist', []).some((item) => String(item.id) === String(product?.id)),
  )
  const [isInCart, setIsInCart] = useState(() =>
    loadLocal('cart', []).some((item) => String(item.id) === String(product?.id)),
  )
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => subscribeAuthState(setCurrentUser), [])

  useEffect(() => {
    if (!product) return undefined

    if (!currentUser) {
      setIsInCart(loadLocal('cart', []).some((item) => String(item.id) === String(product.id)))
      return undefined
    }

    let isActive = true
    getUserCartItems(currentUser.uid)
      .then((items) => {
        if (isActive) setIsInCart(items.some((item) => String(item.id) === String(product.id)))
      })
      .catch(() => {
        if (isActive) setIsInCart(false)
      })

    getUserWishlistItems(currentUser.uid)
      .then((items) => {
        if (isActive) setIsLike(items.some((item) => String(item.id) === String(product.id)))
      })
      .catch(() => {
        if (isActive) setIsLike(false)
      })

    return () => {
      isActive = false
    }
  }, [currentUser, product])
  //현재넘어온 상품 하나(product)와 찜한 상품 목록 중에서 일치하는 상품 찾기
  // const [isLike, setIsLike]=useState(isProduct)
 
  if (!product) return null
  const disPrice = product.price - ((product.price * product.discountRate) / 100)
  const isSoldOut = Number(product.stock || 0) === 0
  const isLowStock = !isSoldOut && Number(product.stock) <= Number(product.lowStockThreshold ?? 5)

  const changeWish = async () => {
    if (currentUser) {
      try {
        if (isLike) {
          await deleteUserWishlistItem(currentUser.uid, product.id)
        } else {
          await addUserWishlistItem(currentUser.uid, product)
        }
        setIsLike((value) => !value)
        onWishItem?.(product.id, !isLike)
      } catch (error) {
        console.error('찜 목록을 저장하지 못했습니다.', error)
        window.alert(
          error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied'
            ? '찜 목록 저장 권한이 없습니다. Firestore 보안 규칙을 확인해 주세요.'
            : '찜 목록을 저장하지 못했습니다.',
        )
      }
      return
    }
    const wishlist = loadLocal('wishlist', [])
    const isInWishlist = wishlist.some((item) => String(item.id) === String(product.id))
    const nextWishlist = isInWishlist
      ? wishlist.filter((item) => String(item.id) !== String(product.id))
      : [...wishlist, product]

    saveLocal('wishlist', nextWishlist)
    setIsLike(!isInWishlist)
    onWishItem?.(product.id, !isInWishlist)
  }
  const changeCart = async () => {
    if (isSoldOut) {
      window.alert('품절된 상품은 장바구니에 담을 수 없습니다.')
      return
    }
    if (currentUser) {
      try {
        if (!isInCart) await addUserCartItem(currentUser.uid, product, 1)
        setIsInCart(true)
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

    const cart = loadLocal('cart', [])
    const isAlreadyInCart = cart.some((item) => String(item.id) === String(product.id))
    const nextCart = isAlreadyInCart
      ? cart
      : [...cart, { ...product, price: disPrice, quantity: 1 }]

    saveLocal('cart', nextCart)
    setIsInCart(true)
  }

  const orderNow = () => {
  if (isSoldOut) {
    window.alert('품절된 상품은 구매할 수 없습니다.')
    return
  }
  navigate('/pay', { state: { items: [{ ...product, quantity: 1 }] } })
  }
   /*
   const newisLike=isLike
   //같은 상품이 없으므로 찜한 상품을 찜목록에 추가한다
   if(newisLike){
      saveLocal('wishlist',[...WishItem, product])
   }else{
      //좋아요를 한번 더클릭한 상태(취소상태)
      const removeItem=WishItem.filter((item)=>item.id !==product.id)
      saveLocal('wishlist',removeItem)
   }
   if(onWishItem){
      onWishItem(product.id, newisLike)
   }
   */
  return (
    // ★ wrap 지우고 바로 article부터 시작합니다!
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link to={`/products/${product.id}`}>
          <img className={styles.image} src={product.image} alt={product.name} />
        </Link>
        <button className={styles.wishButton} onClick={changeWish}>{isLike ? <h2 className={styles.heart}>♥</h2> : <h2>♡</h2>}</button>
      </div>
      
      <div className={styles.txtwrap}>
        <p>{product.category}</p>
        <Link className={styles.Main} to={`/products/${product.id}`}>{product.name}</Link>
        {product.discountRate > 0 && (<span className={styles.middle}>{product.discountRate}%</span>)}
        <strong className={styles.price}>{disPrice.toLocaleString()}원</strong>
      </div>

      {isSoldOut && <span className={styles.soldOut}>품절</span>}
      {isLowStock && <span className={styles.lowStock}>품절 임박 · {product.stock}개 남음</span>}
      <div className={styles.actions}>
        <button className={isInCart ? styles.inCart : ''} onClick={changeCart} disabled={isSoldOut && !isInCart}>
          {isInCart ? '담겼어요🍰' : '장바구니'}
        </button>
        <button onClick={orderNow}>바로 주문하기</button>
      </div>
    </article>
  )
}

export default ProductCard
