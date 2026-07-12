import type { Metadata } from "next";
import { getWaitlistEntryByUsername } from "@/lib/waitlist";

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const entry = await getWaitlistEntryByUsername(username);

  const artistName = entry?.display_name || `@${username}`;

  return {
    title: artistName,
  };
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <>{children}</>;
}
