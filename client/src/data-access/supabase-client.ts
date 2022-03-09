import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  const value = import.meta.env[key];

  if (typeof value === 'string') {
    return value;
  }

  throw new Error(`env variable '${key}' is undefined`);
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
