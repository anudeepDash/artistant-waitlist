import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://artistant.in';
export const SITE_NAME = 'Artistant';
export const TWITTER_HANDLE = '@artistant_in';

interface PageMetadataOptions {
  /** Short title for the tab; the root layout adds " | Artistant". */
  title: string;
  /** 140–160 characters reads in full on Google and in link previews. */
  description: string;
  /** Path from the site root, e.g. "/directory". Used for the canonical and og:url. */
  path: string;
  /** Headline for link previews, when it should say more than the tab title. */
  socialTitle?: string;
  keywords?: string[];
}

/**
 * Metadata for a public page. Child segments replace the parent's openGraph and
 * twitter objects wholesale, so every page sets the full set here. Images come
 * from the route's opengraph-image file, so none are listed.
 */
export function pageMetadata({ title, description, path, socialTitle, keywords }: PageMetadataOptions): Metadata {
  const shareTitle = socialTitle ?? `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
  };
}
