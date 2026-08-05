import type { Metadata } from "next";
import { getPublicProfileDataAction } from "@/lib/profile-actions";
import { ensureValidDisplayName } from "@/lib/waitlist";
import JsonLd from "@/components/JsonLd";

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://artistant.in";

  if (!profile || !profile.reservation) {
    return {
      title: "Artist Not Found",
      robots: { index: false, follow: false },
    };
  }

  const res = profile.reservation;
  const artistName = ensureValidDisplayName(
    res.display_name,
    username,
    res.email
  );

  const categoryLabel = res.category ? `${res.category} ` : "";
  const cityLabel = res.city ? `based in ${res.city}` : "";
  const bioExcerpt = res.bio ? res.bio.slice(0, 150) : "";
  const description = bioExcerpt
    ? `${bioExcerpt}... Book ${artistName} on Artistant.`
    : `Book ${artistName} — ${categoryLabel}${cityLabel} on Artistant. View music, videos, gallery, and send direct performance booking requests.`;

  const profileImageUrl = res.profile_photo_url || res.cover_photo_url || "/brand_palette.png";
  const fullImageUrl = profileImageUrl.startsWith("http")
    ? profileImageUrl
    : `${siteUrl}${profileImageUrl.startsWith("/") ? "" : "/"}${profileImageUrl}`;

  const profileUrl = `${siteUrl}/${username}`;

  return {
    title: artistName,
    description,
    keywords: [
      artistName,
      username,
      res.category || "artist",
      ...(Array.isArray(res.genres) ? res.genres : []),
      res.city || "India",
      "Artistant artist",
      "book live artist",
    ],
    alternates: {
      canonical: `/${username}`,
    },
    openGraph: {
      title: `${artistName} | Artistant`,
      description,
      url: profileUrl,
      type: "profile",
      siteName: "Artistant",
      locale: "en_IN",
      images: [
        {
          url: fullImageUrl,
          alt: artistName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${artistName} | Artistant`,
      description,
      images: [fullImageUrl],
    },
  };
}

export default async function ProfileLayout({ children, params }: ProfileLayoutProps) {
  const { username } = await params;
  const profile = await getPublicProfileDataAction(username);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://artistant.in";

  let artistSchema = null;
  if (profile && profile.reservation) {
    const res = profile.reservation;
    const artistName = ensureValidDisplayName(
      res.display_name,
      username,
      res.email
    );

    const sameAs: string[] = [];
    if (res.instagram_url) sameAs.push(res.instagram_url);
    if (res.spotify_url) sameAs.push(res.spotify_url);
    const ytUrl = res.youtube_channel_url || res.youtube_url;
    if (ytUrl) sameAs.push(ytUrl);

    artistSchema = {
      "@context": "https://schema.org",
      "@type": res.category === "band" ? "MusicGroup" : "Person",
      "name": artistName,
      "alternateName": username,
      "url": `${siteUrl}/${username}`,
      "image": res.profile_photo_url || res.cover_photo_url,
      "description": res.bio || `${artistName} is a live performer on Artistant.`,
      "homeLocation": res.city ? { "@type": "Place", "name": res.city } : undefined,
      "genre": Array.isArray(res.genres) ? res.genres : undefined,
      "sameAs": sameAs.length > 0 ? sameAs : undefined,
    };
  }

  return (
    <>
      {artistSchema && <JsonLd data={artistSchema} />}
      {children}
    </>
  );
}
