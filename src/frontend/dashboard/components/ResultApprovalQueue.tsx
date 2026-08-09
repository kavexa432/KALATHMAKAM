import React, { useState } from 'react';
import { Award, Plus, CheckCircle, Eye, Sparkles, AlertTriangle, Camera, ChevronDown, Lock } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';

const HOUSES: { value: HouseId | 'NONE'; label: string }[] = [
  { value: 'NOVA', label: '🔴 NOVA' },
  { value: 'VEGA', label: '🟡 VEGA' },
  { value: 'ORION', label: '🔵 ORION' },
  { value: 'ASTRA', label: '🟢 ASTRA' },
  { value: 'NONE', label: '⚪ No House (Individual)' },
];

interface PlacementRow {
  position: '1st' | '2nd' | '3rd';
  studentName: string;
  studentClass: string;
  houseId: HouseId | 'NONE';
}

export const ResultApprovalQueue: React.FC = () => {
  const { results, resultDrafts, events, publishEventWinners, verifyResult, publishResult } = useFestival();
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const selectedEvt = events.find((e) => e.id === selectedEventId);
  const compType = selectedEvt?.competitionType || 'individual';
  const isNonHouse = !selectedEvt?.houseWise;

  // Points based on competition type
  const getPoints = (pos: '1st' | '2nd' | '3rd') => {
    if (compType === 'group' || compType === 'team') {
      return pos === '1st' ? 20 : pos === '2nd' ? 15 : 10;
    }
    return pos === '1st' ? 10 : pos === '2nd' ? 7 : 5;
  };

  const defaultHouse = (isNonHouse: boolean): HouseId | 'NONE' => isNonHouse ? 'NONE' : 'NOVA';

  const [placements, setPlacements] = useState<PlacementRow[]>([
    { position: '1st', studentName: '', studentClass: '', houseId: 'NONE' },
    { position: '2nd', studentName: '', studentClass: '', houseId: 'NONE' },
    { position: '3rd', studentName: '', studentClass: '', houseId: 'NONE' },
  ]);

  const handleEventChange = (evtId: string) => {
    setSelectedEventId(evtId);
    const evt = events.find((e) => e.id === evtId);
    const nonHouse = !evt?.houseWise;
    setPlacements([
      { position: '1st', studentName: '', studentClass: '', houseId: defaultHouse(nonHouse) },
      { position: '2nd', studentName: '', studentClass: '', houseId: defaultHouse(nonHouse) },
      { position: '3rd', studentName: '', studentClass: '', houseId: defaultHouse(nonHouse) },
    ]);
  };

  const updatePlacement = (idx: number, field: keyof PlacementRow, value: string) => {
    setPlacements((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvt) return;

    const filled = placements.filter((p) => p.studentName.trim());
    if (filled.length === 0) return;

    setSubmitting(true);
    try {
      await publishEventWinners(
        selectedEvt.id,
        '',
        filled.map((p) => ({
          position: p.position,
          studentName: p.studentName.trim(),
          studentClass: p.studentClass.trim(),
          houseId: p.houseId as HouseId,
          points: getPoints(p.position),
        }))
      );
      setSuccessMsg(`✅ Results published for ${selectedEvt.eventName}!`);
      setSelectedEventId('');
      setPlacements([
        { position: '1st', studentName: '', studentClass: '', houseId: 'NONE' },
        { position: '2nd', studentName: '', studentClass: '', houseId: 'NONE' },
        { position: '3rd', studentName: '', studentClass: '', houseId: 'NONE' },
      ]);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert('Submit failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const MEDAL: Record<string, string> = { '1st': '🥇', '2nd': '🥈', '3rd': '🥉' };

  return (
    <div className="space-y-5 text-left">

      {/* ── PRIMARY: OCR Upload CTA ── */}
      <div className="bg-gradient-to-br from-[#111111] to-[#2B2B2B] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5E84]/20 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-[#FF5E84]" />
          </div>
          <div>
            <h4 className="font-sans-manrope font-extrabold text-sm text-white">Upload Result Sheet via OCR</h4>
            <p className="text-xs text-white/60 mt-0.5 font-sans-manrope">
              Snap a photo of the judge's sheet — Gemini AI extracts all placements automatically.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-scan-result'))}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-[#FF5E84] hover:bg-[#e84d72] text-white font-sans-manrope font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          Open OCR Scanner →
        </button>
      </div>

      {/* ── SECONDARY: Manual Entry (collapsible) ── */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-2xs overflow-hidden">
        <button
          onClick={() => setManualOpen(!manualOpen)}
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#5F5F5F]" />
            <span className="font-sans-manrope font-extrabold text-sm text-[#111111]">Manual Result Entry</span>
            <span className="text-[10px] font-bold text-[#5F5F5F] bg-black/6 px-2 py-0.5 rounded-full">Fallback option</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#5F5F5F] transition-transform duration-200 ${manualOpen ? 'rotate-180' : ''}`} />
        </button>

        {manualOpen && (
          <div className="px-5 pb-5 border-t border-black/6">
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">

              {/* Competition selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Competition</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope text-[#111111]"
                  style={{ colorScheme: 'light' }}
                  required
                >
                  <option value="" disabled className="bg-white text-[#111111]">-- Select Competition --</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id} className="bg-white text-[#111111]">{e.eventName}</option>
                  ))}
                </select>
                {selectedEvt && (
                  <p className="text-[10px] text-[#5F5F5F] mt-1">
                    {selectedEvt.category}
                    {selectedEvt.competitionType && (
                      <span className="ml-2 text-[#FF5E84] font-bold">
                        ({compType === 'group' ? 'Group: 20/15/10 pts' : compType === 'team' ? 'Team: 20/15/10 pts' : 'Individual: 10/7/5 pts'})
                      </span>
                    )}
                    {isNonHouse && <span className="ml-2 text-amber-600 font-bold">· Non-house event</span>}
                  </p>
                )}
              </div>

              {/* 3-position rows */}
              <div className="space-y-3">
                {placements.map((row, idx) => (
                  <div key={row.position} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-black/8 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{MEDAL[row.position]}</span>
                      <span className="font-sans-manrope font-extrabold text-xs text-[#111111]">
                        {row.position === '1st' ? '1st Place' : row.position === '2nd' ? '2nd Place' : '3rd Place'}
                      </span>
                      <span className="ml-auto text-[10px] font-bold text-[#FF5E84]">
                        <Lock className="w-2.5 h-2.5 inline mr-0.5" />+{getPoints(row.position)} pts
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Student Name"
                        value={row.studentName}
                        onChange={(e) => updatePlacement(idx, 'studentName', e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope text-[#111111]"
                      />
                      <input
                        type="text"
                        placeholder="Class (e.g. 9A)"
                        value={row.studentClass}
                        onChange={(e) => updatePlacement(idx, 'studentClass', e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope text-[#111111]"
                      />
                      <select
                        value={row.houseId}
                        onChange={(e) => updatePlacement(idx, 'houseId', e.target.value)}
                        disabled={isNonHouse}
                        className="px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope font-bold text-[#111111] disabled:opacity-50"
                        style={{ colorScheme: 'light' }}
                      >
                        {HOUSES.map((h) => (
                          <option key={h.value} value={h.value} className="bg-white text-[#111111]">{h.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  {successMsg}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!selectedEventId || submitting}
                  className="px-6 py-2.5 rounded-xl gradient-btn-primary text-white font-sans-manrope font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish All Results →'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── OCR Drafts Queue ── */}
      {resultDrafts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber-400/30 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-500" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">OCR Drafts Awaiting Review</h4>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">{resultDrafts.length} pending</span>
          </div>
          <div className="space-y-2">
            {resultDrafts.map((draft) => {
              const hasLowConf = draft.results.some(r => r.confidence === 'low' || r.confidence === 'medium');
              return (
                <div key={draft.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-black/6">
                  <div className="min-w-0">
                    <p className="font-sans-manrope font-bold text-xs text-[#111111] truncate">{draft.eventName}</p>
                    <p className="text-[11px] text-[#5F5F5F] mt-0.5">{draft.results.length} placement{draft.results.length !== 1 ? 's' : ''} extracted</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasLowConf ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Needs Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Ready
                      </span>
                    )}
                    <button
                      className="px-3.5 py-1.5 rounded-xl bg-[#111111] text-white font-bold text-[11px] cursor-pointer hover:bg-black transition-colors"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-ocr-review', { detail: { draftId: draft.id } }))}
                    >Review →</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Results Queue ── */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/6">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F59E0B]" />
            <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">Results Queue</h4>
          </div>
          <span className="text-xs text-[#5F5F5F] font-bold">{results.length} total</span>
        </div>
        {results.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#5F5F5F] font-sans-manrope text-xs">
            No results submitted yet. Use the OCR scanner or manual entry above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans-manrope border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#5F5F5F] uppercase text-[10px] font-extrabold">
                  <th className="py-2.5 px-4">Event</th>
                  <th className="py-2.5 px-4">Participant</th>
                  <th className="py-2.5 px-4">House</th>
                  <th className="py-2.5 px-4">Position</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {results.map((r) => {
                  const hInfo = houseColors[r.houseId as HouseId];
                  return (
                    <tr key={r.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-bold text-[#111111]">{r.eventTitle}</td>
                      <td className="py-3 px-4 text-[#333]">{r.participantName}</td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: hInfo?.lightBg, color: hInfo?.text }}>
                          {r.houseId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold">{r.position} <span className="text-[#FF5E84]">+{r.points}pts</span></td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Verified' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{r.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {r.status === 'Pending Review' && (
                          <button onClick={() => verifyResult(r.id)}
                            className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] cursor-pointer">
                            <Eye className="w-3 h-3 inline mr-1" />Verify
                          </button>
                        )}
                        {r.status !== 'Published' && (
                          <button onClick={() => publishResult(r.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] cursor-pointer">
                            <CheckCircle className="w-3 h-3 inline mr-1" />Publish
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
