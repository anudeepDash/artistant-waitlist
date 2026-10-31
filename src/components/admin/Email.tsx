'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { Monitor, Send, Smartphone } from 'lucide-react';
import { sendMassEmailAction, sendSingleOutreachEmailAction, type OutreachRecipient } from '@/lib/email-actions';
import { broadcastEmail, type BroadcastStyle } from '@/lib/emails/templates';
import { substitutePersonalizationTokens } from '@/lib/outreach-helpers';
import { displayName, statusOf, type Person } from './data';
import { PageHead } from './Shell';
import { Spinner, cx, errorText, useConfirm } from './ui';
import s from './admin.module.css';

export type Audience = 'everyone' | 'verified' | 'review' | 'selected' | 'one';

const AUDIENCES: { id: Audience; title: string }[] = [
  { id: 'everyone', title: 'Everyone' },
  { id: 'verified', title: 'Verified' },
  { id: 'review', title: 'Not verified yet' },
  { id: 'selected', title: 'Selected in People' },
];

const SENDERS = [
  { id: 'hello', label: 'Artistant · hello@' },
  { id: 'founder', label: 'Artistant Founder · founder@' },
  { id: 'official', label: 'Artistant Official · info@' },
  { id: 'support', label: 'Artistant Support · support@' },
];

const STYLES: { id: BroadcastStyle; label: string; hint: string }[] = [
  { id: 'standard', label: 'Card', hint: 'Dark card with a big heading' },
  { id: 'newsletter', label: 'Photo', hint: 'Stage photo behind the heading' },
  { id: 'plain_minimal', label: 'Letter', hint: 'A plain personal note' },
];

const TOKENS = ['{{first_name}}', '{{name}}', '{{username}}', '{{city}}', '{{position}}'];
const BATCH = 10;
const DRAFT_KEY = 'artistant_admin_email_draft_v2';

interface Draft {
  sender: string;
  style: BroadcastStyle;
  subject: string;
  label: string;
  heading: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
}

const EMPTY_DRAFT: Draft = {
  sender: 'hello',
  style: 'standard',
  subject: '',
  label: '',
  heading: '',
  body: '',
  ctaText: '',
  ctaUrl: 'https://artistant.in',
};

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Plain text in, safe HTML out: escaped, with bare links made clickable. Newlines become <br> in the mailer. */
function bodyToHtml(text: string): string {
  return escapeHtml(text).replace(
    /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g,
    '<a href="$1" style="color:#f25a2b;text-decoration:underline;">$1</a>',
  );
}

function toRecipient(p: Person, positions: Map<string, number>): OutreachRecipient {
  return {
    email: p.email,
    name: displayName(p),
    username: p.username,
    city: p.city || undefined,
    id: p.id,
    position: positions.get(p.id),
  };
}

interface EmailProps {
  user: User;
  people: Person[];
  positions: Map<string, number>;
  selected: Set<string>;
  audience: Audience;
  onAudience: (a: Audience) => void;
  oneAddress: string;
  onOneAddress: (v: string) => void;
  getIdToken: () => Promise<string>;
  toast: (text: string, error?: boolean) => void;
}

export default function Email({
  user,
  people,
  positions,
  selected,
  audience,
  onAudience,
  oneAddress,
  onOneAddress,
  getIdToken,
  toast,
}: EmailProps) {
  const { ask, dialog } = useConfirm();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [narrow, setNarrow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [run, setRun] = useState<{ done: number; total: number; failed: { email: string; message: string }[]; finished: boolean } | null>(null);
  const stopRef = useRef(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const loaded = useRef(false);

  // Keep the draft across reloads, in this browser only.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from storage
      if (saved) setDraft({ ...EMPTY_DRAFT, ...JSON.parse(saved) });
    } catch {
      /* storage blocked */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* storage blocked */
    }
  }, [draft]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // Blocked people never get broadcasts; one row per address.
  const groups = useMemo(() => {
    const reachable = people.filter((p) => !p.is_blocked && p.email);
    const uniq = (list: Person[]) => {
      const seen = new Set<string>();
      return list.filter((p) => {
        const k = p.email.trim().toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    };
    return {
      everyone: uniq(reachable),
      verified: uniq(reachable.filter((p) => statusOf(p) === 'verified')),
      review: uniq(reachable.filter((p) => statusOf(p) === 'review')),
      selected: uniq(reachable.filter((p) => selected.has(p.id))),
    };
  }, [people, selected]);

  const oneValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(oneAddress.trim());

  const recipients: OutreachRecipient[] = useMemo(() => {
    if (audience === 'one') {
      if (!oneValid) return [];
      const email = oneAddress.trim().toLowerCase();
      const match = people.find((p) => p.email.trim().toLowerCase() === email);
      return [match ? toRecipient(match, positions) : { email }];
    }
    return groups[audience].map((p) => toRecipient(p, positions));
  }, [audience, groups, oneAddress, oneValid, people, positions]);

  const sample: OutreachRecipient = useMemo(
    () => recipients[0] || { email: user.email || 'you@artistant.in', name: user.displayName || 'there' },
    [recipients, user.email, user.displayName],
  );

  const previewHtml = useMemo(() => {
    const sub = (t: string) => substitutePersonalizationTokens(t, sample);
    return broadcastEmail({
      style: draft.style,
      name: sample.name || sample.email.split('@')[0],
      subject: sub(draft.subject) || 'Subject',
      headerTitle: sub(draft.heading) || undefined,
      pillTag: draft.label || undefined,
      messageHtml: sub(bodyToHtml(draft.body)).replace(/\n/g, '<br />'),
      ctaText: draft.ctaText,
      ctaUrl: sub(draft.ctaUrl),
    });
  }, [draft, sample]);

  const insertToken = (token: string) => {
    const el = bodyRef.current;
    if (!el) return set('body', draft.body + token);
    const { selectionStart: a, selectionEnd: b } = el;
    const next = draft.body.slice(0, a) + token + draft.body.slice(b);
    set('body', next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + token.length, a + token.length);
    });
  };

  const payload = () => ({
    subject: draft.subject.trim(),
    messageBody: bodyToHtml(draft.body.trim()),
    emailHeader: draft.heading.trim() || undefined,
    pillTag: draft.label.trim() || undefined,
    ctaText: draft.ctaText.trim() && draft.ctaUrl.trim() ? draft.ctaText.trim() : '',
    ctaUrl: draft.ctaUrl.trim(),
    senderAlias: draft.sender,
    templateType: draft.style,
  });

  const problem = !draft.subject.trim()
    ? 'Add a subject'
    : draft.body.trim().length < 5
      ? 'Write a message'
      : draft.ctaText.trim() && !/^https?:\/\//.test(draft.ctaUrl.trim())
        ? 'The button link should start with https://'
        : null;

  const sending = !!run && !run.finished;

  const sendTest = async () => {
    if (problem || !user.email) return;
    setTesting(true);
    try {
      const idToken = await getIdToken();
      const p = payload();
      const res = await sendSingleOutreachEmailAction({
        idToken,
        ...p,
        subject: `[Test] ${p.subject}`,
        recipient: { ...sample, email: user.email },
      });
      if (res.success) toast(`Test sent to ${user.email}`);
      else toast(res.message || 'Test didn’t send.', true);
    } catch (err) {
      toast(errorText(err, 'Test didn’t send.'), true);
    } finally {
      setTesting(false);
    }
  };

  const send = async () => {
    if (problem || recipients.length === 0) return;
    const n = recipients.length;
    const ok = await ask({
      title: `Send to ${n} ${n === 1 ? 'person' : 'people'}?`,
      body: (
        <>
          “{draft.subject.trim()}” from {SENDERS.find((x) => x.id === draft.sender)?.label}. This can’t be undone.
        </>
      ),
      confirm: `Send to ${n}`,
    });
    if (!ok) return;

    stopRef.current = false;
    const list = [...recipients];
    const failed: { email: string; message: string }[] = [];
    let processed = 0;
    setRun({ done: 0, total: list.length, failed, finished: false });

    for (let i = 0; i < list.length; i += BATCH) {
      if (stopRef.current) break;
      const batch = list.slice(i, i + BATCH);
      try {
        const idToken = await getIdToken();
        const res = await sendMassEmailAction({ idToken, recipients: batch, ...payload() });
        if (!res.success) throw new Error(res.message);
        for (const d of res.details || []) if (!d.success) failed.push({ email: d.email, message: d.message || 'Failed' });
      } catch (err) {
        for (const r of batch) failed.push({ email: r.email, message: errorText(err, 'Failed') });
      }
      processed += batch.length;
      setRun({ done: processed, total: list.length, failed: [...failed], finished: false });
    }

    setRun((r) => (r ? { ...r, finished: true } : r));
    const sent = processed - failed.length;
    if (stopRef.current) toast('Stopped. The rest weren’t sent.', true);
    else if (failed.length) toast(`${failed.length} didn’t send. See the list below.`, true);
    else toast(`Sent to ${sent} ${sent === 1 ? 'person' : 'people'}.`);
  };

  const audienceCount = (a: Audience) => (a === 'one' ? 1 : groups[a].length);

  return (
    <>
      {dialog}
      <PageHead
        kicker="Email"
        title={<>Write to the <em>waitlist</em>.</>}
        sub="Goes out in Artistant’s email design. Blocked people are always left out."
      />

      <div className={s.composer}>
        <div className={cx(s.card, s.stack)} style={{ gap: 18 }}>
          <div className={s.field}>
            <span className={s.fieldLabel}>To</span>
            <div className={s.audience}>
              {AUDIENCES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={cx(s.audBtn, audience === a.id && s.audOn)}
                  onClick={() => onAudience(a.id)}
                  disabled={sending || (a.id === 'selected' && groups.selected.length === 0 && audience !== 'selected')}
                  title={a.id === 'selected' && groups.selected.length === 0 ? 'Tick people in the People list first' : undefined}
                >
                  <span className={s.audTitle}>{a.title}</span>
                  <span className={s.audCount}>{audienceCount(a.id)} {audienceCount(a.id) === 1 ? 'person' : 'people'}</span>
                </button>
              ))}
            </div>
            {audience === 'one' ? (
              <div className={cx(s.audBtn, s.audOn)} style={{ cursor: 'default' }}>
                <label className={s.audTitle} htmlFor="email-one">One email address</label>
                <input
                  id="email-one"
                  className={s.input}
                  style={{ marginTop: 8 }}
                  type="email"
                  placeholder="name@example.com"
                  value={oneAddress}
                  autoFocus
                  disabled={sending}
                  onChange={(e) => onOneAddress(e.target.value)}
                />
              </div>
            ) : (
              <button type="button" className={s.audBtn} onClick={() => onAudience('one')} disabled={sending}>
                <span className={s.audTitle}>One email address</span>
                <span className={s.audCount}>Anyone, on the list or not</span>
              </button>
            )}
          </div>

          <div className={s.row2}>
            <label className={s.field}>
              <span className={s.fieldLabel}>From</span>
              <select className={s.select} value={draft.sender} onChange={(e) => set('sender', e.target.value)}>
                {SENDERS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select>
            </label>
            <div className={s.field}>
              <span className={s.fieldLabel}>Look</span>
              <div className={s.seg} role="radiogroup" aria-label="Look" style={{ alignSelf: 'flex-start' }}>
                {STYLES.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    role="radio"
                    aria-checked={draft.style === x.id}
                    title={x.hint}
                    className={cx(s.segBtn, draft.style === x.id && s.segOn)}
                    onClick={() => set('style', x.id)}
                  >
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className={s.field}>
            <span className={s.fieldLabel}>Subject</span>
            <input className={s.input} value={draft.subject} maxLength={150} onChange={(e) => set('subject', e.target.value)} placeholder="Your name is saved — here’s what’s next" />
          </label>

          <div className={s.row2}>
            <label className={s.field}>
              <span className={s.fieldLabel}>Heading <span className={s.fieldHint}>optional</span></span>
              <input className={s.input} value={draft.heading} maxLength={90} onChange={(e) => set('heading', e.target.value)} placeholder="Uses the subject if empty" />
            </label>
            {draft.style !== 'plain_minimal' && (
              <label className={s.field}>
                <span className={s.fieldLabel}>Small label <span className={s.fieldHint}>optional</span></span>
                <input className={s.input} value={draft.label} maxLength={40} onChange={(e) => set('label', e.target.value)} placeholder="From Artistant" />
              </label>
            )}
          </div>

          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="email-body">
              Message <span className={s.fieldHint}>plain text; links work</span>
            </label>
            <textarea
              id="email-body"
              ref={bodyRef}
              className={s.textarea}
              value={draft.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder={
                draft.style === 'plain_minimal'
                  ? 'Hi {{first_name}},\n\nWrite it like a note from a person.'
                  : 'Starts after “Hi {first name},” which the email adds for you.'
              }
            />
            <div className={s.chips}>
              {TOKENS.map((t) => (
                <button key={t} type="button" className={s.chip} onClick={() => insertToken(t)} title="Filled in for each person">
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={s.row2}>
            <label className={s.field}>
              <span className={s.fieldLabel}>Button text <span className={s.fieldHint}>optional</span></span>
              <input className={s.input} value={draft.ctaText} maxLength={40} onChange={(e) => set('ctaText', e.target.value)} placeholder="No button" />
            </label>
            <label className={s.field}>
              <span className={s.fieldLabel}>Button link</span>
              <input className={s.input} value={draft.ctaUrl} onChange={(e) => set('ctaUrl', e.target.value)} placeholder="https://artistant.in" disabled={!draft.ctaText.trim()} />
            </label>
          </div>

          <div className={s.sendBar}>
            <button type="button" className={s.link} onClick={() => setDraft(EMPTY_DRAFT)} disabled={sending}>
              Clear draft
            </button>
            <div className={s.headActions}>
              <button type="button" className={s.btn} onClick={sendTest} disabled={!!problem || testing || sending} title={`Sends to ${user.email}`}>
                {testing && <Spinner size={14} />} Send me a test
              </button>
              <button
                type="button"
                className={cx(s.btn, s.btnAccent)}
                onClick={send}
                disabled={!!problem || recipients.length === 0 || sending}
                title={problem || undefined}
              >
                {sending ? <Spinner size={14} /> : <Send size={14} />}
                {problem || (recipients.length === 0 ? 'No one to send to' : `Send to ${recipients.length}`)}
              </button>
            </div>
          </div>

          {run && (
            <div className={s.stack} style={{ gap: 10 }}>
              <div className={s.fieldLabel}>
                <span>{run.finished ? 'Done' : 'Sending…'}</span>
                <span className={s.mono} style={{ fontWeight: 400, color: 'var(--ink-2)' }}>
                  {run.done}/{run.total}
                  {run.failed.length > 0 && ` · ${run.failed.length} failed`}
                </span>
              </div>
              <div className={s.progress}>
                <div className={s.progressFill} style={{ width: `${(run.done / Math.max(1, run.total)) * 100}%` }} />
              </div>
              {!run.finished && (
                <button type="button" className={cx(s.btn, s.btnSm)} style={{ alignSelf: 'flex-start' }} onClick={() => (stopRef.current = true)}>
                  Stop after this batch
                </button>
              )}
              {run.failed.length > 0 && (
                <ul className={s.log}>
                  {run.failed.map((f, i) => (
                    <li key={`${f.email}-${i}`}><span>{f.email}</span><span>{f.message}</span></li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className={s.preview}>
          <div className={s.previewBar}>
            <div className={s.previewMeta}>
              <b>{substitutePersonalizationTokens(draft.subject, sample) || 'No subject yet'}</b>
              Preview for {sample.name || sample.email}
            </div>
            <div className={s.seg}>
              <button type="button" className={cx(s.segBtn, !narrow && s.segOn)} onClick={() => setNarrow(false)} aria-label="Desktop width">
                <Monitor size={14} />
              </button>
              <button type="button" className={cx(s.segBtn, narrow && s.segOn)} onClick={() => setNarrow(true)} aria-label="Phone width">
                <Smartphone size={14} />
              </button>
            </div>
          </div>
          <div className={s.previewStage}>
            <iframe
              title="Email preview"
              className={cx(s.previewFrame, narrow && s.previewNarrow)}
              sandbox=""
              srcDoc={previewHtml}
            />
          </div>
        </div>
      </div>
    </>
  );
}
