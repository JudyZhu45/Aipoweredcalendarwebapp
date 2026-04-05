import React from 'react';
import { cn } from '../utils/cn';

export interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: string;
  description?: string;
  isAISuggestion?: boolean;
  hasConflict?: boolean;
  eventType?: string;
  isRoutine?: boolean;
  isFromRoutine?: boolean;
  routineId?: string;
  isCompleted?: boolean;
}

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  isSelected?: boolean;
  style?: React.CSSProperties;
}

export function EventCard({ event, onClick, isSelected, style }: EventCardProps) {
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

  const bgColor = colorMap[event.color] || colorMap.brown;
  
  return (
    <div
      className={cn(
        'event-card absolute left-1 right-1 rounded-lg px-2 py-1 text-white cursor-pointer transition-all',
        'hover:shadow-lg hover:scale-[1.02] hover:z-10',
        isSelected && 'ring-2 ring-white shadow-xl scale-[1.02] z-10',
        event.isAISuggestion && 'border-2 border-dashed opacity-70',
        event.hasConflict && 'ring-2 ring-red-500',
        event.isCompleted && 'opacity-50',
      )}
      style={{
        backgroundColor: event.isFromRoutine ? `color-mix(in srgb, ${bgColor} 75%, white)` : bgColor,
        ...style,
      }}
      onClick={onClick}
    >
      <div className={cn('text-xs font-medium truncate', event.isCompleted && 'line-through')}>
        {event.title}
      </div>
      {event.description && (
        <div className="text-xs opacity-90 truncate">{event.description}</div>
      )}
    </div>
  );
}