import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { format } from 'date-fns';
import type { Event } from './EventCard';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<Event>) => void;
  onDelete?: () => void;
  event?: Event;
  initialDate?: Date;
}

export function EventModal({ isOpen, onClose, onSave, onDelete, event, initialDate }: EventModalProps) {
  const [title, setTitle] = React.useState(event?.title || '');
  const [description, setDescription] = React.useState(event?.description || '');
  const [color, setColor] = React.useState(event?.color || 'blue');
  const [date, setDate] = React.useState(
    event?.startTime ? format(event.startTime, 'yyyy-MM-dd') : 
    initialDate ? format(initialDate, 'yyyy-MM-dd') : 
    format(new Date(), 'yyyy-MM-dd')
  );
  const [startTime, setStartTime] = React.useState(
    event?.startTime ? format(event.startTime, 'HH:mm') : '09:00'
  );
  const [endTime, setEndTime] = React.useState(
    event?.endTime ? format(event.endTime, 'HH:mm') : '10:00'
  );

  const colorOptions = [
    { value: 'brown', label: 'Brown' },
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
    { value: 'pink', label: 'Pink' },
    { value: 'red', label: 'Red' },
    { value: 'orange', label: 'Orange' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'green', label: 'Green' },
    { value: 'teal', label: 'Teal' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    onSave({
      id: event?.id || crypto.randomUUID(),
      title,
      description,
      color,
      startTime: startDateTime,
      endTime: endDateTime,
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
            <label className="block text-sm mb-2">Color</label>
            <Select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              options={colorOptions}
            />
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