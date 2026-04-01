import React from 'react';
import { LandingNav } from '../shared/LandingNav';

export function Iteration09() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d1060 50%, #0d2461 100%)' }}
    >
      <LandingNav />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-5xl font-bold text-white mb-4 max-w-xl leading-tight">
          Your AI planner,<br />beautifully simple.
        </h1>
        <p className="text-white/60 text-lg mb-12 max-w-md">
          BeaverAI brings clarity to your calendar — powered by AI, designed for humans.
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-3xl w-full mb-12">
          {['🧠 Smart Scheduling', '⚡ Instant Plans', '📊 Habit Insights', '🌙 Deep Work', '🌍 Multilingual', '🔁 Routines'].map((f) => (
            <div
              key={f}
              className="rounded-2xl px-4 py-5 text-white text-sm font-medium"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {f}
            </div>
          ))}
        </div>
        <a
          href="/app"
          className="px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
        >
          Get Started Free
        </a>
      </main>
    </div>
  );
}
