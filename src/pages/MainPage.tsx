import React from "react";
import { Link } from "react-router-dom";
import { handleImageError } from "../utils";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants";

const NAV_LINK_CLASS =
  "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-md backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

const MainPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1e3c72] via-[#667eea] to-[#f093fb] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(120,119,198,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120,219,255,0.25) 0%, transparent 50%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/15 bg-white/10 backdrop-blur-2xl shadow-lg">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <Link
            className="text-center text-2xl font-bold tracking-tight text-transparent sm:text-3xl md:text-left md:text-[2rem] bg-gradient-to-r from-white to-indigo-100 bg-clip-text drop-shadow-lg"
            to={ROUTES.HOME}
          >
            다독임 - 심리 상담 서비스
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:justify-end">
            <Link
              className={NAV_LINK_CLASS}
              to={ROUTES.HOME}
            >
              홈
            </Link>
            <Link
              className={NAV_LINK_CLASS}
              to={ROUTES.CHAT}
            >
              AI 상담
            </Link>
            <Link
              className={NAV_LINK_CLASS}
              to={ROUTES.MAP}
            >
              지도
            </Link>
            <Link
              className={NAV_LINK_CLASS}
              to={ROUTES.CALENDAR}
            >
              캘린더
            </Link>
            {isAuthenticated ? (
              <Link
                to={ROUTES.USER}
                className={`${NAV_LINK_CLASS} border-white/30 bg-white/20 font-semibold hover:bg-white/30`}
              >
                👤 {user?.nickname || user?.username || '사용자'}
              </Link>
            ) : (
              <Link
                className={NAV_LINK_CLASS}
                to={ROUTES.LOGIN}
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-24">
        {/* Hero */}
        <section className="py-16 text-center sm:py-20 md:py-24">
          <h1 className="text-3xl font-bold tracking-tight text-transparent drop-shadow-xl sm:text-4xl md:text-5xl bg-gradient-to-r from-white to-indigo-50 bg-clip-text">
            당신의 정신 건강 여정에 오신 것을 환영합니다
            {isAuthenticated && user?.nickname && (
              <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">
                , {user.nickname}님!
              </span>
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-white/80 sm:text-base md:text-lg">
            다독임은 AI 상담, 주변 병원 검색, 복약 및 감정 기록을 한 곳에서 관리할 수 있는 통합 심리 케어 플랫폼입니다.
          </p>
          <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 p-8 text-base leading-relaxed backdrop-blur-2xl shadow-2xl sm:p-12 sm:text-lg md:mt-12 md:p-16">
            배너 / 소개 이미지
          </div>
        </section>

        {/* 서비스 카드 */}
        <section className="py-14 sm:py-16 md:py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-transparent drop-shadow-xl sm:text-3xl md:text-4xl bg-gradient-to-r from-white to-indigo-50 bg-clip-text">
            이용 가능한 서비스
          </h2>

          <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {/* AI 상담 챗봇 */}
            <Link
              className="group relative flex flex-col rounded-2xl border border-white/15 bg-white/10 p-6 text-left shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:bg-white/20 sm:p-8 lg:p-10"
              to={ROUTES.CHAT}
              aria-label="AI 상담 챗봇으로 이동"
            >
              <div className="mb-5 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:mb-6">
                <img
                  className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-40"
                  src="/src/assets/ai_img.png"
                  alt="AI 상담 챗봇"
                  loading="lazy"
                  onError={handleImageError}
                />
              </div>
              <strong className="text-lg font-semibold text-white sm:text-xl">AI 상담 시작하기</strong>
              <p className="mt-2 text-sm text-white/80 sm:mt-3">
                간단한 고민을 챗봇에게 먼저 이야기해보세요.
              </p>
            </Link>

            {/* 주변 병원 검색(지도 페이지 이동) */}
            <Link
              className="group relative flex flex-col rounded-2xl border border-white/15 bg-white/10 p-6 text-left shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:bg-white/20 sm:p-8 lg:p-10"
              to={ROUTES.MAP}
              aria-label="주변 병원 검색으로 이동"
            >
              <div className="mb-5 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:mb-6">
                <img
                  className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-40"
                  src="/src/assets/map-preview.png"
                  alt="지도 미리보기"
                  loading="lazy"
                  onError={handleImageError}
                />
              </div>
              <strong className="text-lg font-semibold text-white sm:text-xl">주변 병원 검색</strong>
              <p className="mt-2 text-sm text-white/80 sm:mt-3">
                지도에서 병원을 찾고 상세 정보를 확인해요.
              </p>
            </Link>

            {/* 캘린더 */}
            <Link
              className="group relative flex flex-col rounded-2xl border border-white/15 bg-white/10 p-6 text-left shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:bg-white/20 sm:p-8 lg:p-10"
              to={ROUTES.CALENDAR}
              aria-label="캘린더"
            >
              <div className="mb-5 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:mb-6">
                <img
                  className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-40"
                  src="/src/assets/calender.png"
                  alt="캘린더"
                  loading="lazy"
                  onError={handleImageError}
                />
              </div>
              <strong className="text-lg font-semibold text-white sm:text-xl">캘린더</strong>
              <p className="mt-2 text-sm text-white/80 sm:mt-3">
                약물 캘린더 확인하기
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
