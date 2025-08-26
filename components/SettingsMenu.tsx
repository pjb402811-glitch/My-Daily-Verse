
import React, { useRef, useEffect } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, KeyIcon, SunIcon, MoonIcon } from './IconComponents';
import type { DiaryEntries } from '../types';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  entries: DiaryEntries;
  onImport: (entries: DiaryEntries) => void;
  theme: string;
  onThemeToggle: () => void;
  onOpenApiKeyModal: () => void;
}

// Helper to validate imported data
const isValidDiaryData = (data: any): data is DiaryEntries => {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return false;
    }
    // Check if at least one entry looks like a DiaryEntry
    return Object.values(data).every((entry: any) => 
        typeof entry === 'object' && 
        entry !== null && 
        typeof entry.text === 'string' &&
        (entry.savedVerse === null || typeof entry.savedVerse === 'object')
    );
};

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose, entries, onImport, theme, onThemeToggle, onOpenApiKeyModal }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleExport = () => {
    if (Object.keys(entries).length === 0) {
      alert("내보낼 일기 데이터가 없습니다.");
      return;
    }

    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    link.download = `말씀처방_일기_백업_${dateString}.json`;

    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("파일을 읽을 수 없습니다.");
        }
        const importedData = JSON.parse(text);
        
        if (!isValidDiaryData(importedData)) {
            throw new Error("유효하지 않은 일기 파일 형식입니다.");
        }

        onImport(importedData);

      } catch (error) {
        console.error("Error importing file:", error);
        alert(`데이터를 가져오는 데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
        alert("파일을 읽는 중 오류가 발생했습니다.");
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className="absolute top-full right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 animate-fade-in" style={{ animationDuration: '0.15s' }}>
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/json"
            className="hidden"
            aria-hidden="true"
        />
        <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            role="menuitem"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>일기 내보내기 (백업)</span>
        </button>
        <button
            onClick={handleImportClick}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            role="menuitem"
        >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>일기 가져오기</span>
        </button>
        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
        <button
            onClick={() => {
              onOpenApiKeyModal();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            role="menuitem"
        >
            <KeyIcon className="w-5 h-5" />
            <span>Google API Key 입력</span>
        </button>
        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
        <button
            onClick={onThemeToggle}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            role="menuitem"
        >
            {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
                <MoonIcon className="w-5 h-5 text-slate-500" />
            )}
            <span>{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
        </button>
      </div>
    </div>
  );
};
