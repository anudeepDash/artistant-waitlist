import 'server-only';
import { cache } from 'react';
import { getPublicProfileDataAction } from '@/lib/profile-actions';

/**
 * Request-scoped memoised profile fetch, shared by generateMetadata, the layout and
 * the page so a profile view hits the database once instead of three times.
 */
export const getPublicProfile = cache((username: string) => getPublicProfileDataAction(decodeURIComponent(username)));
