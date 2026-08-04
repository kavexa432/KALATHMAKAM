import React from 'react';
import { History } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';

export const AuditLogsTable: React.FC = () => {
  const { auditLogs } = useFestival();

  return (
    <div className="bg-white rounded-2xl p-6 border border-black/8 shadow-2xs space-y-4 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-black/6">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#FF5E84]" />
          <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider">
            SYSTEM AUDIT LOGS & ACTION HISTORY
          </h4>
        </div>
        <span className="text-xs text-[#5F5F5F] font-bold">
          {auditLogs.length} Logged Entries
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {auditLogs.map((log) => (
          <div
            key={log.id}
            className="bg-[#FAF8F5] rounded-xl p-3.5 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans-manrope"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#111111]">{log.user}</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    log.userRole === 'Developer'
                      ? 'bg-blue-500/15 text-blue-700'
                      : 'bg-amber-500/15 text-amber-700'
                  }`}
                >
                  {log.userRole}
                </span>
                <span className="text-[10px] text-[#5F5F5F]">• {log.timestamp}</span>
              </div>
              <p className="font-semibold text-[#111111]">{log.action}: <span className="text-[#5F5F5F] font-normal">{log.details}</span></p>
            </div>

            <span className="text-[10px] font-bold text-[#5F5F5F] bg-white px-2.5 py-1 rounded-md border border-black/5 shrink-0">
              Entity: {log.entity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
