import { environment } from "$lib/environment";
import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  environment.supabaseUrl,
  environment.supbaseKey
);
