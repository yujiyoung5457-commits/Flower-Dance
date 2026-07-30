import React from 'react'
import styles from './OrderSummary.module.scss'

const OrderSummary = ({subTotal,deliveryFree,totalPrice,onOrder }) => {
  return (
    <aside className={styles.aside}>
      <h2>결제금액</h2>
        <div>
          <span>상품금액:&nbsp;&nbsp;</span>
          <strong>{subTotal.toLocaleString()}원</strong>
          
        </div>

        <div>
          <span>배송비:&nbsp;&nbsp;</span>
          <strong>{deliveryFree===0 ? '무료🥰' : `${deliveryFree.toLocaleString()}원` }</strong>
        </div>

        <div>
          <span>총결제금액:&nbsp;</span>
          <strong>{totalPrice.toLocaleString()}원</strong>
        </div>
          <button onClick={onOrder} disabled={subTotal===0}>주문하기</button>
    </aside>
  )
}

export default OrderSummary
