import { z } from 'zod';

const nullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

const nullableInteger = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
  });

export const CarListingSchema = z.object({
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  year: z.coerce.number().int().min(1990).max(2030),
  price: z.coerce.number().int().min(100000),
  fuel_type: nullableString,
  plate_code: nullableString,
  mileage: nullableInteger,
  transmission: nullableString,
  color: nullableString,
  condition: nullableString,
  description: nullableString,
});

export type ValidatedCarListing = z.infer<typeof CarListingSchema>;

export const ExtractedCarDataSchema = CarListingSchema.extend({
  engine: nullableString,
  features: nullableString,
  formatted_post: z.string().trim().min(1),
}).passthrough();

export type ExtractedCarData = z.infer<typeof ExtractedCarDataSchema>;
