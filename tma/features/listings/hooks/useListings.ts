'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CarListing } from '@/types';
import { normalizeListings } from '../utils';

interface ListingsState {
  listings: CarListing[];
  isLoading: boolean;
  loadError: string | null;
  setLoadError: (error: string | null) => void;
}

export function useListings(): ListingsState {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
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

        setListings(normalizeListings((data ?? []) as CarListing[]));
        setLoadError(null);
      } catch (error) {
        console.error('Failed to fetch listings', error);
        setLoadError('Could not load listings right now.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchListings();

    // Keep the showroom in sync with listing updates without a manual refresh.
    const channel = supabase
      .channel('listings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
        void fetchListings();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return { listings, isLoading, loadError, setLoadError };
}
