import React from "react";
import { MESSAGE_ROLES } from "../../constants";
import type { ChatMessage } from "../../types";

interface MessageBubbleProps {
  message: ChatMessage;
  isDark: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isDark }) => {
  const isUser = message.role === MESSAGE_ROLES.USER;
  const avatarUrl = isUser
    ? "https://i.pravatar.cc/40?img=3"
    : "https://i.pravatar.cc/40?img=12";

  const bubbleBase =
    "max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm";
  const userBubble = "bg-[#4A5D73] text-[#F5F7FA] rounded-br-md";
  const assistantBubble = isDark
    ? "border border-[rgba(74,93,115,0.5)] bg-[rgba(46,54,66,0.88)] text-[#F5F7FA] rounded-bl-md"
    : "border border-[rgba(163,184,198,0.55)] bg-[rgba(245,247,250,0.9)] text-[#1E1E1E] rounded-bl-md";

  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <img
          src={avatarUrl}
          alt="assistant"
          className="h-8 w-8 rounded-full border border-[rgba(163,184,198,0.55)] object-cover shadow-sm sm:h-9 sm:w-9"
        />
      )}
      <div className={`${bubbleBase} ${isUser ? userBubble : assistantBubble}`}>
        {message.content}
      </div>
      {isUser && (
        <img
          src={avatarUrl}
          alt="user"
          className="h-8 w-8 rounded-full border border-[rgba(163,184,198,0.55)] object-cover shadow-sm sm:h-9 sm:w-9"
        />
      )}
    </div>
  );
};

export default MessageBubble;
