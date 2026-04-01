import React from 'react';
import { LandingNav } from '../shared/LandingNav';

export function Iteration08() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f97316 100%)' }}
    >
      <LandingNav />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6 backdrop-blur-sm">
          New · AI Planner
        </span>
        <h1 className="text-6xl font-black text-white mb-6 max-w-2xl leading-none drop-shadow-lg">
          Plan like a pro.<br />Live like a human.
        </h1>
        <p className="text-white/80 text-xl mb-10 max-w-lg">
          One conversation. A full day planned. BeaverAI handles the scheduling so you can focus on the doing.
        </p>
        <a
          href="/app"
          className="px-10 py-4 rounded-full bg-white font-bold text-lg shadow-2xl hover:scale-105 transition-transform"
          style={{ color: '#7c3aed' }}
        >
          Try BeaverAI Free
        </a>
        <p className="text-white/50 text-sm mt-4">No credit card · Setup in 30 seconds</p>
      </main>
    </div>
  );
}
