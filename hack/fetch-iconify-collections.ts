/**
 * Fetches the icon-name lists for the iconify collections that ResourceIcon
 * is allowed to fall back to, and writes them to ../iconifyAllowlist.ts.
 *
 * Run via:  npm run gen:iconify
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const COLLECTIONS = ["logos", "devicon"] as const;
type Collection = (typeof COLLECTIONS)[number];

interface CollectionResponse {
  prefix: string;
  total: number;
  uncategorized?: string[];
  categories?: Record<string, string[]>;
}

async function fetchCollection(prefix: Collection): Promise<string[]> {
  const url = `https://api.iconify.design/collection?prefix=${prefix}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as CollectionResponse;
  const names = new Set<string>(data.uncategorized ?? []);
  for (const list of Object.values(data.categories ?? {})) {
    for (const n of list) names.add(n);
  }
  if (names.size === 0) throw new Error(`empty icon list for ${prefix}`);
  return [...names].sort();
}

function emit(name: string, items: string[]): string {
  const literals = items.map((s) => `  "${s}"`).join(",\n");
  return `export const ${name}: ReadonlySet<string> = new Set([\n${literals}\n]);\n`;
}

async function main() {
  const blocks: string[] = [];
  for (const prefix of COLLECTIONS) {
    const names = await fetchCollection(prefix);
    const varName = `iconify${prefix[0].toUpperCase()}${prefix.slice(1)}`;
    blocks.push(`// ${prefix}: ${names.length} icons\n${emit(varName, names)}`);
    console.error(`fetched ${prefix}: ${names.length} icons`);
  }
  const header = `// GENERATED — do not edit. Run \`npm run gen:iconify\` to refresh.\n// Source: https://api.iconify.design/collection?prefix=<name>\n\n`;
  const output = header + blocks.join("\n");
  const outPath = resolve(__dirname, "..", "iconifyAllowlist.ts");
  writeFileSync(outPath, output);
  console.error(`wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
