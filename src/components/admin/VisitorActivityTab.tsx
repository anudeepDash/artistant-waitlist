'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, Lock, Users } from 'lucide-react';
import { parseUserAgent } from './shared';

interface VisitorActivityTabProps {
  activityLogs: any[];
  totalRegistrations: number;
}

export default function VisitorActivityTab({
  activityLogs,
  totalRegistrations,
}: VisitorActivityTabProps) {
  const [activitySearch, setActivitySearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  const filteredLogs = activityLogs.filter((log) => {
    if (activityFilter !== 'all' && log.action_type !== activityFilter) return false;
    if (activitySearch) {
      const query = activitySearch.toLowerCase();
      const emailMatch = log.email?.toLowerCase().includes(query);
      const usernameMatch = log.username?.toLowerCase().includes(query);
      const refMatch = log.referrer?.toLowerCase().includes(query);
      return emailMatch || usernameMatch || refMatch;
    }
    return true;
  });

  const visitCount = activityLogs.filter((l) => l.action_type === 'visit').length;
  const uniqueLoginsCount = new Set(
    activityLogs.filter((l) => l.action_type === 'login').map((l) => l.email || l.user_id)
  ).size;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card border border-line-soft rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-lg text-left">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider">
                Total Traffic (Visits)
              </p>
              <h3 className="text-3xl font-display font-extrabold mt-2 text-ink">
                {visitCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-bg-soft border border-line-soft flex items-center justify-center">
              <Globe className="w-5 h-5 text-brand" />
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-line-soft rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-lg text-left">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider">
                Distinct Logins
              </p>
              <h3 className="text-3xl font-display font-extrabold mt-2 text-ink">
                {uniqueLoginsCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-bg-soft border border-line-soft flex items-center justify-center">
              <Lock className="w-5 h-5 text-brand" />
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-line-soft rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-lg text-left">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider">
                Total Waitlisted
              </p>
              <h3 className="text-3xl font-display font-extrabold mt-2 text-ink">
                {totalRegistrations}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-bg-soft border border-line-soft flex items-center justify-center">
              <Users className="w-5 h-5 text-brand" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-bg-card border border-line-soft rounded-3xl p-8 space-y-6 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="text-left">
            <h3 className="text-lg font-display font-bold text-ink uppercase tracking-tight">
              Recent Session Actions
            </h3>
            <p className="text-xs text-ink-2 mt-1">
              Real-time developer & visitor logs on the platform
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-ink-3 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search email, user..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:border-[#7C5CFF] focus:ring-4 focus:ring-[#7C5CFF]/15 transition-all outline-none"
              />
            </div>

            {/* Filter Select */}
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#7C5CFF] transition-all cursor-pointer font-mono font-bold uppercase tracking-wider"
            >
              <option value="all">All Events</option>
              <option value="visit">Visits Only</option>
              <option value="login">Logins Only</option>
              <option value="waitlist_register">Waitlist Registrations</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-line-soft text-[9px] font-mono text-ink-3 uppercase tracking-widest text-left">
                <th className="pb-3.5 font-bold w-[22%]">Time</th>
                <th className="pb-3.5 font-bold w-[16%]">Event Node</th>
                <th className="pb-3.5 font-bold w-[24%]">User Identity</th>
                <th className="pb-3.5 font-bold w-[22%]">Browser / OS</th>
                <th className="pb-3.5 font-bold w-[16%]">Referrer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft/30">
              <AnimatePresence>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-mono hover:bg-bg-card-hover/20 transition-colors text-left"
                  >
                    <td className="py-4 text-ink-2">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-4">
                      {log.action_type === 'visit' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase bg-bg-soft text-ink-3 border border-line-soft">
                          VISIT
                        </span>
                      )}
                      {log.action_type === 'login' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20">
                          LOGIN
                        </span>
                      )}
                      {log.action_type === 'waitlist_register' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase bg-[#F25A2B]/10 text-[#F25A2B] border border-[#F25A2B]/20">
                          REGISTRATION
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-bold text-ink truncate">
                      {log.username ? `@${log.username}` : log.email || 'Anonymous Visitor'}
                    </td>
                    <td className="py-4 text-ink-3 truncate max-w-[200px]" title={log.user_agent}>
                      {parseUserAgent(log.user_agent)}
                    </td>
                    <td className="py-4 text-ink-2 truncate">{log.referrer || 'Direct Link'}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-3 font-mono text-xs">
                    No activity logs captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
