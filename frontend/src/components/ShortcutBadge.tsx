import React from 'react';

const KEY_MAP: Record<string, string> = {
  overview: 'D',
  domains: 'M',
  team: 'T',
  orders: 'O',
  jobs: 'O',
  requests: 'O',
  copilot: 'C',
  invoices: 'I',
  'trust-score': 'R',
  analytics: 'A',
  billing: 'B',
  activity: 'L',
  settings: 'S',
};

// Check OS safely
const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || navigator.platform);

interface ShortcutBadgeProps {
  tab: string;
  className?: string;
}

export const ShortcutBadge: React.FC<ShortcutBadgeProps> = ({ tab, className = '' }) => {
  const key = KEY_MAP[tab];
  if (!key) return null;

  return (
    <span className={`inline-flex items-center gap-0.5 font-mono text-[9px] font-normal tracking-normal transition-all duration-150 ${className}`}>
      <kbd className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-[2px] bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 text-black dark:text-white text-[9px] font-sans shadow-sm">
        {isMac ? '⌘' : '⌃'}
      </kbd>
      <span className="text-[7px] text-black/40 dark:text-white/40 font-sans mx-0.5">+</span>
      <kbd className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-[2px] bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 text-black dark:text-white text-[9px] font-sans uppercase shadow-sm">
        {key}
      </kbd>
    </span>
  );
};
