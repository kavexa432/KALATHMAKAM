import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import type { EventModel } from '../../../shared/types/festivalTypes';
import { EventDetailModal } from './EventDetailModal';

export const LiveEventsSection: React.FC = () => {
  const { events } = useFestival();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<EventModel | null>(null);

  const categories = ['All', 'Dance', 'Music', 'Fine Arts', 'Literature', 'Drama', 'Quiz'];

  const filteredEvents = selectedCategory === 'All'
    ? events
    : events.filter((e) => e.category === selectedCategory);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ongoing':
      case 'LIVE NOW':
        return <span className="bg-red-500/15 text-red-600 border border-red-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase animate-pulse">● LIVE NOW</span>;
      case 'Completed':
        return <span className="bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Completed</span>;
      case 'Judging':
        return <span className="bg-amber-500/15 text-amber-700 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Judging</span>;
      default:
        return <span className="bg-blue-500/15 text-blue-600 border border-blue-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Upcoming</span>;
    }
  };

  return (
    <section id="events" className="relative py-12 sm:py-14 bg-[#FAF8F5]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-sans-manrope font-extrabold tracking-[0.2em] text-[#FF5E84] uppercase bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/8 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5E84]" />
            <span>FESTIVAL COMPETITIONS & STAGES</span>
          </div>

          <h2 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111] leading-tight">
            Explore Festival Events
          </h2>

          <p className="font-sans-manrope text-sm sm:text-base text-[#5F5F5F] max-w-xl leading-relaxed font-medium">
            Over 20+ competitions across 4 main stages. Filter by category to view live status, guidelines, and venue info.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <span className="text-xs font-bold text-[#5F5F5F] mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-sans-manrope font-bold text-xs transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF5E84] text-white shadow-xs'
                    : 'bg-white text-[#5F5F5F] hover:text-[#111111] border border-black/8'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="glass-card bg-white/90 backdrop-blur-xl rounded-[28px] p-6 border border-white/95 shadow-md flex flex-col justify-between space-y-4 text-left group cursor-pointer hover:border-[#FF5E84]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans-manrope font-extrabold text-[#FF5E84] uppercase tracking-wider">
                  {evt.category}
                </span>
                {getStatusBadge(evt.status)}
              </div>

              <div>
                <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111] group-hover:text-[#FF5E84] transition-colors">
                  {evt.title}
                </h3>
                <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-1 line-clamp-2">
                  {Array.isArray(evt.rules) ? evt.rules[0] : (evt.rules || 'Official CBSE festival rules apply.')}
                </p>
              </div>

              <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs font-sans-manrope text-[#5F5F5F]">
                <span className="flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>{evt.stageName}</span>
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{evt.startTime}</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs font-sans-manrope font-bold text-[#FF5E84]">
                <span>View Event Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
};
