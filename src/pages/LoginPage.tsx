import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants";
import "./LoginPage.css";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username === "" || password === "") {
      setError("아이디와 비밀번호를 입력하세요.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("로그인 실패");

      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // 토큰 저장 후 사용자 정보 가져오기
      try {
        const userResponse = await fetch(`${BACKEND_API_BASE_URL}/api/user/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          // 사용자 정보를 AuthContext에 저장
          login(userData);
        } else {
          console.error('사용자 정보 가져오기 실패');
        }
      } catch (userError) {
        console.error('사용자 정보 요청 중 오류:', userError);
      }

      // 로그인 후 메인 페이지로 리디렉션
      navigate(ROUTES.HOME);

    } catch (err) {
      setError("아이디 또는 비밀번호가 틀렸습니다.");
    }
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = `${BACKEND_API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>로그인</h2>

        <form onSubmit={handleLogin}>
          <label>아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn">
            로그인
          </button>
        </form>

        {/* Naver 소셜 로그인 */}
        <button
          className="naver-login-btn"
          onClick={() => handleSocialLogin("naver")}
        >
          NAVER로 로그인
        </button>

        <p className="signup-text">
          아직 계정이 없으신가요? <a href={ROUTES.JOIN}>회원가입</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
