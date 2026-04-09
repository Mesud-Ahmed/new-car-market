import type { CarListing } from '@/types';
import { formatListingMeta, formatListingTitle, formatPrice } from '../utils';

interface ListingSummaryProps {
  listing: CarListing;
}

export function ListingSummary({ listing }: ListingSummaryProps) {
  return (
    <>
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-bold">{formatListingTitle(listing)}</h3>
        <p className="text-xl font-semibold text-emerald-400">{formatPrice(listing.price)}</p>
      </div>
      <p className="text-sm text-gray-400">{formatListingMeta(listing)}</p>
    </>
  );
}
