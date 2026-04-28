import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import * as M from "../dist/index.mjs";

console.log("=== Database Up / Down sub-icons ===");
for (const name of ["UiDatabaseUp", "UiDatabaseUpFilled", "UiDatabaseDown", "UiDatabaseDownFilled"]) {
  const C = M[name];
  if (!C) { console.log(`  ${name.padEnd(28)} ✗ MISSING`); continue; }
  const html = renderToStaticMarkup(createElement(C, { size: 24 }));
  const hasMarker = html.includes("<g transform=");
  console.log(`  ${name.padEnd(28)} ${html.length} bytes  marker=${hasMarker ? "✓" : "✗"}`);
}

console.log("\n=== Shield outline composites (default mode: currentColor shield + colored marker) ===");
for (const name of ["UiShieldPlus", "UiShieldMinus", "UiShieldCross", "UiShieldPending"]) {
  const C = M[name];
  const html = renderToStaticMarkup(createElement(C, { size: 24 }));
  const hasTint = /(?<!current)color="(#[0-9a-f]+|red|green|blue)"/i.test(html);
  console.log(`  ${name.padEnd(28)} ${html.length} bytes  tinted-base=${hasTint ? "(should be NO) ✗" : "✓ (no tint)"}`);
}

console.log("\n=== Shield Filled composites (tinted-base mode: shield = marker color, marker = white) ===");
for (const name of ["UiShieldPlusFilled", "UiShieldMinusFilled", "UiShieldCrossFilled", "UiShieldPendingFilled"]) {
  const C = M[name];
  if (!C) { console.log(`  ${name.padEnd(28)} ✗ MISSING`); continue; }
  const html = renderToStaticMarkup(createElement(C, { size: 24 }));
  // tinted base → currentColor should be replaced with the recipe color (e.g. #16a34a/#dc2626/#d97706)
  // marker glyph wrapper should have color="white"
  const hasMarkerWhite = /color="white"/.test(html);
  const hasCurrentColor = /currentColor/.test(html);
  // The base path's fill should now be a hex color, not currentColor
  console.log(`  ${name.padEnd(28)} ${html.length} bytes  marker-white=${hasMarkerWhite ? "✓" : "✗"}  has-currentColor=${hasCurrentColor ? "✗ (should be replaced)" : "✓"}`);
  if (name === "UiShieldPlusFilled") console.log(`    ${html.slice(0, 220)}...`);
}
