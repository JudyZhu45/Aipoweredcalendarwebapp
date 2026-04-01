import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

export function Iteration07() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0d0d0d', color: '#f5f0e8' }}>
      <div style={{ borderBottom: '1px solid #222' }}>
        <LandingNav />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="text-5xl mb-6">🦫</div>
        <h1 className="text-5xl font-black mb-4 max-w-2xl leading-tight">
          Dark hours. <span style={{ color: '#c9a84c' }}>Bright ideas.</span>
        </h1>
        <p className="text-lg mb-10 max-w-lg" style={{ color: '#888' }}>
          BeaverAI doesn't sleep. It plans your day while you do — surfacing the right tasks at the right time.
        </p>
        <a
          href="/app"
          className="px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#c9a84c', color: '#0d0d0d' }}
        >
          Start Planning →
        </a>
        <div className="mt-16 w-full max-w-3xl rounded-2xl h-48 flex items-center justify-center text-sm" style={{ border: '1px solid #333', backgroundColor: '#161616', color: '#444' }}>
          App screenshot (dark)
        </div>
      </main>
      <div style={{ borderTop: '1px solid #222' }}>
        <LandingFooter />
      </div>
    </div>
  );
}
