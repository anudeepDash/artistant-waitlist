'use client';

import { type FormEvent, useState } from 'react';
import { Camera, Check, ChevronRight, MapPin, Music2, Sparkles, Users } from 'lucide-react';

const minimumFollowers = 3000;

function formatFollowers(value: string) {
  const number = Number(value.replace(/[^0-9]/g, ''));
  return Number.isFinite(number) ? number.toLocaleString('en-IN') : '0';
}

export default function CreatorApplicationForm() {
  const [followers, setFollowers] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const followerCount = Number(followers.replace(/[^0-9]/g, ''));

    if (!Number.isFinite(followerCount) || followerCount < minimumFollowers) {
      setEligibilityMessage('This campaign is currently open to creators with at least 3,000 followers.');
      return;
    }

    setEligibilityMessage('');
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[#100d18] px-5 py-10 text-white sm:px-8">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col items-center justify-center text-center">
          <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-[#dc5f39] shadow-[0_0_50px_rgba(220,95,57,0.5)]">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <p className="mb-3 text-xs font-bold tracking-[0.24em] text-[#f2a48d] uppercase">Application complete</p>
          <h1 className="font-display text-4xl leading-[0.94] tracking-[-0.06em] sm:text-6xl">YOU&apos;RE ON THE LIST.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#c5bdcf]">
            Thanks for your interest in the Jasmine Sandlas Bengaluru creator call. Our team will review your details and reach out to shortlisted creators.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#100d18] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(207,71,120,0.28),transparent_32%),radial-gradient(circle_at_90%_18%,rgba(124,92,255,0.24),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(242,90,43,0.18),transparent_38%)]" />

      <div className="relative mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <a href="/" className="logo-typo text-xl" aria-label="Artistant home"><span className="artis">Artis</span><span className="tant">Tant</span></a>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[#d8d1e0] uppercase">Creator call</span>
        </header>

        <div className="grid gap-10 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-20">
          <section className="lg:pt-5">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5a184]/25 bg-[#f25a2b]/10 px-3 py-1.5 text-xs font-semibold text-[#f6ad96]">
              <MapPin className="h-3.5 w-3.5" /> Bengaluru only
            </div>
            <p className="mb-4 text-xs font-bold tracking-[0.22em] text-[#b9a5ff] uppercase">Creator opportunity</p>
            <h1 className="font-display text-5xl leading-[0.86] tracking-[-0.065em] sm:text-7xl">
              JASMINE<br />SANDLAS.<br /><span className="text-[#f25a2b]">BENGALURU.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-[#c5bdcf] sm:text-lg">
              Apply to be part of a high-energy creator campaign around Jasmine Sandlas&apos; Bengaluru moment.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <Users className="mb-3 h-5 w-5 text-[#f25a2b]" />
                <p className="text-xs font-bold tracking-[0.14em] text-[#a9a0b3] uppercase">Minimum reach</p>
                <p className="mt-1 text-xl font-semibold">3K followers</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <Music2 className="mb-3 h-5 w-5 text-[#d87596]" />
                <p className="text-xs font-bold tracking-[0.14em] text-[#a9a0b3] uppercase">Deliverable 01</p>
                <p className="mt-1 text-xl font-semibold">2 Reels</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <Camera className="mb-3 h-5 w-5 text-[#a995ff]" />
                <p className="text-xs font-bold tracking-[0.14em] text-[#a9a0b3] uppercase">Deliverable 02</p>
                <p className="mt-1 text-xl font-semibold">1 Story</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#1b1626]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
            <div className="mb-7 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7c5cff]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em]">Tell us about you</h2>
                <p className="mt-1 text-sm text-[#a9a0b3]">We&apos;ll use this to shortlist the right Bengaluru creators.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" required><input name="name" required placeholder="Your name" className="campaign-input" /></Field>
                <Field label="Phone number" required><input name="phone" type="tel" required placeholder="+91" className="campaign-input" /></Field>
              </div>
              <Field label="Email address" required><input name="email" type="email" required placeholder="you@email.com" className="campaign-input" /></Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Instagram handle" required><input name="instagram" required placeholder="@yourhandle" className="campaign-input" /></Field>
                <Field label="Instagram followers" required>
                  <div className="relative">
                    <input name="followers" required inputMode="numeric" value={followers} onChange={(event) => { setFollowers(event.target.value); setEligibilityMessage(''); }} placeholder="e.g. 5,000" className="campaign-input pr-14" />
                    <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold text-[#a9a0b3]">MIN 3K</span>
                  </div>
                </Field>
              </div>
              {followers && <p className={`-mt-2 text-xs ${Number(followers.replace(/[^0-9]/g, '')) >= minimumFollowers ? 'text-emerald-300' : 'text-[#f6ad96]'}`}>{formatFollowers(followers)} followers entered</p>}
              <Field label="Your content niche" required>
                <select name="niche" required defaultValue="" className="campaign-input appearance-none">
                  <option value="" disabled>Select your niche</option>
                  <option>Fashion & beauty</option>
                  <option>Music & culture</option>
                  <option>Food & lifestyle</option>
                  <option>Comedy & entertainment</option>
                  <option>College & youth culture</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Why are you a fit?" optional><textarea name="why" rows={3} placeholder="Share a little about your audience and content style." className="campaign-input resize-none" /></Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-5 text-[#c5bdcf]">
                <input required type="checkbox" className="mt-0.5 h-4 w-4 accent-[#f25a2b]" />
                <span>I&apos;m based in Bengaluru and can deliver <strong className="font-semibold text-white">2 Reels + 1 Story</strong> if selected.</span>
              </label>
              {eligibilityMessage && <p role="alert" className="rounded-xl border border-[#f25a2b]/30 bg-[#f25a2b]/10 px-4 py-3 text-sm text-[#f6ad96]">{eligibilityMessage}</p>}
              <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#f25a2b] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#ff6e41] focus:outline-none focus:ring-2 focus:ring-[#f9a287] focus:ring-offset-2 focus:ring-offset-[#1b1626]">
                Apply for the creator call <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="text-center text-xs leading-5 text-[#83798e]">Shortlisted creators will be contacted with the campaign brief, timeline, and commercial details.</p>
            </form>
          </section>
        </div>
      </div>
      <style jsx>{`\n        .campaign-input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.055); padding: 0.78rem 0.9rem; color: #fff; outline: none; transition: border-color 150ms ease, background 150ms ease; }\n        .campaign-input::placeholder { color: #7e7489; }\n        .campaign-input:focus { border-color: #a995ff; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 3px rgba(169, 149, 255, 0.14); }\n        .campaign-input option { background: #1b1626; color: #fff; }\n      `}</style>
    </main>
  );
}

function Field({ label, required, optional, children }: { label: string; required?: boolean; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex gap-1 text-sm font-medium text-[#e3ddea]">{label}{required && <span className="text-[#f25a2b]">*</span>}{optional && <span className="font-normal text-[#83798e]">(optional)</span>}</span>
      {children}
    </label>
  );
}
