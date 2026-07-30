import React from 'react'
import styles from './CartItem.module.scss'
import { Link } from 'react-router-dom'
import QuantityControl from './QuantityControl'

const CartItem = ({item,onChangeQuantity, onRemove}) => {
  const discountPrice=item.price-((item.price*item.discountRate)/100)
  const totPrice=discountPrice*item.quantity

  return (
    <article className={styles.wrap}>

    <div className={styles.gamssam}>
       <Link to={`/products/${item.id}`} className={styles.imageLink}>
        <img src={item.image} alt={item.name} />
        </Link>
      <div className={styles.first}>
       
      <span>{item.category}</span>
      <Link to={`/products/${item.id}`}></Link>
      <strong>{discountPrice.toLocaleString()}원</strong>
       <div className={styles.second}>
      <span>수량:&nbsp;&nbsp;</span>
      <QuantityControl className={styles.Quan} quantity={item.quantity}
      setQuantity={(newQ)=>onChangeQuantity(item.id, newQ)} maxQuantity={item.stock}/>
      {Number(item.stock || 0) === 0
        ? <strong>품절 · 수량 변경 불가</strong>
        : Number(item.stock) <= Number(item.lowStockThreshold ?? 5) && <strong>품절 임박 · {item.stock}개 남음</strong>}
    </div>
    <div className={styles.third}>
      <span>상품금액:&nbsp;&nbsp;</span>
      <strong>{totPrice.toLocaleString()}원</strong>
    </div>
    </div>

   

    
    </div>
    <div className={styles.delete}>
      {/* 삭제버튼 position absolute포지션으로 */}
      <button onClick={() => onRemove(item.id)}>×</button>
    </div>
    
    </article>
  )
}

export default CartItem
