import { createClient, Session as SupabaseSession } from "@supabase/supabase-js"
import { env } from "./env"

export type Session = SupabaseSession

export const client = createClient(env.supabaseUrl, env.supabaseAnonKey)

