import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
// import Home from './pages/Home/Home'
// import 나머지 페이지들...

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* <Route path="/home" element={<Home />} /> */}
      {/* <Route path="/condition" element={<ConditionInput />} /> */}
      {/* <Route path="/result" element={<Result />} /> */}
      {/* <Route path="/archive" element={<Archive />} /> */}
    </Routes>
  )
}

export default App