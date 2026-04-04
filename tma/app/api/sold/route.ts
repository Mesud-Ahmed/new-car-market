import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

const BOT_TOKEN = process.env.BOT_TOKEN!;
const CHANNEL_ID = Number(process.env.CHANNEL_ID!);

export async function POST(req: Request) {
  const { listingId } = await req.json();

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (!listing || !listing.telegram_message_id) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  // Edit original channel message
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageCaption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      message_id: Number(listing.telegram_message_id),
      caption: `❌ SOLD - ${listing.brand} ${listing.model} ${listing.year}\n💰 ${Number(listing.price).toLocaleString()} ETB`,
      parse_mode: 'HTML',
    }),
  });

  // Update DB
  await supabase
    .from('listings')
    .update({ status: 'sold' })
    .eq('id', listingId);

  return NextResponse.json({ success: true });
}