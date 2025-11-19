import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES, API_BASE_URL, API_ENDPOINTS } from "../constants";
import EntryModal from "../components/EntryModal";
import type { Entry } from "../types";
import { fetchWithAccess } from "../utils";
import { useAuthStore } from "../stores/authStore";

interface MedRecord {
  id: number;
  name: string;
  source?: string;
  date?: string;
}

const CalendarPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [medsByDate, setMedsByDate] = useState<Record<string, MedRecord[]>>({});
  const [loadingMeds, setLoadingMeds] = useState(false);

  const selectedDateLabel = selectedDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const onDateClick = (date: Date) => setSelectedDate(date);

  const getEntryForDate = (date: Date): Entry | undefined => {
    return entries.find((entry) => new Date(entry.date).toDateString() === date.toDateString());
  };

  const todayEntry = getEntryForDate(selectedDate);

  const formatDate = (date: Date): string => {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().split("T")[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
  };

  const handleSave = (newEntry: Entry) => {
    const formattedDate = formatDate(selectedDate);
    setEntries((prev) => {
      const filtered = prev.filter((entry) => entry.date !== formattedDate);
      return [...filtered, { ...newEntry, date: formattedDate }];
    });
  };

  const fetchDiaryEntries = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAccess(`${API_BASE_URL}${API_ENDPOINTS.DIARY_LIST}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      const formatted: Entry[] = data.map((item: any) => ({
        date: item.date,
        diary: true,
        diaryText: item.diaryText || "",
        pills: [],
        counsel: [],
        mood: item.mood || undefined,
      }));
      setEntries(formatted);
    } catch (error) {
      console.error("일기 데이터를 불러오는 중 오류:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDiaryWrite = () => {
    if (!isToday(selectedDate)) {
      alert("오늘 날짜의 일기만 작성할 수 있습니다.");
      return;
    }
    navigate(ROUTES.DIARY);
  };

  useEffect(() => {
    fetchDiaryEntries();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMedsByDate({});
      return;
    }

    const dateStr = formatDate(selectedDate);
    setLoadingMeds(true);

    const loadMeds = async () => {
      try {
        const res = await fetchWithAccess(
          `${API_BASE_URL}${API_ENDPOINTS.MEDICATIONS_BY_DATE}?date=${dateStr}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!res.ok) {
          setMedsByDate((prev) => ({ ...prev, [dateStr]: [] }));
          return;
        }

        const data: MedRecord[] = await res.json();
        setMedsByDate((prev) => ({ ...prev, [dateStr]: data || [] }));
      } catch (error) {
        console.error("약 목록 로드 중 오류:", error);
        setMedsByDate((prev) => ({ ...prev, [dateStr]: [] }));
      } finally {
        setLoadingMeds(false);
      }
    };

    loadMeds();
  }, [selectedDate, isAuthenticated]);

  const medsForSelectedDay = medsByDate[formatDate(selectedDate)] || [];

  const getMoodLabel = (mood?: string) => {
    switch (mood) {
      case "very-happy":
        return "😄 매우 좋음";
      case "happy":
        return "😊 좋음";
      case "neutral":
        return "😐 보통";
      case "sad":
        return "😢 나쁨";
      case "very-sad":
        return "😭 매우 나쁨";
      default:
        return "없음";
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] text-[#F5F7FA]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(163,184,198,0.28) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(248,180,0,0.24) 0%, transparent 55%), radial-gradient(circle at 45% 40%, rgba(92,99,115,0.2) 0%, transparent 55%)",
        }}
      />

      <nav className="relative z-10 flex flex-wrap items-center justify-center gap-3 border-b border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] px-4 py-4 shadow-lg backdrop-blur-2xl sm:gap-4 sm:px-6 sm:py-6">
        <Link
          to={ROUTES.HOME}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-2 text-xs font-medium text-[#F5F7FA] shadow-md transition duration-200 hover:-translate-y-1 hover:bg-[rgba(245,247,250,0.22)] sm:left-6 sm:text-sm"
        >
          ← 홈으로
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-transparent drop-shadow-xl sm:text-xl md:text-2xl bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text">
          📅 다독임 캘린더
        </h1>
        {isAuthenticated && user?.nickname && (
          <span className="hidden rounded-full border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-2 text-sm font-medium text-[#F5F7FA]/90 backdrop-blur lg:inline-flex">
            안녕하세요, {user.nickname}님
          </span>
        )}
      </nav>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.12)] p-4 shadow-2xl backdrop-blur-2xl sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D1FADF]/80 sm:text-[13px]">
                Care Calendar
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#F5F7FA] sm:text-2xl">나의 케어 캘린더</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#F5F7FA]/80 sm:text-sm">
              <span className="rounded-full border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.12)] px-3 py-1 font-medium">
                {selectedDateLabel}
              </span>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center rounded-full border border-[rgba(163,184,198,0.55)] px-4 py-1.5 font-semibold text-[#F5F7FA] shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(245,247,250,0.2)]"
              >
                + 빠른 기록
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-[#F5F7FA] p-2 text-[#1E1E1E] shadow-xl sm:p-4">
            <Calendar
              className="calendar-widget"
              onClickDay={onDateClick}
              showNeighboringMonth={false}
              maxDetail="month"
              minDetail="month"
              formatMonthYear={(_locale, date) => {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                return `${year}년 ${month}월`;
              }}
              tileContent={({ date, view }: { date: Date; view: string }) => {
                if (view !== "month") return null;
                const entry = getEntryForDate(date);
                const medsForDate = medsByDate[formatDate(date)] || [];

                const getMoodIcon = (mood?: string) => {
                  switch (mood) {
                    case "very-happy":
                      return "😄";
                    case "happy":
                      return "😊";
                    case "neutral":
                      return "😐";
                    case "sad":
                      return "😢";
                    case "very-sad":
                      return "😭";
                    default:
                      return null;
                  }
                };

                return (
                  <div className="mt-2 flex flex-wrap gap-1 text-[9px] font-semibold text-[#4A5D73] sm:text-[10px]">
                    {entry?.mood && (
                      <span className="flex items-center justify-center rounded-full bg-[#E1E8EF] px-2 py-1 text-sm leading-none sm:text-base">
                        {getMoodIcon(entry.mood)}
                      </span>
                    )}
                    {medsForDate.length > 0 && (
                      <span
                        className="rounded-full bg-[#DCE4EF] px-2 py-1 text-[10px] font-medium text-[#4A5D73]"
                        aria-label={`약 ${medsForDate.length}개 등록됨`}
                        title={`약 ${medsForDate.length}개 등록됨`}
                      >
                        💊
                      </span>
                    )}
                    {entry?.counsel?.map((counsel, i) => (
                      <span
                        key={`counsel-${counsel}-${i}`}
                        className="rounded-full bg-[#E8ECF2] px-2 py-1 text-[10px] font-medium text-[#5C6373]"
                      >
                        📞 {counsel}
                      </span>
                    ))}
                    {entry?.diary && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700">
                        📓 일기
                      </span>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </section>

        <aside className="flex flex-col gap-5 sm:gap-6 lg:sticky lg:top-10">
          <div className="rounded-3xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.12)] p-5 shadow-xl backdrop-blur-2xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-[#F5F7FA] sm:text-lg">오늘 요약</h3>
              <span className="text-[11px] font-medium text-[#F5F7FA]/70 sm:text-xs">{selectedDateLabel}</span>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-[#F5F7FA]/90 sm:text-sm">
              <li>기분: {getMoodLabel(todayEntry?.mood)}</li>
              <li>
                약:{" "}
                {loadingMeds
                  ? "불러오는 중..."
                  : medsForSelectedDay.length
                  ? medsForSelectedDay.map((med) => med.name).join(", ")
                  : "없음"}
              </li>
              <li>상담: {todayEntry?.counsel?.join(", ") || "없음"}</li>
              <li>일기: {todayEntry?.diary ? "작성됨" : "없음"}</li>
            </ul>
            {medsForSelectedDay.length > 0 && !loadingMeds && (
              <div className="mt-4 rounded-2xl border border-[rgba(163,184,198,0.25)] bg-[rgba(245,247,250,0.08)] p-4 text-xs text-[#F5F7FA]/85 sm:text-sm">
                <strong className="block text-[#F5F7FA]">등록된 약</strong>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {medsForSelectedDay.map((med) => (
                    <li key={med.id}>
                      {med.name} {med.source === "ocr" ? "(OCR)" : med.source === "manual" ? "(수동)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-[rgba(163,184,198,0.55)] bg-[rgba(245,247,250,0.18)] px-4 py-2 text-xs font-medium text-[#F5F7FA] shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(245,247,250,0.28)] sm:w-auto sm:text-sm"
            >
              ✏️ 수정하기
            </button>
          </div>

          <div className="rounded-3xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.12)] p-5 shadow-xl backdrop-blur-2xl sm:p-6">
            <h3 className="text-base font-semibold text-[#F5F7FA] sm:text-lg">
              {isToday(selectedDate) ? "오늘의 일기" : isFuture(selectedDate) ? "미래의 일기" : "일기"}
            </h3>
            <div className="mt-4 space-y-4 text-xs text-[#F5F7FA]/90 sm:text-sm">
              {loading ? (
                <p className="rounded-2xl border border-[rgba(163,184,198,0.25)] bg-[rgba(245,247,250,0.12)] p-5 text-center text-[#F5F7FA]/70">
                  ⏳ 일기를 불러오는 중...
                </p>
              ) : !isToday(selectedDate) ? (
                todayEntry?.diaryText ? (
                  <>
                    <p className="rounded-2xl border border-[rgba(163,184,198,0.18)] bg-[rgba(245,247,250,0.12)] p-4 text-sm leading-6 text-[#F5F7FA]/90">
                      {todayEntry.diaryText}
                    </p>
                    <p className="text-center text-[11px] text-[#F5F7FA]/70 sm:text-xs">
                      {isFuture(selectedDate)
                        ? "⏰ 미래의 일기는 작성할 수 없습니다."
                        : "🔒 과거의 일기는 수정할 수 없습니다."}
                    </p>
                  </>
                ) : (
                  <p className="rounded-2xl border border-[rgba(163,184,198,0.25)] bg-[rgba(245,247,250,0.12)] p-5 text-center text-[#F5F7FA]/70">
                    {isFuture(selectedDate) ? "⏰ 미래의 일기는 작성할 수 없습니다." : "📝 작성된 일기가 없습니다."}
                  </p>
                )
              ) : todayEntry?.diaryText ? (
                <>
                  <p className="rounded-2xl border border-[rgba(163,184,198,0.18)] bg-[rgba(245,247,250,0.12)] p-4 text-sm leading-6 text-[#F5F7FA]/90">
                    {todayEntry.diaryText}
                  </p>
                  <button
                    type="button"
                    onClick={handleDiaryWrite}
                    className="inline-flex items-center justify-center rounded-full border border-[rgba(163,184,198,0.55)] bg-[rgba(245,247,250,0.18)] px-4 py-2 text-xs font-medium text-[#F5F7FA] shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(245,247,250,0.28)] sm:text-sm"
                  >
                    ✏️ 일기 수정하기
                  </button>
                </>
              ) : (
                <>
                  <p className="rounded-2xl border border-[rgba(163,184,198,0.25)] bg-[rgba(245,247,250,0.12)] p-5 text-center text-[#F5F7FA]/70">
                    📝 아직 작성된 일기가 없습니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleDiaryWrite}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#4A5D73] px-4 py-3 text-xs font-semibold text-[#F5F7FA] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-[#5C6373] sm:text-sm"
                  >
                    📝 일기 작성하기
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.12)] p-5 shadow-xl backdrop-blur-2xl sm:p-6">
            <h3 className="text-base font-semibold text-[#F5F7FA] sm:text-lg">📊 이번 달 통계</h3>
            <ul className="mt-4 space-y-2 text-xs text-[#F5F7FA]/85 sm:text-sm">
              <li>
                💊 복약 이행률{" "}
                {Math.round(
                  (entries.filter((entry) => entry.pills && entry.pills.length > 0).length / 30) * 100,
                )}
                %
              </li>
              <li>📝 일기 작성일 {entries.filter((entry) => entry.diary).length}일</li>
              <li>🗣️ 상담 참여일 {entries.filter((entry) => entry.counsel && entry.counsel.length > 0).length}일</li>
              <li>📅 총 활동일 {new Set(entries.map((entry) => entry.date)).size}일</li>
            </ul>
          </div>
        </aside>
      </div>

      {showModal && (
        <EntryModal date={selectedDate} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
};

export default CalendarPage;
