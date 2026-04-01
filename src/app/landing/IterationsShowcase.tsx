import React, { useState, useEffect } from 'react';
import { ITERATIONS } from './iterations/index';
import { SectionDivider } from './shared/SectionDivider';

export function IterationsShowcase() {
  const [activeNum, setActiveNum] = useState('01');

  // Update active item as user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const num = entry.target.getAttribute('data-num');
            if (num) setActiveNum(num);
          }
        }
      },
      { threshold: 0.3 },
    );

    ITERATIONS.forEach((it) => {
      const el = document.getElementById(`iteration-${it.number}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (num: string) => {
    const el = document.getElementById(`iteration-${num}`);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group by category for index display
  const categories = Array.from(new Set(ITERATIONS.map((it) => it.category)));

  return (
    <div className="flex min-h-screen bg-white">
      {/* ─── Sticky sidebar index (desktop) ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-gray-100 bg-gray-50 py-6 px-4">
        <a href="/app" className="flex items-center gap-1.5 font-bold text-sm mb-6" style={{ color: 'var(--primary)' }}>
          <span>🦫</span> BeaverAI
        </a>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">25 Iterations</p>
        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-300 mb-1.5">{cat}</p>
            {ITERATIONS.filter((it) => it.category === cat).map((it) => (
              <button
                key={it.number}
                onClick={() => scrollTo(it.number)}
                className={`w-full text-left flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg mb-0.5 transition-colors ${
                  activeNum === it.number ? 'bg-amber-50 font-semibold' : 'text-gray-500 hover:bg-gray-100'
                }`}
                style={{ color: activeNum === it.number ? 'var(--primary)' : undefined }}
              >
                <span className="font-mono text-[10px] text-gray-300 w-5 shrink-0">#{it.number}</span>
                <span className="truncate">{it.name}</span>
              </button>
            ))}
          </div>
        ))}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <a
            href="/app"
            className="block text-center text-xs font-semibold py-2 px-3 rounded-full text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Open App →
          </a>
        </div>
      </aside>

      {/* ─── Mobile top select ────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3">
        <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>🦫 BeaverAI</span>
        <select
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
          value={activeNum}
          onChange={(e) => scrollTo(e.target.value)}
        >
          {ITERATIONS.map((it) => (
            <option key={it.number} value={it.number}>#{it.number} {it.name}</option>
          ))}
        </select>
        <a
          href="/app"
          className="text-xs font-semibold py-1.5 px-3 rounded-full text-white shrink-0"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Open App
        </a>
      </div>

      {/* ─── Main content: all 25 iterations stacked ─────────────────── */}
      <main className="flex-1 min-w-0">
        {ITERATIONS.map((it) => {
          const Component = it.component;
          return (
            <section key={it.number} id={`iteration-${it.number}`} data-num={it.number}>
              <SectionDivider number={it.number} name={it.name} category={it.category} />
              <Component />
            </section>
          );
        })}
      </main>
    </div>
  );
}
