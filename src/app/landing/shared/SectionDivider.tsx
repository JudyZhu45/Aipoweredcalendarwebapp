import React from 'react';

interface SectionDividerProps {
  number: string;
  name: string;
  category: string;
}

export function SectionDivider({ number, name, category }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-4 px-8 py-3 bg-gray-50 border-y border-gray-200 sticky top-0 z-20">
      <span className="font-mono text-xs font-bold text-gray-400">#{number}</span>
      <span className="font-semibold text-gray-800">{name}</span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">{category}</span>
    </div>
  );
}
