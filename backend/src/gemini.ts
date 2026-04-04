import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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

export const extractCarData = async (text: string): Promise<any> => {
  const prompt = `${SYSTEM_PROMPT}\n\nDealer’s messy message:\n${text}`;
  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();
  const jsonStr = responseText.replace(/```json|```/g, '').trim();
  return JSON.parse(jsonStr);
};