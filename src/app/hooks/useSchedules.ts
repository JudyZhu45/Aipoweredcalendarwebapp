import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo, isSchedule, type TodoTaskRecord } from '../../lib/api';
import { fromNaiveISO, toNaiveISO } from '../../lib/dates';
import type { Event } from '../components/EventCard';

const EVENT_TYPE_COLOR: Record<string, string> = {
  work: 'purple', personal: 'blue', health: 'green', social: 'orange',
  learning: 'teal', other: 'brown',
};

function taskToEvent(task: TodoTaskRecord): Event {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    startTime: fromNaiveISO(task.startTime),
    endTime: fromNaiveISO(task.endTime),
    color: EVENT_TYPE_COLOR[task.eventType ?? 'other'] ?? 'brown',
    isFromRoutine: task.isFromRoutine ?? false,
    routineId: task.routineId ?? undefined,
    isCompleted: task.isCompleted,
  };
}

export function useSchedules(userId: string | undefined) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const versionMap = useRef<Map<string, number>>(new Map());

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const all = await fetchTodos();
      const schedules = all.filter(t => isSchedule(t) && (!t.userId || t.userId === userId));
      schedules.forEach(t => { if (t._version != null) versionMap.current.set(t.id, t._version); });
      setEvents(schedules.map(taskToEvent));
    } catch {
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const addSchedule = useCallback(async (
    title: string, startTime: Date, endTime: Date, eventType = 'other', description = '',
  ): Promise<Event | null> => {
    if (!userId) return null;
    const record = await createTodo({
      id: crypto.randomUUID(), title, description, isCompleted: false,
      startTime: toNaiveISO(startTime), endTime: toNaiveISO(endTime),
      eventType, userId, dueDate: toNaiveISO(startTime), priority: 'medium',
    });
    if (!record) return null;
    if (record._version != null) versionMap.current.set(record.id, record._version);
    const event = taskToEvent(record);
    setEvents(prev => [...prev, event]);
    return event;
  }, [userId]);

  const updateSchedule = useCallback(async (
    id: string, patch: { title?: string; startTime?: Date; endTime?: Date; eventType?: string; description?: string },
  ): Promise<void> => {
    const input: Partial<TodoTaskRecord> & { id: string } = { id };
    if (patch.title !== undefined) input.title = patch.title;
    if (patch.startTime !== undefined) input.startTime = toNaiveISO(patch.startTime);
    if (patch.endTime !== undefined) input.endTime = toNaiveISO(patch.endTime);
    if (patch.eventType !== undefined) input.eventType = patch.eventType;
    if (patch.description !== undefined) input.description = patch.description;
    const currentVersion = versionMap.current.get(id);
    if (currentVersion != null) input._version = currentVersion;

    const updated = await updateTodo(input);
    if (updated) {
      if (updated._version != null) versionMap.current.set(id, updated._version);
      setEvents(prev => prev.map(e => {
        if (e.id !== id) return e;
        const merged: TodoTaskRecord = {
          id: updated.id, title: updated.title, description: updated.description ?? '',
          isCompleted: updated.isCompleted, dueDate: updated.dueDate,
          startTime: updated.startTime ?? input.startTime ?? toNaiveISO(e.startTime),
          endTime: updated.endTime ?? input.endTime ?? toNaiveISO(e.endTime),
          eventType: updated.eventType ?? input.eventType ?? '',
          userId: updated.userId, _version: updated._version,
        };
        return taskToEvent(merged);
      }));
    }
  }, []);

  const removeSchedule = useCallback(async (id: string): Promise<void> => {
    const version = versionMap.current.get(id) ?? 1;
    const ok = await deleteTodo(id, version);
    if (ok) {
      versionMap.current.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  }, []);

  return { events, loading, error, addSchedule, updateSchedule, removeSchedule, refresh: load };
}
