import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Award,
  Bell,
  Shield,
  History,
  BarChart2,
  Archive,
  LogOut,
  Radio,
  Plus,
  QrCode,
  CheckCircle,
  FileSpreadsheet,
  Lock,
  Clock,
  Trash2,
} from 'lucide-react';
import { useFestival } from '../../shared/context/FestivalContext';
import { ResultApprovalQueue } from './components/ResultApprovalQueue';
import { AuditLogsTable } from './components/AuditLogsTable';
import { UserManagementTab } from './components/UserManagementTab';
import { ResultSheetOCRModal } from './components/ResultSheetOCRModal';
import { EventQuickActionModal } from './components/EventQuickActionModal';
import { ScanResultPage } from './pages/ScanResultPage';
import { cleanVenueName } from '../../utils/venueUtils';
import { formatTime12Hour } from '../../utils/timeUtils';
import type { AnnouncementType, PriorityLevel, HouseId, EventModel } from '../../shared/types/festivalTypes';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    logout,
    archiveMode,
    toggleArchiveMode,
    events,
    results,
    resultDrafts,
    users,
    houses,
    getHousePoints,
    auditLogs,
    liveFeed,
    addAnnouncement,
    deleteAnnouncement,
    submitResult,
    delayEvent,
  } = useFestival();

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'LiveControl' | 'ScanResult' | 'Results' | 'Leaderboard' | 'Announcements' | 'Schedules' | 'Reports' | 'UserManagement' | 'Settings' | 'QRScan' | 'AuditLogs'
  >('Overview');

  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [draftIdForReview, setDraftIdForReview] = useState<string | null>(null);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventModel | null>(null);
  const [scheduleFilter, setScheduleFilter] = useState<'All' | 'Running' | 'Upcoming' | 'Needs Result Upload' | 'Completed'>('All');

  // Announcement State
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('General Notice');
  const [announcementPriority, setAnnouncementPriority] = useState<PriorityLevel>('Normal');

  // QR & Result Entry State
  const [qrChestNumber, setQrChestNumber] = useState('K26-118');
  const [qrSelectedEvent, setQrSelectedEvent] = useState('Mohiniyattam (Classical Dance)');
  const [qrStudentName, setQrStudentName] = useState('Anjali R. Pillai');
  const [qrHouse, setQrHouse] = useState<HouseId>('NOVA');
  const [qrPosition, setQrPosition] = useState<'1st' | '2nd' | '3rd' | 'Participation'>('1st');
  const [qrSuccessMessage, setQrSuccessMessage] = useState('');

  const isDev = currentUser?.role === 'developer' || currentUser?.role === 'Developer';
  const isAdmin = isDev || ((currentUser?.role === 'admin' || currentUser?.role === 'Admin') && currentUser?.approved === true);

  // Route Guard: Redirect unauthorized users back to #home if manually navigating via URL
  useEffect(() => {
    if (!isAdmin) {
      if (window.location.hash === '#dashboard' || window.location.hash === '#control-center') {
        window.location.hash = '#home';
      }
    }
  }, [isAdmin, currentUser]);

  useEffect(() => {
    const handleOpenReview = (e: any) => {
      setDraftIdForReview(e.detail.draftId);
      setOcrModalOpen(true);
    };
    window.addEventListener('open-ocr-review', handleOpenReview);
    return () => window.removeEventListener('open-ocr-review', handleOpenReview);
  }, []);

  if (!currentUser || !isAdmin) {
    return (
      <div id="control-center" className="py-20 bg-[#FAF8F5]">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 border border-black/10 shadow-lg text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-serif-cormorant font-bold text-3xl text-[#111111]">
            Access Restricted
          </h3>
          <p className="font-sans-manrope text-xs text-[#5F5F5F] leading-relaxed">
            {currentUser ? (
              <>
                Your account (<strong>{currentUser.email}</strong>) is currently authenticated as <code>role = user</code> (Unapproved). You can browse the public website, but Festival Management access requires Admin privileges approved by the Developer in Control Center.
              </>
            ) : (
              <>
                Please log in with an authorized Admin or Developer account to access the Festival Management Portal.
              </>
            )}
          </p>
          <a
            href="#home"
            className="inline-block px-6 py-2.5 rounded-full bg-[#111111] text-white font-sans-manrope font-bold text-xs shadow-xs"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  const publishedResultEventIds = new Set(
    results
      .filter((r) => r.status === 'Published' || r.status === 'Verified')
      .map((r) => r.eventId)
  );
  const displayableEvents = events.filter((evt) => {
    const displayName = (evt.eventName || (evt as any).title || '').trim();
    return displayName.length > 0;
  });
  const eventHasPublishedResults = (evt: EventModel) => publishedResultEventIds.has(evt.id);
  const eventsAwaitingResults = displayableEvents.filter((evt) => !eventHasPublishedResults(evt) && !evt.cancelled);
  const pendingResultsCount = results.filter((r) => r.status === 'Pending Review').length + resultDrafts.length;

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText) return;
    addAnnouncement(announcementText, announcementType, announcementPriority);
    setAnnouncementText('');
  };

  const handleSaveQRResult = (e: React.FormEvent) => {
    e.preventDefault();
    
    submitResult({
      eventId: 'evt-mohiniyattam',
      eventTitle: qrSelectedEvent,
      category: 'Dance',
      participantName: qrStudentName,
      studentClass: 'Class 12-A',
      houseId: qrHouse,
      position: qrPosition === 'Participation' ? '1st' : qrPosition,
      score: qrPosition === '1st' ? 96 : qrPosition === '2nd' ? 92 : 88,
      points: qrPosition === '1st' ? 5 : qrPosition === '2nd' ? 3 : qrPosition === '3rd' ? 1 : 0,
      judgeNotes: 'Saved via QR Scan Entry',
    });

    setQrSuccessMessage(`Result saved for ${qrStudentName}! Points automatically calculated and added to ${qrHouse} House leaderboard.`);
    setTimeout(() => setQrSuccessMessage(''), 4000);
  };

  const handleDelayEvent = (eventId: string) => {
    delayEvent(eventId, 15);
  };

  const handleUndoDelayEvent = (eventId: string) => {
    delayEvent(eventId, -15);
  };

  const totalEvents = displayableEvents.length;
  const completedEvents = displayableEvents.filter(eventHasPublishedResults).length;
  const runningEvents = displayableEvents.filter(e => e.status === 'Running').length;
  const remainingEvents = totalEvents - completedEvents - runningEvents;
  const festivalProgress = totalEvents === 0 ? 0 : Math.round((completedEvents / totalEvents) * 100);

  return (
    <section id="control-center" className="relative py-12 bg-[#FAF8F5] border-t border-black/8">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Festival Timeline Top Bar */}
        <div className="bg-[#111111] text-white rounded-[24px] p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-1 min-w-[300px]">
            <div className="font-serif-cormorant font-bold text-2xl">Day 2</div>
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FF5E84] to-[#F59E0B]" style={{ width: `${festivalProgress}%` }} />
            </div>
            <div className="font-sans-manrope font-extrabold text-sm">{festivalProgress}%</div>
          </div>
          <div className="flex items-center gap-6 font-sans-manrope text-sm font-bold divide-x divide-white/20">
            <div className="px-3 flex items-center gap-2"><Clock className="w-4 h-4 text-[#F59E0B]" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="px-3 text-emerald-400">Running: {runningEvents}</div>
            <div className="px-3 text-blue-400">Completed: {completedEvents}</div>
            <div className="px-3 pl-6 text-white/60">Remaining: {remainingEvents}</div>
          </div>
        </div>

        {/* Top Control Room Header */}
        <div className="glass-card bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 shadow-xl border border-white/95 mb-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#111111] to-[#2B2B2B] text-white flex items-center justify-center shadow-md">
                <Radio className="w-6 h-6 text-[#FF5E84]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif-cormorant font-bold text-3xl sm:text-4xl text-[#111111] leading-none">
                    {isDev ? 'DEVELOPER CONTROL CENTER' : 'FESTIVAL MANAGEMENT DASHBOARD'}
                  </h2>
                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      isDev
                        ? 'bg-blue-500/15 text-blue-700 border border-blue-500/30'
                        : 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
                    }`}
                  >
                    ● {isDev ? 'DEVELOPER SESSION' : 'ADMIN SESSION'}
                  </span>
                </div>
                <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-1">
                  Logged in as <strong>{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Primary Manual Entry Button */}
              <button
                onClick={() => setActiveTab('Results')}
                className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Enter Winners</span>
              </button>

              {/* Secondary OCR Button */}
              <button
                onClick={() => setActiveTab('ScanResult')}
                className="bg-white border border-black/15 text-[#111111] font-sans-manrope font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-2 shadow-xs cursor-pointer hover:bg-black/5 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#FF5E84]" />
                <span>OCR Scan</span>
              </button>

              {isDev && (
                <button
                  onClick={toggleArchiveMode}
                  className={`px-4 py-2 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                    archiveMode
                      ? 'bg-amber-500 text-[#111111] font-extrabold border-amber-600'
                      : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border-black/10'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive Mode: {archiveMode ? 'ON' : 'OFF'}</span>
                </button>
              )}

              <button
                onClick={logout}
                className="px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-sans-manrope font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Module Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-6">
            <button
              onClick={() => setActiveTab('Overview')}
              className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'Overview'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard Home</span>
            </button>

            <button
              onClick={() => setActiveTab('LiveControl')}
              className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'LiveControl'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#FF5E84]" />
              <span>Live Control</span>
            </button>

            <button
              onClick={() => setActiveTab('ScanResult')}
              className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ScanResult'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/5'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF5E84]" />
              <span>OCR Scan</span>
              {activeTab !== 'ScanResult' && (
                <span className="text-[9px] font-extrabold bg-black/6 text-[#5F5F5F] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  Fallback
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('Results')}
              className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'Results'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/5'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Results ({pendingResultsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('Announcements')}
              className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'Announcements'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/5'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-[#FF5E84]" />
              <span>Announcements</span>
            </button>

            {/* ONLY Developer sees User & Admin Management */}
            {isDev && (
              <button
                onClick={() => setActiveTab('UserManagement')}
                className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'UserManagement'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/5'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Users</span>
              </button>
            )}

            {/* ONLY Developer sees Audit Activity Log */}
            {isDev && (
              <button
                onClick={() => setActiveTab('AuditLogs')}
                className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'AuditLogs'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/5'
                }`}
              >
                <History className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Audit Activity Log</span>
              </button>
            )}

            {/* ONLY Developer sees Reports & Analytics */}
            {isDev && (
              <button
                onClick={() => setActiveTab('Reports')}
                className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'Reports'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/5'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-[#7A3CF5]" />
                <span>Reports & Analytics</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'Overview' && (
          <div className="space-y-6 text-left">
            {/* Dashboard Home Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-2xs">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Today's Competitions</span>
                <div className="font-serif-cormorant font-bold text-4xl text-[#111111]">{totalEvents}</div>
                <span className="text-[11px] text-[#10B981] font-bold">● Live Stage Operations</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-2xs">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Results Queue (Pending)</span>
                <div className="font-serif-cormorant font-bold text-4xl text-[#F59E0B]">
                  {eventsAwaitingResults.length}
                </div>
                <span className="text-[11px] text-[#FF5E84] font-bold">Awaiting OCR / Winner Entry</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-2xs">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Completed Events</span>
                <div className="font-serif-cormorant font-bold text-4xl text-[#3B82F6]">
                  {completedEvents}
                </div>
                <span className="text-[11px] text-[#10B981] font-bold">Published Live</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-2xs">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Leaderboard Leader</span>
                <div className="font-serif-cormorant font-bold text-2xl text-[#EF4444] truncate">
                  {(() => {
                    const topHouse = [...houses]
                      .map((h) => ({ ...h, pts: getHousePoints(h.id) }))
                      .sort((a, b) => b.pts - a.pts)[0];
                    if (!topHouse || topHouse.pts === 0) return 'No Results Yet (0 Pts)';
                    return `${topHouse.name} (${topHouse.pts} Pts)`;
                  })()}
                </div>
                <span className="text-[11px] text-[#10B981] font-bold">Updated Live</span>
              </div>
            </div>

            {/* TODAY'S SCHEDULE & CHRONOLOGICAL RESULTS QUEUE */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/8 shadow-md space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    <h3 className="font-serif-cormorant font-bold text-2xl sm:text-3xl text-[#111111]">
                      Today's Schedule (10 August 2026)
                    </h3>
                  </div>
                  <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                    Tap any competition card to enter winners manually — the fastest & most accurate method.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {(['All', 'Running', 'Upcoming', 'Needs Result Upload', 'Completed'] as const).map((filterOpt) => (
                    <button
                      key={filterOpt}
                      type="button"
                      onClick={() => setScheduleFilter(filterOpt)}
                      className={`px-3.5 py-1.5 rounded-full font-sans-manrope font-extrabold text-xs transition-all cursor-pointer ${
                        scheduleFilter === filterOpt
                          ? 'bg-[#111111] text-white shadow-xs'
                          : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/8'
                      }`}
                    >
                      {filterOpt === 'Running' && '🟢 '}
                      {filterOpt === 'Upcoming' && '🟡 '}
                      {filterOpt === 'Needs Result Upload' && '🔴 '}
                      {filterOpt === 'Completed' && '🏆 '}
                      {filterOpt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Queue Info Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    ⌛
                  </div>
                  <div>
                    <h4 className="font-sans-manrope font-extrabold text-xs uppercase tracking-wider text-amber-900">
                      CHRONOLOGICAL RESULTS QUEUE — WAITING FOR RESULT UPLOAD
                    </h4>
                    <p className="font-sans-manrope text-xs text-amber-800">
                      Enter winners manually for instant results — or use OCR as a fallback for bulk judge sheets. Results sync immediately to the website.
                    </p>
                  </div>
                </div>
              </div>

              {/* Events List Cards */}
              <div className="space-y-3">
                {displayableEvents
                  .filter((evt) => {
                    if (scheduleFilter === 'All') return true;
                    if (scheduleFilter === 'Running') return evt.status === 'Running';
                    if (scheduleFilter === 'Upcoming') return !eventHasPublishedResults(evt) && (evt.status === 'Upcoming' || evt.status === 'Pending');
                    if (scheduleFilter === 'Needs Result Upload') return !eventHasPublishedResults(evt) && !evt.cancelled;
                    if (scheduleFilter === 'Completed') return eventHasPublishedResults(evt);
                    return true;
                  })
                  .map((evt) => {
                    const isDone = eventHasPublishedResults(evt);
                    const isRunning = evt.status === 'Running';
                    const displayName = evt.eventName || (evt as any).title || 'Untitled Event';

                    return (
                      <div
                        key={evt.id}
                        onClick={() => {
                          if (isDone) return;
                          setSelectedEventForModal(evt);
                          setQuickModalOpen(true);
                        }}
                        className={`p-4 sm:p-5 rounded-2xl border border-black/8 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isDone
                            ? 'bg-emerald-50/50'
                            : 'bg-[#FAF8F5] hover:bg-white hover:border-[#FF5E84]/30 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-black/10 flex flex-col items-center justify-center font-sans-manrope shrink-0 shadow-2xs">
                            <span className="text-xs font-extrabold text-[#111111]">{evt.scheduledStartTime || '09:15'}</span>
                            <span className="text-[9px] font-bold text-[#5F5F5F] uppercase">AM</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-sans-manrope font-extrabold text-base text-[#111111]">
                                {displayName}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans-manrope font-extrabold bg-black/5 text-[#5F5F5F]">
                                {evt.category}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans-manrope font-extrabold ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isRunning
                                    ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                                }`}
                              >
                                {isDone ? 'Published' : isRunning ? 'Running' : evt.status === 'Completed' ? 'Completed - Results Pending' : 'Upcoming'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-sans-manrope text-[#5F5F5F]">
                              <span>📍 {cleanVenueName(evt.venue, evt.stage)}</span>
                              {evt.participantsExpected && <span>👥 {evt.participantsExpected} Participants</span>}
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isDone ? (
                            <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-sans-manrope font-extrabold text-xs flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Results Published
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEventForModal(evt);
                                  setQuickModalOpen(true);
                                }}
                                className="px-4 py-2 rounded-full gradient-btn-primary text-white font-sans-manrope font-extrabold text-xs flex items-center gap-1.5 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                              >
                                <span>Enter Winners</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTab('ScanResult');
                                }}
                                className="px-4 py-2 rounded-full bg-white hover:bg-black/5 text-[#111111] border border-black/10 font-sans-manrope font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <span>OCR Scan</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Quick Announcement Creator */}
            <div className="bg-white rounded-2xl p-6 border border-black/8 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-black/6">
                <Plus className="w-4 h-4 text-[#FF5E84]" />
                <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider">
                  PUBLISH LIVE ACTIVITY TICKER ANNOUNCEMENT
                </h4>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111111]">Announcement Type</label>
                    <select
                      value={announcementType}
                      onChange={(e) => setAnnouncementType(e.target.value as AnnouncementType)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
                    >
                      <option value="General Notice">General Notice</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Result">Result Announcement</option>
                      <option value="Stage Update">Stage Update</option>
                      <option value="Schedule Change">Schedule Change</option>
                      <option value="Emergency">Emergency Alert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111111]">Priority Level</label>
                    <select
                      value={announcementPriority}
                      onChange={(e) => setAnnouncementPriority(e.target.value as PriorityLevel)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
                    >
                      <option value="Normal">Normal Priority</option>
                      <option value="Low">Low Priority</option>
                      <option value="Important">Important Priority</option>
                      <option value="Critical">Critical Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">Announcement Content</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter ticker text (e.g. Oppana commencement on Vallathol Stage at 11:45 AM)..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full gradient-btn-primary text-white font-sans-manrope font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Broadcast Announcement →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Control Tab */}
        {activeTab === 'LiveControl' && (
          <div className="bg-white rounded-3xl p-8 border border-black/8 shadow-md text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/8">
              <div>
                <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                  Live Control
                </h3>
                <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                  View real-time event status and manage delays.
                </p>
              </div>
              <Radio className="w-6 h-6 text-[#FF5E84]" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans-manrope">
                <thead>
                  <tr className="border-b border-black/10 text-[#5F5F5F] font-extrabold uppercase">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {displayableEvents
                    .slice(0, 50)
                    .map((evt) => {
                      const displayName = evt.eventName || (evt as any).title || 'Untitled Event';
                      const displayStage = evt.stage || evt.venue || 'Venue TBA';
                      const isPublished = eventHasPublishedResults(evt);
                      const statusText = isPublished ? 'Published' : evt.status;

                      return (
                        <tr key={evt.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-3.5 px-4 font-bold text-[#111111]">
                            {formatTime12Hour(evt.scheduledStartTime)}
                            {evt.delayMinutes > 0 && <span className="text-red-500 ml-1">(+{evt.delayMinutes}m)</span>}
                          </td>
                          <td className="py-3.5 px-4 text-[#111111] font-bold">{displayName}</td>
                          <td className="py-3.5 px-4 text-[#5F5F5F]">{displayStage}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              isPublished ? 'bg-emerald-100 text-emerald-600' :
                              evt.status === 'Running' ? 'bg-red-100 text-red-600' :
                              evt.status === 'Results Pending' ? 'bg-amber-100 text-amber-600' :
                              evt.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isPublished && evt.status !== 'Completed' && (
                              <>
                                <button
                                  onClick={() => handleDelayEvent(evt.id)}
                                  className="px-3 py-1.5 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 font-bold transition-all"
                                >
                                  Delay 15m
                                </button>
                                {(evt.delayMinutes || 0) > 0 && (
                                  <button
                                    onClick={() => handleUndoDelayEvent(evt.id)}
                                    className="ml-2 px-3 py-1.5 rounded-md bg-white text-[#111111] hover:bg-black/5 border border-black/10 font-bold transition-all"
                                  >
                                    Undo 15m
                                  </button>
                                )}
                              </>
                            )}
                            {evt.status === 'Results Pending' && (
                              <button
                                onClick={() => setOcrModalOpen(true)}
                                className="ml-2 px-3 py-1.5 rounded-md bg-[#111111] text-white hover:bg-gray-800 font-bold transition-all"
                              >
                                Upload OCR
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
        )}

        {/* QR Code Scanner & Score Entry */}
        {activeTab === 'QRScan' && (
          <div className="bg-white rounded-3xl p-8 border border-black/8 shadow-md text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/8">
              <div>
                <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                  Participant QR Code Scanner & Direct Score Entry
                </h3>
                <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                  Scan participant chest number badge to instantly record scores. House points calculate automatically (+5 for 1st, +3 for 2nd, +1 for 3rd).
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#FF5E84]/15 text-[#FF5E84] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
            </div>

            {qrSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans-manrope font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{qrSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveQRResult} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-black/10 space-y-3">
                  <span className="text-[11px] font-extrabold text-[#5F5F5F] uppercase">Scan Participant Badge</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={qrChestNumber}
                      onChange={(e) => setQrChestNumber(e.target.value)}
                      placeholder="Enter Chest Number (e.g. K26-118)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-bold font-sans-manrope"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setQrChestNumber('K26-118');
                        setQrStudentName('Anjali R. Pillai');
                        setQrHouse('NOVA');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold cursor-pointer"
                    >
                      Simulate Camera Scan
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">Competition Event</label>
                  <input
                    type="text"
                    value={qrSelectedEvent}
                    onChange={(e) => setQrSelectedEvent(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">Participant Name</label>
                  <input
                    type="text"
                    value={qrStudentName}
                    onChange={(e) => setQrStudentName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">House Assigned</label>
                  <select
                    value={qrHouse}
                    onChange={(e) => setQrHouse(e.target.value as HouseId)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
                  >
                    <option value="NOVA">🔴 NOVA House</option>
                    <option value="VEGA">🟡 VEGA House</option>
                    <option value="ORION">🔵 ORION House</option>
                    <option value="ASTRA">🟢 ASTRA House</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">Award Position</label>
                  <select
                    value={qrPosition}
                    onChange={(e) => setQrPosition(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
                  >
                    <option value="1st">🥇 1st Place (+5 House Points)</option>
                    <option value="2nd">🥈 2nd Place (+3 House Points)</option>
                    <option value="3rd">🥉 3rd Place (+1 House Point)</option>
                    <option value="Participation">🎗 Participation Certificate</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans-manrope">
                  ⚡ <strong>Automated House Score Engine:</strong> Clicking save will automatically update the House Championship standings and generate a logged audit trail.
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full gradient-btn-primary text-white font-sans-manrope font-bold text-xs shadow-md cursor-pointer"
                >
                  Save Result & Auto-Calculate Points →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ONLY Developer sees User & Role Management */}
        {activeTab === 'UserManagement' && isDev && (
          <UserManagementTab />
        )}

        {/* Audit Activity Log */}
        {activeTab === 'AuditLogs' && isDev && (
          <div className="space-y-4 text-left">
            <div className="bg-white rounded-3xl p-6 border border-black/8 shadow-md">
              <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111] mb-1">
                Real-Time System Audit Activity Log
              </h3>
              <p className="font-sans-manrope text-xs text-[#5F5F5F] mb-4">
                Every action taken across results, gallery uploads, announcements, and user access changes is stored with timestamp and operator name.
              </p>
              <AuditLogsTable />
            </div>
          </div>
        )}

        {/* System Reports & Analytics */}
        {activeTab === 'Reports' && isDev && (() => {
          const reportCompleted = displayableEvents.filter(eventHasPublishedResults).length;
          const reportPending = eventsAwaitingResults.length;
          const reportDrafts = resultDrafts.length;
          const reportAdmins = users.filter((u) => u.role === 'admin' || u.role === 'Admin' || u.role === 'developer' || u.role === 'Developer').length;
          const houseData = (['NOVA', 'VEGA', 'ORION', 'ASTRA'] as const).map((id) => ({
            id,
            pts: getHousePoints(id),
            color: id === 'NOVA' ? '#EF4444' : id === 'VEGA' ? '#F59E0B' : id === 'ORION' ? '#3B82F6' : '#10B981',
          })).sort((a, b) => b.pts - a.pts);
          const maxPts = Math.max(...houseData.map((h) => h.pts), 1);
          return (
            <div className="bg-[#FAF8F5] rounded-3xl p-8 border border-black/8 shadow-md text-left space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                  System Reports &amp; Festival Analytics
                </h3>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">● LIVE DATA</span>
              </div>

              {/* Real Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-black/8">
                  <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Events Completed</span>
                  <div className="font-serif-cormorant font-bold text-3xl text-[#111111]">{reportCompleted}</div>
                  <span className="text-[10px] text-emerald-600 font-bold">of {displayableEvents.length} total</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-black/8">
                  <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Awaiting Results</span>
                  <div className="font-serif-cormorant font-bold text-3xl text-[#F59E0B]">{reportPending}</div>
                  <span className="text-[10px] text-amber-600 font-bold">events need upload</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-black/8">
                  <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">OCR Drafts</span>
                  <div className="font-serif-cormorant font-bold text-3xl text-[#3B82F6]">{reportDrafts}</div>
                  <span className="text-[10px] text-blue-600 font-bold">pending review</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-black/8">
                  <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Total Users</span>
                  <div className="font-serif-cormorant font-bold text-3xl text-[#111111]">{users.length}</div>
                  <span className="text-[10px] text-[#5F5F5F] font-bold">in Firebase Auth</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-black/8">
                  <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Admins</span>
                  <div className="font-serif-cormorant font-bold text-3xl text-[#10B981]">{reportAdmins}</div>
                  <span className="text-[10px] text-emerald-600 font-bold">approved accounts</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-black/8">
                  <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Audit Events</span>
                  <div className="font-serif-cormorant font-bold text-3xl text-[#7A3CF5]">{auditLogs.length}</div>
                  <span className="text-[10px] text-purple-600 font-bold">actions logged</span>
                </div>
              </div>

              {/* Live House Championship */}
              <div className="p-6 rounded-2xl bg-white border border-black/8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                    House Championship — Live Standings
                  </h4>
                  <span className="text-[10px] text-[#5F5F5F] font-sans-manrope">
                    {results.filter((r) => r.status === 'Published').length} results published
                  </span>
                </div>
                <div className="space-y-3">
                  {houseData.map((house, i) => (
                    <div key={house.id} className="flex items-center gap-3">
                      <span className="text-xs font-extrabold w-14 font-sans-manrope">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '} {house.id}
                      </span>
                      <div className="flex-1 h-2 bg-black/6 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(house.pts / maxPts) * 100}%`, backgroundColor: house.color }}
                        />
                      </div>
                      <span className="text-xs font-extrabold font-sans-manrope w-20 text-right">
                        {house.pts > 0 ? `${house.pts} Pts` : '—'}
                      </span>
                    </div>
                  ))}
                  {houseData.every((h) => h.pts === 0) && (
                    <p className="text-xs text-[#5F5F5F] font-sans-manrope text-center py-4">
                      No house points yet — publish results to see standings here.
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Published Results */}
              <div className="p-6 rounded-2xl bg-white border border-black/8">
                <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] mb-3">Recent Published Results</h4>
                {results.filter((r) => r.status === 'Published').length === 0 ? (
                  <p className="text-xs text-[#5F5F5F] font-sans-manrope">No results published yet.</p>
                ) : (
                  <div className="space-y-2">
                    {results
                      .filter((r) => r.status === 'Published')
                      .slice(0, 10)
                      .map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-xs font-sans-manrope py-2 border-b border-black/5 last:border-0">
                          <div>
                            <span className="font-bold text-[#111111]">{r.eventTitle}</span>
                            <span className="text-[#5F5F5F] ml-2">{r.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#111111]">{r.position} — {r.participantName}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">{r.houseId}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {activeTab === 'ScanResult' && (
          <ScanResultPage onBackToDashboard={() => setActiveTab('Overview')} />
        )}

        {activeTab === 'Results' && <ResultApprovalQueue />}
        {activeTab === 'Announcements' && (
          <div className="space-y-6 text-left">

            {/* Broadcast Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/8 shadow-md space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-black/8">
                <Bell className="w-5 h-5 text-[#FF5E84]" />
                <div>
                  <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                    Broadcast Announcement
                  </h3>
                  <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-0.5">
                    Posts instantly to the live activity ticker visible to all attendees on the website.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111111]">Announcement Type</label>
                    <select
                      value={announcementType}
                      onChange={(e) => setAnnouncementType(e.target.value as AnnouncementType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
                    >
                      <option value="General Notice">General Notice</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Result">Result Announcement</option>
                      <option value="Stage Update">Stage Update</option>
                      <option value="Schedule Change">Schedule Change</option>
                      <option value="Emergency">Emergency Alert</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111111]">Priority Level</label>
                    <select
                      value={announcementPriority}
                      onChange={(e) => setAnnouncementPriority(e.target.value as PriorityLevel)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope font-bold"
                    >
                      <option value="Normal">Normal Priority</option>
                      <option value="Low">Low Priority</option>
                      <option value="Important">Important Priority</option>
                      <option value="Critical">Critical Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">Announcement Content</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter message (e.g. Oppana results will be announced at 4:30 PM on Stage 1)..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-[#5F5F5F] font-sans-manrope">
                    Appears immediately on the public website live ticker.
                  </p>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full gradient-btn-primary text-white font-sans-manrope font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Broadcast →
                  </button>
                </div>
              </form>
            </div>

            {/* Live Feed List */}
            <div className="bg-white rounded-3xl border border-black/8 shadow-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#F59E0B]" />
                  <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                    Live Activity Feed
                  </h4>
                  <span className="text-[10px] font-bold text-[#5F5F5F] bg-black/6 px-2 py-0.5 rounded-full">
                    {liveFeed.length} items
                  </span>
                </div>
                <p className="text-[11px] text-[#5F5F5F] font-sans-manrope hidden sm:block">
                  Deleting an item removes it from the public ticker immediately.
                </p>
              </div>

              {liveFeed.length === 0 ? (
                <div className="px-6 py-12 text-center text-xs text-[#5F5F5F] font-sans-manrope">
                  No announcements yet. Broadcast one above.
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {liveFeed.map((item) => {
                    const typeColors: Record<string, string> = {
                      'Result': 'bg-emerald-100 text-emerald-700',
                      'Emergency': 'bg-red-100 text-red-700',
                      'Stage Update': 'bg-blue-100 text-blue-700',
                      'Schedule Change': 'bg-amber-100 text-amber-700',
                      'Announcement': 'bg-purple-100 text-purple-700',
                      'General Notice': 'bg-black/6 text-[#5F5F5F]',
                    };
                    const badgeClass = typeColors[item.type] || 'bg-black/6 text-[#5F5F5F]';
                    return (
                      <div key={item.id} className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-[#FAF8F5] transition-colors">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${badgeClass}`}>
                              {item.type}
                            </span>
                            <span className="text-[10px] text-[#5F5F5F] font-sans-manrope">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="font-sans-manrope text-xs text-[#111111] leading-relaxed break-words min-w-0">
                            {item.content}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Remove this announcement from the live ticker?')) {
                              deleteAnnouncement(item.id);
                            }
                          }}
                          className="shrink-0 w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* OCR Result Sheet Uploader Modal */}
        <ResultSheetOCRModal
          isOpen={ocrModalOpen}
          draftId={draftIdForReview}
          onClose={() => {
            setOcrModalOpen(false);
            setDraftIdForReview(null);
          }}
        />

        {/* Quick Action OCR & Manual Winner Entry Modal */}
        <EventQuickActionModal
          isOpen={quickModalOpen}
          onClose={() => setQuickModalOpen(false)}
          event={selectedEventForModal}
        />

      </div>
    </section>
  );
};
