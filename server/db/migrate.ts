import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection, getDb, getPool } from './connection';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('----------------------------------------------------');
  console.log('🚀 Trimora Database Migration — Neon PostgreSQL');
  console.log('----------------------------------------------------');

  const connectionCheck = await testConnection(true);
  if (!connectionCheck.ok) {
    console.error('❌ Connection Failed:', connectionCheck.message);
    console.error('\nPlease ensure your DATABASE_URL or DATABASE_URL_UNPOOLED in .env is correct and starts with postgresql://');
    process.exit(1);
  }

  console.log('✅ Connected to Neon database successfully (direct connection for migrations)!');
  if (connectionCheck.version) {
    console.log(`ℹ️ PostgreSQL Version: ${connectionCheck.version.split(' ')[0]} ${connectionCheck.version.split(' ')[1]}`);
  }

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('⏳ Applying schema migrations...');
  const pool = getPool({ direct: true });
  const sql = getDb({ direct: true });

  try {
    // Execute DDL script
    await pool.query(schemaSql);
    await pool.end();
    console.log('✅ Schema created successfully!');

    // Verify created tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('\n📊 Created Tables:');
    tables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    console.log('\n✨ Database migration completed successfully.');
  } catch (error: any) {
    await pool.end().catch(() => {});
    console.error('❌ Migration failed with error:', error.message);
    process.exit(1);
  }
}

runMigration();
