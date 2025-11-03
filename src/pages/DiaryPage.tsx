import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS, ROUTES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAccess } from '../utils';

const DiaryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mood, setMood] = useState<string>('');
  const [diaryText, setDiaryText] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // 기분 옵션들
  const moodOptions = [
    { value: 'very-happy', label: '😄 매우 좋음', color: '#4CAF50' },
    { value: 'happy', label: '😊 좋음', color: '#8BC34A' },
    { value: 'neutral', label: '😐 보통', color: '#FFC107' },
    { value: 'sad', label: '😢 나쁨', color: '#FF9800' },
    { value: 'very-sad', label: '😭 매우 나쁨', color: '#F44336' },
  ];

  // 오늘 날짜 포맷팅
  const formatDate = (date: Date): string => {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().split('T')[0];
  };

  // 기존 일기 데이터 로드
  useEffect(() => {
    const loadExistingDiary = async () => {
      if (!isAuthenticated) return;

      try {
        const url = `${API_BASE_URL}${API_ENDPOINTS.DIARY_LIST}`;
        const response = await fetchWithAccess(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        const today = formatDate(new Date());
        
        // 오늘 날짜의 일기 찾기
        const todayDiary = data.find((item: any) => item.date === today);
        if (todayDiary) {
          setDiaryText(todayDiary.diaryText || '');
          setMood(todayDiary.mood || ''); // 기분 정보도 함께 로드
        }
      } catch (error) {
        console.error('🚨 기존 일기 로드 중 오류:', error);
      }
    };

    loadExistingDiary();
  }, [isAuthenticated]);

  // 일기 저장
  const handleSave = async () => {
    if (!mood) {
      alert('오늘의 기분을 선택해주세요.');
      return;
    }

    if (!diaryText.trim()) {
      alert('일기 내용을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.DIARY}`;
      const today = formatDate(new Date());
      
      const response = await fetchWithAccess(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          diaryText: diaryText,
          mood: mood, // 기분 정보도 함께 전송
        }),
      });

      const result = await response.json();
      console.log('✅ 일기 저장 완료:', result);

      // 저장 완료 후 캘린더 페이지로 이동
      navigate('/calendar');

    } catch (error) {
      console.error('🚨 일기 저장 중 오류:', error);
      alert('일기 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 취소
  const handleCancel = () => {
    if (diaryText.trim() && !confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
      return;
    }
    navigate('/calendar');
  };

  const formattedDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const renderMoodButtons = () =>
    moodOptions.map((option) => {
      const selected = mood === option.value;
      return (
        <button
          key={option.value}
          onClick={() => setMood(option.value)}
          style={
            selected
              ? {
                  background: option.color,
                  borderColor: option.color,
                  color: '#fff',
                }
              : undefined
          }
          className={`rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-semibold text-white shadow-md transition duration-200 hover:-translate-y-1 hover:border-white/40 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/40 ${
            selected ? 'scale-[1.02] shadow-2xl' : 'bg-white/10 text-white'
          }`}
        >
          {option.label}
        </button>
      );
    });

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e3c72] via-[#667eea] to-[#f093fb] px-4 py-12 text-white sm:px-6 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-95"
          style={{
            background:
              "radial-gradient(circle at 20% 80%, rgba(120,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 45% 40%, rgba(120,219,255,0.2) 0%, transparent 55%)",
          }}
        />
        <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/15 p-8 text-center text-white shadow-2xl backdrop-blur-2xl sm:max-w-md sm:p-10">
          <h2 className="text-xl font-semibold tracking-tight text-transparent sm:text-2xl bg-gradient-to-r from-white to-indigo-100 bg-clip-text">
            로그인이 필요합니다
          </h2>
          <p className="mt-4 text-xs text-white/80 sm:text-sm">
            일기 작성 기능을 이용하려면 먼저 로그인해주세요.
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="mt-7 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl sm:px-6 sm:text-sm"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1e3c72] via-[#667eea] to-[#f093fb] px-4 py-8 text-white sm:px-6 md:py-10 lg:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(120,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.28) 0%, transparent 55%), radial-gradient(circle at 45% 40%, rgba(120,219,255,0.2) 0%, transparent 55%)",
        }}
      />

      <nav className="relative z-10 mx-auto grid w-full max-w-3xl grid-cols-1 items-center gap-4 rounded-3xl border border-white/20 bg-white/15 px-4 py-5 text-center shadow-2xl backdrop-blur-2xl sm:grid-cols-[auto_1fr_auto] sm:px-6 sm:text-left">
        <button
          onClick={handleCancel}
          className="mx-auto rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/25 sm:mx-0 sm:text-sm"
        >
          ← 취소
        </button>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-transparent drop-shadow-xl bg-gradient-to-r from-white to-indigo-100 bg-clip-text sm:text-xl md:text-2xl">
            📝 오늘의 일기
          </h1>
          <span className="text-[11px] font-medium text-white/80 sm:text-xs md:text-sm">
            {formattedDate}
          </span>
        </div>
        <div className="h-4 w-4 opacity-0" />
      </nav>

      <div className="relative z-10 mx-auto mt-8 w-full max-w-3xl rounded-3xl border border-white/20 bg-white/12 p-6 shadow-2xl backdrop-blur-2xl sm:p-8 md:p-10">
        <section>
          <h2 className="text-center text-base font-semibold tracking-tight text-white sm:text-lg">
            오늘의 기분은 어떠셨나요?
          </h2>
          <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
            {renderMoodButtons()}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-base font-semibold text-white sm:text-lg">오늘 하루는 어떠셨나요?</h2>
          <textarea
            className="mt-4 w-full rounded-3xl border border-white/20 bg-white/10 px-4 py-4 text-xs leading-6 text-white shadow-inner transition duration-200 placeholder:text-white/60 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 sm:px-5 sm:text-sm"
            placeholder="오늘의 일기를 자유롭게 작성해보세요..."
            value={diaryText}
            onChange={(e) => setDiaryText(e.target.value)}
            rows={12}
          />
          <div className="mt-2 text-right text-xs font-medium text-white/70">
            {diaryText.length}자
          </div>
        </section>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving || !mood || !diaryText.trim()}
            className="inline-flex min-w-[260px] items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/70 disabled:shadow-none"
          >
            {saving ? '저장 중...' : '💾 일기 저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;
