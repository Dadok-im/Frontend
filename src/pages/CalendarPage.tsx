import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link } from 'react-router-dom';
import { ROUTES, API_BASE_URL, API_ENDPOINTS } from '../constants';
import EntryModal from '../components/EntryModal';
import type { Entry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAccess } from '../utils';
import './CalendarPage.css';

const CalendarPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [diaryDraft, setDiaryDraft] = useState('');
  const [editingDiary, setEditingDiary] = useState(false);
  const [loading, setLoading] = useState(true);

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

      // 백엔드 응답 형식: [{ date: "2025-01-02", diaryText: "내용" }]
      // Entry 형식으로 변환: { date, diary, diaryText, pills, counsel }
      const formattedEntries: Entry[] = data.map((item: any) => ({
        date: item.date,
        diary: true, // 일기가 있는 데이터만 오므로 항상 true
        diaryText: item.diaryText || '',
        pills: [], // 백엔드에서 제공하지 않으므로 빈 배열
        counsel: [], // 백엔드에서 제공하지 않으므로 빈 배열
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

  const handleDiarySave = async () => {
    // 오늘이 아닌 경우 저장 불가
    if (!isToday(selectedDate)) {
      alert('오늘 날짜의 일기만 작성할 수 있습니다.');
      return;
    }

    const formattedDate = formatDate(selectedDate);

    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.DIARY}`;
      
      const response = await fetchWithAccess(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formattedDate,
          diaryText: diaryDraft,
        }),
      });

      const result = await response.json();
      console.log('✅ 일기 저장 완료:', result);

      // 로컬 상태 업데이트
      const existing = getEntryForDate(selectedDate);
      const updatedEntry: Entry = {
        date: formattedDate,
        diary: true,
        diaryText: diaryDraft,
        pills: existing?.pills || [],
        counsel: existing?.counsel || [],
      };

      handleSave(updatedEntry);
      setEditingDiary(false);

    } catch (error) {
      console.error('🚨 일기 저장 중 오류:', error);
      alert('일기 저장에 실패했습니다.');
    }
  };

  // 컴포넌트 마운트 시 일기 데이터 로드
  useEffect(() => {
    fetchDiaryEntries();
  }, [isAuthenticated]);

  // 선택된 날짜가 변경될 때 일기 초안 업데이트
  useEffect(() => {
    const entry = getEntryForDate(selectedDate);
    setDiaryDraft(entry?.diaryText || '');
    setEditingDiary(false);
  }, [selectedDate, entries]);

  return (
    <div className="calendar-page">
      <nav className="calendar-nav">
        <Link to={ROUTES.HOME} className="nav-link">← 홈으로</Link>
        <h1>📅 다독임 캘린더</h1>
        {isAuthenticated && user?.nickname && (
          <span className="user-welcome">안녕하세요, {user.nickname}님!</span>
        )}
      </nav>

      <div className="calendar-layout">
        {/* 좌측: 캘린더 */}
        <div className="calendar-section">
          <div className="calendar-body">
            <div className="calendar-wrapper">
              <Calendar
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
                  return (
                    <div className="calendar-tags">
                      {entry?.pills?.map((pill, i) => (
                        <div key={i} className="tag pill">💊 {pill}</div>
                      ))}
                      {entry?.counsel?.map((counsel, i) => (
                        <div key={i} className="tag counsel">📞 {counsel}</div>
                      ))}
                      {entry?.diary && <div className="tag diary">📓 일기</div>}
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* 우측: 사이드바 */}
        <div className="sidebar-section">
          <div className="box">
            <h3>오늘 요약</h3>
            <ul>
              <li>💊 약: {todayEntry?.pills?.join(', ') || '없음'}</li>
              <li>🗣️ 상담: {todayEntry?.counsel?.join(', ') || '없음'}</li>
              <li>📓 일기: {todayEntry?.diary ? '작성됨' : '없음'}</li>
            </ul>
            {selectedDate && (
              <button className="edit-btn" onClick={() => setShowModal(true)}>
                ✏️ 수정하기
              </button>
            )}
          </div>

          <div className="box">
            <h3>
              {isToday(selectedDate) 
                ? '오늘의 일기' 
                : isFuture(selectedDate) 
                ? '미래의 일기' 
                : '일기'}
            </h3>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                ⏳ 일기를 불러오는 중...
              </p>
            ) : !isToday(selectedDate) ? (
              // 오늘이 아닌 경우 (과거 또는 미래)
              todayEntry?.diaryText ? (
                <>
                  <p>{todayEntry.diaryText}</p>
                  <p style={{ 
                    marginTop: '10px', 
                    fontSize: '0.9em', 
                    color: '#999', 
                    textAlign: 'center' 
                  }}>
                    {isFuture(selectedDate) 
                      ? '⏰ 미래의 일기는 작성할 수 없습니다.' 
                      : '🔒 과거의 일기는 수정할 수 없습니다.'}
                  </p>
                </>
              ) : (
                <p style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#999' 
                }}>
                  {isFuture(selectedDate) 
                    ? '⏰ 미래의 일기는 작성할 수 없습니다.' 
                    : '📝 작성된 일기가 없습니다.'}
                </p>
              )
            ) : editingDiary ? (
              // 오늘 날짜이고 편집 모드인 경우
              <>
                <textarea
                  placeholder="오늘의 일기를 입력하세요"
                  value={diaryDraft}
                  onChange={(e) => setDiaryDraft(e.target.value)}
                />
                <button className="diary-save" onClick={handleDiarySave}>
                  저장
                </button>
              </>
            ) : todayEntry?.diaryText ? (
              // 오늘 날짜이고 일기가 있는 경우
              <>
                <p>{todayEntry.diaryText}</p>
                <button className="edit-btn" onClick={() => setEditingDiary(true)}>
                  ✏️ 수정하기
                </button>
              </>
            ) : (
              // 오늘 날짜이고 일기가 없는 경우
              <>
                <textarea
                  placeholder="오늘의 일기를 입력하세요"
                  value={diaryDraft}
                  onChange={(e) => setDiaryDraft(e.target.value)}
                />
                <button className="diary-save" onClick={handleDiarySave}>
                  저장
                </button>
              </>
            )}
          </div>

          <div className="box">
            <h3>📊 이번 달 통계</h3>
            <ul>
              <li>💊 복약 이행률: {Math.round((entries.filter(e => e.pills && e.pills.length > 0).length / 30) * 100)}%</li>
              <li>📝 일기 작성일: {entries.filter(e => e.diary).length}일</li>
              <li>🗣️ 상담 참여일: {entries.filter(e => e.counsel && e.counsel.length > 0).length}일</li>
              <li>📅 총 활동일: {new Set(entries.map(e => e.date)).size}일</li>
            </ul>
          </div>
        </div>
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
