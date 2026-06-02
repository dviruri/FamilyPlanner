import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ---------------------------------------------------------------------------
// Guard: fail fast with a readable message if env vars are missing.
// This prevents cryptic network errors later.
// ---------------------------------------------------------------------------
if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.error(
    '[FamilyPlanner] VITE_SUPABASE_URL is missing or not configured.\n' +
    'Copy .env.example → .env.local and fill in your Supabase project URL.'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.error(
    '[FamilyPlanner] VITE_SUPABASE_ANON_KEY is missing or not configured.\n' +
    'Copy .env.example → .env.local and fill in your Supabase anon key.'
  );
}

// We still create the client so the rest of the app imports resolve cleanly.
// Calls will fail gracefully until real credentials are provided.
export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key'
);
