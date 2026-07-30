// Routes와 Route를 사용하려면 react-router-dom에서 반드시 import해야 합니다.
import { Routes, Route } from 'react-router-dom'
import Detail from './Detail'
import About from './About'
import Home from './Home'
import Header from './Header'
import Products from './Products'

const App = () => {
  return (
    <div>
      {/* 페이지 이동 링크는 Header 컴포넌트에서 관리합니다. */}
      <Header />

      {/* 현재 주소와 일치하는 Route의 컴포넌트를 화면에 보여줍니다. */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/products' element={<Products />} />
        <Route path='/detail' element={<Detail />} />
      </Routes>

      <Routes>
        {/* 한번 더 적으면 한번 더 나타남 */}
        <Route path='/detail'element={<Detail />} />
      </Routes>
    </div>
  )
}

export default App
