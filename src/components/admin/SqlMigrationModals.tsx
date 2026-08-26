'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, ExternalLink, Database } from 'lucide-react';

interface SqlMigrationModalsProps {
  showSqlMigration: boolean;
  setShowSqlMigration: (show: boolean) => void;
  showCareersSqlModal: boolean;
  setShowCareersSqlModal: (show: boolean) => void;
  showSettingsSqlModal: boolean;
  setShowSettingsSqlModal: (show: boolean) => void;
  showToast: (msg: string) => void;
}

export default function SqlMigrationModals({
  showSqlMigration,
  setShowSqlMigration,
  showCareersSqlModal,
  setShowCareersSqlModal,
  showSettingsSqlModal,
  setShowSettingsSqlModal,
  showToast,
}: SqlMigrationModalsProps) {
  return (
    <>
      {/* SQL Migration Script Modal (Booking Requests) */}
      <AnimatePresence>
        {showSqlMigration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-bg-card border border-line-soft rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              <div className="p-6 border-b border-line-soft flex items-center justify-between bg-bg-soft/30">
                <div>
                  <h3 className="text-base font-display font-bold text-ink uppercase tracking-tight">
                    Supabase Migration: Booking Requests Table
                  </h3>
                  <p className="text-xs text-ink-2 mt-0.5">
                    Copy and run this SQL script in your Supabase SQL Editor
                  </p>
                </div>
                <button
                  onClick={() => setShowSqlMigration(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-bg-soft border border-line-soft text-ink-3 hover:text-ink transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-line-soft text-emerald-400 overflow-x-auto text-[11px] leading-relaxed select-all">
                  <pre>{`-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gpuedwozcbzlkhdkcebm/sql/new

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_username text NOT NULL,
  artist_display_name text,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  event_date text NOT NULL,
  city text NOT NULL,
  event_type text NOT NULL,
  budget text,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_artist_username ON public.booking_requests(artist_username);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at ON public.booking_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests(status);

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.booking_requests TO service_role, anon, authenticated;

DROP POLICY IF EXISTS "Allow public insert to booking_requests" ON public.booking_requests;
CREATE POLICY "Allow public insert to booking_requests"
  ON public.booking_requests FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select booking_requests" ON public.booking_requests;
CREATE POLICY "Allow select booking_requests"
  ON public.booking_requests FOR SELECT TO anon, authenticated, service_role USING (true);

DROP POLICY IF EXISTS "Allow update booking_requests" ON public.booking_requests;
CREATE POLICY "Allow update booking_requests"
  ON public.booking_requests FOR UPDATE TO anon, authenticated, service_role USING (true);

DROP POLICY IF EXISTS "Allow delete booking_requests" ON public.booking_requests;
CREATE POLICY "Allow delete booking_requests"
  ON public.booking_requests FOR DELETE TO anon, authenticated, service_role USING (true);`}</pre>
                </div>
              </div>

              <div className="p-5 border-t border-line-soft bg-bg-soft/30 flex items-center justify-between">
                <a
                  href="https://supabase.com/dashboard/project/gpuedwozcbzlkhdkcebm/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-[#7C5CFF] hover:underline flex items-center gap-1.5 font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Supabase SQL Editor &rarr;
                </a>
                <button
                  onClick={() => {
                    const sqlText = `-- Run this script in the Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_username text NOT NULL,
  artist_display_name text,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  event_date text NOT NULL,
  city text NOT NULL,
  event_type text NOT NULL,
  budget text,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_artist_username ON public.booking_requests(artist_username);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at ON public.booking_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests(status);

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.booking_requests TO service_role, anon, authenticated;

DROP POLICY IF EXISTS "Allow public insert to booking_requests" ON public.booking_requests;
CREATE POLICY "Allow public insert to booking_requests"
  ON public.booking_requests FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select booking_requests" ON public.booking_requests;
CREATE POLICY "Allow select booking_requests"
  ON public.booking_requests FOR SELECT TO anon, authenticated, service_role USING (true);

DROP POLICY IF EXISTS "Allow update booking_requests" ON public.booking_requests;
CREATE POLICY "Allow update booking_requests"
  ON public.booking_requests FOR UPDATE TO anon, authenticated, service_role USING (true);

DROP POLICY IF EXISTS "Allow delete booking_requests" ON public.booking_requests;
CREATE POLICY "Allow delete booking_requests"
  ON public.booking_requests FOR DELETE TO anon, authenticated, service_role USING (true);`;
                    navigator.clipboard.writeText(sqlText);
                    showToast("SQL script copied to clipboard!");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7C5CFF] text-white text-xs font-mono font-bold hover:bg-[#6a49ff] transition-all cursor-pointer shadow-md"
                >
                  Copy SQL Script
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Careers SQL Modal */}
      <AnimatePresence>
        {showCareersSqlModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-red-500/30 p-8 rounded-3xl max-w-2xl w-full shadow-2xl space-y-6 text-left relative"
            >
              <button
                onClick={() => setShowCareersSqlModal(false)}
                className="absolute top-6 right-6 text-ink-3 hover:text-ink transition-colors cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div>
                <h3 className="font-bold text-xl text-red-500 mb-2 flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Database Missing Tables
                </h3>
                <p className="text-sm text-ink-2">
                  The <code className="bg-bg-soft px-1 rounded">career_jobs</code> and <code className="bg-bg-soft px-1 rounded">career_applications</code> tables are missing. Please run the SQL migration script provided in <code className="bg-bg-soft px-1 rounded text-[#7C5CFF]">supabase_migration_careers.sql</code> in your Supabase SQL Editor.
                </p>
              </div>

              <div className="pt-4 border-t border-line-soft">
                <button
                  onClick={() => setShowCareersSqlModal(false)}
                  className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Site Settings SQL Modal */}
      <AnimatePresence>
        {showSettingsSqlModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-red-500/30 p-8 rounded-3xl max-w-2xl w-full shadow-2xl space-y-6 text-left relative"
            >
              <button
                onClick={() => setShowSettingsSqlModal(false)}
                className="absolute top-6 right-6 text-ink-3 hover:text-ink transition-colors cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div>
                <h3 className="font-bold text-xl text-red-500 mb-2 flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Database Missing Table
                </h3>
                <p className="text-sm text-ink-2">
                  The <code className="bg-bg-soft px-1 rounded">site_settings</code> table is missing. Please run the corresponding SQL migration script in your Supabase SQL Editor to enable Global Site Configurations.
                </p>
              </div>

              <div className="pt-4 border-t border-line-soft">
                <button
                  onClick={() => setShowSettingsSqlModal(false)}
                  className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
