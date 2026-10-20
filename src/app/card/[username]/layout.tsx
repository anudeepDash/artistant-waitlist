import { TEAM_MEMBERS } from '@/lib/team-data';

// Team cards are built once at deploy time. Any other name is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(TEAM_MEMBERS).map((username) => ({ username }));
}

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
