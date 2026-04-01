import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

export function Iteration14() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 max-w-3xl mx-auto px-8 py-20 w-full">
        <div className="mb-12 p-8 rounded-2xl bg-red-50 border border-red-100">
          <p className="text-xs uppercase tracking-widest text-red-400 mb-3">Sound familiar?</p>
          <ul className="space-y-3 text-gray-700">
            {[
              'You open your calendar and have no idea where to put your next task.',
              'You accidentally double-book yourself — again.',
              'You spend 20 minutes "planning" instead of actually doing.',
              'You want to be productive but your tools just don\'t cooperate.',
            ].map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--primary)' }}>BeaverAI fixes this</p>
          <ul className="space-y-3 text-gray-700">
            {[
              'Just describe what you need — Beaver finds the right time.',
              'Conflict detection runs automatically on every new task.',
              'Plans in seconds. Adjusts in one tap.',
              'Your habits and preferences shape every recommendation.',
            ].map((s) => (
              <li key={s} className="flex items-start gap-3">
                <span style={{ color: 'var(--primary)' }} className="mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center mt-12">
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            Fix My Calendar
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
