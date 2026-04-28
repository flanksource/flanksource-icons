import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import * as M from "../dist/index.mjs";

console.log("=== Database new sub-icons (info/warning/error) ===");
for (const name of ["UiDatabaseInfo", "UiDatabaseWarning", "UiDatabaseError",
                    "UiDatabaseInfoFilled", "UiDatabaseWarningFilled", "UiDatabaseErrorFilled"]) {
  const C = M[name];
  if (!C) { console.log(`  ${name.padEnd(28)} ✗ MISSING`); continue; }
  const html = renderToStaticMarkup(createElement(C, { size: 24 }));
  console.log(`  ${name.padEnd(28)} ${html.length} bytes  marker=${html.includes("<g transform=") ? "✓" : "✗"}`);
}

console.log("\n=== Database Filled composites (3-spindle base) ===");
for (const name of ["UiDatabaseFilled", "UiDatabasePlusFilled", "UiDatabaseCheckFilled",
                    "UiDatabaseTrashFilled", "UiDatabasePendingFilled", "UiDatabaseErrorFilled"]) {
  const C = M[name];
  if (!C) { console.log(`  ${name.padEnd(28)} ✗ MISSING`); continue; }
  const html = renderToStaticMarkup(createElement(C, { size: 24 }));
  // ph:database-fill should produce stacked discs — check for >= 3 path/ellipse-like shapes.
  console.log(`  ${name.padEnd(28)} ${html.length} bytes`);
}

console.log("\n=== change-backup-* aliases — should equal UiDatabase<x> ===");
for (const [alias, target] of [
  ["UiChangeBackupStarted", "UiDatabasePlus"],
  ["UiChangeBackupCompleted", "UiDatabaseCheck"],
  ["UiChangeBackupRestored", "UiDatabasePending"],
  ["UiChangeBackupFailed", "UiDatabaseError"],
  ["UiChangeBackupDeleted", "UiDatabaseTrash"],
]) {
  const A = M[alias], T = M[target];
  const Af = M[alias + "Filled"], Tf = M[target + "Filled"];
  if (!A || !T) { console.log(`  ${alias} → ${target}: missing alias=${!A} target=${!T}`); continue; }
  const aHtml = renderToStaticMarkup(createElement(A, { size: 24 }));
  const tHtml = renderToStaticMarkup(createElement(T, { size: 24 }));
  const same = aHtml === tHtml;
  let filledOk = "n/a";
  if (Af && Tf) {
    const afHtml = renderToStaticMarkup(createElement(Af, { size: 24 }));
    const tfHtml = renderToStaticMarkup(createElement(Tf, { size: 24 }));
    filledOk = afHtml === tfHtml ? "✓" : "✗";
  }
  console.log(`  ${alias.padEnd(24)} → ${target.padEnd(20)}  outline=${same ? "✓" : "✗"}  filled=${filledOk}`);
}

console.log("\n=== UiCheck filled — should be ph:check-circle-fill (circle), not square ===");
const ckFilled = M.UiCheckFilled;
if (ckFilled) {
  const html = renderToStaticMarkup(createElement(ckFilled, { size: 24 }));
  // ph:check-circle-fill source should mention "M128" (Phosphor circle paths) and have viewBox 0 0 256 256
  console.log(`  __source: ${ckFilled.__source}`);
  console.log(`  ${html.slice(0, 200)}...`);
} else {
  console.log("  ✗ UiCheckFilled missing");
}

console.log("\n=== UsersThree filled sub-icon variants ===");
for (const name of ["UiUsersThree", "UiUsersThreeFilled",
                    "UiUsersThreePlus", "UiUsersThreePlusFilled",
                    "UiUsersThreeMinus", "UiUsersThreeMinusFilled",
                    "UiUsersThreeCheck", "UiUsersThreeCheckFilled",
                    "UiUsersThreeCross", "UiUsersThreeCrossFilled"]) {
  const C = M[name];
  if (!C) { console.log(`  ${name.padEnd(28)} ✗ MISSING`); continue; }
  const html = renderToStaticMarkup(createElement(C, { size: 24 }));
  const hasMarker = html.includes("<g transform=");
  console.log(`  ${name.padEnd(28)} ${html.length} bytes  marker=${hasMarker ? "✓" : "—"}`);
}
