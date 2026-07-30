import React, { useEffect, useState } from 'react'
import '@google/model-viewer'
import { DELIVERY_MINIMUM } from '../constants/delivery'
import { subscribeAuthState } from '../firebase/authApi'
import {
  clearUserCart,
  deleteUserCartItem,
  getUserCartItems,
  updateUserCartItemQuantity,
} from '../firebase/cartApi'
import styles from './Cart.module.scss'
import { saveLocal, loadLocal } from '../utils/localStorage'
import CartItem from '../components/CartItem'
import { getProducts } from '../firebase/productApi'
import OrderSummary from '../components/OrderSummary' // component 오타 수정 체크!

const Cart = () => {
  // useState 게으른 초기화 사용
  const [cartItem, setCartItem] = useState(() => loadLocal('cart', []))
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => subscribeAuthState(setCurrentUser), [])

  useEffect(() => {
    if (currentUser) return
    saveLocal('cart', cartItem)
  }, [cartItem, currentUser])

  useEffect(() => {
    if (!currentUser) {
      setCartItem(loadLocal('cart', []))
      return undefined
    }

    let isActive = true
    Promise.all([getUserCartItems(currentUser.uid), getProducts()])
      .then(([items, products]) => {
        const productMap = new Map(products.map((product) => [String(product.id), product]))
        const syncedItems = items.map((item) => ({
          ...item,
          stock: Number(productMap.get(String(item.id))?.stock ?? 0),
          lowStockThreshold: Number(productMap.get(String(item.id))?.lowStockThreshold ?? 5),
        }))
        if (isActive) setCartItem(syncedItems)
      })
      .catch((error) => console.error('장바구니를 불러오지 못했습니다.', error))

    return () => {
      isActive = false
    }
  }, [currentUser])

  const clearCart = async () => {
    const answer = window.confirm("장바구니 상품을 모두 삭제하시겠습니까?")
    if (answer) {
      if (currentUser) {
        try {
          await clearUserCart(currentUser.uid)
        } catch (error) {
          console.error('장바구니를 비우지 못했습니다.', error)
          return
        }
      }
      setCartItem([])
    }
  }

  const changeQuantity = async (productId, newQuantity) => {
    const target = cartItem.find((item) => item.id === productId)
    if (!target || Number(target.stock || 0) === 0 || newQuantity > Number(target.stock || 0)) {
      window.alert('현재 재고보다 많은 수량은 선택할 수 없습니다.')
      return
    }
    if (currentUser) {
      try {
        await updateUserCartItemQuantity(currentUser.uid, productId, newQuantity)
      } catch (error) {
        console.error('수량을 변경하지 못했습니다.', error)
        return
      }
    }

    const changeItem = cartItem.map((item) => {
      if (item.id === productId) {
        return { ...item, quantity: newQuantity }
      }
      return item
    })
    setCartItem(changeItem)
  }

  const removeItem = async (productId) => {
    if (currentUser) {
      try {
        await deleteUserCartItem(currentUser.uid, productId)
      } catch (error) {
        console.error('장바구니 상품을 삭제하지 못했습니다.', error)
        return
      }
    }

    const nextCart = cartItem.filter((item) => item.id !== productId)
    setCartItem(nextCart)
  }

  // const 키워드 추가!
  const getDisPrice = (item) => {
    const discountPrice = (item.price * (item.discountRate || 0)) / 100
    return item.price - discountPrice
  }

  // 총액 계산 함수
  const subTotal = () => {
    let tot = 0
    for (const item of cartItem) {
      tot += getDisPrice(item) * item.quantity
    }
    return tot
  }

  // subTotal() 함수 호출로 수정
  const currentSubTotal = subTotal()
  const deliveryFree = currentSubTotal >= DELIVERY_MINIMUM ? 0 : 3000
  const totalPrice = currentSubTotal + deliveryFree

  const orderCart = () => {}

  return (
    <section className={styles.section}>
      <div className={styles.titleArea}>
        <h2 className={styles.cart}>Cart</h2>
        <p>담은 상품 {cartItem.length}개</p>
      </div>
      {cartItem.length === 0 ? (
        <div className={styles.emptyCartModel}>
          <model-viewer
            src='/img/cotti-3D.glb'
            alt='빈 장바구니를 안내하는 코티 캐릭터'
            auto-rotate
            rotation-per-second='18deg'
            camera-controls
            interaction-prompt='none'
            shadow-intensity='0.7'
            camera-orbit='180deg 75deg 98%'
          />
          <h3>장바구니가 비어있습니다</h3>
          <p>마음에 드는 상품을 장바구니에 담아보세요.</p>
        </div>
      ) : cartItem.length === 0 ? (
        <EmptyMessage
          image='/img/pd-01.png'
          title='장바구니가 비었습니다'
          des='마음에 드는 상품을 장바구니에 담아보세요'
          link='/products'
          linkText='상품보러가기'
        />
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.maintxt}>
            <div>
              <strong>장바구니 상품</strong><br />
              <button onClick={clearCart}>전체삭제</button>
            </div>

            {cartItem.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onChangeQuantity={changeQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* subTotal 값 전달 및 orderCart 오타 수정 */}
          <OrderSummary
            subTotal={currentSubTotal}
            deliveryFree={deliveryFree}
            totalPrice={totalPrice}
            onOrder={orderCart}
          />
        </div>
      )}
    </section>
  )
}

export default Cart
