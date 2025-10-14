import { useState, useEffect } from "react";
import {
  sendGeminiMessage,
  sendChatGPTMessage,
  fetchChatHistory,
} from "../services/api";
import { MODEL_TYPES, MESSAGE_ROLES, DEFAULT_MESSAGES } from "../constants";
import type { ChatMessage } from "../types";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<string>(MODEL_TYPES.GEMINI);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");

  /**
   * 🟢 초기 대화 기록 불러오기
   * 로그인된 사용자의 accessToken이 존재할 때만 서버에 요청을 보냅니다.
   */
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setConnectionStatus("checking");

        // ✅ accessToken 존재 여부 확인
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          console.warn("⚠️ AccessToken이 존재하지 않아 요청을 취소합니다.");
          setConnectionStatus("disconnected");
          setMessages([
            {
              role: MESSAGE_ROLES.ASSISTANT,
              content: "로그인이 필요합니다. 로그인 후 다시 시도해주세요.",
            },
          ]);
          return;
        }

         console.log("현재 accessToken 존재:", !!accessToken);
         
         // JWT 토큰 디코딩해서 내용 확인
         if (accessToken) {
           try {
             const payload = JSON.parse(atob(accessToken.split('.')[1]));
             console.log("JWT 토큰 내용:", payload);
             console.log("사용자 역할:", payload.role);
           } catch (e) {
             console.error("JWT 토큰 디코딩 실패:", e);
           }
         }

        // ✅ accessToken이 유효한 경우에만 요청
        const historyData = await fetchChatHistory();
        console.log("서버 응답:", historyData);
        console.log("데이터 타입:", typeof historyData);
        console.log("배열 여부:", Array.isArray(historyData));

        // 데이터가 배열인지 확인
        if (!Array.isArray(historyData)) {
          console.error("서버 응답이 배열이 아닙니다:", historyData);
          setMessages([
            {
              role: MESSAGE_ROLES.ASSISTANT,
              content: "대화 기록을 불러올 수 없습니다. 서버 응답 형식에 문제가 있습니다.",
            },
          ]);
          setConnectionStatus("disconnected");
          return;
        }

        const historyMessages = historyData.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));

        // 대화가 비어있을 경우 환영 메시지 출력
        if (historyMessages.length === 0) {
          setMessages([
            {
              role: MESSAGE_ROLES.ASSISTANT,
              content: DEFAULT_MESSAGES.WELCOME,
            },
          ]);
        } else {
          setMessages(historyMessages);
        }

        setConnectionStatus("connected");
      } catch (error: any) {
        console.error("대화 기록을 불러오는 중 오류 발생:", error);
        console.error("에러 상세:", error?.response?.data || error.message);

        const status = error?.response?.status;
        if (status === 401) {
          setMessages([
            {
              role: MESSAGE_ROLES.ASSISTANT,
              content: "세션이 만료되었습니다. 다시 로그인해주세요.",
            },
          ]);
        } else if (status === 403) {
          setMessages([
            {
              role: MESSAGE_ROLES.ASSISTANT,
              content: "접근 권한이 없습니다.",
            },
          ]);
        } else {
          setMessages([
            {
              role: MESSAGE_ROLES.ASSISTANT,
              content: DEFAULT_MESSAGES.CONNECTION_ERROR,
            },
          ]);
        }

        setConnectionStatus("disconnected");
      }
    };

    // ✅ accessToken이 저장될 시간을 확보하기 위해 약간 지연 실행
    const delayLoad = setTimeout(loadHistory, 300);
    return () => clearTimeout(delayLoad);
  }, []);

  /**
   * 🟢 메시지 전송 로직
   * Gemini 또는 ChatGPT 모델에 따라 API를 호출하고 응답을 화면에 출력합니다.
   */
  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      role: MESSAGE_ROLES.USER,
      content: input,
    };
    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);

    try {
      setConnectionStatus("checking");

      // ✅ 선택된 모델에 따라 API 호출
      const apiCall =
        model === MODEL_TYPES.GEMINI ? sendGeminiMessage : sendChatGPTMessage;

      const response = await apiCall([newMessage]);
      const reply = response.reply;
      const formattedReply = reply.split("\n\n");

      // 여러 문단으로 나뉜 답변을 각각 메시지 버블로 출력
      formattedReply.forEach((paragraph) => {
        setMessages((prev) => [
          ...prev,
          { role: MESSAGE_ROLES.ASSISTANT, content: paragraph },
        ]);
      });

      setConnectionStatus("connected");
    } catch (error) {
      console.error("API 호출 에러:", error);
      setConnectionStatus("disconnected");
      setMessages((prev) => [
        ...prev,
        {
          role: MESSAGE_ROLES.ASSISTANT,
          content: DEFAULT_MESSAGES.SEND_ERROR,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🟢 대화 초기화 (화면 리셋용)
   */
  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    model,
    setModel,
    sendMessage,
    clearMessages,
    connectionStatus,
  };
};
