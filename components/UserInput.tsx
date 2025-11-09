
import React, { useState, useRef, useEffect } from 'react';
import type { DiaryEntry } from '../types';
import { BookmarkIcon, ChevronDownIcon, XCircleIcon, ChevronUpIcon } from './IconComponents';

interface DiaryEntryViewProps {
  entry: DiaryEntry | null;
  onTextChange: (text: string) => void;
  onEmotionChange: (emotions: string[]) => void;
  onGratitudeChange: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const emotionOptions = [
    { name: 'joy', label: '기쁨' },
    { name: 'gratitude', label: '감사' },
    { name: 'peace', label: '평안' },
    { name: 'excitement', label: '설렘' },
    { name: 'contentment', label: '만족' },
    { name: 'sadness', label: '슬픔' },
    { name: 'anger', label: '화남' },
    { name: 'anxiety', label: '불안' },
    { name: 'loneliness', label: '외로움' },
    { name: 'tiredness', label: '피곤' },
    { name: 'disappointment', label: '실망' },
];

export const DiaryEntryView: React.FC<DiaryEntryViewProps> = ({ entry, onTextChange, onEmotionChange, onGratitudeChange, onSubmit, isLoading }) => {
  const text = entry?.text || '';
  const gratitudeText = entry?.gratitude || '';
  const savedVerse = entry?.savedVerse;
  const selectedEmotions = entry?.emotions || [];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmotionToggle = (emotionName: string) => {
    const newEmotions = selectedEmotions.includes(emotionName)
      ? selectedEmotions.filter(e => e !== emotionName)
      : [...selectedEmotions, emotionName];
    onEmotionChange(newEmotions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="p-4 sm:p-6 bg-white/60 dark:bg-slate-800/60 rounded-xl shadow-lg animate-fade-in space-y-6">
      {savedVerse && (
        <div className="p-4 bg-sky-100 dark:bg-sky-900/50 rounded-lg border-l-4 border-sky-500">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center mb-2">
            <BookmarkIcon className="w-5 h-5 mr-2 text-sky-600" />
            오늘의 저장된 말씀
          </h3>
          <p className="text-slate-700 dark:text-slate-300 italic">"{savedVerse.text}"</p>
          <p className="text-right mt-2 font-semibold text-sky-600 dark:text-sky-400">
            {savedVerse.book} {savedVerse.chapter}:{savedVerse.verse}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="diaryInput" className="block text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">
            오늘 나의 일상과 감정
          </label>
          <textarea
            id="diaryInput"
            aria-label="오늘의 일기를 입력하세요"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="오늘 하루는 어떠셨나요? 당신의 이야기를 자유롭게 들려주세요."
            className="w-full h-48 p-4 text-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-3">
          <div>
            <label htmlFor="gratitudeInput" className="block text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">
              그럼에도 오늘 감사할 것들
            </label>
            <textarea
              id="gratitudeInput"
              aria-label="감사한 내용을 입력하세요"
              value={gratitudeText}
              onChange={(e) => onGratitudeChange(e.target.value)}
              placeholder="어려움 속에서도 배우자, 자녀, 부모님, 친구 등 일상에서 감사한 것을 찾아보세요"
              className="w-full h-24 p-3 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out resize-y"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">오늘 나의 감정</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="w-full flex justify-between items-center px-4 py-2 text-left bg-slate-100 dark:bg-slate-700/60 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <span className="text-slate-800 dark:text-slate-200">
                  {selectedEmotions.length > 0 ? `${selectedEmotions.length}개의 감정 선택됨` : '감정을 선택해주세요'}
                </span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 flex flex-col">
                  <div className="max-h-60 overflow-y-auto p-2 grid grid-cols-2 gap-2" role="listbox">
                    {emotionOptions.map((emotion) => (
                      <label key={emotion.name} className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEmotions.includes(emotion.name)}
                          onChange={() => handleEmotionToggle(emotion.name)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{emotion.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 flex justify-center py-1">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(false)}
                        className="p-1 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        aria-label="감정 선택 닫기"
                    >
                        <ChevronUpIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            {selectedEmotions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedEmotions.map((emotionName) => {
                  const emotion = emotionOptions.find(e => e.name === emotionName);
                  return (
                    <div key={emotionName} className="flex items-center bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 text-sm font-medium px-2.5 py-1 rounded-full animate-fade-in" style={{animationDuration: '0.2s'}}>
                      {emotion?.label}
                      <button
                        type="button"
                        onClick={() => handleEmotionToggle(emotionName)}
                        className="ml-1.5 -mr-1 flex-shrink-0"
                        aria-label={`${emotion?.label} 감정 삭제`}
                      >
                        <XCircleIcon className="w-4 h-4 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 transition-colors" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-2xl font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isLoading ? '처방 중...' : '말씀 처방받기'}
          </button>
        </div>
      </form>
    </div>
  );
};
