import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";

const [jsonPath] = process.argv.slice(2);

if (!jsonPath) {
  console.error("Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-localstorage-to-supabase.mjs export.json");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Use the service key only in local scripts, never in the frontend.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const legacyItems = JSON.parse(await fs.readFile(jsonPath, "utf8"));

const rows = legacyItems.map((item) => ({
  title: item.title,
  year: item.year || null,
  duration: item.duration || null,
  subject: item.subject || null,
  category: item.category || null,
  language: item.language || null,
  source: item.source || "Other",
  url: item.url || null,
  thumbnail_url: item.thumbnailUrl || null,
  variants: item.variants || [],
  tags: item.tags || [],
  pinned: Boolean(item.pinned),
  starred: Boolean(item.starred),
  programme_support: item.programmeSupport || null,
  notes: item.notes || null
}));

const { error } = await supabase.from("media").insert(rows);
if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`Migrated ${rows.length} records.`);
