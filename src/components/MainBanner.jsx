import {useEffect, useState} from 'react'
import styles from './MainBanner.module.scss'

const MainBanner = () => {
  const [banners, setBanners]=useState([])
  const [currentIndex, setCurrentIndex]=useState(0)
  useEffect(()=>{
    const loadBanners = async ()=>{
      const res=await fetch('/data/banners.json')
      const bannerData=await res.json()
      setBanners(bannerData)
    }
    loadBanners()
  }, [])
  useEffect(()=>{
    if(banners.length===0){
      return undefined
    }
   const timer= setInterval(()=>{
      setCurrentIndex((idx)=>{
        if(idx===banners.length-1){
          return 0
        }
        return idx+1
      })
    }, 4000)

    return()=>clearInterval(timer)
  }, [banners.length])

  const onprev = () => {
    setCurrentIndex((idx) => idx === 0 ? banners.length - 1 : idx - 1)
  }

  const onnext = () => {
    setCurrentIndex((idx) => idx === banners.length - 1 ? 0 : idx + 1)
  }
  if(banners.length===0){
    return <section>배너를 불러오는 중 입니다 ...</section>
  }
  const currentBanner=banners[currentIndex]

  return (
    <section className={styles.banner}>
        <div className={styles.slides}>
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              className={`${styles.slide} ${index === currentIndex ? styles.activeSlide : ''}`}
              src={banner.image}
              alt={index === currentIndex ? banner.title : ''}
              aria-hidden={index !== currentIndex}
            />
          ))}
        </div>
        <div className={styles.overlay}>
          <div className={styles.textBox}>
            <p>{currentBanner.eyebrow}</p>
            <h2>{currentBanner.title}</h2>
            <p className={styles.p2}>{currentBanner.description}</p>
          </div>
        {/*  */}
          <button className={styles.left} onClick={onprev}> &lt; </button>
          <button className={styles.right} onClick={onnext}> &gt; </button>

          <div className={styles.dots}>
            {
              banners.map((item, idx)=>(
                <button key={item.id}
                    onClick={()=>setCurrentIndex(idx)}
                    className={idx===currentIndex ? styles.active : ''}
                    />
              ))
            }
          </div>
        </div>
    </section>
  )
}

export default MainBanner
