import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  entries: Record<string, any>;
}

const emotionEmojiMap: { [key: string]: string } = {
    joy: '😊',
    gratitude: '🙏',
    peace: '😌',
    excitement: '🤩',
    contentment: '🙂',
    sadness: '😢',
    anger: '😠',
    anxiety: '😟',
    loneliness: '😔',
    tiredness: '😴',
    disappointment: '😞',
};

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, entries }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  React.useEffect(() => {
    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate])

  const changeMonth = (amount: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="이전 달">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold">
          {currentMonth.getFullYear()}년 {currentMonth.toLocaleString('ko-KR', { month: 'long' })}
        </h3>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="다음 달">
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return (
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-slate-500">
        {days.map(day => <div key={day} className="py-2">{day}</div>)}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = currentMonth;
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    
    const rows = [];
    let day = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (rows.length < 6) {
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const cloneDay = new Date(day);
            const dateKey = `${cloneDay.getFullYear()}-${String(cloneDay.getMonth() + 1).padStart(2, '0')}-${String(cloneDay.getDate()).padStart(2, '0')}`;
            const isSelected = selectedDate.toDateString() === cloneDay.toDateString();
            const isToday = today.toDateString() === cloneDay.toDateString();
            
            const entry = entries[dateKey];
            const hasTextEntry = !!entry?.text;
            const firstEmotion = entry?.emotions?.[0];
            const emotionEmoji = firstEmotion ? emotionEmojiMap[firstEmotion] : null;

            const isCurrentMonth = cloneDay.getMonth() === monthStart.getMonth();
            
            weekDays.push(
              <div
                key={day.toISOString()}
                className={`flex flex-col items-center justify-center h-12 text-center rounded-full cursor-pointer transition-colors duration-200 ${
                  !isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : ''
                } ${
                  isSelected ? 'bg-sky-500 text-white font-bold' : isToday ? 'bg-sky-100 dark:bg-sky-900/50' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                onClick={() => onDateChange(cloneDay)}
              >
                <span className="leading-none">{cloneDay.getDate()}</span>
                <div className="h-4 flex items-center justify-center">
                  {emotionEmoji ? (
                    <span className="text-xs" role="img" aria-label={firstEmotion}>
                      {emotionEmoji}
                    </span>
                  ) : hasTextEntry ? (
                    <span className="block w-1.5 h-1.5 bg-emerald-500 rounded-full" title="일기 작성됨"></span>
                  ) : null}
                </div>
              </div>
            );
            day.setDate(day.getDate() + 1);
        }
        rows.push(
            <div className="grid grid-cols-7 gap-1" key={rows.length}>
            {weekDays}
            </div>
        );
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className="p-4 sm:p-6 bg-white/60 dark:bg-slate-800/60 rounded-xl shadow-lg">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};
