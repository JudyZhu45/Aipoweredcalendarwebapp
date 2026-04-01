import { useEffect, useRef, useState } from 'react';
import { LandingFooter } from '../shared/LandingFooter';

const STYLES = `
  @keyframes i27-fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes i27-float {
    0%, 100% { transform: translateY(0)     scale(1);    }
    50%       { transform: translateY(-22px) scale(1.06); }
  }
  @keyframes i27-gradientDrift {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }
  @keyframes i27-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes i27-pulsering {
    0%   { box-shadow: 0 0 0 0   rgba(255,255,255,0.45); }
    70%  { box-shadow: 0 0 0 14px rgba(255,255,255,0);   }
    100% { box-shadow: 0 0 0 0   rgba(255,255,255,0);    }
  }
  .i27-fadeUp { animation: i27-fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
  .i27-pulse  { animation: i27-pulsering 2.2s ease-out infinite; }

  /* Pricing card expand-on-hover */
  .i27-tier-card {
    transition: transform 0.35s cubic-bezier(.22,1,.36,1),
                box-shadow 0.35s ease,
                max-height 0.5s cubic-bezier(.22,1,.36,1);
    max-height: 420px;
    overflow: hidden;
  }
  .i27-tier-card:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 28px 56px rgba(139,105,20,0.22);
    max-height: 600px;
  }
  .i27-tier-card.is-pro {
    max-height: 460px;
  }
  .i27-tier-card.is-pro:hover {
    max-height: 620px;
  }

  /* Extra content revealed on hover */
  .i27-hover-extra {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease 0.15s, transform 0.3s ease 0.15s;
    pointer-events: none;
  }
  .i27-tier-card:hover .i27-hover-extra {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  /* Shimmer on Pro card */
  .i27-shimmer {
    position: relative;
    overflow: hidden;
  }
  .i27-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255,255,255,0.18) 50%,
      transparent 60%
    );
    background-size: 200% 100%;
    animation: i27-shimmer 2.6s linear infinite;
    border-radius: inherit;
    pointer-events: none;
  }
`;

// ─── Pricing data with hover-revealed bonus info ──────────────────────────────

const tiers = [
  {
    name: 'Free', price: '$0', period: 'forever',
    tagline: 'Perfect for getting started',
    features: ['AI chat scheduling', 'Up to 50 tasks/month', 'Conflict detection', '7-day history'],
    bonusLabel: 'What you unlock',
    bonus: ['No credit card needed', 'Cancel anytime', 'Full AI chat access'],
    cta: 'Get Started', highlight: false,
  },
  {
    name: 'Pro', price: '$9', period: '/month',
    tagline: 'For people serious about their time',
    features: ['Everything in Free', 'Unlimited tasks', 'Full history & analytics', 'Priority AI responses', 'Habit tracking'],
    bonusLabel: 'Why people upgrade',
    bonus: ['2× faster AI response', 'Export calendar to PDF', 'Early access to new features'],
    cta: 'Start Pro Trial', highlight: true,
  },
  {
    name: 'Team', price: '$19', period: '/user/month',
    tagline: 'Built for teams that move fast',
    features: ['Everything in Pro', 'Shared team calendar', 'Admin controls', 'Usage reporting', 'Priority support'],
    bonusLabel: 'Team perks',
    bonus: ['Onboarding call included', 'Dedicated Slack channel', 'Custom SLA available'],
    cta: 'Contact Sales', highlight: false,
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Orb({ size, x, y, dur, delay }: { size: number; x: number; y: number; dur: number; delay: number }) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size,
      left: `${x}%`, top: `${y}%`, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)',
      animation: `i27-float ${dur}s ease-in-out infinite`,
      animationDelay: `${delay}s`, pointerEvents: 'none',
    }} />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Iteration27() {
  const problemReveal  = useReveal<HTMLDivElement>();
  const solutionReveal = useReveal<HTMLDivElement>();
  const pricingReveal  = useReveal<HTMLDivElement>();

  return (
    <div className="flex flex-col" style={{ backgroundColor: '#fdf8ef' }}>
      <style>{STYLES}</style>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <div className="i27-fadeUp" style={{ borderBottom: '1px solid #e8d9b8', backgroundColor: '#fdf8ef', animationDuration: '0.5s' }}>
        <nav className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto w-full">
          <a href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: '#8b6914' }}>
            <span>🦫</span><span>BeaverAI</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/app" className="text-sm font-medium" style={{ color: '#8a7040' }}>Sign In</a>
            <a href="/app" className="text-sm font-semibold px-5 py-2 rounded-full text-white shadow-md hover:opacity-90 transition-opacity" style={{ backgroundColor: '#8b6914' }}>
              Get Started
            </a>
          </div>
        </nav>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7a5810, #c9a84c, #f0d080, #c9a84c, #8b6914)',
          backgroundSize: '300% 300%',
          animation: 'i27-gradientDrift 8s ease infinite',
          minHeight: '92vh',
        }}
      >
        <Orb size={240} x={-4}  y={10}  dur={7}  delay={0}   />
        <Orb size={160} x={80}  y={5}   dur={9}  delay={1.5} />
        <Orb size={120} x={60}  y={70}  dur={6}  delay={0.8} />
        <Orb size={80}  x={20}  y={65}  dur={8}  delay={2.2} />
        <Orb size={200} x={85}  y={55}  dur={10} delay={0.3} />

        <span className="i27-fadeUp relative z-10 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', animationDelay: '0.1s' }}>
          AI Calendar Assistant
        </span>
        <h1 className="i27-fadeUp relative z-10 text-6xl font-black text-white mb-6 max-w-2xl leading-none drop-shadow-sm" style={{ animationDelay: '0.25s' }}>
          Your calendar.<br />Finally smart.
        </h1>
        <p className="i27-fadeUp relative z-10 text-white/85 text-xl mb-10 max-w-lg leading-relaxed" style={{ animationDelay: '0.4s' }}>
          BeaverAI learns your rhythms, respects your priorities, and fills your day with intention — automatically.
        </p>
        <a href="/app" className="i27-pulse i27-fadeUp relative z-10 px-10 py-4 rounded-full bg-white font-bold text-lg shadow-2xl hover:shadow-xl transition-shadow" style={{ color: '#8b6914', animationDelay: '0.55s' }}>
          Start for Free →
        </a>
        <p className="i27-fadeUp relative z-10 text-white/50 text-sm mt-5" style={{ animationDelay: '0.65s' }}>
          No credit card · Setup in 30 seconds
        </p>
      </section>

      {/* ── Problem / Solution ───────────────────────────────────────── */}
      <section className="px-8 py-24 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#4a3200' }}>Still fighting your own calendar?</h2>
          <p style={{ color: '#8a7040' }}>You're not alone. Here's why planning feels so broken.</p>
        </div>
        <div ref={problemReveal.ref} className="mb-6 p-8 rounded-2xl transition-all duration-700"
          style={{ backgroundColor: '#fef3f3', border: '1px solid #fad4d4', opacity: problemReveal.visible ? 1 : 0, transform: problemReveal.visible ? 'translateX(0)' : 'translateX(-32px)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c0392b' }}>Sound familiar?</p>
          <ul className="space-y-3">
            {['You open your calendar and have no idea where to put your next task.',
              'You accidentally double-book yourself — again.',
              'You spend 20 minutes "planning" instead of actually doing.',
              "You want to be productive but your tools just don't cooperate.",
            ].map((p, i) => (
              <li key={p} className="flex items-start gap-3 text-sm transition-all duration-500"
                style={{ color: '#5a3030', opacity: problemReveal.visible ? 1 : 0, transform: problemReveal.visible ? 'translateX(0)' : 'translateX(-16px)', transitionDelay: `${0.1 + i * 0.08}s` }}>
                <span style={{ color: '#e05555' }} className="mt-0.5 shrink-0">✗</span><span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div ref={solutionReveal.ref} className="p-8 rounded-2xl transition-all duration-700"
          style={{ backgroundColor: '#fffbf0', border: '1px solid #e8d9b8', opacity: solutionReveal.visible ? 1 : 0, transform: solutionReveal.visible ? 'translateX(0)' : 'translateX(32px)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8b6914' }}>BeaverAI fixes this</p>
          <ul className="space-y-3">
            {['Just describe what you need — Beaver finds the right time.',
              'Conflict detection runs automatically on every new task.',
              'Plans in seconds. Adjusts in one tap.',
              'Your habits and preferences shape every recommendation.',
            ].map((s, i) => (
              <li key={s} className="flex items-start gap-3 text-sm transition-all duration-500"
                style={{ color: '#4a3200', opacity: solutionReveal.visible ? 1 : 0, transform: solutionReveal.visible ? 'translateX(0)' : 'translateX(16px)', transitionDelay: `${0.1 + i * 0.08}s` }}>
                <span style={{ color: '#8b6914' }} className="mt-0.5 shrink-0">✓</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pricing — hover to expand ────────────────────────────────── */}
      <section className="px-8 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#4a3200' }}>Simple, honest pricing</h2>
          <p style={{ color: '#8a7040' }}>Start free. Upgrade when you're ready.</p>
        </div>
        <p className="text-center text-xs mb-10" style={{ color: '#b8975a' }}>↑ Hover a card to see more</p>

        <div ref={pricingReveal.ref} className="grid md:grid-cols-3 gap-6 items-start">
          {tiers.map((t, i) => (
            <div
              key={t.name}
              className={`i27-tier-card rounded-2xl p-8 ${t.highlight ? 'i27-shimmer is-pro' : ''}`}
              style={{
                backgroundColor: t.highlight ? '#8b6914' : '#fffbf0',
                border: `1.5px solid ${t.highlight ? '#8b6914' : '#e8d9b8'}`,
                opacity: pricingReveal.visible ? 1 : 0,
                transform: pricingReveal.visible ? (t.highlight ? 'scale(1.05)' : 'translateY(0)') : 'translateY(40px)',
                transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s cubic-bezier(.22,1,.36,1) ${i * 0.12}s, box-shadow 0.35s ease, max-height 0.5s cubic-bezier(.22,1,.36,1)`,
              }}
            >
              {t.highlight && (
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full mb-4 inline-block" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  Most Popular
                </span>
              )}

              {/* Tagline — always visible */}
              <p className="text-xs mb-3" style={{ color: t.highlight ? 'rgba(255,255,255,0.55)' : '#b8975a' }}>{t.tagline}</p>

              <h3 className="font-bold text-xl mb-1" style={{ color: t.highlight ? 'white' : '#4a3200' }}>{t.name}</h3>
              <div className="flex items-end gap-1 mb-5">
                <span className="text-4xl font-black" style={{ color: t.highlight ? 'white' : '#8b6914' }}>{t.price}</span>
                <span className="text-sm mb-1" style={{ color: t.highlight ? 'rgba(255,255,255,0.6)' : '#a08040' }}>{t.period}</span>
              </div>

              <ul className="space-y-2 mb-6">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: t.highlight ? 'rgba(255,255,255,0.85)' : '#6b5020' }}>
                    <span style={{ color: t.highlight ? 'rgba(255,255,255,0.7)' : '#8b6914' }} className="mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>

              {/* ── Revealed on hover ──────────────────────────────── */}
              <div className="i27-hover-extra mb-6">
                <div className="pt-4 mt-2" style={{ borderTop: `1px solid ${t.highlight ? 'rgba(255,255,255,0.2)' : '#e8d9b8'}` }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t.highlight ? 'rgba(255,255,255,0.6)' : '#b8975a' }}>
                    {t.bonusLabel}
                  </p>
                  <ul className="space-y-1.5">
                    {t.bonus.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs" style={{ color: t.highlight ? 'rgba(255,255,255,0.75)' : '#6b5020' }}>
                        <span style={{ color: t.highlight ? 'rgba(255,255,255,0.5)' : '#c9a84c' }} className="mt-0.5">★</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <a href="/app" className="block text-center px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105"
                style={{ backgroundColor: t.highlight ? 'white' : '#f0dfa8', color: '#8b6914' }}>
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
