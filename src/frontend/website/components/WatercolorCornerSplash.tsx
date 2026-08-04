import React from 'react';

export const WatercolorCornerSplash: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 w-[460px] sm:w-[560px] h-[520px] sm:h-[620px] pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-95">
      <svg
        className="w-full h-full"
        viewBox="0 0 500 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep Violet to Magenta Radial Gradient Base */}
          <radialGradient id="purpleBase" cx="10%" cy="95%" r="75%">
            <stop offset="0%" stopColor="#7E22CE" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#9333EA" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#EC4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
          </radialGradient>

          {/* Leaf Color Gradient */}
          <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C026D3" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#E11D48" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* 1. Deep Watercolor Purple Wash Stain at Bottom-Left Corner */}
        <path
          d="M -50 650 C 60 480, 160 420, 260 480 C 350 540, 420 520, 520 650 Z"
          fill="url(#purpleBase)"
          filter="blur(18px)"
        />
        <path
          d="M -30 620 C 40 430, 210 400, 310 470 C 400 540, 460 510, 550 620 Z"
          fill="url(#purpleBase)"
          filter="blur(26px)"
          opacity="0.85"
        />

        {/* 2. Extended Botanical Watercolor Leaf Stems reaching higher up */}
        
        {/* Main Vertical Stem 1 (Extending to Top) */}
        <path
          d="M 45 560 Q 60 400, 80 250 T 120 50"
          stroke="#9333EA"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Leaf Pair 1 (Bottom Left) */}
        <path
          d="M 65 500 C 20 480, 10 440, 45 430 C 75 420, 80 470, 65 500 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 70 480 C 120 450, 140 430, 105 420 C 75 410, 65 450, 70 480 Z"
          fill="url(#leafGrad)"
        />

        {/* Leaf Pair 2 (Mid Stem) */}
        <path
          d="M 75 390 C 25 365, 15 330, 50 320 C 80 310, 85 355, 75 390 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 80 370 C 130 345, 155 320, 120 305 C 90 295, 75 340, 80 370 Z"
          fill="url(#leafGrad)"
        />

        {/* Leaf Pair 3 (Upper Stem - Reaching CTA buttons area) */}
        <path
          d="M 85 270 C 40 245, 30 210, 60 200 C 90 190, 95 235, 85 270 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 90 250 C 140 225, 165 200, 130 185 C 100 175, 85 220, 90 250 Z"
          fill="url(#leafGrad)"
        />

        {/* Top Leaf Buds (High up near headline) */}
        <path
          d="M 100 160 C 65 135, 60 100, 85 90 C 110 80, 115 125, 100 160 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 115 110 C 90 85, 95 55, 120 50 C 145 45, 140 85, 115 110 Z"
          fill="url(#leafGrad)"
        />

        {/* Secondary Diagonal Branch Right */}
        <path
          d="M 95 460 Q 165 390, 240 330 T 350 240"
          stroke="#C026D3"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.7"
        />

        <path
          d="M 150 410 C 175 365, 205 350, 195 385 C 185 420, 140 430, 150 410 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 205 360 C 240 315, 270 300, 260 335 C 250 370, 195 380, 205 360 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 270 300 C 305 255, 335 240, 325 275 C 315 310, 260 320, 270 300 Z"
          fill="url(#leafGrad)"
        />

        {/* 3. Watercolor Splatters */}
        <circle cx="170" cy="440" r="5.5" fill="#C026D3" opacity="0.65" />
        <circle cx="230" cy="370" r="4.5" fill="#E11D48" opacity="0.6" />
        <circle cx="300" cy="310" r="6.5" fill="#9333EA" opacity="0.55" />
        <circle cx="130" cy="300" r="4.5" fill="#EC4899" opacity="0.65" />
        <circle cx="150" cy="200" r="3.5" fill="#FB7185" opacity="0.55" />
        <circle cx="100" cy="130" r="4" fill="#A855F7" opacity="0.55" />
      </svg>
    </div>
  );
};
