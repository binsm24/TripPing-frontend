import { Routes, Route } from 'react-router-dom'
// import Landing from './pages/Landing/Landing'
// import Login from './pages/Login/Login'
// import ThreeSelect from './pages/ThreeSelect/ThreeSelect'
import ConditionInput from './pages/ConditionInput/ConditionInput'
// import 나머지 페이지들...

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<Landing />} /> */}
      {/* <Route path="/login" element={<Login />} /> */}
      {/* <Route path="/select" element={<ThreeSelect />} /> */}
      <Route path="/condition" element={<ConditionInput />} />
      {/* <Route path="/result" element={<Result />} /> */}
      {/* <Route path="/archive" element={<Archive />} /> */}
    </Routes>
  )
}

export default App