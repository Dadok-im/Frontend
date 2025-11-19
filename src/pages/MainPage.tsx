import React from "react";
import { Link } from "react-router-dom";
import { handleImageError } from "../utils";
import { ROUTES } from "../constants";
import { useAuthStore } from "../stores/authStore";

const NAV_LINK_CLASS =
  "rounded-full border border-[#A3B8C6] bg-[#4A5D73] px-4 py-2 text-sm font-medium text-[#F5F7FA] shadow-md backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-[#5C6373] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B8C6]";

type QuickAction = {
  id: string;
  badge: string;
  title: string;
  description: string;
  pill: string;
  helper: string;
  to: string;
};

const quickActions: QuickAction[] = [
  {
    id: "capture",
    badge: "NEW",
    title: "처방전 촬영 등록",
    description: "촬영한 처방전을 OCR로 인식해 오늘 복약 정보에 즉시 반영해요.",
    pill: "OCR 업로드",
    helper: "지금 촬영하기",
    to: ROUTES.QUICK_PRESCRIPTION,
  },
  {
    id: "manual",
    badge: "TIP",
    title: "수동 입력으로 보강",
    description: "OCR이 놓친 약은 직접 입력해서 빠짐없이 기록하세요.",
    pill: "수동 입력",
    helper: "바로 기록하기",
    to: ROUTES.QUICK_PRESCRIPTION,
  },
  {
    id: "calendar",
    badge: "CARE",
    title: "오늘 복약 확인",
    description: "일정과 복약 히스토리를 한눈에 살피고 계획을 조정해요.",
    pill: "캘린더",
    helper: "오늘 기록 보기",
    to: ROUTES.CALENDAR,
  },
];

const MainPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] text-[#F5F7FA]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(163, 184, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(248, 180, 0, 0.25) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(74, 93, 115, 0.25) 0%, transparent 50%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-[rgba(163,184,198,0.25)] bg-[rgba(245,247,250,0.12)] backdrop-blur-2xl shadow-lg">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <Link
            className="bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text text-center text-2xl font-bold tracking-tight text-transparent drop-shadow-lg sm:text-3xl md:text-left md:text-[2rem]"
            to={ROUTES.HOME}
          >
            다독임 - 심리 상담 서비스
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:justify-end">
            <Link className={NAV_LINK_CLASS} to={ROUTES.HOME}>
              홈
            </Link>
            <Link className={NAV_LINK_CLASS} to={ROUTES.CHAT}>
              AI 상담
            </Link>
            <Link className={NAV_LINK_CLASS} to={ROUTES.MAP}>
              지도
            </Link>
            <Link className={NAV_LINK_CLASS} to={ROUTES.CALENDAR}>
              캘린더
            </Link>
            {isAuthenticated ? (
              <Link
                to={ROUTES.USER}
                className={`${NAV_LINK_CLASS} border-[rgba(163,184,198,0.55)] bg-[rgba(245,247,250,0.2)] font-semibold hover:bg-[rgba(245,247,250,0.32)]`}
              >
                👤 {user?.nickname || user?.username || "사용자"}
              </Link>
            ) : (
              <Link className={NAV_LINK_CLASS} to={ROUTES.LOGIN}>
                로그인
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-24">
        {/* Hero */}
        <section className="text-center pt-8 pb-4 sm:pt-12 sm:pb-6 md:pt-14 md:pb-8">
          <h1 className="bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-xl sm:text-4xl md:text-5xl">
            당신의 정신 건강 여정에 오신 것을 환영합니다
            {isAuthenticated && user?.nickname && (
              <span className="bg-gradient-to-r from-[#F8B400] to-[#F5F7FA] bg-clip-text text-transparent">
                , {user.nickname}님
              </span>
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-[#F5F7FA]/80 sm:text-base md:text-lg md:whitespace-nowrap">
            다독임은 AI 상담, 주변 병원 검색, 복약 및 감정 기록을 한 곳에서 관리할 수 있는 통합 심리 케어 플랫폼입니다.
          </p>
        </section>

        {/* Feature cards */}
        <section className="pt-6 pb-10 sm:pt-8 sm:pb-12 md:pt-10 md:pb-14">
          <h2 className="bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text text-center text-2xl font-bold tracking-tight text-transparent drop-shadow-xl sm:text-3xl md:text-4xl">
            활용 가능한 기능
          </h2>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:mt-12 sm:gap-6 lg:gap-8">
            {/* AI 상담 */}
            <Link
              className="group relative flex flex-col rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.2)] p-3 text-left shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:bg-[rgba(245,247,250,0.32)] sm:p-6 lg:p-8"
              to={ROUTES.CHAT}
              aria-label="AI 상담 챗봇으로 이동"
            >
              <div className="mb-4 overflow-hidden rounded-xl border border-[rgba(163,184,198,0.18)] bg-[rgba(245,247,250,0.08)] sm:mb-6">
                <img
                  className="h-24 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-36"
                  src="/assets/ai_img.png"
                  alt="AI 상담 챗봇"
                  loading="lazy"
                  onError={handleImageError}
                />
              </div>
              <strong className="text-sm font-semibold text-[#F5F7FA] sm:text-lg">
                AI 상담 시작하기
              </strong>
              <p className="mt-1 text-[11px] text-[#F5F7FA]/80 sm:mt-3 sm:text-sm">
                간단한 고민부터 챗봇에게 먼저 이야기해보세요.
              </p>
            </Link>

            {/* 지도 */}
            <Link
              className="group relative flex flex-col rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.2)] p-3 text-left shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:bg-[rgba(245,247,250,0.32)] sm:p-6 lg:p-8"
              to={ROUTES.MAP}
              aria-label="주변 병원 검색으로 이동"
            >
              <div className="mb-4 overflow-hidden rounded-xl border border-[rgba(163,184,198,0.18)] bg-[rgba(245,247,250,0.08)] sm:mb-6">
                <img
                  className="h-24 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-36"
                  src="/assets/map-preview.png"
                  alt="지도 미리보기"
                  loading="lazy"
                  onError={handleImageError}
                />
              </div>
              <strong className="text-sm font-semibold text-[#F5F7FA] sm:text-lg">
                주변 병원 찾기
              </strong>
              <p className="mt-1 text-[11px] text-[#F5F7FA]/80 sm:mt-3 sm:text-sm">
                가까운 병원을 찾고 상세 정보를 확인하세요.
              </p>
            </Link>

            {/* 캘린더 */}
            <Link
              className="group relative flex flex-col rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.2)] p-3 text-left shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:bg-[rgba(245,247,250,0.32)] sm:p-6 lg:p-8"
              to={ROUTES.CALENDAR}
              aria-label="캘린더로 이동"
            >
              <div className="mb-4 overflow-hidden rounded-xl border border-[rgba(163,184,198,0.18)] bg-[rgba(245,247,250,0.08)] sm:mb-6">
                <img
                  className="h-24 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-36"
                  src="/assets/calender.png"
                  alt="캘린더 미리보기"
                  loading="lazy"
                  onError={handleImageError}
                />
              </div>
              <strong className="text-sm font-semibold text-[#F5F7FA] sm:text-lg">
                복약 캘린더 확인
              </strong>
              <p className="mt-1 text-[11px] text-[#F5F7FA]/80 sm:mt-3 sm:text-sm">
                하루 복약 일정을 체크하고 기록을 남겨보세요.
              </p>
            </Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-10 sm:py-12 md:py-14">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[rgba(163,184,198,0.3)] bg-[rgba(245,247,250,0.18)] p-6 shadow-2xl backdrop-blur-2xl sm:p-8 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D1FADF]">
                빠른 작업
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#F5F7FA] sm:text-3xl">
                처방전 촬영 등록
              </h2>
              <p className="mt-3 text-sm text-[#F5F7FA]/80 sm:text-base">
                처방전 촬영, 약 등록, 오늘 복약 확인을 한 페이지에서 빠르게 처리하세요.
              </p>
            </div>
            <Link
              to={ROUTES.QUICK_PRESCRIPTION}
              className="rounded-full border border-[#A3B8C6] px-6 py-3 text-sm font-semibold text-[#F5F7FA] transition hover:-translate-y-0.5 hover:bg-[#F5F7FA]/10"
            >
              바로가기 →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                className="group flex h-full flex-col justify-between rounded-2xl border border-[rgba(163,184,198,0.25)] bg-[rgba(245,247,250,0.15)] p-6 text-left text-[#F5F7FA] shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-[rgba(245,247,250,0.25)]"
                to={action.to}
                aria-label={`${action.title} 바로가기`}
              >
                <div>
                  <span className="inline-block rounded-full bg-[#F8B400]/20 px-3 py-1 text-xs font-semibold text-[#F8B400]">
                    {action.badge}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">{action.title}</h3>
                  <p className="mt-2 text-sm text-[#F5F7FA]/80">{action.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#F5F7FA]/15 px-3 py-1 text-xs font-semibold">
                      {action.pill}
                    </span>
                    <span className="rounded-full border border-[#F5F7FA]/30 px-3 py-1 text-xs font-semibold text-[#F5F7FA]/70">
                      하루 복약 관리
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm font-semibold text-[#F5F7FA]">
                  <span>{action.helper}</span>
                  <span className="text-lg transition group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
