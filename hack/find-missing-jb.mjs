import { readFileSync } from "node:fs";

const src = readFileSync(
  "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/hack/build-comparison.ts",
  "utf8",
);

const mapMatch = src.match(/JB_EXPUI_BY_UIR[\s\S]*?\n\};/);
const haveJb = new Set();
for (const m of mapMatch[0].matchAll(/"(uir-[^"]+)":/g)) haveJb.add(m[1]);

const allUir = [];
for (const m of src.matchAll(
  /consumerName:\s*"(uir-[^"]+)"[\s\S]*?group:\s*"(uir-(?:ast-code|sql))"/g,
)) {
  allUir.push({ name: m[1], group: m[2] });
}

console.log("Total UIR rows:", allUir.length);
console.log("With JB alternate:", allUir.length - allUir.filter((r) => !haveJb.has(r.name)).length);

const missing = allUir.filter((r) => !haveJb.has(r.name));
console.log("Without JB alternate:", missing.length);
for (const r of missing) console.log("  " + r.name + "  [" + r.group + "]");
