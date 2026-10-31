'use client';

import React from 'react';
import type { User } from 'firebase/auth';
import { ArrowUpRight, LayoutDashboard, LogOut, Mail, ShieldCheck, Users } from 'lucide-react';
import type { View } from './data';
import { Avatar, cx } from './ui';
import s from './admin.module.css';

const NAV: { id: View; label: string; icon: typeof Users }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'people', label: 'People', icon: Users },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'team', label: 'Team', icon: ShieldCheck },
];

interface ShellProps {
  view: View;
  onView: (v: View) => void;
  user: User;
  peopleCount: number;
  reviewCount: number;
  onSignOut: () => void;
  children: React.ReactNode;
}

function NavItems({ view, onView, peopleCount, reviewCount }: Pick<ShellProps, 'view' | 'onView' | 'peopleCount' | 'reviewCount'>) {
  return (
    <>
      {NAV.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={cx(s.navItem, view === id && s.navOn)}
          aria-current={view === id ? 'page' : undefined}
          onClick={() => onView(id)}
        >
          <Icon size={17} aria-hidden />
          {label}
          {id === 'people' &&
            (reviewCount > 0 ? (
              <span className={s.navBadge} title={`${reviewCount} to review`}>{reviewCount}</span>
            ) : (
              <span className={s.navCount}>{peopleCount}</span>
            ))}
        </button>
      ))}
    </>
  );
}

function Brand() {
  return (
    <a href="/" className={s.brand} target="_blank" rel="noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/wordmark.svg" alt="Artistant" width={108} height={20} />
      <span className={s.brandTag}>Admin</span>
    </a>
  );
}

export default function Shell({ view, onView, user, peopleCount, reviewCount, onSignOut, children }: ShellProps) {
  const name = user.displayName || user.email?.split('@')[0] || 'Admin';

  return (
    <div className={s.app}>
      <aside className={s.side}>
        <Brand />
        <nav className={s.nav} aria-label="Admin">
          <NavItems view={view} onView={onView} peopleCount={peopleCount} reviewCount={reviewCount} />
        </nav>
        <div className={s.sideFoot}>
          <a className={s.siteLink} href="/" target="_blank" rel="noreferrer">
            <ArrowUpRight size={16} aria-hidden /> Open the site
          </a>
          <div className={s.me}>
            <Avatar name={name} src={user.photoURL} />
            <div className={s.meText}>
              <div className={s.meName}>{name}</div>
              <div className={s.meEmail}>{user.email}</div>
            </div>
            <button type="button" className={s.iconBtn} onClick={onSignOut} title="Sign out" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <header className={s.top}>
        <div className={s.topRow}>
          <Brand />
          <button type="button" className={s.iconBtn} onClick={onSignOut} title="Sign out" aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
        <nav className={s.tabs} aria-label="Admin">
          <NavItems view={view} onView={onView} peopleCount={peopleCount} reviewCount={reviewCount} />
        </nav>
      </header>

      <main className={s.main}>
        <div className={s.inner}>{children}</div>
      </main>
    </div>
  );
}

export function PageHead({
  kicker,
  title,
  sub,
  actions,
}: {
  kicker: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className={s.head}>
      <div>
        <div className={s.kicker}>{kicker}</div>
        <h1 className={s.h1}>{title}</h1>
        {sub && <p className={s.sub}>{sub}</p>}
      </div>
      {actions && <div className={s.headActions}>{actions}</div>}
    </div>
  );
}
