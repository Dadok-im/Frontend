import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const JoinPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 4) {
        setIsUsernameValid(null);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_API_BASE_URL}/api/user/exist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username }),
        });

        const exists = await res.json();
        setIsUsernameValid(!exists);
      } catch {
        setIsUsernameValid(null);
      }
    };

    const delay = setTimeout(checkUsername, 300);
    return () => clearTimeout(delay)
  }, [username]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      username.length < 4 ||
      password.length < 4 ||
      nickname.trim() === "" ||
      email.trim() === ""
    ) {
      setError("입력값을 다시 확인해주세요. (모든 항목은 필수이며, ID/비밀번호는 최소 4자)");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_API_BASE_URL}/api/user/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password, nickname, email }),
      });

      if (!res.ok) throw new Error("회원가입 실패");
      navigate(ROUTES.LOGIN);

    } catch {
      setError("회원가입 중 오류가 발생했습니다.");
    }
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

      <div className="relative w-full max-w-lg rounded-3xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.12)] p-8 text-[#F5F7FA] shadow-2xl backdrop-blur-2xl sm:p-10 md:p-12">
        <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-transparent sm:text-3xl bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text">
          회원 가입
        </h2>

        <form className="space-y-5 sm:space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F5F7FA]/90 sm:text-base">
              아이디
            </label>
            <input
              className="w-full rounded-2xl border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-3 text-sm text-[#F5F7FA] shadow-inner transition duration-200 placeholder:text-[#F5F7FA]/60 focus:border-[#F5F7FA] focus:bg-[rgba(245,247,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,247,250,0.35)] sm:text-base"
              type="text"
              placeholder="아이디 (4자 이상)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={4}
            />
            {username.length >= 4 && isUsernameValid === false && (
              <p className="mt-2 rounded-lg border-l-4 border-rose-400 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                이미 사용 중인 아이디입니다.
              </p>
            )}
            {username.length >= 4 && isUsernameValid === true && (
              <p className="mt-2 rounded-lg border-l-4 border-emerald-400 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                사용 가능한 아이디입니다.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F5F7FA]/90 sm:text-base">
              비밀번호
            </label>
            <input
              className="w-full rounded-2xl border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-3 text-sm text-[#F5F7FA] shadow-inner transition duration-200 placeholder:text-[#F5F7FA]/60 focus:border-[#F5F7FA] focus:bg-[rgba(245,247,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,247,250,0.35)] sm:text-base"
              type="password"
              placeholder="비밀번호 (4자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F5F7FA]/90 sm:text-base">
              이름
            </label>
            <input
              className="w-full rounded-2xl border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-3 text-sm text-[#F5F7FA] shadow-inner transition duration-200 placeholder:text-[#F5F7FA]/60 focus:border-[#F5F7FA] focus:bg-[rgba(245,247,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,247,250,0.35)] sm:text-base"
              type="text"
              placeholder="이름"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F5F7FA]/90 sm:text-base">
              이메일
            </label>
            <input
              className="w-full rounded-2xl border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-3 text-sm text-[#F5F7FA] shadow-inner transition duration-200 placeholder:text-[#F5F7FA]/60 focus:border-[#F5F7FA] focus:bg-[rgba(245,247,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,247,250,0.35)] sm:text-base"
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border-l-4 border-rose-400 bg-rose-400/10 px-3 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <button
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] px-4 py-3 text-sm font-semibold text-[#F5F7FA] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-[rgba(245,247,250,0.2)] disabled:text-[#F5F7FA]/70 disabled:shadow-none sm:text-base"
            type="submit"
            disabled={isUsernameValid === false}
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinPage;
