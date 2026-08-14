import { createClient } from '@supabase/supabase-js';
import { readFileSync, unlinkSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf-8');
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function fix() {
  console.log('Testing connection...');
  // Check if we can execute RPC or direct query
  const { data: testAnon, error: errAnon } = await supabaseAnon.from('products').select('*');
  console.log('Current Anon SELECT test:', { data: testAnon, error: errAnon });
}

fix().finally(() => {
  try { unlinkSync('fix-rls.mjs'); } catch (_) {}
});
