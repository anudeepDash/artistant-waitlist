import type { Metadata } from "next";
import { getPublicProfileDataAction } from "@/lib/profile-actions";

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


  const artistName = profile?.reservation?.display_name || `@${username}`;

  return {
    title: artistName,
  };
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <>{children}</>;
}
