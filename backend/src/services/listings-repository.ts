import { supabase } from '../supabase';
import type { ExtractedCarData } from '../validation';

interface SavePostedListingInput {
  channelId: number;
  extracted: ExtractedCarData;
  photos: string[];
  telegramMessageId: string;
}

function toListingsInsertPayload(extracted: ExtractedCarData) {
  const {
    brand,
    model,
    year,
    price,
    fuel_type,
    plate_code,
    mileage,
    transmission,
    color,
    condition,
    description,
    ...extractedData
  } = extracted;

  return {
    brand,
    model,
    year,
    price,
    fuel_type,
    plate_code,
    mileage,
    transmission,
    color,
    condition,
    description,
    extracted_data: extractedData,
  };
}

export async function countListings(): Promise<number> {
  const { count, error } = await supabase.from('listings').select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function savePostedListing(input: SavePostedListingInput): Promise<void> {
  const { channelId, extracted, photos, telegramMessageId } = input;

  const { error } = await supabase.from('listings').insert({
    status: 'posted',
    telegram_message_id: telegramMessageId,
    telegram_chat_id: channelId,
    ...toListingsInsertPayload(extracted),
    photos,
  });

  if (error) {
    throw new Error(`Failed to save listing: ${error.message}`);
  }
}
