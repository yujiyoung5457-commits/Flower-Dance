import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Notice from './pages/Notice'
import NoticeDetail from './pages/NoticeDetail'
import SearchResult from './pages/SearchResult'
import Photozone from './pages/Photozone'
import Gallery from './pages/Gallery'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import NotFound from './pages/NotFound'
import Order from './pages/Order'
import MyPage from './pages/MyPage'
import IntroVideo from './components/IntroVideo'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Admin from './pages/Admin'
import AdminMembers from './pages/AdminMembers'
import AdminProducts from './pages/AdminProductManager'
import AdminRecommended from './pages/AdminRecommended'
import AdminNotices from './pages/AdminNotices'
import LoadMap from './pages/LoadMap'
import Pay from './pages/Pay'
import ScrollButtons from './components/ScrollButtons'
import useAuthStore from './store/authStore'

const App = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const [showIntro, setShowIntro] = useState(() => {
    try {
      if (window.matchMedia('(max-width: 768px)').matches) return false
      return sessionStorage.getItem('introPlayed') !== 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (showIntro) {
      try {
        sessionStorage.setItem('introPlayed', 'true')
      } catch {
        // Storage access can be blocked by browser privacy settings.
      }
    }
  }, [showIntro])

  const finishIntro = () => {
    setShowIntro(false)
  }

  return (
    <BrowserRouter>
      {showIntro && <IntroVideo onFinish={finishIntro} />}
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/photozone' element={<Photozone />} />
        <Route path='/gallery' element={<Gallery />} />
        <Route path='/order' element={<Order />} />
        <Route path='/pay' element={<Pay />} />
        <Route path='/mypage' element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path='/admin' element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path='/admin/members' element={<AdminRoute><AdminMembers /></AdminRoute>} />
        <Route path='/admin/products' element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path='/admin/recommended' element={<AdminRoute><AdminRecommended /></AdminRoute>} />
        <Route path='/admin/notices' element={<AdminRoute><AdminNotices /></AdminRoute>} />
        <Route path='/notice' element={<Notice />} />
        <Route path='/notice/:id' element={<NoticeDetail />} />
        <Route path='/loadmap' element={<LoadMap />} />
        <Route path='/products' element={<Products />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        <Route path='/products/category/:category' element={<Products />} />
        <Route path='/search/:keyword' element={<SearchResult />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <br /><br /><br /><br />
      <Footer />
      <ScrollButtons />
    </BrowserRouter>
  )
}

export default App
