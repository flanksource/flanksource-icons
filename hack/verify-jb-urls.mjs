import { readFileSync } from "node:fs";

const src = readFileSync(
  "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/hack/build-comparison.ts",
  "utf8",
);

const refs = new Set();
for (const m of src.matchAll(/jb-expui-([a-zA-Z]+):([\w-]+)/g)) {
  refs.add(`${m[1]}/${m[2]}`);
}
console.log(`Probing ${refs.size} JB-expui references…`);

const failures = [];
let i = 0;
const total = refs.size;
for (const r of refs) {
  i++;
  const url = `https://raw.githubusercontent.com/JetBrains/intellij-community/master/platform/icons/src/expui/${r}.svg`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) {
      console.log(`MISS ${i}/${total}  ${r}  (${res.status})`);
      failures.push(r);
    } else {
      // process.stdout.write(`OK   ${i}/${total}  ${r}\n`);
    }
  } catch (err) {
    console.log(`ERR  ${i}/${total}  ${r}  ${err.message}`);
    failures.push(r);
  }
}
console.log(`\n${total - failures.length}/${total} resolved.`);
if (failures.length) {
  console.log("Failures:");
  for (const f of failures) console.log("  " + f);
}
