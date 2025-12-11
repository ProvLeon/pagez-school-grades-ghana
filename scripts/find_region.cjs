
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=postgres:\/\/([^:]+):([^@]+)@/);

if (!match) process.exit(1);

const user = match[1];
const password = match[2];

const regions = [
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-0-eu-west-1.pooler.supabase.com',
    'aws-0-eu-west-2.pooler.supabase.com',
    'aws-0-us-west-1.pooler.supabase.com',
    'aws-0-ap-southeast-1.pooler.supabase.com',
    'aws-0-sa-east-1.pooler.supabase.com'
];

console.log(`Checking regions for user ${user}...`);

for (const region of regions) {
    const url = `postgres://${user}:${password}@${region}:6543/postgres`;
    try {
        execSync(`psql "${url}" -c "SELECT 1"`, { stdio: 'ignore', timeout: 5000 });
        console.log(`SUCCESS: Region found: ${region}`);
        
        // Update .env
        const newEnv = envContent.replace(/@aws-0-[a-z0-9-]+\.pooler\.supabase\.com/, `@${region}`);
        fs.writeFileSync(envPath, newEnv);
        console.log("Updated .env with correct region.");
        process.exit(0);
    } catch (e) {
        // console.log(`Failed: ${region}`);
    }
}

console.log("Could not find correct region in common list.");
