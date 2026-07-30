import styles from './Loading.module.scss'

const Loading = ({ children }) => {
  return <section className={styles.root} data-component="Loading">{children}</section>
}

export default Loading
