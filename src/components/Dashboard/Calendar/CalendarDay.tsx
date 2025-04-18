import React from 'react';

interface CalendarDayProps {
  currentMonth: number;
  currentYear: number;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  filters: any;
}

export function CalendarDay({
  currentMonth,
  currentYear,
  selectedDate,
  onDateSelect,
  filters
}: CalendarDayProps) {
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-px h-[calc(100%-3rem)]">
      {Array.from({ length: 42 }, (_, i) => {
        const dayNumber = i - firstDayOfMonth + 1;
        const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
        const date = new Date(currentYear, currentMonth, dayNumber);
        const dateString = date.toISOString().split('T')[0];
        const isToday = 
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();

        return (
          <button
            key={i}
            onClick={() => isCurrentMonth && onDateSelect(date)}
            disabled={!isCurrentMonth}
            className={`
              h-full p-2 transition-all duration-200 relative group flex flex-col items-start
              ${isCurrentMonth
                ? 'hover:bg-[#FFD700]/10 hover:shadow-lg' 
                : 'bg-black/40 cursor-not-allowed'
              }
              ${isToday ? 'ring-2 ring-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.3)]' : ''}
              border-[0.5px] border-[#FFD700]/20 hover:border-[#FFD700]/40
              transition-[border-color,box-shadow,transform]
              hover:shadow-[0_0_15px_rgba(255,215,0,0.15)]
              hover:z-10
              min-h-[90px]
            `}
          >
            <div className="mb-1">
              <span className={`
              text-xs font-medium flex items-center space-x-2
              ${isCurrentMonth ? 'text-white' : 'text-white/30'}
              ${isToday ? 'text-[#FFD700] bg-[#FFD700]/10 px-1.5 py-0.5 rounded-full w-fit' : ''}
              `}>
              {isCurrentMonth ? dayNumber : ''}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}