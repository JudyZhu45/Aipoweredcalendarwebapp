import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { EventCard, type Event } from './EventCard';
import { cn } from '../utils/cn';

interface WeekCalendarProps {
  currentDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
  onDragCreate?: (date: Date, startHour: number, endHour: number) => void;
  selectedEvent?: Event;
}

export function WeekCalendar({ currentDate, events, onEventClick, onTimeSlotClick, onDragCreate, selectedEvent }: WeekCalendarProps) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 12 AM
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isToday = (date: Date) => isSameDay(date, now);

  // Drag-to-create state
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ day: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = React.useState<{ day: number; y: number } | null>(null);
  const dayColumnRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Calculate event positioning
  const getEventPosition = (event: Event, dayIndex: number) => {
    const startHour = event.startTime.getHours();
    const startMinute = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMinute = event.endTime.getMinutes();
    
    const top = ((startHour - 6) * 60 + startMinute) * (60 / 60); // 60px per hour
    const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) * (60 / 60);
    
    return { top, height };
  };

  // Group events by day
  const eventsByDay = weekDays.map(day => 
    events.filter(event => isSameDay(event.startTime, day))
  );

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, dayIndex: number) => {
    // Prevent event click when starting drag
    if ((e.target as HTMLElement).closest('.event-card')) {
      return;
    }
    
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ day: dayIndex, y });
    setDragEnd({ day: dayIndex, y });
    
    e.preventDefault();
  };

  // Handle drag move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;

    // Find which day column the mouse is over
    let dayIndex = dragStart.day;
    for (let i = 0; i < dayColumnRefs.current.length; i++) {
      const ref = dayColumnRefs.current[i];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right) {
          dayIndex = i;
          break;
        }
      }
    }

    const ref = dayColumnRefs.current[dayIndex];
    if (ref) {
      const rect = ref.getBoundingClientRect();
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
      setDragEnd({ day: dayIndex, y });
    }
    
    e.preventDefault();
  };

  // Handle drag end
  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const startY = Math.min(dragStart.y, dragEnd.y);
    const endY = Math.max(dragStart.y, dragEnd.y);
    
    // Only create if there's a meaningful drag (more than 5px)
    if (dragStart.day === dragEnd.day && Math.abs(endY - startY) > 5) {
      // Calculate hours (60px per hour)
      const startHour = startY / 60 + 6;
      const endHour = endY / 60 + 6;
      
      // Minimum 30 minutes
      const finalEndHour = Math.max(endHour, startHour + 0.5);
      
      if (onDragCreate) {
        onDragCreate(weekDays[dragStart.day], startHour, finalEndHour);
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Calculate drag preview
  const getDragPreview = () => {
    if (!isDragging || !dragStart || !dragEnd || dragStart.day !== dragEnd.day) return null;

    const startY = Math.min(dragStart.y, dragEnd.y);
    const endY = Math.max(dragStart.y, dragEnd.y);
    const height = Math.max(endY - startY, 30); // Minimum 30px

    return {
      dayIndex: dragStart.day,
      top: startY,
      height,
    };
  };

  const dragPreview = getDragPreview();

  return (
    <div className="flex-1 overflow-auto bg-[var(--calendar-bg)]">
      <div className="min-w-[900px]">
        {/* Week header */}
        <div className="sticky top-0 z-30 bg-white border-b border-[var(--calendar-border)] grid grid-cols-[60px_repeat(7,1fr)]">
          <div className="border-r border-[var(--calendar-border)]" />
          {weekDays.map((day, i) => {
            const today = isToday(day);
            return (
              <div
                key={i}
                className={cn(
                  'p-4 text-center border-r border-[var(--calendar-border)] last:border-r-0',
                  today && 'bg-[var(--accent)]'
                )}
              >
                <div className="text-xs text-[var(--muted-foreground)] uppercase">
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  'text-2xl mt-1',
                  today && 'w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-[var(--primary)] text-white'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative">
          <div className="grid grid-cols-[60px_repeat(7,1fr)]">
            {/* Time column */}
            <div className="border-r border-[var(--calendar-border)]">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="h-[60px] px-2 text-xs text-[var(--muted-foreground)] text-right pr-2 -mt-2"
                >
                  {format(new Date().setHours(hour, 0), 'ha')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="relative border-r border-[var(--calendar-border)] last:border-r-0"
                ref={el => dayColumnRefs.current[dayIndex] = el}
                onMouseDown={e => handleMouseDown(e, dayIndex)}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Hour grid lines */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-[var(--calendar-border)] hover:bg-blue-50/30 cursor-pointer transition-colors"
                    onClick={() => onTimeSlotClick(day, hour)}
                  />
                ))}

                {/* Current time indicator */}
                {isToday(day) && currentHour >= 6 && currentHour < 24 && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{
                      top: `${((currentHour - 6) * 60 + currentMinute)}px`,
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[var(--current-time-indicator)]" />
                      <div className="flex-1 h-[2px] bg-[var(--current-time-indicator)]" />
                    </div>
                  </div>
                )}

                {/* Events */}
                {eventsByDay[dayIndex].map(event => {
                  const { top, height } = getEventPosition(event, dayIndex);
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => onEventClick(event)}
                      isSelected={selectedEvent?.id === event.id}
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 30)}px`,
                      }}
                    />
                  );
                })}

                {/* Drag preview */}
                {dragPreview && dragPreview.dayIndex === dayIndex && (
                  <div
                    className="absolute left-1 right-1 rounded-lg bg-[var(--event-brown)]/20 border-2 border-dashed border-[var(--event-brown)] pointer-events-none z-10"
                    style={{
                      top: `${dragPreview.top}px`,
                      height: `${dragPreview.height}px`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}