"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCarData = void 0;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("./config");
const validation_1 = require("./validation");
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const SYSTEM_PROMPT = `
You are a professional Ethiopian car listing copywriter for "Freedom Car Sale".

Turn messy dealer text into a beautiful, attractive, consistent listing.

Return ONLY valid JSON with these keys:
{
  "brand": string,
  "model": string,
  "year": number,
  "price": number,
  "fuel_type": string,
  "plate_code": string,
  "mileage": number | null,
  "transmission": string,
  "engine": string,
  "condition": string,
  "features": string,
  "formatted_post": "the FULL beautiful text using the exact template below"
}

EXACT TEMPLATE (use \\n for line breaks, never use <br>):

<b>🏷️ [YEAR] [MAKE] [MODEL] [TRIM]</b>

<i>[One attractive hook sentence about the car's condition]</i>

<b>📊 CORE DETAILS</b>
• Status: [Brand New / Almost New / Super Excellent / Excellent]
• Mileage: 📍 [number] kms
• Plate: [Code ...]
• Engine: [full engine info]
• Fuel: [Diesel / Petrol / Electric / Hybrid]
• Transmission: [e.g. 10-Speed Automatic]
• Drive Type: [4WD / 2WD]

<b>✨ TOP FEATURES</b>
✅ Feature one
✅ Feature two
✅ Feature three
... (max 8 features)

<b>💰 PRICE: [amount] ETB</b>

📞 Contact us: +251911461574
📢 Join for more: t.me/netsi_car

Rules:
- Use \\n for every new line.
- Use <b> and <i> only where shown.
- Make the hook sentence attractive but honest.
- Never invent information.
- Keep features clean and readable.
`;
function extractJsonPayload(responseText) {
    const cleaned = responseText.replace(/```json|```/gi, '').trim();
    try {
        JSON.parse(cleaned);
        return cleaned;
    }
    catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start === -1 || end <= start) {
            throw new Error('No JSON object found in model response');
        }
        const candidate = cleaned.slice(start, end + 1);
        JSON.parse(candidate);
        return candidate;
    }
}
const extractCarData = async (text) => {
    const prompt = `${SYSTEM_PROMPT}\n\nDealer's messy message:\n${text}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const jsonStr = extractJsonPayload(responseText);
    const parsed = JSON.parse(jsonStr);
    return validation_1.ExtractedCarDataSchema.parse(parsed);
};
exports.extractCarData = extractCarData;
