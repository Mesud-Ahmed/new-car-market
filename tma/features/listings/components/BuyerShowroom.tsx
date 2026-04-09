import type { CarListing } from '@/types';
import { BuyerFilters } from './BuyerFilters';
import { BuyerListingCard } from './BuyerListingCard';
import { EmptyState } from './EmptyState';
import { SectionHeader } from './SectionHeader';

interface BuyerShowroomProps {
  fuelFilter: string;
  listings: CarListing[];
  maxPrice: number;
  onCallDealer: () => void;
  onFuelFilterChange: (value: string) => void;
  onMaxPriceChange: (value: number) => void;
}

export function BuyerShowroom({
  fuelFilter,
  listings,
  maxPrice,
  onCallDealer,
  onFuelFilterChange,
  onMaxPriceChange,
}: BuyerShowroomProps) {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <SectionHeader title="Freedom Car Sale" subtitle="Live Showroom" />

      <BuyerFilters
        fuelFilter={fuelFilter}
        maxPrice={maxPrice}
        onFuelFilterChange={onFuelFilterChange}
        onMaxPriceChange={onMaxPriceChange}
      />

      {listings.length === 0 ? (
        <EmptyState message="No listings match the selected filters." />
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => (
            <BuyerListingCard key={listing.id} listing={listing} onCallDealer={onCallDealer} />
          ))}
        </div>
      )}
    </div>
  );
}
