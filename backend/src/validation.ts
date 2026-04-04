import { z } from 'zod';

export const CarListingSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(2030),
  price: z.number().int().min(100000),
  fuel_type: z.string().nullable(),
  plate_code: z.string().nullable(),
  mileage: z.number().int().nullable(),
  transmission: z.string().nullable(),
  color: z.string().nullable(),
  condition: z.string().nullable(),
  description: z.string().nullable(),
});

export type ValidatedCarListing = z.infer<typeof CarListingSchema>;