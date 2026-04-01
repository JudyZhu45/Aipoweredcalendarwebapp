import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const cards = [
  { icon: '🧠', title: 'AI Chat', desc: 'Schedule anything in natural language.', color: '#8b6914' },
  { icon: '⚡', title: 'No Conflicts', desc: 'Never double-book again — ever.', color: '#3b82f6' },
  { icon: '📊', title: 'Insights', desc: 'Data-driven schedule optimization.', color: '#8b5cf6' },
  { icon: '🌍', title: 'Multilingual', desc: 'Works in any language you speak.', color: '#10b981' },
];

export function Iteration19() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <style>{`
        .hover-card { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .hover-card:hover .card-icon { transform: scale(1.2); }
        .card-icon { transition: transform 0.2s; }
      `}</style>
      <LandingNav />
      <main className="flex-1 px-8 py-16 max-w-4xl mx-auto w-full">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Hover to explore</h1>
          <p className="text-gray-400">Discover what BeaverAI brings to your workflow</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((c) => (
            <div
              key={c.title}
              className="hover-card p-8 rounded-2xl border border-gray-100 cursor-default"
              style={{ backgroundColor: `${c.color}08` }}
            >
              <div className="card-icon text-4xl mb-4">{c.icon}</div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">{c.title}</h3>
              <p className="text-gray-500">{c.desc}</p>
              <div className="mt-4 text-sm font-medium" style={{ color: c.color }}>Learn more →</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-14">
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            Start Free
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
