/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Access environment variables using import.meta.env for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btzdjzdeckswxfvzhsvh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0emRqemRlY2tzd3hmdnpoc3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODU2NzQsImV4cCI6MjA5MjE2MTY3NH0.L6hahzthRhiTbBtsoilAFD8p1Nz8Mn2F1rBLjjJxrNU';


if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
