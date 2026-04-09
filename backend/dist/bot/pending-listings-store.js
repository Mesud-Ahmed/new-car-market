"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingListing = getPendingListing;
exports.setPendingListing = setPendingListing;
exports.deletePendingListing = deletePendingListing;
exports.startPendingCleanup = startPendingCleanup;
const constants_1 = require("./constants");
const pendingListings = new Map();
function isExpired(pendingListing) {
    return Date.now() - pendingListing.createdAt > constants_1.PENDING_LISTING_TTL_MS;
}
function getPendingListing(userId) {
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
function setPendingListing(userId, listing) {
    pendingListings.set(userId, listing);
}
function deletePendingListing(userId) {
    pendingListings.delete(userId);
}
function startPendingCleanup() {
    const cleanupIntervalMs = Math.min(Math.max(Math.floor(constants_1.PENDING_LISTING_TTL_MS / 2), 60_000), 5 * 60_000);
    const cleanupTimer = setInterval(() => {
        for (const [userId, pendingListing] of pendingListings.entries()) {
            if (isExpired(pendingListing)) {
                pendingListings.delete(userId);
            }
        }
    }, cleanupIntervalMs);
    cleanupTimer.unref();
}
