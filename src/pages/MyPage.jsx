import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAuthErrorMessage,
  subscribeAuthState,
  updateCurrentUserPassword,
} from '../firebase/authApi'
import { getOrCreateUserProfile, updateUserNickname } from '../firebase/userApi'
import { getUserOrders } from '../firebase/orderApi'
import { deleteUserCartItem, getUserCartItems } from '../firebase/cartApi'
import { deleteUserWishlistItem, getUserWishlistItems } from '../firebase/wishlistApi'
import baseStyles from './MyPage.module.scss'
import styles from './MyPageContent.module.scss'

const MyPage = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [nicknameInput, setNicknameInput] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [isSavingNickname, setIsSavingNickname] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [isLoadingCart, setIsLoadingCart] = useState(false)
  const [cartError, setCartError] = useState('')
  const [deletingCartItemId, setDeletingCartItemId] = useState('')
  const [wishlistItems, setWishlistItems] = useState([])
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false)
  const [wishlistError, setWishlistError] = useState('')

  useEffect(() => subscribeAuthState(setCurrentUser), [])

  useEffect(() => {
    if (!currentUser) return undefined
    let isActive = true
    setIsLoadingWishlist(true)
    setWishlistError('')
    getUserWishlistItems(currentUser.uid)
      .then((items) => { if (isActive) setWishlistItems(items) })
      .catch((error) => { if (isActive) setWishlistError(getAuthErrorMessage(error)) })
      .finally(() => { if (isActive) setIsLoadingWishlist(false) })
    return () => { isActive = false }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return undefined

    let isActive = true
    setIsLoadingProfile(true)
    setProfileError('')

    getOrCreateUserProfile(currentUser)
      .then((userProfile) => {
        if (!isActive) return
        setProfile(userProfile)
        setNicknameInput(userProfile.nickname || '')
      })
      .catch((error) => {
        if (!isActive) return
        setProfileError(getAuthErrorMessage(error))
      })
      .finally(() => {
        if (isActive) setIsLoadingProfile(false)
      })

    return () => {
      isActive = false
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return undefined

    let isActive = true
    setIsLoadingOrders(true)
    setOrdersError('')

    getUserOrders(currentUser.uid)
      .then((userOrders) => {
        if (isActive) setOrders(userOrders)
      })
      .catch((error) => {
        if (isActive) setOrdersError(getAuthErrorMessage(error))
      })
      .finally(() => {
        if (isActive) setIsLoadingOrders(false)
      })

    return () => {
      isActive = false
    }
  }, [currentUser])

  const nickname = profile?.nickname || currentUser?.displayName || '회원'

  useEffect(() => {
    if (!currentUser) return undefined

    let isActive = true
    setIsLoadingCart(true)
    setCartError('')

    getUserCartItems(currentUser.uid)
      .then((userCartItems) => {
        if (isActive) setCartItems(userCartItems)
      })
      .catch((error) => {
        if (isActive) setCartError(getAuthErrorMessage(error))
      })
      .finally(() => {
        if (isActive) setIsLoadingCart(false)
      })

    return () => {
      isActive = false
    }
  }, [currentUser])

  const getCartItemPrice = (item) => Number(item.price || 0)
  const getCartItemQuantity = (item) => Math.max(1, Number(item.quantity || 1))
  const getCartItemTotal = (item) => getCartItemPrice(item) * getCartItemQuantity(item)
  const cartTotalPrice = cartItems.reduce((total, item) => total + getCartItemTotal(item), 0)

  const handleCartItemDelete = async (itemId) => {
    if (!currentUser || !window.confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) return

    setCartError('')
    setDeletingCartItemId(itemId)

    try {
      await deleteUserCartItem(currentUser.uid, itemId)
      setCartItems((previousItems) => previousItems.filter((item) => item.id !== itemId))
    } catch (error) {
      setCartError(getAuthErrorMessage(error))
    } finally {
      setDeletingCartItemId('')
    }
  }

  const handleWishlistItemDelete = async (itemId) => {
    if (!currentUser || !window.confirm('찜한 상품을 삭제하시겠습니까?')) return
    setWishlistError('')
    try {
      await deleteUserWishlistItem(currentUser.uid, itemId)
      setWishlistItems((items) => items.filter((item) => item.id !== itemId))
    } catch (error) {
      setWishlistError(getAuthErrorMessage(error))
    }
  }

  const formatKoreanDate = (timestamp) => {
    if (!timestamp?.toDate) return '가입일 정보 없음'

    const joinedDate = timestamp.toDate()
    return `${joinedDate.getFullYear()}년 ${joinedDate.getMonth() + 1}월 ${joinedDate.getDate()}일`
  }

  const formatOrderPrice = (price) => `${Number(price || 0).toLocaleString('ko-KR')}원`

  const formatCartPrice = (price) => `${Number(price || 0).toLocaleString('ko-KR')}원`

  const handleNicknameSubmit = async (event) => {
    event.preventDefault()
    const nextNickname = nicknameInput.trim()
    if (!nextNickname || !currentUser) return

    setFormMessage('')
    setIsSavingNickname(true)

    try {
      await updateUserNickname(currentUser.uid, nextNickname)
      setProfile((previousProfile) => ({ ...previousProfile, nickname: nextNickname }))
      setCurrentUser((previousUser) => ({ ...previousUser, displayName: nextNickname }))
      setFormMessage('닉네임을 수정했습니다.')
    } catch (error) {
      setFormMessage(getAuthErrorMessage(error))
    } finally {
      setIsSavingNickname(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (!currentPassword || !newPassword) return

    setFormMessage('')
    setIsSavingPassword(true)

    try {
      await updateCurrentUserPassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setFormMessage('비밀번호를 수정했습니다.')
    } catch (error) {
      setFormMessage(getAuthErrorMessage(error))
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <main className={`${baseStyles.page} ${styles.page}`}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>MY PAGE</p>
        <h1>{nickname}님, 반가워요</h1>
        <p>나의 쇼핑 정보와 활동 내역을 한곳에서 확인해 보세요.</p>
      </section>

      <section className={styles.memberInfo}>
        {isLoadingProfile ? (
          <p className={styles.statusMessage}>회원 정보를 불러오는 중입니다...</p>
        ) : profileError ? (
          <p className={styles.errorMessage}>{profileError}</p>
        ) : (
          <>
            <div>
              <p className={styles.label}>회원 정보</p>
              <strong>{nickname}</strong>
              <span>{profile?.email || currentUser?.email}</span>
              <span className={styles.joinedDate}>가입일 {formatKoreanDate(profile?.createAt)}</span>
            </div>
            <span className={styles.role}>{profile?.role === 'user' ? '일반 회원' : profile?.role}</span>
          </>
        )}
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <p className={styles.label}>회원 정보 수정</p>
          <h2>내 정보 관리</h2>
          <form className={styles.editForm} onSubmit={handleNicknameSubmit}>
            <label htmlFor='nickname'>닉네임</label>
            <div>
              <input
                id='nickname'
                type='text'
                value={nicknameInput}
                onChange={(event) => setNicknameInput(event.target.value)}
                required
              />
              <button type='submit' disabled={isSavingNickname}>
                {isSavingNickname ? '저장 중' : '저장'}
              </button>
            </div>
          </form>
          <form className={styles.editForm} onSubmit={handlePasswordSubmit}>
            <label htmlFor='current-password'>현재 비밀번호</label>
            <input
              id='current-password'
              type='password'
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
            <label htmlFor='new-password'>새 비밀번호</label>
            <div>
              <input
                id='new-password'
                type='password'
                value={newPassword}
                minLength='6'
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
              <button type='submit' disabled={isSavingPassword}>
                {isSavingPassword ? '변경 중' : '변경'}
              </button>
            </div>
          </form>
          {formMessage && <p className={styles.formMessage}>{formMessage}</p>}
        </article>

        <article className={styles.card}>
          <p className={styles.label}>주문 내역</p>
          <h2>최근 주문</h2>
          {isLoadingOrders ? (
            <p className={styles.statusMessage}>주문 내역을 불러오는 중입니다...</p>
          ) : ordersError ? (
            <p className={styles.errorMessage}>{ordersError}</p>
          ) : orders.length === 0 ? (
            <div className={styles.emptyOrders}>
              <p>아직 주문 내역이 없습니다.</p>
              <Link to='/products'>상품 목록으로 이동</Link>
            </div>
          ) : (
            <ul className={styles.orderList}>
              {orders.map((order) => (
                <li key={order.id}>
                  <strong>{order.productName || '상품 정보 없음'}</strong>
                  <span>{formatKoreanDate(order.createAt)}</span>
                  <span>수량 {order.quantity || 0}개</span>
                  <b>{formatOrderPrice(order.totalPrice)}</b>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={styles.card}>
          <p className={styles.label}>장바구니</p>
          <h2>담아둔 상품</h2>
          {isLoadingCart ? (
            <p className={styles.statusMessage}>장바구니를 불러오는 중입니다...</p>
          ) : cartError ? (
            <p className={styles.errorMessage}>{cartError}</p>
          ) : cartItems.length === 0 ? (
            <p>장바구니에 담아둔 상품이 없습니다.</p>
          ) : (
            <ul className={styles.savedList}>
              {cartItems.map((item) => (
                <li key={item.id}>
                  <div className={styles.cartItemDetails}>
                    <strong>{item.productName || item.name || '상품 정보 없음'}</strong>
                    <span>가격 {formatCartPrice(getCartItemPrice(item))}</span>
                    <span>수량 {getCartItemQuantity(item)}개</span>
                    <b>상품별 금액 {formatCartPrice(getCartItemTotal(item))}</b>
                    <button
                      type='button'
                      className={styles.cartDeleteButton}
                      onClick={() => handleCartItemDelete(item.id)}
                      disabled={deletingCartItemId === item.id}
                    >
                      {deletingCartItemId === item.id ? '삭제 중' : '삭제'}
                    </button>
                  </div>
                  <b>수량 {item.quantity || 1}개</b>
                </li>
              ))}
            </ul>
          )}
          {!isLoadingCart && !cartError && cartItems.length > 0 && (
            <p className={styles.cartTotal}>전체 합계 <b>{formatCartPrice(cartTotalPrice)}</b></p>
          )}
          <Link className={styles.savedLink} to='/cart'>장바구니로 이동</Link>
        </article>

        <article className={styles.card}>
          <p className={styles.label}>찜한 상품</p>
          <h2>나의 위시리스트</h2>
          {isLoadingWishlist ? (
            <p className={styles.statusMessage}>찜한 상품을 불러오는 중입니다...</p>
          ) : wishlistError ? (
            <p className={styles.errorMessage}>{wishlistError}</p>
          ) : wishlistItems.length === 0 ? (
            <p>찜한 상품이 없습니다.</p>
          ) : (
            <ul className={styles.savedList}>
              {wishlistItems.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <button type='button' className={styles.wishlistDeleteButton} onClick={() => handleWishlistItemDelete(item.id)}>삭제</button>
                  <span>{item.name}</span>
                  <b>찜한 상품</b>
                </li>
              ))}
            </ul>
          )}
          <Link className={styles.savedLink} to='/wishlist'>찜 목록으로 이동</Link>
        </article>
      </section>
    </main>
  )
}

export default MyPage
