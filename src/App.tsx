import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainPage from "./pages/MainPage";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import CalendarPage from "./pages/CalendarPage";
import LoginPage from "./pages/LoginPage";
import JoinPage from "./pages/JoinPage";
import UserPage from "./pages/UserPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import CookiePage from "./pages/CookiePage";
import "./styles/App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/cookie" element={<CookiePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
