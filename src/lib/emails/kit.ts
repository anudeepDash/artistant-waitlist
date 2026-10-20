/*
 * Artistant email kit.
 *
 * The same "one dark room" as the site: near-black stage, a bold grotesk headline
 * with one accent-coloured phrase, money in mono, and the four logo colours.
 * Everything is tables and inline styles so it survives Gmail, Apple Mail and Outlook.
 * Web fonts load where a client allows them (Apple Mail, iOS); everyone else gets
 * a heavy system sans that keeps the same shape.
 */

export type EmailSide = 'artist' | 'host' | 'venue';

export interface EmailContent {
  subject: string;
  /** Inbox preview line shown after the subject. */
  preheader: string;
  html: string;
  text: string;
}

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://artistant.in').replace(/\/$/, '');
/** Where email images are served from. Override for local previews. */
export const ASSETS = (process.env.EMAIL_ASSET_BASE || `${SITE}/email`).replace(/\/$/, '');

export const C = {
  bg: '#0A0A0A',
  card: '#131313',
  card2: '#1B1B1B',
  line: '#262626',
  ink: '#F4F2EE',
  ink2: '#A6A39D',
  ink3: '#6E6B66',
  day: '#F2EFE8',
  dayInk: '#121110',
  orange: '#F25A2B',
  pink: '#D4567A',
  violet: '#7C5CFF',
  blue: '#6B7CDB',
  green: '#3DDC97',
};

export const ACCENT: Record<EmailSide, string> = { artist: C.orange, host: C.violet, venue: C.blue };

export const F = {
  display: "'Bricolage Grotesque','Helvetica Neue',Helvetica,Arial,sans-serif",
  sans: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  mono: "'Geist Mono','SFMono-Regular',Menlo,Consolas,'Courier New',monospace",
};

export function esc(str: string | number | undefined | null): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** A stable, friendly pass number from an email or name, e.g. AT-48211. */
export function passNumber(seed: string, prefix = 'AT'): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (seed.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  return `${prefix}-${(Math.abs(hash) % 90000) + 10000}`;
}

/* ───────────── Building blocks ───────────── */

/** The four logo colours as a solid stripe. Cells, not a gradient, so every client shows it. */
export function stripe(height = 6): string {
  const cell = (c: string) => `<td width="25%" height="${height}" bgcolor="${c}" style="background-color:${c};font-size:0;line-height:0;height:${height}px;">&nbsp;</td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cell(C.orange)}${cell(C.pink)}${cell(C.violet)}${cell(C.blue)}</tr></table>`;
}

export function spacer(h: number): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="${h}" style="height:${h}px;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

/** Small mono label with an accent dash, the same as the site's section labels. */
export function kicker(text: string, accent: string, color: string = C.ink2): string {
  return `<div style="font-family:${F.mono};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${color};line-height:16px;"><span style="color:${accent};">&#8212;&#8212;</span>&nbsp; ${esc(text)}</div>`;
}

/** Big headline. `accentPart` is drawn in the side's colour. */
export function headline(main: string, accentPart: string, accent: string, size = 56): string {
  return `<h1 class="h1" style="margin:0;font-family:${F.display};font-weight:800;font-size:${size}px;line-height:${Math.round(size * 0.94)}px;letter-spacing:-2px;color:${C.ink};">${esc(main)}${accentPart ? `<br><span style="color:${accent};">${esc(accentPart)}</span>` : ''}</h1>`;
}

export function para(html: string, opts: { color?: string; size?: number; top?: number } = {}): string {
  const { color = C.ink2, size = 16, top = 0 } = opts;
  return `<p style="margin:${top}px 0 0;font-family:${F.sans};font-size:${size}px;line-height:${Math.round(size * 1.62)}px;color:${color};">${html}</p>`;
}

/** Pill button. Solid colour with a matching border so Outlook still draws a block. */
export function button(label: string, href: string, bg: string, color = '#FFFFFF'): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="${bg}" style="border-radius:99px;background-color:${bg};">
<a href="${esc(href)}" target="_blank" style="display:inline-block;padding:16px 30px;border:1px solid ${bg};border-radius:99px;font-family:${F.sans};font-size:15px;font-weight:700;line-height:18px;color:${color};text-decoration:none;">${esc(label)} &nbsp;&rarr;</a>
</td></tr></table>`;
}

/** Full-bleed photo with the headline set on top of it. Falls back to plain black. */
export function photoHero(opts: { image: string; kickerText: string; main: string; accentPart: string; accent: string; height?: number }): string {
  const { image, kickerText, main, accentPart, accent, height = 340 } = opts;
  const url = `${ASSETS}/${image}`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="hero" background="${url}" bgcolor="${C.bg}" valign="bottom" height="${height}" style="height:${height}px;background-color:${C.bg};background-image:url('${url}');background-size:cover;background-position:center;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="px" valign="bottom" height="${height}" style="height:${height}px;padding:0 40px 36px;background-color:rgba(10,10,10,0.5);">
${spacer(Math.max(30, height - 220))}
${kicker(kickerText, accent, C.ink)}
${spacer(16)}
${headline(main, accentPart, accent)}
</td></tr></table>
</td></tr></table>`;
}

/** A plain dark hero, for security and notice emails. */
export function plainHero(opts: { kickerText: string; main: string; accentPart: string; accent: string }): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="px" style="padding:48px 40px 8px;">
${kicker(opts.kickerText, opts.accent)}
${spacer(18)}
${headline(opts.main, opts.accentPart, opts.accent, 48)}
</td></tr></table>`;
}

/** A padded content row. */
export function row(inner: string, opts: { top?: number; bottom?: number } = {}): string {
  const { top = 0, bottom = 0 } = opts;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="px" style="padding:${top}px 40px ${bottom}px;">${inner}</td></tr></table>`;
}

/** A barcode drawn from table cells of different widths. Purely decorative. */
function barcode(seed: string, color: string): string {
  const widths = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1, 2];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  const cells = widths
    .map((w, i) => {
      const width = widths[(i + s) % widths.length] + (w > 2 ? 1 : 0);
      const fill = i % 2 === 0 ? color : 'transparent';
      return `<td width="${width}" height="34" style="width:${width}px;height:34px;background-color:${fill};font-size:0;line-height:0;">&nbsp;</td><td width="2" style="width:2px;font-size:0;line-height:0;">&nbsp;</td>`;
    })
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>`;
}

/**
 * The backstage pass: the visitor's name on a laminate, like the one on the site.
 * `fields` are the small label/value columns under the name.
 */
export function pass(opts: {
  top: [string, string];
  name: string;
  role: string;
  fields: [string, string][];
  footer: string;
  accent: string;
  seed: string;
}): string {
  const { top, name, role, fields, footer, accent, seed } = opts;
  const fieldCells = fields
    .map(
      ([k, v]) => `<td valign="top" style="padding:14px 8px 14px 0;">
<div style="font-family:${F.mono};font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${C.ink3};">${esc(k)}</div>
<div style="margin-top:5px;font-family:${F.sans};font-size:14px;font-weight:700;color:${C.ink};">${esc(v)}</div>
</td>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
<tr><td align="center">
<!-- lanyard -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="10" height="34" bgcolor="${C.orange}" style="width:10px;height:34px;background-color:${C.orange};font-size:0;">&nbsp;</td>
<td width="10" bgcolor="${C.pink}" style="width:10px;background-color:${C.pink};font-size:0;">&nbsp;</td>
<td width="10" bgcolor="${C.violet}" style="width:10px;background-color:${C.violet};font-size:0;">&nbsp;</td>
<td width="10" bgcolor="${C.blue}" style="width:10px;background-color:${C.blue};font-size:0;">&nbsp;</td>
</tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="56" height="16" bgcolor="#9B9892" style="width:56px;height:16px;background-color:#9B9892;border-radius:0 0 8px 8px;font-size:0;">&nbsp;</td></tr></table>
</td></tr>
<tr><td align="center" style="padding-top:6px;">
<table class="pass" role="presentation" width="380" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.card2}" style="width:380px;max-width:100%;background-color:${C.card2};border:1px solid #2E2E2E;border-radius:22px;">
<tr><td style="padding:0;border-radius:22px 22px 0 0;overflow:hidden;">${stripe(8)}</td></tr>
<tr><td style="padding:14px 0 0;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="54" height="9" bgcolor="#050505" style="width:54px;height:9px;background-color:#050505;border-radius:99px;font-size:0;">&nbsp;</td></tr></table></td></tr>
<tr><td style="padding:18px 26px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${F.mono};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.ink2};">${esc(top[0])}</td>
<td align="right" style="font-family:${F.mono};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.ink2};">${esc(top[1])}</td>
</tr></table>
</td></tr>
<tr><td style="padding:22px 26px 0;"><img src="${ASSETS}/wordmark.png" width="120" height="23" alt="Artistant" style="display:block;width:120px;height:auto;border:0;"></td></tr>
<tr><td class="passName" style="padding:24px 26px 0;font-family:${F.display};font-weight:800;font-size:44px;line-height:46px;letter-spacing:-1.5px;color:${C.ink};word-break:break-all;">${esc(name)}</td></tr>
<tr><td style="padding:4px 26px 0;font-family:${F.display};font-weight:700;font-size:20px;line-height:26px;color:${accent};">${esc(role)}</td></tr>
<tr><td style="padding:20px 26px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #2E2E2E;border-bottom:1px solid #2E2E2E;"><tr>${fieldCells}</tr></table>
</td></tr>
<tr><td style="padding:18px 26px 0;">${barcode(seed, C.ink)}</td></tr>
<tr><td style="padding:8px 26px 24px;font-family:${F.mono};font-size:11px;color:${C.ink2};word-break:break-all;">${esc(footer)}</td></tr>
</table>
</td></tr></table>`;
}

/** A dashed callout box, e.g. for a share link or a note. */
export function callout(inner: string, accent: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px dashed ${accent};border-radius:18px;"><tr><td style="padding:22px 24px;">${inner}</td></tr></table>`;
}

export function footer(reason: string): string {
  const link = (label: string, href: string) => `<a href="${href}" target="_blank" style="color:${C.ink2};text-decoration:none;">${label}</a>`;
  return `${stripe(4)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="px" style="padding:24px 40px 22px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="fl" valign="middle"><img src="${ASSETS}/wordmark.png" width="96" height="18" alt="Artistant" style="display:block;width:96px;height:auto;border:0;"></td>
<td class="fl fr" valign="middle" align="right" style="font-family:${F.mono};font-size:10px;letter-spacing:2px;text-transform:uppercase;">${link('Instagram', 'https://instagram.com/artistant.in')} &nbsp;&middot;&nbsp; ${link('LinkedIn', 'https://www.linkedin.com/company/artistantco/')} &nbsp;&middot;&nbsp; ${link('X', 'https://x.com/artistant_in')}</td>
</tr></table>
<div style="margin-top:14px;font-family:${F.sans};font-size:12px;line-height:18px;color:${C.ink3};">${reason} Reply any time, a real person reads it.</div>
</td></tr></table>`;
}

/** The outer document: dark canvas, 600px column, mobile tweaks, hidden preheader. */
export function layout(opts: { title: string; preheader: string; body: string; accent?: string }): string {
  const { title, preheader, body } = opts;
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Geist+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; }
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
  @media (max-width: 620px) {
    .wrap { width:100% !important; }
    .px { padding-left:22px !important; padding-right:22px !important; }
    .h1 { font-size:40px !important; line-height:40px !important; letter-spacing:-1.2px !important; }
    .hero { height:360px !important; }
    .stack { display:block !important; width:100% !important; padding:0 0 8px !important; }
    .pass { width:100% !important; }
    .passName { font-size:32px !important; line-height:36px !important; }
    .fl { display:block !important; width:100% !important; text-align:left !important; }
    .fr { padding-top:12px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};" bgcolor="${C.bg}">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.bg};">${esc(preheader)}${'&#847;&zwnj;&nbsp;'.repeat(60)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" style="background-color:${C.bg};">
<tr><td align="center" style="padding:24px 10px 40px;">
<table class="wrap" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.card}" style="width:600px;max-width:600px;background-color:${C.card};border:1px solid ${C.line};border-radius:28px;overflow:hidden;">
<tr><td>
${body}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Top bar: wordmark on the left, a mono tag on the right, then the logo stripe. */
export function topBar(tag: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="px" style="padding:24px 40px 22px;"><a href="${SITE}" target="_blank" style="text-decoration:none;"><img src="${ASSETS}/wordmark.png" width="118" height="22" alt="Artistant" style="display:block;width:118px;height:auto;border:0;"></a></td>
<td class="px" align="right" style="padding:24px 40px 22px;font-family:${F.mono};font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${C.ink3};">${esc(tag)}</td>
</tr></table>
${stripe()}`;
}

/** Short numbered one-liners: the compact "what's next". */
export function nextSteps(title: string, items: string[], accent: string): string {
  const rows = items
    .map(
      (t, i) => `<tr>
<td width="34" valign="top" style="padding:9px 0;font-family:${F.mono};font-size:12px;line-height:22px;color:${accent};">${String(i + 1).padStart(2, '0')}</td>
<td valign="top" style="padding:9px 0;font-family:${F.sans};font-size:15px;line-height:22px;color:${C.ink};">${t}</td>
</tr>`,
    )
    .join('');
  return `${kicker(title, accent)}${spacer(8)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}
