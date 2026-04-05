import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { format } from 'date-fns';
import type { Event } from './EventCard';
import { useCustomCategories } from '../hooks/useCustomCategories';

// Maps built-in eventType → named calendar color (CSS variable suffix)
const BUILTIN_TYPE_COLOR: Record<string, string> = {
  work: 'purple',
  personal: 'blue',
  health: 'green',
  social: 'orange',
  learning: 'teal',
  other: 'brown',
};

const BUILTIN_OPTIONS = [
  { value: 'work',     label: '💼 Work' },
  { value: 'personal', label: '👤 Personal' },
  { value: 'health',   label: '💪 Health' },
  { value: 'social',   label: '🤝 Social' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'other',    label: '📌 Other' },
];

const COLOR_SWATCHES = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#10b981', // green
  '#f97316', // orange
  '#14b8a6', // teal
  '#ef4444', // red
  '#eab308', // yellow
  '#ec4899', // pink
];

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<Event> & { eventType?: string }) => void;
  onDelete?: () => void;
  event?: Event;
  initialDate?: Date;
  initialEndDate?: Date;
  userId: string;
}

export function EventModal({ isOpen, onClose, onSave, onDelete, event, initialDate, initialEndDate, userId }: EventModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [eventType, setEventType] = React.useState('other');
  const [date, setDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('10:00');

  // New category form state
  const [showNewCategory, setShowNewCategory] = React.useState(false);
  const [newEmoji, setNewEmoji] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState(COLOR_SWATCHES[0]);

  const { categories: customCategories, addCategory } = useCustomCategories(userId);

  const allOptions = [
    ...BUILTIN_OPTIONS,
    ...customCategories.map((c) => ({ value: c.id, label: `${c.emoji} ${c.name}` })),
  ];

  // Reset fields whenever the modal opens
  React.useEffect(() => {
    if (!isOpen) return;
    setTitle(event?.title ?? '');
    setDescription(event?.description ?? '');
    setShowNewCategory(false);
    setNewEmoji('');
    setNewName('');
    setNewColor(COLOR_SWATCHES[0]);

    // Detect eventType from color or stored value
    const detectedType = Object.entries(BUILTIN_TYPE_COLOR).find(
      ([, c]) => c === event?.color
    )?.[0] ?? event?.eventType ?? 'other';
    setEventType(detectedType);

    const ref = event?.startTime ?? initialDate ?? new Date();
    setDate(format(ref, 'yyyy-MM-dd'));

    if (event?.startTime) {
      setStartTime(format(event.startTime, 'HH:mm'));
      setEndTime(format(event.endTime, 'HH:mm'));
    } else if (initialDate) {
      setStartTime(format(initialDate, 'HH:mm'));
      setEndTime(initialEndDate ? format(initialEndDate, 'HH:mm') : format(new Date(initialDate.getTime() + 60 * 60 * 1000), 'HH:mm'));
    } else {
      setStartTime('09:00');
      setEndTime('10:00');
    }
  }, [isOpen, event, initialDate, initialEndDate]);

  // Resolve display color for the current eventType
  function resolveColor(type: string): { cssVar?: string; hex?: string } {
    if (BUILTIN_TYPE_COLOR[type]) return { cssVar: `var(--event-${BUILTIN_TYPE_COLOR[type]})` };
    const custom = customCategories.find((c) => c.id === type);
    if (custom) return { hex: custom.color };
    return { cssVar: 'var(--event-brown)' };
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const colorInfo = resolveColor(eventType);
    onSave({
      id: event?.id || crypto.randomUUID(),
      title,
      description,
      color: colorInfo.cssVar ? (BUILTIN_TYPE_COLOR[eventType] ?? 'brown') : eventType,
      startTime: startDateTime,
      endTime: endDateTime,
      eventType,
    });
    onClose();
  };

  const handleAddCategory = async () => {
    if (!newName.trim()) return;
    const cat = await addCategory({ name: newName.trim(), emoji: newEmoji || '📌', color: newColor });
    if (cat) setEventType(cat.id);
    setShowNewCategory(false);
    setNewEmoji('');
    setNewName('');
    setNewColor(COLOR_SWATCHES[0]);
  };

  if (!isOpen) return null;

  const isRoutineTask = event?.isFromRoutine;

  if (isRoutineTask && event) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 m-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔁</span>
              <h2 className="text-lg font-semibold">{event.title}</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[var(--accent)] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 mb-6 text-sm text-gray-500">
            <p>{format(event.startTime, 'EEEE, MMM d')} &middot; {format(event.startTime, 'HH:mm')}–{format(event.endTime, 'HH:mm')}</p>
            <p className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
              Generated from a routine. Edit the routine rule in the Habits panel to change time/frequency.
            </p>
          </div>
          <div className="flex gap-3">
            {onDelete && (
              <Button type="button" variant="secondary" onClick={onDelete} className="flex-1 !bg-red-50 !text-red-600 hover:!bg-red-100">
                Delete This Day
              </Button>
            )}
            <Button type="button" className="flex-1" onClick={() => { onSave({ id: event.id, isCompleted: true } as any); onClose(); }}>
              {event.isCompleted ? '✓ Completed' : 'Mark Complete'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const colorInfo = resolveColor(eventType);
  const previewColor = colorInfo.cssVar ?? colorInfo.hex ?? '#8b6914';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{event ? 'Edit Event' : 'Create Event'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--accent)] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Event Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter event title" required />
          </div>

          <div>
            <label className="block text-sm mb-2">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add description (optional)" />
          </div>

          <div>
            <label className="block text-sm mb-2">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Start Time</label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-2">End Time</label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Event Type</label>
            <Select value={eventType} onChange={(e) => setEventType(e.target.value)} options={allOptions} />

            {/* Color preview */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: previewColor }} />
                <span className="text-xs text-gray-400">
                  {BUILTIN_TYPE_COLOR[eventType] ? `${BUILTIN_TYPE_COLOR[eventType]} on calendar` : 'custom category'}
                </span>
              </div>
              {!showNewCategory && (
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="text-xs text-[#8b6914] hover:underline"
                >
                  + New category
                </button>
              )}
            </div>

            {/* Inline new-category form */}
            {showNewCategory && (
              <div className="mt-3 p-3 border border-gray-200 rounded-lg space-y-3 bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value.slice(-2))}
                    placeholder="📌"
                    className="w-16 text-center"
                  />
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Category name"
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setNewColor(hex)}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: hex,
                        borderColor: newColor === hex ? '#1f2937' : 'transparent',
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={handleAddCategory} className="flex-1 !py-1 text-sm">
                    Add
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowNewCategory(false)} className="flex-1 !py-1 text-sm">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {event && onDelete && (
              <Button type="button" variant="secondary" onClick={onDelete} className="flex-1 !bg-red-50 !text-red-600 hover:!bg-red-100">
                Delete
              </Button>
            )}
            {event && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => { onSave({ id: event.id, isCompleted: !event.isCompleted } as any); onClose(); }}
                className={event.isCompleted ? 'flex-1 !bg-amber-50 !text-amber-600 hover:!bg-amber-100' : 'flex-1 !bg-emerald-50 !text-emerald-600 hover:!bg-emerald-100'}
              >
                {event.isCompleted ? 'Undo Complete' : '✓ Complete'}
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
