import { BRAND, FactRow, Frame, ogPhoto, render } from './poster';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/** Fetches the artist's photo as a data URI, or null if it's missing, too big or not an image. */
async function loadPhoto(url: string | null | undefined): Promise<string | null> {
  if (!url || !url.startsWith('https://')) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get('content-type')?.split(';')[0].trim() ?? '';
    if (!res.ok || !IMAGE_TYPES.includes(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > 4 * 1024 * 1024) return null;
    return `data:${type};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

function titleCase(value: string) {
  return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface ArtistCardOptions {
  name: string;
  handle: string;
  category?: string | null;
  city?: string | null;
  genres?: string[] | null;
  photoUrl?: string | null;
}

/** An artist's share card: their name and photo as a backstage pass on the stage. */
export async function artistCard({ name, handle, category, city, genres: rawGenres, photoUrl }: ArtistCardOptions) {
  const [photo, stage] = await Promise.all([loadPhoto(photoUrl), ogPhoto('crowd-bengaluru')]);

  const role = [category ? titleCase(category) : 'Live artist', city].filter(Boolean).join(' · ');
  const genres = (Array.isArray(rawGenres) ? rawGenres : []).filter(Boolean).slice(0, 3).map(titleCase);
  // Long names step down so they stay on two lines beside the photo.
  const nameSize = name.length > 22 ? 68 : name.length > 14 ? 84 : 104;

  return render(
    <Frame
      accent={BRAND.orange}
      photo={stage}
      shade="full"
      eyebrow="Booking open"
      footer={<FactRow facts={['Contract', 'Escrow', '50% upfront']} url={`artistant.in/${handle}`} />}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Geist Mono',
              fontSize: 20,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: BRAND.orange,
              marginBottom: 18,
            }}
          >
            {role}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Bricolage',
              fontSize: nameSize,
              lineHeight: 0.95,
              letterSpacing: -nameSize * 0.012,
              color: BRAND.ink,
              maxWidth: 680,
            }}
          >
            {name}
          </div>
          {genres.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
              {genres.map((genre) => (
                <div
                  key={genre}
                  style={{
                    display: 'flex',
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.06)',
                    fontSize: 22,
                    fontWeight: 500,
                    color: BRAND.ink,
                  }}
                >
                  {genre}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', marginTop: 22, fontSize: 27, color: BRAND.ink2 }}>
            Book {name.length > 24 ? 'them' : name} with a real contract and safe payment.
          </div>
        </div>

        {/* The artist's photo as a backstage pass, tilted like the homepage cards. */}
        <div
          style={{
            display: 'flex',
            width: 300,
            height: 360,
            flexShrink: 0,
            borderRadius: 28,
            padding: 6,
            background: BRAND.grad,
            transform: 'rotate(3deg)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt=""
              width={288}
              height={348}
              style={{ width: '100%', height: '100%', borderRadius: 22, objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                background: '#131313',
                fontFamily: 'Bricolage',
                fontSize: 180,
                color: BRAND.ink,
              }}
            >
              {name.trim().charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </Frame>,
  );
}
