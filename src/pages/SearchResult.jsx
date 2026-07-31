import React,{useState, useEffect} from 'react'
import { useParams } from 'react-router-dom'
import ProductList from '../components/ProductList'
import styles from './SearchResult.module.scss'
import { getProducts } from '../firebase/productApi'



const SearchResult = () => {
  const {keyword}=useParams()
  // 주소의 제일 끝에 나오는 것 =파람스
  const [searchRlt, setSearchRlt]=useState([])

  useEffect(()=>{
    const searchP=async()=>{
      try {
        const proData=await getProducts()
        const trimKeyword=keyword.toLowerCase().trim()

        const result = proData.filter((item)=>{
          const productName=String(item.name || '').toLowerCase()
          const productCategory=String(item.category || '').toLowerCase()
          return productName.includes(trimKeyword) || productCategory.includes(trimKeyword)
        })
        setSearchRlt(result)
      } catch (error) {
        console.error('검색 상품을 불러오지 못했습니다.', error)
        setSearchRlt([])
      }
    }
    searchP()
  },[keyword])

  return (
    <section>
      <div>
        <p>search</p>
        <h2>{keyword}검색 결과</h2>
        <span>{searchRlt.length}개의 검색 결과가 있습니다</span>
      </div>

      <div>
        <ProductList products={searchRlt} />
      </div>
    </section>
  )
}



export default SearchResult
