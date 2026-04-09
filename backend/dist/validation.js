"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractedCarDataSchema = exports.CarListingSchema = void 0;
const zod_1 = require("zod");
const nullableString = zod_1.z
    .union([zod_1.z.string(), zod_1.z.null(), zod_1.z.undefined()])
    .transform((value) => {
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
});
const nullableInteger = zod_1.z
    .union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null(), zod_1.z.undefined()])
    .transform((value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
});
exports.CarListingSchema = zod_1.z.object({
    brand: zod_1.z.string().trim().min(1),
    model: zod_1.z.string().trim().min(1),
    year: zod_1.z.coerce.number().int().min(1990).max(2030),
    price: zod_1.z.coerce.number().int().min(100000),
    fuel_type: nullableString,
    plate_code: nullableString,
    mileage: nullableInteger,
    transmission: nullableString,
    color: nullableString,
    condition: nullableString,
    description: nullableString,
});
exports.ExtractedCarDataSchema = exports.CarListingSchema.extend({
    engine: nullableString,
    features: nullableString,
    formatted_post: zod_1.z.string().trim().min(1),
}).passthrough();
