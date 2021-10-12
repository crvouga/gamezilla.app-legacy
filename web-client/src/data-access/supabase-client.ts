import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nplbxkhwvvgqlzkrlxqg.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNzY4NzA0MiwiZXhwIjoxOTMzMjYzMDQyfQ.lCaseZMGFbSJLv-XGXuuwF6GSHADJqdU1p4DpkCMshE";

export const SupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};
