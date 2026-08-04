import React from 'react';

export const WatercolorSplashLayers: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible flex items-center justify-center">
      {/* 1. Purple Flow Far Left (Under Dancer) */}
      <div className="absolute -left-16 sm:-left-32 top-1/4 w-[450px] sm:w-[600px] h-[350px] sm:h-[450px] rounded-full blur-3xl opacity-60 mix-blend-multiply bg-gradient-to-r from-[#7A3CF5]/30 via-[#9333EA]/20 to-transparent animate-float-slow" />

      {/* 2. Top-Left Pink Blooming Splash */}
      <div className="absolute -top-12 left-0 w-[400px] h-[380px] rounded-full blur-3xl opacity-65 mix-blend-multiply bg-gradient-to-br from-[#FF5E84]/35 via-[#FF6B8B]/25 to-transparent animate-float-medium" />

      {/* 3. Right Cyan / Ocean Blue Sweep (Reaches page edge) */}
      <div className="absolute -right-20 sm:-right-36 top-1/3 w-[500px] sm:w-[700px] h-[400px] sm:h-[500px] rounded-full blur-3xl opacity-55 mix-blend-multiply bg-gradient-to-l from-[#3B82F6]/30 via-[#4DA8FF]/20 to-transparent animate-float-slow" />

      {/* 4. Bottom Warm Amber / Orange Paint (Under Book) */}
      <div className="absolute -bottom-16 left-1/4 w-[550px] h-[320px] rounded-full blur-3xl opacity-60 mix-blend-multiply bg-gradient-to-t from-[#F59E0B]/35 via-[#FF8A00]/25 to-transparent animate-float-medium" />

      {/* 5. Decorative Splatter Droplets & Fine Spray Vectors */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 mix-blend-multiply pointer-events-none"
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Purple Splatters Left */}
        <circle cx="120" cy="280" r="14" fill="#7A3CF5" opacity="0.3" />
        <circle cx="90" cy="340" r="8" fill="#7A3CF5" opacity="0.25" />
        <circle cx="150" cy="230" r="6" fill="#9333EA" opacity="0.35" />

        {/* Pink Splatters Top Left */}
        <circle cx="220" cy="140" r="18" fill="#FF5E84" opacity="0.35" />
        <circle cx="180" cy="100" r="10" fill="#FF5E84" opacity="0.25" />
        <circle cx="270" cy="90" r="7" fill="#FF6B8B" opacity="0.4" />

        {/* Orange Splatters Bottom Right */}
        <circle cx="620" cy="580" r="22" fill="#F59E0B" opacity="0.35" />
        <circle cx="680" cy="620" r="12" fill="#FF8A00" opacity="0.3" />
        <circle cx="580" cy="650" r="9" fill="#F59E0B" opacity="0.25" />

        {/* Blue Splatters Right */}
        <circle cx="720" cy="320" r="16" fill="#3B82F6" opacity="0.3" />
        <circle cx="750" cy="400" r="10" fill="#4DA8FF" opacity="0.25" />

        {/* Fine Splatter Arcs */}
        <path
          d="M 140 200 C 180 150, 260 120, 340 160"
          stroke="#FF5E84"
          strokeWidth="3"
          strokeDasharray="4 8"
          opacity="0.3"
        />
        <path
          d="M 520 600 C 600 620, 680 580, 740 500"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeDasharray="4 8"
          opacity="0.3"
        />
      </svg>
    </div>
  );
};
