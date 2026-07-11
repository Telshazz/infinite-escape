'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function PrimaryButton({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`bracket relative px-8 py-3.5 font-hud text-sm tracking-[0.2em] uppercase text-abyss bg-gradient-to-r from-teal to-teal-glow shadow-holo hover:shadow-[0_0_36px_rgba(53,224,206,0.4)] transition-shadow ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({
  children,
  onClick,
  className = '',
  gold = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  gold?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-6 py-3 font-hud text-xs tracking-[0.2em] uppercase border transition-colors ${
        gold
          ? 'border-gold/40 text-gold hover:bg-gold/10'
          : 'border-teal/30 text-teal hover:bg-teal/10'
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Atlantean symbol glyphs (inline SVG, currentColor)
// ---------------------------------------------------------------------------

export function SymbolGlyph({
  glyph,
  className = 'w-8 h-8',
}: {
  glyph: string;
  className?: string;
}) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (glyph) {
    case 'trident':
      return (
        <svg {...common}>
          <path d="M12 21V6" />
          <path d="M12 6c0-2 1.5-3.5 3-4-.5 2 .5 4-3 4z" />
          <path d="M6 4c0 4 2 7 6 7s6-3 6-7" />
          <path d="M9 21h6" />
        </svg>
      );
    case 'wave':
      return (
        <svg {...common}>
          <path d="M2 12c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3" />
          <path d="M2 17c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3" />
        </svg>
      );
    case 'spiral':
      return (
        <svg {...common}>
          <path d="M12 12a1.5 1.5 0 0 1 3 0 3 3 0 0 1-6 0 4.5 4.5 0 0 1 9 0 6 6 0 0 1-12 0 7.5 7.5 0 0 1 15 0" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common}>
          <path d="M12 2l2.2 6.4L21 9.2l-5 4.4 1.5 6.6L12 16.8 6.5 20.2 8 13.6 3 9.2l6.8-.8L12 2z" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case 'column':
      return (
        <svg {...common}>
          <path d="M5 4h14M5 20h14M8 4v16M12 4v16M16 4v16" />
        </svg>
      );
    default:
      return null;
  }
}

export function StatRow({
  label,
  value,
  gold = false,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-teal/10 py-2.5">
      <span className="font-hud text-[0.68rem] tracking-[0.14em] uppercase text-mist/60">
        {label}
      </span>
      <span
        className={`font-hud text-sm ${gold ? 'text-gold' : 'text-teal-glow'}`}
      >
        {value}
      </span>
    </div>
  );
}
