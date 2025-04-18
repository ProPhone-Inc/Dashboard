import React from 'react';
import { Search, Filter, Calendar as CalendarIcon, Maximize2, Minimize2 } from 'lucide-react';

interface CalendarHeaderProps {
  viewMode: 'calendar' | 'tasks';
  setViewMode: (mode: 'calendar' | 'tasks') => void;
  displayMode: string;
  setDisplayMode: (mode: string) => void;
  taskDisplayMode?: string;
  setTaskDisplayMode?: (mode: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  onClose: () => void;
}

export function CalendarHeader({
  viewMode,
  setViewMode,
  displayMode,
  setDisplayMode,
  taskDisplayMode,
  setTaskDisplayMode,
  filters,
  setFilters,
  onClose
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-[#B38B3F]/20">
      <div className="flex items-center space-x-6">
        <div className="flex bg-zinc-800/50 rounded-lg p-0.5">
          <button
            className="px-4 py-2 rounded-lg transition-colors bg-[#FFD700]/90 text-black font-medium text-sm"
          >
            Calendar
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-white/80 text-sm rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}