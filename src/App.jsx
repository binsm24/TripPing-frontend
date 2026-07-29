import { Routes, Route } from 'react-router-dom'
import Storage from './pages/storage/storage'
// import 나머지 페이지들...

function App() {
  return (
    <Routes>
      <Route path="/" element={<Storage />} />
      {/* <Route path="/condition" element={<ConditionInput />} /> */}
      {/* <Route path="/result" element={<Result />} /> */}
      <Route path="/archive" element={<Storage />} />
    </Routes>
  )
}

export default App
