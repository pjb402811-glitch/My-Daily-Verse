import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-10 animate-fade-in">
      <div className="w-12 h-12 border-4 border-t-4 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
      <p className="text-lg text-slate-600 dark:text-slate-400">
        당신을 위한 '말씀'을 처방 중입니다...
      </p>
    </div>
  );
};