import React from 'react';
import { cn } from '../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ className, options, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'rounded-lg border border-[var(--calendar-border)] bg-[var(--input-background)] px-3 py-2 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
        'cursor-pointer',
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
