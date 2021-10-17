import { createClient } from "@supabase/supabase-js";

const environment = {
  SUPABASE_URL: "https://jyyndvyjtsgxiwomlhjj.supabase.co",
  SUPABASE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDIzMjA5OSwiZXhwIjoxOTQ5ODA4MDk5fQ.1A8_Uu4MF_UsYZ0hoAG18D0376m_KhQA1SacPOklF58",
};

export const SupabaseClient = () => {
  return createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY, {});
};
