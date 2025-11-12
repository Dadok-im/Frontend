// API 기본 정보
export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_BASE_URL || "http://localhost:8080";

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
  WELCOME: "안녕하세요! 무엇이든 편하게 이야기해 주세요.",
  CONNECTION_ERROR: "⚠️ 서버와 연결되지 않았습니다. 잠시 후 다시 시도해 주세요.",
  SEND_ERROR: "⚠️ 서버와 연결되지 않았습니다."
} as const;

// API 엔드포인트 모음
export const API_ENDPOINTS = {
  GEMINI: "/api/gemini",
  CHAT: "/api/chat",
  GEMINI_HISTORY: "/api/gemini/history/all",
  DIARY: "/api/diary",
  DIARY_LIST: "/api/diary/list",
  MEDICATIONS: "/api/medications",
  MEDICATIONS_BY_DATE: "/api/medications/by-date",
  MEDICATION_DAYS: "/api/medications/days",
  OCR: "/api/ocr",
  OCR_ECHO: "/api/ocr/echo"
} as const;

// 라우트 경로
export const ROUTES = {
  HOME: "/",
  CHAT: "/chat",
  MAP: "/map",
  CALENDAR: "/calendar",
  DIARY: "/diary",
  QUICK_PRESCRIPTION: "/quick-prescription",
  LOGIN: "/login",
  JOIN: "/join",
  USER: "/user",
  OAUTH_CALLBACK: "/oauth/callback",
  COOKIE: "/cookie"
} as const;
