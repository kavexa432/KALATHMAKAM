import React, { useState } from 'react';
import { Trophy, Search, CheckCircle, Trash2, Edit2, Plus, Save, X, Sparkles, Info } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

// ── Official Kalathmakam 2026 house-points formula ────────────────────────────
// group      → 1st=20 / 2nd=15 / 3rd=10
//   (Mime, Fusion Dance, Group Dance, Kaikottikali, Thiruvathira, Oppana,
//    Group Song, Patriotic Song, National Anthem, One Act Play, PPT Cat II/III)
// individual → 1st=10 / 2nd=7  / 3rd=5
//   (Anchoring Cat II/III, Declamation Cat II, Turn Coat Cat III, Western Music)
// Consolation / Participation / houseId=NONE → 0 pts always
function calcHousePoints(
  position: string,
  houseId: string,
  competitionType: string | undefined
): number {
  if (houseId === 'NONE') return 0;
  if (position === 'Consolation' || position === 'Participation') return 0;
  const type = competitionType || 'individual';
  if (type === 'group') {
    if (position === '1st') return 20;
    if (position === '2nd') return 15;
    if (position === '3rd') return 10;
  } else {
    // 'individual' or 'team'
    if (position === '1st') return 10;
    if (position === '2nd') return 7;
    if (position === '3rd') return 5;
  }
  return 0;
}

const MEDAL: Record<string, string> = {
  '1st': '🥇',
  '2nd': '🥈',
  '3rd': '🥉',
  'Consolation': '🎖️',
  'Participation': '🎗️',
};

const HOUSES = [
  { value: 'NOVA',  label: '🔴 NOVA' },
  { value: 'VEGA',  label: '🔵 VEGA' },
  { value: 'ORION', label: '🟢 ORION' },
  { value: 'ASTRA', label: '🟡 ASTRA' },
  { value: 'NONE',  label: '⚪ No House (Individual)' },
];

export const ResultsSection: React.FC = () => {
  const { results, events, currentUser, deleteResult, publishEventWinners } = useFestival();

  const [searchQuery,        setSearchQuery]        = useState('');
  const [selectedFilterChip, setSelectedFilterChip] = useState<string>('All');
  const [deletingResultId,   setDeletingResultId]   = useState<string | null>(null);
  const [editingEventId,     setEditingEventId]      = useState<string | null>(null);
  const [editingResults,     setEditingResults]      = useState<any[]>([]);
  const [savingEdit,         setSavingEdit]          = useState(false);

  const filterChips = ['All', 'Dance', 'Music', 'Drama', 'Literary', 'Art', 'House Item', 'LP', 'UP', 'HS', 'HSS'];

  const roleLower = currentUser?.role?.toLowerCase();
  const isAdmin   = roleLower === 'developer' || roleLower === 'admin';

  // ── Grouping & sorting ──────────────────────────────────────────────────────
  const publishedResults = results.filter(r => r.status === 'Published' || r.status === 'Verified');

  const groupedByEvent: Record<string, typeof publishedResults> = {};
  publishedResults.forEach(r => {
    if (!groupedByEvent[r.eventId]) groupedByEvent[r.eventId] = [];
    groupedByEvent[r.eventId].push(r);
  });

  const posOrder: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3, 'Consolation': 4, 'Participation': 5 };
  Object.values(groupedByEvent).forEach(grp =>
    grp.sort((a, b) => (posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9))
  );

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filteredGroups = Object.entries(groupedByEvent).filter(([, placements]) => {
    const rep   = placements[0];
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

    return (
      rep.category.toLowerCase().includes(selectedFilterChip.toLowerCase()) ||
      placements.some(p => p.studentClass.toLowerCase().includes(selectedFilterChip.toLowerCase()))
    );
  });

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDeleteResult = async (resultId: string) => {
    const result = results.find(r => r.id === resultId);
    if (!result) return;

    if (!window.confirm(
      `Delete this result?\n\n${result.participantName} — ${result.position} in ${result.eventTitle}\n\nThis will remove ${result.points} pts from ${result.houseId}.\n\nThis cannot be undone!`
    )) return;

    setDeletingResultId(resultId);
    try {
      await deleteResult(resultId);
    } catch (error: any) {
      alert(`❌ Delete failed: ${error.message || 'Unknown error'}`);
    } finally {
      setDeletingResultId(null);
    }
  };

  // ── Edit handlers ───────────────────────────────────────────────────────────
  const handleStartEdit = (eventId: string, placements: typeof publishedResults) => {
    const evt        = events.find(e => e.id === eventId);
    const isHouseEvt = evt?.houseWise === true;
    setEditingEventId(eventId);
    setEditingResults(placements.map(p => ({
      id:              p.id,
      position:        p.position,
      participantName: p.participantName,
      studentClass:    p.studentClass || '',
      // Non-house events: always NONE regardless of what was stored
      houseId:         isHouseEvt ? p.houseId : 'NONE',
      points:          isHouseEvt ? calcHousePoints(p.position, p.houseId, evt?.competitionType) : 0,
      isNew:           false,
    })));
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEditingResults([]);
  };

  const handleAddPosition = () => {
    const evt        = events.find(e => e.id === editingEventId);
    const isHouseEvt = evt?.houseWise === true;
    // Non-house events: always NONE; house events: default to NOVA
    const defaultHouse = isHouseEvt ? 'NOVA' : 'NONE';
    setEditingResults(prev => [...prev, {
      id:              `new-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      position:        'Consolation',
      participantName: '',
      studentClass:    '',
      houseId:         defaultHouse,
      points:          0,
      isNew:           true,
    }]);
  };

  const handleRemovePosition = (index: number) =>
    setEditingResults(prev => prev.filter((_, i) => i !== index));

  const handleUpdateField = (index: number, field: string, value: any) => {
    const evt = events.find(e => e.id === editingEventId);
    setEditingResults(prev => prev.map((r, i) => {
      if (i !== index) return r;
      const updated = { ...r, [field]: value };
      // Always recompute points preview from canonical formula
      updated.points = calcHousePoints(updated.position, updated.houseId, evt?.competitionType);
      return updated;
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingEventId) return;

    const evt          = events.find(e => e.id === editingEventId);
    const validResults = editingResults.filter(r => r.participantName.trim());

    if (validResults.length === 0) {
      alert('Please add at least one position with a participant name before saving.');
      return;
    }

    setSavingEdit(true);
    try {
      // Silently delete old Firestore docs for this event
      const existingIds = results.filter(r => r.eventId === editingEventId).map(r => r.id);
      await Promise.all(existingIds.map(id =>
        deleteDoc(doc(db, 'results', id)).catch(() => {/* already gone */})
      ));

      // Re-publish — FestivalContext.calcHousePoints will recompute points authoritatively
      await publishEventWinners(
        editingEventId,
        'Updated via Admin Edit on Results page',
        validResults.map(r => ({
          position:     r.position,
          studentName:  r.participantName.trim(),
          studentClass: r.studentClass.trim(),
          houseId:      r.houseId as HouseId,
          // We can omit points or pass preview — context always recomputes
          points:       calcHousePoints(r.position, r.houseId, evt?.competitionType),
        }))
      );

      setEditingEventId(null);
      setEditingResults([]);
    } catch (error: any) {
      console.error('Save edit failed:', error);
      alert(`❌ Save failed: ${error.message || 'Unknown error'}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section id="results" className="relative py-14 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-sans-manrope font-extrabold tracking-[0.2em] text-[#FF5E84] uppercase bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/8 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>TROPHY &amp; COMPETITION RESULTS</span>
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
              placeholder="Search by name, event, house, section…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-black/12 text-xs sm:text-sm font-sans-manrope text-[#111111] shadow-xs focus:outline-none focus:border-[#FF5E84] focus:ring-2 focus:ring-[#FF5E84]/20"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {filterChips.map(chip => (
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

        {/* Results grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredGroups.length > 0 ? (
            filteredGroups.map(([eventId, placements]) => {
              const rep   = placements[0];
              const event = events.find(e => e.id === eventId);
              const compType = event?.competitionType;

              // Human-readable points scale badge for this event
              const pointsScale = compType === 'group'
                ? '20 / 15 / 10 pts'
                : '10 / 7 / 5 pts';

              return (
                <div
                  key={eventId}
                  className="bg-white rounded-[28px] border border-black/8 shadow-md flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lg"
                >
                  {/* Card header */}
                  <div className="px-5 pt-5 pb-3 border-b border-black/6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-sans-manrope font-extrabold text-[#5F5F5F] uppercase tracking-wider">
                          {rep.category}
                        </span>
                        <h3 className="font-serif-cormorant font-bold text-xl text-[#111111] leading-tight mt-0.5">
                          {rep.eventTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                        {isAdmin && editingEventId !== eventId && (
                          <button
                            onClick={() => handleStartEdit(eventId, placements)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-200 text-xs font-sans-manrope font-bold cursor-pointer transition-all duration-200 hover:scale-105 shadow-2xs"
                            title="Edit results — admin/developer only"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Points scale info pill */}
                    {event?.houseWise && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5F5F5F] bg-black/5 px-2 py-0.5 rounded-full">
                          <Info className="w-2.5 h-2.5" />
                          {compType === 'group' ? 'Group' : 'Individual'} · {pointsScale}
                          {event.teamSize ? ` · ${event.teamSize} members` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Placements */}
                  <div className="px-5 py-4 space-y-2.5 flex-1">
                    {editingEventId === eventId ? (
                      // ── EDIT MODE ──────────────────────────────────────────
                      <div className="space-y-3">
                        {/* Edit mode header */}
                        <div className="flex items-center justify-between pb-2 border-b border-black/8">
                          <span className="text-xs font-extrabold text-[#111111] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                            Editing Results
                          </span>
                          {event?.houseWise ? (
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {compType === 'group'
                                ? '🏆 Group: 20 / 15 / 10 pts'
                                : '🏅 Individual house: 10 / 7 / 5 pts'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                              📋 Marks-based — no house points
                            </span>
                          )}
                        </div>

                        {editingResults.map((row, idx) => {
                          // House-group events (Group Song / Patriotic Song / National Anthem):
                          // No student names needed — the whole house team participates
                          const isHouseGroupSong =
                            event?.houseWise &&
                            event?.category === 'House Item' &&
                            ['Group Song', 'Patriotic Song', 'National Anthem'].some(n =>
                              event?.eventName?.toLowerCase().includes(n.toLowerCase())
                            );
                          // True house-wise event (gives house points)
                          const isHouseEvent = event?.houseWise === true;

                          const previewPts = isHouseEvent
                            ? calcHousePoints(row.position, row.houseId, compType)
                            : 0;

                          return (
                            <div key={row.id || idx} className="p-3 rounded-xl bg-[#FAF8F5] border border-black/10 space-y-2">
                              {/* Row header */}
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-[#111111]">
                                  {MEDAL[row.position] || '🏅'} Position {idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePosition(idx)}
                                  className="w-5 h-5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center cursor-pointer transition-colors"
                                  title="Remove"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Fields */}
                              <div className={`grid ${isHouseGroupSong ? 'grid-cols-2' : isHouseEvent ? 'grid-cols-1 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'} gap-2`}>
                                {/* Position */}
                                <select
                                  value={row.position}
                                  onChange={e => handleUpdateField(idx, 'position', e.target.value)}
                                  style={{ colorScheme: 'light' }}
                                  className="px-2.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold text-[#111111] outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                  <option value="1st">🥇 1st Place</option>
                                  <option value="2nd">🥈 2nd Place</option>
                                  <option value="3rd">🥉 3rd Place</option>
                                  <option value="Consolation">🎖️ Consolation</option>
                                  <option value="Participation">🎗️ Participation</option>
                                </select>

                                {/* Student name — hidden for house group song events */}
                                {!isHouseGroupSong && (
                                  <input
                                    type="text"
                                    placeholder="Student Name"
                                    value={row.participantName}
                                    onChange={e => handleUpdateField(idx, 'participantName', e.target.value)}
                                    className="px-2.5 py-2 rounded-xl bg-white border border-black/10 text-xs text-[#111111] outline-none focus:ring-2 focus:ring-blue-500/20"
                                  />
                                )}

                                {/* Class */}
                                {!isHouseGroupSong && (
                                  <input
                                    type="text"
                                    placeholder="Class (e.g. 9A)"
                                    value={row.studentClass}
                                    onChange={e => handleUpdateField(idx, 'studentClass', e.target.value.toUpperCase())}
                                    className="px-2.5 py-2 rounded-xl bg-white border border-black/10 text-xs text-[#111111] outline-none focus:ring-2 focus:ring-blue-500/20"
                                  />
                                )}

                                {/* House dropdown — ONLY for house-wise events */}
                                {isHouseEvent ? (
                                  <select
                                    value={row.houseId}
                                    onChange={e => handleUpdateField(idx, 'houseId', e.target.value)}
                                    style={{ colorScheme: 'light' }}
                                    className="px-2.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold text-[#111111] outline-none focus:ring-2 focus:ring-blue-500/20"
                                  >
                                    {HOUSES.filter(h => h.value !== 'NONE').map(h => (
                                      <option key={h.value} value={h.value}>{h.label}</option>
                                    ))}
                                  </select>
                                ) : (
                                  // Non-house events: locked badge — no house, no points
                                  <div className="px-2.5 py-2 rounded-xl bg-gray-50 border border-black/10 text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    ⚪ Individual (no house)
                                  </div>
                                )}
                              </div>

                              {/* Points preview */}
                              <div className="flex items-center gap-2 text-[10px] font-semibold flex-wrap">
                                {isHouseEvent ? (
                                  <>
                                    <span className="text-[#5F5F5F]">House points awarded:</span>
                                    <span className={`font-extrabold ${previewPts > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                      +{previewPts} pts
                                    </span>
                                    {row.position === 'Consolation' && (
                                      <span className="text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[9px]">
                                        Recognition — no house points
                                      </span>
                                    )}
                                    {row.position === 'Participation' && (
                                      <span className="text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[9px]">
                                        Participation — no house points
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded text-[9px] font-bold">
                                    📋 Individual competition — ranked by marks, no house points
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Add position */}
                        <button
                          type="button"
                          onClick={handleAddPosition}
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-xs font-extrabold text-blue-600 bg-white hover:bg-blue-50 cursor-pointer transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Shared / Consolation Position
                        </button>

                        {/* Save / Cancel */}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={savingEdit}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                          >
                            {savingEdit ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving to Firebase…
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                Save Changes
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={savingEdit}
                            className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#111111] font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                    ) : (
                      // ── VIEW MODE ──────────────────────────────────────────
                      placements.map(p => {
                        const hInfo     = houseColors[p.houseId as HouseId] || houseColors.NOVA;
                        const isDeleting = deletingResultId === p.id;

                        return (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-black/5 hover:border-black/10 transition-all"
                          >
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xl">{MEDAL[p.position] || '🏅'}</span>
                              <span className="text-xs font-extrabold text-[#111111] bg-black/5 px-2 py-0.5 rounded-full">
                                {p.position}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-sans-manrope font-extrabold text-sm text-[#111111] truncate">
                                {p.participantName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {p.houseId !== 'NONE' && (
                                  <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: hInfo.lightBg, color: hInfo.text }}
                                  >
                                    {p.houseId}
                                  </span>
                                )}
                                {p.studentClass && (
                                  <span className="text-[10px] text-[#5F5F5F] font-semibold">{p.studentClass}</span>
                                )}
                              </div>
                            </div>

                            <span className="font-sans-manrope font-extrabold text-xs text-[#FF5E84] shrink-0">
                              {p.houseId !== 'NONE' && p.points > 0 ? `+${p.points} pts` : ''}
                            </span>

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteResult(p.id)}
                                disabled={isDeleting}
                                className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                                title="Delete this result"
                              >
                                {isDeleting
                                  ? <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  : <Trash2 className="w-3.5 h-3.5" />
                                }
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
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
