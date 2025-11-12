import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PrescriptionCapture from "../components/PrescriptionCapture";
import { API_BASE_URL, API_ENDPOINTS, ROUTES } from "../constants";
import { fetchWithAccess } from "../utils";
import { useAuthStore } from "../stores/authStore";

type MedRecord = {
  id: number;
  name: string;
  source?: string;
  date?: string;
};

const todayISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
};

const QuickPrescriptionPage: React.FC = () => {
  const [todayMeds, setTodayMeds] = useState<MedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);

  const today = todayISO();

  useEffect(() => {
    if (!hasCheckedAuth || !isAuthenticated) {
      setTodayMeds([]);
      setLoading(false);
      return;
    }

    const fetchTodayMeds = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchWithAccess(
          `${API_BASE_URL}${API_ENDPOINTS.MEDICATIONS_BY_DATE}?date=${today}`,
          { method: "GET" },
        );

        const data: MedRecord[] = await res.json();
        setTodayMeds(data || []);
      } catch (err) {
        console.error("오늘 복약 정보 조회 오류", err);
        setError("오늘 복약 정보를 불러오는 중 오류가 발생했습니다.");
        setTodayMeds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayMeds();
  }, [today, hasCheckedAuth, isAuthenticated]);

  const handleDeleteMed = async (id: number) => {
    if (!window.confirm("이 약을 삭제할까요?")) return;

    try {
      await fetchWithAccess(`${API_BASE_URL}${API_ENDPOINTS.MEDICATIONS}/${id}`, {
        method: "DELETE",
      });

      setTodayMeds((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("복약 삭제 오류", err);
      alert("약 정보를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  if (!hasCheckedAuth) {
    return null;
  }

  if (hasCheckedAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] text-[#F5F7FA]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 15% 80%, rgba(163,184,198,0.32) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(248,180,0,0.2) 0%, transparent 45%), radial-gradient(circle at 45% 50%, rgba(74,93,115,0.25) 0%, transparent 55%)",
        }}
      />

      <header className="relative z-10 border-b border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] backdrop-blur-2xl shadow-lg">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D1FADF]">빠른 작업</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-transparent drop-shadow bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text sm:text-4xl">
              처방전 등록 &amp; 복약 현황
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[#F5F7FA]/80 sm:text-base">
              OCR 업로드와 수동 입력을 한 곳에서 처리하고, 오늘 복약 정보를 실시간으로 확인하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={ROUTES.HOME}
              className="rounded-full border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-2 text-sm font-semibold text-[#F5F7FA] shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(245,247,250,0.22)]"
            >
              메인으로 돌아가기
            </Link>
            <Link
              to={ROUTES.CALENDAR}
              className="rounded-full border border-[#A3B8C6] bg-[#F5F7FA]/10 px-4 py-2 text-sm font-semibold text-[#F5F7FA] shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[#F5F7FA]/20"
            >
              캘린더 확인하기
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-[rgba(163,184,198,0.4)] bg-[rgba(245,247,250,0.08)] p-5 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D1FADF]">STEP 1</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#F5F7FA] sm:text-3xl">처방전으로 약 추가</h2>
              <p className="mt-2 text-sm text-[#F5F7FA]/80">
                촬영한 이미지를 업로드하거나, 단 몇 번의 클릭으로 약을 직접 입력해 보세요.
              </p>
            </div>
            <span className="hidden rounded-full border border-[rgba(163,184,198,0.4)] bg-[rgba(245,247,250,0.18)] px-4 py-1 text-sm font-semibold text-[#F5F7FA]/90 sm:inline-flex">
              오늘 날짜: {today}
            </span>
          </div>
          <div className="mt-8">
            <PrescriptionCapture />
          </div>
        </section>

        <section className="rounded-3xl border border-[rgba(163,184,198,0.4)] bg-[rgba(245,247,250,0.08)] p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D1FADF]">STEP 2</p>
              <h3 className="text-xl font-semibold text-[#F5F7FA] sm:text-2xl">오늘의 복약 정보</h3>
              <p className="mt-1 text-sm text-[#F5F7FA]/75">서버에 저장된 {today}의 등록 내역입니다.</p>
            </div>
            <span className="rounded-full border border-[#A3B8C6] bg-[rgba(245,247,250,0.12)] px-3 py-1 text-xs font-semibold text-[#F5F7FA]">
              {today}
            </span>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            {error && (
              <p className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-rose-100">{error}</p>
            )}

            {loading ? (
              <div className="rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] px-4 py-6 text-center text-[#F5F7FA]/80">
                불러오는 중...
              </div>
            ) : todayMeds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[rgba(163,184,198,0.4)] bg-[rgba(245,247,250,0.05)] px-4 py-10 text-center text-[#F5F7FA]/70">
                오늘 등록된 약이 없습니다. 처방전 이미지를 올려 빠르게 기록을 시작해 보세요!
              </div>
            ) : (
              <ul className="space-y-3">
                {todayMeds.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.12)] px-4 py-3 shadow-inner"
                  >
                    <div>
                      <p className="text-base font-semibold text-[#F5F7FA]">{m.name}</p>
                      <p className="text-xs text-[#F5F7FA]/70">{m.source === "ocr" ? "OCR 인식" : "직접 입력"}</p>
                    </div>
                    <button
                      className="rounded-full border border-rose-300/60 px-3 py-1 text-xs font-semibold text-rose-100 transition duration-150 hover:-translate-y-0.5 hover:bg-rose-400/20"
                      onClick={() => handleDeleteMed(m.id)}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default QuickPrescriptionPage;
