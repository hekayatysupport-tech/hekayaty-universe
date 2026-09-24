import fs from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

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

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
