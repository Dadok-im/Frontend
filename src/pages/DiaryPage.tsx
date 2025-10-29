import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAccess } from '../utils';
import './DiaryPage.css';

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

  if (!isAuthenticated) {
    return (
      <div className="diary-page">
        <div className="auth-required">
          <h2>로그인이 필요합니다</h2>
          <Link to="/login" className="login-link">로그인하기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="diary-page">
      <nav className="diary-nav">
        <button className="back-btn" onClick={handleCancel}>
          ← 취소
        </button>
        <div>
          <h1>📝 오늘의 일기</h1>
          <div className="date-info">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>
        <div></div>
      </nav>

      <div className="diary-content">
        {/* 기분 선택 섹션 */}
        <div className="mood-section">
          <h2>오늘의 기분은 어떠셨나요?</h2>
          <div className="mood-buttons">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                className={`mood-btn ${mood === option.value ? 'selected' : ''}`}
                onClick={() => setMood(option.value)}
                style={{
                  backgroundColor: mood === option.value ? option.color : '#f5f5f5',
                  color: mood === option.value ? 'white' : '#333',
                  border: `2px solid ${mood === option.value ? option.color : '#ddd'}`
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 일기 작성 섹션 */}
        <div className="diary-section">
          <h2>오늘 하루는 어떠셨나요?</h2>
          <textarea
            className="diary-textarea"
            placeholder="오늘의 일기를 자유롭게 작성해보세요..."
            value={diaryText}
            onChange={(e) => setDiaryText(e.target.value)}
            rows={12}
          />
          <div className="character-count">
            {diaryText.length}자
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="diary-actions">
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={saving || !mood || !diaryText.trim()}
          >
            {saving ? '저장 중...' : '💾 일기 저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;
