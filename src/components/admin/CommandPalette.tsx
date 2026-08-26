'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BarChart3, Users, Mail, Calendar, Eye, X } from 'lucide-react';
import { AdminWaitlistEntry } from '@/lib/waitlist';

interface CommandPaletteProps {
  show: boolean;
  onClose: () => void;
  registrations: AdminWaitlistEntry[];
  onTabSelect: (tabId: string) => void;
  onUserSelect: (reg: AdminWaitlistEntry) => void;
}

const TABS = [
  { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
  { id: 'directory', label: 'Waitlist Directory', icon: Users },
  { id: 'broadcast', label: 'Broadcast Studio', icon: Mail },
  { id: 'bookings', label: 'Booking Requests', icon: Calendar },
  { id: 'activity', label: 'Visitor Activity', icon: Eye },
];

export default function CommandPalette({ show, onClose, registrations, onTabSelect, onUserSelect }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      setSearch('');
      // Slight delay to allow modal to render before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  const filteredRegistrations = search.trim() === '' 
    ? [] 
    : registrations.filter(r => 
        (r.display_name && r.display_name.toLowerCase().includes(search.toLowerCase())) ||
        (r.username && r.username.toLowerCase().includes(search.toLowerCase())) ||
        (r.email && r.email.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 5);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl bg-bg-card border border-line-soft rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
          >
            <div className="flex items-center border-b border-line-soft p-4 gap-3 relative">
              <Search className="w-5 h-5 text-ink-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users or type a command..."
                className="w-full bg-transparent outline-none text-ink text-lg placeholder:text-ink-3"
              />
              <button 
                onClick={onClose}
                className="flex items-center justify-center p-1.5 hover:bg-bg-soft rounded-md transition-colors text-ink-3 hover:text-ink"
              >
                <span className="text-xs font-mono mr-1">ESC</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-2">
              {search.trim() !== '' ? (
                <div className="py-2">
                  <h3 className="px-3 text-xs font-medium text-ink-3 uppercase tracking-wider mb-2">Users</h3>
                  {filteredRegistrations.length > 0 ? (
                    <div className="space-y-1">
                      {filteredRegistrations.map((reg) => (
                        <button
                          key={reg.id}
                          onClick={() => {
                            onUserSelect(reg);
                            onClose();
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-bg-soft flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <div className="text-ink font-medium">{reg.display_name || reg.username || 'Anonymous'}</div>
                            <div className="text-sm text-ink-3">{reg.email}</div>
                          </div>
                          <div className="text-xs text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                            View Profile
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-ink-3">
                      No results found for "{search}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2">
                  <h3 className="px-3 text-xs font-medium text-ink-3 uppercase tracking-wider mb-2">Management Tabs</h3>
                  <div className="space-y-1">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onTabSelect(tab.id);
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-bg-soft flex items-center gap-3 group transition-colors text-ink"
                      >
                        <tab.icon className="w-4 h-4 text-ink-3 group-hover:text-brand transition-colors" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
