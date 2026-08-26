'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogle, signInWithEmail, signOut as firebaseSignOut } from '@/lib/auth';
import type { AdminWaitlistEntry } from '@/lib/waitlist';
import type { BookingRequestEntry } from '@/lib/admin-actions';
import {
  adminGetRegistrationsAction,
  adminGetActivityLogsAction,
  adminGetAdminsAction,
  adminGetBookingRequestsAction,
  adminUpdateRegistrationAction,
  adminAddAdminAction,
  adminRemoveAdminAction,
  adminUpdateBookingRequestStatusAction,
  adminDeleteBookingRequestAction,
  adminUpdateUserRoleAction,
} from '@/lib/admin-actions';

// Extracted Modular Components
import AdminLoginGate from '@/components/admin/AdminLoginGate';
import AdminShell from '@/components/admin/AdminShell';
import OverviewTab from '@/components/admin/OverviewTab';
import RegistrationsTab from '@/components/admin/RegistrationsTab';
import BroadcastStudio from '@/components/BroadcastStudio';
import BookingRequestsTab from '@/components/admin/BookingRequestsTab';
import LeaderboardsTab from '@/components/admin/LeaderboardsTab';
import VisitorActivityTab from '@/components/admin/VisitorActivityTab';
import ManageAdminsTab from '@/components/admin/ManageAdminsTab';
import SiteSettingsTab from '@/components/admin/SiteSettingsTab';
import LinksAndCardsTab from '@/components/admin/LinksAndCardsTab';
import CareersTab from '@/components/admin/CareersTab';
import RegistrationDetailModal from '@/components/admin/RegistrationDetailModal';
import CommandPalette from '@/components/admin/CommandPalette';
import SqlMigrationModals from '@/components/admin/SqlMigrationModals';
import { evaluateAutoVerify } from '@/components/admin/shared';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const getIdToken = useCallback(async (): Promise<string> => {
    if (!user) throw new Error("No active authenticated user session.");
    return await user.getIdToken();
  }, [user]);

  // Core State
  const [mounted, setMounted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Form & Auth State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // Data State
  const [registrations, setRegistrations] = useState<AdminWaitlistEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequestEntry[]>([]);
  const [bookingRequestsError, setBookingRequestsError] = useState<string | null>(null);
  const [siteSettingsError, setSiteSettingsError] = useState<string | null>(null);
  const [careersError, setCareersError] = useState<string | null>(null);

  // Status & Mode State
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Filtering & Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedReg, setSelectedReg] = useState<AdminWaitlistEntry | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Broadcast Studio State
  const [emailAudienceMode, setEmailAudienceMode] = useState('filtered');

  // Modals & Overlays State
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSqlMigration, setShowSqlMigration] = useState(false);
  const [showCareersSqlModal, setShowCareersSqlModal] = useState(false);
  const [showSettingsSqlModal, setShowSettingsSqlModal] = useState(false);

  // Mounting Effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Toast Helper
  const triggerToast = useCallback((msg: string) => {
    setShowToast(msg);
  }, []);

  // Keyboard Navigation Effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Authentication & Verification Loaders
  const verifyAndLoad = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setAuthError('');
    setDbError(null);
    try {
      const idToken = await getIdToken();
      let bErrorMsg: string | null = null;
      const [regs, logs, admins, bRequests] = await Promise.all([
        adminGetRegistrationsAction(idToken),
        adminGetActivityLogsAction(idToken),
        adminGetAdminsAction(idToken),
        adminGetBookingRequestsAction(idToken).catch((err) => {
          console.warn('Error fetching booking requests:', err);
          bErrorMsg = err?.message || 'Failed to fetch booking requests from database';
          return [];
        }),
      ]);
      setRegistrations(regs);
      setActivityLogs(logs);
      setAdminUsers(admins);
      setBookingRequests(bRequests || []);
      setBookingRequestsError(bErrorMsg);
      setIsLiveMode(true);
      setIsUnlocked(true);
      if (!isSilent) triggerToast('Connected to Live Database.');
    } catch (err: any) {
      console.warn('Supabase fetch failed. Falling back to Sandbox LocalStorage / Mock Data.', err);
      if (err.message?.includes('Unauthorized') || err.code === 'PGRST301') {
        setAuthError('Authorization failed. You may not have admin access.');
        setIsUnlocked(false);
      } else {
        const sandboxRegs = localStorage.getItem('artistant_sandbox_registrations');
        setRegistrations(sandboxRegs ? JSON.parse(sandboxRegs) : []);

        const sandboxLogs = localStorage.getItem('artistant_sandbox_logs');
        setActivityLogs(sandboxLogs ? JSON.parse(sandboxLogs) : []);

        const sandboxAdmins = localStorage.getItem('artistant_sandbox_admins');
        setAdminUsers(sandboxAdmins ? JSON.parse(sandboxAdmins) : []);

        const sandboxRequests = localStorage.getItem('artistant_sandbox_booking_requests');
        setBookingRequests(sandboxRequests ? JSON.parse(sandboxRequests) : []);

        setIsLiveMode(false);
        setIsUnlocked(true);
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [getIdToken, triggerToast]);

  // Check Admin Rights on User Change
  useEffect(() => {
    const checkAdminRights = async () => {
      if (authLoading) return;
      if (!user) {
        setIsAdmin(false);
        setIsUnlocked(false);
        setCheckingAdmin(false);
        return;
      }
      setCheckingAdmin(true);
      try {
        const token = await getIdToken();
        if (token) {
          setIsAdmin(true);
          await verifyAndLoad(true);
        } else {
          setIsAdmin(false);
          setIsUnlocked(false);
        }
      } catch (err) {
        console.error('Error verifying admin authorization:', err);
        setIsAdmin(false);
        setIsUnlocked(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminRights();
  }, [user, authLoading, getIdToken, verifyAndLoad]);

  // Auth Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in with Google error:', err);
      setAuthError('Failed to sign in with Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError('');
    try {
      await signInWithEmail(loginEmail, loginPassword);
    } catch (err: any) {
      console.error('Email sign in error:', err);
      setAuthError(err.message || 'Failed to sign in with email.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setIsUnlocked(false);
      setIsAdmin(false);
      setAuthError('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Helper: target matching
  const isTargetMatch = (r: AdminWaitlistEntry | null, reg: { user_id?: string | null; id?: string | null }) => {
    if (!r || !reg) return false;
    if (r.id && reg.id && r.id === reg.id) return true;
    if (r.user_id && reg.user_id && r.user_id === reg.user_id) return true;
    return false;
  };

  // Admin Actions
  const handleVerifyAndLock = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.is_verified;
    const targetId = reg.user_id || reg.id;
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;

    const updated = registrations.map((r) => {
      if (isTargetMatch(r, reg)) return { ...r, is_verified: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg((prev) => (prev ? { ...prev, is_verified: nextState } : null));
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken,
          targetId,
          nextState,
          reg.is_blocked,
          reg.position_override,
          reg.feature_founding_card ?? false,
          reg.exclude_from_waitlist ?? false
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          triggerToast(`Error updating database: ${res.message || 'Action failed'}`);
          return;
        }
        if (nextState) {
          triggerToast(`User Verified. Verification Email Dispatched to @${reg.username}!`);
        } else {
          triggerToast(`Verification revoked for @${reg.username}`);
        }
      } else {
        localStorage.setItem('artistant_sandbox_registrations', JSON.stringify(updated));
        triggerToast(`Sandbox: @${reg.username} verification updated!`);
      }
    } catch (err: any) {
      console.error('Error updating database for verify action:', err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      triggerToast(`Error updating database: ${err.message || 'Action failed'}`);
    }
  };

  const handleToggleBlock = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.is_blocked;
    const targetId = reg.user_id || reg.id;
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;

    const updated = registrations.map((r) => {
      if (isTargetMatch(r, reg)) return { ...r, is_blocked: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg((prev) => (prev ? { ...prev, is_blocked: nextState } : null));
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken,
          targetId,
          reg.is_verified,
          nextState,
          reg.position_override,
          reg.feature_founding_card ?? false,
          reg.exclude_from_waitlist ?? false
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          triggerToast(`Error saving block status: ${res.message || 'Action failed'}`);
          return;
        }
        triggerToast(`User @${reg.username} block status toggled!`);
      } else {
        localStorage.setItem('artistant_sandbox_registrations', JSON.stringify(updated));
        triggerToast(`Sandbox: @${reg.username} block state updated!`);
      }
    } catch (err: any) {
      console.error('Error updating database for block action:', err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      triggerToast(`Error saving block status: ${err.message || 'Action failed'}`);
    }
  };

  const handleToggleFoundingCard = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.feature_founding_card;
    const targetId = reg.user_id || reg.id;
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;

    const updated = registrations.map((r) => {
      if (isTargetMatch(r, reg)) return { ...r, feature_founding_card: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg((prev) => (prev ? { ...prev, feature_founding_card: nextState } : null));
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken,
          targetId,
          reg.is_verified,
          reg.is_blocked,
          reg.position_override,
          nextState,
          reg.exclude_from_waitlist ?? false
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          triggerToast(`Error saving founding card status: ${res.message || 'Action failed'}`);
          return;
        }
        triggerToast(nextState ? `Featured @${reg.username} as Founding Card!` : `Unfeatured @${reg.username} as Founding Card.`);
      } else {
        localStorage.setItem('artistant_sandbox_registrations', JSON.stringify(updated));
        triggerToast(`Sandbox: @${reg.username} founding card toggled!`);
      }
    } catch (err: any) {
      console.error('Error updating database for founding card action:', err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      triggerToast(`Error saving founding card status: ${err.message || 'Action failed'}`);
    }
  };

  const handleToggleExcludeFromWaitlist = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.exclude_from_waitlist;
    const targetId = reg.user_id || reg.id;
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;

    const updated = registrations.map((r) => {
      if (isTargetMatch(r, reg)) return { ...r, exclude_from_waitlist: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg((prev) => (prev ? { ...prev, exclude_from_waitlist: nextState } : null));
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken,
          targetId,
          reg.is_verified,
          reg.is_blocked,
          reg.position_override,
          reg.feature_founding_card ?? false,
          nextState
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          triggerToast(`Error saving waitlist exclusion status: ${res.message || 'Action failed'}`);
          return;
        }
        triggerToast(nextState ? `Excluded @${reg.username} from waitlist rank.` : `Restored waitlist rank for @${reg.username}.`);
      } else {
        localStorage.setItem('artistant_sandbox_registrations', JSON.stringify(updated));
        triggerToast(`Sandbox: @${reg.username} rank exclusion toggled!`);
      }
    } catch (err: any) {
      console.error('Error updating database for exclude action:', err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      triggerToast(`Error saving waitlist exclusion status: ${err.message || 'Action failed'}`);
    }
  };

  const sortRegistrations = (entries: AdminWaitlistEntry[]): AdminWaitlistEntry[] => {
    return [...entries].sort((a, b) => {
      const posA = a.position_override !== null && a.position_override !== undefined ? a.position_override : Infinity;
      const posB = b.position_override !== null && b.position_override !== undefined ? b.position_override : Infinity;
      if (posA !== posB) {
        return posA - posB;
      }
      return new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime();
    });
  };

  const handleSavePositionOverride = async (reg: AdminWaitlistEntry, val: number | null) => {
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;
    const targetId = reg.user_id || reg.id;

    const updated = registrations.map((r) => {
      if (isTargetMatch(r, reg)) return { ...r, position_override: val };
      return r;
    });

    const sortedUpdated = sortRegistrations(updated);
    setRegistrations(sortedUpdated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg((prev) => (prev ? { ...prev, position_override: val } : null));
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken,
          targetId,
          reg.is_verified,
          reg.is_blocked,
          val,
          reg.feature_founding_card ?? false,
          reg.exclude_from_waitlist ?? false
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          triggerToast(`Failed to save priority override: ${res.message || 'Action failed'}`);
          return;
        }
        triggerToast(`Priority Override set to position ${val ?? 'Auto'}!`);
      } else {
        localStorage.setItem('artistant_sandbox_registrations', JSON.stringify(sortedUpdated));
        triggerToast(`Sandbox: Override saved.`);
      }
    } catch (err: any) {
      console.error('Error saving priority override:', err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      triggerToast(`Failed to save priority override: ${err.message || 'Action failed'}`);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await adminUpdateUserRoleAction(idToken, userId, newRole);
      if (res.success) {
        if (selectedReg) setSelectedReg({ ...selectedReg, role: newRole as any });
        setRegistrations((prev) => prev.map((r) => (r.id === selectedReg?.id ? { ...r, role: newRole as any } : r)));
        triggerToast(`Assigned role ${newRole.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Error assigning role:', err);
    }
  };

  // Booking Handlers
  const handleUpdateBookingStatus = async (requestId: string, newStatus: 'pending' | 'contacted' | 'confirmed' | 'archived') => {
    const prev = [...bookingRequests];
    const updated = bookingRequests.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r));
    setBookingRequests(updated);
    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminUpdateBookingRequestStatusAction(idToken, requestId, newStatus);
        triggerToast(`Updated request status to ${newStatus.toUpperCase()}`);
      } else {
        localStorage.setItem('artistant_sandbox_booking_requests', JSON.stringify(updated));
        triggerToast(`Sandbox: Updated status to ${newStatus.toUpperCase()}`);
      }
    } catch (err: any) {
      setBookingRequests(prev);
      triggerToast(`Failed to update status: ${err.message || 'Error'}`);
    }
  };

  const handleDeleteBookingRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking request?')) return;
    const prev = [...bookingRequests];
    const updated = bookingRequests.filter((r) => r.id !== requestId);
    setBookingRequests(updated);
    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminDeleteBookingRequestAction(idToken, requestId);
        triggerToast('Booking request deleted.');
      } else {
        localStorage.setItem('artistant_sandbox_booking_requests', JSON.stringify(updated));
        triggerToast('Sandbox: Request deleted.');
      }
    } catch (err: any) {
      setBookingRequests(prev);
      triggerToast(`Failed to delete request: ${err.message || 'Error'}`);
    }
  };

  // Admin Membership Handlers
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    const targetEmail = newAdminEmail.trim().toLowerCase();

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminAddAdminAction(idToken, targetEmail, user?.email || 'system');
        const admins = await adminGetAdminsAction(idToken);
        setAdminUsers(admins);
      } else {
        const newAdmin = {
          id: `mock-admin-${Date.now()}`,
          email: targetEmail,
          added_by: user?.email || 'sandbox_user',
          created_at: new Date().toISOString(),
        };
        const updated = [newAdmin, ...adminUsers];
        setAdminUsers(updated);
        localStorage.setItem('artistant_sandbox_admins', JSON.stringify(updated));
      }
      setNewAdminEmail('');
      triggerToast(`Admin ${targetEmail} added successfully!`);
    } catch (err: any) {
      console.error('Error adding admin:', err);
      triggerToast(`Failed to add admin: ${err.message}`);
    }
  };

  const handleRemoveAdmin = async (emailToRemove: string) => {
    const normalised = emailToRemove.trim().toLowerCase();
    if (normalised === 'anudeepdash2004@gmail.com') {
      triggerToast('Cannot remove super-admin.');
      return;
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminRemoveAdminAction(idToken, normalised);
        const admins = await adminGetAdminsAction(idToken);
        setAdminUsers(admins);
      } else {
        const updated = adminUsers.filter((a) => a.email.toLowerCase() !== normalised);
        setAdminUsers(updated);
        localStorage.setItem('artistant_sandbox_admins', JSON.stringify(updated));
      }
      triggerToast(`Admin ${normalised} access revoked.`);
    } catch (err: any) {
      console.error('Error removing admin:', err);
      triggerToast(`Failed to remove admin: ${err.message}`);
    }
  };

  // Auto-verify Engine
  const autoVerifyCount = useMemo(() => {
    return registrations.filter((r) => evaluateAutoVerify(r).eligible).length;
  }, [registrations]);

  const runAutoVerifyEngine = async () => {
    const candidates = registrations.filter((r) => evaluateAutoVerify(r).eligible);
    if (candidates.length === 0) {
      triggerToast('No new accounts meet auto-verify criteria.');
      return;
    }

    setIsLoading(true);
    let count = 0;
    const updated = [...registrations];

    for (const reg of candidates) {
      try {
        if (isLiveMode) {
          const idToken = await getIdToken();
          await adminUpdateRegistrationAction(
            idToken,
            reg.user_id,
            true,
            reg.is_blocked,
            reg.position_override,
            reg.feature_founding_card ?? false,
            reg.exclude_from_waitlist ?? false
          );
        }

        const idx = updated.findIndex((u) => u.user_id === reg.user_id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], is_verified: true };
        }
        count++;
      } catch (err) {
        console.error('Heuristics failure for @' + reg.username, err);
      }
    }

    setRegistrations(updated);
    if (!isLiveMode) {
      localStorage.setItem('artistant_sandbox_registrations', JSON.stringify(updated));
    }
    setIsLoading(false);
    triggerToast(`Engine Complete: Auto-verified ${count} registrations & fired onboarding templates.`);
  };

  // Leaderboard Calculation
  const leaderboards = useMemo(() => {
    const adminEmailsSet = new Set<string>();
    adminUsers.forEach((a) => {
      if (a.email) adminEmailsSet.add(a.email.toLowerCase().trim());
    });
    adminEmailsSet.add('anudeepdash2004@gmail.com');

    const eligibleRegistrations = registrations.filter((r) => {
      const email = r.email ? r.email.toLowerCase().trim() : '';
      return !r.exclude_from_waitlist && !adminEmailsSet.has(email);
    });

    const referralCounts: Record<string, number> = {};
    registrations.forEach((r) => {
      if (r.referred_by) {
        const ref = r.referred_by.toLowerCase().trim();
        referralCounts[ref] = (referralCounts[ref] || 0) + 1;
      }
    });

    const enriched = eligibleRegistrations.map((reg) => {
      const refs = referralCounts[reg.username.toLowerCase().trim()] || 0;
      const points = 100 + refs * 50;
      return { ...reg, refs, points };
    });

    return enriched.sort((a, b) => {
      const posA = a.position_override !== null && a.position_override !== undefined ? a.position_override : Infinity;
      const posB = b.position_override !== null && b.position_override !== undefined ? b.position_override : Infinity;
      if (posA !== posB) {
        return posA - posB;
      }
      return b.points - a.points;
    });
  }, [registrations, adminUsers]);

  // Filtered Registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        reg.username.toLowerCase().includes(searchLower) ||
        reg.email.toLowerCase().includes(searchLower) ||
        (reg.display_name && reg.display_name.toLowerCase().includes(searchLower)) ||
        (reg.phone && reg.phone.toLowerCase().includes(searchLower));

      const matchesRole = roleFilter === 'all' || reg.role === roleFilter;

      let matchesStatus = true;
      if (statusFilter === 'verified') {
        matchesStatus = reg.is_verified && !reg.is_blocked;
      } else if (statusFilter === 'blocked') {
        matchesStatus = reg.is_blocked;
      } else if (statusFilter === 'pending') {
        matchesStatus = !reg.is_verified && !reg.is_blocked;
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [registrations, searchQuery, roleFilter, statusFilter]);

  // Derived user display details
  const userDisplayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Admin');
  const currentUserAdminRecord = adminUsers.find((a) => a.email === user?.email);
  const userRole = currentUserAdminRecord ? currentUserAdminRecord.role : user?.email === 'anudeepdash2004@gmail.com' ? 'Developer' : 'Admin';

  // Render Gate Screen if not unlocked
  if (!isUnlocked) {
    return (
      <AdminLoginGate
        authLoading={authLoading}
        checkingAdmin={checkingAdmin}
        user={user}
        isAdmin={isAdmin}
        isUnlocked={isUnlocked}
        isLoading={isLoading}
        isSigningIn={isSigningIn}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        authError={authError}
        handleLogout={handleLogout}
        verifyAndLoad={verifyAndLoad}
        handleLoginSubmit={handleLoginSubmit}
        handleEmailLoginSubmit={handleEmailLoginSubmit}
      />
    );
  }

  // Main Dashboard Render
  return (
    <AdminShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      bookingRequestsCount={bookingRequests.filter((r) => r.status === 'pending').length}
      user={user}
      userDisplayName={userDisplayName}
      userRole={userRole}
      handleLogout={handleLogout}
      setShowCommandPalette={setShowCommandPalette}
      mounted={mounted}
      theme={theme}
      setTheme={setTheme}
      resolvedTheme={resolvedTheme}
      successToast={showToast}
      setSuccessToast={setShowToast}
    >
      {activeTab === 'overview' && (
        <OverviewTab
          registrations={registrations}
          activityLogs={activityLogs}
          bookingRequests={bookingRequests}
          user={user}
          isLiveMode={isLiveMode}
          autoVerifyCount={autoVerifyCount}
          onTabChange={setActiveTab}
          onRunAutoVerify={runAutoVerifyEngine}
        />
      )}

      {activeTab === 'registrations' && (
        <RegistrationsTab
          registrations={registrations}
          filteredRegistrations={filteredRegistrations}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
          autoVerifyCount={autoVerifyCount}
          runAutoVerifyEngine={runAutoVerifyEngine}
          handleVerifyAndLock={handleVerifyAndLock}
          handleToggleBlock={handleToggleBlock}
          handleSavePositionOverride={handleSavePositionOverride}
          setSelectedReg={setSelectedReg}
          setActiveTab={setActiveTab}
          setEmailAudienceMode={setEmailAudienceMode}
        />
      )}

      {activeTab === 'emails' && (
        <BroadcastStudio
          user={user}
          registrations={registrations}
          filteredRegistrations={filteredRegistrations}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
          showToast={triggerToast}
          getIdToken={getIdToken}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
        />
      )}

      {activeTab === 'requests' && (
        <BookingRequestsTab
          bookingRequests={bookingRequests}
          bookingRequestsError={bookingRequestsError}
          onUpdateStatus={handleUpdateBookingStatus}
          onDelete={handleDeleteBookingRequest}
          onShowSqlMigration={() => setShowSqlMigration(true)}
        />
      )}

      {activeTab === 'leaderboards' && (
        <LeaderboardsTab leaderboards={leaderboards} />
      )}

      {activeTab === 'members' && (
        <VisitorActivityTab
          activityLogs={activityLogs}
          totalRegistrations={registrations.length}
        />
      )}

      {activeTab === 'admins' && (
        <ManageAdminsTab
          adminUsers={adminUsers}
          onAddAdmin={handleAddAdmin}
          onRemoveAdmin={handleRemoveAdmin}
          newAdminEmail={newAdminEmail}
          setNewAdminEmail={setNewAdminEmail}
        />
      )}

      {activeTab === 'settings' && (
        <SiteSettingsTab
          getIdToken={getIdToken}
          showToast={triggerToast}
          setShowSettingsSqlModal={setShowSettingsSqlModal}
          siteSettingsError={siteSettingsError}
          setSiteSettingsError={setSiteSettingsError}
        />
      )}

      {activeTab === 'links_cards' && (
        <LinksAndCardsTab onSuccessToast={triggerToast} />
      )}

      {activeTab === 'careers' && (
        <CareersTab
          getIdToken={getIdToken}
          showToast={triggerToast}
          setShowCareersSqlModal={setShowCareersSqlModal}
          careersError={careersError}
          setCareersError={setCareersError}
        />
      )}

      {/* Global Modals & Overlays */}
      <RegistrationDetailModal
        selectedReg={selectedReg}
        onClose={() => setSelectedReg(null)}
        onVerify={handleVerifyAndLock}
        onBlock={handleToggleBlock}
        onToggleFoundingCard={handleToggleFoundingCard}
        onToggleExclude={handleToggleExcludeFromWaitlist}
        onSavePositionOverride={handleSavePositionOverride}
        onRoleChange={handleRoleChange}
      />

      <CommandPalette
        show={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        registrations={registrations}
        onTabSelect={(tabId) => setActiveTab(tabId)}
        onUserSelect={(reg) => {
          setSelectedReg(reg);
          setActiveTab('registrations');
        }}
      />

      <SqlMigrationModals
        showSqlMigration={showSqlMigration}
        setShowSqlMigration={setShowSqlMigration}
        showCareersSqlModal={showCareersSqlModal}
        setShowCareersSqlModal={setShowCareersSqlModal}
        showSettingsSqlModal={showSettingsSqlModal}
        setShowSettingsSqlModal={setShowSettingsSqlModal}
        showToast={triggerToast}
      />
    </AdminShell>
  );
}
