import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Send, Trash2, Brain, ChevronLeft, ChevronRight, CheckCircle2, Zap, Copy, Check as CheckIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAgent, type AgentMode, type DisplayMessage } from '../hooks/useAgent';
import type { AIAction, ThinkingStep } from '../../lib/agent';

interface AIPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
  userId: string;
  onRefresh?: () => void;
}

const MEMORY_PROMPT =
  "What do you know about me? Please summarize my habits, preferences, and any patterns you've noticed.";

export function AIPanel({ isExpanded, onToggle, userId, onRefresh }: AIPanelProps) {
  const { messages, isLoading, error, send, clearHistory, confirmActions, dismissActions } = useAgent(userId, onRefresh);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AgentMode>('standard');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    send(text, mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMemory = () => {
    if (isLoading) return;
    send(MEMORY_PROMPT, mode);
  };

  // Group consecutive messages by role
  const grouped = messages.map((msg, i) => ({
    ...msg,
    isFirst: i === 0 || messages[i - 1].role !== msg.role,
    isLast: i === messages.length - 1 || messages[i + 1].role !== msg.role,
  }));

  return (
    <div className={cn(
      'border-l border-[var(--calendar-border)] bg-white flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out',
      isExpanded ? 'w-[340px]' : 'w-12'
    )}>
      {/* ── Header ── */}
      <div className={cn(
        'flex items-center border-b border-[var(--calendar-border)] flex-shrink-0 h-14',
        isExpanded ? 'px-3 gap-2' : 'justify-center'
      )}>
        {isExpanded ? (
          <>
            {/* AI avatar */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)' }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">AI Assistant</p>
              <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">
                {isLoading ? 'Thinking…' : 'Online'}
              </p>
            </div>
            {/* Memory button */}
            <button
              onClick={handleMemory}
              disabled={isLoading}
              title="Ask what AI remembers about you"
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors disabled:opacity-40"
            >
              <Brain className="w-3.5 h-3.5" />
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                title="Clear chat"
                className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            title="Open AI Assistant"
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)' }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <ChevronLeft className="w-3 h-3 text-[var(--muted-foreground)]" />
          </button>
        )}
      </div>

      {isExpanded && (
        <>
          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-1">

            {/* Empty state */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-5 pb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #e8d5a3 0%, #c9a84c 100%)' }}>
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="text-center space-y-1 px-2">
                  <p className="text-sm font-semibold">How can I help?</p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    I can check your schedule, create tasks, analyze habits, and more.
                  </p>
                </div>
                <div className="w-full space-y-1.5">
                  {EXAMPLE_PROMPTS.map(p => (
                    <button
                      key={p.text}
                      onClick={() => send(p.text, mode)}
                      className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-[var(--calendar-border)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30 transition-all group flex items-center gap-2"
                    >
                      <span className="text-base leading-none">{p.emoji}</span>
                      <span className="text-[var(--foreground)] group-hover:text-[var(--foreground)]">{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {grouped.map(msg => (
              <MessageRow
                key={msg.id}
                msg={msg}
                isFirst={msg.isFirst}
                isLast={msg.isLast}
                onConfirm={confirmActions}
                onDismiss={dismissActions}
              />
            ))}

            {/* Typing indicator — hide once the streaming placeholder exists */}
            {isLoading && !messages.some(m => m.isStreaming) && (
              <div className="flex items-end gap-2 pt-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)' }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="bg-[var(--accent)] rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mx-1 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 break-words">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Mode + Input ── */}
          <div className="border-t border-[var(--calendar-border)] flex-shrink-0">
            {/* Mode toggle */}
            <div className="flex px-3 pt-2 gap-1">
              <ModeTab
                active={mode === 'standard'}
                onClick={() => setMode('standard')}
                icon={<Zap className="w-3 h-3" />}
                label="Standard"
              />
              <ModeTab
                active={mode === 'deep_thinking'}
                onClick={() => setMode('deep_thinking')}
                icon={<Brain className="w-3 h-3" />}
                label="Deep Think"
              />
            </div>

            {/* Input row */}
            <div className="flex items-end gap-2 p-3 pt-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI assistant…"
                rows={1}
                disabled={isLoading}
                className={cn(
                  'flex-1 resize-none text-[13px] rounded-2xl border border-[var(--calendar-border)] px-3.5 py-2.5',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/60',
                  'bg-[var(--accent)]/50 placeholder:text-[var(--muted-foreground)] leading-relaxed',
                  'disabled:opacity-50 transition-all overflow-hidden',
                )}
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  'w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all',
                  input.trim() && !isLoading
                    ? 'text-white shadow-sm hover:opacity-90 active:scale-95'
                    : 'bg-[var(--accent)] text-[var(--muted-foreground)] cursor-not-allowed'
                )}
                style={input.trim() && !isLoading
                  ? { background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)' }
                  : undefined}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MessageRow ───────────────────────────────────────────────────────────────

function MessageRow({
  msg,
  isFirst,
  isLast,
  onConfirm,
  onDismiss,
}: {
  msg: DisplayMessage;
  isFirst: boolean;
  isLast: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={cn(
      'flex gap-2',
      isUser ? 'flex-row-reverse' : 'flex-row',
      isLast ? 'mb-2' : 'mb-0.5',
    )}>
      {/* Avatar — only on last message of a group */}
      <div className="w-6 flex-shrink-0 flex items-end">
        {isLast && (
          isUser ? (
            <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-semibold text-[var(--muted-foreground)]">
              U
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)' }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )
        )}
      </div>

      {/* Bubble + extras */}
      <div className={cn('flex flex-col gap-1 max-w-[82%]', isUser ? 'items-end' : 'items-start')}>
        {/* Thinking steps above bubble */}
        {!isUser && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
          <ThinkingStepsView steps={msg.thinkingSteps} />
        )}

        {/* Bubble — hide when content is empty (action-only response) */}
        {(msg.content || msg.isStreaming) && (
        <div className={cn(
          'group relative px-3.5 py-2.5 text-[13px] leading-relaxed break-words',
          isUser
            ? 'text-white rounded-2xl rounded-tr-sm whitespace-pre-wrap'
            : 'bg-[var(--accent)] text-[var(--foreground)] rounded-2xl rounded-tl-sm',
          !isFirst && isUser && 'rounded-tr-2xl',
          !isFirst && !isUser && 'rounded-tl-2xl',
        )}
          style={isUser ? { background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)' } : undefined}
        >
          {isUser ? msg.content : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
                li: ({ children }) => <li>{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => <code className="bg-black/10 rounded px-1 py-0.5 text-[12px] font-mono">{children}</code>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
          {msg.isStreaming && (
            <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle" />
          )}

          {/* Copy button — assistant only, visible on hover */}
          {!isUser && !msg.isStreaming && msg.content && (
            <button
              onClick={handleCopy}
              title="Copy message"
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-white border border-[var(--calendar-border)] flex items-center justify-center shadow-sm"
            >
              {copied
                ? <CheckIcon className="w-2.5 h-2.5 text-emerald-500" strokeWidth={3} />
                : <Copy className="w-2.5 h-2.5 text-[var(--muted-foreground)]" />
              }
            </button>
          )}
        </div>
        )}

        {/* Timestamp */}
        {msg.timestamp && !msg.isStreaming && (
          <span className={cn(
            'text-[10px] text-[var(--muted-foreground)] px-1',
            isUser ? 'text-right' : 'text-left',
          )}>
            {formatRelativeTime(msg.timestamp)}
          </span>
        )}

        {/* Pending actions confirmation card */}
        {!isUser && msg.pendingActions && msg.pendingActions.length > 0 && (
          <ActionConfirmationCard
            actions={msg.pendingActions}
            onConfirm={onConfirm}
            onDismiss={onDismiss}
          />
        )}

        {/* Actions summary below bubble — hidden while still streaming or pending */}
        {!isUser && !msg.isStreaming && !msg.pendingActions && msg.actions && msg.actions.length > 0 && (
          <ActionsView actions={msg.actions} />
        )}

        {/* Action-level errors — hidden while still streaming */}
        {!isUser && !msg.isStreaming && msg.actionErrors && msg.actionErrors.length > 0 && (
          <ActionErrorsView errors={msg.actionErrors} />
        )}
      </div>
    </div>
  );
}

// ─── ActionConfirmationCard ───────────────────────────────────────────────────

function ActionConfirmationCard({
  actions,
  onConfirm,
  onDismiss,
}: {
  actions: AIAction[];
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const summaries = actions.map(a => {
    if (a.type === 'create_task') return { icon: '➕', text: `Create "${a.data.title}"` };
    if (a.type === 'create_multiple_tasks') return { icon: '➕', text: `Create ${a.data.length} tasks` };
    if (a.type === 'update_task') return { icon: '✏️', text: `Update task` };
    if (a.type === 'delete_task') return { icon: '🗑️', text: `Delete task` };
    if (a.type === 'complete_task') return { icon: '✓', text: `Mark task complete` };
    return { icon: '•', text: 'Action' };
  });

  return (
    <div className="border border-[var(--calendar-border)] rounded-xl overflow-hidden text-[12px] w-full max-w-[240px]">
      {/* Action list */}
      <div className="px-3 pt-2.5 pb-2 space-y-1 bg-[var(--accent)]/40">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">
          Confirm actions
        </p>
        {summaries.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[var(--foreground)]">
            <span className="text-sm leading-none">{s.icon}</span>
            <span className="leading-snug">{s.text}</span>
          </div>
        ))}
      </div>
      {/* Buttons */}
      <div className="flex border-t border-[var(--calendar-border)]">
        <button
          onClick={onDismiss}
          className="flex-1 py-2 text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors text-[11px] font-medium"
        >
          Cancel
        </button>
        <div className="w-px bg-[var(--calendar-border)]" />
        <button
          onClick={onConfirm}
          className="flex-1 py-2 text-white text-[11px] font-medium transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)' }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

// ─── ModeTab ──────────────────────────────────────────────────────────────────

function ModeTab({ active, onClick, label, icon }: {
  active: boolean; onClick: () => void; label: string; icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium py-1.5 rounded-lg transition-all',
        active
          ? 'bg-[var(--primary)] text-white shadow-sm'
          : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── ThinkingStepsView ────────────────────────────────────────────────────────

function ThinkingStepsView({ steps }: { steps: ThinkingStep[] }) {
  const [open, setOpen] = useState(false);
  const completedCount = steps.filter(s => s.status === 'completed').length;

  return (
    <div className="text-[11px] text-[var(--muted-foreground)]">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors px-1"
      >
        <Brain className="w-3 h-3" />
        <span>{completedCount}/{steps.length} reasoning steps</span>
        <span className="text-[10px] opacity-60">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-1.5 ml-1 space-y-1 border-l-2 border-[var(--calendar-border)] pl-2.5">
          {steps.map(s => (
            <div key={s.round} className="flex items-start gap-1.5">
              <CheckCircle2 className={cn(
                'w-3 h-3 mt-0.5 flex-shrink-0',
                s.status === 'completed' ? 'text-green-500' : 'text-amber-400'
              )} />
              <span className="leading-snug">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ActionsView ──────────────────────────────────────────────────────────────

function ActionsView({ actions }: { actions: AIAction[] }) {
  const summaries: string[] = [];
  for (const a of actions) {
    if (a.type === 'create_task') summaries.push(`Created "${a.data.title}"`);
    else if (a.type === 'create_multiple_tasks') summaries.push(`Created ${a.data.length} tasks`);
    else if (a.type === 'update_task') summaries.push('Updated task');
    else if (a.type === 'delete_task') summaries.push('Deleted task');
    else if (a.type === 'complete_task') summaries.push('Marked task complete');
  }
  if (summaries.length === 0) return null;
  return (
    <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1.5 space-y-0.5">
      {summaries.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          {s}
        </div>
      ))}
    </div>
  );
}

// ─── ActionErrorsView ─────────────────────────────────────────────────────────

function ActionErrorsView({ errors }: { errors: string[] }) {
  return (
    <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-2.5 py-1.5 space-y-0.5">
      {errors.map((e, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="mt-0.5 w-3 h-3 flex-shrink-0 text-red-400">✕</span>
          {e}
        </div>
      ))}
    </div>
  );
}

// ─── TypingDots ───────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex gap-1 items-center h-3.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)] animate-bounce"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  { emoji: '📅', text: "What's on my schedule today?" },
  { emoji: '➕', text: 'Add a gym session tomorrow at 7am' },
  { emoji: '📊', text: 'Analyze my productivity habits' },
];
