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

const ChatPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { messages, loading, model, setModel, sendMessage, clearMessages, connectionStatus } = useChat();
  const { darkMode, setDarkMode } = useTheme();
  const { menuOpen, setMenuOpen } = useMenu();

  // 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const statusStyles: Record<string, string> = {
    connected: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    disconnected: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    checking: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#1e3c72] via-[#667eea] to-[#f093fb] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(120,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 45% 40%, rgba(120,219,255,0.2) 0%, transparent 55%)",
        }}
      />

      <nav className="relative z-10 flex items-center justify-center border-b border-white/20 bg-white/10 px-4 py-5 backdrop-blur-2xl shadow-lg sm:px-5 sm:py-6">
        <Link
          to={ROUTES.HOME}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-medium text-white shadow-md transition duration-200 hover:-translate-y-1 hover:bg-white/25 sm:left-6 sm:text-sm"
        >
          ← 홈으로
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-transparent drop-shadow-xl sm:text-xl md:text-2xl bg-gradient-to-r from-white to-indigo-100 bg-clip-text">
          AI 상담 {user?.nickname && `- ${user.nickname}님`}
        </h1>
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-wrap items-center gap-2 text-[11px] sm:right-6 sm:text-xs md:text-sm">
          {connectionStatus && (
            <span
              className={`rounded-full border px-3 py-1 font-medium shadow-inner transition duration-200 ${statusStyles[connectionStatus] ?? "border-white/30 bg-white/15 text-white/80"}`}
            >
              {connectionStatus === "connected" && "🟢 연결됨"}
              {connectionStatus === "disconnected" && "🔴 연결 끊김"}
              {connectionStatus === "checking" && "🟡 연결 중..."}
            </span>
          )}
        </div>
      </nav>

      <div className="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pb-6 pt-4 sm:pb-8 sm:pt-6">
        <div
          className={`chat-container ${darkMode ? "dark" : "light"} relative mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl sm:max-w-lg md:max-w-xl ${darkMode ? "border-white/10 bg-slate-900/80" : "border-white/20 bg-white/15"}`}
        >
          <ChatHeader
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            model={model}
            setModel={setModel}
            clearMessages={clearMessages}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
          <ChatBox messages={messages} loading={loading} isDark={darkMode} />
          <MessageInput
            onSendMessage={sendMessage}
            loading={loading}
            model={model}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
