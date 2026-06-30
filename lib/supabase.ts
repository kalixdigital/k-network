import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.https://dwwyshjookspceocsxzi.supabase.co;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3d3lzaGpvb2tzcGNlb2NzeHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTMwODgsImV4cCI6MjA5Nzc4OTA4OH0.H2jaHYlxWccLHZpyn3huKltTsuEb_c__YkKfT89YQ0g;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
