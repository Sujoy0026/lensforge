import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  subtitleClassName?: string;
}

export default function LensForgeLogo({
  size = 36,
  className = '',
  showText = true,
  textClassName = '',
  subtitleClassName = ''
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      
      {/* VECTOR LOGO EMBLEM */}
      <div 
        className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        {/* BACKGROUND AMBIENT GLOW */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-cyan-500/40 via-teal-400/20 to-indigo-600/30 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />

        {/* HIGH-PRECISION SVG EMBLEM */}
        <svg 
          viewBox="0 0 100 100" 
          width={size} 
          height={size} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_2px_12px_rgba(6,182,212,0.4)]"
        >
          <defs>
            {/* GRADIENT: FORGE OBSIDIAN FRAME */}
            <linearGradient id="lf_bg_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#0b0f19" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* GRADIENT: PRIMARY CYAN / TEAL BEAM */}
            <linearGradient id="lf_cyan_beam" x1="15" y1="20" x2="85" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>

            {/* GRADIENT: SECONDARY VIOLET / INDIGO FORGE */}
            <linearGradient id="lf_indigo_facet" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* GRADIENT: ACCENT HIGHLIGHT */}
            <linearGradient id="lf_spark" x1="50" y1="30" x2="50" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#a5f3fc" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* HEXAGONAL FORGED BASE SHIELD */}
          <rect 
            x="6" 
            y="6" 
            width="88" 
            height="88" 
            rx="24" 
            fill="url(#lf_bg_grad)" 
            stroke="rgba(255,255,255,0.12)" 
            strokeWidth="2.5"
          />

          {/* INNER REFRACTIVE ACCENT RING */}
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            stroke="url(#lf_indigo_facet)" 
            strokeWidth="1.5" 
            strokeDasharray="4 6" 
            strokeOpacity="0.5"
          />

          {/* OPTICAL LENS APERTURE BLADES (FORMING 'L' & 'F' GEOMETRY) */}
          
          {/* TOP FORGE BLADE */}
          <path 
            d="M 50 18 L 78 34 L 50 50 L 22 34 Z" 
            fill="url(#lf_cyan_beam)" 
            opacity="0.95"
          />

          {/* BOTTOM-LEFT LENS FACET ('L' LEG) */}
          <path 
            d="M 22 38 L 50 54 L 50 82 L 22 66 Z" 
            fill="url(#lf_indigo_facet)" 
            opacity="0.9"
          />

          {/* BOTTOM-RIGHT FORGED PRISM FACET ('F' LEG) */}
          <path 
            d="M 50 54 L 78 38 L 78 66 L 50 82 Z" 
            fill="url(#lf_cyan_beam)" 
            opacity="0.8"
          />

          {/* INNER FOCAL CORE (DIAMOND APERTURE) */}
          <polygon 
            points="50,38 60,50 50,62 40,50" 
            fill="url(#lf_spark)" 
            className="filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          />

          {/* CENTER APERTURE DOT */}
          <circle 
            cx="50" 
            cy="50" 
            r="3" 
            fill="#090b10" 
          />
        </svg>
      </div>

      {/* BRAND TYPOGRAPHY */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className={`font-extrabold tracking-tight text-lg leading-none text-white ${textClassName}`}>
            LENS<span className="text-cyan-400">FORGE</span>
          </div>
          <div className={`text-[10px] text-slate-400 tracking-widest font-mono uppercase mt-0.5 ${subtitleClassName}`}>
            Digital Studio
          </div>
        </div>
      )}

    </div>
  );
}
