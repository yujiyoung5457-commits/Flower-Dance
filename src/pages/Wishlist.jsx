import React,{useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import ProductList from '../components/ProductList'
import {loadLocal, saveLocal} from '../utils/localStorage'
import styles from './Wishlist.module.scss'
import { subscribeProducts } from '../firebase/productApi'
import { subscribeAuthState } from '../firebase/authApi'
import { deleteUserWishlistItem, getUserWishlistItems } from '../firebase/wishlistApi'

const Wishlist = () => {
  const saveWish =loadLocal('wishlist', [])
  const [wishItem, setWishItem]=useState(saveWish)
  const [latestProducts, setLatestProducts]=useState([])
  const [currentUser, setCurrentUser]=useState(null)

  useEffect(() => subscribeAuthState(setCurrentUser), [])

  useEffect(() => {
    if (!currentUser) {
      setWishItem(loadLocal('wishlist', []))
      return
    }
    getUserWishlistItems(currentUser.uid)
      .then(setWishItem)
      .catch((error) => console.error('찜 목록을 불러오지 못했습니다.', error))
  }, [currentUser])

  // 저장된 찜 상품의 오래된 재고 대신 Firestore의 최신 상품 정보를 사용합니다.
  useEffect(() => subscribeProducts(
    setLatestProducts,
    (error) => console.error('최신 찜 상품 정보를 불러오지 못했습니다.', error),
  ), [])

  const latestWishItems = latestProducts.filter((product) =>
    wishItem.some((item) => String(item.id) === String(product.id)),
  )

  const changeWish=async(productId, isLike)=>{
    //찜목록에서 찜을 취소하면 해당 카드는 화면에서 제거한다
    if(!isLike){
      if (currentUser) {
        try {
          await deleteUserWishlistItem(currentUser.uid, productId)
        } catch (error) {
          console.error('찜 상품을 삭제하지 못했습니다.', error)
          return
        }
      }
      const removeItem=wishItem.filter((item)=>item.id!==productId)
      setWishItem(removeItem)
    }
  }
  useEffect(()=>{
    if (!currentUser) saveLocal('wishlist',wishItem)
  },[currentUser, wishItem])
  return (
    <section className={styles.section1}>
      <div className={styles.box}>
        <p>Wish List</p>
        <h2>찜목록</h2>
        <span>관심목록{latestWishItems.length}개</span>
      </div>

      {
        latestWishItems.length===0 ?
        (
          <div className={styles.emptyWishlist}>
            <div className={styles.emptyText}>
              <h3>리스트가 비었습니다!</h3>
              <p>찜한 상품이 없어요<br />관심있는 상품을 찜해보세요</p>
              <Link to='/products'>찜하러가기</Link>
            </div>
            <img src='/img/cotti-plush01.png' alt='빈 찜 목록을 안내하는 코티 인형' />
          </div>
        ):(
          <ProductList products={latestWishItems} onWishItem={changeWish} />
        )
      }
    </section>
  )
}

export default Wishlist
