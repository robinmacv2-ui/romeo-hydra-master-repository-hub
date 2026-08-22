import React from 'react';

interface RomeoHydraLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  theme?: 'dark' | 'light' | 'original';
}

export const RomeoHydraLogo: React.FC<RomeoHydraLogoProps> = ({
  className = '',
  size = 120,
  showText = false,
  theme = 'dark',
}) => {
  // Theme colors
  // Original uses white bg, deep navy (#0B2545) and gold (#C5A880)
  // For dark theme, we can make bg transparent, and use bright slate-100/cyan for navy parts, and vibrant amber-400 for gold parts to pop!
  const isDark = theme === 'dark';
  
  const navyColor = isDark ? '#38BDF8' : '#0B2545'; // Sky blue for dark theme, Deep Navy for light
  const goldColor = isDark ? '#F59E0B' : '#C5A880'; // Bright Amber for dark, Muted Gold for light
  const textColor = isDark ? '#F1F5F9' : '#0B2545'; // White/Slate-100 for dark, Deep Navy for light
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-300"
      >
        {/* Background if light/original, transparent if dark */}
        {theme === 'original' && (
          <rect width="400" height="400" rx="40" fill="#FFFFFF" />
        )}

        {/* 1. Main central trunk (Navy/Blue) */}
        {/* Top circle */}
        <circle cx="200" cy="115" r="12" fill={navyColor} />
        {/* Vertical line */}
        <line
          x1="200"
          y1="127"
          x2="200"
          y2="260"
          stroke={navyColor}
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* 2. Left branch 1: Top bending (Navy/Blue) */}
        <path
          d="M 145 105 L 145 145 L 192 192 L 192 260"
          stroke={navyColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 3. Left branch 2: Middle straight with circle (Navy/Blue) */}
        <circle cx="130" cy="185" r="10" fill={navyColor} />
        <path
          d="M 140 185 L 184 185 L 184 260"
          stroke={navyColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 4. Left branch 3: Bottom straight with circle (Gold) */}
        <circle cx="130" cy="225" r="10" fill={goldColor} />
        <path
          d="M 140 225 L 176 225 L 176 260"
          stroke={goldColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 5. Left Top gold square accent */}
        <rect x="121" y="136" width="18" height="18" rx="3" fill={goldColor} />

        {/* 6. Right branch 1: Plug branch (Navy/Blue) */}
        {/* Plug head prongs */}
        <line x1="244" y1="88" x2="244" y2="102" stroke={navyColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="249" y1="88" x2="249" y2="102" stroke={navyColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="254" y1="88" x2="254" y2="102" stroke={navyColor} strokeWidth="3" strokeLinecap="round" />
        {/* Plug body */}
        <rect x="241" y="102" width="16" height="12" rx="2" fill={navyColor} />
        {/* Wire */}
        <path
          d="M 249 114 L 249 155 L 216 155 L 216 260"
          stroke={navyColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 7. Right branch 2: Loop (Navy/Blue) */}
        <path
          d="M 216 155 L 249 155 L 249 185 L 216 185"
          stroke={navyColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 8. Right branch 3: Bottom Gold */}
        <path
          d="M 208 190 L 208 210 L 224 225 L 248 225"
          stroke={goldColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="258" cy="225" r="10" fill={goldColor} />
      </svg>
      
      {showText && (
        <span 
          className="mt-3 font-sans font-extrabold tracking-[0.2em] text-center uppercase transition-colors duration-300"
          style={{ fontSize: size * 0.08, color: textColor }}
        >
          ROMEO-HYDRA
        </span>
      )}
    </div>
  );
};
