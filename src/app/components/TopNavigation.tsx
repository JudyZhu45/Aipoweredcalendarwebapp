import React from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from './Input';
import { cn } from '../utils/cn';

interface TopNavigationProps {
  currentDate: Date;
  currentView: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
}

export function TopNavigation({ currentDate, currentView, onViewChange }: TopNavigationProps) {
  const views: Array<'day' | 'week' | 'month'> = ['day', 'week', 'month'];
  
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[var(--calendar-border)] px-6 py-4">
      <div className="flex items-center justify-between gap-6">
        {/* Logo and date */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-xl font-semibold">CalendarAI</span>
          </div>
          
          <div className="text-2xl font-medium">
            {format(currentDate, 'MMMM d, yyyy')}
          </div>
        </div>

        {/* View switcher and search */}
        <div className="flex items-center gap-4">
          {/* View tabs */}
          <div className="flex items-center gap-1 bg-[var(--accent)] p-1 rounded-lg">
            {views.map((view) => (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm transition-all capitalize',
                  currentView === view
                    ? 'bg-white shadow-sm font-medium'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                )}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Search */}
          <Input
            placeholder="Search events..."
            icon={<Search className="w-4 h-4" />}
            className="w-64"
          />

          {/* User avatar */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center text-white font-medium">
              JD
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
