import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import {
  getChangeIcon,
  changeIconAliases,
  UiShieldCheck,
  UiShieldWarning,
  UiShieldInfo,
  UiShieldCheckFilled,
  UiShieldWarningFilled,
  UiShieldInfoFilled,
  UiDatabaseUp,
  UiDatabaseDown,
} from "../dist/index.mjs";

console.log("=== changeIconAliases entries ===");
const names = Object.keys(changeIconAliases).sort();
console.log("  total:", names.length);
console.log("  sample:", names.slice(0, 8).join(", "));

console.log("\n=== getChangeIcon resolves canonical change types ===");
for (const [name, expectedTarget] of [
  ["BackupStarted", "UiDatabaseUp"],
  ["BackupRestored", "UiDatabaseDown"],
  ["BackupFailed", "UiDatabaseError"],
  ["CREATE", "UiAdd"],
  ["UPDATE", "UiEdit"],
  ["DELETE", "UiTrash"],
  ["GroupMemberAdded", "UiUsersThreePlus"],
  ["Approved", "UiPass"],
  ["Rejected", "UiCircleX"],
  ["Pulled", "UiCloudDownload"],
  ["Promotion", "UiArrowRight"],
  ["CertificateExpired", "UiShieldWarning"],
  ["NotARealType", null],
]) {
  const Comp = getChangeIcon(name);
  const display = Comp ? Comp.displayName : null;
  const ok = expectedTarget === null ? Comp === undefined : display === expectedTarget;
  console.log(`  ${name.padEnd(26)} → ${display ?? "undefined"}  ${ok ? "✓" : "✗ expected " + expectedTarget}`);
}

console.log("\n=== Filled lookup ===");
const filledBackup = getChangeIcon("BackupStarted", { filled: true });
console.log(`  BackupStarted (filled) → ${filledBackup?.displayName}  ${filledBackup?.displayName === "UiDatabaseUpFilled" ? "✓" : "✗"}`);

console.log("\n=== Shield Check / Warning / Info as composites ===");
for (const [name, Comp] of [
  ["UiShieldCheck", UiShieldCheck],
  ["UiShieldWarning", UiShieldWarning],
  ["UiShieldInfo", UiShieldInfo],
  ["UiShieldCheckFilled", UiShieldCheckFilled],
  ["UiShieldWarningFilled", UiShieldWarningFilled],
  ["UiShieldInfoFilled", UiShieldInfoFilled],
]) {
  const html = renderToStaticMarkup(createElement(Comp, { size: 32 }));
  const hasMarker = html.includes("<g transform=");
  const isFilled = name.endsWith("Filled");
  const hasTintedBase = isFilled && /fill="(#[0-9a-f]{6})"/i.test(html);
  console.log(`  ${name.padEnd(26)} ${html.length} bytes  marker=${hasMarker ? "✓" : "✗"}  ${isFilled ? `tinted=${hasTintedBase ? "✓" : "✗"}` : ""}`);
}

console.log("\n=== Database Up/Down still work ===");
console.log(`  UiDatabaseUp source: ${UiDatabaseUp.__source}`);
console.log(`  UiDatabaseDown source: ${UiDatabaseDown.__source}`);
