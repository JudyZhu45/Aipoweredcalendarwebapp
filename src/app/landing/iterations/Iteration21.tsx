import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { LandingNav } from '../shared/LandingNav';
import { LandingFooter } from '../shared/LandingFooter';

const faqs = [
  { q: 'Is BeaverAI free to use?', a: 'Yes — BeaverAI has a free tier that covers all core scheduling features. Pro features like advanced analytics and unlimited history are available on paid plans.' },
  { q: 'Does the AI read my calendar automatically?', a: 'BeaverAI only accesses your calendar data when you start a conversation. It never reads or processes your data in the background without your input.' },
  { q: 'What languages does BeaverAI support?', a: 'BeaverAI works in any language you write in, including English, Chinese, and mixed-language messages. It always replies in the same language you use.' },
  { q: 'Can I undo an AI-created task?', a: 'Every AI action requires your explicit confirmation before it\'s saved. You can also delete or edit any task at any time from the calendar view.' },
  { q: 'Does it work on mobile?', a: 'The web app is mobile-responsive. Native iOS and Android apps are on the roadmap.' },
];

export function Iteration21() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 max-w-2xl mx-auto px-8 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Frequently asked questions</h1>
          <p className="text-gray-400">Everything you need to know before you start</p>
        </div>
        <Accordion.Root type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <Accordion.Item
              key={i}
              value={`item-${i}`}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <Accordion.Trigger className="w-full flex justify-between items-center px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-gray-50">
                <span>{f.q}</span>
                <span className="text-gray-400 ml-4 shrink-0 transition-transform [&[data-state=open]]:rotate-45">+</span>
              </Accordion.Trigger>
              <Accordion.Content className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">
                {f.a}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
        <div className="flex justify-center mt-12">
          <a href="/app" className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>
            Try BeaverAI Free
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
