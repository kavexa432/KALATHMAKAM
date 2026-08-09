import React, { useState } from 'react';
import { Trophy, Search, CheckCircle, Trash2 } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';
import { auth } from '../../../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export const ResultsSection: React.FC = () => {
  const { results, events, currentUser } = useFestival();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterChip, setSelectedFilterChip] = useState<string>('All');
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const filterChips = ['All', 'Dance', 'Music', 'Drama', 'Literary', 'Art', 'House Item', 'LP', 'UP', 'HS', 'HSS'];

  const isAdmin = currentUser?.role === 'developer' || currentUser?.role === 'Developer' ||
    ((currentUser?.role === 'admin' || currentUser?.role === 'Admin') && currentUser?.approved);

  const publishedResults = results.filter((r) => r.status === 'Published' || r.status === 'Verified');

  // Group results by eventId so all placements appear in one card
  const groupedByEvent: Record<string, typeof publishedResults> = {};
  publishedResults.forEach((r) => {
    if (!groupedByEvent[r.eventId]) groupedByEvent[r.eventId] = [];
    groupedByEvent[r.eventId].push(r);
  });

  // Sort each group by position
  const posOrder: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3, 'Participation': 4 };
  Object.values(groupedByEvent).forEach((grp) =>
    grp.sort((a, b) => (posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9))
  );

  // Filter groups
  const filteredGroups = Object.entries(groupedByEvent).filter(([, placements]) => {
    const rep = placements[0];
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !query ||
      rep.eventTitle.toLowerCase().includes(query) ||
      placements.some(p => p.participantName.toLowerCase().includes(query)) ||
      placements.some(p => p.houseId.toLowerCase().includes(query)) ||
      rep.category.toLowerCase().includes(query) ||
      placements.some(p => p.studentClass.toLowerCase().includes(query));

    if (!matchesSearch) return false;
    if (selectedFilterChip === 'All') return true;

    const isCategoryMatch = rep.category.toLowerCase().includes(selectedFilterChip.toLowerCase());
    const isSectionMatch = placements.some(p => p.studentClass.toLowerCase().includes(selectedFilterChip.toLowerCase()));
    return isCategoryMatch || isSectionMatch;
  });

  const handleDeleteResult = async (eventId: string) => {
    if (!confirm('Delete all results for this competition? This cannot be undone.')) return;
    setDeletingEventId(eventId);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await fetch(`${API_URL}/api/publish/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Delete failed: ' + (err.error || 'Unknown error'));
      } else {
        // Reload to reflect deletion
        window.location.reload();
      }
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    } finally {
      setDeletingEventId(null);
    }
  };

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

          {/* Search */}
          <div className="w-full max-w-2xl relative pt-4">
            <Search className="w-4.5 h-4.5 text-[#FF5E84] absolute left-4 top-1/2 -translate-y-1/2 mt-2" />
            <input
              type="text"
              placeholder="Search by name, event, house, section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-black/12 text-xs sm:text-sm font-sans-manrope text-[#111111] shadow-xs focus:outline-none focus:border-[#FF5E84] focus:ring-2 focus:ring-[#FF5E84]/20"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedFilterChip(chip)}
                className={`px-4 py-1.5 rounded-full text-xs font-sans-manrope font-extrabold transition-all cursor-pointer ${
                  selectedFilterChip === chip
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-white text-[#5F5F5F] hover:text-[#111111] border border-black/8'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid — one card per competition */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredGroups.length > 0 ? (
            filteredGroups.map(([eventId, placements]) => {
              const rep = placements[0];
              const event = events.find((e) => e.id === eventId);

              return (
                <div
                  key={eventId}
                  className="bg-white rounded-[28px] border border-black/8 shadow-md flex flex-col overflow-hidden"
                >
                  {/* Card header */}
                  <div className="px-5 pt-5 pb-3 border-b border-black/6 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-sans-manrope font-extrabold text-[#5F5F5F] uppercase tracking-wider">
                        {rep.category}
                      </span>
                      <h3 className="font-serif-cormorant font-bold text-xl text-[#111111] leading-tight mt-0.5">
                        {rep.eventTitle}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteResult(eventId)}
                          disabled={deletingEventId === eventId}
                          className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center cursor-pointer transition-colors"
                          title="Delete results"
                        >
                          {deletingEventId === eventId
                            ? <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Placements */}
                  <div className="px-5 py-3 space-y-2 flex-1">
                    {placements.map((p, idx) => {
                      const hInfo = houseColors[p.houseId as HouseId] || houseColors.NOVA;
                      const posNum = idx + 1;
                      return (
                        <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-black/5">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xl">{MEDAL[posNum] || '🏅'}</span>
                            <span className="text-xs font-extrabold text-[#111111] bg-black/5 px-2 py-0.5 rounded-full">
                              {p.position || `${posNum}${posNum === 1 ? 'st' : posNum === 2 ? 'nd' : posNum === 3 ? 'rd' : 'th'}`}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans-manrope font-extrabold text-sm text-[#111111] truncate">
                              {p.participantName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: hInfo.lightBg, color: hInfo.text }}>
                                {p.houseId}
                              </span>
                              <span className="text-[10px] text-[#5F5F5F] font-semibold">{p.studentClass}</span>
                            </div>
                          </div>
                          <span className="font-sans-manrope font-extrabold text-xs text-[#FF5E84] shrink-0">
                            +{p.points} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  {event && (
                    <div className="px-5 pb-4 text-[10px] text-[#5F5F5F] font-sans-manrope">
                      {event.stage || event.venue} • {event.date}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-14 px-6 text-center bg-white rounded-[32px] border border-black/8 shadow-sm space-y-4 max-w-xl mx-auto my-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center mx-auto border border-amber-200">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                {searchQuery || selectedFilterChip !== 'All' ? 'No Matching Results' : 'No Results Published Yet'}
              </h3>
              <p className="font-sans-manrope text-xs text-[#5F5F5F] leading-relaxed">
                {searchQuery || selectedFilterChip !== 'All'
                  ? `No verified results matching "${searchQuery || selectedFilterChip}".`
                  : 'Verified results will appear here automatically once admins publish them.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
