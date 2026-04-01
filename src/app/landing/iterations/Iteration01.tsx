import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

export function Iteration01() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="text-6xl mb-6">🦫</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 max-w-2xl leading-tight">
          Your AI-powered planner that actually <span style={{ color: 'var(--primary)' }}>thinks ahead</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-xl">
          BeaverAI understands your schedule, finds the gaps, and builds your day — so you don't have to.
        </p>
        <a
          href="/app"
          className="px-8 py-4 rounded-full text-white text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Start Planning Free
        </a>
        <div className="mt-16 w-full max-w-3xl rounded-2xl border border-gray-200 shadow-xl overflow-hidden bg-gray-50 h-64 flex items-center justify-center text-gray-300 text-sm">
          App screenshot placeholder
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
