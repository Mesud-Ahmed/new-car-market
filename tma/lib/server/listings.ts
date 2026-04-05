import { supabase } from '@/lib/supabase';
import type { CarListing } from '@/types';

export async function getListingById(listingId: string): Promise<CarListing | null> {
  const { data, error } = await supabase.from('listings').select('*').eq('id', listingId).single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch listing: ${error.message}`);
  }
  return data as CarListing;
}

export async function updateListingById(
  listingId: string,
  payload: Partial<Pick<CarListing, 'telegram_message_id' | 'status'>>,
): Promise<void> {
  const { error } = await supabase.from('listings').update(payload).eq('id', listingId);
  if (error) {
    throw new Error(`Failed to update listing: ${error.message}`);
  }
}
