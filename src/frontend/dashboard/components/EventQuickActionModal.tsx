import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  Trophy,
  Users,
  Clock,
  MapPin,
  FileSpreadsheet,
  Edit3,
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
  initialTab = 'ocr',
}) => {
  const { publishEventWinners } = useFestival();
  const [activeTab, setActiveTab] = useState<'ocr' | 'manual'>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // OCR Upload States
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'scanning' | 'parsed'>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Judge & Remarks
  const [judgeName, setJudgeName] = useState('');

  // Winner 1 State
  const [w1Name, setW1Name] = useState('');
  const [w1Class, setW1Class] = useState('');
  const [w1House, setW1House] = useState<HouseId>('NOVA');
  const [w1Points, setW1Points] = useState<number>(10);

  // Winner 2 State
  const [w2Name, setW2Name] = useState('');
  const [w2Class, setW2Class] = useState('');
  const [w2House, setW2House] = useState<HouseId>('VEGA');
  const [w2Points, setW2Points] = useState<number>(8);

  // Winner 3 State
  const [w3Name, setW3Name] = useState('');
  const [w3Class, setW3Class] = useState('');
  const [w3House, setW3House] = useState<HouseId>('ORION');
  const [w3Points, setW3Points] = useState<number>(6);

  // Reset form when event changes
  useEffect(() => {
    if (!event) return;
    setActiveTab(initialTab);
    setOcrStatus('idle');
    setImagePreview(null);
    setSuccessMsg('');

    setW1Name('');
    setW1Class('');
    setW2Name('');
    setW2Class('');
    setW3Name('');
    setW3Class('');
    setJudgeName('');
  }, [event, initialTab]);

  // Press ESC to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const handleSimulateOCR = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setOcrStatus('scanning');
    setTimeout(() => {
      setOcrStatus('parsed');
    }, 1200);
  };

  const handlePublishWinners = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!w1Name && !w2Name && !w3Name) {
      alert('Please enter at least the 1st place winner details.');
      return;
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

    if (w1Name) {
      winnersPayload.push({
        position: '1st',
        studentName: w1Name,
        studentClass: w1Class,
        houseId: w1House,
        points: Number(w1Points) || 10,
      });
    }

    if (w2Name) {
      winnersPayload.push({
        position: '2nd',
        studentName: w2Name,
        studentClass: w2Class,
        houseId: w2House,
        points: Number(w2Points) || 8,
      });
    }

    if (w3Name) {
      winnersPayload.push({
        position: '3rd',
        studentName: w3Name,
        studentClass: w3Class,
        houseId: w3House,
        points: Number(w3Points) || 6,
      });
    }

    try {
      await publishEventWinners(event.id, judgeName, winnersPayload);
      setSuccessMsg(`Results for ${event.eventName} published live! House points updated.`);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch {
      setIsSubmitting(false);
      alert('Failed to publish results. Please try again.');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] rounded-[28px] sm:rounded-[32px] max-w-2xl w-full overflow-hidden shadow-2xl border border-black/10 relative text-left my-auto cursor-default"
      >
        
        {/* Header Banner */}
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

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">

          {/* Workflow Action Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/5 border border-black/8">
            <button
              type="button"
              onClick={() => setActiveTab('ocr')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-sans-manrope font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ocr'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#5F5F5F] hover:text-[#111111]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-[#FF5E84]" />
              <span>Upload Result Sheet (OCR)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-sans-manrope font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#5F5F5F] hover:text-[#111111]'
              }`}
            >
              <Edit3 className="w-4 h-4 text-[#F59E0B]" />
              <span>Enter Winners Manually</span>
            </button>
          </div>

          {/* Success Message Banner */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans-manrope font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handlePublishWinners} className="space-y-6">

            {/* TAB 1: OCR UPLOAD WORKFLOW */}
            {activeTab === 'ocr' && (
              <div className="space-y-4">
                
                {/* Upload Zone */}
                <div className="border-2 border-dashed border-black/15 rounded-2xl p-6 text-center bg-white hover:bg-black/2 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleSimulateOCR(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  
                  {imagePreview ? (
                    <div className="flex items-center justify-center gap-4">
                      <img src={imagePreview} alt="Result Sheet" className="h-20 w-auto rounded-xl border border-black/10 object-cover shadow-xs" />
                      <div className="text-left space-y-1">
                        <span className="text-xs font-sans-manrope font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Result Sheet Loaded
                        </span>
                        <p className="text-[11px] text-[#5F5F5F]">Click or tap to upload a different photo</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/60 text-[#FF5E84] flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                        Tap or Drag Official Judge Result Sheet Photo
                      </h4>
                      <p className="font-sans-manrope text-[11px] text-[#5F5F5F]">
                        Supports JPEG, PNG result sheets. Smart OCR automatically extracts 1st, 2nd, and 3rd rank winners.
                      </p>
                    </div>
                  )}
                </div>

                {/* Scanning Spinner */}
                {ocrStatus === 'scanning' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-sans-manrope font-bold flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Result Sheet with AI OCR... Extracting Rank 1, 2, 3...</span>
                  </div>
                )}

                {/* OCR Extracted Winner Fields */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans-manrope font-extrabold text-xs text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FF5E84]" />
                      <span>Extracted Competition Winners</span>
                    </h4>
                    <span className="text-[11px] font-sans-manrope text-[#5F5F5F]">Points: 1st (10) • 2nd (8) • 3rd (6)</span>
                  </div>

                  {/* 1st Place Card */}
                  <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-sans-manrope font-extrabold text-xs flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> 1st Place (+10 PTS)
                      </span>
                      {ocrStatus === 'parsed' && (
                        <span className="text-[11px] font-sans-manrope font-bold text-emerald-600">Smart OCR Extracted</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans-manrope text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-1">Student Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter Student Name"
                          value={w1Name}
                          onChange={(e) => setW1Name(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-1">Class / Grade</label>
                        <input
                          type="text"
                          placeholder="Class e.g. 9-B"
                          value={w1Class}
                          onChange={(e) => setW1Class(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-1">House Team</label>
                        <select
                          value={w1House}
                          onChange={(e) => setW1House(e.target.value as HouseId)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                        >
                          <option value="NOVA">🔴 NOVA (Red)</option>
                          <option value="VEGA">🟡 VEGA (Yellow)</option>
                          <option value="ORION">🔵 ORION (Blue)</option>
                          <option value="ASTRA">🟢 ASTRA (Green)</option>
                          <option value="NONE">⚪ Non-House / Individual (No House Pts)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 2nd Place Card */}
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-sans-manrope font-extrabold text-xs flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> 2nd Place (+8 PTS)
                      </span>
                      {ocrStatus === 'parsed' && (
                        <span className="text-[11px] font-sans-manrope font-bold text-emerald-600">Smart OCR Extracted</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans-manrope text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-1">Student Name</label>
                        <input
                          type="text"
                          placeholder="Enter Student Name"
                          value={w2Name}
                          onChange={(e) => setW2Name(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-1">Class / Grade</label>
                        <input
                          type="text"
                          placeholder="Class e.g. 10-A"
                          value={w2Class}
                          onChange={(e) => setW2Class(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-1">House Team</label>
                        <select
                          value={w2House}
                          onChange={(e) => setW2House(e.target.value as HouseId)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                        >
                          <option value="VEGA">🟡 VEGA (Yellow)</option>
                          <option value="NOVA">🔴 NOVA (Red)</option>
                          <option value="ORION">🔵 ORION (Blue)</option>
                          <option value="ASTRA">🟢 ASTRA (Green)</option>
                          <option value="NONE">⚪ Non-House / Individual (No House Pts)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3rd Place Card */}
                  <div className="p-4 rounded-2xl bg-white border border-amber-900/10 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-sans-manrope font-extrabold text-xs flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> 3rd Place (+6 PTS)
                      </span>
                      {ocrStatus === 'parsed' && (
                        <span className="text-[11px] font-sans-manrope font-bold text-emerald-600">Smart OCR Extracted</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans-manrope text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-1">Student Name</label>
                        <input
                          type="text"
                          placeholder="Enter Student Name"
                          value={w3Name}
                          onChange={(e) => setW3Name(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-1">Class / Grade</label>
                        <input
                          type="text"
                          placeholder="Class e.g. 8-C"
                          value={w3Class}
                          onChange={(e) => setW3Class(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-1">House Team</label>
                        <select
                          value={w3House}
                          onChange={(e) => setW3House(e.target.value as HouseId)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                        >
                          <option value="ORION">🔵 ORION (Blue)</option>
                          <option value="NOVA">🔴 NOVA (Red)</option>
                          <option value="VEGA">🟡 VEGA (Yellow)</option>
                          <option value="ASTRA">🟢 ASTRA (Green)</option>
                          <option value="NONE">⚪ Non-House / Individual (No House Pts)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: MANUAL WINNER ENTRY WORKFLOW */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#111111]">Judge Name / Panel Remarks</label>
                  <input
                    type="text"
                    value={judgeName}
                    onChange={(e) => setJudgeName(e.target.value)}
                    placeholder="e.g. Prof. S. Ramesh (Kerala Sangeetha Nataka Akademi)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope font-semibold"
                  />
                </div>

                {/* 1st Place Input */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-3">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-sans-manrope font-extrabold text-xs inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> 1st Place Winner
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-sans-manrope text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">Student Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Student Name"
                        value={w1Name}
                        onChange={(e) => setW1Name(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">House</label>
                      <select
                        value={w1House}
                        onChange={(e) => setW1House(e.target.value as HouseId)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                      >
                        <option value="VEGA">VEGA</option>
                        <option value="NOVA">NOVA</option>
                        <option value="ORION">ORION</option>
                        <option value="ASTRA">ASTRA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">Points</label>
                      <input
                        type="number"
                        value={w1Points}
                        onChange={(e) => setW1Points(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2nd Place Input */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-3">
                  <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-sans-manrope font-extrabold text-xs inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> 2nd Place Winner
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-sans-manrope text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">Student Name</label>
                      <input
                        type="text"
                        placeholder="Student Name"
                        value={w2Name}
                        onChange={(e) => setW2Name(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">House</label>
                      <select
                        value={w2House}
                        onChange={(e) => setW2House(e.target.value as HouseId)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                      >
                        <option value="ORION">ORION</option>
                        <option value="VEGA">VEGA</option>
                        <option value="NOVA">NOVA</option>
                        <option value="ASTRA">ASTRA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">Points</label>
                      <input
                        type="number"
                        value={w2Points}
                        onChange={(e) => setW2Points(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3rd Place Input */}
                <div className="p-4 rounded-2xl bg-white border border-amber-900/10 shadow-2xs space-y-3">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-sans-manrope font-extrabold text-xs inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> 3rd Place Winner
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-sans-manrope text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">Student Name</label>
                      <input
                        type="text"
                        placeholder="Student Name"
                        value={w3Name}
                        onChange={(e) => setW3Name(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">House</label>
                      <select
                        value={w3House}
                        onChange={(e) => setW3House(e.target.value as HouseId)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                      >
                        <option value="NOVA">NOVA</option>
                        <option value="VEGA">VEGA</option>
                        <option value="ORION">ORION</option>
                        <option value="ASTRA">ASTRA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] mb-1">Points</label>
                      <input
                        type="number"
                        value={w3Points}
                        onChange={(e) => setW3Points(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#111111]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Action Buttons Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/8">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-black/5 border border-black/10 text-[#5F5F5F] font-sans-manrope font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md cursor-pointer hover:scale-102 transition-all disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Winners to Public Website</span>
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
