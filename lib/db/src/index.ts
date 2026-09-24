import fs from "node:fs";
import { resolve } from "node:path";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let _pool: pg.Pool | null = null;
let _db: NodePgDatabase<typeof schema> | null = null;

export function getDb(): NodePgDatabase<typeof schema> {
  if (_db) return _db;

  if (!process.env.DATABASE_URL) {
    try {
      const candidatePaths = [
        resolve(process.cwd(), ".env"),
        resolve(process.cwd(), "artifacts/api-server/.env"),
        resolve(process.cwd(), "../api-server/.env"),
      ];
      for (const envPath of candidatePaths) {
        if (fs.existsSync(envPath)) {
          const envFile = fs.readFileSync(envPath, "utf-8");
          for (const line of envFile.split("\n")) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
              const [key, ...valParts] = trimmed.split("=");
              const val = valParts.join("=").trim();
              if (key && val && !process.env[key.trim()]) {
                process.env[key.trim()] = val;
              }
            }
          }
          if (process.env.DATABASE_URL) break;
        }
      }
    } catch {}
  }

  const connString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Database features requiring Drizzle will fall back gracefully.");
  }

  _pool = new Pool({ connectionString: connString });
  _db = drizzle(_pool, { schema });
  return _db;
}

export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop) {
    getDb();
    return (_pool as any)[prop];
  },
});

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export * from "./schema";
