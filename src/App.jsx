import { Routes, Route } from 'react-router-dom'
// 파일 위치에 맞게 경로를 수정해 주세요 (예: ./pages/CourseSelectPage.jsx 인 경우)
import CourseSelectPage from './pages/expansion/ExpandSelection'

function App() {
  return (
    <Routes>
      {/* Home 대신 CourseSelectPage를 루트로 설정하여 바로 확인 */}
      <Route path="/" element={<CourseSelectPage />} />
      
      {/* 주석 처리된 나머지 라우트들 */}
      {/* <Route path="/condition" element={<ConditionInput />} /> */}
      {/* <Route path="/result" element={<Result />} /> */}
      {/* <Route path="/archive" element={<Archive />} /> */}
    </Routes>
  )
}

export default App
