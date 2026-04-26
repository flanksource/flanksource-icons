import { readFileSync } from "node:fs";

const j = JSON.parse(
  readFileSync(
    "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/hack/icon-selections.json",
    "utf8",
  ),
);

const picks = new Map(); // spec -> [consumerName, slot] entries
for (const r of j.rows) {
  for (const slot of ["outline", "filled"]) {
    const v = r[slot];
    if (!v) continue;
    if (!v.startsWith("tabler:") && !v.startsWith("mdi:") && !v.startsWith("lucide:") && !v.startsWith("carbon:") && !v.startsWith("material-symbols:")) continue;
    if (!picks.has(v)) picks.set(v, []);
    picks.get(v).push(`${r.consumerName} [${slot}]`);
  }
}

const sorted = [...picks.entries()].sort((a, b) => a[0].localeCompare(b[0]));
console.log(`tabler/mdi/lucide/carbon picks: ${sorted.length} distinct specs across ${[...picks.values()].flat().length} slot uses`);
for (const [spec, uses] of sorted) {
  console.log(`  ${spec}`);
  for (const u of uses) console.log(`     ${u}`);
}
