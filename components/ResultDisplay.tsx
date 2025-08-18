
import React from 'react';
import type { Recommendation, BibleVerse } from '../types';
import { BibleIcon, MusicNoteIcon, YouTubeIcon, SparklesIcon, BookmarkIcon } from './IconComponents';

interface ResultDisplayProps {
  result: Recommendation;
  onSaveVerse: (verse: BibleVerse) => void;
  savedVerse: BibleVerse | null;
}

// Helper to compare verses
const areVersesEqual = (v1: BibleVerse | null, v2: BibleVerse | null) => {
  if (!v1 || !v2) return false;
  return v1.book === v2.book && v1.chapter === v2.chapter && v1.verse === v2.verse;
};

const createYouTubeSearchUrl = (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onSaveVerse, savedVerse }) => {
  return (
    <div className="space-y-8">
      {/* Bible Verses Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
          <BibleIcon className="w-7 h-7 mr-3 text-sky-500" />
          오늘의 말씀 처방
        </h2>
        <div className="space-y-4">
          {result.verses.map((verse, index) => {
            const isSaved = areVersesEqual(verse, savedVerse);
            return (
              <div
                key={index}
                className={`p-6 rounded-lg shadow-md border-l-4 transition-all duration-300 ${isSaved ? 'bg-sky-100 dark:bg-sky-900/50 border-sky-600' : 'bg-white dark:bg-slate-800 border-sky-500'} animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className={`text-2xl italic ${isSaved ? 'text-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>"{verse.text}"</p>
                <div className="flex justify-between items-center mt-3">
                  <p className={`font-semibold ${isSaved ? 'text-sky-700 dark:text-sky-300' : 'text-sky-600 dark:text-sky-400'}`}>
                    {verse.book} {verse.chapter}:{verse.verse}
                  </p>
                  <button
                    onClick={() => onSaveVerse(verse)}
                    aria-label="이 말씀 저장하기"
                    disabled={isSaved}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors duration-200 ${
                      isSaved
                        ? 'bg-sky-600 text-white cursor-default'
                        : 'bg-slate-600 hover:bg-slate-500 text-white focus:ring-sky-500'
                    }`}
                  >
                    <BookmarkIcon className="w-4 h-4" />
                    <span>{isSaved ? '저장됨' : '말씀 저장'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traditional Hymn Section */}
      {result.traditionalHymns && result.traditionalHymns.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
            <MusicNoteIcon className="w-7 h-7 mr-3 text-emerald-500" />
            영혼을 위한 찬송가
          </h2>
          <div className="space-y-4">
            {result.traditionalHymns.map((hymn, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border-l-4 border-emerald-500 animate-slide-up"
                style={{ animationDelay: `${(result.verses.length + index) * 100}ms` }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{hymn.title}</p>
                    {hymn.number && (
                      <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        찬송가 {hymn.number}장
                      </p>
                    )}
                  </div>
                  {hymn.youtubeSearchQuery && (
                    <a
                      href={createYouTubeSearchUrl(hymn.youtubeSearchQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${hymn.title} 유튜브에서 검색하기`}
                      className="flex-shrink-0 ml-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-colors duration-200"
                    >
                      <YouTubeIcon className="w-5 h-5" />
                      <span>찬송 듣기</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CCM Section */}
      {result.ccms && result.ccms.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
            <SparklesIcon className="w-7 h-7 mr-3 text-rose-500" />
            마음을 채우는 CCM
          </h2>
          <div className="space-y-4">
            {result.ccms.map((ccm, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border-l-4 border-rose-500 animate-slide-up"
                style={{ animationDelay: `${(result.verses.length + (result.traditionalHymns?.length || 0) + index) * 100}ms` }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{ccm.title}</p>
                  </div>
                  {ccm.youtubeSearchQuery && (
                    <a
                      href={createYouTubeSearchUrl(ccm.youtubeSearchQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${ccm.title} 유튜브에서 검색하기`}
                      className="flex-shrink-0 ml-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-colors duration-200"
                    >
                      <YouTubeIcon className="w-5 h-5" />
                      <span>CCM 듣기</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};