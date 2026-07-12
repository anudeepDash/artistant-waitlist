import type { Metadata } from "next";
import { getWaitlistEntryByUsernameAction } from "@/lib/profile-actions";

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
  const entry = await getWaitlistEntryByUsernameAction(username);


  const artistName = entry?.display_name || `@${username}`;

  return {
    title: artistName,
  };
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <>{children}</>;
}
