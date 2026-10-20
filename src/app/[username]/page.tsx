import { notFound } from 'next/navigation';
import ProfileClient from './ProfileClient';
import { getPublicProfile } from './data';

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) notFound();
  return <ProfileClient initialData={profile} />;
}
