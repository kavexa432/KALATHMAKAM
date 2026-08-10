import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Trophy,
  Users,
  Clock,
  MapPin,
  Award,
} from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import type { EventModel, HouseId } from '../../../shared/types/festivalTypes';

interface EventQuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventModel | null;
  initialTab?: 'ocr' | 'manual';
}

export const EventQuickActionModal: React.FC<EventQuickActionModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { publishEventWinners } = useFestival();
  const isHouseItem = event?.category === 'House Item';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Judge & Remarks
  const [judgeName, setJudgeName] = useState('');

  // Winner 1
  const [w1Name, setW1Name] = useState('');
  const [w1Class, setW1Class] = useState('');
  const [w1House, setW1House] = useState<HouseId>('NOVA');
  const [w1Points] = useState<number>(10);

  // Winner 2
  const [w2Name, setW2Name] = useState('');
  const [w2Class, setW2Class] = useState('');
  const [w2House, setW2House] = useState<HouseId>('VEGA');
  const [w2Points] = useState<number>(7);
  const [shared2nd, setShared2nd] = useState(false);
  const [w2bName, setW2bName] = useState('');
  const [w2bClass, setW2bClass] = useState('');
  const [w2bHouse, setW2bHouse] = useState<HouseId>('NOVA');

  // Winner 3
  const [w3Name, setW3Name] = useState('');
  const [w3Class, setW3Class] = useState('');
  const [w3House, setW3House] = useState<HouseId>('ORION');
  const [w3Points] = useState<number>(5);
  const [shared3rd, setShared3rd] = useState(false);
  const [w3bName, setW3bName] = useState('');
  const [w3bClass, setW3bClass] = useState('');
  const [w3bHouse, setW3bHouse] = useState<HouseId>('ASTRA');

  // Reset form when event changes
  useEffect(() => {
    if (!event) return;
    setSuccessMsg('');
    setW1Name(''); setW1Class('');
    setW2Name(''); setW2Class('');
    setShared2nd(false); setW2bName(''); setW2bClass('');
    setW3Name(''); setW3Class('');
    setShared3rd(false); setW3bName(''); setW3bClass('');
    setJudgeName('');
  }, [event]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const handlePublishWinners = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isHouseItem) {
      if (w1House === 'NONE' && w2House === 'NONE' && w3House === 'NONE') {
        alert('Please select a house for at least one winner.');
        return;
      }
    } else {
      if (!w1Name && !w2Name && !w3Name) {
        alert('Please enter at least the 1st place winner details.');
        return;
      }
    }

    setIsSubmitting(true);
    setSuccessMsg('');

    const winnersPayload: Array<{
      position: '1st' | '2nd' | '3rd';
      studentName: string;
      studentClass: string;
      houseId: HouseId;
      points: number;
    }> = [];

    const getName = (name: string, house: string) => name || (isHouseItem ? `${house} House Team` : name);

    if (w1Name || (isHouseItem && w1House !== 'NONE')) winnersPayload.push({ position: '1st', studentName: getName(w1Name, w1House), studentClass: w1Class, houseId: w1House, points: Number(w1Points) || 10 });
    if (w2Name || (isHouseItem && w2House !== 'NONE')) winnersPayload.push({ position: '2nd', studentName: getName(w2Name, w2House), studentClass: w2Class, houseId: w2House, points: Number(w2Points) || 7 });
    if (shared2nd && (w2bName || (isHouseItem && w2bHouse !== 'NONE'))) winnersPayload.push({ position: '2nd', studentName: getName(w2bName, w2bHouse), studentClass: w2bClass, houseId: w2bHouse, points: Number(w2Points) || 7 });
    if (w3Name || (isHouseItem && w3House !== 'NONE')) winnersPayload.push({ position: '3rd', studentName: getName(w3Name, w3House), studentClass: w3Class, houseId: w3House, points: Number(w3Points) || 5 });
    if (shared3rd && (w3bName || (isHouseItem && w3bHouse !== 'NONE'))) winnersPayload.push({ position: '3rd', studentName: getName(w3bName, w3bHouse), studentClass: w3bClass, houseId: w3bHouse, points: Number(w3Points) || 5 });

    try {
      await publishEventWinners(event.id, judgeName, winnersPayload);
      setSuccessMsg(`Results for ${event.eventName} published live! House points updated.`);
      setTimeout(() => { setIsSubmitting(false); onClose(); }, 1500);
    } catch {
      setIsSubmitting(false);
      alert('Failed to publish results. Please try again.');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] rounded-[28px] sm:rounded-[32px] max-w-2xl w-full overflow-hidden shadow-2xl border border-black/10 relative text-left my-auto cursor-default"
      >

        {/* Header */}
        <div className="p-5 sm:p-7 bg-gradient-to-r from-[#111111] to-[#2B2B2B] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5E84] to-[#F59E0B] p-[2px] shrink-0">
              <div className="w-full h-full bg-[#111111] rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#FF5E84]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans-manrope font-extrabold uppercase bg-white/15 text-white/90">
                  {event.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans-manrope font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {event.status || 'Running'}
                </span>
              </div>
              <h3 className="font-serif-cormorant font-bold text-2xl sm:text-3xl text-white leading-tight">
                {event.eventName}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans-manrope text-white/70">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5E84]" />
                  {event.venue || 'Main Auditorium'} ({event.stage || 'Stage 1'})
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                  {event.scheduledStartTime || '09:15 AM'}
                </span>
                {event.participantsExpected && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    {event.participantsExpected} Participants
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans-manrope font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handlePublishWinners} className="space-y-4">

            {/* Judge Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#111111]">Judge Name / Panel Remarks <span className="text-[#5F5F5F] font-normal">(optional)</span></label>
              <input
                type="text"
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
                placeholder="e.g. Prof. S. Ramesh (Kerala Sangeetha Nataka Akademi)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope font-semibold"
              />
            </div>

            {/* 1st Place */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-sans-manrope font-extrabold text-xs inline-flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> 1st Place Winner
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">+{w1Points} pts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-sans-manrope text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#111111] mb-1">{isHouseItem ? 'Participant(s) (Optional)' : 'Student Name'}</label>
                  <input type="text" required={!isHouseItem} placeholder={isHouseItem ? 'Leave blank for team' : 'Student Name'} value={w1Name} onChange={(e) => setW1Name(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#111111] mb-1">Class</label>
                  <input type="text" placeholder="e.g. 9A" value={w1Class} onChange={(e) => setW1Class(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#111111] mb-1">House</label>
                  <select value={w1House} onChange={(e) => setW1House(e.target.value as HouseId)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]">
                    <option value="NOVA">🔴 NOVA</option>
                    <option value="VEGA">🟡 VEGA</option>
                    <option value="ORION">🔵 ORION</option>
                    <option value="ASTRA">🟢 ASTRA</option>
                    <option value="NONE">⚪ No House</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2nd Place */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-300 text-slate-800 font-sans-manrope font-extrabold text-xs inline-flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> 2nd Place Winner
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full">+{w2Points} pts</span>
                  <button type="button" onClick={() => setShared2nd((v) => !v)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer ${
                      shared2nd ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-[#FAF8F5] text-[#5F5F5F] border-black/10 hover:bg-blue-50 hover:text-blue-700'
                    }`}>
                    {shared2nd ? '✓ Shared 2nd' : '+ Shared 2nd'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-sans-manrope text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#111111] mb-1">{isHouseItem ? 'Participant(s) (Optional)' : 'Student Name'}</label>
                  <input type="text" placeholder={isHouseItem ? 'Leave blank for team' : 'Student Name'} value={w2Name} onChange={(e) => setW2Name(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#111111] mb-1">Class</label>
                  <input type="text" placeholder="e.g. 9A" value={w2Class} onChange={(e) => setW2Class(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#111111] mb-1">House</label>
                  <select value={w2House} onChange={(e) => setW2House(e.target.value as HouseId)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]">
                    <option value="VEGA">🟡 VEGA</option>
                    <option value="NOVA">🔴 NOVA</option>
                    <option value="ORION">🔵 ORION</option>
                    <option value="ASTRA">🟢 ASTRA</option>
                    <option value="NONE">⚪ No House</option>
                  </select>
                </div>
              </div>
              {shared2nd && (
                <div className="pt-3 border-t border-blue-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Shared 2nd — Second Student</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-sans-manrope text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">{isHouseItem ? 'Participant(s) (Optional)' : 'Student Name'}</label>
                      <input type="text" placeholder={isHouseItem ? 'Leave blank for team' : 'Student Name'} value={w2bName} onChange={(e) => setW2bName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#111111]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">Class</label>
                      <input type="text" placeholder="e.g. 9A" value={w2bClass} onChange={(e) => setW2bClass(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">House</label>
                      <select value={w2bHouse} onChange={(e) => setW2bHouse(e.target.value as HouseId)}
                        className="w-full px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#111111]">
                        <option value="NOVA">🔴 NOVA</option>
                        <option value="VEGA">🟡 VEGA</option>
                        <option value="ORION">🔵 ORION</option>
                        <option value="ASTRA">🟢 ASTRA</option>
                        <option value="NONE">⚪ No House</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3rd Place */}
            <div className="p-4 rounded-2xl bg-white border border-amber-900/10 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-sans-manrope font-extrabold text-xs inline-flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> 3rd Place Winner
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">+{w3Points} pts</span>
                  <button type="button" onClick={() => setShared3rd((v) => !v)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer ${
                      shared3rd ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-[#FAF8F5] text-[#5F5F5F] border-black/10 hover:bg-orange-50 hover:text-orange-700'
                    }`}>
                    {shared3rd ? '✓ Shared 3rd' : '+ Shared 3rd'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-sans-manrope text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#111111] mb-1">{isHouseItem ? 'Participant(s) (Optional)' : 'Student Name'}</label>
                  <input type="text" placeholder={isHouseItem ? 'Leave blank for team' : 'Student Name'} value={w3Name} onChange={(e) => setW3Name(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#111111] mb-1">Class</label>
                  <input type="text" placeholder="e.g. 9A" value={w3Class} onChange={(e) => setW3Class(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#111111] mb-1">House</label>
                  <select value={w3House} onChange={(e) => setW3House(e.target.value as HouseId)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]">
                    <option value="ORION">🔵 ORION</option>
                    <option value="NOVA">🔴 NOVA</option>
                    <option value="VEGA">🟡 VEGA</option>
                    <option value="ASTRA">🟢 ASTRA</option>
                    <option value="NONE">⚪ No House</option>
                  </select>
                </div>
              </div>
              {shared3rd && (
                <div className="pt-3 border-t border-orange-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-orange-700 uppercase tracking-wider">Shared 3rd — Second Student</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-sans-manrope text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">{isHouseItem ? 'Participant(s) (Optional)' : 'Student Name'}</label>
                      <input type="text" placeholder={isHouseItem ? 'Leave blank for team' : 'Student Name'} value={w3bName} onChange={(e) => setW3bName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-[#111111]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">Class</label>
                      <input type="text" placeholder="e.g. 9A" value={w3bClass} onChange={(e) => setW3bClass(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">House</label>
                      <select value={w3bHouse} onChange={(e) => setW3bHouse(e.target.value as HouseId)}
                        className="w-full px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-[#111111]">
                        <option value="ASTRA">🟢 ASTRA</option>
                        <option value="NOVA">🔴 NOVA</option>
                        <option value="VEGA">🟡 VEGA</option>
                        <option value="ORION">🔵 ORION</option>
                        <option value="NONE">⚪ No House</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/8">
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-black/5 border border-black/10 text-[#5F5F5F] font-sans-manrope font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md cursor-pointer hover:scale-102 transition-all disabled:opacity-70">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Winners →</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
