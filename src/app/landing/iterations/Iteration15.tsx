import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const steps = [
  { n: '01', icon: '💬', title: 'Chat with Beaver', desc: 'Tell it what you need in plain language — tasks, goals, appointments.' },
  { n: '02', icon: '🔍', title: 'Beaver reads your calendar', desc: 'It checks all existing tasks and finds conflict-free time slots.' },
  { n: '03', icon: '✅', title: 'You confirm', desc: 'Review the plan and tap confirm. Nothing saves without your approval.' },
];

export function Iteration15() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 px-8 py-16 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">From idea to scheduled in 10 seconds</h1>
          <p className="text-gray-400">Here's exactly how BeaverAI works</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="text-5xl mb-4">{s.icon}</div>
              <p className="text-xs font-mono text-gray-300 mb-1">{s.n}</p>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-4 mt-6 text-gray-300 text-2xl">
          <span>—</span><span>→</span><span>—</span><span>→</span>
        </div>
        <div className="flex justify-center mt-12">
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            See It In Action
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
