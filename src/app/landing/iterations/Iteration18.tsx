import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const bubbles = [
  { size: 80, x: 10, y: 15, duration: 6 },
  { size: 50, x: 25, y: 60, duration: 8 },
  { size: 100, x: 70, y: 20, duration: 10 },
  { size: 40, x: 85, y: 70, duration: 7 },
  { size: 60, x: 50, y: 80, duration: 9 },
  { size: 30, x: 40, y: 30, duration: 5 },
];

export function Iteration18() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#fdf8ef' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            top: `${b.y}%`,
            backgroundColor: '#8b6914',
            opacity: 0.07,
            animation: `float ${b.duration}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
      <LandingNav />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative z-10">
        <div className="text-6xl mb-6">🦫</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 max-w-xl leading-tight">
          Planning should feel this calm.
        </h1>
        <p className="text-gray-500 text-lg mb-10 max-w-md">
          BeaverAI quietly works in the background, keeping your schedule smooth and conflict-free.
        </p>
        <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
          Find Your Flow
        </a>
      </main>
      <LandingFooter />
    </div>
  );
}
