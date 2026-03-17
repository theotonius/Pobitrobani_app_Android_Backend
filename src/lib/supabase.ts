import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Use placeholder values if missing to prevent "supabaseUrl is required" error during initialization
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const effectiveUrl = supabaseUrl || 'https://placeholder-project.supabase.co';
const effectiveKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(effectiveUrl, effectiveKey);
