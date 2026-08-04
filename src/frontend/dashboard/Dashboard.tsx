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
  UserCheck,
  UserX,
  Sparkles,
  FileSpreadsheet,
  Lock,
  Code,
} from 'lucide-react';
import { useFestival } from '../../shared/context/FestivalContext';
import { ResultApprovalQueue } from './components/ResultApprovalQueue';
import { AuditLogsTable } from './components/AuditLogsTable';
import { ResultSheetOCRModal } from './components/ResultSheetOCRModal';
import type { AnnouncementType, PriorityLevel, HouseId } from '../../shared/types/festivalTypes';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    logout,
    archiveMode,
    toggleArchiveMode,
    results,
    users,
    auditLogs,
    addAnnouncement,
    setUserRole,
    submitResult,
  } = useFestival();

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Results' | 'OCRUpload' | 'QRScan' | 'Announcements' | 'UserManagement' | 'AuditLogs' | 'Reports'
  >('Overview');

  const [ocrModalOpen, setOcrModalOpen] = useState(false);

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

  const pendingResultsCount = results.filter((r) => r.status === 'Pending Review').length;

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

  return (
    <section id="control-center" className="relative py-12 bg-[#FAF8F5] border-t border-black/8">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
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
              {/* Primary OCR Result Sheet Button */}
              <button
                onClick={() => setOcrModalOpen(true)}
                className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Result Sheet (OCR)</span>
              </button>

              {isDev && (
                <button
                  onClick={toggleArchiveMode}
                  className={`px-4 py-2 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                    archiveMode
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white text-[#5F5F5F] border-black/10 hover:text-[#111111]'
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
              onClick={() => setOcrModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-sans-manrope font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Upload Sheet (OCR)</span>
            </button>

            <button
              onClick={() => setActiveTab('QRScan')}
              className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'QRScan'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/5'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#FF5E84]" />
              <span>QR Scanner & Score Entry</span>
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
              <span>Results Approval ({pendingResultsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('Announcements')}
              className={`px-5 py-2.5 rounded-full font-sans-manrope font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'Announcements'
                  ? 'bg-[#111111] text-[#5F5F5F] shadow-sm'
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
                <span>User & Role Management</span>
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
                <div className="font-serif-cormorant font-bold text-4xl text-[#111111]">18</div>
                <span className="text-[11px] text-[#10B981] font-bold">● Live Stage Operations</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-2xs">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Pending Results</span>
                <div className="font-serif-cormorant font-bold text-4xl text-[#F59E0B]">{pendingResultsCount || 4}</div>
                <span className="text-[11px] text-[#5F5F5F] font-bold">Awaiting Final Sign-off</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-2xs">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Images Uploaded</span>
                <div className="font-serif-cormorant font-bold text-4xl text-[#3B82F6]">126</div>
                <span className="text-[11px] text-[#5F5F5F] font-bold">In Gallery Vault</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-2xs">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Leaderboard Updated</span>
                <div className="font-serif-cormorant font-bold text-3xl text-[#EF4444]">NOVA (450 Pts)</div>
                <span className="text-[11px] text-[#10B981] font-bold">Updated 2 min ago</span>
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
          <div className="bg-white rounded-3xl p-8 border border-black/8 shadow-md text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/8">
              <div>
                <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                  User & Role Management (Developer Authority)
                </h3>
                <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                  Promote registered users to Developer or Admin role, or revoke access. Registered Google users start as <code>role: user</code> until granted privileges here.
                </p>
              </div>
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans-manrope">
                <thead>
                  <tr className="border-b border-black/10 text-[#5F5F5F] font-extrabold uppercase">
                    <th className="py-3 px-4">User Account</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Access Level</th>
                    <th className="py-3 px-4 text-right">Developer Role Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {users.map((u) => {
                    const uIsDev = u.role === 'developer' || u.role === 'Developer';
                    const uIsAdmin = (u.role === 'admin' || u.role === 'Admin') && u.approved;

                    return (
                      <tr key={u.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-4 font-extrabold text-[#111111]">
                          {u.name}
                        </td>
                        <td className="py-3.5 px-4 text-[#5F5F5F]">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              uIsDev
                                ? 'bg-blue-100 text-blue-800'
                                : uIsAdmin
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {uIsDev ? (
                            <span className="text-blue-600 font-bold">System Developer</span>
                          ) : uIsAdmin ? (
                            <span className="text-emerald-600 font-bold">✓ Approved Admin</span>
                          ) : (
                            <span className="text-slate-500 font-medium">Public User (No Dashboard)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Make Developer Button */}
                            {!uIsDev && (
                              <button
                                onClick={() => setUserRole(u.id, 'developer')}
                                className="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Code className="w-3 h-3" />
                                <span>Make Developer</span>
                              </button>
                            )}

                            {/* Make Admin / Remove Admin Button */}
                            {!uIsDev && (
                              <button
                                onClick={() => setUserRole(u.id, uIsAdmin ? 'user' : 'admin')}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  uIsAdmin
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-2xs'
                                }`}
                              >
                                {uIsAdmin ? (
                                  <>
                                    <UserX className="w-3 h-3" />
                                    <span>Demote to User</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Make Admin</span>
                                  </>
                                )}
                              </button>
                            )}

                            {uIsDev && currentUser.id !== u.id && (
                              <button
                                onClick={() => setUserRole(u.id, 'user')}
                                className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                              >
                                Demote Developer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
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
        {activeTab === 'Reports' && isDev && (
          <div className="bg-[#FAF8F5] rounded-3xl p-8 border border-black/8 shadow-md text-left space-y-6">
            <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
              System Reports & Festival Analytics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-black/8">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Events Completed</span>
                <div className="font-serif-cormorant font-bold text-3xl text-[#111111]">18</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-black/8">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Pending</span>
                <div className="font-serif-cormorant font-bold text-3xl text-[#F59E0B]">5</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-black/8">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Images Uploaded</span>
                <div className="font-serif-cormorant font-bold text-3xl text-[#3B82F6]">302</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-black/8">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Total Users</span>
                <div className="font-serif-cormorant font-bold text-3xl text-[#111111]">{users.length}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-black/8">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Active Admins</span>
                <div className="font-serif-cormorant font-bold text-3xl text-[#10B981]">
                  {users.filter((u) => u.role === 'admin' || u.role === 'Admin' || u.role === 'developer' || u.role === 'Developer').length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-black/8">
                <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Today's Logins</span>
                <div className="font-serif-cormorant font-bold text-3xl text-[#7A3CF5]">{auditLogs.length + 8}</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-black/8">
              <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] mb-3">
                House Championship Distribution
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold w-20">NOVA</span>
                  <div className="flex-1 h-[#1px] rounded-full bg-red-500" style={{ width: '85%' }} />
                  <span className="text-xs font-bold">450 Pts</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold w-20">VEGA</span>
                  <div className="flex-1 h-[#1px] rounded-full bg-amber-500" style={{ width: '80%' }} />
                  <span className="text-xs font-bold">430 Pts</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold w-20">ORION</span>
                  <div className="flex-1 h-[#1px] rounded-full bg-blue-500" style={{ width: '75%' }} />
                  <span className="text-xs font-bold">400 Pts</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold w-20">ASTRA</span>
                  <div className="flex-1 h-[#1px] rounded-full bg-emerald-500" style={{ width: '70%' }} />
                  <span className="text-xs font-bold">395 Pts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Results' && <ResultApprovalQueue />}
        {activeTab === 'Announcements' && <ResultApprovalQueue />}

        {/* OCR Result Sheet Uploader Modal */}
        <ResultSheetOCRModal
          isOpen={ocrModalOpen}
          onClose={() => setOcrModalOpen(false)}
        />

      </div>
    </section>
  );
};
