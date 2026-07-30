import styles from './Modal.module.scss'

const Modal = ({ children }) => {
  return <section className={styles.root} data-component="Modal">{children}</section>
}

export default Modal
