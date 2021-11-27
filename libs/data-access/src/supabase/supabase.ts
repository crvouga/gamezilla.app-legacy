import { createClient } from "@supabase/supabase-js";

if (!process.env.NX_SUPABASE_URL) {
  throw new Error("process.env.NX_SUPABASE_URL is undefined");
}

if (!process.env.NX_SUPABASE_ANON_KEY) {
  throw new Error("process.env.NX_SUPABASE_ANON_KEY is undefined");
}

export const supabase = createClient(
  process.env.NX_SUPABASE_URL,
  process.env.NX_SUPABASE_ANON_KEY
);
