import type { Metadata } from "next";
import { cache } from "react";
import { getPublicProfileDataAction } from "@/lib/profile-actions";
import { ensureValidDisplayName } from "@/lib/waitlist";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, TWITTER_HANDLE } from "@/lib/seo";

// The page title and the layout both need the profile; fetch it once per request.
const loadProfile = cache((username: string) => getPublicProfileDataAction(username));

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
  const profile = await loadProfile(username);

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

  const category = res.category ? res.category.replace(/[-_]+/g, " ") : "live artist";
  const where = res.city ? ` in ${res.city}` : " in India";
  const bio = res.bio?.replace(/\s+/g, " ").trim() ?? "";
  // Keep it near 155 characters so Google and link previews show it whole.
  const bioExcerpt = bio.length > 110 ? `${bio.slice(0, 107).trimEnd()}…` : bio;
  const description = bioExcerpt
    ? `${bioExcerpt} Book ${artistName} on Artistant with a real contract and safe payment.`
    : `${artistName} is a ${category}${where}. Watch their videos, hear their music and book them on Artistant with a real contract and safe payment.`;

  // "Riya Sen — Singer, Bengaluru"
  const label = `${category[0].toUpperCase()}${category.slice(1)}${res.city ? `, ${res.city}` : ""}`;
  const title = `${artistName} — ${label}`;
  const shareTitle = `${title} | Artistant`;

  // The share image is drawn by ./opengraph-image.tsx, so none is listed here.
  return {
    title,
    description,
    keywords: [
      artistName,
      username,
      res.category || "artist",
      ...(Array.isArray(res.genres) ? res.genres : []),
      res.city || "India",
      `book ${artistName}`,
      "book live artist",
    ],
    alternates: {
      canonical: `/${username}`,
    },
    openGraph: {
      title: shareTitle,
      description,
      url: `/${username}`,
      type: "profile",
      username,
      siteName: SITE_NAME,
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      site: TWITTER_HANDLE,
    },
  };
}

export default async function ProfileLayout({ children, params }: ProfileLayoutProps) {
  const { username } = await params;
  const profile = await loadProfile(username);
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
