import { NextResponse } from 'next/server';

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error('Request body must be valid JSON');
  }
}

export function extractListingId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const listingId = (payload as { listingId?: unknown }).listingId;
  if (typeof listingId !== 'string') {
    return null;
  }

  const trimmed = listingId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function extractTelegramUserId(request: Request): number | null {
  const userIdHeader = request.headers.get('x-telegram-user-id');
  if (!userIdHeader) {
    return null;
  }

  const parsed = Number(userIdHeader);
  return Number.isInteger(parsed) ? parsed : null;
}
