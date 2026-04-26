import { readFileSync } from "node:fs";

const sel = JSON.parse(
  readFileSync(
    "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/hack/icon-selections.json",
    "utf8",
  ),
);
const src = readFileSync(
  "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/hack/build-comparison.ts",
  "utf8",
);

// Index every row from build-comparison source by consumerName + group.
const rowGroup = new Map();
for (const m of src.matchAll(
  /consumerName:\s*"([^"]+)"[\s\S]*?group:\s*"([^"]+)"/g,
)) rowGroup.set(m[1], m[2]);

// Index existing JB mappings.
const mapMatch = src.match(/JB_EXPUI_BY_UIR[\s\S]*?\n\};/);
const haveJb = new Set();
for (const m of mapMatch[0].matchAll(/"([^"]+)":/g)) haveJb.add(m[1]);

const sels = new Map(sel.rows.map((r) => [r.consumerName, r]));

// Anything in build-comparison that's missing JB across non-UIR groups too?
const groups = {};
for (const [name, g] of rowGroup.entries()) {
  if (!groups[g]) groups[g] = [];
  groups[g].push(name);
}

console.log("=== Coverage by group ===");
for (const g of Object.keys(groups).sort()) {
  const rows = groups[g];
  const withJb = rows.filter((n) => haveJb.has(n)).length;
  console.log(`  ${g.padEnd(28)} ${withJb}/${rows.length}  jb`);
}

console.log("\n=== Rows you haven't picked (filled or outline missing) and have no JB alt ===");
const stillUnpicked = [];
for (const r of sel.rows) {
  if (haveJb.has(r.consumerName)) continue;
  if (!r.outline || !r.filled) {
    stillUnpicked.push(r);
  }
}
console.log(`Count: ${stillUnpicked.length}`);
for (const r of stillUnpicked.slice(0, 60))
  console.log(`  [${r.group}]  ${r.consumerName}  outline=${r.outline ?? "—"} filled=${r.filled ?? "—"}`);
