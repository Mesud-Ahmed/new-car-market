import { serverEnv } from './env';

interface TelegramApiSuccess<T> {
  ok: true;
  result: T;
}

interface TelegramApiFailure {
  ok: false;
  description?: string;
}

type TelegramApiResponse<T> = TelegramApiSuccess<T> | TelegramApiFailure;

interface TelegramMessage {
  message_id: number;
}

async function callTelegramApi<T>(method: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${serverEnv.botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Telegram ${method} failed with HTTP ${response.status}`);
  }

  const body = (await response.json()) as TelegramApiResponse<T>;
  if (!body.ok) {
    throw new Error(body.description ?? `Telegram ${method} failed`);
  }

  return body.result;
}

export async function deleteChannelMessage(messageId: number): Promise<void> {
  await callTelegramApi<boolean>('deleteMessage', {
    chat_id: serverEnv.channelId,
    message_id: messageId,
  });
}

export async function sendListingMediaGroup(
  photos: string[],
  caption: string,
): Promise<TelegramMessage[]> {
  return callTelegramApi<TelegramMessage[]>('sendMediaGroup', {
    chat_id: serverEnv.channelId,
    media: photos.map((url, index) => ({
      type: 'photo',
      media: url,
      caption: index === 0 ? caption : undefined,
      parse_mode: 'HTML',
    })),
  });
}

export async function markListingAsSoldCaption(messageId: number, caption: string): Promise<void> {
  await callTelegramApi<TelegramMessage | true>('editMessageCaption', {
    chat_id: serverEnv.channelId,
    message_id: messageId,
    caption,
    parse_mode: 'HTML',
  });
}
