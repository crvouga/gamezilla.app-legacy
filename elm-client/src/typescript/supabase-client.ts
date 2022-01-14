import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("process.env.SUPABASE_URL is undefined");
}

if (!supabaseAnonKey) {
  throw new Error("process.env.SUPABASE_ANON_KEY; is undefined");
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
