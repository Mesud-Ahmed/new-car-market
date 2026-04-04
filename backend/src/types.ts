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
  extracted_data?: any;
  created_at?: string;
  updated_at?: string;
}

// Temporary storage for the new flow
export const pendingListings = new Map<number, {
  userId: number;
  chatId: number;
  rawText: string;
  extracted: any;
  photos: string[];           // will be filled after photos arrive
}>();