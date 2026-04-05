import { useState, useEffect, useCallback } from 'react';
import {
  fetchRoutines,
  createRoutine, updateRoutine, deleteRoutine,
  type RoutineRecord,
} from '../../lib/api';
import {
  generateTasks,
  deleteFutureRoutineTasks,
  deleteAllRoutineTasks,
  deleteTasksBeyondDate,
} from '../../lib/routine-tasks';

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRoutines(userId: string | undefined, onChanged?: () => void, refreshKey?: number) {
  const [routines, setRoutines] = useState<RoutineRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const all = await fetchRoutines();
      setRoutines(all.filter(r => !r.userId || r.userId === userId));
    } catch {
      setError('Failed to load routines');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load, refreshKey]);

  // ─── Create routine + pre-generate all tasks ──────────────────────────

  const addRoutine = useCallback(async (data: {
    title: string;
    frequency: string;
    weekdays?: number[];
    startTimeHour?: number;
    startTimeMinute?: number;
    endTimeHour?: number;
    endTimeMinute?: number;
    endDate?: string;
    eventType?: string;
  }) => {
    if (!userId) return null;
    const record = await createRoutine({
      id: crypto.randomUUID(),
      title: data.title,
      description: '',
      routineType: (data.startTimeHour != null) ? 'Schedule' : 'Todo',
      frequency: data.frequency,
      weekdays: data.weekdays,
      startTimeHour: data.startTimeHour,
      startTimeMinute: data.startTimeMinute ?? 0,
      endTimeHour: data.endTimeHour,
      endTimeMinute: data.endTimeMinute ?? 0,
      eventType: data.eventType ?? 'other',
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: data.endDate ? new Date(data.endDate + 'T23:59:59').toISOString() : undefined,
      userId,
    } as any);
    if (!record) return null;
    setRoutines(prev => [...prev, record]);

    // Pre-generate tasks from today to endDate (or +90 days)
    const startFrom = new Date();
    const endAt = data.endDate ? new Date(data.endDate) : new Date(Date.now() + 90 * 86400000);
    await generateTasks(record, userId, startFrom, endAt);

    onChanged?.();
    return record;
  }, [userId, onChanged]);

  // ─── Toggle (pause/resume) with cascade ───────────────────────────────

  const toggleRoutine = useCallback(async (id: string, isActive: boolean, version: number) => {
    const result = await updateRoutine({ id, isActive: !isActive, _version: version });
    if (!result) return;

    const routine = routines.find(r => r.id === id);
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, isActive: !isActive, _version: result._version } : r));

    if (isActive) {
      // Pausing → delete future uncompleted tasks
      await deleteFutureRoutineTasks(id);
    } else if (routine) {
      // Resuming → regenerate future tasks
      const startFrom = new Date();
      const endAt = routine.endDate ? new Date(routine.endDate) : new Date(Date.now() + 90 * 86400000);
      await generateTasks({ ...routine, isActive: true, _version: result._version }, userId!, startFrom, endAt);
    }

    onChanged?.();
  }, [routines, userId, onChanged]);

  // ─── Delete routine + all its tasks ───────────────────────────────────

  const removeRoutine = useCallback(async (id: string, version: number) => {
    const ok = await deleteRoutine(id, version);
    if (!ok) return;
    setRoutines(prev => prev.filter(r => r.id !== id));
    await deleteAllRoutineTasks(id);
    onChanged?.();
  }, [onChanged]);

  // ─── Edit routine rules + regenerate future tasks ─────────────────────

  const editRoutine = useCallback(async (id: string, version: number, data: {
    title?: string;
    frequency?: string;
    weekdays?: number[];
    startTimeHour?: number;
    startTimeMinute?: number;
    endTimeHour?: number;
    endTimeMinute?: number;
    endDate?: string;
    eventType?: string;
  }) => {
    // Build the update payload — explicitly null out endDate if cleared
    const updatePayload: any = {
      id,
      _version: version,
      ...data,
    };
    if (data.endDate) {
      updatePayload.endDate = new Date(data.endDate + 'T23:59:59').toISOString();
    } else if (data.endDate === '') {
      // User cleared the end date → remove it from the record
      updatePayload.endDate = null;
    }

    const result = await updateRoutine(updatePayload);
    if (!result) return;

    const routine = routines.find(r => r.id === id);
    const newEndDate = data.endDate || undefined;
    const newEndAt = newEndDate ? new Date(newEndDate) : new Date(Date.now() + 90 * 86400000);

    // 1. Delete all future uncompleted tasks (they'll be regenerated)
    await deleteFutureRoutineTasks(id);

    // 2. If end date was shortened, also trim past tasks beyond the new end date
    if (newEndDate) {
      await deleteTasksBeyondDate(id, newEndDate);
    }

    // 3. Regenerate future tasks with updated rules
    if (routine) {
      const updated = { ...routine, ...data, _version: result._version, isActive: true };
      await generateTasks(updated as RoutineRecord, userId!, new Date(), newEndAt);
    }

    await load();
    onChanged?.();
  }, [routines, userId, onChanged, load]);

  return { routines, loading, error, addRoutine, toggleRoutine, removeRoutine, editRoutine, refresh: load };
}
