import React from 'react';

interface LandingNavProps {
  ctaHref?: string;
}

export function LandingNav({ ctaHref = '/app' }: LandingNavProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-4">
      <a href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--primary)' }}>
        <span>🦫</span>
        <span>BeaverAI</span>
      </a>
      <div className="flex items-center gap-3">
        <a href={ctaHref} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sign In</a>
        <a
          href={ctaHref}
          className="text-sm font-medium px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Get Started
        </a>
      </div>
    </nav>
  );
}
