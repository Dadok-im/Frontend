// API 관련 상수
export const API_BASE_URL = "http://localhost:8080";

// AI 모델 타입
export const MODEL_TYPES = {
  GEMINI: "gemini",
  CHATGPT: "chat"
} as const;

// 메시지 역할
export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant"
} as const;

// 기본 메시지
export const DEFAULT_MESSAGES = {
  WELCOME: "안녕하세요! 무엇이든 편하게 이야기해 주세요 😊",
  CONNECTION_ERROR: "⚠️ 서버와 연결할 수 없습니다. 대화 기록을 불러올 수 없습니다.",
  SEND_ERROR: "⚠️ 서버와 연결할 수 없습니다."
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  GEMINI: "/api/gemini",
  CHAT: "/api/chat",
  GEMINI_HISTORY: "/api/gemini/history/all",
  DIARY: "/api/diary",
  DIARY_LIST: "/api/diary/list"
} as const;

// 라우트 경로
export const ROUTES = {
  HOME: "/",
  CHAT: "/chat",
  MAP: "/map",
  CALENDAR: "/calendar",
  LOGIN: "/login",
  JOIN: "/join",
  USER: "/user",
  OAUTH_CALLBACK: "/oauth/callback",
  COOKIE: "/cookie"
} as const;
