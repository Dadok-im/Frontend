import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES, API_BASE_URL, API_ENDPOINTS } from '../constants';
import EntryModal from '../components/EntryModal';
import type { Entry } from '../types';
import { fetchWithAccess } from '../utils';
import { useAuthStore } from '../stores/authStore';

const CalendarPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedDateLabel = selectedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const onDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getEntryForDate = (date: Date): Entry | undefined => {
    return entries.find(
      (e) => new Date(e.date).toDateString() === date.toDateString()
    );
  };

  const todayEntry = getEntryForDate(selectedDate);

  const formatDate = (date: Date): string => {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().split('T')[0];
  };

  // 선택된 날짜가 오늘인지 확인
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // 선택된 날짜가 미래인지 확인
  const isFuture = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
  };

  const handleSave = (newEntry: Entry) => {
    const formattedDate = formatDate(selectedDate);

    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== formattedDate);
      return [...filtered, { ...newEntry, date: formattedDate }];
    });
  };

  // 서버에서 일기 데이터 가져오기
  const fetchDiaryEntries = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.DIARY_LIST}`;
      
      console.log('📡 일기 목록 요청 중...', url);
      
      const response = await fetchWithAccess(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('✅ 일기 목록 로드 완료:', data);

      // 백엔드 응답 형식: [{ date: "2025-01-02", diaryText: "내용", mood: "happy" }]
      // Entry 형식으로 변환: { date, diary, diaryText, pills, counsel, mood }
      const formattedEntries: Entry[] = data.map((item: any) => ({
        date: item.date,
        diary: true, // 일기가 있는 데이터만 오므로 항상 true
        diaryText: item.diaryText || '',
        pills: [], // 백엔드에서 제공하지 않으므로 빈 배열
        counsel: [], // 백엔드에서 제공하지 않으므로 빈 배열
        mood: item.mood || undefined, // 기분 정보
      }));

      setEntries(formattedEntries);
      setLoading(false);

    } catch (error) {
      console.error('🚨 일기 목록 로드 중 오류:', error);
      setLoading(false);
      // 에러가 발생해도 빈 배열로 계속 진행
      setEntries([]);
    }
  };

  const handleDiaryWrite = () => {
    // 오늘이 아닌 경우 일기 작성 불가
    if (!isToday(selectedDate)) {
      alert('오늘 날짜의 일기만 작성할 수 있습니다.');
      return;
    }
    
    // 일기 작성 페이지로 이동
    navigate('/diary');
  };

  // 컴포넌트 마운트 시 일기 데이터 로드
  useEffect(() => {
    fetchDiaryEntries();
  }, [isAuthenticated]);

  // 선택된 날짜가 변경될 때 상태 초기화
  useEffect(() => {
    // 일기 작성 관련 상태는 더 이상 필요 없음
  }, [selectedDate, entries]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-400 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background:
            'radial-gradient(circle at 20% 80%, rgba(120,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 45% 40%, rgba(120,219,255,0.2) 0%, transparent 55%)',
        }}
      />

      <nav className="relative z-10 flex items-center justify-center gap-4 border-b border-white/20 bg-white/10 px-4 py-5 backdrop-blur-2xl shadow-lg sm:px-5 sm:py-6">
        <Link
          to={ROUTES.HOME}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-medium text-white shadow-md transition duration-200 hover:-translate-y-1 hover:bg-white/25 sm:left-6 sm:text-sm"
        >
          ← 홈으로
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-transparent drop-shadow-xl sm:text-xl md:text-2xl bg-gradient-to-r from-white to-indigo-100 bg-clip-text">
          📅 다독임 캘린더
        </h1>
        {isAuthenticated && user?.nickname && (
          <span className="hidden rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur lg:inline-flex">
            안녕하세요, {user.nickname}님!
          </span>
        )}
      </nav>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl sm:p-6">
          <div className="rounded-2xl bg-white p-3 text-gray-900 shadow-xl sm:p-4">
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
                if (view !== 'month') return null;
                const entry = getEntryForDate(date);

                const getMoodIcon = (mood?: string) => {
                  switch (mood) {
                    case 'very-happy':
                      return '😄';
                    case 'happy':
                      return '😊';
                    case 'neutral':
                      return '😐';
                    case 'sad':
                      return '😢';
                    case 'very-sad':
                      return '😭';
                    default:
                      return null;
                  }
                };

                return (
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-semibold text-indigo-600">
                    {entry?.mood && (
                      <span className="flex items-center justify-center rounded-full bg-indigo-100 px-2 py-1 text-base leading-none">
                        {getMoodIcon(entry.mood)}
                      </span>
                    )}
                    {entry?.pills?.map((pill, i) => (
                      <span
                        key={`pill-${pill}-${i}`}
                        className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-medium text-indigo-600"
                      >
                        💊 {pill}
                      </span>
                    ))}
                    {entry?.counsel?.map((counsel, i) => (
                      <span
                        key={`counsel-${counsel}-${i}`}
                        className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-medium text-violet-700"
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

        <aside className="flex flex-col gap-5 sm:gap-6">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-2xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white sm:text-lg">오늘 요약</h3>
              <span className="text-[11px] font-medium text-white/70 sm:text-xs">{selectedDateLabel}</span>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-white/90 sm:text-sm">
              <li>
                기분:{' '}
                {todayEntry?.mood
                  ? (() => {
                      switch (todayEntry.mood) {
                        case 'very-happy':
                          return '😄 매우 좋음';
                        case 'happy':
                          return '😊 좋음';
                        case 'neutral':
                          return '😐 보통';
                        case 'sad':
                          return '😢 나쁨';
                        case 'very-sad':
                          return '😭 매우 나쁨';
                        default:
                          return '없음';
                      }
                    })()
                  : '없음'}
              </li>
              <li>💊 약: {todayEntry?.pills?.join(', ') || '없음'}</li>
              <li>🗣️ 상담: {todayEntry?.counsel?.join(', ') || '없음'}</li>
              <li>📓 일기: {todayEntry?.diary ? '작성됨' : '없음'}</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-5 inline-flex items-center justify-center rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-medium text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/25 sm:text-sm"
            >
              ✏️ 수정하기
            </button>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-2xl sm:p-6">
            <h3 className="text-base font-semibold text-white sm:text-lg">
              {isToday(selectedDate)
                ? '오늘의 일기'
                : isFuture(selectedDate)
                ? '미래의 일기'
                : '일기'}
            </h3>
            <div className="mt-4 space-y-4 text-xs text-white/90 sm:text-sm">
              {loading ? (
                <p className="rounded-2xl border border-white/15 bg-white/10 p-5 text-center text-white/70">
                  ⏳ 일기를 불러오는 중...
                </p>
              ) : !isToday(selectedDate) ? (
                todayEntry?.diaryText ? (
                  <>
                    <p className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-white/90">
                      {todayEntry.diaryText}
                    </p>
                    <p className="text-center text-[11px] text-white/70 sm:text-xs">
                      {isFuture(selectedDate)
                        ? '⏰ 미래의 일기는 작성할 수 없습니다.'
                        : '🔒 과거의 일기는 수정할 수 없습니다.'}
                    </p>
                  </>
                ) : (
                  <p className="rounded-2xl border border-white/15 bg-white/10 p-5 text-center text-white/70">
                    {isFuture(selectedDate)
                      ? '⏰ 미래의 일기는 작성할 수 없습니다.'
                      : '📝 작성된 일기가 없습니다.'}
                  </p>
                )
              ) : todayEntry?.diaryText ? (
                <>
                  <p className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-white/90">
                    {todayEntry.diaryText}
                  </p>
                  <button
                    type="button"
                    onClick={handleDiaryWrite}
                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-medium text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/25 sm:text-sm"
                  >
                    ✏️ 일기 수정하기
                  </button>
                </>
              ) : (
                <>
                  <p className="rounded-2xl border border-white/15 bg-white/10 p-5 text-center text-white/70">
                    📝 아직 작성된 일기가 없습니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleDiaryWrite}
                    className="inline-flex w-full items-center justify-center rounded-full bg-blue-500 px-4 py-3 text-xs font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-blue-600 sm:text-sm"
                  >
                    📝 일기 작성하기
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-2xl sm:p-6">
            <h3 className="text-base font-semibold text-white sm:text-lg">📊 이번 달 통계</h3>
            <ul className="mt-4 space-y-2 text-xs text-white/85 sm:text-sm">
              <li>
                💊 복약 이행률:{' '}
                {Math.round(
                  (entries.filter((e) => e.pills && e.pills.length > 0).length / 30) * 100
                )}
                %
              </li>
              <li>📝 일기 작성일: {entries.filter((e) => e.diary).length}일</li>
              <li>🗣️ 상담 참여일: {entries.filter((e) => e.counsel && e.counsel.length > 0).length}일</li>
              <li>📅 총 활동일: {new Set(entries.map((e) => e.date)).size}일</li>
            </ul>
          </div>
        </aside>
      </div>

      {showModal && (
        <EntryModal
          date={selectedDate}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CalendarPage;
