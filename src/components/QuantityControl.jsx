import React from 'react'
import styles from './QuantityControl.module.scss'

const QuantityControl = ({quantity, setQuantity, maxQuantity}) => {

  const decreaseQuantity=()=>{
    if(quantity>1){
      setQuantity(quantity-1)
    }
  }
  const increaseQuantity=()=>{
      if(maxQuantity == null || quantity < maxQuantity){
        setQuantity(quantity+1)
      }
  }
  return (
    <div className={styles.btnBox}>
      <button onClick={decreaseQuantity} disabled={quantity===1} className={styles.pls}>
        -
      </button>
      <span className={styles.jung}>{quantity}</span>
      <button onClick={increaseQuantity} disabled={maxQuantity != null && quantity === maxQuantity} className={styles.mus}>
        +
      </button>
    </div>
  )
}

export default QuantityControl




