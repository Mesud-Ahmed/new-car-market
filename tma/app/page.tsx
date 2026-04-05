'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Truck, Phone, RefreshCw, XCircle, Loader2 } from 'lucide-react';

interface CarListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel_type?: string;
  plate_code?: string;
  mileage?: number;
  photos?: string[];
  status: string;
  formatted_post?: string;
}

export default function AutoFlowTMA() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'admin'>('buyer');
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceFilter, setPriceFilter] = useState<number>(5000000);
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Telegram WebApp init + Check if user is Admin
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();
      webApp.setHeaderColor('#111827');

      // ←←← PUT YOUR TELEGRAM USER ID HERE
      const ADMIN_USER_ID = 5040963728;   // ← Change this to your real Telegram ID

      if (webApp.initDataUnsafe?.user?.id === ADMIN_USER_ID) {
        setIsAdmin(true);
      }
    }
  }, []);

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'posted')
      .order('created_at', { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();

    const channel = supabase
      .channel('listings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, fetchListings)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const filteredListings = listings.filter((car) => {
    const priceMatch = car.price <= priceFilter;
    const fuelMatch = fuelFilter === 'all' || car.fuel_type?.toLowerCase() === fuelFilter;
    return priceMatch && fuelMatch;
  });

  const callDealer = () => window.location.href = 'tel:+251911461574';

  const handleSold = async (id: string) => { /* same as before */ };
  const handleBump = async (id: string) => { /* same as before */ };

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Tabs - Only show Admin tab if user is admin */}
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

      {/* BUYER VIEW */}
      {activeTab === 'buyer' && (
        // ... (your buyer carousel code stays the same)
        <div className="p-4 max-w-2xl mx-auto">
          {/* Your existing buyer code here */}
        </div>
      )}

      {/* ADMIN VIEW - Only visible to you */}
      {activeTab === 'admin' && isAdmin && (
        <div className="p-4 max-w-2xl mx-auto">
          {/* Your existing admin dashboard code */}
        </div>
      )}
    </main>
  );
}