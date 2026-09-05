// src/pages/storage/api.js

import { apiGet, apiDelete } from '../../api/client';
import { getUserId } from '../../components/auth';

const formatTag = (t) =>
  typeof t === 'string' ? (t.startsWith('#') ? t : `#${t}`) : null;

function adaptSummary(raw) {
  return {
    savedCourseId: raw.savedCourseId,
    courseTitle: raw.courseTitle ?? '이름 없는 코스',
    summary: raw.summary ?? '',
    mapImageUrl: raw.mapImageUrl ?? null,
    tags: (raw.tags ?? []).map(formatTag).filter(Boolean),
    savedAt: raw.savedAt,
    estimatedDuration: raw.estimatedDuration ?? null,
  };
}

export async function getSavedCourses() {
  const userId = getUserId();
  if (!userId) return [];

  const rawResponse = await apiGet(`/api/saved-courses?userId=${encodeURIComponent(userId)}`);

  // ApiResponse 래퍼 언래핑: 배열이 직접 오거나 data 필드 내부에 들어있는 경우 모두 대응
  const list = Array.isArray(rawResponse)
    ? rawResponse
    : Array.isArray(rawResponse?.data)
      ? rawResponse.data
      : [];

  return list.map(adaptSummary);
}

export async function getSavedCourseDetail(savedCourseId) {
  const rawResponse = await apiGet(`/api/saved-courses/${encodeURIComponent(savedCourseId)}`);

  // ApiResponse 래퍼 언래핑
  const detail = rawResponse?.data ?? rawResponse;

  const places = (detail?.places ?? []).map((p) => ({
    ...p,
    description: p.summary,
  }));

  const tags = (detail?.tags ?? []).map(formatTag).filter(Boolean);

  return { ...detail, places, tags };
}

export async function deleteSavedCourse(savedCourseId) {
  const rawResponse = await apiDelete(`/api/saved-courses/${encodeURIComponent(savedCourseId)}`);
  return rawResponse?.data ?? rawResponse;
}