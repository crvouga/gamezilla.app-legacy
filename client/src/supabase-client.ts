import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(process.env.REACT_APP_SUPABASE_URL);
const supabaseKey = String(process.env.REACT_APP_SUPABASE_ANON_KEY);

export const supabaseClient = createClient(supabaseUrl, supabaseKey);
