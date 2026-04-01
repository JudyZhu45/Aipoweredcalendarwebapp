import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

export function Iteration10() {
  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: 'Georgia, serif' }}>
      <LandingNav />
      <main className="flex-1 max-w-2xl mx-auto px-8 py-24">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">Issue No. 001</p>
        <h1 className="text-6xl font-black text-black mb-8 leading-none">
          Stop fighting<br />your calendar.
        </h1>
        <div className="w-16 h-px bg-black mb-8" />
        <p className="text-xl text-gray-700 mb-6 leading-relaxed">
          Most calendars are just empty boxes. BeaverAI is different — it reads what you need, checks what you have, and fills in the gaps intelligently.
        </p>
        <p className="text-gray-500 mb-12 leading-relaxed">
          No more "when should I schedule this?" Just tell Beaver, and it's done. Your time, reclaimed.
        </p>
        <a
          href="/app"
          className="inline-block border-2 border-black px-8 py-3 font-bold text-black hover:bg-black hover:text-white transition-colors"
        >
          Read More → Start Planning
        </a>
      </main>
      <LandingFooter />
    </div>
  );
}
