'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { TriangleAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import type { WaitlistRole } from '@/lib/waitlist';
import {
  adminAddAdminAction,
  adminGetActivityLogsAction,
  adminGetAdminsAction,
  adminGetRegistrationsAction,
  adminRemoveAdminAction,
  adminUpdateRegistrationAction,
  adminUpdateUserRoleAction,
  checkIsAdminAction,
} from '@/lib/admin-actions';
import {
  VIEWS,
  peopleToCsv,
  downloadText,
  queuePositions,
  referralCounts,
  statusOf,
  type ActivityLog,
  type AdminMember,
  type Person,
  type StatusFilter,
  type View,
} from '@/components/admin/data';
import SignIn from '@/components/admin/SignIn';
import Shell from '@/components/admin/Shell';
import Overview from '@/components/admin/Overview';
import People from '@/components/admin/People';
import PersonDrawer, { type PersonPatch } from '@/components/admin/PersonDrawer';
import Email, { type Audience } from '@/components/admin/Email';
import Team from '@/components/admin/Team';
import { Spinner, Toast, errorText, useConfirm, type ToastMsg } from '@/components/admin/ui';
import s from '@/components/admin/admin.module.css';

type Access = 'checking' | 'admin' | 'denied';
const STALE_MS = 2 * 60 * 1000;

function viewFromHash(): View {
  if (typeof window === 'undefined') return 'overview';
  const h = window.location.hash.replace('#', '') as View;
  return VIEWS.includes(h) ? h : 'overview';
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { ask, dialog } = useConfirm();

  // Tagged with the uid it was checked for, so a stale answer never applies to another account.
  const [access, setAccess] = useState<{ uid: string; state: Access } | null>(null);
  const accessState: Access | null = user && access?.uid === user.uid ? access.state : null;

  const [people, setPeople] = useState<Person[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [view, setViewState] = useState<View>(viewFromHash);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [audience, setAudience] = useState<Audience>('everyone');
  const [oneAddress, setOneAddress] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<ToastMsg | null>(null);

  const toast = useCallback((text: string, error?: boolean) => setToastMsg({ id: Date.now(), text, error }), []);
  const clearToast = useCallback(() => setToastMsg(null), []);

  const getIdToken = useCallback(async () => {
    if (!user) throw new Error('You’re signed out.');
    return user.getIdToken();
  }, [user]);

  const setView = useCallback((v: View) => {
    setViewState(v);
    window.history.replaceState(null, '', v === 'overview' ? window.location.pathname : `#${v}`);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onHash = () => setViewState(viewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /* ───────────── Loading ───────────── */

  const load = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const idToken = await user.getIdToken();
      const [regs, activity, team] = await Promise.allSettled([
        adminGetRegistrationsAction(idToken),
        adminGetActivityLogsAction(idToken),
        adminGetAdminsAction(idToken),
      ]);
      if (regs.status === 'fulfilled') {
        setPeople(regs.value);
        setLoadError(null);
      } else {
        setLoadError(errorText(regs.reason, 'Couldn’t load the waitlist. Try refreshing.'));
      }
      if (activity.status === 'fulfilled') setLogs(activity.value as ActivityLog[]);
      if (team.status === 'fulfilled') setAdmins(team.value as AdminMember[]);
      setLoadedAt(Date.now());
    } catch (err) {
      setLoadError(errorText(err, 'Couldn’t load the waitlist. Try refreshing.'));
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      let ok = false;
      try {
        ok = await checkIsAdminAction(await user.getIdToken());
      } catch {
        ok = false;
      }
      if (cancelled) return;
      setAccess({ uid: user.uid, state: ok ? 'admin' : 'denied' });
      if (ok) load();
    })();
    return () => {
      cancelled = true;
    };
  }, [user, load]);

  // Coming back to the tab after a while picks up new sign-ups.
  useEffect(() => {
    if (accessState !== 'admin') return;
    const onFocus = () => {
      if (!refreshing && loadedAt && Date.now() - loadedAt > STALE_MS) load();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [accessState, refreshing, loadedAt, load]);

  /* ───────────── Derived ───────────── */

  const positions = useMemo(() => queuePositions(people), [people]);
  const referrals = useMemo(() => referralCounts(people), [people]);
  const reviewCount = useMemo(() => people.filter((p) => statusOf(p) === 'review').length, [people]);
  const openPerson = openId ? people.find((p) => p.id === openId) : undefined;

  /* ───────────── Actions ───────────── */

  const replacePerson = (id: string, patch: Partial<Person>) =>
    setPeople((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const patchPerson = async (p: Person, patch: PersonPatch) => {
    const name = `@${p.username}`;
    if (patch.is_blocked === true) {
      const ok = await ask({
        title: `Block ${name}?`,
        body: 'They drop out of the queue, won’t get broadcasts, and we email them to say their account is on hold.',
        confirm: 'Block',
        danger: true,
      });
      if (!ok) return;
    }
    if (patch.is_verified === false) {
      const ok = await ask({
        title: `Remove ${name}’s verification?`,
        body: 'We’ll email them to say their profile is back under review.',
        confirm: 'Remove verification',
        danger: true,
      });
      if (!ok) return;
    }

    const key = Object.keys(patch)[0];
    const before = { is_verified: p.is_verified, is_blocked: p.is_blocked, exclude_from_waitlist: p.exclude_from_waitlist };
    const next = { ...before, ...patch };
    setBusy(key);
    replacePerson(p.id, patch);
    try {
      const res = await adminUpdateRegistrationAction(
        await getIdToken(),
        p.user_id || p.id,
        next.is_verified,
        next.is_blocked,
        undefined,
        undefined,
        next.exclude_from_waitlist ?? false,
      );
      if (!res.success) throw new Error(res.message || 'Didn’t save.');
      toast(
        patch.is_verified === true ? `${name} verified. We emailed them.`
          : patch.is_verified === false ? `Removed ${name}’s verification.`
          : patch.is_blocked === true ? `${name} blocked.`
          : patch.is_blocked === false ? `${name} unblocked.`
          : next.exclude_from_waitlist ? `${name} no longer counts in the queue.`
          : `${name} counts in the queue again.`,
      );
    } catch (err) {
      replacePerson(p.id, before);
      toast(errorText(err, 'Didn’t save. Try again.'), true);
    } finally {
      setBusy(null);
    }
  };

  const changeRole = async (p: Person, role: WaitlistRole) => {
    const prev = p.role;
    setBusy('role');
    replacePerson(p.id, { role });
    try {
      const res = await adminUpdateUserRoleAction(await getIdToken(), p.user_id || p.id, role);
      if (!res.success) throw new Error(res.message);
      toast(`@${p.username} is now ${role === 'artist' ? 'an' : 'a'} ${role}.`);
    } catch (err) {
      replacePerson(p.id, { role: prev });
      toast(errorText(err, 'Didn’t save the role.'), true);
    } finally {
      setBusy(null);
    }
  };

  const verifyMany = async (list: Person[]) => {
    if (list.length === 0) return;
    const ok = await ask({
      title: `Verify ${list.length} ${list.length === 1 ? 'person' : 'people'}?`,
      body: 'Each of them gets the “you’re verified” email.',
      confirm: `Verify ${list.length}`,
    });
    if (!ok) return;
    setBusy('bulk');
    let done = 0;
    const failed: string[] = [];
    const idToken = await getIdToken();
    for (const p of list) {
      try {
        const res = await adminUpdateRegistrationAction(
          idToken, p.user_id || p.id, true, p.is_blocked, undefined, undefined, p.exclude_from_waitlist ?? false,
        );
        if (!res.success) throw new Error(res.message);
        replacePerson(p.id, { is_verified: true });
        done++;
      } catch {
        failed.push(`@${p.username}`);
      }
    }
    setBusy(null);
    setSelected(new Set());
    if (failed.length) toast(`Verified ${done}. Didn’t work for ${failed.join(', ')}.`, true);
    else toast(`Verified ${done} ${done === 1 ? 'person' : 'people'}.`);
  };

  const exportCsv = (list: Person[]) => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(`artistant-waitlist-${stamp}.csv`, peopleToCsv(list, positions));
    toast(`Exported ${list.length} ${list.length === 1 ? 'person' : 'people'}.`);
  };

  const emailPerson = (p: Person) => {
    setOpenId(null);
    setAudience('one');
    setOneAddress(p.email);
    setView('email');
  };

  const emailSelected = () => {
    setAudience('selected');
    setView('email');
  };

  const addAdmin = async (email: string) => {
    setBusy('add');
    try {
      const idToken = await getIdToken();
      await adminAddAdminAction(idToken, email, user?.email || 'admin');
      setAdmins((await adminGetAdminsAction(idToken)) as AdminMember[]);
      toast(`${email} can now open admin.`);
      return true;
    } catch (err) {
      toast(errorText(err, 'Couldn’t add them. Try again.'), true);
      return false;
    } finally {
      setBusy(null);
    }
  };

  const removeAdmin = async (email: string) => {
    const isMe = email.toLowerCase() === user?.email?.toLowerCase();
    const ok = await ask({
      title: isMe ? 'Remove your own access?' : `Remove ${email}?`,
      body: isMe ? 'You’ll be locked out of admin straight away.' : 'They lose access to admin straight away, and we email them.',
      confirm: 'Remove',
      danger: true,
    });
    if (!ok) return;
    setBusy(email);
    try {
      const idToken = await getIdToken();
      await adminRemoveAdminAction(idToken, email);
      if (isMe) {
        await signOut();
        return;
      }
      setAdmins((await adminGetAdminsAction(idToken)) as AdminMember[]);
      toast(`${email} no longer has access.`);
    } catch (err) {
      toast(errorText(err, 'Couldn’t remove them.'), true);
    } finally {
      setBusy(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      toast(errorText(err, 'Couldn’t sign out.'), true);
    }
  };

  /* ───────────── Render ───────────── */

  if (loading || (user && accessState === null)) return <SignIn state="loading" onSignOut={handleSignOut} />;
  if (!user) return <SignIn state="signed-out" onSignOut={handleSignOut} />;
  if (accessState === 'denied') return <SignIn state="denied" email={user.email} onSignOut={handleSignOut} />;

  const firstLoad = loadedAt === null;

  return (
    <Shell
      view={view}
      onView={setView}
      user={user}
      peopleCount={people.length}
      reviewCount={reviewCount}
      onSignOut={handleSignOut}
    >
      {loadError && (
        <div className={s.banner} role="alert">
          <TriangleAlert size={16} />
          <span style={{ flex: 1 }}>{loadError}</span>
          <button type="button" className={`${s.btn} ${s.btnSm}`} onClick={load} disabled={refreshing}>Try again</button>
        </div>
      )}

      {firstLoad ? (
        <div className={s.loader} style={{ padding: '80px 0', justifyContent: 'center' }}>
          <Spinner /> Loading the waitlist
        </div>
      ) : (
        <>
          {view === 'overview' && (
            <Overview
              people={people}
              logs={logs}
              positions={positions}
              loadedAt={loadedAt ?? 0}
              refreshing={refreshing}
              onRefresh={load}
              onOpenPerson={(p) => setOpenId(p.id)}
              onShowPeople={(f) => {
                setFilter(f);
                setQuery('');
                setView('people');
              }}
            />
          )}

          {view === 'people' && (
            <People
              people={people}
              positions={positions}
              filter={filter}
              onFilter={setFilter}
              query={query}
              onQuery={setQuery}
              selected={selected}
              onSelected={setSelected}
              onOpenPerson={(p) => setOpenId(p.id)}
              onVerifyMany={verifyMany}
              onEmailSelected={emailSelected}
              onExport={exportCsv}
              busy={busy === 'bulk'}
            />
          )}

          {view === 'email' && (
            <Email
              user={user}
              people={people}
              positions={positions}
              selected={selected}
              audience={audience}
              onAudience={setAudience}
              oneAddress={oneAddress}
              onOneAddress={setOneAddress}
              getIdToken={getIdToken}
              toast={toast}
            />
          )}

          {view === 'team' && (
            <Team admins={admins} myEmail={user.email} onAdd={addAdmin} onRemove={removeAdmin} busy={busy} />
          )}
        </>
      )}

      <AnimatePresence>
        {openPerson && (
          <PersonDrawer
            key="drawer"
            person={openPerson}
            place={positions.get(openPerson.id)}
            referred={referrals.get(openPerson.username.toLowerCase()) || 0}
            referrer={
              openPerson.referred_by
                ? people.find((p) => p.username.toLowerCase() === openPerson.referred_by?.toLowerCase())
                : undefined
            }
            busy={busy}
            onClose={() => setOpenId(null)}
            onPatch={patchPerson}
            onRole={changeRole}
            onEmail={emailPerson}
            onOpenPerson={(p) => setOpenId(p.id)}
          />
        )}
      </AnimatePresence>

      {dialog}
      <Toast toast={toastMsg} onDone={clearToast} />
    </Shell>
  );
}
