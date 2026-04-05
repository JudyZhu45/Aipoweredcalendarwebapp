import { useState } from 'react';
import { ClipboardList, Repeat } from 'lucide-react';
import { cn } from '../utils/cn';
import { TodoPanel } from './TodoPanel';
import { RoutinePanel } from './RoutinePanel';

interface RightPanelProps {
  userId: string;
  refreshKey?: number;
  onTaskGenerated?: () => void;
}

type Tab = 'todo' | 'habits';

export function RightPanel({ userId, refreshKey, onTaskGenerated }: RightPanelProps) {
  const [tab, setTab] = useState<Tab>('todo');

  return (
    <div className="w-64 border-l border-[var(--calendar-border)] bg-white flex flex-col overflow-hidden">
      {/* Tab header */}
      <div className="flex border-b border-[var(--calendar-border)]">
        <button
          onClick={() => setTab('todo')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
            tab === 'todo'
              ? 'text-[#8b6914] border-b-2 border-[#8b6914] bg-[#8b6914]/5'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]',
          )}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Todo
        </button>
        <button
          onClick={() => setTab('habits')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
            tab === 'habits'
              ? 'text-[#8b6914] border-b-2 border-[#8b6914] bg-[#8b6914]/5'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]',
          )}
        >
          <Repeat className="w-3.5 h-3.5" />
          Habits
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'todo'
          ? <TodoPanel userId={userId} refreshKey={refreshKey} embedded />
          : <RoutinePanel userId={userId} refreshKey={refreshKey} onTaskGenerated={onTaskGenerated} embedded />
        }
      </div>
    </div>
  );
}
