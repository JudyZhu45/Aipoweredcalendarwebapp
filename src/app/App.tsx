import React from 'react';
import { Routes, Route } from 'react-router';
import { addWeeks, subWeeks } from 'date-fns';
import { IterationsShowcase } from './landing/IterationsShowcase';
import { TopNavigation } from './components/TopNavigation';
import { Sidebar } from './components/Sidebar';
import { WeekCalendar } from './components/WeekCalendar';
import { AIPanel } from './components/AIPanel';
import { EventModal } from './components/EventModal';
import { TodoPanel } from './components/TodoPanel';
import { AuthPage } from './components/AuthPage';
import { useAuth } from './hooks/useAuth';
import { useSchedules } from './hooks/useSchedules';
import type { Event } from './components/EventCard';

// Maps eventType → calendar id
const EVENT_TYPE_TO_CALENDAR: Record<string, string> = {
  personal: '1',
  work: '2',
  family: '3',
  fitness: '4',
  health: '4',
  social: '1',
  learning: '2',
  other: '1',
};

const mockCalendars = [
  { id: '1', name: 'Personal', color: 'blue', visible: true },
  { id: '2', name: 'Work', color: 'purple', visible: true },
  { id: '3', name: 'Family', color: 'green', visible: true },
  { id: '4', name: 'Fitness', color: 'orange', visible: true },
];

interface MainAppProps {
  userId: string;
  userEmail: string;
  onLogout: () => void;
}

function MainApp({ userId, userEmail, onLogout }: MainAppProps) {
  const schedule = useSchedules(userId);

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [calendars, setCalendars] = React.useState(mockCalendars);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | undefined>();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalInitialDate, setModalInitialDate] = React.useState<Date | undefined>();
  const [modalInitialEndDate, setModalInitialEndDate] = React.useState<Date | undefined>();
  const [isAIPanelExpanded, setIsAIPanelExpanded] = React.useState(false);
  const [todoRefreshKey, setTodoRefreshKey] = React.useState(0);

  const handleAgentRefresh = React.useCallback(() => {
    schedule.refresh();
    setTodoRefreshKey(k => k + 1);
  }, [schedule.refresh]);

  const handleCreateEvent = () => {
    setSelectedEvent(undefined);
    setModalInitialDate(currentDate);
    setModalInitialEndDate(undefined);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    if (event.isAISuggestion) return;
    setSelectedEvent(event);
    setModalInitialEndDate(undefined);
    setIsModalOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    setModalInitialDate(slotDate);
    setModalInitialEndDate(slotEnd);
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleDragCreate = (date: Date, startHour: number, endHour: number) => {
    const startDate = new Date(date);
    startDate.setHours(Math.floor(startHour), Math.round((startHour % 1) * 60), 0, 0);
    const endDate = new Date(date);
    endDate.setHours(Math.floor(endHour), Math.round((endHour % 1) * 60), 0, 0);
    setModalInitialDate(startDate);
    setModalInitialEndDate(endDate);
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Partial<Event> & { eventType?: string }) => {
    if (selectedEvent && schedule.events.some((e: Event) => e.id === selectedEvent.id)) {
      await schedule.updateSchedule(selectedEvent.id, {
        title: eventData.title,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        description: eventData.description,
        eventType: eventData.eventType,
      });
    } else {
      await schedule.addSchedule(
        eventData.title ?? 'New Event',
        eventData.startTime ?? new Date(),
        eventData.endTime ?? new Date(),
        eventData.eventType ?? 'other',
        eventData.description ?? '',
      );
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      await schedule.removeSchedule(selectedEvent.id);
      setIsModalOpen(false);
      setSelectedEvent(undefined);
    }
  };

  const handlePrevWeek = () => setCurrentDate(d => subWeeks(d, 1));
  const handleNextWeek = () => setCurrentDate(d => addWeeks(d, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleToggleCalendar = (id: string) => {
    setCalendars(calendars.map(cal =>
      cal.id === id ? { ...cal, visible: !cal.visible } : cal
    ));
  };

  const visibleCalendarIds = new Set(calendars.filter(c => c.visible).map(c => c.id));
  const visibleEvents: Event[] = [...schedule.events].filter(event => {
    const calId = EVENT_TYPE_TO_CALENDAR[event.eventType ?? 'other'] ?? '1';
    return visibleCalendarIds.has(calId);
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopNavigation
        currentDate={currentDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        userEmail={userEmail}
        onLogout={onLogout}
      />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar
          selectedDate={currentDate}
          onDateSelect={setCurrentDate}
          onCreateEvent={handleCreateEvent}
          calendars={calendars}
          onToggleCalendar={handleToggleCalendar}
        />
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {schedule.loading && (
            <div className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow text-xs text-gray-400 pointer-events-none">
              Syncing…
            </div>
          )}
          <WeekCalendar
            currentDate={currentDate}
            events={visibleEvents}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            onDragCreate={handleDragCreate}
            selectedEvent={selectedEvent}
          />
        </div>
        <AIPanel
          isExpanded={isAIPanelExpanded}
          onToggle={() => setIsAIPanelExpanded(!isAIPanelExpanded)}
          userId={userId}
          onRefresh={handleAgentRefresh}
        />
        <TodoPanel userId={userId} refreshKey={todoRefreshKey} />
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedEvent(undefined); }}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        event={selectedEvent}
        initialDate={modalInitialDate}
        initialEndDate={modalInitialEndDate}
      />
    </div>
  );
}

function CalendarApp() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🦫</div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth.isSignedIn) {
    return (
      <AuthPage
        onLogin={auth.login}
        onRegister={auth.register}
        onConfirm={auth.confirmCode}
        onResendCode={auth.resendCode}
        isLoading={auth.step === 'loading'}
        error={auth.error}
        pendingEmail={auth.pendingEmail}
      />
    );
  }

  return (
    <MainApp
      userId={auth.user!.userId}
      userEmail={auth.user!.email}
      onLogout={auth.logout}
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/app/*" element={<CalendarApp />} />
      <Route path="*" element={<IterationsShowcase />} />
    </Routes>
  );
}
