import postgres from 'postgres';

// ── Configuração via variáveis de ambiente ──────────────────────────────────
//
// Modo A (preferido): defina DATABASE_URL completa.
//   DATABASE_URL=postgresql://user:password@host:5432/postgres
//
// Modo B (Supabase): defina as duas variáveis abaixo.
//   SUPABASE_DB_PASSWORD=<sua senha>
//   SUPABASE_PROJECT_REF=<seu project ref>
// ---------------------------------------------------------------------------

const DATABASE_URL     = process.env.DATABASE_URL;
const SUPABASE_PASS    = process.env.SUPABASE_DB_PASSWORD;
const SUPABASE_REF     = process.env.SUPABASE_PROJECT_REF;

// Validação antecipada — falha com mensagem legível antes de tentar conectar.
if (!DATABASE_URL && (!SUPABASE_PASS || !SUPABASE_REF)) {
  console.error('Erro: nenhuma configuração de banco encontrada.');
  console.error('');
  console.error('Defina uma das opções abaixo:');
  console.error('  Opção A — DATABASE_URL=postgresql://user:password@host:5432/postgres');
  console.error('  Opção B — SUPABASE_DB_PASSWORD=<senha> + SUPABASE_PROJECT_REF=<ref>');
  process.exit(1);
}

// ── Monta lista de tentativas ───────────────────────────────────────────────

let attempts;

if (DATABASE_URL) {
  // Modo A: única tentativa com a URL fornecida.
  attempts = [
    {
      label: 'DATABASE_URL',
      url: DATABASE_URL,
      opts: { ssl: 'require', max: 1, connect_timeout: 15 },
    },
  ];
} else {
  // Modo B: tenta direct + pooler nos principais datacenters Supabase.
  const ref  = SUPABASE_REF;
  const pass = SUPABASE_PASS;

  attempts = [
    // Conexão direta (IPv6 / IPv4 dependendo da rota disponível)
    {
      label: 'direct',
      url: `postgresql://postgres:${pass}@db.${ref}.supabase.co:5432/postgres`,
      opts: { ssl: 'require', max: 1, connect_timeout: 8 },
    },
    // Pooler modo session — formato postgres.<ref> (Supabase IPv4 pooler)
    ...['us-east-1','us-east-2','us-west-2','eu-central-1','eu-west-2','ap-southeast-1','ap-south-1','sa-east-1'].map(r => ({
      label: `pooler-session-${r}`,
      url: `postgresql://postgres.${ref}:${pass}@aws-0-${r}.pooler.supabase.com:5432/postgres`,
      opts: { ssl: 'require', max: 1, connect_timeout: 6 },
    })),
    // Pooler — formato legado com usuário plain postgres
    ...['us-east-1','us-east-2','eu-central-1'].map(r => ({
      label: `pooler-plain-${r}`,
      url: `postgresql://postgres:${pass}@aws-0-${r}.pooler.supabase.com:5432/postgres`,
      opts: { ssl: 'require', max: 1, connect_timeout: 6 },
    })),
  ];
}

// ── Executa tentativas em sequência ────────────────────────────────────────

for (const { label, url, opts } of attempts) {
  const db = postgres(url, opts);
  try {
    const res = await db`SELECT current_database() AS db, version() AS ver`;
    console.log(`\nCONNECTED [${label}]`);
    console.log('DB:', res[0].db);
    console.log('Ver:', res[0].ver.split(' ').slice(0, 2).join(' '));
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
