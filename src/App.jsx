import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
// import Landing from './pages/Landing/Landing'
// import Home from './pages/Home/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/" element={<Landing />} /> */}
      {/* <Route path="/home" element={<Home />} /> */}
    </Routes>
  )
}

export default App