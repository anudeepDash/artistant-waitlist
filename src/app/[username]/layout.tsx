import type { Metadata } from "next";
import { getPublicProfileDataAction } from "@/lib/profile-actions";
import { ensureValidDisplayName } from "@/lib/waitlist";

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
  const profile = await getPublicProfileDataAction(username);

  const artistName = ensureValidDisplayName(
    profile?.reservation?.display_name,
    username,
    profile?.reservation?.email
  );

  return {
    title: artistName,
  };
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <>{children}</>;
}
