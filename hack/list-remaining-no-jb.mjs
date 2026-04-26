import { readFileSync } from "node:fs";

const src = readFileSync(
  "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/hack/build-comparison.ts",
  "utf8",
);
const mapMatch = src.match(/JB_EXPUI_BY_UIR[\s\S]*?\n\};/);
const haveJb = new Set();
for (const m of mapMatch[0].matchAll(/^\s*"([^"]+)":/gm)) haveJb.add(m[1]);

const rows = [];
for (const m of src.matchAll(/consumerName:\s*"([^"]+)"[\s\S]*?group:\s*"([^"]+)"/g)) {
  rows.push({ name: m[1], group: m[2] });
}
const missing = rows.filter((r) => !haveJb.has(r.name));
console.log("Total: " + rows.length + "  with JB: " + (rows.length - missing.length) + "  without: " + missing.length);
const byGroup = {};
for (const r of missing) {
  if (!byGroup[r.group]) byGroup[r.group] = [];
  byGroup[r.group].push(r.name);
}
for (const g of Object.keys(byGroup).sort()) {
  console.log(`\n[${g}]`);
  for (const n of byGroup[g]) console.log("  " + n);
}
