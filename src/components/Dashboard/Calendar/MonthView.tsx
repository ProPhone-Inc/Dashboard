import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from './CalendarDay';

interface MonthViewProps {
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  filters: any;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthView({
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
  selectedDate,
  onDateSelect,
  filters
}: MonthViewProps) {
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousMonth}
              className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 text-white/70 group-hover:text-[#FFD700] transition-colors" />
            </button>
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#B38B3F] via-[#FFD700] to-[#B38B3F] text-transparent bg-clip-text">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={goToNextMonth}
              className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors group"
            >
              <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-[#FFD700] transition-colors" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-zinc-800/50 min-h-0">
        {dayNames.map((day) => (
          <div key={day} className="py-1 text-center text-white/50 font-medium text-xs border-b border-[#FFD700]/20">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 border border-[#FFD700]/20 rounded-lg shadow-[0_0_20px_rgba(255,215,0,0.1)]">
        <CalendarDay
          currentMonth={currentMonth}
          currentYear={currentYear}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          filters={filters}
        />
      </div>
    </div>
  );
}