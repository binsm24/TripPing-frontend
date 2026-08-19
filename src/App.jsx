
import { Routes, Route } from 'react-router-dom'

import LoadingScreen from './pages/loading/loading'

export default function App() {
  return <LoadingScreen userName="김수한무..." />;
}
import Storage from './pages/storage/storage'

import Landing from './pages/Landing/Landing'
// import Home from './pages/Home/Home'

// import 나머지 페이지들...
import { Routes, Route, Navigate } from 'react-router-dom';
import Result from './pages/result/result';
import { mockCourseResult } from './pages/result/mockData';
// 파일 위치에 맞게 경로를 수정해 주세요 (예: ./pages/CourseSelectPage.jsx 인 경우)
import CourseSelectPage from './pages/expansion/ExpandSelection'

function App() {
  return (
    <Routes>

      <Route path="/" element={<Storage />} />
      {/* Home 대신 CourseSelectPage를 루트로 설정하여 바로 확인 */}
      <Route path="/" element={<CourseSelectPage />} />
      
      {/* 주석 처리된 나머지 라우트들 */}

      <Route path="/" element={<Landing />} />
      {/* <Route path="/home" element={<Home />} /> */}

      {/* <Route path="/condition" element={<ConditionInput />} /> */}
      {/* <Route path="/result" element={<Result />} /> */}
      <Route path="/archive" element={<Storage />} />
      {/* <Route path="/" element={<Home />} /> */}
      {/* <Route path="/condition" element={<ConditionInput />} /> */}
      <Route path="/result" element={<Result />} />
      {/* <Route path="/archive" element={<Archive />} /> */}

      {/* 미리보기 전용 - Home/로딩 화면 붙으면 이 라우트/mockData.js는 삭제 */}
      <Route
        path="/result-preview"
        element={<Navigate to="/result" state={{ result: mockCourseResult }} replace />}
      />

      {/* 지금은 Home이 없어서, 접속 시 바로 미리보기로 이동 (임시) */}
      <Route path="/" element={<Navigate to="/result-preview" replace />} />
    </Routes>
  );
}


export default App;
export default App

