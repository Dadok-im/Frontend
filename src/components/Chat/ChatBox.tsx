import React, { useEffect, useRef } from "react";
import MessageBubble from "../Message/MessageBubble";
import type { ChatMessage } from "../../types";

interface ChatBoxProps {
  messages: ChatMessage[];
  loading: boolean;
  isDark: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, loading, isDark }) => {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가되거나 로딩 상태가 변경될 때 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  return (
    <div
      ref={chatBoxRef}
      className={`flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 text-sm leading-relaxed scroll-smooth sm:px-4 sm:py-5 ${
        isDark ? "text-[#F5F7FA]" : "text-[#1E1E1E]"
      }`}
    >
      {messages.map((message, index) => (
        <MessageBubble key={`${message.role}-${index}-${message.content.slice(0, 10)}`} message={message} isDark={isDark} />
      ))}
      {loading && (
        <div className="flex justify-start">
          <div
            className={`rounded-2xl border px-4 py-2 text-xs sm:text-sm ${
              isDark
                ? "border-[rgba(74,93,115,0.5)] bg-[rgba(46,54,66,0.88)] text-[#F5F7FA]"
                : "border-[rgba(163,184,198,0.55)] bg-[rgba(245,247,250,0.9)] text-[#4A5D73]"
            }`}
          >
            ... 답변 작성 중
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBox;
