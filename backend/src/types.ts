import type { ExtractedCarData } from './validation';

export type ListingStatus = 'pending' | 'posted' | 'sold';

export interface CarListing {
  id?: string;
  status: ListingStatus;
  telegram_message_id?: string;
  telegram_chat_id?: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel_type?: string;
  plate_code?: string;
  mileage?: number;
  transmission?: string;
  color?: string;
  condition?: string;
  description?: string;
  photos: string[];
  formatted_post?: string;
  engine?: string | null;
  features?: string | null;
  extracted_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface PendingListing {
  userId: number;
  chatId: number;
  rawText: string;
  extracted: ExtractedCarData;
  photos: string[];
  createdAt: number;
}

// Temporary storage for the new flow
export const pendingListings = new Map<number, PendingListing>();
