import React, { useState } from 'react';
import { MapPin, ArrowRight, Sparkles, Clock, Search, ChevronRight, AlertCircle, Palette, Music, BookOpen, Mic, Theater, CheckCircle, Calendar } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import type { EventModel } from '../../../shared/types/festivalTypes';
import { formatTime12Hour } from '../../../utils/timeUtils';
import { cleanVenueName } from '../../../utils/venueUtils';
import { EventDetailModal } from './EventDetailModal';

interface CategoryTile {
  id: string;
  title: string;
  icon: React.ReactNode;
  countText: string;
  statusText: string;
  badgeBg: string;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    id: 'Fine Arts',
    title: 'Fine Arts & Drawing',
    icon: <Palette className="w-6 h-6 text-[#F59E0B]" />,
    countText: '7 Competitions',
    statusText: '7 Completed (Pre-Fest)',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'Music',
    title: 'Vocal & Instrumental Music',
    icon: <Music className="w-6 h-6 text-[#3B82F6]" />,
    countText: '13 Competitions',
    statusText: 'Upcoming on Stage 3 & 6',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  {
    id: 'Dance',
    title: 'Classical & Folk Dance',
    icon: <Sparkles className="w-6 h-6 text-[#FF5E84]" />,
    countText: '8 Competitions',
    statusText: 'Stage 1 (Main Auditorium)',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'Literary',
    title: 'Literary & Versification',
    icon: <BookOpen className="w-6 h-6 text-[#8B5CF6]" />,
    countText: '6 Competitions',
    statusText: 'English & Malayalam Completed',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'Languages',
    title: 'Languages & Recitation',
    icon: <Mic className="w-6 h-6 text-[#10B981]" />,
    countText: '12 Competitions',
    statusText: 'Hindi, Sanskrit, Arabic',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'Drama',
    title: 'Mono Act & Mimicry',
    icon: <Theater className="w-6 h-6 text-[#F97316]" />,
    countText: '6 Competitions',
    statusText: 'Kids Auditorium (Stage 6)',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
  },
];

export const LiveEventsSection: React.FC = () => {
  const { events, results } = useFestival();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTile, setSelectedCategoryTile] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<EventModel | null>(null);

  // Only show the event grid once the user has searched or selected a category
  const isSearchActive = searchQuery.trim().length > 0 || selectedCategoryTile !== null;

  const publicEvents = events.filter((e) => e.publishToWebsite);
  const publishedResultEventIds = new Set(
    results
      .filter((r) => r.status === 'Published' || r.status === 'Verified')
      .map((r) => r.eventId)
  );

  const handleCategoryTileClick = (tileId: string) => {
    if (selectedCategoryTile === tileId) {
      setSelectedCategoryTile(null);
    } else {
      setSelectedCategoryTile(tileId);
      setStatusFilter('All');
    }
  };

  const getStatusBadge = (status: string, event: EventModel) => {
    switch (status) {
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-500/15 text-red-600 border border-red-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            <span>LIVE NOW</span>
          </span>
        );
      case 'Completed':
        if (publishedResultEventIds.has(event.id)) {
          return (
            <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              <CheckCircle className="w-3 h-3" />
              <span>Published</span>
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-700 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              <Clock className="w-3 h-3" />
              <span>Results Pending</span>
            </span>
          );
        }
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-500/15 text-orange-600 border border-orange-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
            <AlertCircle className="w-3 h-3" />
            <span>Delayed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-600 border border-blue-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
            <Calendar className="w-3 h-3" />
            <span>Upcoming</span>
          </span>
        );
    }
  };

  const filteredEvents = publicEvents.filter((evt) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      evt.eventName.toLowerCase().includes(query) ||
      evt.category.toLowerCase().includes(query) ||
      (evt.stage && evt.stage.toLowerCase().includes(query)) ||
      (evt.venue && evt.venue.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (selectedCategoryTile) {
      const catKey = selectedCategoryTile.toLowerCase();
      const evtCat = evt.category.toLowerCase();
      const evtName = evt.eventName.toLowerCase();

      let isTileMatch = false;

      if (catKey.includes('art') || catKey.includes('fine')) {
        isTileMatch = evtCat.includes('art') || evtCat.includes('fine') || evtName.includes('drawing') || evtName.includes('painting') || evtName.includes('poster') || evtName.includes('cartoon') || evtName.includes('collage');
      } else if (catKey.includes('music')) {
        isTileMatch = evtCat.includes('music') || evtCat.includes('song') || evtName.includes('music') || evtName.includes('song') || evtName.includes('violin') || evtName.includes('mappila') || evtName.includes('western');
      } else if (catKey.includes('dance')) {
        isTileMatch = evtCat.includes('dance') || evtName.includes('dance') || evtName.includes('bharat') || evtName.includes('mohini') || evtName.includes('kuchi');
      } else if (catKey.includes('literary')) {
        isTileMatch = evtCat.includes('literary') || evtName.includes('essay') || evtName.includes('story') || evtName.includes('versification');
      } else if (catKey.includes('language')) {
        isTileMatch = evtCat.includes('language') || evtCat.includes('recitation') || evtName.includes('recitation') || evtName.includes('elocution') || evtName.includes('extempore') || evtName.includes('anchoring') || evtName.includes('declamation');
      } else if (catKey.includes('drama')) {
        isTileMatch = evtCat.includes('drama') || evtName.includes('mono') || evtName.includes('mimicry') || evtName.includes('drama') || evtName.includes('act');
      } else {
        isTileMatch = evtCat.includes(catKey) || evtName.includes(catKey);
      }

      if (!isTileMatch) return false;
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'Running' && evt.status !== 'Running') return false;
      if (statusFilter === 'Completed' && evt.status !== 'Completed') return false;
      if (statusFilter === 'Upcoming' && evt.status === 'Completed') return false;
    }

    return true;
  });

  return (
    <section id="events" className="relative py-12 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-sans-manrope font-extrabold tracking-[0.2em] text-[#FF5E84] uppercase bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/8 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5E84]" />
            <span>FESTIVAL COMPETITIONS & CATEGORIES</span>
          </div>

          <h2 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111] leading-tight">
            Explore Competitions
          </h2>

          <p className="font-sans-manrope text-sm sm:text-base text-[#5F5F5F] max-w-xl leading-relaxed font-medium">
            Search or select a category below to browse stage venues, rules, and live event statuses.
          </p>

          {/* Search Toolbar */}
          <div className="w-full max-w-2xl relative pt-3">
            <Search className="w-4.5 h-4.5 text-[#FF5E84] absolute left-4 top-1/2 -translate-y-1/2 mt-1.5" />
            <input
              type="text"
              placeholder="Search competitions (Bharathanatyam, Pencil Drawing, Stage 1...)"
              value={searchQuery}
              onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // When user types a search, show all statuses so results aren't hidden
                  if (e.target.value.trim()) setStatusFilter('All');
                }}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-black/12 text-xs sm:text-sm font-sans-manrope text-[#111111] shadow-xs focus:outline-none focus:border-[#FF5E84] focus:ring-2 focus:ring-[#FF5E84]/20"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['All', 'Running', 'Upcoming', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1 rounded-full font-sans-manrope font-bold text-xs transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-white text-[#5F5F5F] hover:text-[#111111] border border-black/8'
                }`}
              >
                {status === 'Running' ? 'Live Now' : status === 'Completed' ? 'Completed' : status === 'Upcoming' ? 'Upcoming' : 'All Statuses'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tiles Navigation Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <span>Browse by Category</span>
              {selectedCategoryTile && (
                <button
                  onClick={() => setSelectedCategoryTile(null)}
                  className="text-xs text-[#FF5E84] font-bold underline cursor-pointer lowercase"
                >
                  (clear selection)
                </button>
              )}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORY_TILES.map((tile) => {
              const isSelected = selectedCategoryTile === tile.id;

              return (
                <div
                  key={tile.id}
                  onClick={() => handleCategoryTileClick(tile.id)}
                  className={`rounded-2xl p-4 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between border space-y-3 group ${
                    isSelected
                      ? 'bg-[#111111] text-white border-[#111111] shadow-md scale-[1.02]'
                      : 'bg-white hover:bg-[#FAF8F5] text-[#111111] border-black/8 hover:border-black/15 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tile.icon}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-[#FF5E84]' : 'text-[#5F5F5F] group-hover:translate-x-0.5'}`} />
                  </div>

                  <div>
                    <h4 className={`font-sans-manrope font-extrabold text-xs sm:text-sm leading-snug ${isSelected ? 'text-white' : 'text-[#111111]'}`}>
                      {tile.title}
                    </h4>
                    <span className={`text-[10px] font-semibold block mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#5F5F5F]'}`}>
                      {tile.countText}
                    </span>
                  </div>

                  <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full inline-block truncate ${isSelected ? 'bg-white/15 text-white' : tile.badgeBg}`}>
                    {tile.statusText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Grid — only shown after search or category selection */}
        {isSearchActive ? (
          <>
            {/* Selected Category Header if active */}
            {selectedCategoryTile && (
              <div className="p-4 rounded-2xl bg-white border border-black/8 shadow-2xs mb-6 flex items-center justify-between text-left">
                <div>
                  <span className="text-xs font-bold text-[#FF5E84] uppercase tracking-wider">Filtered Category</span>
                  <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                    Showing {selectedCategoryTile} Competitions ({filteredEvents.length})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCategoryTile(null)}
                  className="px-4 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-black/5 text-[#111111] font-sans-manrope font-bold text-xs border border-black/10 cursor-pointer"
                >
                  Show All
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="bg-white rounded-[24px] p-5 border border-black/8 hover:border-black/15 shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4 text-left group cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-sans-manrope font-extrabold text-[#FF5E84] uppercase tracking-wider">
                        {evt.category}
                      </span>
                      {getStatusBadge(evt.status, evt)}
                    </div>

                    <div>
                      <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111] group-hover:text-[#FF5E84] transition-colors leading-tight">
                        {evt.eventName}
                      </h3>
                      <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-1 line-clamp-1">
                        {evt.type} {evt.language ? `• ${evt.language}` : ''}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-black/6 flex items-center justify-between text-xs font-sans-manrope text-[#5F5F5F]">
                      <span className="flex items-center gap-1.5 font-semibold truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                        <span className="truncate">{cleanVenueName(evt.venue, evt.stage)}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold shrink-0 ml-2">
                        <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{evt.scheduledStartTime ? formatTime12Hour(evt.scheduledStartTime) : 'TBA'}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs font-sans-manrope font-bold text-[#FF5E84]">
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-[24px] border border-black/8 space-y-2">
                  <AlertCircle className="w-8 h-8 text-[#FF5E84] mx-auto opacity-70" />
                  <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                    No Competitions Found
                  </h4>
                  <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                    Try adjusting your search query or status filter.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Idle state — prompt the user to search or pick a category */
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FF5E84]/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-[#FF5E84]" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                Find Your Competition
              </h4>
              <p className="font-sans-manrope text-sm text-[#5F5F5F] max-w-xs mx-auto leading-relaxed">
                Type a competition name above — like <span className="font-bold text-[#111111]">"Bharathanatyam"</span> or <span className="font-bold text-[#111111]">"Pencil Drawing"</span> — or tap a category tile to browse.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {['Pencil Drawing', 'Mime', 'Light Music', 'Anchoring', 'Oppana'].map((hint) => (
                <button
                  key={hint}
                  onClick={() => setSearchQuery(hint)}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-xs font-sans-manrope font-bold text-[#5F5F5F] hover:text-[#FF5E84] hover:border-[#FF5E84]/40 cursor-pointer transition-all"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
};
