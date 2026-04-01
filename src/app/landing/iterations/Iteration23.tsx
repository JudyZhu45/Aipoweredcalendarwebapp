import React from 'react';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const rows = [
  { feature: 'AI scheduling via chat', beaver: true, google: false, notion: false },
  { feature: 'Conflict detection', beaver: true, google: true, notion: false },
  { feature: 'Natural language input', beaver: true, google: false, notion: true },
  { feature: 'Habit & routine tracking', beaver: true, google: false, notion: true },
  { feature: 'Productivity analytics', beaver: true, google: false, notion: false },
  { feature: 'Multilingual support', beaver: true, google: true, notion: false },
  { feature: 'Calendar grid view', beaver: true, google: true, notion: false },
  { feature: 'Confirm before save', beaver: true, google: false, notion: false },
];

const Check = ({ ok }: { ok: boolean }) => (
  <span className={ok ? 'text-green-500 text-lg' : 'text-gray-200 text-lg'}>
    {ok ? '✓' : '✗'}
  </span>
);

export function Iteration23() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 px-8 py-16 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Why BeaverAI?</h1>
          <p className="text-gray-400">See how we compare to the alternatives</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 font-semibold text-gray-500">Feature</th>
                <th className="px-6 py-4 font-bold text-center" style={{ color: 'var(--primary)' }}>🦫 BeaverAI</th>
                <th className="px-6 py-4 font-semibold text-center text-gray-400">Google Calendar</th>
                <th className="px-6 py-4 font-semibold text-center text-gray-400">Notion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-3 text-gray-700">{r.feature}</td>
                  <td className="px-6 py-3 text-center"><Check ok={r.beaver} /></td>
                  <td className="px-6 py-3 text-center"><Check ok={r.google} /></td>
                  <td className="px-6 py-3 text-center"><Check ok={r.notion} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-12">
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            Switch to BeaverAI
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
