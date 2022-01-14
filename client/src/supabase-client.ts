import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error("process.env.NEXT_PUBLIC_SUPABASE_URL is undefined");
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error("process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined");
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
