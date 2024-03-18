
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xwxifpmgumonfuehccsw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3eGlmcG1ndW1vbmZ1ZWhjY3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgzNzk3ODMsImV4cCI6MjAyMzk1NTc4M30.byexu2vHdV1c7pcKdvEysHUB5YPWir4AZiOhizgW6-4";

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;