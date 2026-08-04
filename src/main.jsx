import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
 
// Inter 폰트 - index.css의 --font-family가 실제로 이 폰트를 찾을 수 있도록 번들에 포함
// 디자인에서 쓰는 굵기(400/500/600/700)만 불러와서 용량 절약
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
 
import './index.css'
import App from './App.jsx'
 
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)