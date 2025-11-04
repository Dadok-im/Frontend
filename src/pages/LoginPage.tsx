import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { useAuthStore } from "../stores/authStore";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

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
          // 사용자 정보를 전역 상태에 저장
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] px-4 py-12 text-[#F5F7FA] sm:px-6 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"25\" cy=\"25\" r=\"1\" fill=\"white\" opacity=\"0.08\"/><circle cx=\"75\" cy=\"75\" r=\"1\" fill=\"white\" opacity=\"0.08\"/><circle cx=\"50\" cy=\"10\" r=\"0.5\" fill=\"white\" opacity=\"0.08\"/><circle cx=\"10\" cy=\"60\" r=\"0.5\" fill=\"white\" opacity=\"0.08\"/><circle cx=\"90\" cy=\"40\" r=\"0.5\" fill=\"white\" opacity=\"0.08\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>')",
        }}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.12)] p-8 text-[#F5F7FA] shadow-2xl backdrop-blur-2xl sm:p-10 md:p-12">
        <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-transparent sm:text-3xl bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text">
          로그인
        </h2>

        <form className="space-y-5 sm:space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F5F7FA]/90 sm:text-base">
              아이디
            </label>
            <input
              className="w-full rounded-2xl border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-3 text-sm text-[#F5F7FA] shadow-inner transition duration-200 placeholder:text-[#F5F7FA]/60 focus:border-[#F5F7FA] focus:bg-[rgba(245,247,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,247,250,0.35)] sm:text-base"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F5F7FA]/90 sm:text-base">
              비밀번호
            </label>
            <input
              className="w-full rounded-2xl border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-3 text-sm text-[#F5F7FA] shadow-inner transition duration-200 placeholder:text-[#F5F7FA]/60 focus:border-[#F5F7FA] focus:bg-[rgba(245,247,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,247,250,0.35)] sm:text-base"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-lg border-l-4 border-rose-400 bg-rose-400/10 px-3 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] px-4 py-3 text-sm font-semibold text-[#F5F7FA] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl sm:text-base"
          >
            로그인
          </button>
        </form>

        <button
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#03c75a] to-[#02b150] px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl sm:text-base"
          onClick={() => handleSocialLogin("naver")}
        >
          NAVER로 로그인
        </button>

        <p className="mt-8 text-center text-xs text-[#F5F7FA]/80 sm:text-sm">
          아직 계정이 없으신가요?{" "}
          <a
            className="font-semibold text-[#F5F7FA] underline-offset-4 transition hover:underline"
            href={ROUTES.JOIN}
          >
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
