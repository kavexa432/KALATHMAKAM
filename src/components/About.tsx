import React, { useState } from 'react';
import { BookOpen, Target, Eye, Award, Heart, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState('history');

  const tabs = [
    { id: 'history', label: 'History & Legacy', icon: BookOpen },
    { id: 'purpose', label: 'Purpose & Mission', icon: Target },
    { id: 'vision', label: 'Vision 2026', icon: Eye },
    { id: 'objectives', label: 'Key Objectives', icon: ShieldCheck },
    { id: 'importance', label: 'Role of Arts', icon: Heart },
    { id: 'school', label: 'MGM School Heritage', icon: Award },
  ];

  const tabContent: Record<string, { title: string; subtitle: string; body: string; highlights: string[] }> = {
    history: {
      title: 'Legacy of Kalathmakam',
      subtitle: 'Part of MGM\'s 41-Year Heritage of Excellence',
      body: 'Kalathmakam is the flagship annual arts extravaganza of MGM Model School, Ayiroor — a school that has been shaping young minds for 41 years. This festival has grown into a prestigious stage where students discover their artistic calling in classical music, dance, literature, and fine arts.',
      highlights: [
        'Part of MGM Model School\'s 41-year legacy of academic and cultural excellence.',
        'Platform for 1500+ student participants across all categories annually.',
        'Evaluated by renowned artists, writers, and Kerala Kalamandalam experts.',
      ],
    },
    purpose: {
      title: 'Our Core Purpose',
      subtitle: 'Empowering Talent Beyond the Classroom',
      body: 'The primary aim of Kalathmakam is to provide an inclusive platform where students develop self-confidence, emotional intelligence, and teamwork through creative expression.',
      highlights: [
        'Promoting holistic development through music, theatre, and dance.',
        'Providing equal stage opportunities for beginner and master performers.',
        'Cultivating respect for Indian classical traditions and folk forms.',
      ],
    },
    vision: {
      title: 'Vision for 2K26',
      subtitle: 'Where Art Breathes, Talent Flourishes',
      body: 'Our vision for 2K26 is to merge traditional Kerala art forms with modern editorial aesthetics, inspiring students to embrace cultural pride while pushing the boundaries of creative innovation.',
      highlights: [
        'Integrating green, sustainable eco-friendly stage designs.',
        'Pioneering digital result tracking and live stage scoring.',
        'Fostering youth participation across diverse art categories.',
      ],
    },
    objectives: {
      title: 'Festival Objectives',
      subtitle: 'Excellence, Integrity, and Celebration',
      body: 'We strive to maintain pristine standards of evaluation while ensuring a joyous, festive atmosphere where every student feels celebrated.',
      highlights: [
        'Transparent 3-judge panel scoring system.',
        'High-value rolling trophies and merit certificates.',
        'Promoting literary prowess in Malayalam, English, and Hindi.',
      ],
    },
    importance: {
      title: 'The Vital Role of Arts',
      subtitle: 'Enriching Mind, Soul & Character',
      body: 'Arts education is not merely an extracurricular activity; it is the cornerstone of empathy, critical thinking, and aesthetic sensitivity. Kalathmakam breathes life into education.',
      highlights: [
        'Stimulating creative problem solving and spatial intelligence.',
        'Building lifelong stage confidence and public speaking skills.',
        'Strengthening cultural unity and communal harmony.',
      ],
    },
    school: {
      title: 'MGM Model School, Ayiroor',
      subtitle: '41 Years of Educational & Cultural Excellence',
      body: 'Situated near the scenic coastal town of Varkala in Thiruvananthapuram district, MGM Model School Ayiroor has been a beacon of quality education for 41 years, renowned for its academic rigor and rich co-curricular ecosystem.',
      highlights: [
        '41 years of nurturing academic and artistic talent in the Varkala region.',
        'State-of-the-art auditoriums and dedicated fine arts faculty.',
        'A legacy of producing top state-level Kalathilakams and Kalaprathibhas.',
      ],
    },
  };

  const current = tabContent[activeTab];

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-[#FAF8F5]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-sans-manrope font-extrabold tracking-[0.25em] text-[#FF5E84] uppercase">
            ABOUT THE FESTIVAL
          </span>
          <h2 className="font-serif-cormorant text-4xl sm:text-5xl md:text-6xl font-bold text-[#111111]">
            About Kalathmakam
          </h2>
          <p className="font-sans-manrope text-xl text-[#FF8A00] font-semibold italic">
            "One Stage. Infinite Expressions."
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FF5E84] to-[#FF8A00] mx-auto rounded-full" />
        </div>

        {/* Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interactive Open Book Illustration */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative max-w-md w-full aspect-square rounded-[32px] overflow-hidden glass-panel p-4 shadow-xl">
              <img
                src="/about_banner.jpg"
                alt="Kalathmakam 2026 MGM Arts Fest banner at school"
                className="w-full h-full object-cover rounded-[24px] shadow-md transform hover:scale-105 transition-transform duration-700"
              />
              
              {/* Floating Badge overlay */}
              <div className="absolute bottom-6 right-6 glass-card px-5 py-3 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF5E84] text-white flex items-center justify-center font-serif-cormorant font-bold text-lg">
                  2K26
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111111]">MGM Model School</p>
                  <p className="text-[11px] text-[#5F5F5F]">Ayiroor, Varkala</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Narrative Content */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            
            {/* Category Tab Buttons */}
            <div className="flex flex-wrap gap-2.5 border-b border-[#111111]/10 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-sans-manrope font-bold transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF5E84] to-[#FF8A00] text-white shadow-md scale-105'
                        : 'glass-card text-[#5F5F5F] hover:text-[#111111]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-8 rounded-[28px] space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF5E84]">
                    {current.subtitle}
                  </span>
                  <h3 className="font-serif-cormorant text-3xl sm:text-4xl font-bold text-[#111111]">
                    {current.title}
                  </h3>
                </div>

                <p className="font-sans-manrope text-base text-[#5F5F5F] leading-relaxed">
                  {current.body}
                </p>

                <div className="space-y-3 pt-2">
                  {current.highlights.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#FF5E84]/15 text-[#FF5E84] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        ✓
                      </div>
                      <span className="font-sans-manrope text-sm font-semibold text-[#111111]">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>
    </section>
  );
};
