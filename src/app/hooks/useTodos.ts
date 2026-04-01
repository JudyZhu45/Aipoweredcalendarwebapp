import { useState, useEffect, useCallback } from 'react';
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  isSchedule,
  type TodoTaskRecord,
} from '../../lib/api';
import { toNaiveISO } from '../../lib/dates';

export function useTodos(userId: string | undefined, refreshKey?: number) {
  const [todos, setTodos] = useState<TodoTaskRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const all = await fetchTodos();
      console.log('[useTodos] total records from DB:', all.length);
      // Plain todos (no startTime/endTime) belonging to this user OR with no userId (pre-fix iOS data)
      setTodos(all.filter(t => !isSchedule(t) && (!t.userId || t.userId === userId)));
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const addTodo = useCallback(async (title: string, dueDate?: string, priority?: string) => {
    if (!userId) return null;
    const newTodo = await createTodo({
      id: crypto.randomUUID(),
      title,
      description: '',
      isCompleted: false,
      userId,
      // dueDate is required in schema — default to end of today if not provided (naive ISO, no UTC conversion)
      dueDate: dueDate ?? toNaiveISO(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59)),
      priority: priority ?? 'medium',
    });
    if (newTodo) {
      setTodos(prev => [newTodo, ...prev]);
    }
    return newTodo;
  }, [userId]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    // Pass _version for DataStore conflict detection
    const updated = await updateTodo({ id, isCompleted: !todo.isCompleted, _version: todo._version ?? undefined });
    if (updated) {
      setTodos(prev => prev.map(t => (t.id === id ? { ...t, isCompleted: !t.isCompleted, _version: updated._version } : t)));
    }
  }, [todos]);

  const removeTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const ok = await deleteTodo(id, todo._version ?? 1);
    if (ok) {
      setTodos(prev => prev.filter(t => t.id !== id));
    }
  }, [todos]);

  return { todos, loading, error, addTodo, toggleTodo, removeTodo, refresh: load };
}
