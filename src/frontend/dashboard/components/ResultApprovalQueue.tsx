import React, { useState } from 'react';
import { Award, Plus, CheckCircle, Eye } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';

export const ResultApprovalQueue: React.FC = () => {
  const { results, events, submitResult, verifyResult, publishResult } = useFestival();
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [participantName, setParticipantName] = useState('');
  const [studentClass] = useState('Class 12-A');
  const [houseId, setHouseId] = useState<HouseId>('NOVA');
  const [position, setPosition] = useState<'1st' | '2nd' | '3rd' | 'Participation'>('1st');

  const selectedEvt = events.find((e) => e.id === selectedEventId);

  const getPoints = (pos: string) => {
    switch (pos) {
      case '1st': return 10;
      case '2nd': return 8;
      case '3rd': return 6;
      default: return 4;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvt || !participantName) return;

    submitResult({
      festivalId: '2k26',
      eventId: selectedEvt.id,
      eventTitle: selectedEvt.eventName,
      category: selectedEvt.category,
      position,
      points: getPoints(position),
      houseId,
      houseName: houseId,
      participantName,
      studentClass,
    });

    setParticipantName('');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Submit New Result Form */}
      <div className="bg-white rounded-2xl p-6 border border-black/8 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-black/6">
          <Plus className="w-4 h-4 text-[#FF5E84]" />
          <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider">
            SUBMIT NEW COMPETITION RESULT (ADMIN WORKFLOW)
          </h4>
        </div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#111111]">Select Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.eventName} ({e.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#111111]">Participant Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Adithya R. Nair"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#111111]">House</label>
            <select
              value={houseId}
              onChange={(e) => setHouseId(e.target.value as HouseId)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
            >
              <option value="NOVA">🔴 NOVA (Red)</option>
              <option value="VEGA">🟡 VEGA (Yellow)</option>
              <option value="ORION">🔵 ORION (Blue)</option>
              <option value="ASTRA">🟢 ASTRA (Green)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#111111]">Position & Points</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
            >
              <option value="1st">🥇 1st Place (+10 Pts)</option>
              <option value="2nd">🥈 2nd Place (+8 Pts)</option>
              <option value="3rd">🥉 3rd Place (+6 Pts)</option>
              <option value="Participation">🏅 Participation (+4 Pts)</option>
            </select>
          </div>

          <div className="col-span-full pt-2 text-right">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full gradient-btn-primary text-white font-sans-manrope font-bold text-xs cursor-pointer shadow-xs"
            >
              Submit to Pending Queue →
            </button>
          </div>
        </form>
      </div>

      {/* Result Workflow Approval Table */}
      <div className="bg-white rounded-2xl p-6 border border-black/8 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/6">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F59E0B]" />
            <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider">
              PENDING REVIEW & APPROVAL WORKFLOW QUEUE
            </h4>
          </div>
          <span className="text-xs text-[#5F5F5F] font-bold">
            Total Results: {results.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans-manrope border-collapse">
            <thead>
              <tr className="border-b border-black/8 text-[#5F5F5F] uppercase text-[10px] font-extrabold">
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Participant</th>
                <th className="py-2.5 px-3">House</th>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {results.map((r) => {
                const hInfo = houseColors[r.houseId as HouseId];

                return (
                  <tr key={r.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-bold text-[#111111]">{r.eventTitle}</td>
                    <td className="py-3 px-3">{r.participantName}</td>
                    <td className="py-3 px-3">
                      <span
                        className="font-extrabold text-[10px] px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: hInfo.lightBg, color: hInfo.text }}
                      >
                        {r.houseId}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-extrabold">{r.position} (+{r.points} Pts)</td>
                    <td className="py-3 px-3">
                      {r.status === 'Published' && (
                        <span className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Published
                        </span>
                      )}
                      {r.status === 'Verified' && (
                        <span className="bg-blue-500/15 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                      {r.status === 'Pending Review' && (
                        <span className="bg-amber-500/15 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {r.status === 'Pending Review' && (
                        <button
                          onClick={() => verifyResult(r.id)}
                          className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          Verify
                        </button>
                      )}
                      {r.status !== 'Published' && (
                        <button
                          onClick={() => publishResult(r.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Publish to Website
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
