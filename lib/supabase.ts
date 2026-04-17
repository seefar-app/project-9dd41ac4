import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cykqbnklirkqgnxpelor.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5a3FibmtsaXJrcWdueHBlbG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NDMzOTUsImV4cCI6MjA5MjAxOTM5NX0.IZ1hyaqrBN0-aEddWJoWXzWOYcdRw63PPrLsQ8q-aX4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
