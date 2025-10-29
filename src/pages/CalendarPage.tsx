import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES, API_BASE_URL, API_ENDPOINTS } from '../constants';
import EntryModal from '../components/EntryModal';
import type { Entry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAccess } from '../utils';
import './CalendarPage.css';

const CalendarPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Entry[]>([]);
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
                  
                  // 기분 아이콘 매핑
                  const getMoodIcon = (mood?: string) => {
                    switch (mood) {
                      case 'very-happy': return '😄';
                      case 'happy': return '😊';
                      case 'neutral': return '😐';
                      case 'sad': return '😢';
                      case 'very-sad': return '😭';
                      default: return null;
                    }
                  };
                  
                  return (
                    <div className="calendar-tags">
                      {entry?.mood && (
                        <div className="tag mood" style={{ 
                          fontSize: '20px',
                          padding: '2px 4px'
                        }}>
                          {getMoodIcon(entry.mood)}
                        </div>
                      )}
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
              <li>
                기분: {
                  todayEntry?.mood 
                    ? (() => {
                        switch (todayEntry.mood) {
                          case 'very-happy': return '😄 매우 좋음';
                          case 'happy': return '😊 좋음';
                          case 'neutral': return '😐 보통';
                          case 'sad': return '😢 나쁨';
                          case 'very-sad': return '😭 매우 나쁨';
                          default: return '없음';
                        }
                      })()
                    : '없음'
                }
              </li>
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
            ) : todayEntry?.diaryText ? (
              // 오늘 날짜이고 일기가 있는 경우
              <>
                <p>{todayEntry.diaryText}</p>
                <button className="edit-btn" onClick={handleDiaryWrite}>
                  ✏️ 일기 수정하기
                </button>
              </>
            ) : (
              // 오늘 날짜이고 일기가 없는 경우
              <>
                <p style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#999' 
                }}>
                  📝 아직 작성된 일기가 없습니다.
                </p>
                <button className="diary-save" onClick={handleDiaryWrite} style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                  📝 일기 작성하기
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
