import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Routes와 Link를 사용하려면 앱 전체를 BrowserRouter로 감싸야 합니다. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
