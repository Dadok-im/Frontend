// 유틸리티 함수들

/**
 * 오늘 날짜를 "YYYY년 MM월 DD일" 형식으로 반환
 */
export const getFormattedToday = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 두 지점 간의 거리를 계산 (Haversine 공식)
 * @param lat1 첫 번째 지점의 위도
 * @param lon1 첫 번째 지점의 경도
 * @param lat2 두 번째 지점의 위도
 * @param lon2 두 번째 지점의 경도
 * @returns 거리 (킬로미터)
 */
export const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 지구의 반지름 (킬로미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * 이미지 로드 실패 시 기본 이미지로 대체
 * @param event 이미지 로드 이벤트
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
  const target = event.target as HTMLImageElement;
  target.src = '/src/assets/placeholder.png'; // 기본 이미지로 대체
  target.alt = '이미지를 불러올 수 없습니다';
};

// JWT 토큰 관련 유틸리티 함수들
export { fetchWithAccess, refreshAccessToken } from './fetchUtil';

/**
 * 쿠키에서 값을 가져오는 함수
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null
 */
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

/**
 * 쿠키를 삭제하는 함수
 * @param name 쿠키 이름
 */
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};