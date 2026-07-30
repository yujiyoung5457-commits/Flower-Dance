import styles from './EmptyMessage.module.scss'
import { Link } from 'react-router-dom'

// const EmptyMessage = ({ children }) => {
//   return <section className={styles.root} data-component="EmptyMessage">{children}</section>
// }

// export default EmptyMessage


const EmptyMessage=({image, title, des, link, linkText})=>{
  return(
    <div>
      <img src={image} alt="비었습니다" />
      <h2>{title}</h2>
      <p>{des}</p>
      <Link to={link}>{linkText}</Link>
    </div>
  )
}
export default EmptyMessage
