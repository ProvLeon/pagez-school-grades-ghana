
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seed } from './seed.js'; // Import the seed function
import pg from 'pg'; // Import pg client

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Load .env manually
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found!');
  process.exit(1);
}

const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
  const cleanLine = line.split('#')[0].trim();
  if (!cleanLine) return;

  const [key, ...valueParts] = cleanLine.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim();
    env[key.trim()] = value.replace(/^["']|["']$/g, '');
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;
const DATABASE_URL = env.DATABASE_URL; // Get DATABASE_URL

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  console.error('Missing SUPABASE_SERVICE_KEY or DATABASE_URL in .env. Both are required for this script.');
  process.exit(1);
}

// Supabase client (used by seed() function)
// No longer needed here as seed() internally creates its own client based on env.

async function resetDb() {
  console.log('Connecting to PostgreSQL database directly...');
  const pgClient = new pg.Client({
    connectionString: DATABASE_URL,
  });

  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL database directly.');

    // 2. Get list of tables in public schema using pgClient
    console.log('Fetching table names directly from information_schema...');
    const { rows: tables } = await pgClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'pg_%'
        AND table_name NOT LIKE 'sql_%'
        AND table_name NOT IN ('supabase_migrations', 'departments') -- Exclude system/critical tables
    `);

    const tableNames = tables.map(t => t.table_name);

    // 3. Truncate tables with CASCADE using pgClient
    if (tableNames.length > 0) {
      console.log(`Truncating ${tableNames.length} tables with CASCADE...`);
      const truncateQuery = `TRUNCATE TABLE ${tableNames.map(name => `public."${name}"`).join(', ')} RESTART IDENTITY CASCADE;`;
      console.log(`Executing: ${truncateQuery}`);
      await pgClient.query(truncateQuery);
      console.log('All user-defined public data tables truncated successfully.');
    } else {
      console.log('No user-defined public tables found to truncate.');
    }

    // 3.5. Fix RLS policies to allow anonymous read access
    console.log('Updating RLS policies to allow anonymous access...');
    const readTables = ['departments', 'classes', 'subjects', 'teachers', 'students', 'results', 'subject_marks'];
    for (const table of readTables) {
      await pgClient.query(`DROP POLICY IF EXISTS "Allow read access to all users" ON public.${table}`);
      await pgClient.query(`DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.${table}`);
      await pgClient.query(`CREATE POLICY "Allow read access to all users" ON public.${table} FOR SELECT USING (true)`);
    }
    console.log('RLS policies updated successfully.');

    // 4. Repopulate database
    console.log('Repopulating database with seed data...');
    // Pass the admin client to seed, or ensure seed() uses a robust client.
    // seed() internally creates its own client based on env, so no need to pass.
    await seed();
    console.log('Database reset and repopulated successfully!');

  } catch (err) {
    console.error('Database Reset Failed:', err);
    process.exit(1);
  } finally {
    await pgClient.end();
    console.log('Disconnected from PostgreSQL database.');
  }
}

resetDb();
