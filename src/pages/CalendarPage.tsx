import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import EntryModal from '../components/EntryModal';
import type { Entry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import './CalendarPage.css';

const CalendarPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Entry[]>([
    { date: '2025-01-02', pills: ['SSRI 08:00'], counsel: ['상담 19:00'] },
    { date: '2025-01-07', pills: ['BZD 22:00'] },
    { date: '2025-01-03', diary: true, diaryText: '오늘은 좋은 날씨였다.' },
  ]);
  const [diaryDraft, setDiaryDraft] = useState('');
  const [editingDiary, setEditingDiary] = useState(false);

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

  const handleSave = (newEntry: Entry) => {
    const formattedDate = formatDate(selectedDate);

    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== formattedDate);
      return [...filtered, { ...newEntry, date: formattedDate }];
    });
  };

  const handleDiarySave = () => {
    const formattedDate = formatDate(selectedDate);
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
  };

  useEffect(() => {
    const entry = getEntryForDate(selectedDate);
    setDiaryDraft(entry?.diaryText || '');
    setEditingDiary(false);
  }, [selectedDate]);

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
                formatMonthYear={(locale, date) => {
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
          <div className="calendar-footer">
            <Link className="btn back-btn" to={ROUTES.HOME}>← 메인으로 돌아가기</Link>
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
            <h3>오늘의 일기</h3>
            {editingDiary ? (
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
              <>
                <p>{todayEntry.diaryText}</p>
                <button className="edit-btn" onClick={() => setEditingDiary(true)}>
                  ✏️ 수정하기
                </button>
              </>
            ) : (
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
