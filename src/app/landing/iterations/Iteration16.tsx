import React, { useEffect, useState } from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const phrases = ['your day.', 'your goals.', 'your habits.', 'your focus.', 'your week.'];

export function Iteration16() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="text-6xl mb-6">🦫</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-2 leading-tight">
          BeaverAI plans
        </h1>
        <h1
          className="text-5xl font-bold mb-6 leading-tight transition-opacity duration-300"
          style={{ color: 'var(--primary)', opacity: visible ? 1 : 0 }}
        >
          {phrases[index]}
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-md">
          Your AI-powered calendar assistant that schedules, adjusts, and learns — automatically.
        </p>
        <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
          Start Planning
        </a>
      </main>
      <LandingFooter />
    </div>
  );
}
