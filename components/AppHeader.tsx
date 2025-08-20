import React from 'react';

export const AppHeader: React.FC = () => {
  return (
    <header className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          말씀 처방
        </h1>
        <p className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
          오늘 하루는 어떠셨나요? <br /> 당신의 이야기를 들려주세요.
        </p>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            솔직하게 적어주시면 힘이 되는 말씀을 찾아 드립니다.
        </p>
    </header>
  )
}