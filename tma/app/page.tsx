'use client';

import { useMemo, useState } from 'react';
import { DEALER_PHONE, DEFAULT_MAX_PRICE, TELEGRAM_USER_HEADER } from '@/features/listings/constants';
import { AdminDashboard } from '@/features/listings/components/AdminDashboard';
import { BuyerShowroom } from '@/features/listings/components/BuyerShowroom';
import { ErrorBanner } from '@/features/listings/components/ErrorBanner';
import { LoadingScreen } from '@/features/listings/components/LoadingScreen';
import { TabBar } from '@/features/listings/components/TabBar';
import { useListings } from '@/features/listings/hooks/useListings';
import { useTelegramSession } from '@/features/listings/hooks/useTelegramSession';
import type { AdminActionPath } from '@/features/listings/types';
import { readErrorMessage } from '@/features/listings/utils';

export default function AutoFlowTMA() {
  const { activeTab, isAdmin, telegramUserId, setActiveTab } = useTelegramSession();
  const { listings, isLoading, loadError, setLoadError } = useListings();
  const [priceFilter, setPriceFilter] = useState<number>(DEFAULT_MAX_PRICE);
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredListings = useMemo(
    () =>
      listings.filter((listing) => {
        const matchesPrice = listing.price <= priceFilter;
        const matchesFuel = fuelFilter === 'all' || listing.fuel_type?.toLowerCase() === fuelFilter;
        return matchesPrice && matchesFuel;
      }),
    [fuelFilter, listings, priceFilter]
  );

  const callDealer = () => {
    window.location.assign(`tel:${DEALER_PHONE}`);
  };

  const runAdminAction = async (path: AdminActionPath, listingId: string): Promise<void> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (telegramUserId !== null) {
      headers[TELEGRAM_USER_HEADER] = String(telegramUserId);
    }

    const response = await fetch(path, {
      method: 'POST',
      headers,
      body: JSON.stringify({ listingId }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
  };

  const handleSold = async (listingId: string) => {
    setProcessingId(listingId);

    try {
      await runAdminAction('/api/sold', listingId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not mark listing as sold.';
      setLoadError(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBump = async (listingId: string) => {
    setProcessingId(listingId);

    try {
      await runAdminAction('/api/bump', listingId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not bump listing.';
      setLoadError(message);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <TabBar activeTab={activeTab} isAdmin={isAdmin} onTabChange={setActiveTab} />

      {loadError && <ErrorBanner message={loadError} />}

      {activeTab === 'buyer' && (
        <BuyerShowroom
          fuelFilter={fuelFilter}
          listings={filteredListings}
          maxPrice={priceFilter}
          onCallDealer={callDealer}
          onFuelFilterChange={setFuelFilter}
          onMaxPriceChange={setPriceFilter}
        />
      )}

      {activeTab === 'admin' && isAdmin && (
        <AdminDashboard
          listings={listings}
          onBump={handleBump}
          onSold={handleSold}
          processingId={processingId}
        />
      )}
    </main>
  );
}
