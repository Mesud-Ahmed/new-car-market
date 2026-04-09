import { RefreshCw, XCircle } from 'lucide-react';
import type { CarListing } from '@/types';
import { formatListingTitle, formatPrice } from '../utils';
import { AdminActionButton } from './AdminActionButton';

interface AdminListingCardProps {
  isProcessing: boolean;
  listing: CarListing;
  onBump: (listingId: string) => void;
  onSold: (listingId: string) => void;
}

export function AdminListingCard({
  isProcessing,
  listing,
  onBump,
  onSold,
}: AdminListingCardProps) {
  return (
    <div className="flex gap-4 rounded-2xl bg-gray-800 p-4">
      {listing.photos[0] && (
        <img
          src={listing.photos[0]}
          alt={formatListingTitle(listing)}
          className="h-20 w-20 rounded-xl object-cover"
        />
      )}

      <div className="flex-1">
        <h3 className="font-bold">{formatListingTitle(listing)}</h3>
        <p className="text-emerald-400">{formatPrice(listing.price)}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <AdminActionButton
            className="bg-red-600 hover:bg-red-700"
            disabled={isProcessing}
            icon={<XCircle className="h-5 w-5" />}
            isProcessing={isProcessing}
            label="SOLD"
            onClick={() => onSold(listing.id)}
          />
          <AdminActionButton
            className="bg-amber-600 hover:bg-amber-700"
            disabled={isProcessing}
            icon={<RefreshCw className="h-5 w-5" />}
            isProcessing={isProcessing}
            label="BUMP"
            onClick={() => onBump(listing.id)}
          />
        </div>
      </div>
    </div>
  );
}
