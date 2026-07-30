import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SearchBox.module.scss'

const SearchBox = () => {
  // 검색창에 입력한 글자를 저장합니다.
  const [searchKeyword, setSearchKeyword] = useState('')
  const navigate = useNavigate()

  // 검색 버튼을 누르면 검색 결과 페이지로 이동합니다.
  const searchProduct = (event) => {
    event.preventDefault()

    const keyword = searchKeyword.trim()
    if (!keyword) return

    navigate(`/search/${encodeURIComponent(keyword)}`)
    setSearchKeyword('')
  }

  return (
    <form className={styles.searchBox} onSubmit={searchProduct}>
      {/* 상품명을 입력하는 곳 */}
      <input
        className={styles.input}
        type='search'
        value={searchKeyword}
        onChange={(event) => setSearchKeyword(event.target.value)}
        placeholder='원하는 상품을 검색하세요'
        aria-label='상품 검색'
      />

      {/* 검색 실행 버튼 */}
      <button className={styles.button} type='submit'>
        Click
      </button>
    </form>
  )
}

export default SearchBox
