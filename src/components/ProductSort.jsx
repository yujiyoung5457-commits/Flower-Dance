import React from 'react'
import styles from './ProductSort.module.scss'

const ProductSort = ({sortType, setSortType}) => {
  return (
    <div className={styles.root}>
      <label className={styles.wrap}>정렬:</label>
      <select className={styles.select} value={sortType} onChange={(e)=>{setSortType(e.target.value)}}>
        <option value='latest'>최신순</option>
        <option value='low'>낮은가격순</option>
        <option value='high'>높은가격순</option>
      </select>
    </div>
  )
}

export default ProductSort
