import React from 'react';
import { TopNavigation } from './components/TopNavigation';
import { Sidebar } from './components/Sidebar';
import { WeekCalendar } from './components/WeekCalendar';
import { AIPanel } from './components/AIPanel';
import { EventModal } from './components/EventModal';
import type { Event } from './components/EventCard';

// Mock data
const mockCalendars = [
  { id: '1', name: 'Personal', color: 'blue', visible: true },
  { id: '2', name: 'Work', color: 'purple', visible: true },
  { id: '3', name: 'Family', color: 'green', visible: true },
  { id: '4', name: 'Fitness', color: 'orange', visible: false },
];

const generateMockEvents = (): Event[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return [
    {
      id: '1',
      title: 'Team Standup',
      description: 'Daily sync with the team',
      startTime: new Date(today.getTime() + (9 * 60 + 0) * 60000), // 9:00 AM today
      endTime: new Date(today.getTime() + (9 * 60 + 30) * 60000), // 9:30 AM today
      color: 'purple',
    },
    {
      id: '2',
      title: 'Design Review',
      description: 'Review new dashboard designs',
      startTime: new Date(today.getTime() + (11 * 60 + 0) * 60000), // 11:00 AM today
      endTime: new Date(today.getTime() + (12 * 60 + 30) * 60000), // 12:30 PM today
      color: 'blue',
    },
    {
      id: '3',
      title: 'Lunch with Client',
      startTime: new Date(today.getTime() + (13 * 60 + 0) * 60000), // 1:00 PM today
      endTime: new Date(today.getTime() + (14 * 60 + 0) * 60000), // 2:00 PM today
      color: 'orange',
    },
    {
      id: '4',
      title: 'Product Planning',
      description: 'Q2 roadmap discussion',
      startTime: new Date(today.getTime() + (15 * 60 + 0) * 60000), // 3:00 PM today
      endTime: new Date(today.getTime() + (16 * 60 + 30) * 60000), // 4:30 PM today
      color: 'purple',
    },
    {
      id: '5',
      title: 'Gym Session',
      startTime: new Date(today.getTime() + (18 * 60 + 0) * 60000), // 6:00 PM today
      endTime: new Date(today.getTime() + (19 * 60 + 0) * 60000), // 7:00 PM today
      color: 'green',
    },
    // Tomorrow's events
    {
      id: '6',
      title: 'Morning Focus Time',
      description: 'Deep work on project',
      startTime: new Date(today.getTime() + 24 * 60 * 60000 + (8 * 60 + 0) * 60000),
      endTime: new Date(today.getTime() + 24 * 60 * 60000 + (10 * 60 + 0) * 60000),
      color: 'blue',
    },
    {
      id: '7',
      title: 'Client Call',
      startTime: new Date(today.getTime() + 24 * 60 * 60000 + (14 * 60 + 0) * 60000),
      endTime: new Date(today.getTime() + 24 * 60 * 60000 + (15 * 60 + 0) * 60000),
      color: 'purple',
    },
  ];
};

const generateMockSuggestions = (): Event[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return [
    {
      id: 'ai-1',
      title: 'Focus Block',
      description: 'Suggested focus time',
      startTime: new Date(today.getTime() + (10 * 60 + 0) * 60000),
      endTime: new Date(today.getTime() + (11 * 60 + 0) * 60000),
      color: 'teal',
      isAISuggestion: true,
      hasConflict: true,
    },
    {
      id: 'ai-2',
      title: 'Coffee Break',
      description: 'Suggested break',
      startTime: new Date(today.getTime() + (14 * 60 + 30) * 60000),
      endTime: new Date(today.getTime() + (15 * 60 + 0) * 60000),
      color: 'yellow',
      isAISuggestion: true,
    },
  ];
};

export default function App() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [currentView, setCurrentView] = React.useState<'day' | 'week' | 'month'>('week');
  const [events, setEvents] = React.useState<Event[]>(generateMockEvents());
  const [calendars, setCalendars] = React.useState(mockCalendars);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | undefined>();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalInitialDate, setModalInitialDate] = React.useState<Date | undefined>();
  const [isAIPanelExpanded, setIsAIPanelExpanded] = React.useState(true);
  const [aiSuggestions, setAiSuggestions] = React.useState<Event[]>(generateMockSuggestions());

  const handleCreateEvent = () => {
    setSelectedEvent(undefined);
    setModalInitialDate(currentDate);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    if (event.isAISuggestion) return;
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);
    setModalInitialDate(slotDate);
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleDragCreate = (date: Date, startHour: number, endHour: number) => {
    const startDate = new Date(date);
    startDate.setHours(Math.floor(startHour), (startHour % 1) * 60, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(Math.floor(endHour), (endHour % 1) * 60, 0, 0);
    
    // Create a new event directly
    const newEvent: Event = {
      id: crypto.randomUUID(),
      title: 'New Event',
      startTime: startDate,
      endTime: endDate,
      color: 'brown',
    };
    
    setEvents([...events, newEvent]);
    setSelectedEvent(newEvent);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Partial<Event>) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(e => 
        e.id === selectedEvent.id ? { ...e, ...eventData } as Event : e
      ));
    } else {
      // Create new event
      setEvents([...events, eventData as Event]);
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setIsModalOpen(false);
      setSelectedEvent(undefined);
    }
  };

  const handleToggleCalendar = (id: string) => {
    setCalendars(calendars.map(cal => 
      cal.id === id ? { ...cal, visible: !cal.visible } : cal
    ));
  };

  const handleApplySuggestions = () => {
    const newEvents = aiSuggestions.map(s => ({
      ...s,
      isAISuggestion: false,
      hasConflict: false,
    }));
    setEvents([...events, ...newEvents]);
    setAiSuggestions([]);
  };

  const handleDismissSuggestion = (id: string) => {
    setAiSuggestions(aiSuggestions.filter(s => s.id !== id));
  };

  // Filter events based on visible calendars (simplified - in real app would match by calendar)
  const visibleEvents = events;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopNavigation
        currentDate={currentDate}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedDate={currentDate}
          onDateSelect={setCurrentDate}
          onCreateEvent={handleCreateEvent}
          calendars={calendars}
          onToggleCalendar={handleToggleCalendar}
        />

        <WeekCalendar
          currentDate={currentDate}
          events={visibleEvents}
          onEventClick={handleEventClick}
          onTimeSlotClick={handleTimeSlotClick}
          onDragCreate={handleDragCreate}
          selectedEvent={selectedEvent}
        />

        <AIPanel
          isExpanded={isAIPanelExpanded}
          onToggle={() => setIsAIPanelExpanded(!isAIPanelExpanded)}
          suggestions={aiSuggestions}
          onApplySuggestions={handleApplySuggestions}
          onDismissSuggestion={handleDismissSuggestion}
        />
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(undefined);
        }}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        event={selectedEvent}
        initialDate={modalInitialDate}
      />
    </div>
  );
}