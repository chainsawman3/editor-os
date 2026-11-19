import React from 'react';

interface FlowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const FlowLogo: React.FC<FlowLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  title = 'MyOS',
  subtitle = 'Goals & Projects Hub ↗'
}) => {
  const pixelSizes = {
    sm: 26,
    md: 32,
    lg: 40,
    xl: 52
  };

  const px = pixelSizes[size] || 32;

  const fontClasses = {
    sm: { text: 'text-xs', badge: 'text-[9px]' },
    md: { text: 'text-sm font-black', badge: 'text-[10px]' },
    lg: { text: 'text-base font-black', badge: 'text-[11px]' },
    xl: { text: 'text-2xl font-black', badge: 'text-xs' }
  }[size] || { text: 'text-sm font-black', badge: 'text-[10px]' };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Fixed Vector Mark (Never overflows) */}
      <div
        style={{
          width: `${px}px`,
          height: `${px}px`,
          minWidth: `${px}px`,
          minHeight: `${px}px`,
          maxWidth: `${px}px`,
          maxHeight: `${px}px`
        }}
        className="rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 shadow-[0_0_15px_rgba(56,189,248,0.12)] flex items-center justify-center shrink-0 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all overflow-hidden p-1"
      >
        <svg
          viewBox="0 0 32 32"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="logo_grad_primary" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="35%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            <linearGradient id="logo_glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ambient Inner Halo */}
          <circle cx="16" cy="16" r="10" fill="url(#logo_glow)" />

          {/* Sleek Minimalist Monogram M / Dynamic Flow Wave */}
          <path
            d="M 6.5 22 V 12 C 6.5 9.8 8.2 8.2 10.4 9.1 L 16 11.6 L 21.6 9.1 C 23.8 8.2 25.5 9.8 25.5 12 V 22"
            stroke="url(#logo_grad_primary)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Clean Mid-Level Horizon Beam */}
          <path
            d="M 11.5 17.5 L 16 15 L 20.5 17.5"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />
        </svg>
      </div>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className={`${fontClasses.text} tracking-tight text-white group-hover:text-blue-200 transition-colors`}>
              {title}
            </span>
            <span
              className={`font-mono font-bold ${fontClasses.badge} px-1.5 py-0.2 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 tracking-wider uppercase`}
            >
              OS
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] text-zinc-400 font-medium group-hover:text-purple-400 transition-colors mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
