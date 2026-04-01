import React from 'react';

export function LandingFooter() {
  return (
    <footer className="text-center py-6 text-sm text-gray-400 border-t border-gray-100">
      © {new Date().getFullYear()} BeaverAI · Your AI-powered planner 🦫
    </footer>
  );
}
