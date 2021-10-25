import { createClient } from "@supabase/supabase-js";
import { config } from "./supabase-config";

export const supabaseClient = createClient(
  config.supabaseUrl,
  config.supbaseKey
);
