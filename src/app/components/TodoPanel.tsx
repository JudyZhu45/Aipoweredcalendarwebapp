import React, { useState, useMemo } from 'react';
import { Plus, Loader2, AlertCircle, ClipboardList, X, Check, ArrowUpDown, ArrowDownUp, CalendarClock } from 'lucide-react';
import { cn } from '../utils/cn';
import { useTodos } from '../hooks/useTodos';
import { fromNaiveISO } from '../../lib/dates';

interface TodoPanelProps {
  userId: string;
  refreshKey?: number;
}

const PRIORITY_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  high:   { dot: 'bg-red-400',    badge: 'bg-red-50 text-red-600 border-red-100',     label: 'High'   },
  medium: { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-600 border-amber-100', label: 'Med'  },
  low:    { dot: 'bg-emerald-400',badge: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Low' },
};

/** Maps eventType values (both new canonical and legacy AI-generated) to display color + label */
const EVENT_TYPE_STYLES: Record<string, { color: string; label: string; emoji: string }> = {
  // Canonical categories (match frontend calendar colors)
  work:     { color: '#8b5cf6', label: 'Work',     emoji: '💼' },
  personal: { color: '#3b82f6', label: 'Personal', emoji: '👤' },
  health:   { color: '#10b981', label: 'Health',   emoji: '💪' },
  fitness:  { color: '#f97316', label: 'Fitness',  emoji: '🏋️' },
  social:   { color: '#f97316', label: 'Social',   emoji: '🤝' },
  learning: { color: '#14b8a6', label: 'Learning', emoji: '📚' },
  family:   { color: '#10b981', label: 'Family',   emoji: '👨‍👩‍👧' },
  // Legacy values from older AI tool definitions
  gym:      { color: '#f97316', label: 'Gym',      emoji: '🏋️' },
  meeting:  { color: '#8b5cf6', label: 'Meeting',  emoji: '📅' },
  study:    { color: '#14b8a6', label: 'Study',    emoji: '📖' },
  class:    { color: '#3b82f6', label: 'Class',    emoji: '🎓' },
  dinner:   { color: '#eab308', label: 'Dinner',   emoji: '🍽️' },
  other:    { color: '#8b6914', label: 'Other',    emoji: '📌' },
};

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

type SortKey = 'default' | 'priority' | 'date';
type FilterKey = 'all' | 'high' | 'medium' | 'low';

const SORT_CYCLE: SortKey[] = ['default', 'priority', 'date'];

const FILTER_CHIPS: { key: FilterKey; label: string; dotClass?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'H', dotClass: 'bg-red-400' },
  { key: 'medium', label: 'M', dotClass: 'bg-amber-400' },
  { key: 'low', label: 'L', dotClass: 'bg-emerald-400' },
];

export function TodoPanel({ userId, refreshKey }: TodoPanelProps) {
  const { todos, loading, error, addTodo, toggleTodo, removeTodo } = useTodos(userId, refreshKey);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('default');
  const [filter, setFilter] = useState<FilterKey>('all');

  const pendingCount = todos.filter(t => !t.isCompleted).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsAdding(true);
    setAddError(null);
    const result = await addTodo(newTitle.trim());
    if (result) {
      setNewTitle('');
    } else {
      setAddError('Failed to add task. Please try again.');
    }
    setIsAdding(false);
  };

  const cycleSort = () => {
    setSort(prev => {
      const idx = SORT_CYCLE.indexOf(prev);
      return SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
    });
  };

  // Derived (filtered + sorted) lists
  const applyFilterSort = (list: typeof todos) => {
    let result = filter === 'all'
      ? list
      : list.filter(t => (t.priority?.toLowerCase() ?? '') === filter);

    if (sort === 'priority') {
      result = [...result].sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority?.toLowerCase() ?? ''] ?? 1;
        const pb = PRIORITY_ORDER[b.priority?.toLowerCase() ?? ''] ?? 1;
        return pa - pb;
      });
    } else if (sort === 'date') {
      result = [...result].sort((a, b) =>
        new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime(),
      );
    }
    return result;
  };

  const pendingTodos = useMemo(
    () => applyFilterSort(todos.filter(t => !t.isCompleted)),
    [todos, filter, sort],
  );
  const completedTodos = useMemo(
    () => applyFilterSort(todos.filter(t => t.isCompleted)),
    [todos, filter, sort],
  );

  const SortIcon = sort === 'date' ? CalendarClock : sort === 'priority' ? ArrowDownUp : ArrowUpDown;
  const sortLabel = sort === 'date' ? 'Date' : sort === 'priority' ? 'Priority' : 'Sort';

  return (
    <div className="w-64 border-l border-[var(--calendar-border)] bg-[var(--calendar-header-bg)] flex flex-col overflow-hidden flex-shrink-0">

      {/* ── Header ── */}
      <div className="h-14 px-4 border-b border-[var(--calendar-border)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-semibold">Tasks</span>
        </div>
        {pendingCount > 0 && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
            {pendingCount}
          </span>
        )}
      </div>

      {/* ── Filter + Sort controls ── */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--calendar-border)] flex-shrink-0">
        {/* Filter chips */}
        <div className="flex items-center gap-1 flex-1">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.key}
              onClick={() => setFilter(chip.key)}
              className={cn(
                'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border transition-all',
                filter === chip.key
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
                  : 'bg-transparent text-[var(--muted-foreground)] border-[var(--calendar-border)] hover:border-[var(--primary)]/30 hover:text-[var(--foreground)]',
              )}
            >
              {chip.dotClass && (
                <span className={cn('w-1.5 h-1.5 rounded-full', chip.dotClass)} />
              )}
              {chip.label}
            </button>
          ))}
        </div>

        {/* Sort cycle button */}
        <button
          onClick={cycleSort}
          title={`Sort by: ${sortLabel}`}
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border transition-all',
            sort !== 'default'
              ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
              : 'bg-transparent text-[var(--muted-foreground)] border-[var(--calendar-border)] hover:border-[var(--primary)]/30 hover:text-[var(--foreground)]',
          )}
        >
          <SortIcon className="w-2.5 h-2.5" />
          {sort !== 'default' && <span>{sortLabel}</span>}
        </button>
      </div>

      {/* ── Add task form ── */}
      <form onSubmit={handleAdd} className="px-3 py-2.5 border-b border-[var(--calendar-border)] flex-shrink-0">
        <div className="flex gap-1.5 items-center">
          <input
            type="text"
            value={newTitle}
            onChange={e => { setNewTitle(e.target.value); setAddError(null); }}
            placeholder="Add a task…"
            disabled={isAdding}
            className={cn(
              'flex-1 text-[13px] bg-[var(--accent)]/50 border border-[var(--calendar-border)] rounded-xl',
              'px-3 py-1.5 outline-none placeholder:text-[var(--muted-foreground)]',
              'focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/60 transition-all',
              'disabled:opacity-50',
            )}
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || isAdding}
            className={cn(
              'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
              newTitle.trim() && !isAdding
                ? 'text-white shadow-sm hover:opacity-90 active:scale-95'
                : 'bg-[var(--accent)] text-[var(--muted-foreground)] cursor-not-allowed'
            )}
            style={newTitle.trim() && !isAdding
              ? { background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)' }
              : undefined}
          >
            {isAdding
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Plus className="w-3.5 h-3.5" />
            }
          </button>
        </div>
        {addError && (
          <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {addError}
          </p>
        )}
      </form>

      {/* ── Task list ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-[var(--muted-foreground)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mx-3 mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && todos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--muted-foreground)]">
            <ClipboardList className="w-8 h-8 opacity-30" />
            <p className="text-xs">No tasks yet</p>
            <p className="text-[11px] opacity-60">Add one above ↑</p>
          </div>
        )}

        {/* No results after filter */}
        {!loading && !error && todos.length > 0 && pendingTodos.length === 0 && completedTodos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-1 text-[var(--muted-foreground)]">
            <p className="text-xs">No {filter} priority tasks</p>
          </div>
        )}

        {/* Pending tasks */}
        {!loading && pendingTodos.length > 0 && (
          <div className="pt-1">
            {pendingTodos.map(todo => (
              <TodoRow key={todo.id} todo={todo} onToggle={toggleTodo} onRemove={removeTodo} />
            ))}
          </div>
        )}

        {/* Completed section */}
        {!loading && completedTodos.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-[var(--muted-foreground)] px-4 pt-3 pb-1">
              Completed
            </p>
            {completedTodos.map(todo => (
              <TodoRow key={todo.id} todo={todo} onToggle={toggleTodo} onRemove={removeTodo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TodoRow ──────────────────────────────────────────────────────────────────

function TodoRow({
  todo,
  onToggle,
  onRemove,
}: {
  todo: import('../../lib/api').TodoTaskRecord;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const priority = todo.priority?.toLowerCase() ?? '';
  const pStyle = PRIORITY_STYLES[priority];
  const eventKey = (todo.eventType ?? 'other').toLowerCase();
  const eStyle = EVENT_TYPE_STYLES[eventKey] ?? EVENT_TYPE_STYLES.other;

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 pl-2.5 pr-3 py-2 group hover:bg-[var(--accent)]/60 transition-colors border-l-[3px]',
        todo.isCompleted && 'opacity-50',
      )}
      style={{ borderLeftColor: todo.isCompleted ? 'var(--calendar-border)' : eStyle.color }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={cn(
          'mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all',
          todo.isCompleted
            ? 'border-[var(--primary)] bg-[var(--primary)]'
            : 'border-[var(--calendar-border)] hover:border-[var(--primary)]'
        )}
      >
        {todo.isCompleted && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] leading-snug break-words',
          todo.isCompleted ? 'line-through text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'
        )}>
          {todo.title}
        </p>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {/* Category badge */}
          {!todo.isCompleted && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                color: eStyle.color,
                backgroundColor: eStyle.color + '18',
              }}
            >
              <span className="leading-none text-[9px]">{eStyle.emoji}</span>
              {eStyle.label}
            </span>
          )}

          {/* Priority badge */}
          {pStyle && (
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border',
              pStyle.badge,
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', pStyle.dot)} />
              {pStyle.label}
            </span>
          )}

          {/* Due date — parsed as naive (wall-clock) to avoid timezone shift */}
          {todo.dueDate && (
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {fromNaiveISO(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onRemove(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--muted-foreground)] hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
