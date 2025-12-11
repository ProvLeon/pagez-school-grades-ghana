import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        let value = match[2].trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'" ) && value.endsWith("'" )) {
          value = value.slice(1, -1);
        }
        env[match[1].trim()] = value;
      }
    });
    return env;
  } catch (error) {
    console.error('Error loading .env file:', error.message);
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

console.log('Testing Supabase connection...');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  try {
    // Try to fetch a public table or just checking health/session
    // We'll try to fetch 1 row from 'departments' since it's usually public/readable
    const { data, error } = await supabase.from('departments').select('count').limit(1).maybeSingle();

    if (error) {
      console.error('Connection failed:', error.message);
      if (error.code === 'PGRST301') {
        console.log('Hint: RLS policies might be blocking access, but connection was established.');
      }
    } else {
      console.log('Connection successful! Database is accessible.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkConnection();
