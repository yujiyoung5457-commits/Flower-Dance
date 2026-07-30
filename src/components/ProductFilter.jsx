import React,{useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import styles from './ProductFilter.module.scss'

const ProductFilter = ({selectCategory, priceRange, setPriceRange}) => {
  const[categories, setCategories]=useState([])
  useEffect(()=>{
    const loadCa= async ()=>{
      const res=await fetch('/data/categories-fixed.json')
      const caDta=await res.json()
       setCategories(caDta)
    }
    loadCa()
  }, [])

  const getClass=(gpath)=>{
      if(selectCategory===''){
        return gpath==='/products' ? styles.active : ''
      }

      return gpath===`/products/category/${selectCategory}` ? styles.active : ''
  }
  return (
    <div className={styles.root}>
      <div className={styles.wrap}>
        <strong>CATEGORY</strong>
        <div className={styles.map}>
            {
              categories.map((item)=>(
                <Link
                  className={`${styles.txt1} ${getClass(item.path)}`}
                  key={item.id}
                  to={item.path}
                >
                  {
                  item.name==='전체보기' ? '전체' : item.name
                }
                </Link>
              ))
            }
        </div>
      </div>

      <label className={styles.wrap2}>
         <strong>가격대:</strong>
         <select className={styles.select} value={priceRange} onChange={(e)=>setPriceRange(e.target.value)} >
          <option value="all">전체가격</option>
          <option value="under10">10만원 미만</option>
          <option value="on10">10만원 이상</option>
          <option value="on20">20만원 이상</option>
          <option value="on30">30만원 이상</option>
         </select>
      </label>
    </div>
  )
}

export default ProductFilter
