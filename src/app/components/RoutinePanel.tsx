import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Pause, Play, Loader2, AlertCircle, Flame, X, Pencil, Clock } from 'lucide-react';
import { cn } from '../utils/cn';
import { useRoutines } from '../hooks/useRoutines';
import type { RoutineRecord } from '../../lib/api';

interface RoutinePanelProps {
  userId: string;
  refreshKey?: number;
  onTaskGenerated?: () => void;
  embedded?: boolean;
}

const FREQ_LABEL: Record<string, string> = { Daily: 'Daily', Weekly: 'Weekly' };
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatTime(h?: number | null, m?: number | null): string {
  if (h == null) return '';
  return `${String(h).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`;
}

function computeDuration(startTime: string, endTime: string): string | null {
  if (!startTime || !endTime) return null;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

// ─── Custom Time Picker ─────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 5-minute intervals

function ScrollColumn({ items, selected, onSelect, formatItem }: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  formatItem: (v: number) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_H = 28;

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx >= 0 && containerRef.current) {
      containerRef.current.scrollTo({ top: idx * ITEM_H, behavior: 'auto' });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto h-[112px] snap-y snap-mandatory"
      style={{ scrollbarWidth: 'none' }}
    >
      {items.map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onSelect(v)}
          className={cn(
            'w-full h-7 flex items-center justify-center text-xs snap-center transition-all',
            selected === v
              ? 'text-[#8a5a3c] font-bold text-sm'
              : 'text-gray-400 hover:text-gray-600'
          )}
        >
          {formatItem(v)}
        </button>
      ))}
    </div>
  );
}

function TimePicker({ value, onChange, label }: {
  value: string; // "HH:MM" or ""
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const [h, m] = value ? value.split(':').map(Number) : [-1, -1];
  const selectedH = h >= 0 ? h : 9;
  const selectedM = m >= 0 ? m : 0;
  const snappedM = Math.round(selectedM / 5) * 5;

  const displayH = value ? String(selectedH % 12 || 12).padStart(2, '0') : '--';
  const displayM = value ? String(selectedM).padStart(2, '0') : '--';
  const displayAMPM = value ? (selectedH >= 12 ? 'PM' : 'AM') : '--';

  // Position dropdown relative to trigger, clamped to viewport
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const W = 160;
    const H = 180; // approximate dropdown height
    let top = rect.bottom + 4;
    let left = rect.left + rect.width / 2 - W / 2;
    // Clamp horizontal
    left = Math.max(8, Math.min(left, window.innerWidth - W - 8));
    // Flip above if overflows bottom
    if (top + H > window.innerHeight - 8) {
      top = rect.top - H - 4;
    }
    setPos({ top, left });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const update = (hour: number, minute: number) => {
    onChange(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  };

  const dropdown = open ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-white rounded-xl shadow-lg border border-[var(--calendar-border)] p-1"
      style={{ top: pos.top, left: pos.left, width: 160 }}
    >
      <div className="relative flex gap-0">
        {/* Hour column */}
        <ScrollColumn
          items={HOURS}
          selected={selectedH}
          onSelect={(v) => update(v, snappedM)}
          formatItem={(v) => {
            const h12 = v % 12 || 12;
            return String(h12).padStart(2, '0');
          }}
        />

        {/* Separator */}
        <div className="flex items-center justify-center w-3 shrink-0">
          <span className="text-[#8a5a3c]/30 font-bold">:</span>
        </div>

        {/* Minute column */}
        <ScrollColumn
          items={MINUTES}
          selected={snappedM}
          onSelect={(v) => update(selectedH, v)}
          formatItem={(v) => String(v).padStart(2, '0')}
        />

        {/* Separator */}
        <div className="w-px bg-[var(--calendar-border)] mx-0.5 my-2" />

        {/* AM/PM column */}
        <div className="flex flex-col justify-center gap-0.5 px-1.5">
          {['AM', 'PM'].map(period => {
            const isAM = period === 'AM';
            const active = isAM ? selectedH < 12 : selectedH >= 12;
            return (
              <button
                key={period}
                type="button"
                onClick={() => {
                  let newH = selectedH;
                  if (isAM && selectedH >= 12) newH -= 12;
                  if (!isAM && selectedH < 12) newH += 12;
                  update(newH, snappedM);
                }}
                className={cn(
                  'text-[9px] font-semibold px-2 py-1 rounded-full transition-all',
                  active
                    ? 'bg-[#8a5a3c] text-white'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                )}
              >
                {period}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm */}
      <button
        type="button"
        onClick={() => {
          if (!value) update(9, 0);
          setOpen(false);
        }}
        className="w-full mt-1 py-1.5 rounded-xl text-[10px] font-semibold text-white bg-gradient-to-r from-[#8a5a3c] to-[#d9a441] hover:shadow-sm transition-all"
      >
        Done
      </button>
    </div>,
    document.body
  ) : null;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-baseline gap-0.5 py-1 px-2 rounded-lg transition-colors',
          open ? 'bg-[#8a5a3c]/8' : 'hover:bg-gray-50'
        )}
      >
        <span className="text-xl font-bold text-[var(--foreground)] tabular-nums">{displayH}</span>
        <span className="text-xl font-bold text-[#8a5a3c]/40">:</span>
        <span className="text-xl font-bold text-[var(--foreground)] tabular-nums">{displayM}</span>
        <span className="text-[9px] font-semibold text-[#8a5a3c] ml-0.5">{displayAMPM}</span>
      </button>

      {dropdown}
    </div>
  );
}

// ─── Custom Date Picker ─────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const shift = (firstDay + 6) % 7; // Monday-start offset
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(shift).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function DatePickerCustom({ value, onChange }: {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const today = new Date();
  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  const displayText = parsed
    ? `${MONTH_NAMES[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`
    : 'No end date';

  // Position dropdown
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const W = 220;
    const H = 260;
    let top = rect.bottom + 4;
    let left = rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - W - 8));
    if (top + H > window.innerHeight - 8) top = rect.top - H - 4;
    setPos({ top, left });
  }, [open, viewMonth, viewYear]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(t) &&
        dropdownRef.current && !dropdownRef.current.contains(t)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const isToday = (day: number) =>
    viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();

  const isSelected = (day: number) =>
    parsed != null && viewYear === parsed.getFullYear() && viewMonth === parsed.getMonth() && day === parsed.getDate();

  const cells = getCalendarDays(viewYear, viewMonth);

  const dropdown = open ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-white rounded-xl shadow-lg border border-[var(--calendar-border)] p-2.5"
      style={{ top: pos.top, left: pos.left, width: 220 }}
    >
      {/* Month/Year header */}
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prevMonth}
          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 text-xs">
          ‹
        </button>
        <span className="text-[11px] font-semibold text-[var(--foreground)]">
          {MONTH_FULL[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth}
          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 text-xs">
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-0.5">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-[8px] font-semibold text-gray-400 uppercase py-0.5">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day ? (
              <button
                type="button"
                onClick={() => selectDay(day)}
                className={cn(
                  'w-6 h-6 rounded-full text-[10px] flex items-center justify-center transition-all',
                  isSelected(day)
                    ? 'bg-[#8a5a3c] text-white font-bold'
                    : isToday(day)
                    ? 'ring-1 ring-[#8a5a3c]/40 text-[#8a5a3c] font-semibold hover:bg-[#8a5a3c]/10'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {day}
              </button>
            ) : <div className="w-6 h-6" />}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--calendar-border)]">
        <button type="button" onClick={() => { onChange(''); setOpen(false); }}
          className="text-[9px] font-semibold text-gray-400 hover:text-gray-600 px-2 py-1 rounded-md hover:bg-gray-50">
          Clear
        </button>
        <button type="button" onClick={() => {
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          onChange(`${today.getFullYear()}-${m}-${d}`);
          setOpen(false);
        }}
          className="text-[9px] font-semibold text-[#8a5a3c] hover:bg-[#8a5a3c]/10 px-2 py-1 rounded-md">
          Today
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => { setOpen(!open); if (!open) { setViewYear(parsed?.getFullYear() ?? today.getFullYear()); setViewMonth(parsed?.getMonth() ?? today.getMonth()); } }}
        className="rounded-2xl border border-[var(--calendar-border)] bg-white cursor-pointer hover:border-[#8a5a3c]/30 transition-colors"
      >
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <span className="text-sm">📅</span>
          <div className="flex-1 min-w-0">
            <div className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Until</div>
            <span className={cn('text-[13px] font-medium', parsed ? 'text-[var(--foreground)]' : 'text-gray-400')}>
              {displayText}
            </span>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </div>
      </div>
      {dropdown}
    </>
  );
}

const EVENT_TYPES = [
  { value: 'work', label: '💼 Work' },
  { value: 'personal', label: '👤 Personal' },
  { value: 'health', label: '💪 Health' },
  { value: 'fitness', label: '🏋️ Fitness' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'other', label: '📌 Other' },
];

interface RoutineFormData {
  title: string;
  frequency: string;
  weekdays?: number[];
  startTimeHour?: number;
  startTimeMinute?: number;
  endTimeHour?: number;
  endTimeMinute?: number;
  endDate?: string;
  eventType?: string;
}

export function RoutinePanel({ userId, refreshKey, onTaskGenerated, embedded }: RoutinePanelProps) {
  const { routines, loading, error, addRoutine, toggleRoutine, removeRoutine, editRoutine } = useRoutines(userId, onTaskGenerated, refreshKey);
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingRoutine, setEditingRoutine] = useState<RoutineRecord | null>(null);

  const handleCreate = async (data: RoutineFormData) => {
    await addRoutine(data);
    setFormMode('closed');
  };

  const handleEdit = async (data: RoutineFormData) => {
    if (!editingRoutine) return;
    await editRoutine(editingRoutine.id, editingRoutine._version ?? 1, data);
    setFormMode('closed');
    setEditingRoutine(null);
  };

  const openEdit = (routine: RoutineRecord) => {
    setEditingRoutine(routine);
    setFormMode('edit');
  };

  return (
    <div className={embedded
      ? 'flex flex-col overflow-hidden h-full'
      : 'w-64 border-l border-[var(--calendar-border)] bg-white flex flex-col overflow-hidden'
    }>
      {/* Add button row */}
      <div className="px-3 py-2 flex justify-end">
        <button
          onClick={() => { setFormMode(formMode === 'closed' ? 'create' : 'closed'); setEditingRoutine(null); }}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--accent)] transition-colors text-[var(--muted-foreground)]"
        >
          {formMode !== 'closed' ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Form */}
      {formMode !== 'closed' && (
        <RoutineForm
          initial={formMode === 'edit' && editingRoutine ? {
            title: editingRoutine.title,
            frequency: editingRoutine.frequency,
            weekdays: Array.isArray(editingRoutine.weekdays) ? editingRoutine.weekdays : [],
            startTimeHour: editingRoutine.startTimeHour ?? undefined,
            startTimeMinute: editingRoutine.startTimeMinute ?? undefined,
            endTimeHour: editingRoutine.endTimeHour ?? undefined,
            endTimeMinute: editingRoutine.endTimeMinute ?? undefined,
            endDate: editingRoutine.endDate?.slice(0, 10),
          } : undefined}
          submitLabel={formMode === 'edit' ? 'Save Changes' : 'Add Habit'}
          onSubmit={formMode === 'edit' ? handleEdit : handleCreate}
        />
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-foreground)]" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-red-500 text-xs px-1 py-2">
            <AlertCircle className="w-3.5 h-3.5" /><span>{error}</span>
          </div>
        )}

        {!loading && routines.length === 0 && (
          <div className="text-center py-8 px-2">
            <Flame className="w-7 h-7 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-[var(--muted-foreground)]">No habits yet</p>
          </div>
        )}

        {routines.map(r => (
          <RoutineCard
            key={r.id}
            routine={r}
            onToggle={() => toggleRoutine(r.id, r.isActive, r._version ?? 1)}
            onDelete={() => removeRoutine(r.id, r._version ?? 1)}
            onEdit={() => openEdit(r)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function RoutineCard({ routine, onToggle, onDelete, onEdit }: {
  routine: RoutineRecord;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const time = formatTime(routine.startTimeHour, routine.startTimeMinute);
  const endTime = formatTime(routine.endTimeHour, routine.endTimeMinute);
  const timeRange = time && endTime ? `${time}–${endTime}` : '';

  const wds = Array.isArray(routine.weekdays) ? routine.weekdays : [];
  const weekdayStr = routine.frequency === 'Weekly' && wds.length > 0
    ? wds.map(d => WEEKDAY_LABELS[(d - 1) % 7] ?? '?').join('')
    : '';

  return (
    <div className={cn(
      'group rounded-lg px-2.5 py-2 transition-all cursor-pointer',
      routine.isActive
        ? 'bg-white hover:bg-[var(--accent)]/50'
        : 'bg-gray-50 opacity-50',
    )} onClick={onEdit}>
      <div className="flex items-center gap-2">
        <button
          onClick={e => { e.stopPropagation(); onToggle(); }}
          className="shrink-0"
          title={routine.isActive ? 'Pause' : 'Resume'}
        >
          {routine.isActive
            ? <Pause className="w-3 h-3 text-emerald-500" />
            : <Play className="w-3 h-3 text-gray-400" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-[var(--foreground)] truncate">{routine.title}</p>
          <p className="text-[10px] text-[var(--muted-foreground)] truncate">
            {FREQ_LABEL[routine.frequency] ?? routine.frequency}
            {timeRange && ` · ${timeRange}`}
            {weekdayStr && ` · ${weekdayStr}`}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onEdit(); }} title="Edit">
            <Pencil className="w-3 h-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete">
            <Trash2 className="w-3 h-3 text-red-400 hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form ────────────────────────────────────────────────────────────────────

function RoutineForm({ initial, submitLabel, onSubmit }: {
  initial?: Partial<RoutineFormData>;
  submitLabel: string;
  onSubmit: (data: RoutineFormData) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [frequency, setFrequency] = useState(initial?.frequency ?? 'Daily');
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? [2, 3, 4, 5, 6]);
  const fmtT = (h?: number, m?: number) => h != null ? `${String(h).padStart(2,'0')}:${String(m??0).padStart(2,'0')}` : '';
  const [startTime, setStartTime] = useState(fmtT(initial?.startTimeHour, initial?.startTimeMinute));
  const [endTime, setEndTime] = useState(fmtT(initial?.endTimeHour, initial?.endTimeMinute));
  const [eventType, setEventType] = useState(initial?.eventType ?? 'other');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [submitting, setSubmitting] = useState(false);

  const parseTime = (t: string) => {
    if (!t) return { h: undefined, m: undefined };
    const [h, m] = t.split(':').map(Number);
    return { h, m };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const st = parseTime(startTime);
    const et = parseTime(endTime);
    await onSubmit({
      title: title.trim(),
      frequency,
      weekdays: frequency === 'Weekly' ? weekdays : undefined,
      startTimeHour: st.h,
      startTimeMinute: st.m,
      endTimeHour: et.h,
      endTimeMinute: et.m,
      endDate: endDate || undefined,
      eventType,
    });
    setSubmitting(false);
  };

  const toggleDay = (d: number) => setWeekdays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());

  return (
    <form onSubmit={handleSubmit} className="px-3 pb-3 space-y-2.5 border-b border-[var(--calendar-border)]">
      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Habit name"
        className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-[var(--calendar-border)] bg-white focus:outline-none focus:ring-1 focus:ring-[#8b6914]/30 placeholder:text-gray-300"
        autoFocus
      />

      {/* Frequency */}
      <div className="flex gap-1.5">
        {['Daily', 'Weekly'].map(f => (
          <button key={f} type="button" onClick={() => setFrequency(f)}
            className={cn(
              'text-[11px] px-3 py-1 rounded-full transition-colors',
              frequency === f
                ? 'bg-[#8b6914] text-white'
                : 'bg-[var(--accent)] text-[var(--muted-foreground)] hover:bg-gray-100',
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Weekdays */}
      {frequency === 'Weekly' && (
        <div className="flex gap-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <button key={i} type="button" onClick={() => toggleDay(i + 1)}
              className={cn(
                'w-7 h-7 rounded-full text-[10px] font-medium transition-colors',
                weekdays.includes(i + 1)
                  ? 'bg-[#8b6914] text-white'
                  : 'bg-[var(--accent)] text-[var(--muted-foreground)]',
              )}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Category */}
      <div className="flex flex-wrap gap-1">
        {EVENT_TYPES.map(t => (
          <button key={t.value} type="button" onClick={() => setEventType(t.value)}
            className={cn(
              'text-[10px] px-2 py-1 rounded-full transition-colors',
              eventType === t.value
                ? 'bg-[#8b6914] text-white'
                : 'bg-[var(--accent)] text-[var(--muted-foreground)] hover:bg-gray-100',
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Time Card */}
      <div className="rounded-2xl border border-[var(--calendar-border)] bg-white">
        {/* Header */}
        <div className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-2">
          <Clock className="w-3 h-3 text-[var(--muted-foreground)]" />
          <span className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">Time</span>
        </div>
        <div className="h-px bg-[var(--calendar-border)]" />

        {/* Start / Arrow / End */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center py-3 px-1">
          <TimePicker label="Start" value={startTime} onChange={setStartTime} />
          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center mx-0.5 mt-4">
            <span className="text-emerald-600 text-xs font-semibold">→</span>
          </div>
          <TimePicker label="End" value={endTime} onChange={setEndTime} />
        </div>

        {/* Duration badge */}
        {computeDuration(startTime, endTime) && (
          <>
            <div className="h-px bg-[var(--calendar-border)]" />
            <div className="px-3.5 py-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                ⏱ {computeDuration(startTime, endTime)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Until Card */}
      <DatePickerCustom value={endDate} onChange={setEndDate} />

      <button type="submit" disabled={!title.trim() || submitting}
        className="w-full text-[11px] font-semibold py-2.5 rounded-xl text-white disabled:opacity-40 transition-all bg-gradient-to-r from-[#8a5a3c] to-[#d9a441] hover:shadow-md">
        {submitting ? '...' : submitLabel}
      </button>
    </form>
  );
}
