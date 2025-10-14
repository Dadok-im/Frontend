import React from "react";
import { getFormattedToday } from "../../utils";
import "./ChatHeader.css";

interface ChatHeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  model: string;
  setModel: (model: string) => void;
  clearMessages: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  menuOpen, 
  setMenuOpen, 
  model, 
  setModel, 
  clearMessages, 
  darkMode, 
  setDarkMode 
}) => {
  const today = getFormattedToday();

  return (
    <div className="chat-header">
      <span>{today}</span>
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      {menuOpen && (
        <div className="dropdown-menu">
          <ul>
            <li>
              <strong>모델 선택</strong>
              <div className="model-options">
                <button
                  className={model === "chat" ? "active" : ""}
                  onClick={() => setModel("chat")}
                >
                  ChatGPT
                </button>
                <button
                  className={model === "gemini" ? "active" : ""}
                  onClick={() => setModel("gemini")}
                >
                  Gemini
                </button>
              </div>
            </li>
            <li onClick={clearMessages}>대화 초기화</li>
            <li>
              <span className="toggle-label">다크 모드</span>
              <div
                className={`toggle-switch ${darkMode ? "active" : ""}`}
                onClick={() => setDarkMode(!darkMode)}
              >
                <div className="toggle-thumb"></div>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
