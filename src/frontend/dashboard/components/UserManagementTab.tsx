import React, { useState } from 'react';
import { UserCheck, UserX, Shield, Search } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { auth } from '../../../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const UserManagementTab: React.FC = () => {
  const { users, currentUser } = useFestival();
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUid, setLoadingUid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ uid: string; msg: string; ok: boolean } | null>(null);

  const filtered = users.filter((u) =>
    !searchQuery ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grantRole = async (targetUid: string, role: 'admin' | 'user') => {
    setLoadingUid(targetUid);
    setFeedback(null);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken(true) : '';
      const res = await fetch(`${API_URL}/api/auth/grant-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUid, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setFeedback({ uid: targetUid, msg: data.message, ok: true });
    } catch (err: any) {
      setFeedback({ uid: targetUid, msg: err.message, ok: false });
    } finally {
      setLoadingUid(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-black/8 shadow-md text-left overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-black/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-sans-manrope font-extrabold text-sm text-[#111111]">User Access Management</h3>
            <p className="text-[11px] text-[#5F5F5F]">Only you can grant or revoke Admin access. All changes are enforced server-side.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5F5F5F]" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope text-[#111111] w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* User cards */}
      <div className="divide-y divide-black/5">
        {filtered.length === 0 && (
          <div className="px-6 py-10 text-center text-[#5F5F5F] font-sans-manrope text-xs">
            No users found.
          </div>
        )}
        {filtered.map((u) => {
          const isMe = u.id === currentUser?.id;
          const uIsDev = u.role === 'developer' || u.role === 'Developer';
          const uIsAdmin = (u.role === 'admin' || u.role === 'Admin') && u.approved;
          const isLoading = loadingUid === u.id;
          const msg = feedback?.uid === u.id ? feedback : null;

          return (
            <div key={u.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#FAF8F5]">
              {/* Avatar + info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5E84] to-[#F59E0B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans-manrope font-extrabold text-xs text-[#111111] truncate">{u.name}</span>
                    {isMe && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">YOU</span>}
                  </div>
                  <span className="text-[11px] text-[#5F5F5F] truncate block">{u.email}</span>
                  {msg && (
                    <span className={`text-[10px] font-bold ${msg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                      {msg.ok ? '✓ ' : '✗ '}{msg.msg}
                    </span>
                  )}
                </div>
              </div>

              {/* Role badge + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  uIsDev ? 'bg-blue-100 text-blue-800' :
                  uIsAdmin ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {u.role}
                </span>

                {/* Can't modify yourself or other devs */}
                {!isMe && !uIsDev && (
                  <button
                    onClick={() => grantRole(u.id, uIsAdmin ? 'user' : 'admin')}
                    disabled={isLoading}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 ${
                      uIsAdmin
                        ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                    }`}
                  >
                    {isLoading ? (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : uIsAdmin ? (
                      <UserX className="w-3.5 h-3.5" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{uIsAdmin ? 'Remove Admin' : 'Grant Admin'}</span>
                  </button>
                )}

                {uIsDev && !isMe && (
                  <span className="text-[11px] text-[#5F5F5F] font-bold">Developer account</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-3 bg-[#FAF8F5] border-t border-black/6 text-[11px] text-[#5F5F5F] font-sans-manrope">
        💡 When you grant Admin access, the teacher needs to <strong>sign out and sign back in</strong> to receive their updated role.
      </div>
    </div>
  );
};
