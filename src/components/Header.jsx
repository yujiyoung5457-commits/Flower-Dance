import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getUserCartItems } from '../firebase/cartApi'
import { loadLocal } from '../utils/localStorage'
import SearchBox from './SearchBox'
import styles from './Header.module.scss'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false)
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const logout = useAuthStore((state) => state.logout)
  const [cartCount, setCartCount] = useState(0)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768) return

      const currentScrollY = window.scrollY
      const difference = currentScrollY - lastScrollY.current
      if (currentScrollY < 8 || difference < -6) setIsHeaderHidden(false)
      else if (difference > 6) setIsHeaderHidden(true)
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let isActive = true

    const updateCartCount = async () => {
      if (!currentUser) {
        const localCart = loadLocal('cart', [])
        if (isActive) setCartCount(localCart.reduce((total, item) => total + Number(item.quantity || 1), 0))
        return
      }

      try {
        const cartItems = await getUserCartItems(currentUser.uid)
        if (isActive) setCartCount(cartItems.reduce((total, item) => total + Number(item.quantity || 1), 0))
      } catch {
        if (isActive) setCartCount(0)
      }
    }

    updateCartCount()
    window.addEventListener('shopping-storage-changed', updateCartCount)
    window.addEventListener('shopping-cart-changed', updateCartCount)
    return () => {
      isActive = false
      window.removeEventListener('shopping-storage-changed', updateCartCount)
      window.removeEventListener('shopping-cart-changed', updateCartCount)
    }
  }, [currentUser])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      setIsMobileMenuClosing(false)
      setIsMobileMenuOpen(true)
      return
    }

    setIsMobileMenuClosing(true)
    window.setTimeout(() => {
      setIsMobileMenuOpen(false)
      setIsMobileMenuClosing(false)
    }, 320)
  }

  const handleLogout = async () => {
    try {
      await logout()
      closeMobileMenu()
    } catch {
      // 로그아웃 실패는 현재 화면을 유지하고, 다음 인증 상태 변경을 기다립니다.
    }
  }

  const accountMenu = currentUser ? (
    <>
      <Link to='/mypage' className={styles.userName}>{currentUser.displayName || currentUser.email}</Link>
      <button type='button' className={styles.logoutButton} onClick={handleLogout}>Logout</button>
    </>
  ) : (
    <>
      <Link to='/login'>Login</Link>
      <Link to='/signup'>Signup</Link>
    </>
  )

  return (
    <header className={`${styles.header} ${isHeaderHidden ? styles.headerHidden : ''}`}>
      <div className={styles.inner}>
        <Link to='/' className={styles.logo} />

        <div className={styles.search}><SearchBox /></div>

        <div className={styles.wrap}>
          <nav className={styles.menu}>
            {accountMenu}
            {isAdmin && <Link to='/admin'>Admin</Link>}
            <Link to='/mypage'>MyPage</Link>
            <Link to='/wishlist'>WishList</Link>
            <Link to='/cart' className={styles.cartLink} aria-label={`장바구니, 상품 ${cartCount}개`}>
              <img src='/img/carticon.png' alt='' />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>
            <Link to='/photozone'>PhotoZone</Link>
          </nav>
        </div>

        <button
          type='button'
          className={styles.menuButton}
          aria-label='메뉴 열기'
          aria-expanded={isMobileMenuOpen}
          onClick={toggleMobileMenu}
        >
          <span />
          <span />
          <span />
        </button>

    </div>
           <hr className={styles.line} /> 
        <nav className={styles.menuHide}>
          <Link to='/products'>모든상품</Link>
          <Link to='/products/category/kitchen'>식기/주방</Link>
          <Link to='/products/category/clothes'>의류/신발</Link>
          <Link to='/products/category/doll'>인형</Link>
          <Link to='/products/category/baby-food'>이유식</Link>
          <Link to='/products/category/bedding'>침구류</Link>
          <Link to='/products/category/toy'>장난감</Link>
          <Link to='/notice'>공지사항</Link>
          <Link to='/loadmap'>오시는 길</Link>
        </nav>

        {isMobileMenuOpen && (
          <nav className={`${styles.mobileMenu} ${isMobileMenuClosing ? styles.mobileMenuClosing : ''}`} aria-label='모바일 메뉴'>
            <Link to='/products' onClick={closeMobileMenu}>모든상품</Link>
            <Link to='/products/category/kitchen' onClick={closeMobileMenu}>식기/주방</Link>
            <Link to='/products/category/clothes' onClick={closeMobileMenu}>의류/신발</Link>
            <Link to='/products/category/doll' onClick={closeMobileMenu}>인형</Link>
            <Link to='/products/category/baby-food' onClick={closeMobileMenu}>이유식</Link>
            <Link to='/products/category/bedding' onClick={closeMobileMenu}>침구류</Link>
            <Link to='/products/category/toy' onClick={closeMobileMenu}>장난감</Link>
            <Link to='/notice' onClick={closeMobileMenu}>공지사항</Link>
            <Link to='/loadmap' onClick={closeMobileMenu}>오시는 길</Link>
            <Link to='/mypage' onClick={closeMobileMenu}>MyPage</Link>
            {isAdmin && <Link to='/admin' onClick={closeMobileMenu}>Admin</Link>}
            {currentUser ? (
              <>
                <Link to='/mypage' className={styles.userName} onClick={closeMobileMenu}>
                  {currentUser.displayName || currentUser.email}
                </Link>
                <button type='button' className={styles.logoutButton} onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to='/login' onClick={closeMobileMenu}>Login</Link>
                <Link to='/signup' onClick={closeMobileMenu}>Signup</Link>
              </>
            )}
            <Link to='/wishlist' onClick={closeMobileMenu}>WishList</Link>
            <Link to='/cart' onClick={closeMobileMenu}>Cart</Link>
            <Link to='/photozone' onClick={closeMobileMenu}>PhotoZone</Link>
          </nav>
        )}
       
    </header>
  )
}

export default Header
