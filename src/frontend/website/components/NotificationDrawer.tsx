import React from 'react';
import { X, Bell, AlertTriangle, Trophy, Calendar, Info } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import type { LiveActivityFeedItem } from '../../../shared/types/festivalTypes';
import { houseColors } from '../../../shared/tokens/designTokens';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { liveFeed, markFeedRead } = useFestival();

  if (!isOpen) return null;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <span className="bg-red-500/15 text-red-600 border border-red-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Critical</span>;
      case 'Important':
        return <span className="bg-amber-500/15 text-amber-700 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Important</span>;
      default:
        return <span className="bg-blue-500/15 text-blue-600 border border-blue-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Update</span>;
    }
  };

  const getIcon = (item: LiveActivityFeedItem) => {
    if (item.type === 'Result') return <Trophy className="w-4 h-4 text-[#F59E0B]" />;
    if (item.type === 'Schedule Change') return <Calendar className="w-4 h-4 text-[#3B82F6]" />;
    if (item.priority === 'Critical') return <AlertTriangle className="w-4 h-4 text-[#EF4444]" />;
    return <Info className="w-4 h-4 text-[#10B981]" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col border-l border-black/10">
        
        {/* Header */}
        <div className="p-5 border-b border-black/8 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF5E84]/12 text-[#FF5E84] flex items-center justify-center">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-sans-manrope font-extrabold text-base text-[#111111]">
                Live Notifications
              </h3>
              <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                Kalathmakam 2K26 Activity Ticker
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              markFeedRead();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#5F5F5F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Ticker Feed Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {liveFeed.map((item) => {
            const hColor = item.houseId ? houseColors[item.houseId]?.primary : undefined;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-2xs border border-black/5 flex gap-3 relative overflow-hidden"
              >
                {hColor && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: hColor }}
                  />
                )}

                <div className="shrink-0 pt-0.5">{getIcon(item)}</div>

                <div className="flex-1 text-left space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#5F5F5F]">{item.timestamp}</span>
                    {getPriorityBadge(item.priority)}
                  </div>

                  <p className="font-sans-manrope text-xs text-[#111111] leading-relaxed font-semibold">
                    {item.content}
                  </p>

                  {item.houseId && (
                    <span
                      className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md mt-1"
                      style={{
                        backgroundColor: houseColors[item.houseId]?.lightBg,
                        color: houseColors[item.houseId]?.text,
                      }}
                    >
                      {item.houseId} House
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/8 bg-white text-center">
          <button
            onClick={() => {
              markFeedRead();
              onClose();
            }}
            className="w-full py-2.5 rounded-full bg-black/5 hover:bg-black/10 text-xs font-bold text-[#111111]"
          >
            Mark All as Read & Close
          </button>
        </div>

      </div>
    </div>
  );
};
