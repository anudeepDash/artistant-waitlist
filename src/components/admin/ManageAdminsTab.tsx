'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ManageAdminsTabProps {
  adminUsers: any[];
  onAddAdmin: (e: React.FormEvent) => void;
  onRemoveAdmin: (email: string) => void;
  newAdminEmail: string;
  setNewAdminEmail: (email: string) => void;
}

export default function ManageAdminsTab({
  adminUsers,
  onAddAdmin,
  onRemoveAdmin,
  newAdminEmail,
  setNewAdminEmail,
}: ManageAdminsTabProps) {
  // Filter out the hardcoded super-admin from the dynamic list
  const filteredAdmins = adminUsers.filter(
    (a) => a.email !== 'anudeepdash2004@gmail.com'
  );

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left column: Add Admin */}
      <div className="lg:col-span-1">
        <div className="bg-bg-card border border-line-soft p-8 rounded-3xl sticky top-8">
          <div className="mb-6">
            <h3 className="text-xl font-medium text-ink">Add Admin Access</h3>
            <p className="text-sm text-ink-3 mt-2">
              Grant dashboard access to team members. They must have a Google account.
            </p>
          </div>

          <form onSubmit={onAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-2 mb-2">
                Google Account Email
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="colleague@artistant.io"
                required
                className="w-full bg-bg-soft border border-line-soft rounded-2xl px-4 py-3 text-ink focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!newAdminEmail}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-medium text-white bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Grant Admin Role
            </button>
          </form>
        </div>
      </div>

      {/* Right column: Admin List */}
      <div className="lg:col-span-2">
        <div className="bg-bg-card border border-line-soft p-8 rounded-3xl">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-medium text-ink">Authorized Administrators</h3>
              <p className="text-sm text-ink-3 mt-2">
                Users with full read/write access to this dashboard.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line-soft text-sm font-medium text-ink-3">
                  <th className="pb-4 pr-4 font-medium whitespace-nowrap">User Email</th>
                  <th className="pb-4 px-4 font-medium whitespace-nowrap">Granted By</th>
                  <th className="pb-4 px-4 font-medium whitespace-nowrap">Access Date</th>
                  <th className="pb-4 pl-4 font-medium text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Hardcoded Super Admin */}
                <tr className="border-b border-line-soft/50 group hover:bg-bg-soft/50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#7C5CFF]/10 text-[#7C5CFF] flex items-center justify-center font-medium shrink-0">
                        S
                      </div>
                      <div>
                        <div className="font-medium text-ink">anudeepdash2004@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-ink-2">system</td>
                  <td className="py-4 px-4 text-ink-2 whitespace-nowrap">Jul 1, 2026</td>
                  <td className="py-4 pl-4 text-right">
                    <span className="inline-flex px-2 py-1 bg-[#7C5CFF]/10 text-[#7C5CFF] text-xs font-medium rounded-lg">
                      Super-Admin
                    </span>
                  </td>
                </tr>

                {/* Dynamic Admins */}
                {filteredAdmins.map((admin) => (
                  <tr
                    key={admin.email}
                    className="border-b last:border-b-0 border-line-soft/50 group hover:bg-bg-soft/50 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-medium shrink-0 uppercase">
                          {admin.email.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-ink">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-ink-2">{admin.added_by || 'unknown'}</td>
                    <td className="py-4 px-4 text-ink-2 whitespace-nowrap">
                      {admin.created_at
                        ? new Date(admin.created_at).toLocaleDateString()
                        : 'Unknown'}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => onRemoveAdmin(admin.email)}
                        className="p-2 text-hot/70 hover:text-hot hover:bg-hot/10 rounded-xl transition-colors inline-flex"
                        title="Remove Admin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-ink-3">
                      No additional administrators found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
