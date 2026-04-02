import { useState, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { toast } from 'sonner';
import { streamAgent, type AIAction, type RawMessage, type ThinkingStep } from '../../lib/agent';
import { createTodo, updateTodo, deleteTodo } from '../../lib/api';
import { toNaiveISO } from '../../lib/dates';

// ─── UI-level message (simpler than raw OpenAI history) ──────────────────────

export interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;      // true while stream is in progress
  thinkingSteps?: ThinkingStep[];
  actions?: AIAction[];
  /** Action-level errors (e.g. _version conflict, network failure) */
  actionErrors?: string[];
  /** Unix ms timestamp — set when message is created/finalized */
  timestamp?: number;
  /** Actions awaiting user confirmation before execution */
  pendingActions?: AIAction[];
}

export type AgentMode = 'standard' | 'deep_thinking';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAgent(userId: string, onRefresh?: () => void) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Raw OpenAI-format history maintained between turns
  const rawHistoryRef = useRef<RawMessage[]>([]);
  // Stable request ID for the current turn — preserved across retries
  const requestIdRef = useRef<string>(crypto.randomUUID());
  // Track which requestIds have already had their actions executed (idempotency)
  const executedRequestIds = useRef<Set<string>>(new Set());
  // Pending confirmation state
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    msgId: string;
    requestId: string;
    actions: AIAction[];
  } | null>(null);

  const send = useCallback(async (text: string, mode: AgentMode = 'standard') => {
    if (!text.trim() || isLoading) return;

    const requestId = requestIdRef.current;
    let resumeOffset = 0;

    // Add user message
    const userMsg: DisplayMessage = { id: crypto.randomUUID(), role: 'user', content: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    // Add streaming placeholder for assistant message
    const streamMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: streamMsgId, role: 'assistant', content: '', isStreaming: true }]);

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt <= MAX_RETRIES) {
      try {
        let accText = '';
        const pendingThinking: ThinkingStep[] = [];
        let collectedActions: AIAction[] = [];
        let updatedHistory: RawMessage[] = [];

        const stream = streamAgent({
          message: text.trim(),
          user_id: userId,
          history: rawHistoryRef.current,
          mode,
          request_id: requestId,
          resume_offset: resumeOffset,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        for await (const event of stream) {
          resumeOffset = event.seq + 1;

          if (event.type === 'thinking') {
            // Update existing step or add new one
            const idx = pendingThinking.findIndex(
              s => s.round === event.data.round && s.label === event.data.label,
            );
            if (idx >= 0) pendingThinking[idx] = event.data;
            else pendingThinking.push(event.data);
            setMessages(prev =>
              prev.map(m =>
                m.id === streamMsgId ? { ...m, thinkingSteps: [...pendingThinking] } : m,
              ),
            );
          } else if (event.type === 'token') {
            accText += event.data.text;
            flushSync(() => {
              setMessages(prev =>
                prev.map(m => (m.id === streamMsgId ? { ...m, content: accText } : m)),
              );
            });
          } else if (event.type === 'actions') {
            collectedActions = event.data;
          } else if (event.type === 'done') {
            updatedHistory = event.data.updated_history;
          } else if (event.type === 'error') {
            throw new Error(event.data.message);
          }
        }

        // Update history for next turn
        rawHistoryRef.current = updatedHistory;

        // If there are actions, show confirmation card instead of executing immediately
        if (!executedRequestIds.current.has(requestId) && collectedActions.length > 0) {
          setPendingConfirmation({ msgId: streamMsgId, requestId, actions: collectedActions });
          setMessages(prev =>
            prev.map(m =>
              m.id === streamMsgId
                ? {
                    ...m,
                    content: accText,
                    isStreaming: false,
                    timestamp: Date.now(),
                    thinkingSteps: pendingThinking.length > 0 ? pendingThinking : undefined,
                    pendingActions: collectedActions,
                  }
                : m,
            ),
          );
        } else {
          // No actions — finalize immediately
          setMessages(prev =>
            prev.map(m =>
              m.id === streamMsgId
                ? {
                    ...m,
                    content: accText,
                    isStreaming: false,
                    timestamp: Date.now(),
                    thinkingSteps: pendingThinking.length > 0 ? pendingThinking : undefined,
                  }
                : m,
            ),
          );
        }

        // Rotate request ID for the next turn
        requestIdRef.current = crypto.randomUUID();
        break; // success — exit retry loop

      } catch (err) {
        attempt++;
        if (attempt > MAX_RETRIES) {
          const msg = err instanceof Error ? err.message : 'Something went wrong.';
          setError(msg);
          // Remove the streaming placeholder on final failure
          setMessages(prev => prev.filter(m => m.id !== streamMsgId));
          break;
        }
        // Exponential backoff before retry; resumeOffset is preserved for reconnect
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }

    setIsLoading(false);
  }, [userId, isLoading, onRefresh]);

  const confirmActions = useCallback(async () => {
    if (!pendingConfirmation) return;
    const { msgId, requestId, actions } = pendingConfirmation;
    setPendingConfirmation(null);

    // Remove pendingActions from message immediately
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, pendingActions: undefined } : m),
    );

    const failures = await executeActions(actions, userId);
    executedRequestIds.current.add(requestId);

    if (failures.length === 0) {
      toast.success(`${actions.length} action${actions.length > 1 ? 's' : ''} applied`);
    } else {
      failures.forEach(f => toast.error(f));
    }

    onRefresh?.();

    setMessages(prev =>
      prev.map(m =>
        m.id === msgId
          ? {
              ...m,
              actions,
              actionErrors: failures.length > 0 ? failures : undefined,
            }
          : m,
      ),
    );
  }, [pendingConfirmation, userId, onRefresh]);

  const dismissActions = useCallback(() => {
    if (!pendingConfirmation) return;
    const { msgId } = pendingConfirmation;
    setPendingConfirmation(null);
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, pendingActions: undefined } : m),
    );
    toast('Actions cancelled', { icon: '✕' });
  }, [pendingConfirmation]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
    setPendingConfirmation(null);
    rawHistoryRef.current = [];
    requestIdRef.current = crypto.randomUUID();
  }, []);

  return { messages, isLoading, error, send, clearHistory, pendingConfirmation, confirmActions, dismissActions };
}

// ─── Action executor ──────────────────────────────────────────────────────────

/** Runs all actions; returns a list of human-readable failure strings. */
async function executeActions(actions: AIAction[], userId: string): Promise<string[]> {
  const failures: string[] = [];

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'create_task':
          await createTaskFromData(action.data, userId);
          break;
        case 'create_multiple_tasks':
          await Promise.all(action.data.map(d => createTaskFromData(d, userId)));
          break;
        case 'update_task': {
          const result = await updateTodo({
            id: action.task_id,
            _version: action._version,
            ...(action.fields.title && { title: action.fields.title }),
            ...(action.fields.description && { description: action.fields.description }),
            ...(action.fields.priority && { priority: action.fields.priority }),
            ...(action.fields.event_type && { eventType: action.fields.event_type }),
            ...(action.fields.due_date && { dueDate: parseDateToISO(action.fields.due_date, action.fields.start_time) }),
            ...(action.fields.start_time && { startTime: parseDateTimeToISO(action.fields.due_date, action.fields.start_time) }),
            ...(action.fields.end_time && { endTime: parseDateTimeToISO(action.fields.due_date, action.fields.end_time) }),
          });
          if (!result) failures.push(`Failed to update task "${action.fields.title ?? action.task_id}"`);
          break;
        }
        case 'delete_task': {
          const ok = await deleteTodo(action.task_id, action._version ?? 1);
          if (!ok) failures.push(`Failed to delete task (ID: ${action.task_id.slice(0, 8)}…)`);
          break;
        }
        case 'complete_task': {
          const result = await updateTodo({
            id: action.task_id,
            isCompleted: true,
            _version: action._version,
          });
          if (!result) failures.push(`Failed to mark task complete (ID: ${action.task_id.slice(0, 8)}…)`);
          break;
        }
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error(`[useAgent] action ${action.type} failed:`, err);
      failures.push(`${action.type} failed: ${detail}`);
    }
  }

  return failures;
}

function createTaskFromData(data: import('../../lib/agent').AITaskData, userId: string) {
  const isSchedule = !!(data.start_time && data.end_time && data.due_date);
  const dueDate = parseDateToISO(data.due_date, data.start_time);
  return createTodo({
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description ?? '',
    isCompleted: false,
    userId,
    dueDate,
    priority: data.priority ?? 'medium',
    eventType: data.event_type ?? 'other',
    ...(isSchedule && {
      startTime: parseDateTimeToISO(data.due_date, data.start_time),
      endTime: parseDateTimeToISO(data.due_date, data.end_time),
    }),
  });
}

/**
 * Build a naive ISO string from agent-provided date/time strings.
 * Does NOT convert to UTC — the numbers are stored as wall-clock time.
 * "yyyy-MM-dd" + "HH:mm" → "yyyy-MM-ddTHH:mm:00.000Z"
 */
function parseDateToISO(dateStr?: string, timeStr?: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  if (!dateStr) {
    // No date provided — default to today at 23:59 local
    return toNaiveISO(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59));
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr ? timeStr.split(':').map(Number) : [23, 59];
  return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:00.000Z`;
}

function parseDateTimeToISO(dateStr?: string, timeStr?: string): string {
  return parseDateToISO(dateStr, timeStr);
}
