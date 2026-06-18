import { Pool } from "pg";

export function createPgPool(connectionString?: string) {
  const raw = connectionString ?? process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(raw);
  const isSupabase = url.hostname.includes("supabase.com");
  // Let Pool ssl config handle TLS; avoid verify-full from sslmode=require in URL.
  url.searchParams.delete("sslmode");

  return new Pool({
    connectionString: url.toString(),
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  });
}