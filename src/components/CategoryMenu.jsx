import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './CategoryMenu.module.scss'

const CategoryMenu = () => {
  const [categories, setCategories] = useState([])
  const categoryMenuRef = useRef(null)

  useEffect(()=>{
      const loadCategory = async ()=>{
        const res=await fetch('/data/categories-fixed.json')
        const categoryData=await res.json()
        setCategories(categoryData)
      }
      loadCategory()
  }, [])

  useEffect(() => {
    const titleItems = categoryMenuRef.current?.querySelectorAll(`.${styles.titleArea} p, .${styles.titleArea} h2`)
    const categoryItems = categoryMenuRef.current?.querySelectorAll(`.${styles.categoryList} a`)
    const revealItems = [...(titleItems || []), ...(categoryItems || [])]
    if (!revealItems.length) return undefined

    titleItems.forEach((item, index) => {
      item.classList.add(styles.revealUp)
      item.style.transitionDelay = `${index * 180}ms`
    })
    categoryItems.forEach((item, index) => {
      item.classList.add(styles.revealFromRight)
      item.style.transitionDelay = `${index * 120}ms`
    })

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add(styles.revealed)
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.25 })

    let animationFrame = requestAnimationFrame(() => {
      animationFrame = requestAnimationFrame(() => {
        revealItems.forEach((item) => observer.observe(item))
      })
    })
    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
  }, [categories])

  return (
    <section ref={categoryMenuRef} className={styles.categoryMenu}>
      <div className={styles.titleArea}>
        <p>SHOP BY CATEGORY</p>
        <h2>카테고리별 상품</h2>
      </div>

      <div className={styles.categoryList}>
      {
        categories.map((item)=>(
          <Link key={item.id} to={item.path}>
            <div>
              {
                item.image ? (<img src={item.image} alt={item.name}/>)
                 : (<span>ALL</span>)
                 
              }
              <strong>{item.name}</strong>
            </div>
          </Link>
        ))
      }
      </div>
    </section>
  )
}

export default CategoryMenu
