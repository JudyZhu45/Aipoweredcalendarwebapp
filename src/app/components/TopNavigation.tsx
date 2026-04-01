import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '../utils/cn';

interface TopNavigationProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

export function TopNavigation({ currentDate, onPrevWeek, onNextWeek, onToday, userEmail, onLogout }: TopNavigationProps) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const isCurrentWeek = startOfWeek(new Date()).getTime() === weekStart.getTime();

  // Format: "Mar 23 – 29, 2026" or "Mar 30 – Apr 5, 2026"
  const weekLabel = weekStart.getMonth() === weekEnd.getMonth()
    ? `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'd, yyyy')}`
    : `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;

  return (
    <div className="flex-shrink-0 bg-white border-b border-[var(--calendar-border)] px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <Calendar className="w-5 h-5 text-[var(--primary)]" />
          <span className="text-base font-semibold">BeaverAI</span>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevWeek}
            className="p-1.5 rounded-lg hover:bg-[var(--accent)] transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className={cn(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              isCurrentWeek
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--calendar-border)] hover:bg-[var(--accent)]'
            )}
          >
            Today
          </button>
          <button
            onClick={onNextWeek}
            className="p-1.5 rounded-lg hover:bg-[var(--accent)] transition-colors"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-[var(--foreground)] min-w-[180px] text-center">
            {weekLabel}
          </span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2 min-w-[140px] justify-end">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
            {userEmail ? userEmail[0].toUpperCase() : 'U'}
          </div>
          <p className="text-xs text-gray-500 max-w-[110px] truncate hidden sm:block">{userEmail}</p>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
