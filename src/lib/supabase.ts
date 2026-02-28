// SoleMate AI - Supabase Client
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tmonaqkpejtfmqepukpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NfhPgCr9Robt_2OVnNbT8g_Y9sx0ZTA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
