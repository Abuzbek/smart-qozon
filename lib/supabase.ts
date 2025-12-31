import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';
import 'react-native-url-polyfill/auto';

// Initialize MMKV
export const storage = new MMKV();

// ⬇️ ADD THIS: Define the SSR-safe storage adapter
export const mmkvAdapter = {
  getItem: (key: string) => {
    // If we are on the server (EAS build/Next.js), return null immediately
    if (typeof window === 'undefined') return null;
    
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  setItem: (key: string, value: string) => {
    // If we are on the server, do nothing
    if (typeof window === 'undefined') return;
    
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    // If we are on the server, do nothing
    if (typeof window === 'undefined') return;
    
    storage.delete(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvAdapter, // ⬅️ USE THE SAFE ADAPTER HERE
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});