
import React, { useState, useCallback, useEffect } from 'react';
import type { Recommendation, DiaryEntries, BibleVerse } from './types';
import { getRecommendations } from './services/geminiService';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert } from './components/ErrorAlert';
import { AppHeader } from './components/AppHeader';
import { Calendar } from './components/WelcomeMessage';
import { DiaryEntryView } from './components/UserInput';
import { SettingsMenu } from './components/SettingsMenu';
import { ApiKeyModal } from './components/ApiKeyModal';
import { BibleIcon } from './components/IconComponents';

const DIARY_STORAGE_KEY = '말씀처방_일기';

// Helper to format date as YYYY-MM-DD key
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Main App Component ---
export default function App(): React.ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<DiaryEntries>({});
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }
    // Default to dark mode if no preference is saved
    return 'dark';
  });
  
  // Load entries from localStorage and check for API key on mount
  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(DIARY_STORAGE_KEY);
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (e) {
      console.error("Failed to load diary entries from localStorage", e);
    }
    
    if (!localStorage.getItem('GEMINI_API_KEY')) {
        setIsApiKeyModalOpen(true);
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save diary entries to localStorage", e);
    }
  }, [entries]);

  // Apply and save theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }
  }, [theme]);

  const dateKey = formatDateKey(selectedDate);
  const currentEntry = entries[dateKey] || null;

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    setRecommendation(null); // Clear recommendations when changing date
    setError(null);
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setEntries(prev => {
        const existingEntry = prev[dateKey] || { text: '', savedVerse: null };
        return {
            ...prev,
            [dateKey]: {
                ...existingEntry,
                text,
            },
        };
    });
  }, [dateKey]);
  
  const handleGratitudeChange = useCallback((gratitude: string) => {
    setEntries(prev => {
        const existingEntry = prev[dateKey] || { text: '', savedVerse: null };
        return {
            ...prev,
            [dateKey]: {
                ...existingEntry,
                gratitude,
            },
        };
    });
  }, [dateKey]);

  const handleEmotionChange = useCallback((emotions: string[]) => {
    setEntries(prev => {
        const existingEntry = prev[dateKey] || { text: '', savedVerse: null };
        return {
            ...prev,
            [dateKey]: {
                ...existingEntry,
                emotions: emotions,
            },
        };
    });
  }, [dateKey]);

  const handleSaveVerse = useCallback((verse: BibleVerse) => {
    setEntries(prev => ({
      ...prev,
      [dateKey]: {
        text: prev[dateKey]?.text || '',
        savedVerse: verse,
        emotions: prev[dateKey]?.emotions,
        gratitude: prev[dateKey]?.gratitude,
      },
    }));
  }, [dateKey]);

  const handleSaveApiKey = useCallback((apiKey: string) => {
    try {
      localStorage.setItem('GEMINI_API_KEY', apiKey);
      setIsApiKeyModalOpen(false);
      setError(null); // Clear previous API key errors
      if (apiKey) {
        alert("API 키가 성공적으로 저장되었습니다.");
      }
    } catch (e) {
      console.error("Failed to save API key to localStorage", e);
      setError("API 키를 저장하는 데 실패했습니다.");
    }
  }, []);

  const handleGetRecommendation = useCallback(async () => {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) {
      setError("Google API 키를 먼저 설정해주세요. 설정 메뉴에서 입력할 수 있습니다.");
      setIsApiKeyModalOpen(true);
      return;
    }
    
    const inputText = currentEntry?.text;
    if (!inputText || !inputText.trim()) {
      setError("일기 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const result = await getRecommendations(inputText, currentEntry?.emotions, currentEntry?.gratitude);
      setRecommendation(result);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("추천을 받는 데 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentEntry]);

  const handleImportEntries = useCallback((importedEntries: DiaryEntries) => {
    const confirmed = window.confirm(
        "일기를 가져오시겠습니까?\n\n같은 날짜에 이미 작성된 일기가 있는 경우, 가져온 내용으로 덮어쓰기 됩니다."
    );

    if (confirmed) {
        setEntries(prev => {
            const merged = { ...prev, ...importedEntries };
            Object.keys(merged).forEach(key => {
                if (merged[key] === undefined || merged[key] === null) {
                    delete merged[key];
                }
            });
            return merged;
        });
        alert(`${Object.keys(importedEntries).length}개의 일기를 성공적으로 가져왔습니다.`);
        setIsSettingsMenuOpen(false);
    }
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    setIsSettingsMenuOpen(false); // Close menu on selection
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
      />
      <main className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="absolute top-4 right-4 z-10">
            <button
                onClick={() => setIsSettingsMenuOpen(prev => !prev)}
                className="flex flex-col items-center p-2 rounded-lg text-sky-600 dark:text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
                aria-label="설정 메뉴 열기"
            >
                <BibleIcon className="w-7 h-7" />
                <span className="text-xs font-semibold mt-0.5">설정</span>
            </button>
            <SettingsMenu
                isOpen={isSettingsMenuOpen}
                onClose={() => setIsSettingsMenuOpen(false)}
                entries={entries}
                onImport={handleImportEntries}
                theme={theme}
                onThemeToggle={handleThemeToggle}
                onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
        </div>
        
        <AppHeader />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
             <Calendar 
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                entries={entries}
             />
          </div>

          <div className="lg:col-span-3">
             <div className="space-y-8">
                <DiaryEntryView
                    entry={currentEntry}
                    onTextChange={handleTextChange}
                    onEmotionChange={handleEmotionChange}
                    onGratitudeChange={handleGratitudeChange}
                    onSubmit={handleGetRecommendation}
                    isLoading={isLoading}
                />

                <div className="min-h-[100px]">
                    {isLoading && <LoadingSpinner />}
                    {error && <ErrorAlert message={error} />}
                    {recommendation && (
                        <div className="bg-white/60 dark:bg-slate-800/60 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg animate-fade-in">
                        <ResultDisplay 
                            result={recommendation}
                            onSaveVerse={handleSaveVerse}
                            savedVerse={currentEntry?.savedVerse || null}
                        />
                        </div>
                    )}
                </div>
             </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
        <p>Made by PJB</p>
      </footer>
    </div>
  );
}