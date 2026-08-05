import type { MetadataRoute } from 'next';
import { getPublicCreatorsDirectoryAction } from '@/lib/profile-actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artistant.in';

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gigs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/claim`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/jasmine-sandlas-bengaluru`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic artist profile routes
  let artistRoutes: MetadataRoute.Sitemap = [];
  try {
    const creators = await getPublicCreatorsDirectoryAction();
    if (Array.isArray(creators)) {
      artistRoutes = creators
        .filter((c: any) => c && c.username)
        .map((creator: any) => ({
          url: `${baseUrl}/${encodeURIComponent(creator.username)}`,
          lastModified: creator.reserved_at ? new Date(creator.reserved_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error('Error building dynamic sitemap artist routes:', error);
  }

  return [...staticRoutes, ...artistRoutes];
}
