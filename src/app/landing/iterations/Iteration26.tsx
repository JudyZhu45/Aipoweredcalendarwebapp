import React from 'react';
import { LandingFooter } from '../shared/LandingFooter';

// ─── Pricing data ─────────────────────────────────────────────────────────────

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['AI chat scheduling', 'Up to 50 tasks/month', 'Conflict detection', '7-day history'],
    cta: 'Get Started',
    highlight: false,
    accentColor: '#a08040',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    features: ['Everything in Free', 'Unlimited tasks', 'Full history & analytics', 'Priority AI responses', 'Habit tracking'],
    cta: 'Start Pro Trial',
    highlight: true,
    accentColor: '#8b6914',
  },
  {
    name: 'Team',
    price: '$19',
    period: '/user/month',
    features: ['Everything in Pro', 'Shared team calendar', 'Admin controls', 'Usage reporting', 'Priority support'],
    cta: 'Contact Sales',
    highlight: false,
    accentColor: '#a08040',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Iteration26() {
  return (
    <div className="flex flex-col" style={{ backgroundColor: '#fdf8ef' }}>

      {/* ── Nav — #06 warm brand style ──────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #e8d9b8', backgroundColor: '#fdf8ef' }}>
        <nav className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto w-full">
          <a href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: '#8b6914' }}>
            <span>🦫</span><span>BeaverAI</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/app" className="text-sm font-medium" style={{ color: '#8a7040' }}>Sign In</a>
            <a
              href="/app"
              className="text-sm font-semibold px-5 py-2 rounded-full text-white shadow-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#8b6914' }}
            >
              Get Started
            </a>
          </div>
        </nav>
      </div>

      {/* ── Hero — #03 full-bleed golden gradient, viewport height ──── */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 py-28"
        style={{ background: 'linear-gradient(135deg, #8b6914 0%, #c9a84c 55%, #f5e6c0 100%)', minHeight: '92vh' }}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' }}
        >
          AI Calendar Assistant
        </span>
        <h1 className="text-6xl font-black text-white mb-6 max-w-2xl leading-none drop-shadow-sm">
          Your calendar.<br />Finally smart.
        </h1>
        <p className="text-white/85 text-xl mb-10 max-w-lg leading-relaxed">
          BeaverAI learns your rhythms, respects your priorities, and fills your day with intention — automatically.
        </p>
        <a
          href="/app"
          className="px-10 py-4 rounded-full bg-white font-bold text-lg shadow-2xl hover:shadow-xl transition-shadow"
          style={{ color: '#8b6914' }}
        >
          Start for Free →
        </a>
        <p className="text-white/50 text-sm mt-5">No credit card · Setup in 30 seconds</p>
      </section>

      {/* ── Problem / Solution — #14 narrative, reskinned in warm palette */}
      <section className="px-8 py-24 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#4a3200' }}>
            Still fighting your own calendar?
          </h2>
          <p style={{ color: '#8a7040' }}>You're not alone. Here's why planning feels so broken.</p>
        </div>

        {/* Pain points — warm red tint on cream */}
        <div
          className="mb-6 p-8 rounded-2xl"
          style={{ backgroundColor: '#fef3f3', border: '1px solid #fad4d4' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c0392b' }}>
            Sound familiar?
          </p>
          <ul className="space-y-3">
            {[
              'You open your calendar and have no idea where to put your next task.',
              'You accidentally double-book yourself — again.',
              'You spend 20 minutes "planning" instead of actually doing.',
              'You want to be productive but your tools just don\'t cooperate.',
            ].map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm" style={{ color: '#5a3030' }}>
                <span style={{ color: '#e05555' }} className="mt-0.5 shrink-0">✗</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Solution — warm golden tint */}
        <div
          className="p-8 rounded-2xl"
          style={{ backgroundColor: '#fffbf0', border: '1px solid #e8d9b8' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8b6914' }}>
            BeaverAI fixes this
          </p>
          <ul className="space-y-3">
            {[
              'Just describe what you need — Beaver finds the right time.',
              'Conflict detection runs automatically on every new task.',
              'Plans in seconds. Adjusts in one tap.',
              'Your habits and preferences shape every recommendation.',
            ].map((s) => (
              <li key={s} className="flex items-start gap-3 text-sm" style={{ color: '#4a3200' }}>
                <span style={{ color: '#8b6914' }} className="mt-0.5 shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pricing — #22 table, reskinned in warm palette ───────────── */}
      <section className="px-8 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#4a3200' }}>
            Simple, honest pricing
          </h2>
          <p style={{ color: '#8a7040' }}>Start free. Upgrade when you're ready.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl p-8 transition-shadow ${t.highlight ? 'shadow-2xl scale-105' : 'shadow-sm hover:shadow-md'}`}
              style={{
                backgroundColor: t.highlight ? '#8b6914' : '#fffbf0',
                border: `1.5px solid ${t.highlight ? '#8b6914' : '#e8d9b8'}`,
              }}
            >
              {t.highlight && (
                <span
                  className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full mb-4 inline-block"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  Most Popular
                </span>
              )}
              <h3
                className="font-bold text-xl mb-1"
                style={{ color: t.highlight ? 'white' : '#4a3200' }}
              >
                {t.name}
              </h3>
              <div className="flex items-end gap-1 mb-6">
                <span
                  className="text-4xl font-black"
                  style={{ color: t.highlight ? 'white' : '#8b6914' }}
                >
                  {t.price}
                </span>
                <span className="text-sm mb-1" style={{ color: t.highlight ? 'rgba(255,255,255,0.6)' : '#a08040' }}>
                  {t.period}
                </span>
              </div>
              <ul className="space-y-2 mb-8">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: t.highlight ? 'rgba(255,255,255,0.85)' : '#6b5020' }}
                  >
                    <span style={{ color: t.highlight ? 'rgba(255,255,255,0.7)' : '#8b6914' }} className="mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/app"
                className="block text-center px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: t.highlight ? 'white' : '#f0dfa8',
                  color: t.highlight ? '#8b6914' : '#8b6914',
                }}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #e8d9b8' }}>
        <LandingFooter />
      </div>
    </div>
  );
}
