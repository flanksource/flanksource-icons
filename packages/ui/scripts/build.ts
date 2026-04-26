/**
 * Codegen for @flanksource/icons-ui.
 *
 * Reads hack/icon-selections.json from the repo root, resolves each pick
 * (Phosphor / JetBrains expui / Iconify alternate / local incumbent SVG),
 * fetches the source SVG, normalizes it to 24×24 viewBox with `currentColor`
 * fills/strokes for the outline variant (so `text-*` classes propagate),
 * and emits one React component file per icon plus a barrel index.
 *
 * Component naming: kebab consumerName → `Ui<PascalCase>` for the outline
 * variant and `Ui<PascalCase>Filled` for the filled variant. Aliases re-export
 * the canonical component.
 */
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { optimize } from "svgo";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");
const repoRoot = join(pkgRoot, "..", "..");
const selectionsPath = join(repoRoot, "hack", "icon-selections.json");
const svgIncumbentDir = join(repoRoot, "svg");
const outDir = join(pkgRoot, "src", "icons");
const indexPath = join(pkgRoot, "src", "index.ts");

type SelectionRow = {
  consumerName: string;
  group: string;
  status: "NEW" | "EXISTS" | "ALIAS";
  outline: string | null;
  filled: string | null;
  note: string;
};

type Selections = { rows: SelectionRow[] };

function pascalCase(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

/**
 * Strip framework/group prefixes from a consumer name before generating the
 * component name. `uir-class` → `class` → `UiClass`. `uir-sql-table` →
 * `sql-table` → `UiSqlTable`. We keep `sql-` because it disambiguates SQL
 * symbols from code symbols (UiTable already exists for the data-table icon).
 */
function stripUirPrefix(name: string): string {
  if (name.startsWith("uir-sql-")) return "sql-" + name.slice("uir-sql-".length);
  if (name.startsWith("uir-")) return name.slice("uir-".length);
  return name;
}

function resolveAliasTarget(consumerName: string): string | null {
  // "x -> close" → "close"; "person -> user" → "user"; etc.
  const arrow = consumerName.indexOf(" -> ");
  if (arrow < 0) return null;
  // Strip any trailing parenthetical: "stopwatch -> watch (timer)" → "watch"
  return consumerName.slice(arrow + 4).replace(/\s*\(.*\)\s*$/, "").trim();
}

async function fetchSvg(spec: string, consumerName: string): Promise<string> {
  // "incumbent" → svg/<consumerName>.svg
  // "incumbent:<filename>" → svg/<filename>.svg (lets aliases reuse another row's incumbent)
  if (spec === "incumbent" || spec.startsWith("incumbent:")) {
    const explicit = spec.startsWith("incumbent:") ? spec.slice("incumbent:".length) : null;
    // Try the explicit override first; otherwise the consumer name; otherwise
    // strip a known prefix (e.g. change-diff → diff) and try again.
    const candidates = explicit
      ? [explicit]
      : [consumerName, consumerName.replace(/^change-/, "").replace(/^uir-(sql-)?/, "")];
    for (const candidate of candidates) {
      const path = join(svgIncumbentDir, `${candidate}.svg`);
      if (existsSync(path)) return readFile(path, "utf8");
    }
    throw new Error(`incumbent svg missing for "${consumerName}" (tried: ${candidates.join(", ")})`);
  }
  const colon = spec.indexOf(":");
  const prefix = spec.slice(0, colon);
  const name = spec.slice(colon + 1);
  let url: string;
  if (prefix.startsWith("jb-expui-")) {
    const dir = prefix.slice("jb-expui-".length);
    url = `https://raw.githubusercontent.com/JetBrains/intellij-community/master/platform/icons/src/expui/${dir}/${name}.svg`;
  } else {
    url = `https://api.iconify.design/${prefix}/${name}.svg`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

/**
 * Normalise raw SVG to JSX-ready inner content.
 * - run svgo
 * - extract viewBox (default to 0 0 24 24)
 * - extract fill/stroke from the outer <svg> tag so we can propagate them to
 *   children whose styling depends on inheritance (Lucide / Tabler / Heroicons
 *   convention: fill="none" + stroke="currentColor" + strokeWidth=2 on the
 *   <svg>; child <path>/<rect>/<circle> have no fill/stroke of their own and
 *   would render as black fill if we just stripped the outer <svg>).
 * - strip outer <svg> wrapper, keep inner children
 * - recolor explicit black fills/strokes to currentColor so `color: …` works
 *   (skip multi-color JetBrains icons).
 */
function normalizeSvg(raw: string, opts: { recolor: boolean }): { inner: string; viewBox: string } {
  const { data } = optimize(raw, {
    multipass: true,
    plugins: [
      "removeComments",
      "removeMetadata",
      "removeDoctype",
      "removeXMLProcInst",
      "removeXMLNS",
      { name: "removeAttrs", params: { attrs: ["class", "id", "data-name"] } },
    ],
  });
  let svg = data;
  const viewBoxMatch = svg.match(/viewBox\s*=\s*"([^"]+)"/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

  // Capture root <svg> presentation attributes that children may be inheriting.
  const svgOpenMatch = svg.match(/<svg[^>]*>/i);
  const svgOpen = svgOpenMatch ? svgOpenMatch[0] : "";
  const rootFill = (svgOpen.match(/\bfill="([^"]+)"/i) || [])[1];
  const rootStroke = (svgOpen.match(/\bstroke="([^"]+)"/i) || [])[1];
  const rootStrokeWidth = (svgOpen.match(/\bstroke-width="([^"]+)"/i) || [])[1];
  const rootStrokeLinecap = (svgOpen.match(/\bstroke-linecap="([^"]+)"/i) || [])[1];
  const rootStrokeLinejoin = (svgOpen.match(/\bstroke-linejoin="([^"]+)"/i) || [])[1];
  const rootHasInherit = !!(rootFill || rootStroke || rootStrokeWidth);

  // Drop the outer <svg ...>...</svg> and keep inner.
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, "");
  let out = inner;

  if (opts.recolor) {
    out = out
      .replace(/fill="(#000|#000000|black)"/gi, 'fill="currentColor"')
      .replace(/stroke="(#000|#000000|black)"/gi, 'stroke="currentColor"');
  }

  // Propagate root presentation attributes onto a wrapping <g>, which then
  // cascades to every child shape (including any nested <g>). Lucide/Tabler/
  // Heroicons paths inherit from their parent — wrapping in a <g> with the
  // root attrs preserves that. Skip when there's already a <g> at the top
  // level (svgo's collapseGroups would have flattened it otherwise).
  if (rootHasInherit) {
    const trimmed = out.trim();
    const startsWithG = /^<g[\s>]/i.test(trimmed);
    if (!startsWithG) {
      const gAttrs: string[] = [];
      if (rootFill) {
        const fill = opts.recolor && /^(#000|#000000|black)$/i.test(rootFill) ? "currentColor" : rootFill;
        gAttrs.push(`fill="${fill}"`);
      }
      if (rootStroke) {
        const stroke = opts.recolor && /^(#000|#000000|black)$/i.test(rootStroke) ? "currentColor" : rootStroke;
        gAttrs.push(`stroke="${stroke}"`);
      }
      if (rootStrokeWidth) gAttrs.push(`stroke-width="${rootStrokeWidth}"`);
      if (rootStrokeLinecap) gAttrs.push(`stroke-linecap="${rootStrokeLinecap}"`);
      if (rootStrokeLinejoin) gAttrs.push(`stroke-linejoin="${rootStrokeLinejoin}"`);
      out = `<g ${gAttrs.join(" ")}>${trimmed}</g>`;
    } else {
      // The existing <g> already carries the inherit attrs (or some of them) —
      // just make sure black fills/strokes inside it are normalised.
      // (The recolor pass above already handled that.)
    }
  } else {
    // No inheritable attrs from root. If the topmost element is a <g> that
    // already carries presentation attrs (Lucide convention: outer <svg> is
    // bare, the immediate <g> child holds fill="none" stroke="currentColor"),
    // we leave it alone — children inherit correctly. Only when there's no
    // such wrapper do we inject fill="currentColor" on orphan shapes.
    const trimmed = out.trim();
    const wrapperGAttrs = (trimmed.match(/^<g([^>]*)>/i) || [])[1] || "";
    const wrapperHasFillOrStroke = /\bfill=|\bstroke=/i.test(wrapperGAttrs);
    if (!wrapperHasFillOrStroke) {
      const shapeRe = /<(path|rect|circle|ellipse|polygon|polyline|line)\b((?:[^>]|"[^"]*")*?)(\/?)>/gi;
      out = out.replace(shapeRe, (_match, tag, attrs, slash) => {
        const hasFill = /\bfill=/i.test(attrs);
        const hasStroke = /\bstroke=/i.test(attrs);
        if (hasFill || hasStroke) return `<${tag}${attrs}${slash}>`;
        return `<${tag} fill="currentColor"${attrs}${slash}>`;
      });
    }
  }

  // Convert kebab attributes to camelCase for JSX.
  out = out
    .replace(/\bstroke-width=/g, "strokeWidth=")
    .replace(/\bstroke-linecap=/g, "strokeLinecap=")
    .replace(/\bstroke-linejoin=/g, "strokeLinejoin=")
    .replace(/\bstroke-miterlimit=/g, "strokeMiterlimit=")
    .replace(/\bstroke-dasharray=/g, "strokeDasharray=")
    .replace(/\bstroke-dashoffset=/g, "strokeDashoffset=")
    .replace(/\bfill-rule=/g, "fillRule=")
    .replace(/\bclip-rule=/g, "clipRule=")
    .replace(/\bfill-opacity=/g, "fillOpacity=")
    .replace(/\bstroke-opacity=/g, "strokeOpacity=")
    .replace(/\bclip-path=/g, "clipPath=")
    .replace(/\bxlink:href=/g, "xlinkHref=");
  return { inner: out.trim(), viewBox };
}

function shouldRecolor(spec: string): boolean {
  // Phosphor + Iconify outline collections: recolor to currentColor.
  // JetBrains expui icons are multi-color brand glyphs — leave them alone.
  if (spec === "incumbent") return false; // incumbents may already be colorful
  if (spec.startsWith("jb-expui-")) return false;
  return true;
}

/**
 * Default semantic colors for icons whose meaning is inseparable from their
 * color (severity, error, warning, success, info). When the consumer passes
 * neither `className` (containing a `text-` utility), `style.color`, nor
 * `color`, the generated component sets `style={{ color: <hex> }}` on the
 * <svg> so the icon renders in its semantic color out of the box. Keyed by
 * the base component name (without `Filled` suffix); both variants share the
 * default.
 */
const DEFAULT_COLORS: Record<string, string> = {
  // Severity tiers — flanksource-ui ConfigChangeSeverity.
  UiSeverityCritical: "#dc2626", // red-600
  UiSeverityHigh: "#ef4444",     // red-500
  UiSeverityMedium: "#f59e0b",   // amber-500
  UiSeverityLow: "#0ea5e9",      // sky-500
  UiSeverityInfo: "#64748b",     // slate-500
  UiSeverityWarning: "#d97706",  // amber-600
  UiSeverityBlocker: "#b91c1c",  // red-700

  // General health/status set.
  UiError: "#dc2626",            // red-600
  UiCircleX: "#ef4444",          // red-500
  UiWarningCircle: "#d97706",    // amber-600
  UiWarningTriangle: "#d97706",  // amber-600
  UiPass: "#059669",             // emerald-600
  UiCheck: "#059669",            // emerald-600 (affirmative when standalone)
  UiInfo: "#0ea5e9",             // sky-500
  UiInfoCircle: "#0ea5e9",       // sky-500
  UiSkull: "#b91c1c",            // red-700
  UiSiren: "#dc2626",            // red-600
  UiLoader: "#94a3b8",           // slate-400
};

// ============================================================================
// Sub-icon overlay pipeline
// ============================================================================
// A small, fixed set of monochrome marker glyphs that can be overlaid on top
// of a base icon. Each marker is described as the inner content of a 24×24
// viewBox; the compositor scales and translates it onto the base icon's
// viewBox at the requested position. Markers are designed to read at ~40% of
// the base icon's height with a white stroke ring so they pop on both light
// and dark backgrounds.

type Marker = "plus" | "minus" | "tick" | "cross" | "hourglass" | "trash" | "info" | "warning" | "error" | "up" | "down";
type Position = "br" | "bl" | "tr" | "tl" | "center";

type SubIconRecipe = {
  marker: Marker;
  color: string; // CSS color (hex, rgb, named, currentColor)
  position: Position;
  /** Override default 0.45 scale relative to base viewBox. */
  scale?: number;
  /** Component-name suffix for this sub-icon variant. e.g. "Plus" → UiDatabasePlus. */
  suffix: string;
};

/**
 * Marker glyphs at 24×24 viewBox. Stored with JSX-camelCase attribute names
 * (strokeWidth, strokeLinecap, etc.) so they can be inlined directly into
 * generated component source. fill="currentColor" picks up the marker color
 * we set on the wrapping <g>.
 */
const MARKER_GLYPHS: Record<Marker, string> = {
  // A bold plus — readable at small sizes, balanced cross.
  plus: '<path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>',
  // A bold minus — the horizontal half of plus.
  minus: '<path d="M4 12h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>',
  // A check mark — angled at 45°, covers most of the 24×24.
  tick: '<path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>',
  // A cross — × symbol.
  cross: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>',
  // A simple hourglass — top + bottom triangles meeting at a waist.
  hourglass:
    '<path d="M6 4h12v3l-5 5 5 5v3H6v-3l5-5-5-5V4z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>',
  // A trash bin — lid + body.
  trash:
    '<path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M7 7l1 12a2 2 0 002 2h4a2 2 0 002-2l1-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>',
  // Info — letter "i" inside an implicit circle (the halo provides the disc).
  info: '<path d="M12 8.5v.01M11 12h1v5h1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>',
  // Warning — exclamation mark; the halo's white disc reads as the body.
  warning: '<path d="M12 7v6M12 16v.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>',
  // Error — bold X (a "no-go" cross, slightly heavier than the regular cross
  // marker so it reads as a hard error rather than a generic close action).
  error: '<path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none"/>',
  // Up arrow — for backup/upload-style "data flowing up" markers.
  up: '<path d="M12 19V6M6 11l6-5l6 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>',
  // Down arrow — for restore/download-style "data flowing down" markers.
  down: '<path d="M12 5v13M6 13l6 5l6-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>',
};

/**
 * Parse the base SVG's viewBox into [minX, minY, w, h]. Defaults to 0 0 24 24
 * if absent or malformed.
 */
function parseViewBox(viewBox: string): [number, number, number, number] {
  const parts = viewBox.trim().split(/\s+/).map(Number);
  if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
    return parts as [number, number, number, number];
  }
  return [0, 0, 24, 24];
}

/**
 * Compute the marker's position within the base viewBox. Returns the marker's
 * top-left corner + size, expressed in base viewBox units.
 */
function markerPlacement(
  baseViewBox: string,
  position: Position,
  scale: number,
): { x: number; y: number; size: number } {
  const [minX, minY, w, h] = parseViewBox(baseViewBox);
  const size = Math.min(w, h) * scale;
  const pad = Math.min(w, h) * 0.04; // small inset from edge
  switch (position) {
    case "br":
      return { x: minX + w - size - pad, y: minY + h - size - pad, size };
    case "bl":
      return { x: minX + pad, y: minY + h - size - pad, size };
    case "tr":
      return { x: minX + w - size - pad, y: minY + pad, size };
    case "tl":
      return { x: minX + pad, y: minY + pad, size };
    case "center":
    default:
      return { x: minX + (w - size) / 2, y: minY + (h - size) / 2, size };
  }
}

/**
 * Compose a base icon (already-normalised inner SVG content + viewBox) with a
 * marker overlay. Emits the inner JSX of a new SVG with the marker placed at
 * the recipe's position.
 *
 * Modes:
 * - default ("marker on base"): marker uses recipe.color, white halo behind
 *   the marker, base keeps `currentColor`. Used for outline composites and
 *   for filled non-shield bases.
 * - tintBase (filled-shield convention): the entire base takes the marker's
 *   color and the marker glyph is drawn white over it. Used when the user
 *   wants the shield body itself to convey severity (green shield = ok,
 *   red shield = warn, etc.).
 */
function composeWithSubIcon(
  baseInner: string,
  baseViewBox: string,
  recipe: SubIconRecipe,
  opts: { tintBase?: boolean } = {},
): string {
  const place = markerPlacement(baseViewBox, recipe.position, recipe.scale ?? 0.45);
  const markerInner = MARKER_GLYPHS[recipe.marker];
  // Scale factor from marker's 24×24 reference to the requested size.
  const s = place.size / 24;
  // Translate then scale.
  const transform = `translate(${place.x.toFixed(3)} ${place.y.toFixed(3)}) scale(${s.toFixed(4)})`;

  if (opts.tintBase) {
    // Tinted-base mode (e.g. filled shield variants): the base takes the
    // semantic color and the marker glyph is rendered in white on top.
    // We swap any `currentColor` references inside the base for the recipe
    // color, then render the marker with a white color context. No halo —
    // the whole base IS the colored backdrop.
    const tintedBase = baseInner.replace(/currentColor/g, recipe.color);
    return `${tintedBase}<g transform="${transform}" color="white">${markerInner}</g>`;
  }

  // Halo: a plain white-filled disc, no stroke. The white backdrop punches
  // through the base icon so the marker glyph is the only thing carrying
  // color in this region — keeps the visual hierarchy "marker color owns the
  // inside, base icon owns the outside". "center" position (Shield) skips
  // the halo entirely so the shield outline isn't competing with a circle.
  const haloRadius = recipe.position === "center" ? 0 : 11;
  const halo = haloRadius > 0
    ? `<circle cx="12" cy="12" r="${haloRadius}" fill="white"/>`
    : "";
  return `${baseInner}<g transform="${transform}" color="${recipe.color}">${halo}${markerInner}</g>`;
}

/**
 * Sub-icon recipes per consumer row. Keyed by the row's component base name
 * (after `Ui` prefix, e.g. `Database`, `User`, `Shield`). Each entry produces
 * an extra component for every sub-icon (e.g. `UiDatabasePlus`,
 * `UiDatabaseTick`).
 */
const SUB_ICONS_BY_BASE: Record<string, SubIconRecipe[]> = {
  Database: [
    { marker: "plus", color: "#16a34a", position: "br", suffix: "Plus" },
    { marker: "minus", color: "#dc2626", position: "br", suffix: "Minus" },
    { marker: "tick", color: "#16a34a", position: "br", suffix: "Check" },
    { marker: "cross", color: "#dc2626", position: "br", suffix: "Cross" },
    { marker: "trash", color: "#dc2626", position: "br", suffix: "Trash" },
    { marker: "hourglass", color: "#d97706", position: "br", suffix: "Pending" },
    { marker: "info", color: "#0ea5e9", position: "br", suffix: "Info" },
    { marker: "warning", color: "#d97706", position: "br", suffix: "Warning" },
    { marker: "error", color: "#dc2626", position: "br", suffix: "Error" },
    { marker: "up", color: "#16a34a", position: "br", suffix: "Up" },
    { marker: "down", color: "#0ea5e9", position: "br", suffix: "Down" },
  ],
  User: [
    { marker: "plus", color: "#16a34a", position: "br", suffix: "Plus" },
    { marker: "minus", color: "#dc2626", position: "br", suffix: "Minus" },
    { marker: "tick", color: "#16a34a", position: "br", suffix: "Check" },
  ],
  // The user-group / multi-person base. Re-exports under shorter aliases below.
  UsersThree: [
    { marker: "plus", color: "#16a34a", position: "br", suffix: "Plus" },
    { marker: "minus", color: "#dc2626", position: "br", suffix: "Minus" },
    { marker: "tick", color: "#16a34a", position: "br", suffix: "Check" },
    { marker: "cross", color: "#dc2626", position: "br", suffix: "Cross" },
  ],
  // User profile circle — same lifecycle markers as a regular user.
  UserCircle: [
    { marker: "plus", color: "#16a34a", position: "br", suffix: "Plus" },
    { marker: "minus", color: "#dc2626", position: "br", suffix: "Minus" },
    { marker: "tick", color: "#16a34a", position: "br", suffix: "Check" },
  ],
  // Organization (buildings) — group-level lifecycle markers.
  Organization: [
    { marker: "plus", color: "#16a34a", position: "br", suffix: "Plus" },
    { marker: "minus", color: "#dc2626", position: "br", suffix: "Minus" },
    { marker: "tick", color: "#16a34a", position: "br", suffix: "Check" },
    { marker: "cross", color: "#dc2626", position: "br", suffix: "Cross" },
  ],
  Shield: [
    { marker: "plus", color: "#16a34a", position: "center", suffix: "Plus", scale: 0.5 },
    { marker: "minus", color: "#dc2626", position: "center", suffix: "Minus", scale: 0.5 },
    { marker: "tick", color: "#16a34a", position: "center", suffix: "Check", scale: 0.5 },
    { marker: "cross", color: "#dc2626", position: "center", suffix: "Cross", scale: 0.5 },
    { marker: "hourglass", color: "#d97706", position: "center", suffix: "Pending", scale: 0.5 },
    { marker: "warning", color: "#d97706", position: "center", suffix: "Warning", scale: 0.5 },
    { marker: "info", color: "#0ea5e9", position: "center", suffix: "Info", scale: 0.5 },
  ],
};

function componentSource(componentName: string, viewBox: string, inner: string): string {
  return `import * as React from "react";
import type { IconProps } from "../types";

export const ${componentName}: React.FC<IconProps> = ({ size = "1em", className, title, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="${viewBox}"
    role={title ? "img" : "presentation"}
    aria-label={title}
    aria-hidden={title ? undefined : true}
    className={className}
    {...props}
  >
    ${inner.replace(/\n/g, "\n    ")}
  </svg>
);
${componentName}.displayName = "${componentName}";
`;
}

async function main() {
  const sel: Selections = JSON.parse(await readFile(selectionsPath, "utf8"));

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  // Map consumerName → row for alias resolution.
  const rowByName = new Map(sel.rows.map((r) => [r.consumerName, r]));

  // Two rows can collapse to the same component name (e.g. layout-dashboard
  // "package" + uir-ast-code "uir-package" both → UiPackage). Pre-compute
  // which row "wins" each baseName so generation skips the loser.
  function variantCount(r: SelectionRow): number {
    let n = 0;
    if (r.outline && r.outline !== "skip" && r.outline !== "maintain") n++;
    if (r.filled && r.filled !== "skip" && r.filled !== "maintain") n++;
    return n;
  }
  function rowBaseName(r: SelectionRow): string {
    const aliasTarget = resolveAliasTarget(r.consumerName);
    const cleanConsumer = aliasTarget ?? r.consumerName;
    return `Ui${pascalCase(stripUirPrefix(cleanConsumer))}`;
  }

  // Names where the sub-icon compositor should own the component, even if
  // there's a row that resolves to the same name. The user requested specific
  // composites at these names; the row's existing pick is a less-distinctive
  // duplicate of its parent row.
  const SUB_ICON_OVERRIDES = new Set([
    "UiDatabasePlus", // sub-icon supplants the database-plus row (same glyph)
  ]);

  /**
   * Change-type names (the upstream Go constants from
   * duty/types/config_changes.go) → underlying icon component name. Consumers
   * resolve a change-type string to its icon via the runtime helper exposed
   * from changeIconAliases.ts; we no longer emit per-row UiChange* components.
   *
   * Both outline and Filled twins are exposed where the target has both.
   */
  const CHANGE_ICON_ALIASES: Record<string, string> = {
    // Lifecycle (duty)
    CREATE: "UiAdd",
    UPDATE: "UiEdit",
    DELETE: "UiTrash",
    diff: "UiDiff",

    // User & group
    UserCreated: "UiUserPlus",
    UserDeleted: "UiUserMinus",
    GroupMemberAdded: "UiUsersThreePlus",
    GroupMemberRemoved: "UiUsersThreeMinus",

    // Screenshot
    Screenshot: "UiCamera",

    // Permissions — key glyph; consumer adds plus/minus context via color
    PermissionAdded: "UiKey",
    PermissionRemoved: "UiKey",

    // Deployment
    Deployment: "UiRocket",
    Promotion: "UiArrowRight", // promotion = left → right env-to-env flow
    Approved: "UiPass",
    Rejected: "UiCircleX",
    Rollback: "UiRefresh",

    // Backup — uses Database composites with directional/status markers
    BackupStarted: "UiDatabaseUp",
    BackupCompleted: "UiDatabaseCheck",
    BackupRestored: "UiDatabaseDown",
    BackupFailed: "UiDatabaseError",
    BackupDeleted: "UiDatabaseTrash",

    // Pipeline
    PipelineRunStarted: "UiPlay",
    PipelineRunCompleted: "UiPass",
    PipelineRunFailed: "UiCircleX",

    // Scaling
    Scaling: "UiArrowRight",

    // Certificate
    CertificateRenewed: "UiShieldCheck",
    CertificateExpired: "UiShieldWarning",

    // Cost
    CostChange: "UiInsightCost",

    // Playbook
    PlaybookStarted: "UiPlaybook",
    PlaybookCompleted: "UiPlaybook",
    PlaybookFailed: "UiPlaybook",

    // Instance / node
    RunInstances: "UiServer",
    RegisterNode: "UiServer",
    Pulled: "UiCloudDownload",
  };

  const winnerForBase = new Map<string, string>(); // baseName -> consumerName of winner
  for (const r of sel.rows) {
    if (variantCount(r) === 0) continue;
    if (r.group === "change-types") continue; // change-types are runtime aliases, not components
    const base = rowBaseName(r);
    if (SUB_ICON_OVERRIDES.has(base)) continue; // sub-icon owns this name; row is silently skipped
    const current = winnerForBase.get(base);
    if (!current) {
      winnerForBase.set(base, r.consumerName);
      continue;
    }
    const currentRow = rowByName.get(current)!;
    if (variantCount(r) > variantCount(currentRow)) {
      winnerForBase.set(base, r.consumerName);
    }
    // Otherwise keep the existing winner (first one wins on tie).
  }

  const generated: { component: string; file: string }[] = [];
  const failures: { row: string; reason: string }[] = [];
  const skippedCollisions: string[] = [];

  for (const row of sel.rows) {
    // Skip change-types rows entirely — they're surfaced via the runtime
    // alias map (see CHANGE_ICON_ALIASES + emitted changeIconAliases.ts at
    // the end). Consumers use getChangeIcon(name) instead of importing per-
    // change-type components.
    if (row.group === "change-types") continue;

    const aliasTarget = resolveAliasTarget(row.consumerName);
    const cleanConsumer = aliasTarget ?? row.consumerName;
    const baseName = `Ui${pascalCase(stripUirPrefix(cleanConsumer))}`;

    // Collision dedupe: only the winner emits the component for this baseName.
    if (winnerForBase.get(baseName) !== row.consumerName) {
      skippedCollisions.push(`${row.consumerName} → ${baseName} (winner: ${winnerForBase.get(baseName)})`);
      continue;
    }

    // Skip "skip"/"maintain" sentinels — caller wanted no icon for that variant.
    const variants: Array<{ slot: "outline" | "filled"; spec: string; suffix: string }> = [];
    if (row.outline && row.outline !== "skip" && row.outline !== "maintain") {
      variants.push({ slot: "outline", spec: row.outline, suffix: "" });
    }
    if (row.filled && row.filled !== "skip" && row.filled !== "maintain") {
      variants.push({ slot: "filled", spec: row.filled, suffix: "Filled" });
    }
    if (variants.length === 0) continue;

    // Aliases: if the alias's target row will already produce the same component
    // (e.g. "x -> close" with the same picks as "close"), emit a re-export instead.
    // Only re-export the variants that the *target* row also has.
    if (aliasTarget && rowByName.has(aliasTarget)) {
      const targetRow = rowByName.get(aliasTarget)!;
      const targetHasOutline = !!(targetRow.outline && targetRow.outline !== "skip" && targetRow.outline !== "maintain");
      const targetHasFilled = !!(targetRow.filled && targetRow.filled !== "skip" && targetRow.filled !== "maintain");
      const aliasHasOutline = variants.some((v) => v.slot === "outline");
      const aliasHasFilled = variants.some((v) => v.slot === "filled");
      // Outline export only if both target and alias chose the same outline.
      const reExportOutline = aliasHasOutline && targetHasOutline && targetRow.outline === row.outline;
      // Filled export only if both target and alias chose the same filled.
      const reExportFilled = aliasHasFilled && targetHasFilled && targetRow.filled === row.filled;
      // Only emit a re-export module if at least one variant matches AND the
      // alias provides no extra variant the target doesn't have.
      const aliasFullyCovered =
        (!aliasHasOutline || reExportOutline) && (!aliasHasFilled || reExportFilled);
      if (aliasFullyCovered && (reExportOutline || reExportFilled)) {
        const targetBase = `Ui${pascalCase(stripUirPrefix(aliasTarget))}`;
        const aliasBase = `Ui${pascalCase(stripUirPrefix(row.consumerName.replace(/\s*->.*$/, "")))}`;
        if (aliasBase !== targetBase) {
          const exports: string[] = [];
          if (reExportOutline) exports.push(`${targetBase} as ${aliasBase}`);
          if (reExportFilled) exports.push(`${targetBase}Filled as ${aliasBase}Filled`);
          const file = `${aliasBase}.ts`;
          const body = `export { ${exports.join(", ")} } from "./${targetBase}";\n`;
          await writeFile(join(outDir, file), body);
          if (reExportOutline) generated.push({ component: aliasBase, file });
          if (reExportFilled) generated.push({ component: `${aliasBase}Filled`, file });
        }
        continue;
      }
    }

    // Fetch + emit per variant. Both share one .tsx file with two named exports.
    const parts: string[] = [
      `import * as React from "react";`,
      `import type { IconProps } from "../types";`,
      "",
    ];
    const componentNames: string[] = [];
    // Capture each variant's normalised SVG so sub-icons can re-use the base.
    const variantPayload: Record<"outline" | "filled", { inner: string; viewBox: string; spec: string }> = {} as any;
    for (const v of variants) {
      const compName = baseName + v.suffix;
      try {
        const raw = await fetchSvg(v.spec, cleanConsumer);
        const { inner, viewBox } = normalizeSvg(raw, { recolor: shouldRecolor(v.spec) });
        variantPayload[v.slot] = { inner, viewBox, spec: v.spec };
        const defaultColor = DEFAULT_COLORS[baseName];
        // Component body: when this component has a default semantic color,
        // wrap the <svg> body so the color is applied unless the consumer
        // overrides via className (`text-*`), style.color, or color prop.
        if (defaultColor) {
          parts.push(
            `// source: ${v.spec} (default color: ${defaultColor})`,
            `export const ${compName}: React.FC<IconProps> & { __source: string; __viewBox: string; __defaultColor: string } = Object.assign(`,
            `  ({ size = "1em", className, title, style, ...props }: IconProps) => {`,
            `    const hasOverride = (typeof className === "string" && /\\btext-/.test(className)) || (style && (style as React.CSSProperties).color != null);`,
            `    const finalStyle: React.CSSProperties | undefined = hasOverride ? style : { color: ${JSON.stringify(defaultColor)}, ...(style as React.CSSProperties) };`,
            `    return (`,
            `      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="${viewBox}" role={title ? "img" : "presentation"} aria-label={title} aria-hidden={title ? undefined : true} className={className} style={finalStyle} {...props}>`,
            `        ${inner}`,
            `      </svg>`,
            `    );`,
            `  },`,
            `  { __source: ${JSON.stringify(v.spec)}, __viewBox: ${JSON.stringify(viewBox)}, __defaultColor: ${JSON.stringify(defaultColor)}, displayName: ${JSON.stringify(compName)} },`,
            `);`,
            "",
          );
        } else {
          parts.push(
            `// source: ${v.spec}`,
            `export const ${compName}: React.FC<IconProps> & { __source: string; __viewBox: string } = Object.assign(`,
            `  ({ size = "1em", className, title, ...props }: IconProps) => (`,
            `    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="${viewBox}" role={title ? "img" : "presentation"} aria-label={title} aria-hidden={title ? undefined : true} className={className} {...props}>`,
            `      ${inner}`,
            `    </svg>`,
            `  ),`,
            `  { __source: ${JSON.stringify(v.spec)}, __viewBox: ${JSON.stringify(viewBox)}, displayName: ${JSON.stringify(compName)} },`,
            `);`,
            "",
          );
        }
        componentNames.push(compName);
      } catch (err) {
        failures.push({ row: `${row.consumerName} [${v.slot}]`, reason: String(err) });
      }
    }

    // Sub-icon compositions — emit additional components whose name is
    // `Ui<Base><Suffix>` (e.g. UiDatabasePlus). When both outline and filled
    // base variants are available, emit both `Ui<Base><Suffix>` (composed on
    // outline) and `Ui<Base><Suffix>Filled` (composed on filled). Otherwise
    // use whichever variant exists. The lookup key is the PascalCase
    // consumer name without the `Ui` prefix (e.g. `Database`, `Shield`).
    const baseLookup = pascalCase(stripUirPrefix(cleanConsumer));
    const subRecipes = SUB_ICONS_BY_BASE[baseLookup] ?? [];
    if (subRecipes.length > 0) {
      const subBases: Array<{ base: typeof variantPayload.outline; suffix: string }> = [];
      if (variantPayload.outline) subBases.push({ base: variantPayload.outline, suffix: "" });
      if (variantPayload.filled) subBases.push({ base: variantPayload.filled, suffix: "Filled" });
      // If only one base existed, fall back to that single base for the
      // un-suffixed composite.
      if (subBases.length === 0 && variantPayload.filled) subBases.push({ base: variantPayload.filled, suffix: "" });
      for (const recipe of subRecipes) {
        for (const { base, suffix: variantSuffix } of subBases) {
          const subCompName = baseName + recipe.suffix + variantSuffix;
          if (winnerForBase.has(subCompName)) {
            skippedCollisions.push(`${row.consumerName}:${recipe.suffix}${variantSuffix} → ${subCompName} (winner: row-derived)`);
            continue;
          }
          // Tint-base convention: filled-variant shield composites paint the
          // shield in the marker's semantic color and render the marker
          // glyph in white on top. Other bases keep the default "marker on
          // base" mode regardless of variant.
          const tintBase = baseLookup === "Shield" && variantSuffix === "Filled";
          const composedInner = composeWithSubIcon(base.inner, base.viewBox, recipe, { tintBase });
          parts.push(
            `// composed: ${base.spec} + ${recipe.marker} (${recipe.position}, ${recipe.color})`,
            `export const ${subCompName}: React.FC<IconProps> & { __source: string; __viewBox: string } = Object.assign(`,
            `  ({ size = "1em", className, title, ...props }: IconProps) => (`,
            `    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="${base.viewBox}" role={title ? "img" : "presentation"} aria-label={title} aria-hidden={title ? undefined : true} className={className} {...props}>`,
            `      ${composedInner}`,
            `    </svg>`,
            `  ),`,
            `  { __source: ${JSON.stringify(base.spec + " + " + recipe.marker + " marker")}, __viewBox: ${JSON.stringify(base.viewBox)}, displayName: ${JSON.stringify(subCompName)} },`,
            `);`,
            "",
          );
          componentNames.push(subCompName);
        }
      }
    }

    if (componentNames.length === 0) continue;
    const file = `${baseName}.tsx`;
    await writeFile(join(outDir, file), parts.join("\n"));
    for (const c of componentNames) generated.push({ component: c, file });
  }

  // types.ts — single shared IconProps definition.
  await writeFile(
    join(pkgRoot, "src", "types.ts"),
    `import type { FC, SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "color"> & {
  /** Sets width/height. Accepts any CSS length. Defaults to "1em" so the icon scales with surrounding font-size. */
  size?: number | string;
  /** When provided, the icon becomes role="img" with aria-label=title. Otherwise it's aria-hidden. */
  title?: string;
};

/**
 * Every icon component carries metadata about its upstream source so the
 * demo / comparison page can show attribution. \`__source\` is the original
 * spec ("ph:upload-simple-light", "jb-expui-nodes:class", "incumbent", …);
 * \`__viewBox\` is the original viewBox preserved from the source SVG.
 */
export type IconComponent = FC<IconProps> & { __source: string; __viewBox: string };
`,
  );

  // changeIconAliases.ts — runtime map from change-type names (the upstream
  // Go constants from duty/types/config_changes.go) to the underlying icon
  // components. Consumers call getChangeIcon(name) or look up the map
  // directly. We do NOT emit per-row UiChange* components — change-types
  // are pure aliases.
  {
    const componentSet = new Set(generated.map((g) => g.component));
    const aliasEntries: string[] = [];
    const importNames = new Set<string>();
    for (const [changeName, target] of Object.entries(CHANGE_ICON_ALIASES)) {
      if (!componentSet.has(target)) {
        console.warn(`change-alias target missing: ${changeName} → ${target}`);
        continue;
      }
      importNames.add(target);
      const filledTarget = target + "Filled";
      const hasFilled = componentSet.has(filledTarget);
      if (hasFilled) importNames.add(filledTarget);
      aliasEntries.push(
        `  ${JSON.stringify(changeName)}: { outline: ${target}${hasFilled ? `, filled: ${filledTarget}` : ""} },`,
      );
    }
    const importsJoined = [...importNames].sort().join(",\n  ");
    const body = `// Generated by scripts/build.ts — do not edit by hand.
// Maps Flanksource change-type strings (duty/types/config_changes.go) to icons.
import {
  ${importsJoined},
} from "./index";
import type { IconComponent } from "./types";

export type ChangeIconEntry = {
  outline: IconComponent;
  filled?: IconComponent;
};

export const changeIconAliases: Record<string, ChangeIconEntry> = {
${aliasEntries.join("\n")}
};

/**
 * Resolve a change-type name (e.g. "BackupStarted", "CREATE", "Pulled") to
 * its outline icon component. Returns undefined if the name is unknown.
 *
 * Pass \`{ filled: true }\` to get the filled variant when available; falls
 * back to outline if the change-type has no filled twin.
 */
export function getChangeIcon(
  name: string,
  opts: { filled?: boolean } = {},
): IconComponent | undefined {
  const entry = changeIconAliases[name];
  if (!entry) return undefined;
  return opts.filled ? entry.filled ?? entry.outline : entry.outline;
}
`;
    await writeFile(join(pkgRoot, "src", "changeIconAliases.ts"), body);
  }

  // Barrel index.
  const seen = new Set<string>();
  const lines: string[] = ["// Generated by scripts/build.ts — do not edit by hand."];
  for (const { component, file } of generated) {
    if (seen.has(component)) continue;
    seen.add(component);
    const moduleName = file.replace(/\.tsx?$/, "");
    lines.push(`export { ${component} } from "./icons/${moduleName}";`);
  }
  lines.push(`export type { IconProps, IconComponent } from "./types";`);
  lines.push(`export { changeIconAliases, getChangeIcon } from "./changeIconAliases";`);
  lines.push(`export type { ChangeIconEntry } from "./changeIconAliases";`);
  await writeFile(indexPath, lines.join("\n") + "\n");

  // NOTICE.md — per-icon attribution, generated from selections.
  const noticeLines: string[] = [
    "# NOTICE — @flanksource/icons-ui",
    "",
    "Icons in this package are derived from third-party open-source icon sets.",
    "The package itself is licensed Apache 2.0; each icon carries the license",
    "of its upstream source.",
    "",
    "## Upstream licenses",
    "",
    "- Phosphor Icons — MIT — https://github.com/phosphor-icons/core",
    "- JetBrains IntelliJ Platform — Apache 2.0 — https://github.com/JetBrains/intellij-community",
    "- Tabler Icons — MIT — https://github.com/tabler/tabler-icons",
    "- Material Design Icons — Apache 2.0 — https://github.com/Templarian/MaterialDesign",
    "- Lucide — ISC — https://github.com/lucide-icons/lucide",
    "- Codicons — MIT — https://github.com/microsoft/vscode-codicons",
    "- Carbon Design — Apache 2.0 — https://github.com/carbon-design-system/carbon",
    "- Flanksource Icons — Apache 2.0 — https://github.com/flanksource/flanksource-icons",
    "",
    "## Per-icon sources",
    "",
    "| Component | Source |",
    "|---|---|",
  ];
  for (const row of sel.rows) {
    if (row.outline && row.outline !== "skip" && row.outline !== "maintain") {
      const aliasTarget = resolveAliasTarget(row.consumerName);
      const cleanConsumer = aliasTarget ?? row.consumerName;
      noticeLines.push(`| Ui${pascalCase(stripUirPrefix(cleanConsumer))} | ${row.outline} |`);
    }
    if (row.filled && row.filled !== "skip" && row.filled !== "maintain") {
      const aliasTarget = resolveAliasTarget(row.consumerName);
      const cleanConsumer = aliasTarget ?? row.consumerName;
      noticeLines.push(`| Ui${pascalCase(stripUirPrefix(cleanConsumer))}Filled | ${row.filled} |`);
    }
  }
  await writeFile(join(pkgRoot, "NOTICE.md"), noticeLines.join("\n") + "\n");

  console.log(`Generated ${seen.size} components across ${new Set(generated.map((g) => g.file)).size} files.`);
  if (skippedCollisions.length) {
    console.log(`\nSkipped due to name collision (${skippedCollisions.length}):`);
    for (const s of skippedCollisions) console.log("  " + s);
  }
  if (failures.length) {
    console.log(`\nFailures (${failures.length}):`);
    for (const f of failures) console.log(`  ${f.row}: ${f.reason}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
