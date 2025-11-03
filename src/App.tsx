import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import CalendarPage from "./pages/CalendarPage";
import DiaryPage from "./pages/DiaryPage";
import LoginPage from "./pages/LoginPage";
import JoinPage from "./pages/JoinPage";
import UserPage from "./pages/UserPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import CookiePage from "./pages/CookiePage";
import "./styles/App.css";
import { useAuthStore } from "./stores/authStore";

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!hasCheckedAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        인증 상태 확인 중...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/cookie" element={<CookiePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
