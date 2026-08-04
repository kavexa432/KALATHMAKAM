import React, { useState } from 'react';
import { Shield, UserPlus, Check } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';

export const RBACMatrix: React.FC = () => {
  const { users, togglePermission, createAdminUser, removeUser, currentUser } = useFestival();
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const allPermissions = [
    'Events',
    'Results',
    'Leaderboard',
    'Gallery',
    'Announcements',
    'Houses',
    'Analytics',
    'Settings',
  ];

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;
    createAdminUser(newAdminName, newAdminEmail);
    setNewAdminName('');
    setNewAdminEmail('');
  };

  const isDev = currentUser?.role === 'Developer';

  return (
    <div className="space-y-6 text-left">
      
      {/* Create New Admin User Form (Developer Only) */}
      {isDev && (
        <div className="bg-white rounded-2xl p-6 border border-black/8 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/6">
            <UserPlus className="w-4 h-4 text-[#3B82F6]" />
            <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider">
              CREATE ADMIN ACCOUNT (DEVELOPER EXCLUSIVE CONTROL)
            </h4>
          </div>

          <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Admin Full Name"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope"
            />
            <input
              type="email"
              required
              placeholder="admin@mgm.edu"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-sans-manrope font-bold text-xs cursor-pointer"
            >
              + Create Admin User
            </button>
          </form>
        </div>
      )}

      {/* RBAC Permission Grid Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-black/8 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-black/6">
          <Shield className="w-4 h-4 text-[#10B981]" />
          <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider">
            GRANULAR ROLE-BASED ACCESS CONTROL (RBAC PERMISSION MATRIX)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans-manrope border-collapse">
            <thead>
              <tr className="border-b border-black/8 text-[#5F5F5F] uppercase text-[10px] font-extrabold">
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Role</th>
                {allPermissions.map((perm) => (
                  <th key={perm} className="py-2.5 px-2 text-center">{perm}</th>
                ))}
                {isDev && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#111111] block">{u.name}</span>
                    <span className="text-[10px] text-[#5F5F5F]">{u.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        u.role === 'Developer'
                          ? 'bg-blue-500/15 text-blue-700'
                          : 'bg-amber-500/15 text-amber-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  {allPermissions.map((perm) => {
                    const hasPerm = u.permissions.includes(perm);
                    return (
                      <td key={perm} className="py-3 px-2 text-center">
                        <button
                          disabled={!isDev || u.role === 'Developer'}
                          onClick={() => togglePermission(u.id, perm)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-colors ${
                            hasPerm
                              ? 'bg-emerald-500 text-white'
                              : 'bg-black/5 text-transparent hover:bg-black/10'
                          } ${isDev && u.role !== 'Developer' ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          {hasPerm && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </td>
                    );
                  })}

                  {isDev && (
                    <td className="py-3 px-3 text-right">
                      {u.role !== 'Developer' && (
                        <button
                          onClick={() => removeUser(u.id)}
                          className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
