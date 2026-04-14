import postgres from 'postgres';

// ── Configuração via variável de ambiente ───────────────────────────────────
//
//   DATABASE_URL=postgresql://user:password@host:5432/postgres
//
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Erro: DATABASE_URL não definida.');
  console.error('');
  console.error('Defina a variável antes de executar:');
  console.error('  DATABASE_URL=postgresql://user:password@host:5432/postgres node scripts/test-win.mjs');
  process.exit(1);
}

const db = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
  connect_timeout: 15,
});

try {
  const res = await db`SELECT current_database() AS db, version() AS ver`;
  console.log('CONNECTED:', res[0].db);
  console.log('Version:', res[0].ver.split(' ').slice(0, 2).join(' '));

  const tables = await db`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log('\nTables in public schema:');
  tables.forEach(t => console.log(' -', t.table_name));

  await db.end();
  process.exit(0);
} catch (e) {
  console.error('FAIL:', e.message);
  await db.end().catch(() => {});
  process.exit(1);
}
