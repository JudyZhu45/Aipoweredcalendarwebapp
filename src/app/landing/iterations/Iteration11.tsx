import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const features = [
  { icon: '🧠', title: 'AI Chat Planning', desc: 'Describe your day in plain language and get a full schedule in seconds.' },
  { icon: '⚡', title: 'Conflict Detection', desc: 'Automatically checks for overlapping tasks before creating anything.' },
  { icon: '🔁', title: 'Smart Routines', desc: 'Repeating tasks that learn from your actual completion patterns.' },
  { icon: '📊', title: 'Productivity Analytics', desc: 'Understand your peak hours, best task types, and improvement areas.' },
  { icon: '🌍', title: 'Any Language', desc: 'Chat in English, Chinese, or a mix — Beaver responds in kind.' },
  { icon: '✅', title: 'Confirm & Cancel', desc: 'Every AI action needs your approval. You\'re always in control.' },
];

export function Iteration11() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 px-8 py-16 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Everything you need to own your time</h1>
          <p className="text-gray-400">Six features. One intelligent planner.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-gray-300 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-14">
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            Explore BeaverAI Free
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
