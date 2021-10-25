import { createClient } from "@supabase/supabase-js";
import { environment } from "./supabase-config";

export const supabaseClient = createClient(
  environment.supabaseUrl,
  environment.supbaseKey
);
