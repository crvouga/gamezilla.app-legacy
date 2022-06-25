import { Session as SupabaseSession, createClient } from "@supabase/supabase-js"

export type Session = SupabaseSession

const SUPABASE_URL = "https://ldxpcprlgecjvqwzuxgv.supabase.co"

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNzA0MDQ5NywiZXhwIjoxOTUyNjE2NDk3fQ.ReI8CpIFbLB9Q53Az7CDBIyrn_o1JeGhPoZXdqx8Ac4"

export const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {})
