import React, { useEffect, useRef } from "react";
import MessageBubble from "../Message/MessageBubble";
import type { ChatMessage } from "../../types";
import "./ChatBox.css";

interface ChatBoxProps {
  messages: ChatMessage[];
  loading: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, loading }) => {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가되거나 로딩 상태가 변경될 때 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  return (
    <div className="chat-box" ref={chatBoxRef}>
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} index={index} />
      ))}
      {loading && (
        <div className="message-row assistant-row">
          <div className="message-bubble assistant">... 답변 작성 중</div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBox;
