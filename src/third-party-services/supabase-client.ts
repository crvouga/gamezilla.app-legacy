import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

if (typeof supabaseUrl !== "string") {
  throw new Error("import.meta.env.VITE_SUPABASE_URL is not a string");
}

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (typeof supabaseAnonKey !== "string") {
  throw new Error("import.meta.env.VITE_SUPABASE_ANON_KEY is undefined");
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
