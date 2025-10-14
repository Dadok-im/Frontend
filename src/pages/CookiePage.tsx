import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants";

const CookiePage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCookieToken = async () => {
      const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

      try {
        console.log("쿠키 토큰 교환 요청 시작");

        const response = await fetch(`${BACKEND_API_BASE_URL}/jwt/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        console.log("토큰 교환 응답 상태:", response.status);

        if (!response.ok) throw new Error("토큰 교환 실패");

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        console.log("토큰 교환 응답 데이터:", data);

        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        const userResponse = await fetch(`${BACKEND_API_BASE_URL}/api/user/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        console.log("사용자 정보 응답 상태:", userResponse.status);

        if (userResponse.ok) {
          const userText = await userResponse.text();
          const userData = userText ? JSON.parse(userText) : null;
          if (userData) {
            console.log("사용자 정보:", userData);
            login(userData);
          }
        }

        console.log("토큰이 저장되었으므로 로그인 성공으로 처리");
        console.log("메인 페이지로 리디렉션");
        navigate(ROUTES.HOME);
      } catch (error) {
        console.error("쿠키 토큰 처리 중 오류:", error);

        // ✅ 이미 로그인된 상태면 실패 알림 생략
        if (localStorage.getItem("accessToken")) {
          console.log("이미 로그인 상태이므로 에러 알림 생략");
          return;
        }

        alert("소셜 로그인 실패");
        navigate(ROUTES.LOGIN);
      }
    };

    handleCookieToken();
  }, [navigate, login]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      fontSize: "1.2rem",
    }}>
      로그인 처리 중...
    </div>
  );
};

export default CookiePage;
