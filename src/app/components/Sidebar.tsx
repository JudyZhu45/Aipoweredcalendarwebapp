import React from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { MiniCalendar } from './MiniCalendar';
import { cn } from '../utils/cn';

interface CalendarItem {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

interface SidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateEvent: () => void;
  calendars: CalendarItem[];
  onToggleCalendar: (id: string) => void;
}

export function Sidebar({ selectedDate, onDateSelect, onCreateEvent, calendars, onToggleCalendar }: SidebarProps) {
  const [isCalendarListExpanded, setIsCalendarListExpanded] = React.useState(true);
  
  const colorMap: Record<string, string> = {
    brown: 'var(--event-brown)',
    blue: 'var(--event-blue)',
    purple: 'var(--event-purple)',
    pink: 'var(--event-pink)',
    red: 'var(--event-red)',
    orange: 'var(--event-orange)',
    yellow: 'var(--event-yellow)',
    green: 'var(--event-green)',
    teal: 'var(--event-teal)',
  };
  
  return (
    <div className="w-72 border-r border-[var(--calendar-border)] bg-[var(--calendar-header-bg)] p-6 flex flex-col gap-6">
      {/* Create button */}
      <Button onClick={onCreateEvent} className="w-full justify-center shadow-sm">
        <Plus className="w-5 h-5" />
        Create Event
      </Button>

      {/* Mini calendar */}
      <MiniCalendar selectedDate={selectedDate} onDateSelect={onDateSelect} />

      {/* Calendar list */}
      <div className="flex-1">
        <button
          onClick={() => setIsCalendarListExpanded(!isCalendarListExpanded)}
          className="flex items-center gap-2 w-full mb-3 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {isCalendarListExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          My Calendars
        </button>

        {isCalendarListExpanded && (
          <div className="space-y-1">
            {calendars.map((calendar) => (
              <button
                key={calendar.id}
                onClick={() => onToggleCalendar(calendar.id)}
                className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-[var(--accent)] transition-colors text-sm group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 transition-all',
                      calendar.visible && 'bg-current'
                    )}
                    style={{ 
                      color: colorMap[calendar.color] || colorMap.blue,
                      borderColor: colorMap[calendar.color] || colorMap.blue
                    }}
                  />
                  <span className={cn(
                    'transition-opacity',
                    !calendar.visible && 'opacity-50'
                  )}>
                    {calendar.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}