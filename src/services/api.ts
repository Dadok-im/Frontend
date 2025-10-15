import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../constants";
import { refreshAccessToken, fetchWithAccess } from "../utils";
import type { ChatApiResponse, Clinic } from "../types";

// =============================
// 🟢 Axios 인스턴스 기본 설정
// =============================
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =============================
// 🟢 요청 인터셉터
// =============================
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    console.log(
      "API 요청:",
      config.method?.toUpperCase(),
      config.url,
      accessToken ? "(토큰 있음)" : "(토큰 없음)"
    );

    // ✅ JWT 토큰 자동 주입
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    console.error("요청 인터셉터 에러:", error);
    return Promise.reject(error);
  }
);

// =============================
// 🟢 응답 인터셉터
// =============================
apiClient.interceptors.response.use(
  (response) => {
    console.log("API 응답:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    const { response, config } = error;
    console.error(
      "API 에러:",
      response?.status,
      response?.data,
      response?.config?.url
    );
    console.error("에러 상세:", error);
    console.error("요청 헤더:", config?.headers);
    console.error("요청 데이터:", config?.data);

    // ✅ 400 Bad Request → 요청 형식 오류
    if (response?.status === 400) {
      console.error("❌ 400 에러 - 잘못된 요청:", response?.data);
      console.error("요청 URL:", config?.url);
      console.error("요청 메서드:", config?.method);
      console.error("요청 헤더:", config?.headers);
    }
    
    // ✅ 401 Unauthorized → 로그인 페이지로 이동
    if (response?.status === 401) {
      console.error("❌ 401 에러 - 인증 실패, 로그인 페이지로 이동");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // ✅ 403 Forbidden
    if (response?.status === 403) {
      console.warn("🚫 접근 권한이 없습니다.");
    }

    // ✅ 400 Bad Request (잘못된 요청)
    if (response?.status === 400) {
      console.warn("⚠️ 잘못된 요청입니다. URL 또는 요청 본문을 확인하세요.");
    }

    // ✅ 네트워크 에러
    if (error.code === "ECONNREFUSED") {
      console.error("🌐 백엔드 서버에 연결할 수 없습니다.");
    }

    return Promise.reject(error);
  }
);

// ======================================================
// 🧠 Gemini / ChatGPT API 요청
// ======================================================
export const sendGeminiMessage = async (
  messages: any[]
): Promise<ChatApiResponse> => {
  console.log("Gemini 메시지 요청:", messages);
  
  const url = `${API_BASE_URL}${API_ENDPOINTS.GEMINI}`;
  
  const response = await fetchWithAccess(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });
  
  return await response.json();
};

export const sendChatGPTMessage = async (
  messages: any[]
): Promise<ChatApiResponse> => {
  console.log("ChatGPT 메시지 요청:", messages);
  
  const url = `${API_BASE_URL}${API_ENDPOINTS.CHAT}`;
  
  const response = await fetchWithAccess(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });
  
  return await response.json();
};

// ======================================================
// 🧾 Gemini 대화 기록 조회 (JWT 인증 필요)
// ======================================================
export const fetchChatHistory = async (): Promise<any[]> => {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GEMINI_HISTORY}`;
  
  try {
    console.log("📡 대화 기록 요청 →", url);
    
    const response = await fetchWithAccess(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log("✅ 대화 기록 응답:", response.status, data.length);
    return data ?? [];
  } catch (error: any) {
    console.error("❌ 대화 기록 요청 실패:", error);
    throw error;
  }
};

// ======================================================
// 🗺️ 클리닉 검색 API (fetchWithAccess 사용)
// ======================================================
export const searchClinics = async (params: {
  lat: number;
  lng: number;
  q: string;
  page?: number;
  size?: number;
  radius?: number;
}): Promise<Clinic[]> => {
  // URL 파라미터 생성
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const url = `${API_BASE_URL}/api/clinics/search?${searchParams.toString()}`;
  
  try {
    const response = await fetchWithAccess(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("클리닉 검색 API 에러:", error);
    throw error;
  }
};
