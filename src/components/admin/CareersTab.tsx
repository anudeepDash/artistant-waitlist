'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  AlertTriangle,
  Database,
  Loader2,
  Plus,
  Trash2,
  MapPin,
  Clock,
  IndianRupee,
  ExternalLink,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Check,
  UserCheck,
  FileText
} from 'lucide-react';
import { 
  CareerJob, 
  CareerApplication,
  adminGetCareerJobsAction,
  adminCreateCareerJobAction,
  adminDeleteCareerJobAction,
  adminGetCareerApplicationsAction,
  adminUpdateCareerApplicationStatusAction
} from '@/lib/admin-actions';

interface CareersTabProps {
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  showToast: (msg: string) => void;
  setShowCareersSqlModal: (show: boolean) => void;
  careersError: string | null;
  setCareersError: (err: string | null) => void;
}

export default function CareersTab({
  getIdToken,
  showToast,
  setShowCareersSqlModal,
  careersError,
  setCareersError
}: CareersTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'applications'>('jobs');
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    department: "Engineering",
    location: "Remote / Bengaluru",
    job_type: "Full-Time",
    experience_level: "3 - 5 Years",
    salary_range: "₹18L - ₹30L + Equity",
    description: "",
    requirements: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const dataJobs = await adminGetCareerJobsAction();
      setJobs(dataJobs);
      
      const token = await getIdToken();
      if (token) {
        const dataApps = await adminGetCareerApplicationsAction(token);
        setApplications(dataApps);
      }
      
      setCareersError(null);
    } catch (err: any) {
      console.error("Error fetching careers data:", err);
      setCareersError(err.message || "Failed to load from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getIdToken();
      if (!token) return;
      
      const reqsArray = newJob.requirements.split('\n').filter(r => r.trim() !== '');
      
      const res = await adminCreateCareerJobAction(token, {
        ...newJob,
        requirements: reqsArray,
        is_active: true
      });
      
      if (res.success && res.job) {
        setJobs(prev => [res.job!, ...prev]);
        setShowCreateModal(false);
        showToast("Job opportunity posted successfully!");
        setNewJob({
          title: "", department: "Engineering", location: "Remote / Bengaluru",
          job_type: "Full-Time", experience_level: "3 - 5 Years",
          salary_range: "₹18L - ₹30L + Equity", description: "", requirements: ""
        });
      }
    } catch (err) {
      console.error("Error creating job:", err);
      showToast("Failed to create job posting");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const token = await getIdToken();
      if (token) {
        await adminDeleteCareerJobAction(token, jobId);
      }
      setJobs(prev => prev.filter(j => j.id !== jobId));
      showToast("Job posting deleted.");
    } catch (err: any) {
      console.error("Error deleting job:", err);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      showToast("Job posting removed.");
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected') => {
    try {
      const token = await getIdToken();
      if (!token) return;
      
      const res = await adminUpdateCareerApplicationStatusAction(token, appId, status);
      if (res) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
        showToast(`Application marked as ${status}`);
      }
    } catch (err) {
      console.error("Error updating app status:", err);
    }
  };

  return (
    <div className="w-full space-y-6 text-left">
      {/* Top Header Card */}
      <div className="bg-bg-card border border-line-soft rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F25A2B] to-[#7C5CFF] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-ink tracking-tight">Careers & Opportunities</h2>
              <p className="text-xs text-ink-3 mt-0.5">Manage open positions and candidate applications</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1.5 bg-bg-soft/80 border border-line-soft p-1 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setActiveSubTab("jobs")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "jobs"
                  ? "bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-md"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Postings ({jobs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("applications")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "applications"
                  ? "bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-md"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Applications ({applications.length})</span>
              {applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400 text-black">
                  {applications.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {activeSubTab === "jobs" && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white rounded-xl py-2.5 px-5 text-xs font-bold transition-all shadow-lg shadow-[#7C5CFF]/20 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-white/10 uppercase tracking-wider font-mono"
            >
              <Plus className="w-4 h-4" />
              Post Job
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {careersError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-hot/10 border border-hot/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex gap-3 text-hot">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold">Database Table Error</p>
                <p className="opacity-90">{careersError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCareersSqlModal(true)}
              className="px-4 py-2 bg-hot/20 hover:bg-hot/30 text-hot text-xs font-bold font-mono rounded-lg flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              View SQL Fix
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Workspace (Full-Width Consistent Wrapper) */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-bg-card border border-line-soft rounded-3xl backdrop-blur-xl">
          <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
          <p className="text-xs font-mono text-ink-3 mt-4 tracking-widest uppercase font-bold">Loading careers database...</p>
        </div>
      ) : activeSubTab === "jobs" ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-line-soft rounded-3xl bg-bg-card/50">
              <Briefcase className="w-10 h-10 text-ink-3 mx-auto mb-3 opacity-40" />
              <p className="text-ink-3 font-mono text-xs uppercase tracking-wider font-bold">No active job listings found.</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 rounded-xl text-xs font-bold hover:bg-[#7C5CFF]/25 transition-all cursor-pointer"
              >
                + Create First Job Posting
              </button>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-bg-card border border-line-soft p-6 rounded-3xl shadow-xl backdrop-blur-xl relative group flex flex-col justify-between hover:border-[#7C5CFF]/40 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block px-3 py-1 bg-[#F25A2B]/15 text-[#F25A2B] text-[10px] font-mono font-bold uppercase tracking-wider rounded-full border border-[#F25A2B]/20">
                      {job.department}
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 text-ink-3 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors cursor-pointer"
                      title="Delete job posting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-display font-bold text-ink tracking-tight mb-3">
                    {job.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-ink-2 bg-bg-soft border border-line-soft px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3 h-3 text-[#F25A2B]" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-ink-2 bg-bg-soft border border-line-soft px-2.5 py-1 rounded-lg">
                      <Clock className="w-3 h-3 text-[#7C5CFF]" />
                      {job.job_type}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-ink-2 bg-bg-soft border border-line-soft px-2.5 py-1 rounded-lg">
                      <IndianRupee className="w-3 h-3 text-emerald-400" />
                      {job.salary_range}
                    </span>
                  </div>

                  <p className="text-xs text-ink-3 line-clamp-3 mb-6 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-line-soft flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] text-ink-3">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    job.is_active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-ink-3/15 text-ink-3 border border-line-soft'
                  }`}>
                    {job.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Applications Table Workspace */
        <div className="w-full bg-bg-card border border-line-soft rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-soft/60 text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider border-b border-line-soft">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Links & Resume</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-ink-3 font-mono text-xs uppercase tracking-wider">
                      No candidate applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.id} className="hover:bg-bg-soft/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-ink text-sm">{app.applicant_name}</p>
                        <p className="text-[11px] font-mono text-ink-3 mt-0.5">{app.email}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-ink">
                        {app.job_title}
                      </td>
                      <td className="px-6 py-4 text-xs text-ink-2 font-mono">
                        {app.experience_years || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {app.portfolio_url && (
                            <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="text-[#F25A2B] hover:underline flex items-center gap-1 font-mono text-[10.5px] font-bold">
                              Portfolio <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {app.resume_url && (
                            <a href={app.resume_url} target="_blank" rel="noreferrer" className="text-[#7C5CFF] hover:underline flex items-center gap-1 font-mono text-[10.5px] font-bold">
                              Resume <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          app.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                          app.status === 'reviewing' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                          app.status === 'shortlisted' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                          'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          value={app.status}
                          onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                          className="bg-bg-soft border border-line-soft rounded-xl text-xs font-mono font-semibold px-3 py-1.5 focus:outline-none focus:border-[#7C5CFF] cursor-pointer text-ink transition-all"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-line-soft p-8 rounded-3xl max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar relative text-left"
            >
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 text-ink-3 hover:text-ink cursor-pointer transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="border-b border-line-soft pb-5">
                <h3 className="text-lg font-display font-bold text-ink uppercase tracking-tight flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#F25A2B]" />
                  Post New Opportunity
                </h3>
                <p className="text-xs text-ink-2 mt-1">Publish a new role to the careers page.</p>
              </div>

              <form onSubmit={handleCreateJob} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newJob.title}
                    onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-3 text-xs font-semibold focus:border-[#7C5CFF] transition-all outline-none"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Department</label>
                  <input
                    type="text"
                    required
                    value={newJob.department}
                    onChange={(e) => setNewJob(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-3 text-xs font-semibold focus:border-[#7C5CFF] transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Location</label>
                  <input
                    type="text"
                    required
                    value={newJob.location}
                    onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-3 text-xs font-semibold focus:border-[#7C5CFF] transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Job Type</label>
                  <select
                    value={newJob.job_type}
                    onChange={(e) => setNewJob(prev => ({ ...prev, job_type: e.target.value }))}
                    className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-3 text-xs font-semibold focus:border-[#7C5CFF] transition-all outline-none cursor-pointer"
                  >
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Experience Level</label>
                  <input
                    type="text"
                    required
                    value={newJob.experience_level}
                    onChange={(e) => setNewJob(prev => ({ ...prev, experience_level: e.target.value }))}
                    className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-3 text-xs font-semibold focus:border-[#7C5CFF] transition-all outline-none"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Salary Range (Optional)</label>
                  <input
                    type="text"
                    value={newJob.salary_range}
                    onChange={(e) => setNewJob(prev => ({ ...prev, salary_range: e.target.value }))}
                    className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-3 text-xs font-semibold focus:border-[#7C5CFF] transition-all outline-none"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={newJob.description}
                    onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-3 text-xs focus:border-[#7C5CFF] transition-all outline-none resize-none"
                    placeholder="Describe the role and responsibilities..."
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Requirements (One per line)</label>
                  <textarea
                    rows={4}
                    required
                    value={newJob.requirements}
                    onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                    className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-3 text-xs focus:border-[#7C5CFF] transition-all outline-none resize-none whitespace-pre"
                    placeholder="Proficient in React...\n5+ years of experience..."
                  />
                </div>

                <div className="col-span-2 pt-4 flex justify-end gap-3 border-t border-line-soft mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 text-xs font-bold text-ink-3 hover:text-ink cursor-pointer transition-colors uppercase font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white rounded-xl py-2.5 px-6 text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer uppercase font-mono tracking-wider"
                  >
                    Publish Job
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
