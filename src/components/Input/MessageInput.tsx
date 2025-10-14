import React, { useState } from "react";
import { MODEL_TYPES } from "../../constants";
import "./MessageInput.css";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  loading: boolean;
  model: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, loading, model }) => {
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

  return (
    <div className="input-box">
      <input
        type="text"
        value={input}
        placeholder={`(${getModelDisplayName()}) 메시지를 입력하세요...`}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
      <button onClick={handleSend} disabled={loading || !input.trim()}>
        {loading ? "전송 중" : "전송"}
      </button>
    </div>
  );
};

export default MessageInput;
