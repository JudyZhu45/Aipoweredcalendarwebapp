import React from 'react';
import { Sparkles, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import type { Event } from './EventCard';
import { cn } from '../utils/cn';

interface AIPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
  suggestions: Event[];
  onApplySuggestions: () => void;
  onDismissSuggestion: (id: string) => void;
}

export function AIPanel({ isExpanded, onToggle, suggestions, onApplySuggestions, onDismissSuggestion }: AIPanelProps) {
  const [prompt, setPrompt] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger AI suggestions
    console.log('AI prompt:', prompt);
    setPrompt('');
  };

  const colorMap: Record<string, string> = {
    brown: 'var(--event-brown)',
    blue: 'var(--event-blue)',
    purple: 'var(--event-purple)',
    pink: 'var(--event-pink)',
    red: 'var(--event-red)',
    orange: 'var(--event-orange)',
    yellow: 'var(--event-yellow)',
    green: 'var(--event-green)',
    teal: 'var(--event-teal)',
  };

  return (
    <div className={cn(
      'border-l border-[var(--calendar-border)] bg-white transition-all duration-300',
      isExpanded ? 'w-80' : 'w-12'
    )}>
      {/* Toggle button */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--calendar-border)]">
        {isExpanded && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-medium">AI Assistant</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-[var(--accent)] rounded-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 flex flex-col h-[calc(100vh-theme(spacing.20))]">
          {/* AI Input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-sm mb-2 text-[var(--muted-foreground)]">
              Ask AI to plan your day
            </label>
            <div className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Schedule focus time..."
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Suggested Events</h3>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {suggestions.length} suggestions
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 rounded-lg border-2 border-dashed border-[var(--calendar-border)] bg-[var(--accent)]/50 hover:bg-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: colorMap[suggestion.color] }}
                        />
                        <span className="text-sm font-medium">{suggestion.title}</span>
                      </div>
                      <button
                        onClick={() => onDismissSuggestion(suggestion.id)}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] ml-5">
                      {suggestion.startTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })} - {suggestion.endTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {suggestion.hasConflict && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>Time conflict detected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button 
                onClick={onApplySuggestions} 
                className="w-full"
                variant="primary"
              >
                Apply All Suggestions
              </Button>
            </div>
          )}

          {suggestions.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="text-[var(--muted-foreground)] text-sm">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Ask AI to help plan your schedule</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}