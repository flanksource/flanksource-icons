import { readFileSync } from "node:fs";

const j = JSON.parse(
  readFileSync(
    "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/hack/icon-selections.json",
    "utf8",
  ),
);

const rows = j.rows;
console.log(`File: ${j.savedAt}`);
console.log(`Total rows: ${rows.length}`);
console.log(`Both picked: ${rows.filter((r) => r.outline && r.filled).length}`);
console.log(`Outline only: ${rows.filter((r) => r.outline && !r.filled).length}`);
console.log(`Filled only: ${rows.filter((r) => !r.outline && r.filled).length}`);
console.log(`Neither: ${rows.filter((r) => !r.outline && !r.filled).length}`);
console.log(`With notes: ${rows.filter((r) => r.note && r.note.trim()).length}`);

console.log(`\n=== Rows with NO outline pick (need outline) ===`);
const noOutline = rows.filter((r) => !r.outline);
for (const r of noOutline) {
  console.log(`  [${r.group}]  ${r.consumerName}  filled=${r.filled ?? "—"}${r.note ? "  NOTE: " + r.note : ""}`);
}

console.log(`\n=== Rows with NO filled pick (need filled) ===`);
const noFilled = rows.filter((r) => !r.filled);
for (const r of noFilled) {
  console.log(`  [${r.group}]  ${r.consumerName}  outline=${r.outline ?? "—"}${r.note ? "  NOTE: " + r.note : ""}`);
}

console.log(`\n=== Rows with notes (regardless of pick state) ===`);
const noted = rows.filter((r) => r.note && r.note.trim());
for (const r of noted) {
  console.log(`  [${r.group}]  ${r.consumerName}`);
  console.log(`    outline: ${r.outline ?? "—"}`);
  console.log(`    filled : ${r.filled ?? "—"}`);
  console.log(`    NOTE   : ${r.note}`);
  console.log();
}
