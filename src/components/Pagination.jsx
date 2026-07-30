import styles from './Pagination.module.scss'

const Pagination = ({ children }) => {
  return <section className={styles.root} data-component="Pagination">{children}</section>
}

export default Pagination
