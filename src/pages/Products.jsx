import React, {useState, useEffect} from 'react'
import { Link, useParams } from 'react-router-dom'
import QuantityControl from '../components/QuantityControl'
import ProductFilter from '../components/ProductFilter'
import ProductSort from '../components/ProductSort'
import ProductList from '../components/ProductList'
import styles from './Products.module.scss'
import { subscribeProducts } from '../firebase/productApi'

const Products = () => {
  const { category }=useParams()
  const [product, setProduct]=useState([])
  const [priceRange, setPriceRange]=useState('all')
  const [sortType, setSortType]=useState('latest')
  const [lastSlideIndex, setLastSlideIndex] = useState(0)
  const lastSlideImages = [
    '/img/cotti-plush13.png',
    '/img/cotti-plush14.png',
    '/img/cotti-plush14-1.png',
  ]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLastSlideIndex((current) => (current + 1) % lastSlideImages.length)
    }, 3500)

    return () => window.clearInterval(timer)
  }, [lastSlideImages.length])

  useEffect(()=>{
    // 관리자 재고 변경이 상품 목록에도 새로고침 없이 즉시 반영됩니다.
    return subscribeProducts(
      setProduct,
      (error) => console.error('상품 목록을 불러오지 못했습니다.', error),
    )
  }, [])
  const categoryNames = {
    kitchen: '식기/주방',
    clothes: '의류/신발',
    doll: '인형',
    'baby-food': '이유식',
    bedding: '침구류',
    toy: '장난감',
  }
  const selectedCategory = categoryNames[category]
  const categoryItem = selectedCategory
    ? product.filter((item) => item.category === selectedCategory)
    : product
  const selectIT=categoryItem.filter((item)=>{
    const disPrice=item.price-((item.price*item.discountRate)/100)
    if(priceRange==='under10'){
      return disPrice< 100000
    }

     if(priceRange==='on10'){
      return disPrice >= 100000
    }
     if(priceRange==='on20'){
      return disPrice >= 200000
    }
     if(priceRange==='on30'){
      return disPrice >= 300000
    }
    return true

  })
  // const number=[30, 20, 50, 10, 40]이렇게 있으면--> num.sort((a,b)=>a-b)//오름차순임->102030순
  //num.sort((a,b)=>b-a)-->내림차순임 504030...

  //const product=[{id: 1, price: 12345, ....}] -->product.sort((a,b)=>a.price-b.price)
  const sortItem=[...selectIT].sort((a,b)=>{
    const firstPrice=a.price-((a.price * a.discountRate)/100)
    const secondPrice=b.price-((b.price * b.discountRate)/100)
    if(sortType==='low'){
      return firstPrice-secondPrice
    }
     if(sortType==='high'){
      return secondPrice-firstPrice
    }
    return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)

  })

  // const Hangul=category ? category.name
  return (
    <section className={styles.page}>
      <div className={styles.titleArea}>
        <p>PRODUCTS</p>
        <h2>{selectedCategory || '모든상품'}</h2>
        <span>{selectIT.length}개의 상품이 있습니다.</span>
        <img src="/img/cotti01.svg" alt="마스코트01" />
      </div>
      <ProductFilter selectCategory={category || ''} priceRange={priceRange} setPriceRange={setPriceRange}/>
      <ProductSort sortType={sortType} setSortType={setSortType}/>
      <ProductList products={sortItem} priceRange={priceRange} setPriceRange={priceRange}/>

      <section className={styles.lastSection}>
        {lastSlideImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={index === lastSlideIndex ? '코티 프로모션' : ''}
            aria-hidden={index !== lastSlideIndex}
            className={index === lastSlideIndex ? styles.activeLastSlide : ''}
          />
        ))}
      </section>
    </section>
  )
}

export default Products
