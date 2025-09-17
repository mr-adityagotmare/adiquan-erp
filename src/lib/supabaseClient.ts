import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kmdkrrbkamjhswmvudrz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZGtycmJrYW1qaHN3bXZ1ZHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTg5MjgsImV4cCI6MjA3MzU5NDkyOH0.ahR9Rt3EWIz3ML2GYVKJENNqG3rvkqxJlMw7aT2NFOk";

export const supabase = createClient(supabaseUrl, supabaseKey);
