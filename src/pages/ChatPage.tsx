import React from "react";
import { Link, Navigate } from "react-router-dom";
import ChatHeader from "../components/Header/ChatHeader";
import ChatBox from "../components/Chat/ChatBox";
import MessageInput from "../components/Input/MessageInput";
import { useChat } from "../hooks/useChat";
import { useTheme } from "../hooks/useTheme";
import { useMenu } from "../hooks/useMenu";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants";
import "./ChatPage.css";

const ChatPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { messages, loading, model, setModel, sendMessage, clearMessages, connectionStatus } = useChat();
  const { darkMode, setDarkMode } = useTheme();
  const { menuOpen, setMenuOpen } = useMenu();

  // 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="chat-page">
      {/* 상단 네비게이션 */}
      <nav className="chat-nav">
        <Link to={ROUTES.HOME} className="nav-link">← 홈으로</Link>
        <h1>AI 상담 {user?.nickname && `- ${user.nickname}님`}</h1>
        <div className="connection-status">
          {connectionStatus === 'connected' && <span className="status-indicator connected">🟢 연결됨</span>}
          {connectionStatus === 'disconnected' && <span className="status-indicator disconnected">🔴 연결 끊김</span>}
          {connectionStatus === 'checking' && <span className="status-indicator checking">🟡 연결 중...</span>}
        </div>
      </nav>

      <div className={`chat-container ${darkMode ? "dark" : "light"}`}>
        <ChatHeader
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          model={model}
          setModel={setModel}
          clearMessages={clearMessages}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <ChatBox messages={messages} loading={loading} />
        <MessageInput
          onSendMessage={sendMessage}
          loading={loading}
          model={model}
        />
      </div>
    </div>
  );
};

export default ChatPage;
