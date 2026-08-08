import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  X,
  ChevronDown
} from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import type { HouseId } from '../../../shared/types/festivalTypes';

interface ResultSheetOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface OCRResultItem {
  position: 1 | 2 | 3;
  studentName: string;
  studentClass: string;
  house: HouseId | 'N/A' | string;
  confidence: 'high' | 'medium' | 'low';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const ResultSheetOCRModal: React.FC<ResultSheetOCRModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { events } = useFestival();
  
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'success'>('upload');
  const [processingStatus, setProcessingStatus] = useState('Reading image...');
  
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [resultsData, setResultsData] = useState<OCRResultItem[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const startOCRProcessing = async () => {
    if (!selectedFile || !selectedEventId) return;

    setStep('processing');
    setError(null);
    setProcessingStatus('Uploading result sheet to backend...');

    const targetEvent = events.find(e => e.id === selectedEventId);
    
    try {
      const formData = new FormData();
      formData.append('resultSheet', selectedFile);
      formData.append('eventName', targetEvent?.eventName || '');
      formData.append('category', targetEvent?.category || '');

      setProcessingStatus('Gemini Vision extracting results...');

      const response = await fetch(`${API_URL}/api/ocr`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process OCR');
      }

      const data = await response.json();
      
      setResultsData(data.results || []);
      setWarnings(data.warnings || []);
      setStep('review');
    } catch (err: any) {
      console.error('OCR Error:', err);
      setError(err.message || 'An unexpected error occurred during OCR.');
      setStep('upload');
    }
  };

  const handleItemChange = (index: number, field: keyof OCRResultItem, value: any) => {
    setResultsData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFinalPublish = async () => {
    if (!selectedEventId) return;

    try {
      const response = await fetch(`${API_URL}/api/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          results: resultsData
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to publish results');
      }

      setStep('success');
    } catch (err: any) {
      console.error('Publish Error:', err);
      alert('Failed to publish results: ' + err.message);
    }
  };

  // Filter events to only show those that are active or completed, but not published yet
  const eligibleEvents = events.filter(e => !e.resultsPublished && !e.cancelled);
  const selectedEventInfo = events.find(e => e.id === selectedEventId);

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
                Gemini OCR Result Uploader
              </h3>
              <p className="font-sans-manrope text-xs text-white/70">
                AI Vision Extraction • Secure Validation • Batch Publish
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          
          {/* STEP 1: UPLOAD RESULT SHEET PHOTO */}
          {step === 'upload' && (
            <div className="space-y-6 py-4">
              
              {/* Event Selection */}
              <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-sm">
                <label className="block text-xs font-extrabold text-[#5F5F5F] uppercase mb-2">
                  Select Event for OCR
                </label>
                <div className="relative">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-[#FAF8F5] border border-black/10 rounded-xl font-sans-manrope font-bold text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FF5E84]/30"
                  >
                    <option value="" disabled>-- Select an Event --</option>
                    {eligibleEvents.map(evt => (
                      <option key={evt.id} value={evt.id}>
                        {evt.eventName} ({evt.category}) - {evt.date}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className={`border-2 border-dashed ${!selectedEventId ? 'border-black/10 opacity-50 pointer-events-none' : 'border-black/20 hover:border-[#FF5E84]'} rounded-3xl p-8 bg-white/60 transition-colors relative cursor-pointer group text-center`}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={!selectedEventId}
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
                      Upload Official Result Sheet
                    </h4>
                    <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-1">
                      Take a photo or upload handwritten score sheet (.PNG, .JPG, .PDF)
                    </p>
                  </div>
                  <span className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-bold shadow-xs">
                    Select File or Snap Photo
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={startOCRProcessing}
                disabled={!selectedEventId || !selectedFile}
                className="w-full py-3.5 rounded-full gradient-btn-primary text-white font-sans-manrope font-bold text-sm shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Scan with Gemini AI →
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
                  AI Vision Scanner Working...
                </h4>
                <p className="font-sans-manrope text-sm font-extrabold text-[#FF5E84] animate-pulse">
                  {processingStatus}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: ADMIN CONFIRMATION & VERIFICATION SCREEN */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white border border-black/10 flex justify-between items-center">
                <div>
                  <h4 className="font-serif-cormorant font-bold text-xl text-[#111111]">
                    {selectedEventInfo?.eventName}
                  </h4>
                  <p className="text-xs font-sans-manrope text-[#5F5F5F]">
                    {selectedEventInfo?.category} • Verification
                  </p>
                </div>
                <div className="px-3 py-1 bg-[#FAF8F5] border border-black/10 rounded-lg text-xs font-bold">
                  {resultsData.length} Placements
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 font-sans-manrope">
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <AlertTriangle className="w-4 h-4" /> OCR Warnings
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {resultsData.sort((a,b) => a.position - b.position).map((res, index) => {
                  const isLowConfidence = res.confidence === 'low' || res.confidence === 'medium';
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
                            {res.position === 1 ? 'First Place' : res.position === 2 ? 'Second Place' : res.position === 3 ? 'Third Place' : 'Participation'}
                          </h5>
                        </div>

                        {isLowConfidence ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>⚠️ {res.confidence} confidence</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>High Confidence</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                        <div>
                          <label className="text-[10px] font-bold text-[#5F5F5F] uppercase">Student Name</label>
                          <input
                            type="text"
                            value={res.studentName}
                            onChange={(e) => handleItemChange(index, 'studentName', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-black/10 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#5F5F5F] uppercase">Class</label>
                          <input
                            type="text"
                            value={res.studentClass}
                            onChange={(e) => handleItemChange(index, 'studentClass', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-black/10 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#5F5F5F] uppercase">House</label>
                          <select
                            value={res.house}
                            onChange={(e) => handleItemChange(index, 'house', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-black/10 text-xs font-bold"
                          >
                            <option value="NOVA">🔴 NOVA</option>
                            <option value="VEGA">🟡 VEGA</option>
                            <option value="ORION">🔵 ORION</option>
                            <option value="ASTRA">🟢 ASTRA</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setStep('upload')}
                  className="px-5 py-2.5 rounded-full bg-white border border-black/10 text-xs font-bold cursor-pointer hover:bg-gray-50"
                >
                  Cancel / Reject
                </button>
                <button
                  onClick={handleFinalPublish}
                  className="px-7 py-2.5 rounded-full gradient-btn-primary text-white font-sans-manrope font-bold text-xs shadow-md cursor-pointer hover:shadow-lg transition-all"
                >
                  ✓ Publish Result
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
                Results Published!
              </h4>
              <p className="font-sans-manrope text-xs text-[#5F5F5F] max-w-md mx-auto">
                The results have been safely saved via transaction. The Leaderboard and Live Feed have automatically updated.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-full bg-[#111111] text-white font-sans-manrope font-bold text-xs cursor-pointer shadow-md mt-4"
              >
                Close Window
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
