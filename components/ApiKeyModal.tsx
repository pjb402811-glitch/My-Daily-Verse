import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('GEMINI_API_KEY') || '';
      setApiKey(storedKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleSave = () => {
    onSave(apiKey.trim());
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in"
      style={{ animationDuration: '0.2s' }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apiKeyModalTitle"
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg p-6 sm:p-8 relative animate-slide-up" style={{ animationDuration: '0.3s' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 id="apiKeyModalTitle" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Google AI API Key 설정
        </h2>
        <p className="mt-2 text-sky-600 dark:text-sky-500 font-semibold">
          '말씀 처방'을 사용하려면 Google AI API Key를 아래에 입력해주세요.
        </p>

        <div className="mt-6">
          <label htmlFor="apiKeyInput" className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Google AI API Key 입력
          </label>
          <input
            id="apiKeyInput"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          />
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          API 키는 브라우저에만 저장되며, 외부로 전송되지 않습니다. 키가 없다면 아래 안내에 따라 발급받으세요.
        </p>
        
        <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Google AI API Key 발급방법
          </h3>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Google AI Studio</a> 페이지로 이동하여 로그인합니다.</li>
            <li>'Get API key' 버튼을 클릭합니다.</li>
            <li>생성된 API 키를 복사합니다.</li>
            <li>복사한 키를 위 입력창에 붙여넣고 '키 저장' 버튼을 누릅니다.</li>
          </ol>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSave}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-slate-800 dark:text-slate-100 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900 transition-colors duration-200"
          >
            키 저장
          </button>
        </div>
      </div>
    </div>
  );
};