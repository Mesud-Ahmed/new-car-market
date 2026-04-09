import { PENDING_LISTING_TTL_MS } from './constants';
import type { PendingListing } from './types';

const pendingListings = new Map<number, PendingListing>();

function isExpired(pendingListing: PendingListing): boolean {
  return Date.now() - pendingListing.createdAt > PENDING_LISTING_TTL_MS;
}

export function getPendingListing(userId: number): PendingListing | undefined {
  const pendingListing = pendingListings.get(userId);

  if (!pendingListing) {
    return undefined;
  }

  if (!isExpired(pendingListing)) {
    return pendingListing;
  }

  pendingListings.delete(userId);
  return undefined;
}

export function setPendingListing(userId: number, listing: PendingListing): void {
  pendingListings.set(userId, listing);
}

export function deletePendingListing(userId: number): void {
  pendingListings.delete(userId);
}

export function startPendingCleanup(): void {
  const cleanupIntervalMs = Math.min(Math.max(Math.floor(PENDING_LISTING_TTL_MS / 2), 60_000), 5 * 60_000);

  const cleanupTimer = setInterval(() => {
    for (const [userId, pendingListing] of pendingListings.entries()) {
      if (isExpired(pendingListing)) {
        pendingListings.delete(userId);
      }
    }
  }, cleanupIntervalMs);

  cleanupTimer.unref();
}
