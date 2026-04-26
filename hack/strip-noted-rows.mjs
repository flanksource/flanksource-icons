import { readFileSync, writeFileSync } from "node:fs";

const path = "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/hack/icon-selections.json";
const noted = new Set([
  "uir-import",
  "uir-constructor",
  "uir-async-fn",
  "uir-field",
  "uir-property",
  "uir-constant",
  "uir-parameter",
  "uir-boolean",
  "uir-object",
  "uir-null",
  "uir-sql-primary-key",
  "uir-sql-foreign-key",
  "uir-sql-constraint",
  "uir-sql-sequence",
  "uir-sql-array",
]);

const j = JSON.parse(readFileSync(path, "utf8"));
const before = j.rows.length;
j.rows = j.rows.filter((r) => !noted.has(r.consumerName));
const after = j.rows.length;
j.bothChosen = j.rows.filter((r) => r.outline && r.filled).length;
j.anyChosen = j.rows.filter((r) => r.outline || r.filled).length;
writeFileSync(path, JSON.stringify(j, null, 2) + "\n");
console.log(`Removed ${before - after} noted rows. ${after} rows remain. bothChosen=${j.bothChosen} anyChosen=${j.anyChosen}`);
