import React, { useEffect, useState } from 'react';
import { Award, Plus, CheckCircle, Eye, Sparkles, AlertTriangle, Camera, ChevronDown, Lock } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';

type ManualPlacement = {
  position: '1st' | '2nd' | '3rd';
  participantName: string;
  studentClass: string;
  houseId: HouseId;
};

const emptyPlacements = (houseId: HouseId): ManualPlacement[] => [
  { position: '1st', participantName: '', studentClass: '', houseId },
  { position: '2nd', participantName: '', studentClass: '', houseId },
  { position: '3rd', participantName: '', studentClass: '', houseId },
];

export const ResultApprovalQueue: React.FC = () => {
  const { results, resultDrafts, events, submitResult, verifyResult, publishResult } = useFestival();
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [category, setCategory] = useState(events[0]?.category || 'General');
  const [placements, setPlacements] = useState<ManualPlacement[]>(emptyPlacements('NOVA'));

  const selectedEvt = events.find((e) => e.id === selectedEventId);
  const isHouseEvent = selectedEvt?.houseWise === true;
  const compType = selectedEvt?.competitionType || 'individual';

  useEffect(() => {
    if (!selectedEvt) return;
    setCategory(selectedEvt.category || 'General');
    setPlacements((prev) =>
      prev.map((p) => ({
        ...p,
        houseId: selectedEvt.houseWise ? (p.houseId === 'NONE' ? 'NOVA' : p.houseId) : 'NONE',
      }))
    );
  }, [selectedEvt?.id, selectedEvt?.houseWise]);

  const getPoints = (position: string, houseId: HouseId) => {
    if (houseId === 'NONE' || !isHouseEvent) return 0;
    if (compType === 'group' || compType === 'team') {
      return position === '1st' ? 20 : position === '2nd' ? 15 : position === '3rd' ? 10 : 0;
    }
    return position === '1st' ? 10 : position === '2nd' ? 7 : position === '3rd' ? 5 : 0;
  };

  const updatePlacement = (
    index: number,
    field: 'participantName' | 'studentClass' | 'houseId',
    value: string
  ) => {
    setPlacements((prev) =>
      prev.map((p, idx) =>
        idx === index ? { ...p, [field]: field === 'houseId' ? (value as HouseId) : value } : p
      )
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvt) return;

    const filledPlacements = placements.map((p) => ({
      ...p,
      participantName: p.participantName.trim(),
      studentClass: p.studentClass.trim(),
      houseId: isHouseEvent ? p.houseId : ('NONE' as HouseId),
    }));

    if (filledPlacements.some((p) => !p.participantName)) {
      alert('Please enter names for 1st, 2nd, and 3rd positions.');
      return;
    }

    filledPlacements.forEach((p) => {
      submitResult({
        festivalId: '2k26',
        eventId: selectedEvt.id,
        eventTitle: selectedEvt.eventName,
        category,
        position: p.position,
        points: getPoints(p.position, p.houseId),
        houseId: p.houseId,
        houseName: p.houseId === 'NONE' ? 'Non-House / Individual' : p.houseId,
        participantName: p.participantName,
        studentClass: p.studentClass,
      });
    });

    setPlacements(emptyPlacements(isHouseEvent ? 'NOVA' : 'NONE'));
  };

  return (
    <div className="space-y-5 text-left">
      <div className="bg-gradient-to-br from-[#111111] to-[#2B2B2B] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5E84]/20 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-[#FF5E84]" />
          </div>
          <div>
            <h4 className="font-sans-manrope font-extrabold text-sm text-white">Upload Result Sheet via OCR</h4>
            <p className="text-xs text-white/60 mt-0.5 font-sans-manrope">
              Snap a photo of the judge's sheet. Gemini AI extracts all placements automatically.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const el = document.getElementById('scan-result-tab');
            if (el) el.click();
            else window.dispatchEvent(new CustomEvent('open-scan-result'));
          }}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-[#FF5E84] hover:bg-[#e84d72] text-white font-sans-manrope font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          Open OCR Scanner
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/8 shadow-2xs overflow-hidden">
        <button
          onClick={() => setManualOpen(!manualOpen)}
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#5F5F5F]" />
            <span className="font-sans-manrope font-extrabold text-sm text-[#111111]">Manual Result Entry</span>
            <span className="text-[10px] font-bold text-[#5F5F5F] bg-black/6 px-2 py-0.5 rounded-full">
              3 positions at once
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#5F5F5F] transition-transform duration-200 ${manualOpen ? 'rotate-180' : ''}`} />
        </button>

        {manualOpen && (
          <div className="px-5 pb-5 border-t border-black/6">
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Competition</label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope text-[#111111]"
                    style={{ colorScheme: 'light' }}
                  >
                    <option value="" disabled className="bg-white text-[#111111]">-- Select Competition --</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id} className="bg-white text-[#111111]">
                        {e.eventName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Category</label>
                  <div className="px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope text-[#111111] font-bold">
                    {category || '-'}
                    {selectedEvt?.competitionType && (
                      <span className="ml-2 text-[10px] text-[#FF5E84] font-bold">
                        {isHouseEvent
                          ? `(${compType === 'individual' ? 'Individual: 10/7/5 pts' : 'Team/Group: 20/15/10 pts'})`
                          : '(Non-house: 0 pts)'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="hidden md:grid grid-cols-[96px_1fr_120px_180px_110px] gap-2 px-1">
                  <span className="text-[10px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Position</span>
                  <span className="text-[10px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Name</span>
                  <span className="text-[10px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Class</span>
                  <span className="text-[10px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">House</span>
                  <span className="text-[10px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Points</span>
                </div>

                {placements.map((entry, index) => {
                  const entryHouseId = isHouseEvent ? entry.houseId : 'NONE';
                  const pointsPreview = getPoints(entry.position, entryHouseId);

                  return (
                    <div
                      key={entry.position}
                      className="grid grid-cols-1 md:grid-cols-[96px_1fr_120px_180px_110px] gap-2 p-3 md:p-0 rounded-xl md:rounded-none bg-[#FAF8F5] md:bg-transparent border border-black/8 md:border-0"
                    >
                      <div className="px-3 py-2.5 rounded-xl bg-white md:bg-[#FAF8F5] border border-black/10 text-xs font-extrabold text-[#111111]">
                        {entry.position} Place
                      </div>
                      <input
                        type="text"
                        required
                        placeholder={`${entry.position} place winner`}
                        value={entry.participantName}
                        onChange={(e) => updatePlacement(index, 'participantName', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white md:bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope text-[#111111]"
                      />
                      <input
                        type="text"
                        placeholder="e.g. 9A"
                        value={entry.studentClass}
                        onChange={(e) => updatePlacement(index, 'studentClass', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white md:bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope text-[#111111]"
                      />
                      <select
                        value={entryHouseId}
                        disabled={!isHouseEvent}
                        onChange={(e) => updatePlacement(index, 'houseId', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white md:bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold text-[#111111] disabled:text-[#5F5F5F] disabled:bg-black/5"
                        style={{ colorScheme: 'light' }}
                      >
                        <option value="NOVA" className="bg-white text-[#111111]">NOVA</option>
                        <option value="VEGA" className="bg-white text-[#111111]">VEGA</option>
                        <option value="ORION" className="bg-white text-[#111111]">ORION</option>
                        <option value="ASTRA" className="bg-white text-[#111111]">ASTRA</option>
                        <option value="NONE" className="bg-white text-[#111111]">Non-House / Individual</option>
                      </select>
                      <div className="px-3 py-2.5 rounded-xl bg-black/5 border border-black/10 text-xs font-extrabold text-[#111111] flex items-center justify-between">
                        <span>+{pointsPreview} pts</span>
                        <Lock className="w-3 h-3 text-black/30" />
                      </div>
                    </div>
                  );
                })}

                {!isHouseEvent && (
                  <p className="text-[11px] text-[#5F5F5F] font-sans-manrope font-bold">
                    This is a non-house item, so every position is saved as Non-House / Individual with 0 house points.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl gradient-btn-primary text-white font-sans-manrope font-bold text-xs cursor-pointer shadow-xs"
                >
                  Submit All 3 Positions
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {resultDrafts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber-400/30 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-500" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">OCR Drafts Awaiting Review</h4>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">
              {resultDrafts.length} pending
            </span>
          </div>

          <div className="space-y-2">
            {resultDrafts.map((draft) => {
              const hasLowConf = draft.results.some((r) => r.confidence === 'low' || r.confidence === 'medium');
              return (
                <div key={draft.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-black/6">
                  <div className="min-w-0">
                    <p className="font-sans-manrope font-bold text-xs text-[#111111] truncate">{draft.eventName}</p>
                    <p className="text-[11px] text-[#5F5F5F] mt-0.5">
                      {draft.results.length} placement{draft.results.length !== 1 ? 's' : ''} extracted
                    </p>
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
                    >
                      Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                        <span
                          className="font-extrabold text-[10px] px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: hInfo?.lightBg || '#F4F4F4', color: hInfo?.text || '#333' }}
                        >
                          {r.houseId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold">
                        {r.position} <span className="text-[#FF5E84]">+{r.points}pts</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Verified' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {r.status === 'Pending Review' && (
                          <button
                            onClick={() => verifyResult(r.id)}
                            className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] cursor-pointer"
                          >
                            <Eye className="w-3 h-3 inline mr-1" />Verify
                          </button>
                        )}
                        {r.status !== 'Published' && (
                          <button
                            onClick={() => publishResult(r.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] cursor-pointer"
                          >
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
