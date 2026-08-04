// src/pages/result/mockData.js
// App.jsx 미리보기용 mock 데이터 - 로딩 화면 완성되면 이 파일과 /result-preview 라우트는 삭제해도 됨
export const mockCourseResult = {
  courseId: 1,
  courseTitle: '강릉 감성 힐링 여행',
  description: '푸른 바다와 감성 카페를 함께 즐길 수 있는 하루 코스입니다.',
  mapImageUrl: 'https://via.placeholder.com/400x200.png?text=Map',
  tags: ['#자연', '#강릉', '#가족', '#힐링'],
  estimatedDuration: '약 5시간',
  places: [
    {
      order: 1,
      placeId: 101,
      name: '안목해변',
      imageUrl: 'https://via.placeholder.com/96.png?text=1',
      description: '바다와 커피거리가 어우러진 강릉 대표 관광지',
    },
    {
      order: 2,
      placeId: 401,
      name: '테라로사',
      imageUrl: 'https://via.placeholder.com/96.png?text=2',
      description: '통유리로 산과 바다를 함께 즐길 수 있는 카페',
    },
    {
      order: 3,
      placeId: 201,
      name: '경포호',
      imageUrl: 'https://via.placeholder.com/96.png?text=3',
      description: '산책하기 좋은 호수, 벚꽃 명소로도 유명',
    },
    /*
    {
      order: 4,
      placeId: 301,
      name: '초당순두부',
      imageUrl: 'https://via.placeholder.com/96.png?text=4',
      description: '바닷물로 간을 맞춘 순두부 맛집 거리',
    },
    */
  ],
};