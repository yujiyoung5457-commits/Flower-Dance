import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DELIVERY_MINIMUM } from '../constants/delivery'
import { subscribeAuthState } from '../firebase/authApi'
import { createOrder } from '../firebase/orderApi'
import styles from './Pay.module.scss'

const PAYMENT_METHODS = ['무통장 입금', '카카오페이', '토스페이', '신용카드', '네이버페이', 'Google Pay']
const PENDING_PAYMENT_KEY = 'flower-dance-pending-payment'

const loadPendingItems = () => {
  try {
    const saved = sessionStorage.getItem(PENDING_PAYMENT_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const Pay = () => {
  const { state } = useLocation()
  const [currentUser, setCurrentUser] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [items] = useState(() => state?.items?.length ? state.items : loadPendingItems())
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [savedOrderId, setSavedOrderId] = useState('')
  useEffect(() => subscribeAuthState((user) => {
    setCurrentUser(user)
    setIsAuthReady(true)
  }), [])
  useEffect(() => {
    if (!items.length) return
    try {
      sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(items))
    } catch {
      // 브라우저 저장 공간이 부족해도 기존 결제 흐름은 그대로 진행합니다.
    }
  }, [items])

  const subtotal = useMemo(() => items.reduce((sum, item) => {
    const discounted = Number(item.price || 0) * (1 - Number(item.discountRate || 0) / 100)
    return sum + discounted * Number(item.quantity || 1)
  }, 0), [items])
  const deliveryFee = subtotal >= DELIVERY_MINIMUM ? 0 : 3000
  const total = subtotal + deliveryFee

  const pay = async () => {
    if (!paymentMethod) return window.alert('결제수단을 선택해 주세요.')
    if (!isAuthReady) return
    if (savedOrderId || !currentUser) {
      setSavedOrderId((current) => current || 'guest')
      sessionStorage.removeItem(PENDING_PAYMENT_KEY)
      setIsComplete(true)
      return
    }

    setIsSavingOrder(true)
    try {
      const orderId = await createOrder({
        uid: currentUser.uid,
        items,
        paymentMethod,
        subtotal,
        deliveryFee,
        totalPrice: total,
      })
      setSavedOrderId(orderId)
      sessionStorage.removeItem(PENDING_PAYMENT_KEY)
      setIsComplete(true)
    } catch (error) {
      console.error('주문 내역을 저장하지 못했습니다.', error)
      window.alert('주문 내역을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSavingOrder(false)
    }
  }

  if (!items.length) return <main className={styles.paySurface}><div className={styles.empty}><h1>바로 구매할 상품이 없습니다.</h1><Link to='/products'>상품 보러가기</Link></div></main>

  return <main className={styles.paySurface}><section className={styles.pay}>
    <h1>결제하기</h1><div className={styles.layout}>
      <aside className={styles.memberCard}><img src='/img/cotti01.svg' alt='' /><div><strong>{currentUser?.displayName || '고객'}님 안녕하세요!</strong><p>주문 내용을 확인해 주세요.</p></div><div className={styles.benefits}><span>포인트<strong>500P</strong></span><span>쿠폰<strong>쿠폰이 아직 없어요</strong></span></div></aside>
      <section className={styles.orderCard}><h2>주문 상품</h2><ul>{items.map((item) => { const itemPrice = Number(item.price || 0) * (1 - Number(item.discountRate || 0) / 100); return <li key={item.id}><img src={item.image} alt='' /><div><strong>{item.name}</strong><span>수량 {item.quantity || 1}개</span></div><b>{Math.round(itemPrice * (item.quantity || 1)).toLocaleString()}원</b></li> })}</ul><div className={styles.summary}><p><span>상품 금액</span><b>{Math.round(subtotal).toLocaleString()}원</b></p><p><span>배송비</span><b>{deliveryFee ? `${deliveryFee.toLocaleString()}원` : '무료'}</b></p><p><span>결제 예정 금액</span><strong>{Math.round(total).toLocaleString()}원</strong></p></div></section>
      <section className={styles.paymentCard}><h2>결제수단</h2><div className={styles.methods}>{PAYMENT_METHODS.map((method) => <button type='button' key={method} className={paymentMethod === method ? styles.selected : ''} onClick={() => setPaymentMethod(method)}>{method}</button>)}</div><button className={styles.payButton} type='button' onClick={pay} disabled={isSavingOrder || !isAuthReady}>{isSavingOrder ? '결제 중...' : '결제하기'}</button></section>
    </div>
  </section>
    {isComplete && (
      <div className={styles.modalBackdrop} role='presentation' onClick={() => setIsComplete(false)}>
        <section
          className={styles.completeModal}
          role='dialog'
          aria-modal='true'
          aria-labelledby='payment-complete-title'
          onClick={(event) => event.stopPropagation()}
        >
          <img src='/img/cotti01.svg' alt='' />
          <span>♥</span>
          <h2 id='payment-complete-title'>구매가 완료되었습니다~</h2>
          <p>플라워 댄스를 이용해 주셔서 감사해요!</p>
          <button type='button' onClick={() => setIsComplete(false)}>확인</button>
        </section>
      </div>
    )}
  </main>
}

export default Pay
