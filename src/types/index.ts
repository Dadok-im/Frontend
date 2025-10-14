// 채팅 관련 타입
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 클리닉 관련 타입
export interface Clinic {
  id: string;
  name: string;
  address: string;
  roadAddress?: string;
  phone?: string;
  lat: number;
  lng: number;
  distance?: number;
  placeUrl: string;
}

// 지도 관련 타입
export interface MapBounds {
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
}

export interface MapCenter {
  lat: number;
  lng: number;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// 채팅 API 응답 타입
export interface ChatApiResponse {
  reply: string;
  role: string;
}

// 캘린더 관련 타입
export interface Entry {
  date: string;
  pills?: string[];
  counsel?: string[];
  diary?: boolean;
  diaryText?: string;
}
