import { NextResponse } from 'next/server';
import { getListingById, updateListingById } from '@/lib/server/listings';
import { extractListingId, jsonError, parseJsonBody } from '@/lib/server/http';
import { deleteChannelMessage, sendListingMediaGroup } from '@/lib/server/telegram';
import { isAuthorizedAdminRequest } from '@/lib/server/auth';

export async function POST(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return jsonError('Unauthorized', 403);
  }

  try {
    const payload = await parseJsonBody(request);
    const listingId = extractListingId(payload);
    if (!listingId) {
      return jsonError('listingId is required', 400);
    }

    const listing = await getListingById(listingId);
    const photos = Array.isArray(listing?.photos)
      ? listing.photos.filter((photo): photo is string => typeof photo === 'string')
      : [];

    if (!listing || photos.length === 0 || !listing.formatted_post || !listing.telegram_message_id) {
      return jsonError('Listing not found', 404);
    }

    const previousMessageId = Number(listing.telegram_message_id);
    if (!Number.isInteger(previousMessageId)) {
      return jsonError('Listing has invalid telegram message id', 422);
    }

    try {
      await deleteChannelMessage(previousMessageId);
    } catch (error) {
      console.warn('Failed to delete previous message before bumping', error);
    }

    const sentMessages = await sendListingMediaGroup(photos, listing.formatted_post);
    const firstMessage = sentMessages[0];
    if (!firstMessage) {
      throw new Error('Telegram did not return a new message id');
    }

    await updateListingById(listingId, { telegram_message_id: firstMessage.message_id.toString() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bump route failed', error);
    return jsonError(error instanceof Error ? error.message : 'Failed to bump listing', 500);
  }
}
