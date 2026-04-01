import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

export function Iteration02() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 grid md:grid-cols-2 gap-0 items-center px-8 py-16 max-w-6xl mx-auto w-full">
        <div className="pr-8">
          <div className="text-4xl mb-4">🦫</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Plan smarter,<br />not harder.
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            Tell Beaver what needs to happen. It checks your calendar, avoids conflicts, and schedules everything intelligently.
          </p>
          <div className="flex gap-3">
            <a
              href="/app"
              className="px-6 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Get Started Free
            </a>
            <a href="/app" className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              Sign In
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 shadow-xl bg-gray-50 h-80 flex items-center justify-center text-gray-300 text-sm">
          App screenshot
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
