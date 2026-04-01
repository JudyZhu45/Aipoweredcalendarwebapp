import React from 'react';
import { LandingNav } from '../shared/LandingNav';

export function Iteration03() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #8b6914 0%, #c9a84c 50%, #f5e6c0 100%)' }}
    >
      <LandingNav />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-4">AI-powered planning</p>
        <h1 className="text-6xl font-black text-white mb-6 max-w-2xl leading-none">
          Your calendar.<br />Finally smart.
        </h1>
        <p className="text-white/80 text-xl mb-10 max-w-lg">
          BeaverAI combines your tasks, habits, and goals into one intelligent daily plan.
        </p>
        <a
          href="/app"
          className="px-10 py-4 rounded-full bg-white font-bold text-lg shadow-2xl hover:shadow-xl transition-shadow"
          style={{ color: 'var(--primary)' }}
        >
          Start for Free →
        </a>
      </main>
    </div>
  );
}
