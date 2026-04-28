import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import {
  UiSeverityCritical,
  UiSeverityHigh,
  UiSeverityMedium,
  UiSeverityLow,
  UiSeverityInfo,
  UiSeverityWarning,
  UiSeverityBlocker,
  UiError,
  UiWarningCircle,
  UiWarningTriangle,
  UiPass,
  UiInfo,
  UiSkull,
  UiSiren,
  UiChangeDiff,
  UiDiff,
  UiDatabasePlus,
} from "../dist/index.mjs";

console.log("=== Default colors (no overrides) ===");
for (const [name, Comp, expected] of [
  ["UiSeverityCritical", UiSeverityCritical, "#dc2626"],
  ["UiSeverityHigh", UiSeverityHigh, "#ef4444"],
  ["UiSeverityMedium", UiSeverityMedium, "#f59e0b"],
  ["UiSeverityLow", UiSeverityLow, "#0ea5e9"],
  ["UiSeverityInfo", UiSeverityInfo, "#64748b"],
  ["UiSeverityWarning", UiSeverityWarning, "#d97706"],
  ["UiSeverityBlocker", UiSeverityBlocker, "#b91c1c"],
  ["UiError", UiError, "#dc2626"],
  ["UiWarningCircle", UiWarningCircle, "#d97706"],
  ["UiWarningTriangle", UiWarningTriangle, "#d97706"],
  ["UiPass", UiPass, "#059669"],
  ["UiInfo", UiInfo, "#0ea5e9"],
  ["UiSkull", UiSkull, "#b91c1c"],
  ["UiSiren", UiSiren, "#dc2626"],
]) {
  const html = renderToStaticMarkup(createElement(Comp, { size: 24 }));
  const ok = html.includes(`color:${expected}`);
  console.log(`  ${name.padEnd(22)} default=${expected}  ${ok ? "✓" : "✗ — got: " + html.slice(0, 200)}`);
}

console.log("\n=== Override via className text-* ===");
const overrideHtml = renderToStaticMarkup(createElement(UiError, { size: 24, className: "text-slate-500" }));
console.log(`  UiError className="text-slate-500" → has #dc2626? ${overrideHtml.includes("#dc2626") ? "✗ (still defaulted)" : "✓ (overridden)"}`);
console.log(`  ${overrideHtml.slice(0, 180)}`);

console.log("\n=== Override via style.color ===");
const styleOverride = renderToStaticMarkup(createElement(UiError, { size: 24, style: { color: "blue" } }));
console.log(`  UiError style={{color:"blue"}} → has #dc2626? ${styleOverride.includes("#dc2626") ? "✗" : "✓"}, has 'blue'? ${styleOverride.includes("blue") ? "✓" : "✗"}`);

console.log("\n=== UiChangeDiff aliases UiDiff ===");
const diffHtml = renderToStaticMarkup(createElement(UiDiff, { size: 24 }));
const changeDiffHtml = renderToStaticMarkup(createElement(UiChangeDiff, { size: 24 }));
console.log(`  UiDiff bytes:       ${diffHtml.length}`);
console.log(`  UiChangeDiff bytes: ${changeDiffHtml.length}  (paths match: ${diffHtml.match(/d="[^"]+"/)?.[0] === changeDiffHtml.match(/d="[^"]+"/)?.[0] ? "✓" : "✗"})`);

console.log("\n=== Sub-icon halo (should be fill='none' stroke='currentColor') ===");
const dbPlusHtml = renderToStaticMarkup(createElement(UiDatabasePlus, { size: 32 }));
const haloRing = dbPlusHtml.match(/<circle[^/]*fill="none"[^/]*stroke="currentColor"[^/]*\/>/);
console.log(`  UiDatabasePlus halo ring present? ${haloRing ? "✓" : "✗"}`);
console.log(`  ${haloRing ? haloRing[0] : "(no ring)"}`);
const whiteFill = /<circle[^/]*fill="white"/.test(dbPlusHtml);
console.log(`  UiDatabasePlus white halo present? ${whiteFill ? "✗ (still has white)" : "✓ (no white)"}`);
