import { auth } from "./firebase/client";
import { checkUsernameAvailableAction } from "./admin-actions";
import {
  getMyReservationAction,
  getReferralCountAction,
  getWaitlistPositionCountAction,
  reserveUsernameAction,
  resolveClaimReservationAction,
  updateMyContactInfoAction,
  type ResolveClaimParams,
} from "./waitlist-actions";
import type { ReserveUsernameInput, WaitlistEntry } from "./waitlist-shared";

export * from "./waitlist-shared";
export type { ResolveClaimParams } from "./waitlist-actions";

/**
 * Client-side waitlist API. All database access goes through server actions that
 * verify the caller's Firebase ID token — the browser never queries Supabase directly.
 */

async function currentIdToken(): Promise<string | null> {
  const user = auth?.currentUser;
  return user ? user.getIdToken() : null;
}

/**
 * Checks whether a username is still available.
 *
 * @returns `true` if the username has **not** been reserved yet.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const res = await checkUsernameAvailableAction(username);
    return res.success ? res.available : true; // Don't block signup if the check itself failed
  } catch (error) {
    console.error("Error checking username availability:", error);
    return true;
  }
}

/**
 * Reserves a username for the signed-in user.
 *
 * @throws {Error} if the username is already taken or invalid.
 */
export async function reserveUsername(input: ReserveUsernameInput): Promise<void> {
  const idToken = await currentIdToken();
  if (!idToken) throw new Error("Please sign in to reserve a username.");
  const { uid: _uid, ...rest } = input;
  await reserveUsernameAction(idToken, rest);
}

/**
 * Retrieves the signed-in user's waitlist entry, if one exists.
 * The uid/email/phone arguments are kept for call-site compatibility; identity is
 * always taken from the verified ID token on the server.
 */
export async function getUserReservation(
  _uid?: string,
  _email?: string | null,
  _phone?: string | null,
): Promise<WaitlistEntry | null> {
  const idToken = await currentIdToken();
  if (!idToken) return null;
  try {
    return await getMyReservationAction(idToken);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return null;
  }
}

/** Resolves a reservation for the /claim page by id, username or email. */
export async function resolveClaimReservation(params: ResolveClaimParams): Promise<WaitlistEntry | null> {
  try {
    return await resolveClaimReservationAction(params);
  } catch (error) {
    console.error("Error resolving claim reservation:", error);
    return null;
  }
}

/**
 * Calculates the waitlist position of the user based on their reservation date.
 * Falls back to a stable pseudo-position if the count is unavailable.
 */
export async function getWaitlistPosition(reservedAt: string, userId: string, positionOverride?: number | null): Promise<number> {
  if (positionOverride !== undefined && positionOverride !== null) {
    return positionOverride;
  }
  let count: number | null = null;
  try {
    count = await getWaitlistPositionCountAction(reservedAt);
  } catch {
    count = null;
  }
  if (count) return count;

  const dateVal = new Date(reservedAt).getTime() || 0;
  const numHash = Math.abs(userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return 120 + ((dateVal + numHash) % 780);
}

export async function getReferralCount(username: string): Promise<number> {
  try {
    return await getReferralCountAction(username);
  } catch (e) {
    console.error("Failed to fetch referrals:", e);
    return 0;
  }
}

/** Fills in missing contact details on the signed-in user's entry. */
export async function updateReservationContactInfo(
  _id: string,
  _existingReservation: WaitlistEntry,
  email?: string | null,
  phone?: string | null,
): Promise<void> {
  const idToken = await currentIdToken();
  if (!idToken) return;
  await updateMyContactInfoAction(idToken, email, phone);
}
