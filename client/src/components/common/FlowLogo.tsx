import React from 'react';

interface FlowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

export const FlowLogo: React.FC<FlowLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  subtitle
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', svg: 28, text: 'text-xs', badge: 'text-[9px]' },
    md: { box: 'w-8.5 h-8.5', svg: 34, text: 'text-sm', badge: 'text-[10px]' },
    lg: { box: 'w-11 h-11', svg: 44, text: 'text-base', badge: 'text-[11px]' },
    xl: { box: 'w-16 h-16', svg: 64, text: 'text-xl', badge: 'text-xs' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Performance Vector Mark */}
      <div
        className={`${currentSize.box} rounded-xl bg-gradient-to-b from-zinc-900 to-black border border-white/10 shadow-[0_0_15px_rgba(56,189,248,0.15)] flex items-center justify-center shrink-0 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all overflow-hidden p-1`}
      >
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="mark_flowPrimary" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="30%" stopColor="#38bdf8" />
              <stop offset="65%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            <linearGradient id="mark_flowSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Primary Flow Spine (F Body) */}
          <path
            d="M 152 384
               L 152 188
               C 152 154, 178 128, 212 128
               L 336 128
               C 358 128, 376 146, 376 168
               C 376 190, 358 208, 336 208
               L 236 208
               C 220 208, 208 220, 208 236
               L 208 384
               C 208 400, 196 412, 180 412
               C 164 412, 152 400, 152 384 Z"
            fill="url(#mark_flowPrimary)"
          />

          {/* Secondary Forward Momentum Jet */}
          <path
            d="M 236 244
               C 236 230, 248 218, 262 218
               L 316 218
               C 342 218, 364 240, 364 266
               C 364 292, 342 314, 316 314
               L 262 314
               C 248 314, 236 302, 236 288 Z"
            fill="url(#mark_flowSecondary)"
          />

          {/* Speed Flow Accent Blade */}
          <path
            d="M 248 344
               C 248 333, 257 324, 268 324
               L 288 324
               C 304 324, 316 336, 316 352
               C 316 368, 304 380, 288 380
               L 268 380
               C 257 380, 248 371, 248 360 Z"
            fill="#38bdf8"
            opacity="0.85"
          />

          {/* Glowing Apex Core */}
          <circle cx="336" cy="168" r="12" fill="#ffffff" />
          <circle cx="316" cy="266" r="9" fill="#ffffff" />
        </svg>
      </div>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black ${currentSize.text} tracking-tight text-white group-hover:text-blue-200 transition-colors`}>
              Flow
            </span>
            <span
              className={`font-mono font-bold ${currentSize.badge} px-1.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 tracking-wider uppercase`}
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
