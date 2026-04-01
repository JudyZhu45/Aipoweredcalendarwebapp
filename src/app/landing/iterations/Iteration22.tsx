import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const tiers = [
  {
    name: 'Free', price: '$0', period: 'forever', color: '#6b7280',
    features: ['AI chat scheduling', 'Up to 50 tasks/month', 'Conflict detection', '7-day history'],
    cta: 'Get Started',
  },
  {
    name: 'Pro', price: '$9', period: '/month', color: '#8b6914',
    features: ['Everything in Free', 'Unlimited tasks', 'Full history & analytics', 'Priority AI responses', 'Habit tracking'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Team', price: '$19', period: '/user/month', color: '#3b82f6',
    features: ['Everything in Pro', 'Shared team calendar', 'Admin controls', 'Usage reporting', 'Priority support'],
    cta: 'Contact Sales',
  },
];

export function Iteration22() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 px-8 py-16 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple, honest pricing</h1>
          <p className="text-gray-400">Start free. Upgrade when you're ready.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl p-8 border ${t.highlight ? 'shadow-xl scale-105' : 'border-gray-200'}`}
              style={{ borderColor: t.highlight ? t.color : undefined, borderWidth: t.highlight ? 2 : 1 }}
            >
              {t.highlight && (
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full mb-4 inline-block" style={{ backgroundColor: `${t.color}18`, color: t.color }}>
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-gray-900 text-xl mb-1">{t.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black" style={{ color: t.color }}>{t.price}</span>
                <span className="text-gray-400 text-sm mb-1">{t.period}</span>
              </div>
              <ul className="space-y-2 mb-8">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span style={{ color: t.color }} className="mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/app"
                className="block text-center px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: t.highlight ? t.color : `${t.color}15`, color: t.highlight ? 'white' : t.color }}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
