import type { ExtractedCarData } from '../validation';

export interface PendingListing {
  userId: number;
  chatId: number;
  rawText: string;
  extracted: ExtractedCarData;
  photos: string[];
  createdAt: number;
}
