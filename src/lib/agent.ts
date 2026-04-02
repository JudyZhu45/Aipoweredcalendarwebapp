// ─── Shared types (mirrored from lambda/src/models) ──────────────────────────

export interface AITaskData {
  title: string;
  description?: string;
  due_date?: string;   // "yyyy-MM-dd"
  start_time?: string; // "HH:mm"
  end_time?: string;   // "HH:mm"
  priority?: 'low' | 'medium' | 'high';
  event_type?: string;
}

export type AIAction =
  | { type: 'create_task'; data: AITaskData }
  | { type: 'create_multiple_tasks'; data: AITaskData[] }
  | { type: 'update_task'; task_id: string; _version?: number; fields: AITaskData }
  | { type: 'delete_task'; task_id: string; _version?: number }
  | { type: 'complete_task'; task_id: string; _version?: number };

export interface ThinkingStep {
  round: number;
  label: string;
  status: 'in_progress' | 'completed';
}

/** Raw OpenAI-format history sent to / received from the Lambda */
export interface RawMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: unknown[];
  tool_call_id?: string;
  name?: string;
}

// ─── Streaming event types (mirrors lambda/src/models/streaming-types) ────────

export type StreamEvent =
  | { type: 'thinking'; data: ThinkingStep }
  | { type: 'token';    data: { text: string } }
  | { type: 'actions';  data: AIAction[] }
  | { type: 'done';     data: { updated_history: RawMessage[] } }
  | { type: 'error';    data: { message: string } };

/** StreamEvent tagged with a monotonically increasing sequence number */
export type IndexedStreamEvent = StreamEvent & { seq: number };

// ─── Streaming request ────────────────────────────────────────────────────────

export interface StreamAgentRequest {
  message: string;
  user_id: string;
  history?: RawMessage[];
  mode?: 'standard' | 'deep_thinking';
  /** Stable UUID for this turn — kept the same on retries so the backend can deduplicate */
  request_id: string;
  /** Resume from this seq offset after a reconnect (0 = start from beginning) */
  resume_offset: number;
  /** IANA timezone string from the user's browser, e.g. "Asia/Shanghai" */
  timezone?: string;
}

// ─── streamAgent — async generator consuming NDJSON from Lambda Function URL ─

const STREAM_URL = import.meta.env.VITE_AGENT_STREAM_URL as string | undefined;

export async function* streamAgent(
  req: StreamAgentRequest,
): AsyncGenerator<IndexedStreamEvent> {
  if (!STREAM_URL) {
    throw new Error('VITE_AGENT_STREAM_URL is not set in .env.local');
  }

  const response = await fetch(STREAM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    throw new Error(`Agent stream error ${response.status}: ${text}`);
  }

  if (!response.body) {
    throw new Error('No response body for streaming');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const event = JSON.parse(trimmed) as IndexedStreamEvent;
          yield event;
          // Stop iteration after terminal events
          if (event.type === 'done' || event.type === 'error') return;
        } catch {
          // Skip malformed NDJSON lines
        }
      }
    }

    // Flush any remaining buffer content
    const remaining = buffer.trim();
    if (remaining) {
      try {
        yield JSON.parse(remaining) as IndexedStreamEvent;
      } catch {
        // Ignore
      }
    }
  } finally {
    reader.releaseLock();
  }
}
