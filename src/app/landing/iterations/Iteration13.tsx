import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

export function Iteration13() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div
            className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50 h-96 flex flex-col"
            style={{ background: 'linear-gradient(160deg, #fdf8ef 0%, #f0dfa8 100%)' }}
          >
            <div className="px-4 py-3 flex items-center gap-2 border-b border-amber-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-gray-400">BeaverAI Chat</span>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3 text-sm">
              <div className="self-end bg-amber-700 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">Schedule deep work before lunch tomorrow</div>
              <div className="self-start bg-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-xs shadow-sm text-gray-700">
                🦫 Found a free slot: 09:00–11:00. Created "Deep Work" on your calendar. Confirm?
              </div>
              <div className="self-end bg-amber-700 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">Yes, perfect.</div>
              <div className="self-start bg-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-xs shadow-sm text-gray-700">✓ Done! Enjoy your focus time.</div>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Live demo</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">See BeaverAI in action</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              One message. One second. Your schedule is built. No forms, no clicks, no calendar tetris.
            </p>
            <a href="/app" className="inline-block px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
              Try It Yourself
            </a>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
