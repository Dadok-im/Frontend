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
    title: "처방전 촬영 기록",
    description: "촬영한 처방전을 OCR로 인식해 복약 정보를 즉시 반영해요.",
    pill: "OCR 처리",
    helper: "지금 촬영하기",
    to: ROUTES.QUICK_PRESCRIPTION,
  },
  {
    id: "manual",
    badge: "TIP",
    title: "수동 입력으로 보강",
    description: "OCR에서 놓친 항목을 직접 입력해 빠짐없이 기록하세요.",
    pill: "수동 입력",
    helper: "바로 기록하기",
    to: ROUTES.QUICK_PRESCRIPTION,
  },
  {
    id: "calendar",
    badge: "CARE",
    title: "오늘 복약 확인",
    description: "일정과 복약 리스트를 확인하고 계획을 조정하세요.",
    pill: "캘린더",
    helper: "오늘 기록 보기",
    to: ROUTES.CALENDAR,
  },
];

const mobileTiles = [
  {
    id: "chat",
    title: "AI 상담\n시작하기",
    to: ROUTES.CHAT,
    icon: "💬",
    iconBg: "from-[#dce9ff] to-[#eef4ff]",
    iconColor: "text-[#1d4ed8]",
    cardBg: "from-[#dce9ff] to-[#eef4ff]",
  },
  {
    id: "map",
    title: "주변 병원 찾기",
    to: ROUTES.MAP,
    icon: "📍",
    iconBg: "from-[#ffe7d3] to-[#fff3e1]",
    iconColor: "text-[#b45309]",
    cardBg: "from-[#ffe7d3] to-[#fff3e1]",
  },
  {
    id: "calendar",
    title: "복약 캘린더\n확인",
    to: ROUTES.CALENDAR,
    icon: "📅",
    iconBg: "from-[#e9dcff] to-[#f4edff]",
    iconColor: "text-[#6b21a8]",
    cardBg: "from-[#e9dcff] to-[#f4edff]",
  },
  {
    id: "prescription",
    title: "처방전\n등록하기",
    to: ROUTES.QUICK_PRESCRIPTION,
    icon: "📝",
    iconBg: "from-[#dff5e5] to-[#eefbf0]",
    iconColor: "text-[#15803d]",
    cardBg: "from-[#dff5e5] to-[#eefbf0]",
  },
];

const MainPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userName = user?.nickname || user?.username;

  return (
    <>
      {/* Mobile Layout */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] text-[#F5F7FA] min-[500px]:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 20% 80%, rgba(163, 184, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(248, 180, 0, 0.25) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(74, 93, 115, 0.25) 0%, transparent 50%)",
          }}
        />
        <header className="relative z-10 flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-[#F5F7FA]">다독임</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#F5F7FA] shadow-sm backdrop-blur">
              mind care
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to={isAuthenticated ? ROUTES.USER : ROUTES.LOGIN}
              className="rounded-full border border-white/30 bg-white/15 px-3 py-2 text-xs font-semibold text-[#F5F7FA] shadow-sm backdrop-blur"
            >
              {isAuthenticated ? "내정보" : "로그인"}
            </Link>
          </nav>
        </header>

        <div className="relative z-10 px-5 pb-14">
          <div className="overflow-hidden rounded-3xl bg-white/92 p-6 shadow-[0_15px_40px_rgba(21,34,49,0.25)] ring-1 ring-white/40 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-6xl leading-none">🩵</div>
              <span className="rounded-full bg-gradient-to-r from-[#4A90E2] to-[#7F8FF4] px-3 py-1 text-xs font-semibold text-white shadow">
                오늘도 함께
              </span>
            </div>
            <p className="text-xl font-bold leading-tight text-slate-900">
              당신의 정신 건강 여정에 오신 것을 환영합니다
              {isAuthenticated && userName ? `, ${userName}님.` : "."}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-800">
              다독임은 AI 상담, 주변 병원 검색, 복약 및 감정 기록을
              <br />
              한 곳에서 관리할 수 있는 통합 심리 케어 플랫폼입니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700">정서 케어</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700">병원 검색</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700">복약 관리</span>
            </div>
          </div>

          <div className="mt-12 max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between text-sm text-white/85">
              <span className="font-semibold uppercase tracking-[0.18em]">빠른 시작</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur">4개 액션</span>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {mobileTiles.map((tile) => (
              <Link
                key={tile.id}
                to={tile.to}
                className={`flex w-full flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br ${tile.cardBg} p-7 text-center shadow-xl ring-1 ring-slate-100/60 transition duration-150 hover:-translate-y-0.5 backdrop-blur`}
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${tile.iconBg} ${tile.iconColor} text-3xl leading-none shadow-sm`}
                >
                  {tile.icon}
                </span>
                <span className="whitespace-pre-line text-center text-lg font-semibold text-slate-900 drop-shadow-sm">
                  {tile.title}
                </span>
              </Link>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Desktop & Tablet Layout */}
      <div className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] text-[#F5F7FA] min-[500px]:block">
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
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
            <Link
              className="bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text text-left text-xl font-bold tracking-tight text-transparent drop-shadow-lg whitespace-nowrap sm:text-2xl md:text-[2rem]"
              to={ROUTES.HOME}
            >
              다독임 - <span className="text-lg font-semibold sm:text-xl md:text-[1.35rem]">심리 상담 케어</span>
            </Link>
            <nav className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 sm:justify-end">
              <Link className={NAV_LINK_CLASS} to={ROUTES.HOME}>
                홈
              </Link>
              <Link className={`${NAV_LINK_CLASS} hidden sm:inline-flex`} to={ROUTES.CHAT}>
                AI 상담
              </Link>
              <Link className={`${NAV_LINK_CLASS} hidden sm:inline-flex`} to={ROUTES.MAP}>
                지도
              </Link>
              <Link className={`${NAV_LINK_CLASS} hidden sm:inline-flex`} to={ROUTES.CALENDAR}>
                캘린더
              </Link>
              {isAuthenticated ? (
                <Link
                  to={ROUTES.USER}
                  className={`${NAV_LINK_CLASS} border-[rgba(163,184,198,0.55)] bg-[rgba(245,247,250,0.2)] font-semibold hover:bg-[rgba(245,247,250,0.32)]`}
                >
                  안녕하세요 {userName || "사용자"}님
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
          <section className="pt-12 pb-8 text-center md:pt-14 md:pb-10">
            <h1 className="bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-xl md:text-5xl">
              당신의 정신 건강 여정에 오신 것을 환영합니다
              {isAuthenticated && userName ? `, ${userName}님.` : "."}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-[#F5F7FA]/95 md:text-lg">
              다독임은 AI 상담, 주변 병원 검색, 복약 및 감정 기록을
              <br />
              한 곳에서 관리할 수 있는 통합 심리 케어 플랫폼입니다.
            </p>
           
          </section>

          {/* Feature cards */}
          <section className="pt-6 pb-10 sm:pt-8 sm:pb-12 md:pt-10 md:pb-14">
            <h2 className="bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text text-center text-2xl font-bold tracking-tight text-transparent drop-shadow-xl sm:text-3xl md:text-4xl">
              빠른 시작
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
                  오늘 복약 일정과 기록을 체크해보세요.
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
                  처방전 촬영 기록
                </h2>
                <p className="mt-3 text-sm text-[#F5F7FA]/80 sm:text-base">
                  처방전 촬영, 약품 기록, 오늘 복약 확인을 한 페이지에서 빠르게 처리하세요.
                </p>
              </div>
              <Link
                to={ROUTES.QUICK_PRESCRIPTION}
                className="rounded-full border border-[#A3B8C6] px-6 py-3 text-sm font-semibold text-[#F5F7FA] transition hover:-translate-y-0.5 hover:bg-[#F5F7FA]/10"
              >
                바로가기
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

      {/* Footer (모바일 · 데스크톱 공통) */}
      <footer className="border-t border-white/10 bg-[#0f172a]/80 px-4 py-6 text-[#F5F7FA] backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <span className="text-sm font-semibold">이 프로젝트는 졸업 작품 프로젝트 입니다</span>
          <span className="text-sm text-[#F5F7FA]/80">공동 작업자 : 고정국, 이민준, 전상훈</span>
        </div>
      </footer>
    </>
  );
};

export default MainPage;
