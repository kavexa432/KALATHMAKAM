import React, { useState } from 'react';
import { Trophy, Search, CheckCircle, X, Medal } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId, EventResultModel } from '../../../shared/types/festivalTypes';

export const ResultsSection: React.FC = () => {
  const { results, events } = useFestival();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterChip, setSelectedFilterChip] = useState<string>('All');
  const [selectedResultModal, setSelectedResultModal] = useState<EventResultModel | null>(null);

  const filterChips = ['All', 'Dance', 'Music', 'Drama', 'Literary', 'Art', 'LP', 'UP', 'HS', 'HSS'];

  const publishedResults = results.filter((r) => r.status === 'Published' || r.status === 'Verified');

  const filteredResults = publishedResults.filter((r) => {
    const query = searchQuery.toLowerCase().trim();
    
    const matchesSearch =
      !query ||
      r.eventTitle.toLowerCase().includes(query) ||
      r.participantName.toLowerCase().includes(query) ||
      r.houseId.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query) ||
      r.studentClass.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (selectedFilterChip === 'All') return true;

    const isCategoryMatch = r.category.toLowerCase() === selectedFilterChip.toLowerCase();
    const isSectionMatch = r.studentClass.toLowerCase().includes(selectedFilterChip.toLowerCase());

    return isCategoryMatch || isSectionMatch;
  });

  return (
    <section id="results" className="relative py-14 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-sans-manrope font-extrabold tracking-[0.2em] text-[#FF5E84] uppercase bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/8 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>TROPHY & COMPETITION RESULTS</span>
          </div>

          <h2 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111] leading-tight">
            Official Festival Results
          </h2>

          <p className="font-sans-manrope text-sm sm:text-base text-[#5F5F5F] max-w-xl leading-relaxed font-medium">
            Search participants, events, sections, or house winners in real time.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl relative pt-4">
            <Search className="w-4.5 h-4.5 text-[#FF5E84] absolute left-4 top-1/2 -translate-y-1/2 mt-2" />
            <input
              type="text"
              placeholder="Search by student name (Anjali), event (Mohiniyattam), house (NOVA), section (HS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-black/12 text-xs sm:text-sm font-sans-manrope text-[#111111] shadow-xs focus:outline-none focus:border-[#FF5E84] focus:ring-2 focus:ring-[#FF5E84]/20"
            />
          </div>

          {/* Filter Chips Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {filterChips.map((chip) => {
              const isActive = selectedFilterChip === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setSelectedFilterChip(chip)}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans-manrope font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-white text-[#5F5F5F] hover:text-[#111111] border border-black/8'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredResults.length > 0 ? (
            filteredResults.map((res) => {
              const hInfo = houseColors[res.houseId as HouseId] || houseColors.NOVA;
              const relatedEvent = events.find((e) => e.id === res.eventId);
              const eventStatus = relatedEvent?.status || 'Completed';

              return (
                <div
                  key={res.id}
                  className="glass-card bg-white/95 backdrop-blur-xl rounded-[28px] p-6 border border-white/95 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 inset-x-0 h-1.5"
                    style={{ backgroundColor: hInfo.primary }}
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans-manrope font-extrabold text-[#5F5F5F] uppercase tracking-wider">
                      {res.category} • {res.studentClass}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      <span>{eventStatus}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                      {res.eventTitle}
                    </h3>
                    
                    <div className="flex items-center gap-3 mt-3 p-3 bg-[#FAF8F5] rounded-2xl border border-black/5">
                      <span className="text-3xl shrink-0">
                        {res.position === '1st' ? '🥇' : res.position === '2nd' ? '🥈' : '🥉'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] truncate">
                          {res.participantName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px] font-black px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: hInfo.lightBg,
                              color: hInfo.text,
                            }}
                          >
                            {res.houseId} House
                          </span>
                          <span className="text-[11px] font-bold text-[#FF5E84]">
                            +{res.points} PTS
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedResultModal(res)}
                      className="w-full py-2.5 rounded-full bg-[#111111] hover:bg-black text-white font-sans-manrope font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Medal className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>View Full Results</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-14 px-6 text-center bg-white rounded-[32px] border border-black/8 shadow-sm space-y-4 max-w-xl mx-auto my-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                  {searchQuery || selectedFilterChip !== 'All' ? 'No Matching Results Found' : 'No Official Results Published Yet'}
                </h3>
                <p className="font-sans-manrope text-xs text-[#5F5F5F] leading-relaxed">
                  {searchQuery || selectedFilterChip !== 'All'
                    ? `No verified results matching "${searchQuery || selectedFilterChip}".`
                    : 'Verified result sheets will be uploaded live by festival admins via the Result Sheet OCR Uploader. Published winners and points will appear here automatically in real time!'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal showing breakdown for selected event result */}
        {selectedResultModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#FAF8F5] rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl border border-black/10 relative text-left">
              
              <div className="p-6 bg-[#111111] text-white relative">
                <button
                  onClick={() => setSelectedResultModal(null)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5E84]">
                  OFFICIAL WINNERS BREAKDOWN
                </span>
                <h3 className="font-serif-cormorant font-bold text-3xl text-white mt-1">
                  {selectedResultModal.eventTitle}
                </h3>
                <p className="font-sans-manrope text-xs text-white/70">
                  {selectedResultModal.category} Category • {selectedResultModal.studentClass}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🥇</span>
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-700 uppercase">First Place (+5 Pts)</span>
                      <h4 className="font-sans-manrope font-extrabold text-base text-[#111111]">
                        {selectedResultModal.participantName}
                      </h4>
                      <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                        {selectedResultModal.houseId} House • {selectedResultModal.studentClass}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif-cormorant font-bold text-2xl text-amber-600">
                    +{selectedResultModal.points} PTS
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🥈</span>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-700 uppercase">Second Place (+3 Pts)</span>
                      <h4 className="font-sans-manrope font-extrabold text-base text-[#111111]">
                        Arya S. Kumar
                      </h4>
                      <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                        VEGA House • Class 11-B
                      </p>
                    </div>
                  </div>
                  <span className="font-serif-cormorant font-bold text-2xl text-slate-600">
                    +3 PTS
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-700/10 border border-amber-700/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🥉</span>
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-900 uppercase">Third Place (+1 Pt)</span>
                      <h4 className="font-sans-manrope font-extrabold text-base text-[#111111]">
                        Devi P. Nair
                      </h4>
                      <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                        ORION House • Class 10-A
                      </p>
                    </div>
                  </div>
                  <span className="font-serif-cormorant font-bold text-2xl text-amber-800">
                    +1 PT
                  </span>
                </div>

                <button
                  onClick={() => setSelectedResultModal(null)}
                  className="w-full py-3 rounded-full bg-[#111111] text-white font-sans-manrope font-bold text-xs cursor-pointer"
                >
                  Close Results Breakdown
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
