import React, { useState } from 'react';
import { DAYS_LIST, SCHEDULE_DATA } from '../data/scheduleData';
import { Clock, MapPin, CheckCircle, Radio, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScheduleTimeline: React.FC = () => {
  const [activeDay, setActiveDay] = useState<string>('Day 1');

  const filteredSchedule = SCHEDULE_DATA.filter((item) => item.day === activeDay);

  return (
    <section id="schedule" className="py-24 relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-sans-manrope font-extrabold tracking-[0.25em] text-[#FF5E84] uppercase">
            PROGRAM AGENDA
          </span>
          <h2 className="font-serif-cormorant text-4xl sm:text-5xl md:text-6xl font-bold text-[#111111]">
            Festival Schedule
          </h2>
          <p className="font-sans-manrope text-base sm:text-lg text-[#5F5F5F]">
            3 days of non-stop artistic mastery across 3 main stages at MGM Model School campus.
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center justify-center gap-3 mb-16 overflow-x-auto pb-2">
          {DAYS_LIST.map((day) => {
            const isActive = activeDay === day;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-sans-manrope font-extrabold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF5E84] to-[#FF8A00] text-white shadow-lg scale-105'
                    : 'glass-card text-[#5F5F5F] hover:text-[#111111]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{day}</span>
              </button>
            );
          })}
        </div>

        {/* Vertical Timeline Container */}
        <div className="relative pl-6 sm:pl-10 border-l-2 border-[#FF5E84]/30 space-y-10 ml-2 sm:ml-8">
          
          {filteredSchedule.map((item, idx) => {
            const isCompleted = item.status === 'Completed';
            const isLive = item.status === 'Live';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group"
              >
                {/* Timeline Dot Indicator */}
                <div
                  className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-125 ${
                    isLive
                      ? 'bg-[#FF8A00] border-white text-white ring-4 ring-[#FF8A00]/30 animate-pulse'
                      : isCompleted
                      ? 'bg-[#FF5E84] border-white text-white'
                      : 'bg-white border-[#FF5E84] text-[#FF5E84]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : isLive ? (
                    <Radio className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#FF5E84]" />
                  )}
                </div>

                {/* Event Card */}
                <div className="glass-card p-6 sm:p-8 rounded-[28px] space-y-4 hover:border-[#FF5E84]/40 transition-all duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-sans-manrope font-bold text-[#FF5E84]">
                      <Clock className="w-4 h-4 text-[#FF5E84]" />
                      <span>{item.time}</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-sans-manrope font-bold ${
                        isLive
                          ? 'bg-amber-500 text-white animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-serif-cormorant text-2xl sm:text-3xl font-bold text-[#111111]">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-6 text-xs font-sans-manrope text-[#5F5F5F]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
                      <span className="font-semibold">{item.stage}</span>
                    </div>
                    <div>
                      <span>Coordinator: </span>
                      <strong className="text-[#111111]">{item.coordinator}</strong>
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
};
