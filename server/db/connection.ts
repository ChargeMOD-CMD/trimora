import { neon, Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const getConnectionString = (unpooled = false): string => {
  if (unpooled && process.env.DATABASE_URL_UNPOOLED) {
    return process.env.DATABASE_URL_UNPOOLED;
  }
  return process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || '';
};

export const isDbConfigured = (): boolean => {
  const conn = getConnectionString();
  return (
    Boolean(conn) &&
    !conn.includes('your-neon-project') &&
    (conn.startsWith('postgres://') || conn.startsWith('postgresql://'))
  );
};

export const getDb = (options: { direct?: boolean } = {}) => {
  if (!isDbConfigured()) {
    throw new Error(
      'DATABASE_URL is not configured. Please add your valid Neon Postgres connection string to the .env file.'
    );
  }
  const conn = getConnectionString(options.direct);
  return neon(conn);
};

export const getPool = (options: { direct?: boolean } = {}) => {
  const conn = getConnectionString(options.direct);
  return new Pool({ connectionString: conn });
};

/**
 * Execute parameterized query using Neon HTTP client
 */
export async function query<T = any>(sqlText: string, params: any[] = []): Promise<T[]> {
  const sql = getDb();
  if (params && params.length > 0) {
    const rows = await sql.query(sqlText, params);
    return rows as T[];
  }
  const rows = await sql.query(sqlText);
  return rows as T[];
}

/**
 * Test the database connection and return version/status info
 */
export async function testConnection(direct = false): Promise<{ ok: boolean; message: string; version?: string; direct?: boolean }> {
  if (!isDbConfigured()) {
    return {
      ok: false,
      message: 'DATABASE_URL is missing or using placeholder in .env',
    };
  }

  try {
    const sql = getDb({ direct });
    const result = await sql`SELECT version(), current_database() as db_name, now() as current_time;`;
    return {
      ok: true,
      message: 'Connected to Neon Postgres successfully',
      version: result[0]?.version,
      direct,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.message || 'Failed to connect to Neon Postgres',
      direct,
    };
  }
}
