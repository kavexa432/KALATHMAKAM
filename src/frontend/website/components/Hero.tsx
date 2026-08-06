import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Play, ArrowRight, Radio, Sparkles, MapPin, Mic, Music, BookOpen, Drama } from 'lucide-react';
import heroArt from '../../../assets/hero_kerala_art_transparent.png';

interface HeroProps {
  onOpenPromo: () => void;
  onExploreEvents: () => void;
  onViewLeaderboard: () => void;
}

const TODAY_EVENTS = [
  {
    id: 'evt-1',
    time: '09:00 AM',
    title: 'Inauguration',
    subtitle: 'Lamp Lighting Ceremony',
    venue: 'Main Auditorium',
    isLive: true,
  },
  {
    id: 'evt-2',
    time: '09:15 AM',
    title: 'Bharathanatyam (Cat 4)',
    subtitle: 'Classical Dance Competition',
    venue: 'Stage 1: Main Auditorium',
    isLive: true,
  },
  {
    id: 'evt-3',
    time: '09:00 AM',
    title: 'Light Music Vocal',
    subtitle: 'Category 1 (Common)',
    venue: 'Stage 3: KG Auditorium',
    isLive: true,
  },
  {
    id: 'evt-4',
    time: '09:00 AM',
    title: 'Mappilappattu & Recitation',
    subtitle: 'Category 2 Boys & Girls',
    venue: 'Stage 6: Kids Auditorium',
    isLive: true,
  },
];

const STAGES_LIST = [
  { id: 'stage-1', label: 'Stage 1', name: 'Dance', color: 'bg-rose-50 text-[#FF5E84] border-rose-200', icon: <Sparkles className="w-5 h-5 text-[#FF5E84]" /> },
  { id: 'stage-2', label: 'Stage 2', name: 'English', color: 'bg-purple-50 text-purple-600 border-purple-200', icon: <Mic className="w-5 h-5 text-purple-600" /> },
  { id: 'stage-3', label: 'Stage 3', name: 'Music', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: <Music className="w-5 h-5 text-amber-600" /> },
  { id: 'stage-4', label: 'Stage 4', name: 'Malayalam', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <BookOpen className="w-5 h-5 text-emerald-600" /> },
  { id: 'stage-5', label: 'Stage 5', name: 'Hindi', color: 'bg-orange-50 text-orange-600 border-orange-200', icon: <span className="font-serif font-black text-lg text-orange-600">अ</span> },
  { id: 'stage-6', label: 'Stage 6', name: 'Kids', color: 'bg-sky-50 text-sky-600 border-sky-200', icon: <Drama className="w-5 h-5 text-sky-600" /> },
];

export const Hero: React.FC<HeroProps> = ({ onOpenPromo, onExploreEvents, onViewLeaderboard }) => {
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);
  const activeEvent = TODAY_EVENTS[activeCarouselIdx];

  return (
    <section
      id="home"
      className="relative pt-12 sm:pt-16 pb-12 overflow-hidden bg-[#FAF8F5] text-center sm:text-left"
    >
      {/* Warm Golden Cream Ambient Backdrop Glow */}
      <div
        className="absolute top-1/4 right-1/4 w-[700px] h-[600px] pointer-events-none -z-10 blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 235, 215, 0.9) 0%, rgba(255, 220, 200, 0.3) 60%, transparent 80%)',
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Top Header Tag */}
        <div className="flex flex-col items-center text-center space-y-2 mb-4">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-[#FF5E84] border border-rose-200/60 text-[11px] font-sans-manrope font-extrabold tracking-[0.2em] uppercase"
          >
            <span>ARTS FEST 2K26</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif-cormorant text-4xl sm:text-6xl md:text-7xl font-bold leading-tight text-[#111111] max-w-3xl"
          >
            Where{' '}
            <span className="text-[#FF5E84]">Art</span>{' '}
            Meets Excellence.
          </motion.h1>

          <p className="font-sans-manrope text-xs sm:text-sm text-[#5F5F5F] font-bold tracking-wider uppercase flex items-center justify-center gap-2">
            <span className="text-[#FF5E84]">⤁</span>
            <span>MGM MODEL SCHOOL, AYIROOR, VARKALA</span>
            <span className="text-[#FF5E84]">⤀</span>
          </p>

          {/* Date & Live Status Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-black/8 shadow-2xs text-xs font-sans-manrope font-extrabold mt-1">
            <span className="flex items-center gap-1.5 text-[#111111]">
              <Calendar className="w-3.5 h-3.5 text-[#FF5E84]" />
              <span>10 AUGUST 2026</span>
            </span>
            <span className="text-black/20">|</span>
            <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              <span>LIVE NOW</span>
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 py-4 max-w-lg mx-auto">
          <button
            onClick={onExploreEvents}
            className="flex-1 min-w-[150px] py-3.5 px-5 rounded-full bg-gradient-to-r from-[#FF5E84] to-[#FF8A00] text-white font-sans-manrope font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenPromo}
            className="py-3.5 px-4 rounded-full bg-white hover:bg-black/5 border border-black/12 text-[#111111] font-sans-manrope font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
            </div>
            <span>Watch Promo</span>
          </button>

          <button
            onClick={onViewLeaderboard}
            className="py-3.5 px-4 rounded-full bg-white hover:bg-rose-50 border border-black/12 text-[#FF5E84] font-sans-manrope font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FF5E84]" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* 4-Grid Compact Stats Cards (Matches Mobile Mockup Exactly) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-4 border border-black/6 shadow-2xs flex flex-col items-center justify-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-[#FF5E84] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-sans-manrope font-black text-lg text-[#111111]">10</span>
            <span className="text-[10px] font-extrabold uppercase text-[#5F5F5F]">AUG 2026 • Date</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-black/6 shadow-2xs flex flex-col items-center justify-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="font-sans-manrope font-black text-lg text-[#111111]">6</span>
            <span className="text-[10px] font-extrabold uppercase text-[#5F5F5F]">STAGES • Venues</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-black/6 shadow-2xs flex flex-col items-center justify-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-sans-manrope font-black text-lg text-[#111111]">70+</span>
            <span className="text-[10px] font-extrabold uppercase text-[#5F5F5F]">EVENTS • Competitions</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-black/6 shadow-2xs flex flex-col items-center justify-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <span className="font-sans-manrope font-black text-lg text-[#111111]">450+</span>
            <span className="text-[10px] font-extrabold uppercase text-[#5F5F5F]">PARTICIPANTS • Expected</span>
          </div>
        </div>

        {/* Center Kerala Traditional Performing Arts Illustration Banner */}
        <div className="my-6 max-w-2xl mx-auto relative flex items-center justify-center">
          <img
            src={heroArt}
            alt="Kerala Cultural Festival Artwork - Kathakali, Mohiniyattam, Chenda Drummer"
            className="w-full max-h-[260px] sm:max-h-[340px] object-contain filter drop-shadow-[0_15px_30px_rgba(255,94,132,0.12)]"
          />
        </div>

        {/* TODAY'S EVENTS Carousel Card (Matches Mockup) */}
        <div className="max-w-xl mx-auto my-6 text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-sans-manrope font-extrabold text-xs text-[#111111] uppercase tracking-wider">
              TODAY'S EVENTS
            </h3>
            <button
              onClick={onExploreEvents}
              className="text-xs font-bold text-[#FF5E84] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Featured Event Card */}
          <div className="bg-[#FFFDF9] rounded-2xl p-4 border border-amber-200/80 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center gap-3.5">
              <div className="px-3 py-2.5 bg-rose-50 border border-rose-200/60 rounded-xl text-center shrink-0">
                <span className="font-sans-manrope font-black text-sm text-[#FF5E84] block leading-tight">
                  {activeEvent.time.split(' ')[0]}
                </span>
                <span className="text-[9px] font-extrabold text-[#FF5E84] block uppercase">
                  {activeEvent.time.split(' ')[1]}
                </span>
              </div>

              <div>
                <h4 className="font-sans-manrope font-extrabold text-sm sm:text-base text-[#111111] leading-snug">
                  {activeEvent.title}
                </h4>
                <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-0.5">
                  {activeEvent.subtitle}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5F5F5F] mt-1">
                  <MapPin className="w-3 h-3 text-[#FF8A00]" />
                  <span>{activeEvent.venue}</span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-600 border border-red-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              <span>LIVE</span>
            </span>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {TODAY_EVENTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveCarouselIdx(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeCarouselIdx === i ? 'w-5 bg-[#FF5E84]' : 'w-2 bg-black/15'
                }`}
              />
            ))}
          </div>
        </div>

        {/* EXPLORE STAGES Horizontal Scroll Row (Matches Mockup) */}
        <div className="max-w-2xl mx-auto my-6 text-left">
          <h3 className="font-sans-manrope font-extrabold text-xs text-[#111111] uppercase tracking-wider mb-3 px-1">
            EXPLORE STAGES
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {STAGES_LIST.map((stg) => (
              <div
                key={stg.id}
                onClick={onExploreEvents}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:shadow-sm flex flex-col items-center justify-between space-y-1.5 bg-white ${stg.color}`}
              >
                <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center">
                  {stg.icon}
                </div>
                <div>
                  <span className="text-[10px] font-sans-manrope font-extrabold block text-[#111111]">
                    {stg.label}
                  </span>
                  <span className="text-[9.5px] font-sans-manrope font-bold text-[#5F5F5F] block">
                    {stg.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
