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
    ? "bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-400"
    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400";

  return (
    <div
      className={`flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:gap-3 ${
        darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white/90"
      }`}
    >
      <input
        type="text"
        value={input}
        placeholder={`(${getModelDisplayName()}) 메시지를 입력하세요...`}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className={`w-full rounded-full px-4 py-3 text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:flex-1 sm:text-base ${inputStyles}`}
      />
      <button
        onClick={handleSend}
        disabled={loading || !input.trim()}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/60 disabled:shadow-none sm:px-6 sm:text-base"
      >
        {loading ? "전송 중" : "전송"}
      </button>
    </div>
  );
};

export default MessageInput;
