function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseIntEnv(name: string): number {
  const value = Number(requireEnv(name));
  if (!Number.isInteger(value)) {
    throw new Error(`Environment variable ${name} must be an integer`);
  }
  return value;
}

function parseOptionalIntEnv(name: string): number | null {
  const rawValue = process.env[name]?.trim();
  if (!rawValue) {
    return null;
  }
  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer when set`);
  }
  return parsed;
}

export const serverEnv = {
  botToken: requireEnv('BOT_TOKEN'),
  channelId: parseIntEnv('CHANNEL_ID'),
  adminUserId: parseOptionalIntEnv('ADMIN_USER_ID'),
};
