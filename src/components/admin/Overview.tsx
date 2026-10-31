'use client';

import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  ACTIVITY_LABEL,
  DAY_MS,
  countSince,
  dailyCounts,
  deviceOf,
  displayName,
  referralCounts,
  referrerHost,
  startOfDay,
  statusOf,
  timeAgo,
  titleCase,
  topValues,
  type ActivityLog,
  type Person,
  type StatusFilter,
} from './data';
import { PageHead } from './Shell';
import { Avatar, StatusPill, cx } from './ui';
import s from './admin.module.css';

interface OverviewProps {
  people: Person[];
  logs: ActivityLog[];
  positions: Map<string, number>;
  loadedAt: number;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenPerson: (p: Person) => void;
  onShowPeople: (filter: StatusFilter) => void;
}

const CHART_DAYS = 30;

function niceMax(n: number): number {
  if (n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * pow >= n) || 10;
  return step * pow;
}

function SignupChart({ dates }: { dates: string[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const data = useMemo(() => dailyCounts(dates, CHART_DAYS), [dates]);
  const max = niceMax(Math.max(...data.map((d) => d.count)));
  const fmt = (t: number) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className={s.chart}>
      <div className={s.chartPlot} onMouseLeave={() => setHover(null)}>
        {[1, 0.5].map((f) => (
          <div key={f} className={s.chartGrid} style={{ bottom: `${f * 100}%` }}>
            <span className={s.chartGridLabel}>{Math.round(max * f)}</span>
          </div>
        ))}
        {data.map((d, i) => (
          <button
            key={d.day}
            type="button"
            className={s.barHit}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={`${fmt(d.day)}: ${d.count} sign-up${d.count === 1 ? '' : 's'}`}
          >
            <span
              className={cx(s.bar, d.count === 0 && s.barZero)}
              style={d.count ? { height: `${(d.count / max) * 100}%` } : undefined}
            />
            {hover === i && (
              <span className={s.tip}>
                {fmt(d.day)} · <b>{d.count}</b> {d.count === 1 ? 'sign-up' : 'sign-ups'}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className={s.chartAxis}>
        <span>{fmt(data[0].day)}</span>
        <span>{fmt(data[Math.floor(CHART_DAYS / 2)].day)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function Breakdown({ items, total, empty }: { items: { label: string; count: number }[]; total: number; empty: string }) {
  if (items.length === 0) return <div className={s.muted} style={{ fontSize: 13 }}>{empty}</div>;
  const max = items[0].count;
  return (
    <div className={s.breakdown}>
      {items.map((it) => (
        <div key={it.label} className={s.bdRow}>
          <span className={s.bdLabel}>{it.label}</span>
          <span className={s.bdValue}>
            {it.count} <span className={s.muted}>· {Math.round((it.count / total) * 100)}%</span>
          </span>
          <span className={s.bdTrack}>
            <span className={s.bdFill} style={{ display: 'block', width: `${(it.count / max) * 100}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Overview({
  people,
  logs,
  positions,
  loadedAt,
  refreshing,
  onRefresh,
  onOpenPerson,
  onShowPeople,
}: OverviewProps) {
  // Measured from the last load, so numbers don't shift between renders.
  const now = loadedAt;
  const dates = useMemo(() => people.map((p) => p.reserved_at), [people]);

  const stats = useMemo(() => {
    const today = startOfDay(now);
    const thisWeek = countSince(dates, now - 7 * DAY_MS);
    const lastWeek = countSince(dates, now - 14 * DAY_MS, now - 7 * DAY_MS);
    const review = people.filter((p) => statusOf(p) === 'review').length;
    const verified = people.filter((p) => statusOf(p) === 'verified').length;
    return {
      total: people.length,
      today: countSince(dates, today),
      thisWeek,
      weekDelta: thisWeek - lastWeek,
      review,
      verified,
    };
  }, [people, dates, now]);

  const newest = useMemo(
    () => [...people].sort((a, b) => Date.parse(b.reserved_at) - Date.parse(a.reserved_at)).slice(0, 8),
    [people],
  );

  const kinds = useMemo(
    () => topValues(people.map((p) => (p.category ? titleCase(p.category) : p.role ? titleCase(p.role) : null)), 5),
    [people],
  );
  const cities = useMemo(() => topValues(people.map((p) => p.city), 5), [people]);
  const referrers = useMemo(() => {
    const counts = referralCounts(people);
    return [...counts.entries()]
      .map(([username, count]) => ({ username, count, person: people.find((p) => p.username.toLowerCase() === username) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [people]);

  const traffic = useMemo(() => {
    const weekAgo = now - 7 * DAY_MS;
    const recent = logs.filter((l) => Date.parse(l.created_at) >= weekAgo);
    const count = (type: string) => recent.filter((l) => l.action_type === type).length;
    return {
      visits: count('visit'),
      signIns: count('login'),
      signUps: count('waitlist_register'),
      sources: topValues(recent.map((l) => referrerHost(l.referrer)), 5),
      latest: logs.filter((l) => l.action_type !== 'visit').slice(0, 6),
    };
  }, [logs, now]);

  const weekNote =
    stats.weekDelta === 0 ? 'Same as the week before' : (
      <span className={stats.weekDelta > 0 ? s.up : s.down}>
        {stats.weekDelta > 0 ? '+' : '−'}
        {Math.abs(stats.weekDelta)} on the week before
      </span>
    );

  return (
    <>
      <PageHead
        kicker="Overview"
        title={<>The <em>waitlist</em>, today.</>}
        sub="Who’s claiming names, and what needs you."
        actions={
          <>
            <span className={s.updated}>Updated {new Date(loadedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
            <button type="button" className={s.btn} onClick={onRefresh} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? s.spin : undefined} /> Refresh
            </button>
          </>
        }
      />

      <div className={s.stats}>
        <button type="button" className={s.stat} onClick={() => onShowPeople('all')}>
          <span className={s.statLabel}>On the waitlist</span>
          <span className={s.statValue}>{stats.total}</span>
          <span className={s.statNote}>{stats.today} joined today</span>
        </button>
        <div className={s.stat}>
          <span className={s.statLabel}>Joined this week</span>
          <span className={s.statValue}>{stats.thisWeek}</span>
          <span className={s.statNote}>{weekNote}</span>
        </div>
        <button type="button" className={s.stat} onClick={() => onShowPeople('review')}>
          {stats.review > 0 && <span className={s.statDot} aria-hidden />}
          <span className={s.statLabel}>To review</span>
          <span className={s.statValue}>{stats.review}</span>
          <span className={s.statNote}>{stats.review ? 'Not verified yet' : 'All caught up'}</span>
        </button>
        <button type="button" className={s.stat} onClick={() => onShowPeople('verified')}>
          <span className={s.statLabel}>Verified</span>
          <span className={s.statValue}>{stats.verified}</span>
          <span className={s.statNote}>
            {stats.total ? Math.round((stats.verified / stats.total) * 100) : 0}% of everyone
          </span>
        </button>
      </div>

      <div className={s.card}>
        <div className={s.cardHead}>
          <h2 className={s.h2}>Sign-ups per day</h2>
          <span className={s.muted} style={{ fontSize: 13 }}>Last {CHART_DAYS} days</span>
        </div>
        <SignupChart dates={dates} />
      </div>

      <div className={s.grid2}>
        <div className={s.card}>
          <div className={s.cardHead}>
            <h2 className={s.h2}>Newest</h2>
            <button type="button" className={s.link} onClick={() => onShowPeople('all')}>See everyone</button>
          </div>
          {newest.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyTitle}>No one yet</div>
              Names claimed on the homepage show up here.
            </div>
          ) : (
            <div className={s.list}>
              {newest.map((p) => (
                <button key={p.id} type="button" className={s.listRow} onClick={() => onOpenPerson(p)}>
                  <Avatar name={displayName(p)} src={p.profile_photo_url} />
                  <span className={s.listMain}>
                    <span className={s.listTitle}>{displayName(p)}</span>
                    <span className={s.listSub}>
                      @{p.username}
                      {p.city ? ` · ${p.city}` : ''}
                    </span>
                  </span>
                  <StatusPill status={statusOf(p)} />
                  <span className={s.listMeta} style={{ minWidth: 56 }}>
                    {timeAgo(p.reserved_at, now)}
                    {positions.get(p.id) ? <><br />#{positions.get(p.id)}</> : null}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={s.card}>
          <div className={s.cardHead}>
            <h2 className={s.h2}>Who’s joining</h2>
          </div>
          <div className={s.stack} style={{ gap: 24 }}>
            <div>
              <p className={s.subhead}>What they do</p>
              <Breakdown items={kinds} total={stats.total || 1} empty="No categories filled in yet." />
            </div>
            <div>
              <p className={s.subhead}>Where</p>
              <Breakdown items={cities} total={stats.total || 1} empty="No cities filled in yet." />
            </div>
            {referrers.length > 0 && (
              <div>
                <p className={s.subhead}>Top referrers</p>
                <div className={s.list}>
                  {referrers.map((r) => (
                    <button
                      key={r.username}
                      type="button"
                      className={s.listRow}
                      onClick={() => r.person && onOpenPerson(r.person)}
                      disabled={!r.person}
                    >
                      <span className={s.listMain}>
                        <span className={s.listTitle}>@{r.username}</span>
                      </span>
                      <span className={s.listMeta}>{r.count} referred</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className={s.grid2even}>
          <div className={s.card}>
            <div className={s.cardHead}>
              <h2 className={s.h2}>Site activity</h2>
              <span className={s.muted} style={{ fontSize: 13 }}>Last 7 days</span>
            </div>
            <div className={s.split} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                ['Visits', traffic.visits],
                ['Sign-ins', traffic.signIns],
                ['Sign-ups', traffic.signUps],
              ].map(([label, n]) => (
                <div key={label as string}>
                  <div className={s.statLabel}>{label}</div>
                  <div className={s.statValue} style={{ fontSize: 28, marginTop: 4 }}>{n}</div>
                </div>
              ))}
            </div>
            <p className={s.subhead}>Where visits came from</p>
            <Breakdown
              items={traffic.sources}
              total={Math.max(1, traffic.visits)}
              empty="Mostly direct, or from Artistant itself."
            />
          </div>

          <div className={s.card}>
            <div className={s.cardHead}>
              <h2 className={s.h2}>Latest sign-ins</h2>
            </div>
            {traffic.latest.length === 0 ? (
              <div className={s.muted} style={{ fontSize: 13 }}>No sign-ins recorded yet.</div>
            ) : (
              <div className={s.list}>
                {traffic.latest.map((l, i) => (
                  <div key={l.id ?? i} className={s.listRow}>
                    <span className={s.listMain}>
                      <span className={s.listTitle}>
                        {l.username ? `@${l.username}` : l.email || 'Someone'}
                      </span>
                      <span className={s.listSub}>
                        {ACTIVITY_LABEL[l.action_type] || l.action_type} · {deviceOf(l.user_agent)}
                      </span>
                    </span>
                    <span className={s.listMeta}>{timeAgo(l.created_at, now)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
