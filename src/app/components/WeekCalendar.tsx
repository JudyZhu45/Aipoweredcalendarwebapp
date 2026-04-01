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

/** Compute overlapping columns so events side-by-side instead of stacking */
function layoutEvents(events: Event[]): Map<string, { left: number; width: number }> {
  const layout = new Map<string, { left: number; width: number }>();
  if (!events.length) return layout;

  // Sort by start time
  const sorted = [...events].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  // Group into clusters of overlapping events
  const clusters: Event[][] = [];
  let currentCluster: Event[] = [];
  let clusterEnd = 0;

  for (const event of sorted) {
    const start = event.startTime.getTime();
    const end = event.endTime.getTime();
    if (currentCluster.length === 0 || start < clusterEnd) {
      currentCluster.push(event);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      clusters.push(currentCluster);
      currentCluster = [event];
      clusterEnd = end;
    }
  }
  if (currentCluster.length) clusters.push(currentCluster);

  for (const cluster of clusters) {
    // Assign columns via greedy algorithm
    const columns: Event[][] = [];
    for (const event of cluster) {
      let placed = false;
      for (const col of columns) {
        const last = col[col.length - 1];
        if (event.startTime.getTime() >= last.endTime.getTime()) {
          col.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([event]);
    }

    const numCols = columns.length;
    for (let ci = 0; ci < columns.length; ci++) {
      for (const event of columns[ci]) {
        layout.set(event.id, {
          left: ci / numCols,
          width: 1 / numCols,
        });
      }
    }
  }

  return layout;
}

export function WeekCalendar({ currentDate, events, onEventClick, onTimeSlotClick, onDragCreate, selectedEvent }: WeekCalendarProps) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i); // 12 AM (0) to 11 PM (23)
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isToday = (date: Date) => isSameDay(date, now);

  // Auto-scroll to current time on mount
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollTo = Math.max(0, currentHour * 60 - 120);
      scrollContainerRef.current.scrollTop = scrollTo;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag-to-create state
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ day: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = React.useState<{ day: number; y: number } | null>(null);
  const dayColumnRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Group events by day + compute overlap layout per day
  const eventsByDay = weekDays.map(day =>
    events.filter(event => isSameDay(event.startTime, day))
  );
  const layoutsByDay = eventsByDay.map(dayEvents => layoutEvents(dayEvents));

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, dayIndex: number) => {
    if ((e.target as HTMLElement).closest('.event-card')) return;
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
    if (dragStart.day === dragEnd.day && Math.abs(endY - startY) > 5) {
      const startHour = startY / 60;
      const endHour = endY / 60;
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
    const height = Math.max(endY - startY, 30);
    return { dayIndex: dragStart.day, top: startY, height };
  };
  const dragPreview = getDragPreview();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--calendar-bg)]">
      {/* Week header — always visible, never scrolls */}
      <div className="bg-white border-b border-[var(--calendar-border)] grid grid-cols-[56px_repeat(7,1fr)] flex-shrink-0">
        <div className="border-r border-[var(--calendar-border)]" />
        {weekDays.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={i}
              className={cn(
                'py-2 px-1 text-center border-r border-[var(--calendar-border)] last:border-r-0',
                today && 'bg-[var(--accent)]'
              )}
            >
              <div className="text-xs text-[var(--muted-foreground)] uppercase">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                'text-xl mt-0.5 leading-8',
                today && 'w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-[var(--primary)] text-white text-base'
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid — only this area scrolls vertically */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative grid grid-cols-[56px_repeat(7,1fr)]">
          {/* Time column */}
          <div className="border-r border-[var(--calendar-border)] relative">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] relative">
                {hour > 0 && (
                  <span className="absolute -top-2 right-2 text-xs text-[var(--muted-foreground)]">
                    {format(new Date().setHours(hour, 0), 'ha')}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayLayout = layoutsByDay[dayIndex];
            return (
              <div
                key={dayIndex}
                className="relative border-r border-[var(--calendar-border)] last:border-r-0"
                ref={el => { dayColumnRefs.current[dayIndex] = el; }}
                onMouseDown={e => handleMouseDown(e, dayIndex)}
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
                {isToday(day) && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${currentHour * 60 + currentMinute}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[var(--current-time-indicator)]" />
                      <div className="flex-1 h-[2px] bg-[var(--current-time-indicator)]" />
                    </div>
                  </div>
                )}

                {/* Events — side-by-side when overlapping */}
                {eventsByDay[dayIndex].map(event => {
                  const startHour = event.startTime.getHours();
                  const startMinute = event.startTime.getMinutes();
                  const endHour = event.endTime.getHours();
                  const endMinute = event.endTime.getMinutes();
                  const top = startHour * 60 + startMinute;
                  const height = Math.max((endHour - startHour) * 60 + (endMinute - startMinute), 30);
                  const col = dayLayout.get(event.id) ?? { left: 0, width: 1 };
                  const GUTTER = 2; // px gap between columns
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => onEventClick(event)}
                      isSelected={selectedEvent?.id === event.id}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `calc(${col.left * 100}% + ${GUTTER}px)`,
                        width: `calc(${col.width * 100}% - ${GUTTER * 2}px)`,
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

