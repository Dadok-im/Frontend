import React, { useState } from 'react';
import './EntryModal.css';
import type { Entry } from '../types';

interface EntryModalProps {
  date: Date;
  onClose: () => void;
  onSave: (entry: Entry) => void;
}

const EntryModal: React.FC<EntryModalProps> = ({ date, onClose, onSave }) => {
  const [pill, setPill] = useState('');
  const [counsel, setCounsel] = useState('');
  const [diaryChecked, setDiaryChecked] = useState(false);

  const handleSave = () => {
    const formattedDate = date.toISOString().split('T')[0];
    onSave({
      date: formattedDate,
      pills: pill ? [pill] : [],
      counsel: counsel ? [counsel] : [],
      diary: diaryChecked,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{date.toLocaleDateString()} 기록 추가</h2>

        <label>💊 약 복용 시간 및 종류</label>
        <input
          value={pill}
          onChange={(e) => setPill(e.target.value)}
          placeholder="예: SSRI 08:00"
        />

        <label>📞 상담 일정</label>
        <input
          value={counsel}
          onChange={(e) => setCounsel(e.target.value)}
          placeholder="예: 19:00 온라인"
        />

        <label className="checkbox">
        📓 일기 작성 여부
          <input
            type="checkbox"
            checked={diaryChecked}
            onChange={(e) => setDiaryChecked(e.target.checked)}
          />
        </label>

        <div className="modal-actions">
          <button onClick={onClose}>닫기</button>
          <button onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default EntryModal;
