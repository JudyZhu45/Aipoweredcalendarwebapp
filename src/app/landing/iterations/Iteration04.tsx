import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const cards = [
  { icon: '🧠', title: 'AI Scheduling', desc: 'Describe your day in plain language — Beaver creates it.', span: 'col-span-2' },
  { icon: '⚡', title: 'Instant Actions', desc: 'Confirm or cancel any AI proposal in one tap.', span: 'col-span-1' },
  { icon: '🔁', title: 'Habit Tracking', desc: 'Recurring tasks that adapt to your real behaviour.', span: 'col-span-1' },
  { icon: '📊', title: 'Productivity Insights', desc: 'See when you work best and schedule accordingly.', span: 'col-span-1' },
  { icon: '🌍', title: 'Multi-language', desc: 'Chat in English, Chinese, or any mix — Beaver follows.', span: 'col-span-2' },
];

export function Iteration04() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Everything your calendar<br />was missing.</h1>
        <p className="text-gray-400 mb-10">BeaverAI — the planner that gets smarter the more you use it.</p>
        <div className="grid grid-cols-3 gap-4">
          {cards.map((c) => (
            <div
              key={c.title}
              className={`${c.span} rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-gray-50`}
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{c.title}</h3>
              <p className="text-sm text-gray-500">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <a
            href="/app"
            className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Try BeaverAI Free
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
