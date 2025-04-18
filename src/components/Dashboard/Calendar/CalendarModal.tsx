import React from 'react';
import { X, Search, Filter, Calendar } from 'lucide-react';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';

interface CalendarModalProps {
  onClose: () => void;
}

export function CalendarModal({ onClose }: CalendarModalProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [displayMode, setDisplayMode] = React.useState<'month' | 'week' | 'day' | '4day' | 'schedule'>('month');
  
  const [filters, setFilters] = React.useState({
    showWeekends: true,
    showDeclinedEvents: true,
    showCompletedTasks: true,
    showAppointments: true,
    eventTypes: {
      task: true
    }
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div 
        className="relative w-[1200px] h-[calc(100vh-6rem)] max-h-[800px] rounded-xl bg-zinc-900/70 backdrop-blur-xl border border-[#B38B3F]/30 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#B38B3F]/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B38B3F]/20 to-[#FFD700]/10 flex items-center justify-center border border-[#B38B3F]/30">
              <Calendar className="w-6 h-6 text-[#FFD700]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Calendar</h2>
              <p className="text-white/60 text-sm">View your schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative h-[calc(100%-5rem)] overflow-hidden">
          <div className="p-4 overflow-y-auto relative h-full">
            <CalendarHeader 
              viewMode="calendar"
              setViewMode={() => {}}
              displayMode={displayMode}
              setDisplayMode={setDisplayMode}
              filters={filters}
              setFilters={setFilters}
              onClose={onClose}
            />
            
            <div className="max-w-[1100px] mx-auto">
              <MonthView
                currentMonth={currentMonth}
                currentYear={currentYear}
                setCurrentMonth={setCurrentMonth}
                setCurrentYear={setCurrentYear}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                filters={filters}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}