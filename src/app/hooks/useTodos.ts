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
      const today = new Date().toISOString().slice(0, 10);
      setTodos(all.filter(t => {
        if (isSchedule(t)) return false;
        if (t.userId && t.userId !== userId) return false;
        // Routine todos: only show today's
        if (t.isFromRoutine && t.dueDate && t.dueDate.slice(0, 10) !== today) return false;
        return true;
      }));
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const addTodo = useCallback(async (title: string, dueDate?: string, priority?: string) => {
    if (!userId) return null;
    const newTodo = await createTodo({
      id: crypto.randomUUID(),
      title, description: '', isCompleted: false, userId,
      dueDate: dueDate ?? toNaiveISO(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59)),
      priority: priority ?? 'medium', eventType: 'other',
    });
    if (newTodo) setTodos(prev => [...prev, newTodo]);
    return newTodo;
  }, [userId]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const result = await updateTodo({ id, isCompleted: !todo.isCompleted, _version: todo._version });
    if (result) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted, _version: result._version } : t));
    }
  }, [todos]);

  const removeTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const ok = await deleteTodo(id, todo._version ?? 1);
    if (ok) setTodos(prev => prev.filter(t => t.id !== id));
  }, [todos]);

  return { todos, loading, error, addTodo, toggleTodo, removeTodo };
}
