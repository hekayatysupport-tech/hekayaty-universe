import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import https from "https";

dotenv.config({ path: path.resolve(process.cwd(), "artifacts/api-server/.env") });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = url.replace("https://", "").split(".")[0]; // ufbaokhbfntlkvyzgses

// Run SQL ALTER via Supabase Management REST API
// Use the /pg endpoint for direct SQL  
const sqlStatements = [
  "ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS item_id TEXT;",
  "ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'novel';",
];

async function runSql(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request(
      {
        hostname: "api.supabase.com",
        path: `/v1/projects/${projectRef}/database/query`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "Authorization": `Bearer ${key}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  for (const sql of sqlStatements) {
    console.log("Running:", sql);
    const result = await runSql(sql);
    console.log("Result:", result.status, result.body);
  }
}

main().catch(console.error);
