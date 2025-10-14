import React from "react";
import { MESSAGE_ROLES } from "../../constants";
import type { ChatMessage } from "../../types";
import "./MessageBubble.css";

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const isUser = message.role === MESSAGE_ROLES.USER;
  const avatarUrl = isUser 
    ? "https://i.pravatar.cc/40?img=3" 
    : "https://i.pravatar.cc/40?img=12";

  return (
    <div className={`message-row ${isUser ? "user-row" : "assistant-row"}`}>
      {!isUser && (
        <img
          src={avatarUrl}
          alt="assistant"
          className="avatar"
        />
      )}
      <div className={`message-bubble ${message.role}`}>
        {message.content}
      </div>
      {isUser && (
        <img
          src={avatarUrl}
          alt="user"
          className="avatar"
        />
      )}
    </div>
  );
};

export default MessageBubble;
