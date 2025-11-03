import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchWithAccess } from "../utils";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants";

// .env로 부터 백엔드 URL 받아오기
const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

interface UserInfo {
  username: string;
  nickname: string;
  email: string;
}

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // 정보
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState('');
  const [logoutMsg, setLogoutMsg] = useState('');

  // 페이지 방문시 유저 정보 요청
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const res = await fetchWithAccess(`${BACKEND_API_BASE_URL}/api/user/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("유저 정보 불러오기 실패");

        const data = await res.json();
        setUserInfo(data);
        
      } catch (err) {
        setError("유저 정보를 불러오지 못했습니다.");
      }
    };

    getUserInfo();
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
        const res = await fetch(`${BACKEND_API_BASE_URL}/logout`, {
            method: "POST",
            credentials: "include",  // 쿠키 포함
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }), // refreshToken을 Body에 포함
        });
        
        if(!res.ok) throw new Error("로그아웃 실패");

        // 서버가 200 OK 응답을 보내면 로그아웃 성공 처리
        setLogoutMsg("로그아웃 되었습니다.");
        setUserInfo(null);  // 사용자 정보 초기화
        
        // AuthContext에서 로그아웃 처리
        logout();

        navigate(ROUTES.HOME); // 메인 페이지로 이동
    
    } catch (err) {
        setLogoutMsg("로그아웃 중 오류가 발생했습니다.");
        console.error(err);  // 에러 로그 출력
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e3c72] via-[#667eea] to-[#f093fb] px-4 py-10 text-white sm:px-6 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(120,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 45% 40%, rgba(120,219,255,0.2) 0%, transparent 55%)",
        }}
      />

      <nav className="relative z-10 grid w-full max-w-xl grid-cols-1 items-center gap-4 px-3 text-center sm:grid-cols-[auto_1fr_auto] sm:gap-3 sm:px-4 sm:text-left">
        <Link
          to={ROUTES.HOME}
          className="mx-auto rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold text-white shadow-md transition duration-200 hover:-translate-y-1 hover:bg-white/25 sm:mx-0 sm:text-sm"
        >
          ← 홈으로
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-transparent drop-shadow-xl sm:text-2xl md:text-3xl bg-gradient-to-r from-white to-indigo-100 bg-clip-text">
          내 정보
        </h1>
        <div className="hidden h-4 w-4 sm:block" />
      </nav>

      <div className="relative z-10 mt-8 w-full max-w-xl rounded-3xl border border-white/20 bg-white/12 p-6 text-white shadow-2xl backdrop-blur-2xl sm:p-8 md:p-10">
        {error && (
          <p className="mb-6 rounded-xl border-l-4 border-rose-400 bg-rose-400/10 px-4 py-3 text-xs text-rose-100 sm:text-sm">
            {error}
          </p>
        )}

        {userInfo ? (
          <>
            <div className="space-y-4 text-xs text-white/90 sm:text-sm">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 shadow-inner sm:px-5">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-white/60 sm:text-xs">
                  아이디
                </span>
                <span className="mt-1 block text-sm font-semibold text-white sm:text-base">
                  {userInfo.username}
                </span>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 shadow-inner sm:px-5">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-white/60 sm:text-xs">
                  닉네임
                </span>
                <span className="mt-1 block text-sm font-semibold text-white sm:text-base">
                  {userInfo.nickname}
                </span>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 shadow-inner sm:px-5">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-white/60 sm:text-xs">
                  이메일
                </span>
                <span className="mt-1 block text-sm font-semibold text-white break-words sm:text-base">
                  {userInfo.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-8 w-full rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-xs font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl sm:px-6 sm:text-sm"
            >
              로그아웃
            </button>
          </>
        ) : (
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-6 text-center text-xs text-white/85 sm:px-6 sm:py-8 sm:text-sm">
            <p className="text-sm sm:text-base">로그인이 필요합니다.</p>
            <Link
              to={ROUTES.LOGIN}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl sm:text-sm"
            >
              로그인하러 가기
            </Link>
          </div>
        )}

        {logoutMsg && (
          <p className="mt-6 rounded-xl border-l-4 border-emerald-400 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-100 sm:text-sm">
            {logoutMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserPage;
