import { notFound } from 'next/navigation';
import { getDefaultTeamMember } from '@/lib/team-data';
import CardClient from './CardClient';

export default async function MemberBusinessCardPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const member = getDefaultTeamMember(decodeURIComponent(username));
  if (!member) notFound();
  return <CardClient initialMember={member} />;
}
