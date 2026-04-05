'use client';

import { useEffect, useState } from 'react';
import { Loader2, Phone, RefreshCw, Truck, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { CarListing } from '@/types';

const ADMIN_USER_ID = 5040963728;
const DEALER_PHONE = '+251911461574';
const TELEGRAM_USER_HEADER = 'x-telegram-user-id';

type ActiveTab = 'buyer' | 'admin';

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) {
      return data.error;
    }
  } catch {
    // Fallback to status text below.
  }
  return response.statusText || 'Request failed';
}

export default function AutoFlowTMA() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('buyer');
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<number>(5_000_000);
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [telegramUserId, setTelegramUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      return;
    }

    const webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.expand();
    webApp.setHeaderColor('#111827');

    let attempts = 0;
    const maxAttempts = 20;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      const userId = webApp.initDataUnsafe?.user?.id;
      if (userId) {
        setTelegramUserId(userId);
        if (userId === ADMIN_USER_ID) {
          setIsAdmin(true);
          setActiveTab('admin');
        }
        window.clearInterval(intervalId);
      } else if (attempts >= maxAttempts) {
        window.clearInterval(intervalId);
      }
    }, 150);

    return () => window.clearInterval(intervalId);
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'posted')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const normalizedListings: CarListing[] = (data ?? []).map((item) => ({
        ...(item as CarListing),
        photos: Array.isArray((item as CarListing).photos)
          ? (item as CarListing).photos.filter((photo): photo is string => typeof photo === 'string')
          : [],
      }));

      setListings(normalizedListings);
      setLoadError(null);
    } catch (error) {
      console.error('Failed to fetch listings', error);
      setLoadError('Could not load listings right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();

    const channel = supabase
      .channel('listings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, fetchListings)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const filteredListings = listings.filter((car) => {
    const priceMatch = car.price <= priceFilter;
    const fuelMatch = fuelFilter === 'all' || car.fuel_type?.toLowerCase() === fuelFilter;
    return priceMatch && fuelMatch;
  });

  const callDealer = () => {
    window.location.assign(`tel:${DEALER_PHONE}`);
  };

  const runAdminAction = async (path: '/api/sold' | '/api/bump', listingId: string): Promise<void> => {
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

  const handleSold = async (id: string) => {
    setProcessingId(id);
    try {
      await runAdminAction('/api/sold', id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not mark listing as sold.';
      setLoadError(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBump = async (id: string) => {
    setProcessingId(id);
    try {
      await runAdminAction('/api/bump', id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not bump listing.';
      setLoadError(message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Loading Freedom Car Sale...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 z-50">
        <div className="flex">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'buyer' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
          >
            🛍️ Showroom
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-4 text-center font-medium ${activeTab === 'admin' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
            >
              ⚙️ Admin
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <p className="rounded-2xl bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-100">{loadError}</p>
        </div>
      )}

      {activeTab === 'buyer' && (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-9 h-9 text-emerald-500" />
            <div>
              <h1 className="text-3xl font-bold">Freedom Car Sale</h1>
              <p className="text-emerald-400">Live Showroom</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-4 mb-6 flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-gray-400 block mb-1">Max Price</label>
              <input
                type="range"
                min="1000000"
                max="50000000"
                step="500000"
                value={priceFilter}
                onChange={(event) => setPriceFilter(Number(event.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="text-sm font-medium text-emerald-400 mt-1">
                ≤ {priceFilter.toLocaleString()} ETB
              </div>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-gray-400 block mb-1">Fuel Type</label>
              <select
                value={fuelFilter}
                onChange={(event) => setFuelFilter(event.target.value)}
                className="bg-gray-800 text-white w-full rounded-2xl px-4 py-3 text-sm"
              >
                <option value="all">All Types</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-gray-900 rounded-3xl p-6 text-center text-gray-400">No listings match the selected filters.</div>
          ) : (
            <div className="space-y-6">
              {filteredListings.map((car) => (
                <div key={car.id} className="bg-gray-900 rounded-3xl overflow-hidden">
                  <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    {car.photos.slice(0, 4).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-64 flex-shrink-0 object-cover snap-center"
                      />
                    ))}
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold">
                        {car.brand} {car.model} {car.year}
                      </h3>
                      <p className="text-emerald-400 font-semibold text-xl">{Number(car.price).toLocaleString()} ETB</p>
                    </div>

                    <p className="text-gray-400 text-sm">
                      {car.fuel_type ?? 'N/A'} • {car.plate_code ?? 'N/A'} • {car.mileage ?? 'N/A'} km
                    </p>

                    <button
                      onClick={callDealer}
                      className="mt-6 w-full bg-white text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-colors"
                    >
                      <Phone className="w-6 h-6" />
                      CALL DEALER
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin' && isAdmin && (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-9 h-9 text-emerald-500" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="bg-gray-900 rounded-3xl p-5">
            <h2 className="text-xl font-semibold mb-4">Active Listings ({listings.length})</h2>
            <div className="space-y-4">
              {listings.map((car) => (
                <div key={car.id} className="flex gap-4 bg-gray-800 rounded-2xl p-4">
                  {car.photos[0] && (
                    <img
                      src={car.photos[0]}
                      alt={`${car.brand} ${car.model}`}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold">
                      {car.brand} {car.model} {car.year}
                    </h3>
                    <p className="text-emerald-400">{Number(car.price).toLocaleString()} ETB</p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => handleSold(car.id)}
                        disabled={processingId === car.id}
                        className="bg-red-600 hover:bg-red-700 py-3 rounded-2xl text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processingId === car.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            SOLD
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleBump(car.id)}
                        disabled={processingId === car.id}
                        className="bg-amber-600 hover:bg-amber-700 py-3 rounded-2xl text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processingId === car.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5" />
                            BUMP
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
