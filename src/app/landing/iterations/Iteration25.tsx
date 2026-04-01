import React from 'react';
import { LandingFooter } from '../shared/LandingFooter';

export function Iteration25() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)' }}
    >
      <nav className="flex items-center justify-center px-6 py-6">
        <span className="text-white text-2xl font-bold">🦫 BeaverAI</span>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <p className="text-white/50 text-sm uppercase tracking-widest mb-4">Coming to your pocket</p>
        <h1 className="text-5xl font-black text-white mb-4 leading-tight max-w-lg">
          BeaverAI for mobile. <span className="text-indigo-400">Coming soon.</span>
        </h1>
        <p className="text-white/60 text-lg mb-12 max-w-md">
          The same AI-powered scheduling magic — now in your pocket. iOS and Android apps are on the way.
        </p>
        <div className="flex gap-4 mb-12 flex-wrap justify-center">
          {['App Store', 'Google Play'].map((s) => (
            <div
              key={s}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/20 text-white font-medium"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
            >
              <span>{s === 'App Store' ? '🍎' : '🤖'}</span>
              <div className="text-left">
                <p className="text-xs text-white/50">Coming to</p>
                <p className="text-sm font-semibold">{s}</p>
              </div>
            </div>
          ))}
        </div>
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(255,255,255,0.1)', border: '2px dashed rgba(255,255,255,0.2)' }}
        >
          <span className="text-white/40 text-xs">QR</span>
        </div>
        <p className="text-white/40 text-sm mb-10">Scan to join the waitlist</p>
        <a
          href="/app"
          className="px-8 py-3 rounded-full bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors"
        >
          Use Web Version Now
        </a>
      </main>
      <div className="border-t border-white/10">
        <LandingFooter />
      </div>
    </div>
  );
}
