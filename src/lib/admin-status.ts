import { checkIsAdminAction } from './admin-actions';

/**
 * Client-side memo of "is this signed-in user an admin?". The Coming Soon guard, the
 * navbar and the home page all need it, and server actions run one at a time on the
 * client, so separate calls used to queue behind each other on every page load.
 */
const adminStatusByUid = new Map<string, Promise<boolean>>();

export function checkIsAdminCached(user: { uid: string; getIdToken: () => Promise<string> }): Promise<boolean> {
  let pending = adminStatusByUid.get(user.uid);
  if (!pending) {
    pending = user
      .getIdToken()
      .then((token) => checkIsAdminAction(token))
      .catch(() => {
        adminStatusByUid.delete(user.uid); // Retry next time on network/auth errors
        return false;
      });
    adminStatusByUid.set(user.uid, pending);
  }
  return pending;
}
