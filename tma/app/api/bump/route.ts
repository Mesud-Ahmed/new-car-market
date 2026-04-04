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

  if (!listing || !listing.photos) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  // Delete old message
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      message_id: Number(listing.telegram_message_id),
    }),
  });

  // Re-post with the original beautiful formatted_post
  const sent = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      media: listing.photos.map((url: string, i: number) => ({
        type: 'photo',
        media: url,
        caption: i === 0 ? listing.formatted_post : undefined,
        parse_mode: 'HTML',
      })),
    }),
  });

  const result = await sent.json();
  const newMessageId = result.result[0].message_id;

  // Update message_id in DB
  await supabase
    .from('listings')
    .update({ telegram_message_id: newMessageId.toString() })
    .eq('id', listingId);

  return NextResponse.json({ success: true });
}