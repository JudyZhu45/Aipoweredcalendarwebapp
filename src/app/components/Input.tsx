import React from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ className, icon, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'w-full rounded-lg border border-[var(--calendar-border)] bg-[var(--input-background)] px-3 py-2 transition-all',
          'placeholder:text-[var(--muted-foreground)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
          icon && 'pl-10',
          className
        )}
        {...props}
      />
    </div>
  );
}
