import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Award, MapPin, Globe } from 'lucide-react';
import heroArt from '../../../assets/hero_kerala_art_transparent.png';

interface HeroProps {
  onOpenPromo: () => void;
  onExploreEvents: () => void;
  onViewLeaderboard: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenPromo, onExploreEvents, onViewLeaderboard }) => {
  return (
    <section
      id="home"
      className="relative pt-20 sm:pt-22 lg:pt-24 pb-4 min-h-[85vh] lg:min-h-[90vh] max-h-[920px] flex flex-col justify-between overflow-hidden bg-[#FAF8F5]"
    >
      {/* Warm Golden Cream Ambient Backdrop Glow */}
      <div
        className="absolute top-1/4 right-1/4 w-[600px] h-[500px] pointer-events-none -z-10 blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 235, 215, 0.9) 0%, rgba(255, 220, 200, 0.3) 60%, transparent 80%)',
        }}
      />

      {/* Intentionally Framed Decorative Petals & Swirls */}
      <div className="absolute top-28 right-[42%] text-[#FF5E84]/25 pointer-events-none animate-petal-float">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 15 8 18 11C21 14 22 17 19 20C16 23 11 21 8 18C5 15 7 10 12 2Z" />
        </svg>
      </div>
      <div className="absolute top-24 right-[8%] text-[#FF8A00]/20 pointer-events-none animate-petal-float" style={{ animationDelay: '3s' }}>
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 15 8 18 11C21 14 22 17 19 20C16 23 11 21 8 18C5 15 7 10 12 2Z" />
        </svg>
      </div>
      <div className="absolute top-48 left-[18%] text-[#F59E0B]/20 pointer-events-none animate-petal-float" style={{ animationDelay: '6s' }}>
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 15 8 18 11C21 14 22 17 19 20C16 23 11 21 8 18C5 15 7 10 12 2Z" />
        </svg>
      </div>

      {/* Main Container max-width: 1500px */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
        
        {/* Main Grid: 50% / 50% Perfect Balanced Ratio with Vertically Centered Grid Items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Social Bar */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-2.5 text-[#5F5F5F]">
            <a
              href="https://mgmmodelschool.edu.in"
              target="_blank"
              rel="noreferrer"
              aria-label="Official Website"
              className="w-8 h-8 rounded-full bg-white border border-black/8 shadow-2xs flex items-center justify-center hover:text-[#10B981] hover:scale-110 transition-all duration-300"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.facebook.com/MGMModelSchoolAyiroorVarkala/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full bg-white border border-black/8 shadow-2xs flex items-center justify-center hover:text-[#3B82F6] hover:scale-110 transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
            </a>
            <a
              href="https://www.youtube.com/@mgmmodelschoolvarkala2839"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-8 h-8 rounded-full bg-white border border-black/8 shadow-2xs flex items-center justify-center hover:text-[#EF4444] hover:scale-110 transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            </a>

            <div className="w-[1px] h-7 bg-black/12 my-0.5" />

            <span className="[writing-mode:vertical-lr] rotate-180 text-[8.5px] font-sans-manrope font-extrabold tracking-[0.22em] text-[#5F5F5F] uppercase">
              FOLLOW US
            </span>
          </div>

          {/* Left Content Column (50% Proportion) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-start text-left space-y-4">
            
            {/* Sub-Badge */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 text-[11px] font-sans-manrope font-extrabold tracking-[0.22em] text-[#FF5E84] uppercase"
            >
              <span>🌸</span>
              <span>KALATHMAKAM 2K26</span>
            </motion.div>

            {/* Dominant Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif-cormorant text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[80px] font-bold leading-[1.05] tracking-tight text-[#111111]"
            >
              Where{' '}
              <span className="bg-gradient-to-r from-[#FF5E84] to-[#F59E0B] bg-clip-text text-transparent inline-flex items-baseline">
                Art
                <span className="text-[#F59E0B] text-2xl sm:text-3xl lg:text-4xl font-normal ml-0.5 translate-y-1">✦</span>
              </span>
              ,<br />
              <span className="whitespace-nowrap">
                <span className="bg-gradient-to-r from-[#FF5E84] to-[#F59E0B] bg-clip-text text-transparent">
                  Talent
                </span>{' '}
                Flourishes.
              </span>
            </motion.h1>

            {/* Decorative Separator Motif (With 8px Breathing Room) */}
            <div className="flex items-center gap-2.5 w-48 text-[#FF5E84]/35 my-2">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[#FF5E84]/30 to-transparent w-full" />
              <span className="text-[#FF5E84] text-xs">❖</span>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[#FF5E84]/30 to-transparent w-full" />
            </div>

            {/* Description Text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-sans-manrope text-xs sm:text-sm lg:text-base text-[#5F5F5F] max-w-[420px] lg:max-w-[450px] leading-relaxed font-medium"
            >
              The Grand Arts Fest of
              <br />
              <strong className="text-[#111111] font-semibold">MGM Model School, Ayiroor, Varkala.</strong>
              <br />
              A celebration of creativity, culture and expression.
            </motion.p>

            {/* Action Buttons Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 sm:gap-5 pt-2"
            >
              {/* Primary Pill: Explore Events → */}
              <button
                onClick={onExploreEvents}
                className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs sm:text-sm px-6 py-3 rounded-full flex items-center gap-2.5 cursor-pointer group shadow-md hover:scale-[1.02] transition-all"
              >
                <span>Explore Events</span>
                <svg className="w-4 h-4 fill-white transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {/* Secondary Pill: Watch Promo */}
              <button
                onClick={onOpenPromo}
                className="bg-white/90 backdrop-blur-md text-[#111111] font-sans-manrope font-bold text-xs sm:text-[13px] px-5 py-3 rounded-full flex items-center gap-2 cursor-pointer border border-black/10 shadow-xs hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all group"
              >
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-2.5 h-2.5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span>Watch Promo</span>
              </button>

              {/* Tertiary Lighter Pill: Leaderboard (Reduced Shadow) */}
              <button
                onClick={onViewLeaderboard}
                className="bg-white/50 hover:bg-white text-[#5F5F5F] hover:text-[#111111] font-sans-manrope font-semibold text-xs sm:text-[13px] px-4.5 py-3 rounded-full flex items-center gap-2 cursor-pointer border border-black/8 hover:border-black/15 shadow-none hover:scale-[1.02] transition-all"
              >
                <svg className="w-4 h-4 stroke-[#FF5E84]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                <span>Leaderboard</span>
              </button>
            </motion.div>

          </div>

          {/* Right Column: Hero Illustration (50% Proportion, Raised 180-220px UP to Center Vertically with Text, Scaled down 6%, 40px Left) */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-center items-center relative lg:-ml-6 lg:-mt-12 xl:-mt-16">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 0.96 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="relative w-full max-w-[440px] lg:max-w-[490px] xl:max-w-[520px] aspect-square flex items-center justify-center gpu-render animate-gentle-float"
            >
              <img
                src={heroArt}
                alt="Kalathmakam 2K26 Cultural Arts Emblem - Kathakali, Mohiniyattam, Theyyam, Chenda, Open Book"
                className="w-full h-full object-contain filter drop-shadow-[0_16px_35px_rgba(255,94,132,0.12)] scale-100"
              />
            </motion.div>

          </div>

        </div>

      </div>

      {/* Bottom Editorial 4-Stats Box & Smooth Watercolor Transition */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 mt-4 mb-2">
        <div className="glass-card bg-white/92 backdrop-blur-2xl rounded-[22px] px-4 py-2.5 shadow-sm border border-white/95">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black/6">
            
            <div className="p-2 sm:p-2.5 flex items-center gap-3 text-left">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#FF5E84]/12 text-[#FF5E84] flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-sans-manrope font-extrabold text-xs text-[#111111]">
                  3 Days of Celebration
                </h4>
                <p className="font-sans-manrope text-[10px] text-[#5F5F5F]">
                  Jan 22 – 24, 2026
                </p>
              </div>
            </div>

            <div className="p-2 sm:p-2.5 flex items-center gap-3 text-left">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#F59E0B]/12 text-[#F59E0B] flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-sans-manrope font-extrabold text-xs text-[#111111]">
                  20+ Events & Competitions
                </h4>
                <p className="font-sans-manrope text-[10px] text-[#5F5F5F]">
                  Showcase Your Talent
                </p>
              </div>
            </div>

            <div className="p-2 sm:p-2.5 flex items-center gap-3 text-left">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#10B981]/12 text-[#10B981] flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-sans-manrope font-extrabold text-xs text-[#111111]">
                  Exciting Prizes & Recognition
                </h4>
                <p className="font-sans-manrope text-[10px] text-[#5F5F5F]">
                  Win & Shine
                </p>
              </div>
            </div>

            <div className="p-2 sm:p-2.5 flex items-center gap-3 text-left">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#3B82F6]/12 text-[#3B82F6] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-sans-manrope font-extrabold text-xs text-[#10B981] font-bold">
                  MGM Model School
                </h4>
                <p className="font-sans-manrope text-[10px] text-[#5F5F5F]">
                  Ayiroor, Varkala, Kerala, India
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Seamless Soft Watercolor Bottom Transition Gradient Overlay */}
      <div className="h-16 w-full bg-gradient-to-b from-transparent via-[#FAF8F5]/80 to-[#FAF8F5] pointer-events-none -mt-8 relative z-20" />

    </section>
  );
};
