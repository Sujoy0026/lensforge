import React from 'react';

interface LensForgeLogoProps {
  size?: number; // Overall width/height of the emblem if text is hidden, or emblem size if shown
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  isDark?: boolean;
}

export default function LensForgeLogo({
  size = 40,
  showText = true,
  showSubtitle = false,
  className = '',
  isDark = false,
}: LensForgeLogoProps) {
  // SVG dimensions & viewbox
  // Emblem viewbox is 0 0 100 100 for simplicity and precision.
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Gradients for the White Folded 'L' Facets */}
          <linearGradient id="lf-white-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="lf-white-side" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* Gradient for Top 'F' Wing (Purple to Blue) */}
          <linearGradient id="lf-purple-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* Gradient for Middle 'F' Wing (Blue to Light Blue) */}
          <linearGradient id="lf-blue-cyan" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="60%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>

          {/* Gradient for Bottom 'F' Dot/Block */}
          <linearGradient id="lf-cyan-accent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* Drop Shadows/Glows */}
          <filter id="lf-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- GEOMETRIC MONOGRAM 'LF' --- */}

        {/* F-Wing 1 (Top wing: Purple to Blue gradient) */}
        <path
          d="M 47.5,31 C 47.5,31 47.5,21.5 54,21.5 L 68,21.5 C 68,21.5 68,27.5 59.5,32 C 54,35 47.5,43 47.5,43 Z"
          fill="url(#lf-purple-blue)"
        />

        {/* F-Wing 2 (Middle wing: Blue to Light Blue gradient) */}
        <path
          d="M 47.5,44 C 52,41 62.5,35.5 65.8,33.5 C 65.8,33.5 65.8,39.5 58,45 C 52,49 47.5,56 47.5,56 Z"
          fill="url(#lf-blue-cyan)"
        />

        {/* F-Block 3 (Bottom small slanted accent block: Cyan/Blue) */}
        <path
          d="M 55.5,49 L 63.5,45.5 L 63.5,52.5 L 55.5,56.5 Z"
          fill="url(#lf-cyan-accent)"
        />

        {/* White Front Facet of the L-stem */}
        <path
          d="M 36,24.5 L 44,20 L 44,56 L 48,61.5 L 36,54.5 Z"
          fill="url(#lf-white-front)"
        />

        {/* White Folded Side/Bottom Facet of the L-stem (Creates the 3D depth) */}
        <path
          d="M 44,20 L 44,56 L 55,57.5 L 48,61.5 Z"
          fill="url(#lf-white-side)"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center">
            <span className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
              LENS
            </span>
            <span className="text-base font-black tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              FORGE
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[7px] tracking-[0.15em] font-bold text-slate-400 uppercase mt-0.5 whitespace-nowrap">
              TEMPLATES • 3D SAAS • DASHBOARDS
            </span>
          )}
        </div>
      )}
    </div>
  );
}
