/**
 * Shared routine task generation & cleanup helpers.
 * Used by both useRoutines (manual CRUD) and useAgent (AI-driven CRUD).
 */

import {
  fetchTodos, createTodo, deleteTodo,
  type RoutineRecord,
} from './api';
import { toNaiveISO } from './dates';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function matchesDay(frequency: string, weekdays: number[] | undefined, day: Date): boolean {
  if (frequency === 'Daily') return true;
  if (frequency === 'Weekly') {
    const iosDow = day.getDay() + 1; // 1=Sun, 2=Mon, ..., 7=Sat
    const wds = Array.isArray(weekdays) ? weekdays : [];
    return wds.includes(iosDow);
  }
  return false;
}

async function createTodoWithRetry(
  input: Parameters<typeof createTodo>[0],
  retries = 3,
): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const result = await createTodo(input);
    if (result) return true;
    await new Promise(r => setTimeout(r, 300 * Math.pow(2, attempt)));
  }
  console.warn('[generateTasks] failed after retries:', input.dueDate);
  return false;
}

async function processBatch<T>(
  items: T[],
  fn: (item: T) => Promise<boolean>,
  concurrency: number,
): Promise<number> {
  let success = 0;
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(fn));
    success += results.filter(Boolean).length;
    if (i + concurrency < items.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return success;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function generateTasks(
  routine: RoutineRecord,
  userId: string,
  startFrom: Date,
  endAt: Date,
): Promise<number> {
  const hasTime = routine.startTimeHour != null;

  const taskInputs: Parameters<typeof createTodo>[0][] = [];
  const day = new Date(startFrom);
  while (day <= endAt) {
    const wds = Array.isArray(routine.weekdays) ? routine.weekdays : (routine.weekdays != null ? [routine.weekdays] : []);
    if (matchesDay(routine.frequency, wds, day)) {
      const dueDate = toNaiveISO(new Date(
        day.getFullYear(), day.getMonth(), day.getDate(),
        hasTime ? routine.startTimeHour! : 23,
        hasTime ? (routine.startTimeMinute ?? 0) : 59,
      ));
      const startTime = hasTime
        ? toNaiveISO(new Date(day.getFullYear(), day.getMonth(), day.getDate(), routine.startTimeHour!, routine.startTimeMinute ?? 0))
        : undefined;
      const endTime = hasTime && routine.endTimeHour != null
        ? toNaiveISO(new Date(day.getFullYear(), day.getMonth(), day.getDate(), routine.endTimeHour!, routine.endTimeMinute ?? 0))
        : undefined;

      taskInputs.push({
        id: crypto.randomUUID(),
        title: routine.title,
        description: routine.description ?? '',
        isCompleted: false,
        userId,
        dueDate,
        priority: 'medium',
        eventType: routine.eventType ?? 'other',
        routineId: routine.id,
        isFromRoutine: true,
        ...(startTime && endTime ? { startTime, endTime } : {}),
      });
    }
    day.setDate(day.getDate() + 1);
  }

  return processBatch(taskInputs, (input) => createTodoWithRetry(input), 5);
}

export async function batchDelete(tasks: { id: string; _version?: number | null }[]): Promise<void> {
  for (let i = 0; i < tasks.length; i += 5) {
    const batch = tasks.slice(i, i + 5);
    await Promise.all(batch.map(t => deleteTodo(t.id, t._version ?? 1)));
    if (i + 5 < tasks.length) await new Promise(r => setTimeout(r, 200));
  }
}

export async function deleteFutureRoutineTasks(routineId: string): Promise<void> {
  const allTasks = await fetchTodos();
  const today = new Date().toISOString().slice(0, 10);
  const futureTasks = allTasks.filter(t =>
    t.routineId === routineId &&
    !t.isCompleted &&
    t.dueDate && t.dueDate.slice(0, 10) >= today,
  );
  await batchDelete(futureTasks);
}

export async function deleteAllRoutineTasks(routineId: string): Promise<void> {
  const allTasks = await fetchTodos();
  const tasks = allTasks.filter(t => t.routineId === routineId);
  await batchDelete(tasks);
}

export async function deleteTasksBeyondDate(routineId: string, endDate: string): Promise<void> {
  const allTasks = await fetchTodos();
  const cutoff = endDate.slice(0, 10);
  const outOfRange = allTasks.filter(t =>
    t.routineId === routineId &&
    !t.isCompleted &&
    t.dueDate && t.dueDate.slice(0, 10) > cutoff,
  );
  await batchDelete(outOfRange);
}
