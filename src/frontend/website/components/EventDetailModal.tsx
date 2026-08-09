import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Users, Award, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import type { EventModel } from '../../../shared/types/festivalTypes';
import { houseColors } from '../../../shared/tokens/designTokens';
import { formatTime12Hour } from '../../../utils/timeUtils';

interface EventDetailModalProps {
  event: EventModel | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  const { results } = useFestival();

  // Press ESC to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!event) return null;

  const eventResults = results.filter((r) => r.eventId === event.id && (r.status === 'Published' || r.status === 'Verified'));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ongoing':
      case 'LIVE NOW':
        return <span className="bg-red-500/15 text-red-600 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase animate-pulse">● LIVE NOW</span>;
      case 'Completed':
        if (eventResults.length > 0) {
          return <span className="bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">Published</span>;
        } else {
          return <span className="bg-blue-500/15 text-blue-700 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">Completed • Results Awaiting Publication</span>;
        }
      case 'Judging':
        return <span className="bg-amber-500/15 text-amber-700 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">Under Judging</span>;
      default:
        return <span className="bg-blue-500/15 text-blue-600 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">Upcoming</span>;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] rounded-[32px] max-w-3xl w-full overflow-hidden shadow-2xl border border-black/10 relative my-8 text-left cursor-default"
      >
        
        {/* Header Banner */}
        <div className="p-8 bg-gradient-to-r from-[#111111] via-[#1A1A1A] to-[#2B2B2B] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {getStatusBadge(event.status)}
            <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              Category: {event.category}
            </span>
          </div>

          <h2 className="font-serif-cormorant font-bold text-3xl sm:text-4xl text-white">
            {event.eventName}
          </h2>

          <div className="flex flex-wrap items-center gap-6 mt-4 text-xs font-sans-manrope text-white/80">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#FF5E84]" />
              <strong>{event.stage ? `${event.stage} - ${event.venue}` : event.venue || 'TBA'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#F59E0B]" />
              <strong>{event.date || 'TBA'}</strong>
            </span>
            <div className="flex items-center gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-sans-manrope font-extrabold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Time
                  </span>
                  <p className="font-sans-manrope font-bold text-sm text-white">
                    {formatTime12Hour(event.scheduledStartTime)} {event.delayMinutes > 0 ? <span className="text-red-400">(+{event.delayMinutes}m)</span> : null}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-sans-manrope font-extrabold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Participation
                  </span>
                  <p className="font-sans-manrope font-bold text-sm text-white">
                    {event.type}
                  </p>
                </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Rules & Guidelines Section */}
          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-2xs space-y-3">
            <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF5E84]" />
              <span>RULES & COMPETITION GUIDELINES</span>
            </h4>

            <ul className="space-y-2 text-xs font-sans-manrope text-[#5F5F5F]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Language: {event.language || 'N/A'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Official CBSE festival rules apply.</span>
              </li>
            </ul>
          </div>

          {/* Winners Section if completed */}
          {eventResults.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-2xs space-y-3">
              <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-[#EF4444]" />
                <span>OFFICIAL VERIFIED WINNERS</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {eventResults.map((res) => {
                  const hInfo = houseColors[res.houseId];
                  return (
                    <div
                      key={res.id}
                      className="bg-[#FAF8F5] rounded-xl p-3.5 border border-black/5 text-center space-y-1 relative overflow-hidden"
                    >
                      <div
                        className="absolute top-0 inset-x-0 h-1"
                        style={{ backgroundColor: hInfo.primary }}
                      />
                      <span className="text-sm">
                        {res.position === '1st' ? '🥇 1st Place' : res.position === '2nd' ? '🥈 2nd Place' : '🥉 3rd Place'}
                      </span>
                      <h5 className="font-sans-manrope font-extrabold text-xs text-[#111111]">
                        {res.participantName}
                      </h5>
                      <span
                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: hInfo.lightBg, color: hInfo.text }}
                      >
                        {res.houseId} House • {res.studentClass}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-black/8 bg-white text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#111111] text-white font-sans-manrope font-bold text-xs hover:bg-[#FF5E84] transition-colors cursor-pointer"
          >
            Close Event Details
          </button>
        </div>

      </div>
    </div>
  );
};
