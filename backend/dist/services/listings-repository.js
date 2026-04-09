"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countListings = countListings;
exports.savePostedListing = savePostedListing;
const supabase_1 = require("../supabase");
function toListingsInsertPayload(extracted) {
    const { brand, model, year, price, fuel_type, plate_code, mileage, transmission, color, condition, description, ...extractedData } = extracted;
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
async function countListings() {
    const { count, error } = await supabase_1.supabase.from('listings').select('*', { count: 'exact', head: true });
    if (error) {
        throw new Error(error.message);
    }
    return count ?? 0;
}
async function savePostedListing(input) {
    const { channelId, extracted, photos, telegramMessageId } = input;
    const { error } = await supabase_1.supabase.from('listings').insert({
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
