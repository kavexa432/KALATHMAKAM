import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
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
      className="relative pt-20 sm:pt-22 lg:pt-24 pb-4 flex flex-col justify-between min-h-[85vh] lg:min-h-[88vh] overflow-x-hidden bg-[#FAF8F5]"
    >
      {/* Warm Ambient Cream Glow Backdrop */}
      <div
        className="absolute top-1/6 left-1/12 w-[750px] h-[650px] pointer-events-none -z-10 blur-3xl opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 35% 45%, rgba(255, 245, 230, 0.95) 0%, rgba(255, 235, 220, 0.35) 55%, transparent 80%)',
        }}
      />

      {/* Decorative Floating Petals */}
      <div className="absolute top-24 right-[36%] text-[#FF5E84]/25 pointer-events-none animate-petal-float">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 15 8 18 11C21 14 22 17 19 20C16 23 11 21 8 18C5 15 7 10 12 2Z" />
        </svg>
      </div>
      <div className="absolute top-20 right-[12%] text-[#FF8A00]/20 pointer-events-none animate-petal-float" style={{ animationDelay: '3s' }}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 15 8 18 11C21 14 22 17 19 20C16 23 11 21 8 18C5 15 7 10 12 2Z" />
        </svg>
      </div>
      <div className="absolute top-44 left-[18%] text-[#F59E0B]/20 pointer-events-none animate-petal-float" style={{ animationDelay: '6s' }}>
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 15 8 18 11C21 14 22 17 19 20C16 23 11 21 8 18C5 15 7 10 12 2Z" />
        </svg>
      </div>

      {/* Main 1480px Grid Container */}
      <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-10 w-full relative z-10 my-auto">
        
        {/* Main 45% / 55% Grid: Vertically Centered */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2">
          
          {/* Left Social & School Links Column */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-4 text-[#5F5F5F]">
            {/* MGM Model School Official Website Link */}
            <a
              href="https://mgmmodelschool.edu.in"
              target="_blank"
              rel="noreferrer"
              aria-label="MGM Model School Official Website"
              className="w-10.5 h-10.5 rounded-full bg-white border border-black/8 shadow-2xs flex items-center justify-center hover:text-[#10B981] hover:scale-110 transition-all duration-300"
            >
              <Globe className="w-4.5 h-4.5" />
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/MGMModelSchoolAyiroorVarkala/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-10.5 h-10.5 rounded-full bg-white border border-black/8 shadow-2xs flex items-center justify-center hover:text-[#3B82F6] hover:scale-110 transition-all duration-300"
            >
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@mgmmodelschoolvarkala2839"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-10.5 h-10.5 rounded-full bg-white border border-black/8 shadow-2xs flex items-center justify-center hover:text-[#EF4444] hover:scale-110 transition-all duration-300"
            >
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            </a>

            <div className="w-[2px] h-6 bg-black/15 my-1" />

            <span className="[writing-mode:vertical-lr] rotate-180 text-[9.5px] font-sans-manrope font-extrabold tracking-[0.26em] text-[#5F5F5F] uppercase">
              FOLLOW US
            </span>
          </div>

          {/* Left Text Column (Matching Reference Layout) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-start text-left space-y-4">
            
            {/* Sub-Badge with Feather Icon */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 text-xs font-sans-manrope font-extrabold tracking-[0.26em] text-[#FF5E84] uppercase"
            >
              <svg className="w-4 h-4 fill-current text-[#FF5E84]" viewBox="0 0 24 24"><path d="M20.9 2.5c-4.4 0-9.6 4.3-12.7 8.5C6.7 13 5.4 15.3 4.5 17c-.7 1.3-1.6 2.9-2.5 4.5 2.1-.9 4.1-1.8 5.7-2.6 1.8-.9 4.1-2.2 6-3.7 4.2-3.1 8.5-8.3 8.5-12.7 0-.5-.6-1.1-1.3-1.1z"/></svg>
              <span>KALATHMAKAM 2K26</span>
            </motion.div>

            {/* Exact 3-Line Headline matching Reference image */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif-cormorant text-5xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[84px] font-bold leading-[1.05] tracking-tight text-[#111111]"
            >
              Where{' '}
              <span className="bg-gradient-to-r from-[#FF5E84] to-[#F59E0B] bg-clip-text text-transparent inline-flex items-baseline">
                Art
                <span className="text-[#F59E0B] text-3xl sm:text-4xl lg:text-5xl font-normal ml-0.5 translate-y-1">✦</span>
              </span>
              ,<br />
              <span className="font-serif-cormorant text-[#111111]">Breathes,</span><br />
              <span className="whitespace-nowrap">
                <span className="bg-gradient-to-r from-[#FF5E84] to-[#F59E0B] bg-clip-text text-transparent">
                  Talent
                </span>{' '}
                Flourishes.
              </span>
            </motion.h1>

            {/* Separator Line with Central Diamond Motif (❖) */}
            <div className="flex items-center gap-3 w-56 text-[#FF5E84]/35 my-1.5">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[#FF5E84]/35 to-transparent w-full" />
              <span className="text-[#FF5E84] text-xs font-bold">❖</span>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[#FF5E84]/35 to-transparent w-full" />
            </div>

            {/* Exact Paragraph Description matching Reference */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-sans-manrope text-sm sm:text-base text-[#5F5F5F] max-w-[500px] leading-relaxed font-medium"
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
              {/* Button 1: Pink Gradient Pill */}
              <button
                onClick={onExploreEvents}
                className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs sm:text-sm px-6.5 py-3.5 rounded-full flex items-center gap-2.5 cursor-pointer group shadow-md hover:scale-[1.02] transition-all"
              >
                <span>Explore Events</span>
                <svg className="w-4 h-4 fill-white transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {/* Button 2: White Pill with Black Circle Play Icon */}
              <button
                onClick={onOpenPromo}
                className="bg-white text-[#111111] font-sans-manrope font-bold text-xs sm:text-[13px] px-5 py-3.5 rounded-full flex items-center gap-2.5 cursor-pointer border border-black/10 shadow-2xs hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all group"
              >
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-2.5 h-2.5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span>Watch Promo</span>
              </button>

              {/* Button 3: Light Pill with Trophy Icon */}
              <button
                onClick={onViewLeaderboard}
                className="bg-transparent hover:bg-white/60 text-[#5F5F5F] hover:text-[#111111] font-sans-manrope font-semibold text-xs sm:text-[13px] px-4.5 py-3.5 rounded-full flex items-center gap-2 cursor-pointer border border-black/8 hover:border-black/15 shadow-2xs hover:scale-[1.02] transition-all"
              >
                <svg className="w-4 h-4 stroke-[#FF5E84]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                <span>Leaderboard</span>
              </button>
            </motion.div>

          </div>

          {/* Right Column: Hero Illustration Emblem with Grounded Shadow */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center items-center relative lg:-ml-6">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="relative w-full max-w-[560px] lg:max-w-[620px] xl:max-w-[660px] aspect-square flex items-center justify-center gpu-render"
            >
              <img
                src={heroArt}
                alt="Kalathmakam 2K26 Cultural Arts Emblem - Kathakali, Mohiniyattam, Theyyam, Chenda, Open Book"
                className="w-full h-full object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.18)]"
              />
            </motion.div>

          </div>

        </div>

      </div>

      {/* Pill Mouse Scroll Indicator centered at bottom matching reference */}
      <div className="flex flex-col items-center justify-center pt-2 pb-2 z-10">
        <a href="#about" aria-label="Scroll to Discover" className="flex items-center justify-center text-[#111111] hover:text-[#FF5E84] transition-colors">
          <div className="w-5 h-8 rounded-full border-2 border-black/40 hover:border-[#FF5E84] p-1 flex justify-center transition-colors">
            <div className="w-1 h-2 bg-[#111111] rounded-full animate-bounce" />
          </div>
        </a>
      </div>

    </section>
  );
};
