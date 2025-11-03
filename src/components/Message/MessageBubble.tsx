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
  const userBubble = "bg-indigo-500 text-white rounded-br-md";
  const assistantBubble = isDark
    ? "border border-slate-700 bg-slate-800/90 text-slate-100 rounded-bl-md"
    : "border border-slate-200 bg-white/90 text-slate-800 rounded-bl-md";

  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <img
          src={avatarUrl}
          alt="assistant"
          className="h-8 w-8 rounded-full border border-white/30 object-cover shadow-sm sm:h-9 sm:w-9"
        />
      )}
      <div className={`${bubbleBase} ${isUser ? userBubble : assistantBubble}`}>
        {message.content}
      </div>
      {isUser && (
        <img
          src={avatarUrl}
          alt="user"
          className="h-8 w-8 rounded-full border border-white/30 object-cover shadow-sm sm:h-9 sm:w-9"
        />
      )}
    </div>
  );
};

export default MessageBubble;
