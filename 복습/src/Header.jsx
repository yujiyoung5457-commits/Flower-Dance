// Link를 사용하면 새로고침 없이 React 페이지 사이를 이동할 수 있습니다.
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <nav>
      {/* Link는 <Link>내용</Link> 형태로 반드시 닫아야 합니다. */}
      <Link to='/'>홈</Link>
      <Link to='/about'>어바웃</Link>
      <Link to='/products'>상품</Link>
      <Link to='/detail'>상세</Link>
    </nav>
  )
}

export default Header
