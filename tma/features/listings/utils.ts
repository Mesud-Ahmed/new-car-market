import type { CarListing } from '@/types';

export async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) {
      return data.error;
    }
  } catch {
    // Fall back to the generic response status.
  }

  return response.statusText || 'Request failed';
}

export function normalizeListings(listings: CarListing[] | null): CarListing[] {
  return (listings ?? []).map((listing) => ({
    ...listing,
    photos: Array.isArray(listing.photos)
      ? listing.photos.filter((photo): photo is string => typeof photo === 'string')
      : [],
  }));
}

export function formatListingTitle(listing: CarListing): string {
  return `${listing.brand} ${listing.model} ${listing.year}`;
}

export function formatPrice(price: number): string {
  return `${Number(price).toLocaleString()} ETB`;
}

export function formatListingMeta(listing: CarListing): string {
  return `${listing.fuel_type ?? 'N/A'} • ${listing.plate_code ?? 'N/A'} • ${listing.mileage ?? 'N/A'} km`;
}
