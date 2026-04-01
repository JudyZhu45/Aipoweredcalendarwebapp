import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { format } from 'date-fns';
import type { Event } from './EventCard';

// Maps eventType → calendar color (mirrors useSchedules.ts)
const EVENT_TYPE_COLOR: Record<string, string> = {
  work: 'purple',
  personal: 'blue',
  health: 'green',
  social: 'orange',
  learning: 'teal',
  other: 'brown',
};

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<Event> & { eventType?: string }) => void;
  onDelete?: () => void;
  event?: Event;
  initialDate?: Date;
  initialEndDate?: Date;
}

export function EventModal({ isOpen, onClose, onSave, onDelete, event, initialDate, initialEndDate }: EventModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [eventType, setEventType] = React.useState('other');
  const [date, setDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('10:00');

  // Reset all fields whenever the modal opens with a new event/date
  React.useEffect(() => {
    if (!isOpen) return;
    setTitle(event?.title ?? '');
    setDescription(event?.description ?? '');
    // Reverse-lookup eventType from color, default 'other'
    const detectedType = Object.entries(EVENT_TYPE_COLOR).find(
      ([, c]) => c === event?.color
    )?.[0] ?? 'other';
    setEventType(detectedType);
    const ref = event?.startTime ?? initialDate ?? new Date();
    setDate(format(ref, 'yyyy-MM-dd'));

    if (event?.startTime) {
      // Editing existing event — use its times
      setStartTime(format(event.startTime, 'HH:mm'));
      setEndTime(format(event.endTime, 'HH:mm'));
    } else if (initialDate) {
      // Created from drag or slot click — use provided start/end
      setStartTime(format(initialDate, 'HH:mm'));
      setEndTime(initialEndDate ? format(initialEndDate, 'HH:mm') : format(new Date(initialDate.getTime() + 60 * 60 * 1000), 'HH:mm'));
    } else {
      setStartTime('09:00');
      setEndTime('10:00');
    }
  }, [isOpen, event, initialDate, initialEndDate]);

  const eventTypeOptions = [
    { value: 'work', label: '💼 Work' },
    { value: 'personal', label: '👤 Personal' },
    { value: 'health', label: '💪 Health' },
    { value: 'social', label: '🤝 Social' },
    { value: 'learning', label: '📚 Learning' },
    { value: 'other', label: '📌 Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    onSave({
      id: event?.id || crypto.randomUUID(),
      title,
      description,
      color: EVENT_TYPE_COLOR[eventType] ?? 'brown',
      startTime: startDateTime,
      endTime: endDateTime,
      eventType,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--accent)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Event Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Start Time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2">End Time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Event Type</label>
            <Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              options={eventTypeOptions}
            />
            {/* Color preview */}
            <div className="mt-2 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: `var(--event-${EVENT_TYPE_COLOR[eventType] ?? 'brown'})` }}
              />
              <span className="text-xs text-gray-400 capitalize">
                {EVENT_TYPE_COLOR[eventType] ?? 'brown'} on calendar
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {event && onDelete && (
              <Button
                type="button"
                variant="secondary"
                onClick={onDelete}
                className="flex-1 !bg-red-50 !text-red-600 hover:!bg-red-100"
              >
                Delete
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {event ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}