import type { PostgrestError } from "@supabase/supabase-js";

export const postgresErrorToError = (error: PostgrestError) => {
  return new Error(error.message);
};
