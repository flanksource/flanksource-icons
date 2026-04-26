import { readFileSync } from "node:fs";

const j = JSON.parse(
  readFileSync(
    "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/hack/icon-selections.json",
    "utf8",
  ),
);
const rows = j.rows;

console.log("total rows         :", rows.length);
console.log("aliases            :", rows.filter((r) => r.status === "ALIAS").length);
console.log("non-alias          :", rows.filter((r) => r.status !== "ALIAS").length);
console.log("both picked        :", rows.filter((r) => r.outline && r.filled).length);
console.log("only outline       :", rows.filter((r) => r.outline && !r.filled).length);
console.log("only filled        :", rows.filter((r) => !r.outline && r.filled).length);
console.log("neither            :", rows.filter((r) => !r.outline && !r.filled).length);
console.log("incumbent picks    :", rows.filter((r) => r.outline === "incumbent" || r.filled === "incumbent").length);

const srcs = new Map();
for (const r of rows) {
  for (const slot of [r.outline, r.filled]) {
    if (!slot) continue;
    if (slot === "incumbent" || slot === "skip" || slot === "maintain") {
      srcs.set(slot, (srcs.get(slot) ?? 0) + 1);
      continue;
    }
    const prefix = slot.split(":")[0];
    srcs.set(prefix, (srcs.get(prefix) ?? 0) + 1);
  }
}
console.log("\nsource prefix breakdown:");
for (const [k, v] of [...srcs.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(28)}  ${v}`);
}
