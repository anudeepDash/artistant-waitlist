import { getPublicProfileDataAction } from '@/lib/profile-actions';
import { ensureValidDisplayName } from '@/lib/waitlist';
import { artistCard } from '../_og/artist';
import { HOME_POSTER, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Artist profile on Artistant';
export const size = OG_SIZE;
export const contentType = 'image/png';
// Profile edits show up in link previews within the hour.
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getPublicProfileDataAction(username);
  const res = profile?.reservation;
  if (!res) return poster(HOME_POSTER);

  return artistCard({
    name: ensureValidDisplayName(res.display_name, username, res.email),
    handle: res.username || username,
    category: res.category,
    city: res.city,
    genres: res.genres,
    photoUrl: res.profile_photo_url || res.cover_photo_url,
  });
}
