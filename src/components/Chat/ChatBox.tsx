import React from "react";
import MessageBubble from "../Message/MessageBubble";
import type { ChatMessage } from "../../types";
import "./ChatBox.css";

interface ChatBoxProps {
  messages: ChatMessage[];
  loading: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, loading }) => {
  return (
    <div className="chat-box">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} index={index} />
      ))}
      {loading && (
        <div className="message-row assistant-row">
          <div className="message-bubble assistant">... 답변 작성 중</div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
