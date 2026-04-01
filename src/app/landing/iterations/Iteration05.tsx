import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const sections = [
  { label: 'Tell Beaver what you need', body: '"Schedule a deep work block before lunch and make sure it doesn\'t overlap with my 10am standup."' },
  { label: 'Beaver checks your calendar', body: 'It reads your existing tasks, finds free slots, and avoids conflicts automatically.' },
  { label: 'Review and confirm', body: 'Your proposed schedule appears with one-tap confirm or cancel. No surprises.' },
];

export function Iteration05() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 max-w-4xl mx-auto px-8 py-16 w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">How it works</h1>
        <p className="text-center text-gray-400 mb-16">Three steps. Zero friction.</p>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
          {sections.map((s, i) => (
            <div key={i} className="relative flex gap-8 mb-14 pl-16">
              <div
                className="absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{s.label}</h3>
                <p className="text-gray-500 italic">"{s.body}"</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <a
            href="/app"
            className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Get Started
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
