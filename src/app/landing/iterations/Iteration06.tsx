import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

export function Iteration06() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fdf8ef' }}>
      <div style={{ borderBottom: '1px solid #e8d9b8' }}>
        <LandingNav />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <span
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
          style={{ backgroundColor: '#f0dfa8', color: '#8b6914' }}
        >
          AI Calendar Assistant
        </span>
        <h1 className="text-5xl font-bold mb-4 max-w-xl leading-tight" style={{ color: '#4a3200' }}>
          The planner built around <em>you</em>
        </h1>
        <p className="text-lg mb-10 max-w-md" style={{ color: '#8a7040' }}>
          BeaverAI learns your rhythms, respects your priorities, and fills your calendar with intention.
        </p>
        <a
          href="/app"
          className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
          style={{ backgroundColor: '#8b6914' }}
        >
          Start Free
        </a>
      </main>
      <LandingFooter />
    </div>
  );
}
