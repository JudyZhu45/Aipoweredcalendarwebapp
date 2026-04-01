import React, { useEffect, useRef, useState } from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatBlock({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-5xl font-black mb-1" style={{ color: 'var(--primary)' }}>{count}{suffix}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

export function Iteration20() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 px-8 py-20 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Numbers that speak for themselves</h1>
          <p className="text-gray-400">Scroll down to see BeaverAI's impact</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-20">
          <StatBlock value={2400} suffix="+" label="active users" />
          <StatBlock value={98} suffix="%" label="satisfaction rate" />
          <StatBlock value={12} suffix="min" label="saved per day" />
          <StatBlock value={4} suffix="★" label="avg rating" />
        </div>
        <div className="text-center">
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Join thousands of people who reclaimed their time with BeaverAI.</p>
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            Join Them Free
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
