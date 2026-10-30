import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

/*
 * Share images for every page, drawn like the homepage hero: a dark stage, a
 * real Indian gig photo behind a shade, a two-line Bricolage headline with the
 * second line in the page's accent, money and facts in mono, and the logo
 * gradient along the bottom edge.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const dir = join(process.cwd(), 'src/app/_og');

const [bricolage, geist, geistMedium, geistMono, wordmark] = await Promise.all([
  readFile(join(dir, 'fonts/bricolage-700.ttf')),
  readFile(join(dir, 'fonts/geist-400.ttf')),
  readFile(join(dir, 'fonts/geist-500.ttf')),
  readFile(join(dir, 'fonts/geist-mono-500.ttf')),
  readFile(join(process.cwd(), 'public/brand/wordmark.svg'), 'base64'),
]);

const FONTS = [
  { name: 'Bricolage', data: bricolage, weight: 700 as const, style: 'normal' as const },
  { name: 'Geist', data: geist, weight: 400 as const, style: 'normal' as const },
  { name: 'Geist', data: geistMedium, weight: 500 as const, style: 'normal' as const },
  { name: 'Geist Mono', data: geistMono, weight: 500 as const, style: 'normal' as const },
];

const WORDMARK = `data:image/svg+xml;base64,${wordmark}`;

export const BRAND = {
  orange: '#f25a2b',
  pink: '#d4567a',
  violet: '#7c5cff',
  blue: '#6b7cdb',
  bg: '#0a0a0a',
  ink: '#f4f2ee',
  ink2: '#a6a39d',
  ink3: '#6e6b66',
  grad: 'linear-gradient(90deg, #f25a2b 0%, #d4567a 38%, #7c5cff 72%, #6b7cdb 100%)',
};

export type OgPhoto =
  | 'crowd-bengaluru'
  | 'sangeet-dance'
  | 'band-stage'
  | 'dj-stage'
  | 'fire-stage'
  | 'mixer'
  | 'sitar'
  | 'garba'
  | 'tabla';

/** Stage photos, pre-cropped to 1200×630 JPEGs (the renderer can't read WebP reliably). */
export async function ogPhoto(name: OgPhoto): Promise<string> {
  const data = await readFile(join(dir, `photos/${name}.jpg`), 'base64');
  return `data:image/jpeg;base64,${data}`;
}

/** Turns "#rrggbb" into rgba() so accent colours can be faded in gradients. */
function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

interface FrameProps {
  accent: string;
  photo?: string;
  /** Darker shade for pages where the photo sits behind the whole layout. */
  shade?: 'left' | 'full';
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** The shared stage: photo, shade, accent spotlight, wordmark, footer and gradient bar. */
export function Frame({ accent, photo, shade = 'left', eyebrow, children, footer }: FrameProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background: BRAND.bg,
        color: BRAND.ink,
        fontFamily: 'Geist',
      }}
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          width={1200}
          height={630}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          background:
            shade === 'full'
              ? 'linear-gradient(90deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.88) 55%, rgba(10,10,10,0.7) 100%)'
              : 'linear-gradient(90deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.78) 42%, rgba(10,10,10,0.18) 82%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0) 26%, rgba(10,10,10,0) 62%, rgba(10,10,10,0.88) 100%)',
        }}
      />
      {/* The stage light, tinted by the page's side of the stage. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          background: `radial-gradient(circle at 78% 30%, ${alpha(accent, 0.32)} 0%, ${alpha(accent, 0)} 48%)`,
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '56px 72px 60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WORDMARK} alt="Artistant" width={214} height={40} />
          {eyebrow && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 18px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(10,10,10,0.55)',
                fontFamily: 'Geist Mono',
                fontSize: 18,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: BRAND.ink,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 999, background: accent, boxShadow: `0 0 14px ${accent}` }} />
              {eyebrow}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>{children}</div>

        {footer && <div style={{ display: 'flex', marginTop: 34 }}>{footer}</div>}
      </div>

      <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 8, display: 'flex', background: BRAND.grad }} />
    </div>
  );
}

/** Two-line display headline; the second line takes the accent, like the hero. */
export function Headline({ line1, line2, accent, size = 112 }: { line1: string; line2: string; accent: string; size?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Bricolage',
        fontSize: size,
        lineHeight: 0.96,
        letterSpacing: -size * 0.012,
      }}
    >
      <div style={{ display: 'flex', color: BRAND.ink }}>{line1}</div>
      <div style={{ display: 'flex', color: accent }}>{line2}</div>
    </div>
  );
}

export function Lead({ children, width = 720 }: { children: React.ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', marginTop: 26, maxWidth: width, fontSize: 29, lineHeight: 1.35, color: BRAND.ink2 }}>
      {children}
    </div>
  );
}

/** Mono facts along the bottom, separated by dots, with the address on the right. */
export function FactRow({ facts, url = 'artistant.in' }: { facts: string[]; url?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 22,
        borderTop: '1px solid rgba(255,255,255,0.12)',
        fontFamily: 'Geist Mono',
        fontSize: 19,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: BRAND.ink2,
      }}
    >
      <div style={{ display: 'flex', gap: 14 }}>
        {facts.map((fact, i) => (
          <div key={fact} style={{ display: 'flex', gap: 14 }}>
            {i > 0 && <span style={{ color: BRAND.ink3 }}>·</span>}
            <span>{fact}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', color: BRAND.ink, textTransform: 'none', letterSpacing: 0 }}>{url}</div>
    </div>
  );
}

export interface PosterOptions {
  accent: string;
  photo: OgPhoto;
  eyebrow: string;
  line1: string;
  line2: string;
  lead: string;
  facts: string[];
  size?: number;
}

/** The homepage's poster, also used when an artist page has nobody behind it. */
export const HOME_POSTER: PosterOptions = {
  accent: BRAND.orange,
  photo: 'crowd-bengaluru',
  eyebrow: 'Artists · Hosts · Venues',
  line1: 'Get paid.',
  line2: 'Not ghosted.',
  lead: 'The safe way to book live artists in India. A proper contract, money held safely, and half the fee before you travel.',
  facts: ['Contract', 'Escrow', '50% upfront'],
};

/** The standard page poster: eyebrow, headline, one line of copy and a row of facts. */
export async function poster({ accent, photo, eyebrow, line1, line2, lead, facts, size }: PosterOptions) {
  return render(
    <Frame accent={accent} photo={await ogPhoto(photo)} eyebrow={eyebrow} footer={<FactRow facts={facts} />}>
      <Headline line1={line1} line2={line2} accent={accent} size={size} />
      <Lead>{lead}</Lead>
    </Frame>,
  );
}

/**
 * Draws the image and hands it back as a JPEG. The PNG is ~550 KB; WhatsApp only
 * shows a full-size preview for images under ~300 KB and otherwise falls back to
 * a blurry cropped thumbnail. 4:4:4 chroma keeps the coloured headlines crisp.
 */
export async function render(element: React.ReactElement) {
  const png = await new ImageResponse(element, { ...OG_SIZE, fonts: FONTS }).arrayBuffer();
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 82, mozjpeg: true, progressive: false, chromaSubsampling: '4:4:4' }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
}
