import postgres from 'postgres';

const pass = 'bPjWOoS37L9HjCvB';
const ref  = 'oazybcxrzxpvpavporrm';

// Try the IPv6 DB direct but with family:4 override via explicit IP lookup
// Also try pooler with different username formats
const attempts = [
  // IPv6 direct (may not have IPv6 route)
  {
    label: 'direct-ipv6',
    url: `postgresql://postgres:${pass}@db.${ref}.supabase.co:5432/postgres`,
    opts: { ssl: 'require', max: 1, connect_timeout: 8 },
  },
  // Pooler session mode with postgres.ref user (standard Supabase IPv4 pooler)
  ...['us-east-1','us-east-2','us-west-2','eu-central-1','eu-west-2','ap-southeast-1','ap-south-1','sa-east-1'].map(r => ({
    label: `pooler-session-${r}`,
    url: `postgresql://postgres.${ref}:${pass}@aws-0-${r}.pooler.supabase.com:5432/postgres`,
    opts: { ssl: 'require', max: 1, connect_timeout: 6 },
  })),
  // Pooler with plain postgres user (legacy format)
  ...['us-east-1','us-east-2','eu-central-1'].map(r => ({
    label: `pooler-plain-${r}`,
    url: `postgresql://postgres:${pass}@aws-0-${r}.pooler.supabase.com:5432/postgres`,
    opts: { ssl: 'require', max: 1, connect_timeout: 6 },
  })),
];

for (const { label, url, opts } of attempts) {
  const db = postgres(url, opts);
  try {
    const res = await db`SELECT current_database() AS db, version() AS ver`;
    console.log(`\nCONNECTED [${label}]`);
    console.log('DB:', res[0].db);
    console.log('Ver:', res[0].ver.split(' ').slice(0,2).join(' '));
    await db.end();
    process.exit(0);
  } catch (e) {
    const msg = e.message.split('\n')[0];
    console.log(`FAIL [${label}]: ${msg}`);
    await db.end().catch(() => {});
  }
}

console.log('\nAll connection attempts failed.');
process.exit(1);
