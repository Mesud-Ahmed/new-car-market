const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
if (!supabaseUrl) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!supabaseAnonKey) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const publicEnv = {
  supabaseUrl,
  supabaseAnonKey,
};
