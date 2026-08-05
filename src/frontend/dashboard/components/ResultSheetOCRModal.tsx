import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  X,
  Database,
} from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import {
  getCategoryForClass,
  isHouseRequiredForClass,
  matchMasterStudent,
} from '../../../data/masterStudentsData';
import type { HouseId } from '../../../shared/types/festivalTypes';

interface ResultSheetOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface OCRResultItem {
  position: 1 | 2 | 3;
  name: string;
  nameConfidence: number;
  classGrade: number;
  classConfidence: number;
  division: string;
  house: HouseId | 'N/A';
  houseConfidence: number;
  admissionNo?: string;
  marks?: number;
}

export const ResultSheetOCRModal: React.FC<ResultSheetOCRModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { submitResult } = useFestival();
  
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'success'>('upload');
  const [processingStatus, setProcessingStatus] = useState('Reading image...');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State extracted by OCR
  const [eventTitle, setEventTitle] = useState('Mohiniyattam');
  const [eventCategory, setEventCategory] = useState<'CAT-I' | 'CAT-II' | 'CAT-III' | 'CAT-IV'>('CAT-III');
  
  const [resultsData, setResultsData] = useState<OCRResultItem[]>([
    {
      position: 1,
      name: 'Anjali R. Pillai',
      nameConfidence: 98,
      classGrade: 9,
      classConfidence: 99,
      division: 'B',
      house: 'VEGA',
      houseConfidence: 97,
      admissionNo: 'ADM-2417',
      marks: 96,
    },
    {
      position: 2,
      name: 'Arya S. Kumar',
      nameConfidence: 95,
      classGrade: 8,
      classConfidence: 65, // Low confidence -> Yellow alert!
      division: 'A',
      house: 'ORION',
      houseConfidence: 92,
      admissionNo: 'ADM-1902',
      marks: 94,
    },
    {
      position: 3,
      name: 'Keerthana M. Nair',
      nameConfidence: 92,
      classGrade: 10,
      classConfidence: 94,
      division: 'C',
      house: 'NOVA',
      houseConfidence: 91,
      admissionNo: 'ADM-3104',
      marks: 91,
    },
  ]);

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

  if (!isOpen) return null;

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      startOCRProcessing();
    }
  };

  const startOCRProcessing = () => {
    setStep('processing');
    
    setTimeout(() => setProcessingStatus('Reading handwritten text...'), 800);
    setTimeout(() => setProcessingStatus('Recognising performer names...'), 1600);
    setTimeout(() => setProcessingStatus('Matching against MGM Master Student DB...'), 2400);
    setTimeout(() => setProcessingStatus('Inferring CBSE Category & House rules...'), 3200);
    setTimeout(() => setProcessingStatus('Creating structured JSON...'), 3800);
    setTimeout(() => setStep('review'), 4500);
  };

  const handleItemChange = (index: number, field: keyof OCRResultItem, value: any) => {
    setResultsData((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };

      // Automatic CBSE Category & House Logic when class changes
      if (field === 'classGrade') {
        const cGrade = Number(value);
        target.classGrade = cGrade;
        
        // Auto infer category
        const cat = getCategoryForClass(cGrade);
        setEventCategory(cat);

        // Auto infer house requirement
        if (!isHouseRequiredForClass(cGrade)) {
          target.house = 'N/A';
        } else if (target.house === 'N/A') {
          target.house = 'VEGA';
        }
      }

      // Master Student DB Lookup when name changes
      if (field === 'name') {
        const match = matchMasterStudent(value);
        if (match) {
          target.admissionNo = match.admissionNo;
          target.classGrade = match.classGrade;
          target.division = match.division;
          target.house = match.house || 'N/A';
          setEventCategory(match.category);
        }
      }

      updated[index] = target;
      return updated;
    });
  };

  const handleFinalPublish = () => {
    resultsData.forEach((res) => {
      const isHouseEligible = isHouseRequiredForClass(res.classGrade) && res.house !== 'N/A';
      const houseId: HouseId = isHouseEligible ? (res.house as HouseId) : 'NOVA';
      const points = !isHouseEligible ? 0 : res.position === 1 ? 5 : res.position === 2 ? 3 : 1;

      submitResult({
        eventId: `evt-ocr-${Date.now()}`,
        eventTitle,
        category: eventCategory,
        participantName: res.name,
        studentClass: `Class ${res.classGrade}-${res.division}`,
        houseId,
        position: res.position === 1 ? '1st' : res.position === 2 ? '2nd' : '3rd',
        points,
        score: res.marks || 90,
        judgeNotes: `Extracted via OCR Result Sheet (${res.admissionNo || 'Verified'})`,
      });
    });

    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#FAF8F5] rounded-[32px] max-w-3xl w-full overflow-hidden shadow-2xl border border-black/10 relative text-left my-8">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-[#111111] to-[#2B2B2B] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5E84] to-[#F59E0B] p-[2px]">
              <div className="w-full h-full bg-[#111111] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FF5E84]" />
              </div>
            </div>
            <div>
              <h3 className="font-serif-cormorant font-bold text-2xl text-white">
                Intelligent OCR Result Sheet Uploader
              </h3>
              <p className="font-sans-manrope text-xs text-white/70">
                AI Text Extraction • Master Student Matching • Real-time Firebase Sync
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          
          {/* STEP 1: UPLOAD RESULT SHEET PHOTO */}
          {step === 'upload' && (
            <div className="space-y-6 text-center py-6">
              <div className="border-2 border-dashed border-black/20 hover:border-[#FF5E84] rounded-3xl p-8 bg-white/60 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSimulateUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center space-y-3">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Score sheet preview" className="h-32 object-contain rounded-xl shadow-xs" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#FF5E84]/12 text-[#FF5E84] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-sans-manrope font-extrabold text-base text-[#111111]">
                      Upload Official Result Sheet Image
                    </h4>
                    <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-1">
                      Take a photo or upload handwritten score sheet (.PNG, .JPG, .WebP)
                    </p>
                  </div>
                  <span className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-bold shadow-xs">
                    Select File or Snap Photo
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-black/8 text-left space-y-2">
                <h5 className="font-sans-manrope font-extrabold text-xs text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#3B82F6]" />
                  <span>How OCR + Master Student Matching Works</span>
                </h5>
                <ul className="text-xs text-[#5F5F5F] space-y-1 list-disc pl-4 font-medium">
                  <li>Extracts Event, Names, Class, Division, and House from score sheets.</li>
                  <li>Cross-references names against Master Student DB to auto-fill Admission Numbers.</li>
                  <li><strong>CBSE Logic:</strong> Auto-infers Category (CAT I-IV) & suppresses house points for Primary (Classes 1-5) and Senior Secondary (Classes 11-12).</li>
                </ul>
              </div>

              {/* Demo Sample Button */}
              <button
                onClick={startOCRProcessing}
                className="w-full py-3.5 rounded-full gradient-btn-primary text-white font-sans-manrope font-bold text-xs shadow-md cursor-pointer"
              >
                ⚡ Use Sample Handwritten Result Sheet →
              </button>
            </div>
          )}

          {/* STEP 2: OCR PROCESSING ANIMATION */}
          {step === 'processing' && (
            <div className="py-16 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#FF5E84]/20 border-t-[#FF5E84] animate-spin" />
                <FileText className="w-8 h-8 text-[#FF5E84]" />
              </div>

              <div className="space-y-2">
                <h4 className="font-serif-cormorant font-bold text-3xl text-[#111111]">
                  AI OCR Scanner Working...
                </h4>
                <p className="font-sans-manrope text-sm font-extrabold text-[#FF5E84] animate-pulse">
                  {processingStatus}
                </p>
              </div>

              <div className="max-w-xs mx-auto bg-black/5 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-[#FF5E84] to-[#FF8A00] h-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* STEP 3: ADMIN CONFIRMATION & VERIFICATION SCREEN */}
          {step === 'review' && (
            <div className="space-y-6">
              
              {/* Event Header Config */}
              <div className="p-4 rounded-2xl bg-white border border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-[#5F5F5F] uppercase">Event Name</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 font-bold text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-[#5F5F5F] uppercase">Inferred Category (Auto-CBSE)</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 font-bold text-xs text-[#111111]"
                  >
                    <option value="CAT-I">CAT-I (Classes 1–5 • Primary)</option>
                    <option value="CAT-II">CAT-II (Classes 6–8 • Upper Primary)</option>
                    <option value="CAT-III">CAT-III (Classes 9–10 • Secondary)</option>
                    <option value="CAT-IV">CAT-IV (Classes 11–12 • Sr. Secondary)</option>
                  </select>
                </div>
              </div>

              {/* Parsed Winners Review Cards */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {resultsData.map((res, index) => {
                  const isLowConfidence = res.classConfidence < 80 || res.nameConfidence < 80;
                  const houseNeeded = isHouseRequiredForClass(res.classGrade);

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl bg-white border text-left transition-all ${
                        isLowConfidence
                          ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                          : 'border-black/10'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-black/6">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {res.position === 1 ? '🥇' : res.position === 2 ? '🥈' : '🥉'}
                          </span>
                          <h5 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                            {res.position === 1 ? 'First Place' : res.position === 2 ? 'Second Place' : 'Third Place'}
                          </h5>
                        </div>

                        {/* Confidence Indicator Badge */}
                        {isLowConfidence ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>⚠️ Low Confidence ({res.classConfidence}%) - Please Verify</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>OCR Confidence ({res.nameConfidence}%)</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                        <div>
                          <label className="text-[10px] font-bold text-[#5F5F5F] uppercase">Student Name</label>
                          <input
                            type="text"
                            value={res.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-black/10 text-xs font-bold"
                          />
                          {res.admissionNo && (
                            <span className="text-[9px] font-extrabold text-[#3B82F6]">
                              ✓ Matched {res.admissionNo}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#5F5F5F] uppercase">Class (1–12)</label>
                          <select
                            value={res.classGrade}
                            onChange={(e) => handleItemChange(index, 'classGrade', Number(e.target.value))}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                              res.classConfidence < 80 ? 'bg-amber-100 border-amber-400' : 'bg-[#FAF8F5] border-black/10'
                            }`}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                              <option key={c} value={c}>
                                Class {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#5F5F5F] uppercase">Division</label>
                          <input
                            type="text"
                            value={res.division}
                            onChange={(e) => handleItemChange(index, 'division', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-black/10 text-xs font-bold uppercase"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#5F5F5F] uppercase">
                            House {houseNeeded ? '(Req)' : '(N/A)'}
                          </label>
                          <select
                            disabled={!houseNeeded}
                            value={res.house}
                            onChange={(e) => handleItemChange(index, 'house', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-black/10 text-xs font-bold disabled:opacity-50"
                          >
                            {houseNeeded ? (
                              <>
                                <option value="NOVA">🔴 NOVA</option>
                                <option value="VEGA">🟡 VEGA</option>
                                <option value="ORION">🔵 ORION</option>
                                <option value="ASTRA">🟢 ASTRA</option>
                              </>
                            ) : (
                              <option value="N/A">N/A (No House)</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Request Admin Confirmation Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 font-sans-manrope font-medium">
                ✋ <strong>Confirmation Required from Uploading Admin:</strong> Please inspect any yellow highlighted fields before publishing. Publishing will immediately update Firestore and broadcast real-time updates to the public website.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setStep('upload')}
                  className="px-5 py-2.5 rounded-full bg-white border border-black/10 text-xs font-bold cursor-pointer"
                >
                  Back / Re-upload
                </button>
                <button
                  onClick={handleFinalPublish}
                  className="px-7 py-2.5 rounded-full gradient-btn-primary text-white font-sans-manrope font-bold text-xs shadow-md cursor-pointer"
                >
                  Confirm & Publish to Firebase →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-serif-cormorant font-bold text-3xl text-[#111111]">
                Results Published to Firebase!
              </h4>
              <p className="font-sans-manrope text-xs text-[#5F5F5F] max-w-md mx-auto">
                The results have been written to Firestore. Real-time listeners have updated the public Results page and House Leaderboard instantly.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-full bg-[#111111] text-white font-sans-manrope font-bold text-xs cursor-pointer shadow-md"
              >
                Close & View Live Results
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
