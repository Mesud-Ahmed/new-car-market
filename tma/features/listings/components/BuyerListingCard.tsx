import type { CarListing } from '@/types';
import { formatListingTitle } from '../utils';
import { CallDealerButton } from './CallDealerButton';
import { ListingImageStrip } from './ListingImageStrip';
import { ListingSummary } from './ListingSummary';

interface BuyerListingCardProps {
  listing: CarListing;
  onCallDealer: () => void;
}

export function BuyerListingCard({ listing, onCallDealer }: BuyerListingCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-gray-900">
      <ListingImageStrip alt={formatListingTitle(listing)} photos={listing.photos} />

      <div className="p-5">
        <ListingSummary listing={listing} />
        <CallDealerButton onClick={onCallDealer} />
      </div>
    </div>
  );
}
