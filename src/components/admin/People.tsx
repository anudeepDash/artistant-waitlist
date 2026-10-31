'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BadgeCheck, Download, Mail, Search, X } from 'lucide-react';
import {
  STATUS_LABEL,
  displayName,
  matchesSearch,
  statusOf,
  timeAgo,
  titleCase,
  type Person,
  type StatusFilter,
} from './data';
import { PageHead } from './Shell';
import { Avatar, StatusPill, cx } from './ui';
import s from './admin.module.css';

type Sort = 'newest' | 'oldest' | 'name';
const PAGE = 50;
const FILTERS: StatusFilter[] = ['all', 'review', 'verified', 'blocked'];

interface PeopleProps {
  people: Person[];
  positions: Map<string, number>;
  filter: StatusFilter;
  onFilter: (f: StatusFilter) => void;
  query: string;
  onQuery: (q: string) => void;
  selected: Set<string>;
  onSelected: (next: Set<string>) => void;
  onOpenPerson: (p: Person) => void;
  onVerifyMany: (people: Person[]) => void;
  onEmailSelected: () => void;
  onExport: (people: Person[]) => void;
  busy: boolean;
}

export default function People({
  people,
  positions,
  filter,
  onFilter,
  query,
  onQuery,
  selected,
  onSelected,
  onOpenPerson,
  onVerifyMany,
  onEmailSelected,
  onExport,
  busy,
}: PeopleProps) {
  const [sort, setSort] = useState<Sort>('newest');
  const [shown, setShown] = useState(PAGE);
  const allRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: people.length, review: 0, verified: 0, blocked: 0 };
    for (const p of people) c[statusOf(p)]++;
    return c;
  }, [people]);

  const rows = useMemo(() => {
    const list = people.filter((p) => (filter === 'all' || statusOf(p) === filter) && matchesSearch(p, query));
    const by: Record<Sort, (a: Person, b: Person) => number> = {
      newest: (a, b) => Date.parse(b.reserved_at) - Date.parse(a.reserved_at),
      oldest: (a, b) => Date.parse(a.reserved_at) - Date.parse(b.reserved_at),
      name: (a, b) => displayName(a).localeCompare(displayName(b)),
    };
    return list.sort(by[sort]);
  }, [people, filter, query, sort]);

  const visible = rows.slice(0, shown);
  const selectedRows = useMemo(() => people.filter((p) => selected.has(p.id)), [people, selected]);
  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));
  const someVisibleSelected = visible.some((p) => selected.has(p.id));
  const verifiable = selectedRows.filter((p) => statusOf(p) === 'review');

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someVisibleSelected && !allVisibleSelected;
  }, [someVisibleSelected, allVisibleSelected]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelected(next);
  };

  const toggleAll = () => {
    const next = new Set(selected);
    if (allVisibleSelected) visible.forEach((p) => next.delete(p.id));
    else visible.forEach((p) => next.add(p.id));
    onSelected(next);
  };

  return (
    <>
      <PageHead
        kicker="People"
        title={<>Everyone who <em>claimed</em> a name.</>}
        sub="Open someone to verify, block or change their details. Verifying and blocking email them."
        actions={
          <button type="button" className={s.btn} onClick={() => onExport(rows)} disabled={rows.length === 0}>
            <Download size={14} /> Export {rows.length === people.length ? 'all' : rows.length} as CSV
          </button>
        }
      />

      <div className={s.toolbar}>
        <label className={s.search}>
          <Search size={15} aria-hidden />
          <input
            className={s.input}
            type="search"
            placeholder="Search by name, @username, email, phone or city"
            value={query}
            onChange={(e) => {
              onQuery(e.target.value);
              setShown(PAGE);
            }}
            aria-label="Search people"
          />
        </label>
        <div className={s.seg} role="tablist" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className={cx(s.segBtn, filter === f && s.segOn)}
              onClick={() => {
                onFilter(f);
                setShown(PAGE);
              }}
            >
              {f === 'all' ? 'Everyone' : STATUS_LABEL[f]}
              <span className={s.segCount}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <select
          className={s.select}
          style={{ width: 'auto', height: 38, borderRadius: 99 }}
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sort"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className={s.tableWrap}>
        {rows.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyTitle}>{people.length === 0 ? 'No one has claimed a name yet' : 'No matches'}</div>
            {people.length === 0
              ? 'Names claimed on the homepage show up here.'
              : 'Try a different search or filter.'}
          </div>
        ) : (
          <>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.colCheck}>
                    <input
                      ref={allRef}
                      type="checkbox"
                      className={s.check}
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      aria-label="Select everyone shown"
                    />
                  </th>
                  <th>Person</th>
                  <th>Email</th>
                  <th>Does</th>
                  <th>City</th>
                  <th className={s.colNum} title="Place in the queue">Place</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const on = selected.has(p.id);
                  const place = positions.get(p.id);
                  return (
                    <tr key={p.id} className={on ? s.rowSel : undefined} onClick={() => onOpenPerson(p)}>
                      <td className={s.colCheck} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className={s.check}
                          checked={on}
                          onChange={() => toggle(p.id)}
                          aria-label={`Select ${displayName(p)}`}
                        />
                      </td>
                      <td>
                        <div className={s.who}>
                          <Avatar name={displayName(p)} src={p.profile_photo_url} />
                          <div style={{ minWidth: 0 }}>
                            <div className={s.whoName}>{displayName(p)}</div>
                            <div className={s.whoHandle}>@{p.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className={s.hideSm}><div className={s.cellMuted}>{p.email}</div></td>
                      <td className={s.hideSm}>
                        <div className={s.cellMuted}>
                          {p.category ? titleCase(p.category) : p.role ? titleCase(p.role) : '—'}
                        </div>
                      </td>
                      <td className={s.hideSm}><div className={s.cellMuted}>{p.city || '—'}</div></td>
                      <td className={cx(s.colNum, s.hideSm)}>{place ? `#${place}` : '—'}</td>
                      <td className={s.colWhen}>
                        <span className={s.cellMuted} title={p.reserved_at}>{timeAgo(p.reserved_at)}</span>
                      </td>
                      <td className={s.colStatus}><StatusPill status={statusOf(p)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length > shown && (
              <div className={s.more}>
                <button type="button" className={s.btn} onClick={() => setShown((n) => n + PAGE)}>
                  Show more · {rows.length - shown} left
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected.size > 0 && (
        <div className={s.bulk} role="region" aria-label="Selected people">
          <span className={s.bulkCount}>{selected.size} selected</span>
          <button
            type="button"
            className={cx(s.btn, s.btnSm)}
            onClick={() => onVerifyMany(verifiable)}
            disabled={busy || verifiable.length === 0}
            title={verifiable.length === 0 ? 'Everyone selected is already verified or blocked' : undefined}
          >
            <BadgeCheck size={14} /> Verify {verifiable.length || ''}
          </button>
          <button type="button" className={cx(s.btn, s.btnSm)} onClick={onEmailSelected}>
            <Mail size={14} /> Email
          </button>
          <button type="button" className={cx(s.btn, s.btnSm)} onClick={() => onExport(selectedRows)}>
            <Download size={14} /> CSV
          </button>
          <button type="button" className={s.iconBtn} onClick={() => onSelected(new Set())} aria-label="Clear selection" title="Clear selection">
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
