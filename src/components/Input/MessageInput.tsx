import React, { useState } from "react";
import { MODEL_TYPES } from "../../constants";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  loading: boolean;
  model: string;
  darkMode: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, loading, model, darkMode }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;

    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getModelDisplayName = () => {
    return model === MODEL_TYPES.GEMINI ? "Gemini" : "ChatGPT";
  };

  const inputStyles = darkMode
    ? "bg-[rgba(46,54,66,0.9)] border-[rgba(74,93,115,0.6)] text-[#F5F7FA] placeholder:text-[#A3B8C6]"
    : "bg-[#F5F7FA] border-[rgba(163,184,198,0.6)] text-[#1E1E1E] placeholder:text-[#5C6373]";

  return (
    <div
      className={`flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:gap-3 ${
        darkMode
          ? "border-[rgba(74,93,115,0.6)] bg-[rgba(46,54,66,0.85)]"
          : "border-[rgba(163,184,198,0.6)] bg-[rgba(245,247,250,0.95)]"
      }`}
    >
      <input
        type="text"
        value={input}
        placeholder={`(${getModelDisplayName()}) 메시지를 입력하세요...`}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className={`w-full rounded-full px-4 py-3 text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#4A5D73] sm:flex-1 sm:text-base ${inputStyles}`}
      />
      <button
        onClick={handleSend}
        disabled={loading || !input.trim()}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] px-5 py-2.5 text-sm font-semibold text-[#F5F7FA] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-[rgba(245,247,250,0.2)] disabled:text-[#F5F7FA]/60 disabled:shadow-none sm:px-6 sm:text-base"
      >
        {loading ? "전송 중" : "전송"}
      </button>
    </div>
  );
};

export default MessageInput;
