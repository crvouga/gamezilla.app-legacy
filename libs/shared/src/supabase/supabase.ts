import {
  createClient,
  Session as SupabaseSession,
} from '@supabase/supabase-js';

const supabaseUrl = 'https://ldxpcprlgecjvqwzuxgv.supabase.co';

const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNzA0MDQ5NywiZXhwIjoxOTUyNjE2NDk3fQ.ReI8CpIFbLB9Q53Az7CDBIyrn_o1JeGhPoZXdqx8Ac4';

export type Session = SupabaseSession;

export const client = createClient(supabaseUrl, supabaseAnonKey);
