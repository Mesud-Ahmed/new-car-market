import type { CarListing } from '@/types';
import { AdminListingCard } from './AdminListingCard';
import { SectionHeader } from './SectionHeader';

interface AdminDashboardProps {
  listings: CarListing[];
  onBump: (listingId: string) => void;
  onSold: (listingId: string) => void;
  processingId: string | null;
}

export function AdminDashboard({
  listings,
  onBump,
  onSold,
  processingId,
}: AdminDashboardProps) {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <SectionHeader title="Admin Dashboard" />

      <div className="rounded-3xl bg-gray-900 p-5">
        <h2 className="mb-4 text-xl font-semibold">Active Listings ({listings.length})</h2>
        <div className="space-y-4">
          {listings.map((listing) => (
            <AdminListingCard
              key={listing.id}
              isProcessing={processingId === listing.id}
              listing={listing}
              onBump={onBump}
              onSold={onSold}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
