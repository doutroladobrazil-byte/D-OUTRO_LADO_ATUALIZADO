import postgres from 'postgres';

const db = postgres('postgresql://postgres:bPjWOoS37L9HjCvB@db.oazybcxrzxpvpavporrm.supabase.co:5432/postgres', {
  ssl: 'require',
  max: 1,
  connect_timeout: 15,
});

try {
  const res = await db`SELECT current_database() AS db, version() AS ver`;
  console.log('CONNECTED:', res[0].db);
  console.log('Version:', res[0].ver.split(' ').slice(0,2).join(' '));

  const tables = await db`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log('\nTables in public schema:');
  tables.forEach(t => console.log(' -', t.table_name));
  await db.end();
  process.exit(0);
} catch(e) {
  console.error('FAIL:', e.message);
  await db.end().catch(()=>{});
  process.exit(1);
}
