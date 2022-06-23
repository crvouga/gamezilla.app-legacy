import { createClient, SupabaseClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

export let supabaseClient: SupabaseClient

const SUPABASE_URL = "https://ldxpcprlgecjvqwzuxgv.supabase.co"

const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"]

if (SUPABASE_SERVICE_ROLE_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {})
} else {
  throw new Error(`process.env["SUPABASE_SERVICE_ROLE_KEY"] is undefined`)
}
