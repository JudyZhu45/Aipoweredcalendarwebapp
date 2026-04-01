import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const events = [
  { day: 'Day 1', title: 'Say hello to Beaver', desc: 'Tell it your name and what you\'re working on. It remembers.' },
  { day: 'Day 2', title: 'Plan your first full day', desc: '"Schedule my meetings and leave room for lunch and deep work." Done in 5 seconds.' },
  { day: 'Day 3', title: 'Discover conflicts you missed', desc: 'Beaver flags a double-booking you didn\'t notice. Crisis averted.' },
  { day: 'Day 5', title: 'Your habits start forming', desc: 'Beaver notices you always do deep work at 9am and starts suggesting it proactively.' },
  { day: 'Day 7', title: 'Your week — fully owned', desc: 'You\'ve saved 1.5 hours of scheduling time. Your calendar finally works for you.' },
];

export function Iteration24() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 max-w-2xl mx-auto px-8 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Your first week with BeaverAI</h1>
          <p className="text-gray-400">From first message to fully scheduled life</p>
        </div>
        <div className="relative">
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-200" />
          {events.map((e, i) => (
            <div key={i} className="relative flex gap-6 mb-10">
              <div
                className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {i + 1}
              </div>
              <div className="pt-1">
                <p className="text-xs font-mono text-gray-400 mb-0.5">{e.day}</p>
                <h3 className="font-semibold text-gray-900 mb-1">{e.title}</h3>
                <p className="text-sm text-gray-500">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            Start Your Week 1
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
