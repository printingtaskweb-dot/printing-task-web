import { createClient } from '@supabase/supabase-js'

// Robust configuration: reads from environment variables, falls back to project defaults
// so the app never crashes with a blank screen even if .env is missing on Vercel
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://fatqvvayjmqnjrofjyuv.supabase.co'

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_MVpqzc5NrWlbHgO8trLLUg_0FNLLcrK'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type SupabaseClient = typeof supabase
