import React, { useState, useMemo } from 'react';
import {
  Camera,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  Eye,
  Plus,
  Trash2,
  Lock,
  ArrowLeft,
  X,
  Check,
  Search,
} from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { auth } from '../../../config/firebase';
import type { ResultDraftPlacement } from '../../../shared/types/festivalTypes';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ScanResultPageProps {
  onBackToDashboard?: () => void;
}

export const ScanResultPage: React.FC<ScanResultPageProps> = ({ onBackToDashboard }) => {
  const { events } = useFestival();

  // Workflow steps: 'select' -> 'preview' -> 'processing' -> 'review' -> 'success'
  const [step, setStep] = useState<'select' | 'preview' | 'processing' | 'review' | 'success'>('select');
  
  // Trusted Admin Selection
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  
  // File & Preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  // Processing feedback state
  const [processingStatus, setProcessingStatus] = useState<string>('Reading result sheet...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review Draft State
  const [draftId, setDraftId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<ResultDraftPlacement[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());

  // Filter events eligible for result upload (not yet published)
  const eligibleEvents = events.filter((e) => !e.resultsPublished && !e.cancelled);
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Search & category filter state for the competition picker
  const [eventSearch, setEventSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(eligibleEvents.map((e) => e.category))).sort();
    return ['All', ...cats];
  }, [eligibleEvents]);

  const filteredEvents = useMemo(() => {
    return eligibleEvents.filter((e) => {
      const matchCat = categoryFilter === 'All' || e.category === categoryFilter;
      const q = eventSearch.toLowerCase();
      const matchSearch = !q || e.eventName.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [eligibleEvents, eventSearch, categoryFilter]);

  // Reset or initialize when selected event changes
  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    setErrorMessage(null);
  };

  // Handle file capture / upload with size & type validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10 MB limit. Please select or capture a smaller image.');
      return;
    }

    // Validate mime type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrorMessage('Invalid file format. Please capture a JPG, PNG, or WEBP image.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setStep('preview');
  };

  // Helper point calculator based on competition type and position
  const calculatePoints = (pos: number | string, compType?: string): number => {
    const p = Number(pos);
    if (compType === 'group' || compType === 'team') {
      // Group / team items: 1st=20, 2nd=15, 3rd=10
      if (p === 1) return 20;
      if (p === 2) return 15;
      if (p === 3) return 10;
    } else {
      // Individual items: 1st=10, 2nd=7, 3rd=5
      if (p === 1) return 10;
      if (p === 2) return 7;
      if (p === 3) return 5;
    }
    return 0;
  };

  // Trigger Gemini OCR
  const startOCRProcessing = async () => {
    if (!selectedFile || !selectedEventId) return;

    setStep('processing');
    setErrorMessage(null);
    setProcessingStatus('Uploading score sheet to backend...');

    try {
      const formData = new FormData();
      formData.append('resultSheet', selectedFile);
      formData.append('eventId', selectedEventId);

      setProcessingStatus('Gemini AI Vision extracting placement fields...');

      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';

      const response = await fetch(`${API_URL}/api/ocr`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to process OCR. Please try again.');
      }

      const data = await response.json();
      
      setDraftId(data.draftId || `draft-${Date.now()}`);
      
      // Enrich extracted placements with application-side point calculations
      const enriched: ResultDraftPlacement[] = (data.results || []).map((r: any) => ({
        position: Number(r.position) || 1,
        studentName: r.studentName || '',
        studentClass: r.studentClass || '',
        house: r.house ? r.house.toUpperCase() : 'NONE',
        points: calculatePoints(r.position, selectedEvent?.competitionType),
        studentNameConfidence: r.studentNameConfidence ?? (r.confidence === 'high' ? 0.95 : r.confidence === 'low' ? 0.6 : 0.8),
        houseConfidence: r.houseConfidence ?? (r.confidence === 'high' ? 0.95 : r.confidence === 'low' ? 0.6 : 0.8),
        positionConfidence: r.positionConfidence ?? 0.98,
        classConfidence: r.classConfidence ?? 0.9,
        confidence: r.confidence || 'high',
      }));

      setPlacements(enriched);
      setWarnings(data.warnings || []);
      setStep('review');
    } catch (err: any) {
      console.error('OCR Processing Error:', err);
      setErrorMessage(err.message || 'Unable to scan score sheet. You can retry or enter results manually.');
      setStep('preview');
    }
  };

  // Edit placement field with change tracking
  const handlePlacementEdit = (index: number, field: keyof ResultDraftPlacement, value: any) => {
    setPlacements((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };

      // Recalculate points automatically if position changes
      if (field === 'position') {
        target.points = calculatePoints(value, selectedEvent?.competitionType);
      }

      updated[index] = target;
      return updated;
    });

    setEditedFields((prev) => new Set(prev).add(`placement_${index}_${field}`));
  };

  // Add placement row (e.g. participation or extra place)
  const handleAddPlacement = () => {
    const nextPos = placements.length + 1;
    const newRow: ResultDraftPlacement = {
      position: nextPos,
      studentName: '',
      studentClass: '',
      house: 'NONE',
      points: calculatePoints(nextPos, selectedEvent?.competitionType),
      confidence: 'high',
      studentNameConfidence: 1.0,
      houseConfidence: 1.0,
      positionConfidence: 1.0,
    };
    setPlacements((prev) => [...prev, newRow]);
  };

  // Remove placement row
  const handleRemovePlacement = (index: number) => {
    setPlacements((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate & Publish final results to Firebase
  const handleFinalPublish = async () => {
    if (!selectedEventId || placements.length === 0) return;

    // Validate fields before submitting
    for (const item of placements) {
      if (!item.studentName || !item.studentName.trim()) {
        alert(`Please enter a student name for position ${item.position}.`);
        return;
      }
    }

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';

      const response = await fetch(`${API_URL}/api/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          draftId: draftId || undefined,
          results: placements.map((p) => ({
            position: p.position,
            studentName: p.studentName,
            studentClass: p.studentClass,
            house: p.house,
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Publish failed.');
      }

      setStep('success');
    } catch (err: any) {
      console.error('Publish Error:', err);
      alert('Failed to publish results: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-left">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#111111] to-[#2B2B2B] text-white p-4 sm:p-6 shadow-md border-b border-black/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5E84] to-[#F59E0B] p-[2px]">
              <div className="w-full h-full bg-[#111111] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FF5E84]" />
              </div>
            </div>
            <div>
              <h2 className="font-serif-cormorant font-bold text-xl sm:text-2xl text-white">
                Scan Competition Result Sheet
              </h2>
              <p className="font-sans-manrope text-xs text-white/70">
                Camera Capture • Gemini AI Extraction • Teacher Review & Verification
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-sans-manrope font-bold text-white/60 bg-white/10 px-3 py-1.5 rounded-full">
            <span>Step {step === 'select' ? '1' : step === 'preview' ? '2' : step === 'processing' ? '3' : '4'} of 4</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 mt-4">

        {/* STEP 1: SELECT COMPETITION & CAPTURE */}
        {step === 'select' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            
            <div className="bg-white p-5 sm:p-7 rounded-[28px] border border-black/10 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-black/8 pb-3">
                <FileText className="w-5 h-5 text-[#FF5E84]" />
                <h3 className="font-serif-cormorant font-bold text-xl text-[#111111]">
                  1. Select Competition
                </h3>
              </div>

              {/* Searchable Competition Picker */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-[#5F5F5F] uppercase tracking-wider">
                  Competition Event
                </label>

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F5F5F] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search competition name..."
                    value={eventSearch}
                    onChange={(e) => { setEventSearch(e.target.value); setSelectedEventId(''); }}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-black/10 rounded-2xl font-sans-manrope text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FF5E84]/30"
                  />
                  {eventSearch && (
                    <button onClick={() => setEventSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category filter chips */}
                <div className="flex gap-2 flex-wrap">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategoryFilter(cat); setSelectedEventId(''); }}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-sans-manrope font-bold cursor-pointer transition-all whitespace-nowrap ${
                        categoryFilter === cat
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#FAF8F5] border border-black/10 text-[#5F5F5F] hover:text-[#111111]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Selected event display */}
                {selectedEventId && selectedEvent && (
                  <div className="flex items-center justify-between px-4 py-3 bg-[#FF5E84]/8 border border-[#FF5E84]/30 rounded-2xl">
                    <div>
                      <p className="font-sans-manrope font-extrabold text-sm text-[#111111]">{selectedEvent.eventName}</p>
                      <p className="text-[11px] text-[#5F5F5F]">{selectedEvent.category} · {selectedEvent.stage || selectedEvent.venue}</p>
                    </div>
                    <button onClick={() => { setSelectedEventId(''); setEventSearch(''); }} className="text-[#FF5E84] cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Results list */}
                {!selectedEventId && (
                  <div className="border border-black/10 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                    {filteredEvents.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-[#5F5F5F] font-sans-manrope">
                        No competitions match your search.
                      </div>
                    ) : (
                      filteredEvents.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => { handleSelectEvent(evt.id); setEventSearch(''); }}
                          className="w-full text-left px-4 py-3 border-b border-black/6 last:border-0 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        >
                          <p className="font-sans-manrope font-bold text-sm text-[#111111] leading-tight">{evt.eventName}</p>
                          <p className="text-[11px] text-[#5F5F5F] mt-0.5">{evt.category} · {evt.stage || evt.venue || ''}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Read-Only Auto-Filled Details */}
              {selectedEvent && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-black/8 text-xs">
                  <div>
                    <span className="font-bold text-[#5F5F5F] block text-[10px] uppercase">Category</span>
                    <span className="font-sans-manrope font-extrabold text-[#111111]">{selectedEvent.category}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#5F5F5F] block text-[10px] uppercase">Date</span>
                    <span className="font-sans-manrope font-extrabold text-[#111111]">{selectedEvent.date}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Camera & Upload Options */}
            <div className={`bg-white p-5 sm:p-7 rounded-[28px] border border-black/10 shadow-sm space-y-4 text-center ${!selectedEventId ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-serif-cormorant font-bold text-xl text-[#111111] border-b border-black/8 pb-3 text-left">
                2. Capture Score Sheet
              </h3>

              {/* Primary Camera Action (Opens native camera on phone/tablet) */}
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  disabled={!selectedEventId}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <button
                  type="button"
                  disabled={!selectedEventId}
                  className="w-full py-5 px-6 rounded-2xl gradient-btn-primary text-white font-sans-manrope font-extrabold text-base flex items-center justify-center gap-3 shadow-md group-hover:shadow-lg transition-all cursor-pointer"
                >
                  <Camera className="w-6 h-6" />
                  <span>📷 Scan Result Sheet (Camera)</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-black/10 w-full" />
                <span className="bg-white px-3 text-[10px] font-extrabold uppercase text-[#5F5F5F] tracking-wider shrink-0">
                  OR UPLOAD FILE
                </span>
              </div>

              {/* Secondary Upload Action */}
              <div className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  disabled={!selectedEventId}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <button
                  type="button"
                  disabled={!selectedEventId}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-black/5 border border-black/15 text-[#111111] font-sans-manrope font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-[#FF5E84]" />
                  <span>📁 Upload Image from Device</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold font-sans-manrope">
                ⚠️ {errorMessage}
              </div>
            )}

          </div>
        )}

        {/* STEP 2: PHOTO PREVIEW & RETAKE */}
        {step === 'preview' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-5 sm:p-7 rounded-[28px] border border-black/10 shadow-sm space-y-5 text-center">
              <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                Verify Captured Score Sheet
              </h3>

              {imagePreview && (
                <div className="relative max-h-[350px] overflow-hidden rounded-2xl border border-black/10 bg-[#FAF8F5] p-2">
                  <img src={imagePreview} alt="Score sheet preview" className="w-full h-full object-contain rounded-xl max-h-[320px] mx-auto" />
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold font-sans-manrope">
                  ⚠️ {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setStep('select')}
                  className="py-3.5 px-4 rounded-2xl bg-white hover:bg-black/5 border border-black/15 text-[#111111] font-sans-manrope font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>🔄 Retake Photo</span>
                </button>

                <button
                  onClick={startOCRProcessing}
                  className="py-3.5 px-4 rounded-2xl gradient-btn-primary text-white font-sans-manrope font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Process with AI →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING ANIMATION */}
        {step === 'processing' && (
          <div className="max-w-md mx-auto py-16 text-center space-y-6 bg-white p-8 rounded-[32px] border border-black/10 shadow-md">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#FF5E84]/20 border-t-[#FF5E84] animate-spin" />
              <FileText className="w-8 h-8 text-[#FF5E84]" />
            </div>
            <div className="space-y-2">
              <h4 className="font-serif-cormorant font-bold text-2xl sm:text-3xl text-[#111111]">
                Gemini Vision Reading Sheet...
              </h4>
              <p className="font-sans-manrope text-xs font-extrabold text-[#FF5E84] animate-pulse">
                {processingStatus}
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SIDE-BY-SIDE REVIEW & PUBLISH */}
        {step === 'review' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-black/10 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#5F5F5F] uppercase tracking-wider block">Selected Competition</span>
                <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                  {selectedEvent?.eventName}
                </h3>
                <p className="text-xs font-sans-manrope text-[#5F5F5F] mt-0.5">
                  {selectedEvent?.category} • {selectedEvent?.date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {imagePreview && (
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-black/5 border border-black/10 text-xs font-extrabold text-[#111111] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#FF5E84]" />
                    <span>👁️ View Original Sheet</span>
                  </button>
                )}
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                  {placements.length} Placements Extracted
                </span>
              </div>
            </div>

            {/* Low Confidence Warning Banner */}
            {warnings.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-sans-manrope space-y-1">
                <div className="flex items-center gap-2 font-extrabold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>⚠ Field Warnings (Please verify highlighted entries):</span>
                </div>
                <ul className="list-disc pl-6 space-y-0.5">
                  {warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Review Grid: Side-by-Side on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Original Sheet Image Preview (Desktop) */}
              <div className="hidden lg:block lg:col-span-5 bg-white p-4 rounded-[28px] border border-black/10 shadow-xs h-fit sticky top-6">
                <h4 className="font-sans-manrope font-extrabold text-xs uppercase text-[#5F5F5F] mb-3">
                  Original Score Sheet Reference
                </h4>
                {imagePreview ? (
                  <div className="rounded-2xl overflow-hidden border border-black/10 max-h-[500px] bg-[#FAF8F5] p-2">
                    <img src={imagePreview} alt="Original score sheet" className="w-full h-full object-contain rounded-xl max-h-[480px]" />
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-black/40">No preview image available</div>
                )}
              </div>

              {/* Right Column: Editable Placement Cards */}
              <div className="lg:col-span-7 space-y-4">
                
                {placements.map((item, index) => {
                  const isLowName = (item.studentNameConfidence ?? 1) < 0.85;
                  const isLowHouse = (item.houseConfidence ?? 1) < 0.85;
                  const isEdited = editedFields.has(`placement_${index}_studentName`) || editedFields.has(`placement_${index}_house`);

                  return (
                    <div
                      key={index}
                      className={`p-4 sm:p-5 rounded-[24px] bg-white border text-left transition-all ${
                        isLowName || isLowHouse
                          ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                          : 'border-black/10 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-black/8">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {item.position === 1 ? '🥇' : item.position === 2 ? '🥈' : item.position === 3 ? '🥉' : '🎖️'}
                          </span>
                          <h5 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                            {item.position === 1 ? '1st Place' : item.position === 2 ? '2nd Place' : item.position === 3 ? '3rd Place' : `Position ${item.position}`}
                          </h5>
                        </div>

                        <div className="flex items-center gap-2">
                          {isEdited && (
                            <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                              Edited by Admin
                            </span>
                          )}

                          {isLowName || isLowHouse ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>OCR confidence low — verify</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>High Confidence</span>
                            </span>
                          )}

                          {placements.length > 1 && (
                            <button
                              onClick={() => handleRemovePlacement(index)}
                              className="text-black/30 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Remove position"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3">
                        
                        {/* Student Name */}
                        <div className="sm:col-span-5">
                          <label className="text-[10px] font-extrabold text-[#5F5F5F] uppercase block mb-1">
                            Student Name {isLowName && <span className="text-amber-600">⚠️</span>}
                          </label>
                          <input
                            type="text"
                            value={item.studentName}
                            onChange={(e) => handlePlacementEdit(index, 'studentName', e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                              isLowName ? 'border-amber-400 bg-white' : 'border-black/10 bg-[#FAF8F5]'
                            }`}
                            placeholder="Full Student Name"
                          />
                        </div>

                        {/* Class */}
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-extrabold text-[#5F5F5F] uppercase block mb-1">Class</label>
                          <input
                            type="text"
                            value={item.studentClass}
                            onChange={(e) => handlePlacementEdit(index, 'studentClass', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-black/10 bg-[#FAF8F5] text-xs font-bold"
                            placeholder="e.g. 9A"
                          />
                        </div>

                        {/* House Dropdown */}
                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-extrabold text-[#5F5F5F] uppercase block mb-1">House</label>
                          <select
                            value={item.house}
                            onChange={(e) => handlePlacementEdit(index, 'house', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-black/10 bg-[#FAF8F5] text-xs font-bold"
                          >
                            <option value="NOVA">🔴 NOVA</option>
                            <option value="VEGA">🟡 VEGA</option>
                            <option value="ORION">🔵 ORION</option>
                            <option value="ASTRA">🟢 ASTRA</option>
                            <option value="NONE">⚪ Individual (No Pts)</option>
                          </select>
                        </div>

                        {/* Calculated Locked Points */}
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-extrabold text-[#5F5F5F] uppercase block mb-1">
                            Points <Lock className="w-2.5 h-2.5 inline text-black/40" />
                          </label>
                          <div className="w-full px-3 py-2 rounded-xl bg-black/5 border border-black/10 text-xs font-extrabold text-[#111111] flex items-center justify-between">
                            <span>{item.points || 0} pts</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={handleAddPlacement}
                  className="w-full py-3 rounded-2xl bg-white hover:bg-black/5 border border-dashed border-black/20 text-[#111111] font-sans-manrope font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#FF5E84]" />
                  <span>+ Add Placement Row</span>
                </button>

              </div>

            </div>

            {/* Action Bar */}
            <div className="p-4 rounded-[24px] bg-white border border-black/10 flex flex-wrap justify-between items-center gap-3">
              <button
                onClick={() => setStep('select')}
                className="px-5 py-3 rounded-xl bg-white border border-black/15 text-xs font-bold text-[#111111] hover:bg-black/5 cursor-pointer"
              >
                ← Rescan / Cancel
              </button>

              <button
                onClick={handleFinalPublish}
                className="px-8 py-3.5 rounded-2xl gradient-btn-primary text-white font-sans-manrope font-extrabold text-sm shadow-md cursor-pointer hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Validate & Publish Results →</span>
              </button>
            </div>

          </div>
        )}

        {/* STEP 5: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="max-w-md mx-auto py-16 text-center space-y-5 bg-white p-8 rounded-[32px] border border-black/10 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif-cormorant font-bold text-3xl text-[#111111]">
              Results Published Successfully!
            </h3>
            <p className="font-sans-manrope text-xs text-[#5F5F5F] leading-relaxed">
              The competition results have been verified and atomically saved. The House Leaderboard and Live Feed have been updated in real-time.
            </p>
            <div className="pt-3">
              <button
                onClick={() => setStep('select')}
                className="px-8 py-3.5 rounded-2xl bg-[#111111] hover:bg-[#2B2B2B] text-white font-sans-manrope font-extrabold text-xs cursor-pointer shadow-md"
              >
                Scan Another Result Sheet
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal for Viewing Full Original Sheet on Mobile/Desktop */}
      {showImageModal && imagePreview && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[28px] max-w-3xl w-full p-4 relative text-left my-auto cursor-default shadow-2xl"
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-black flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-serif-cormorant font-bold text-xl text-[#111111] mb-3">
              Original Score Sheet Photograph
            </h4>
            <div className="max-h-[75vh] overflow-auto rounded-xl border border-black/10 bg-[#FAF8F5] p-2">
              <img src={imagePreview} alt="Full original score sheet" className="w-full h-auto object-contain mx-auto" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
