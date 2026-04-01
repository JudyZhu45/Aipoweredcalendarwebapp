import React, { useEffect, useRef, useState } from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const cards = [
  { icon: '🧠', title: 'AI Scheduling', desc: 'Just say what you need. Beaver handles the rest.' },
  { icon: '⚡', title: 'Instant Conflicts', desc: 'Overlap detection before every new task is created.' },
  { icon: '📊', title: 'Usage Insights', desc: 'See patterns in your schedule and act on them.' },
  { icon: '🌍', title: 'Multilingual', desc: 'Works in English, Chinese, or any mix you prefer.' },
];

function RevealCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="p-6 rounded-2xl border border-gray-100 bg-gray-50 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transitionDelay: `${delay}ms` }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

export function Iteration17() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 px-8 py-20 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Smarter planning, built in</h1>
          <p className="text-gray-400">Scroll to reveal what BeaverAI can do for you</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((c, i) => <RevealCard key={c.title} {...c} delay={i * 100} />)}
        </div>
        <div className="flex justify-center mt-16">
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            Get Started Free
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
