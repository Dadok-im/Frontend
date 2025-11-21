import React, { useEffect, useMemo, useState } from "react";
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

const daysShort = ["일", "월", "화", "수", "목", "금", "토"];

const getWeekDates = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, idx) => {
    const next = new Date(start);
    next.setDate(start.getDate() + idx);
    return next;
  });
};

const CalendarPage: React.FC = () => {
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
  const mobileDateLabel = selectedDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const getEntryForDate = (date: Date) =>
    entries.find((entry) => new Date(entry.date).toDateString() === date.toDateString());

  const todayEntry = getEntryForDate(selectedDate);
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const formatDate = (date: Date) => {
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
        pills: item.pills || [],
        counsel: item.counsel || [],
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
          { method: "GET", headers: { "Content-Type": "application/json" } },
        );

        if (!res.ok) {
          setMedsByDate((prev) => ({ ...prev, [dateStr]: [] }));
          return;
        }

        const data: MedRecord[] = await res.json();
        setMedsByDate((prev) => ({ ...prev, [dateStr]: data || [] }));
      } catch (error) {
        console.error("복약 정보를 불러오는 중 오류:", error);
        setMedsByDate((prev) => ({ ...prev, [dateStr]: [] }));
      } finally {
        setLoadingMeds(false);
      }
    };

    loadMeds();
  }, [selectedDate, isAuthenticated]);

  const shiftSelectedDate = (days: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + days);
      return next;
    });
  };

  const handlePrevDay = () => shiftSelectedDate(-1);
  const handleNextDay = () => shiftSelectedDate(1);

  const medsForSelectedDay = medsByDate[formatDate(selectedDate)] || [];

  const getMoodLabel = (mood?: string) => {
    switch (mood) {
      case "very-happy":
        return "매우 좋음";
      case "happy":
        return "좋음";
      case "neutral":
        return "보통";
      case "sad":
        return "나쁨";
      case "very-sad":
        return "매우 나쁨";
      default:
        return "기록 없음";
    }
  };

  const diaryCount = entries.filter((entry) => entry.diary).length;
  const counselCount = entries.filter((entry) => (entry.counsel?.length ?? 0) > 0).length;
  const pillDays = entries.filter((entry) => entry.pills && entry.pills.length > 0).length;
  const medicationRate = Math.min(100, Math.max(0, Math.round((pillDays / 30) * 100)));
  const recordedDays = new Set(entries.map((entry) => entry.date)).size;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-[#F5F7FA]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)",
        }}
      />

      <nav className="relative z-10 flex items-center justify-between gap-3 border-b border-white/20 bg-white/10 px-4 py-3 shadow-lg backdrop-blur">
        <Link
          to={ROUTES.HOME}
          className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-md transition duration-200 hover:-translate-y-1 hover:bg-white/20"
        >
          ← 홈으로
        </Link>
        <h1 className="mx-auto text-lg font-semibold tracking-tight text-white sm:text-xl md:text-2xl">
          다독임 캘린더
        </h1>
        <span className="w-16" aria-hidden />
      </nav>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D1FADF]/80 sm:text-[13px]">
                CARE CALENDAR
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">나의 케어 캘린더</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/80 sm:text-sm">
              <span className="rounded-full border border-white/35 bg-white/10 px-3 py-1 font-medium">
                {selectedDateLabel}
              </span>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center rounded-full border border-white/55 px-4 py-1.5 font-semibold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/20"
              >
                + 빠른 기록
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-3 text-slate-900 shadow-xl sm:p-5">
            <div className="sm:hidden">
              <div className="rounded-2xl bg-slate-50 p-4 text-slate-900 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    aria-label="이전 날짜"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-700 shadow"
                  >
                    ‹
                  </button>
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-gray-500">{mobileDateLabel}</p>
                    <p className="text-lg font-semibold text-slate-900">나의 케어 캘린더</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      aria-label="빠른 기록 추가"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-700 shadow"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={handleNextDay}
                      aria-label="다음 날짜"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-700 shadow"
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-slate-500">
                  {weekDates.map((dateObj) => {
                    const isSelectedDay = dateObj.toDateString() === selectedDate.toDateString();
                    const todayFlag = isToday(dateObj);
                    return (
                      <button
                        key={dateObj.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(new Date(dateObj))}
                        className={`flex flex-col items-center gap-1 rounded-2xl p-1 ${
                          isSelectedDay ? "bg-indigo-50" : "bg-transparent"
                        }`}
                      >
                        <span>{daysShort[dateObj.getDay()]}</span>
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-base ${
                            isSelectedDay
                              ? "bg-indigo-100 text-slate-900 font-bold shadow-lg"
                              : "text-slate-700"
                          }`}
                        >
                          {dateObj.getDate()}
                        </span>
                        {todayFlag && (
                          <span className="text-[9px] font-medium text-slate-600">오늘</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <Calendar
              className="calendar-widget hidden sm:block"
              onClickDay={(date) => setSelectedDate(date)}
              showNeighboringMonth={false}
              maxDetail="month"
              minDetail="month"
              formatMonthYear={(_locale, date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`}
              tileContent={({ date, view }) => {
                if (view !== "month") return null;
                const entry = getEntryForDate(date);
                const medsForDate = medsByDate[formatDate(date)] || [];
                return (
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-semibold text-slate-600">
                    {entry?.mood && (
                      <span className="flex items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-sm leading-none">
                        😊
                      </span>
                    )}
                    {medsForDate.length > 0 && (
                      <span
                        className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-medium text-indigo-700"
                        aria-label={`약 ${medsForDate.length}개 기록됨`}
                        title={`약 ${medsForDate.length}개 기록됨`}
                      >
                        💊
                      </span>
                    )}
                    {entry?.counsel?.length ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700">
                        상담
                      </span>
                    ) : null}
                  </div>
                );
              }}
            />
          </div>
        </section>

        <aside className="flex flex-col gap-5 sm:gap-6 lg:sticky lg:top-10">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white sm:text-lg">오늘 기록 요약</h3>
              <span className="text-[11px] font-medium text-white/70 sm:text-xs">
                {selectedDateLabel}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-white/90 sm:text-sm">
              <li>기분: {getMoodLabel(todayEntry?.mood)}</li>
              <li>
                복약:
                {loadingMeds
                  ? " 불러오는 중..."
                  : medsForSelectedDay.length
                  ? ` ${medsForSelectedDay.map((med) => med.name).join(", ")}`
                  : " 기록 없음"}
              </li>
              <li>상담: {todayEntry?.counsel?.join(", ") || "기록 없음"}</li>
              <li>일기: {todayEntry?.diary ? "작성 완료" : "작성되지 않음"}</li>
            </ul>
            {medsForSelectedDay.length > 0 && !loadingMeds && (
              <div className="mt-4 rounded-2xl border border-white/25 bg-white/10 p-4 text-xs text-white/85 sm:text-sm">
                <strong className="block text-white">복약 상세</strong>
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
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/55 bg-white/15 px-4 py-2 text-xs font-medium text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/25 sm:w-auto sm:text-sm"
            >
              빠른 기록 열기
            </button>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur sm:p-6">
            <h3 className="text-base font-semibold text-white sm:text-lg">
              {isToday(selectedDate) ? "오늘 일기" : isFuture(selectedDate) ? "미래 일기" : "과거 일기"}
            </h3>
            <div className="mt-4 space-y-4 text-xs text-white/90 sm:text-sm">
              {loading ? (
                <p className="rounded-2xl border border-white/25 bg-white/10 p-5 text-center text-white/70">
                  일기를 불러오는 중입니다...
                </p>
              ) : !isToday(selectedDate) ? (
                todayEntry?.diaryText ? (
                  <>
                    <p className="rounded-2xl border border-white/18 bg-white/10 p-4 text-sm leading-6 text-white/90">
                      {todayEntry.diaryText}
                    </p>
                    <p className="text-center text-[11px] text-white/70 sm:text-xs">
                      {isFuture(selectedDate)
                        ? "미래 날짜의 일기는 미리 작성할 수 없어요."
                        : "과거 일기는 수정만 가능합니다."}
                    </p>
                  </>
                ) : (
                  <p className="rounded-2xl border border-white/25 bg-white/10 p-5 text-center text-white/70">
                    {isFuture(selectedDate)
                      ? "미래 날짜의 일기는 아직 작성할 수 없어요."
                      : "해당 날짜의 일기 기록이 없습니다."}
                  </p>
                )
              ) : todayEntry?.diaryText ? (
                <>
                  <p className="rounded-2xl border border-white/18 bg-white/10 p-4 text-sm leading-6 text-white/90">
                    {todayEntry.diaryText}
                  </p>
                  <button
                    type="button"
                    onClick={handleDiaryWrite}
                    className="inline-flex items-center justify-center rounded-full border border-white/55 bg-white/15 px-4 py-2 text-xs font-medium text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/25 sm:text-sm"
                  >
                    오늘 일기 수정
                  </button>
                </>
              ) : (
                <>
                  <p className="rounded-2xl border border-white/25 bg-white/10 p-5 text-center text-white/70">
                    아직 오늘의 일기가 없습니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleDiaryWrite}
                    className="inline-flex w-full items-center justify-center rounded-full bg-white/20 px-4 py-3 text-xs font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-white/30 sm:text-sm"
                  >
                    오늘 일기 작성
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur sm:p-6">
            <h3 className="text-base font-semibold text-white sm:text-lg">케어 스코어</h3>
            <ul className="mt-4 space-y-2 text-xs text-white/85 sm:text-sm">
              <li>복약 달성률: {medicationRate}%</li>
              <li>작성한 일기: {diaryCount}건</li>
              <li>상담 참여: {counselCount}건</li>
              <li>기록한 날짜: {recordedDays}일</li>
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
