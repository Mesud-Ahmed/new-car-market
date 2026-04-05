import { NextResponse } from 'next/server';
import { getListingById, updateListingById } from '@/lib/server/listings';
import { extractListingId, jsonError, parseJsonBody } from '@/lib/server/http';
import { markListingAsSoldCaption } from '@/lib/server/telegram';
import { isAuthorizedAdminRequest } from '@/lib/server/auth';

function buildSoldCaption(brand: string, model: string, year: number, price: number): string {
  return `❌ SOLD - ${brand} ${model} ${year}\n💰 ${Number(price).toLocaleString()} ETB`;
}

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
    if (!listing || !listing.telegram_message_id) {
      return jsonError('Listing not found', 404);
    }

    const messageId = Number(listing.telegram_message_id);
    if (!Number.isInteger(messageId)) {
      return jsonError('Listing has invalid telegram message id', 422);
    }

    const caption = buildSoldCaption(listing.brand, listing.model, listing.year, listing.price);
    await markListingAsSoldCaption(messageId, caption);
    await updateListingById(listingId, { status: 'sold' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sold route failed', error);
    return jsonError(error instanceof Error ? error.message : 'Failed to mark listing as sold', 500);
  }
}
