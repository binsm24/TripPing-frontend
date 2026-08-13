// TODO: 이 파일은 임시 스텁입니다.
// 실제 홈 화면은 다른 브랜치(예: feat/#8-landing, feat/#9-login)에서 작업 중이며,
// 그 브랜치가 develop에 머지되면 이 파일은 진짜 Home 화면 코드로 덮어써야 합니다.
// 지금은 App.jsx가 에러 없이 실행되도록만 최소한으로 만들어둔 자리표시자입니다.

function Home() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Home (준비 중)</h1>
      <p>실제 홈 화면은 다른 브랜치에서 작업 중입니다.</p>
      <p>
        주요 관광지 선택 화면을 보려면 주소창에{' '}
        <code>http://localhost:5173/spots</code> 를 입력하세요.
      </p>
    </div>
  )
}

export default Home
