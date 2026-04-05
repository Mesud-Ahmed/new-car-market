export type ListingStatus = 'pending' | 'posted' | 'sold';

export interface CarListing {
  id: string;
  status: ListingStatus;
  telegram_message_id?: string;
  telegram_chat_id?: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel_type?: string | null;
  plate_code?: string | null;
  mileage?: number | null;
  transmission?: string | null;
  color?: string | null;
  condition?: string | null;
  description?: string | null;
  formatted_post?: string | null;
  photos: string[];
  created_at?: string;
  updated_at?: string;
}
