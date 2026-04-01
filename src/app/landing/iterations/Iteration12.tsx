import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const testimonials = [
  { name: 'Sarah K.', role: 'Product Manager', quote: 'I stopped stressing about scheduling the moment I tried BeaverAI. It just... handles it.' },
  { name: 'Chen W.', role: 'Grad Student', quote: '我用中文告诉它我的计划，它帮我安排得很完美。真的很厉害！' },
  { name: 'James T.', role: 'Freelancer', quote: 'The conflict detection alone saved me from double-booking three times this week.' },
];

export function Iteration12() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 px-8 py-16 max-w-4xl mx-auto w-full">
        <div className="text-center mb-4">
          <p className="text-5xl font-black mb-2" style={{ color: 'var(--primary)' }}>2,400+</p>
          <p className="text-gray-400 text-lg">people trust BeaverAI with their time</p>
        </div>
        <div className="flex justify-center gap-8 my-8 text-center">
          {[['98%', 'satisfaction'], ['4.9★', 'avg rating'], ['12min', 'avg time saved/day']].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-gray-900">{val}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-gray-700 italic mb-4 text-sm leading-relaxed">"{t.quote}"</p>
              <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
              <p className="text-xs text-gray-400">{t.role}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            Join Them Free
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
