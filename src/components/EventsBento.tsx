import React, { useState } from 'react';
import { Search, MapPin, Clock, Users, ArrowUpRight, X } from 'lucide-react';
import { CATEGORIES, EVENTS_DATA, type EventItem } from '../data/eventsData';
import { motion, AnimatePresence } from 'framer-motion';

interface EventsBentoProps {
  onRegisterEvent: (event: EventItem) => void;
}

export const EventsBento: React.FC<EventsBentoProps> = ({ onRegisterEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);

  const filteredEvents = EVENTS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="events" className="py-24 relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-sans-manrope font-extrabold tracking-[0.25em] text-[#FF5E84] uppercase">
            COMPETITIONS & STAGES
          </span>
          <h2 className="font-serif-cormorant text-4xl sm:text-5xl md:text-6xl font-bold text-[#111111]">
            Explore Festival Events
          </h2>
          <p className="font-sans-manrope text-base sm:text-lg text-[#5F5F5F]">
            Over 20+ exciting competitions across 9 distinct art categories. Find your event and register to win.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
          
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-sans-manrope font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF5E84] to-[#FF8A00] text-white shadow-md'
                      : 'glass-card text-[#5F5F5F] hover:text-[#111111]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#5F5F5F] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full glass-panel text-xs font-sans-manrope font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEvents.map((item, idx) => {
              const isLarge = item.featured && idx % 4 === 0;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`glass-card rounded-[28px] p-7 flex flex-col justify-between group cursor-pointer border border-white/80 hover:border-[#FF5E84]/40 relative overflow-hidden ${
                    isLarge ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white/90 via-white/80 to-[#FF5E84]/5' : ''
                  }`}
                  onClick={() => setActiveModalEvent(item)}
                >
                  {/* Subtle top subtle color gradient glow */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradient}`} />

                  <div>
                    {/* Top row: Badge & Arrow */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-sans-manrope font-bold border ${item.badgeBg}`}>
                        {item.category}
                      </span>
                      <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#5F5F5F] group-hover:text-[#FF5E84] group-hover:bg-[#FF5E84]/10 transition-all duration-300 group-hover:rotate-45">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif-cormorant text-2xl sm:text-3xl font-bold text-[#111111] group-hover:text-[#FF5E84] transition-colors mb-3">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="font-sans-manrope text-xs sm:text-sm text-[#5F5F5F] line-clamp-2 leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom details */}
                  <div className="space-y-2 border-t border-[#111111]/5 pt-4 text-xs font-sans-manrope text-[#5F5F5F]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5E84] shrink-0" />
                      <span className="truncate font-semibold">{item.stage}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                        <span>{item.time} ({item.day})</span>
                      </div>
                      <span className="font-bold text-[#FF5E84] group-hover:underline">
                        Details →
                      </span>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16 glass-card rounded-[28px]">
            <p className="text-[#5F5F5F] font-sans-manrope font-medium text-base">
              No events found matching your criteria. Try adjusting your search or category filter.
            </p>
          </div>
        )}

      </div>

      {/* Event Details Drawer/Modal */}
      <AnimatePresence>
        {activeModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel bg-[#FAF8F5] rounded-[32px] max-w-xl w-full p-8 relative shadow-2xl overflow-hidden border border-white/90"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalEvent(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full glass-card flex items-center justify-center text-[#111111] hover:text-[#FF5E84] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-4 ${activeModalEvent.badgeBg}`}>
                {activeModalEvent.category} • {activeModalEvent.day}
              </span>

              <h3 className="font-serif-cormorant text-3xl font-bold text-[#111111] mb-2">
                {activeModalEvent.title}
              </h3>

              <p className="font-sans-manrope text-sm text-[#5F5F5F] mb-6">
                {activeModalEvent.description}
              </p>

              <div className="space-y-3 glass-card p-4 rounded-2xl mb-6 text-xs font-sans-manrope">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF5E84]" />
                  <span className="font-bold">Venue:</span>
                  <span>{activeModalEvent.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF8A00]" />
                  <span className="font-bold">Timing:</span>
                  <span>{activeModalEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#4DA8FF]" />
                  <span className="font-bold">Category Limit:</span>
                  <span>{activeModalEvent.maxParticipants}</span>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-3 mb-8">
                <h4 className="font-sans-manrope font-bold text-sm text-[#111111]">
                  Rules & Evaluation Guidelines:
                </h4>
                <ul className="space-y-2">
                  {activeModalEvent.rules.map((rule, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2 text-xs text-[#5F5F5F]">
                      <span className="text-[#FF5E84] font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveModalEvent(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#5F5F5F] hover:text-[#111111]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const evt = activeModalEvent;
                    setActiveModalEvent(null);
                    onRegisterEvent(evt);
                  }}
                  className="gradient-btn-primary text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md"
                >
                  Register for Event
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
