import React, { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Icon, FileTypeIcon, ResourceIcon, aliases, prefixes, colorClassMap, processIconNameSearch, findByName, resolveFileTypeIcon } from "./Icon";
import { iconifyLogos, iconifyDevicon } from "./iconifyAllowlist";
import { IconMap } from "@flanksource/icons/mi";
import type { IconType } from "./iconBase";
import { isWideViewBox } from "./iconBase";
// New per-component icon set generated from hack/icon-selections.json. The
// alias in make.sh resolves this to packages/ui/src/index.ts, so esbuild
// inlines every component into the demo bundle. Falls back to an empty
// namespace if the package wasn't built (rare: only when running the demo
// outside the standard build).
import * as IconsUi from "@flanksource/icons-ui";

function isWideName(name: string | undefined, secondary?: string): boolean {
  const lookup = (n?: string) => (n ? findByName(n, IconMap) : undefined);
  const icon = lookup(name) ?? lookup(secondary);
  return !!icon && isWideViewBox(icon.viewBox);
}

type ResourceTier =
  | { kind: "bundled"; via: "primary" | "secondary"; name: string }
  | { kind: "url"; src: string }
  | { kind: "iconify"; collection: "logos" | "devicon"; slug: string; via: "primary" | "secondary" }
  | { kind: "miss" };

function resolveResourceTier(primary: string, secondary: string): ResourceTier {
  if (findByName(primary, IconMap)) return { kind: "bundled", via: "primary", name: primary };
  if (findByName(secondary, IconMap)) return { kind: "bundled", via: "secondary", name: secondary };
  if (primary.startsWith("http:") || primary.startsWith("https://")) return { kind: "url", src: primary };
  for (const [via, candidate] of [["primary", primary], ["secondary", secondary]] as const) {
    if (!candidate) continue;
    const slug = processIconNameSearch(candidate);
    if (iconifyLogos.has(slug)) return { kind: "iconify", collection: "logos", slug, via };
    if (iconifyDevicon.has(slug)) return { kind: "iconify", collection: "devicon", slug, via };
  }
  return { kind: "miss" };
}

function resourceSteps(primary: string, secondary: string): string[] {
  const steps: string[] = [];
  if (!primary && !secondary) return ["no input"];
  const tier = resolveResourceTier(primary, secondary);
  steps.push(`tier 1 — bundled lookup on primary "${primary}"${tier.kind === "bundled" && tier.via === "primary" ? " — HIT" : " — miss"}`);
  if (tier.kind === "bundled" && tier.via === "primary") return steps;
  if (secondary) steps.push(`tier 1 — bundled lookup on secondary "${secondary}"${tier.kind === "bundled" && tier.via === "secondary" ? " — HIT" : " — miss"}`);
  if (tier.kind === "bundled") return steps;
  if (tier.kind === "url") { steps.push(`tier 2 — http(s) url -> <img>`); return steps; }
  steps.push(`tier 3 — iconify allowlist`);
  if (tier.kind === "iconify") { steps.push(`HIT in ${tier.collection}: "${tier.slug}" (via ${tier.via})`); return steps; }
  steps.push("no allowlist match — render null");
  return steps;
}

const resourceExamples = [
  {
    title: "Bundled hits",
    desc: "Resolved by the curated SVG set (no network)",
    items: [
      { primary: "Kubernetes::Pod" },
      { primary: "aws-ec2" },
      { primary: "gcp-bigquery-table" },
      { primary: "no-such-thing", secondary: "k8s" },
    ],
  },
  {
    title: "Iconify logos fallback",
    desc: "Bundled miss, slug found in the logos allowlist",
    items: [
      { primary: "datadog" },
      { primary: "snowflake" },
      { primary: "stripe" },
      { primary: "vercel" },
    ],
  },
  {
    title: "Devicon fallback",
    desc: "Bundled miss, only devicon has the slug",
    items: [
      { primary: "aarch64" },
      { primary: "ableton" },
      { primary: "androidstudio" },
    ],
  },
  {
    title: "Misses",
    desc: "Not in any allowlist — renders nothing",
    items: [
      { primary: "totally-fake-icon-zzz" },
      { primary: "" },
    ],
  },
];

function ResourceExamples({ onSelect }: { onSelect: (primary: string, secondary?: string) => void }) {
  return (
    <div className="examples-grid">
      {resourceExamples.map((group) => (
        <div key={group.title} className="example-card">
          <h3>{group.title}</h3>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{group.desc}</div>
          {group.items.map((item, i) => {
            const tier = resolveResourceTier(item.primary, item.secondary || "");
            const wide = isWideName(item.primary, item.secondary);
            return (
              <div key={i} className="example-row" style={{ cursor: "pointer" }}
                onClick={() => onSelect(item.primary, item.secondary)}>
                <ResourceIcon primary={item.primary} secondary={item.secondary}
                  className={wide ? "h-7" : "h-7 max-w-7"} size={28} />
                <span className="name-code">
                  {item.primary || "(empty)"}
                  {item.secondary ? ` / ${item.secondary}` : ""}
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                  {tier.kind === "bundled" && `bundled (${tier.via})`}
                  {tier.kind === "iconify" && `${tier.collection}:${tier.slug}`}
                  {tier.kind === "url" && "url"}
                  {tier.kind === "miss" && "miss"}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ResourcePlayground({ primary, secondary, onChange }: {
  primary: string; secondary: string;
  onChange: (s: { primary: string; secondary: string }) => void;
}) {
  const tier = useMemo(() => resolveResourceTier(primary, secondary), [primary, secondary]);
  const steps = useMemo(() => resourceSteps(primary, secondary), [primary, secondary]);

  let code = "<ResourceIcon";
  if (primary) code += ` primary="${primary}"`;
  if (secondary) code += ` secondary="${secondary}"`;
  code += " />";

  const resolved = tier.kind !== "miss";

  return (
    <div className="card">
      <div className="playground-grid">
        <div>
          <div className="form-group">
            <label>Primary (e.g. config.type)</label>
            <input type="text" value={primary}
              onChange={(e) => onChange({ primary: e.target.value, secondary })}
              placeholder='e.g. Kubernetes::Pod, datadog, aws-ec2' />
          </div>
          <div className="form-group">
            <label>Secondary (e.g. config.config_class)</label>
            <input type="text" value={secondary}
              onChange={(e) => onChange({ primary, secondary: e.target.value })}
              placeholder="e.g. KubernetesResource" />
          </div>
          <div className="code-snippet">{code}</div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 12, lineHeight: 1.6 }}>
            <strong>Resolution order:</strong>
            <ol style={{ paddingLeft: 18, marginTop: 4 }}>
              <li>bundled SVG via <code>findByName(primary)</code></li>
              <li>bundled SVG via <code>findByName(secondary)</code></li>
              <li>http(s) URL → <code>&lt;img&gt;</code></li>
              <li>iconify <code>logos</code> / <code>devicon</code> if slug is in allowlist</li>
            </ol>
          </div>
        </div>
        <div>
          <div className={`preview-area ${resolved ? "resolved" : primary ? "not-found" : ""}`}>
            {primary || secondary ? (() => {
              const wide = isWideName(primary, secondary);
              return (
                <ResourceIcon primary={primary} secondary={secondary} size={64}
                  className={wide ? "h-16" : "h-16 max-w-16"} />
              );
            })() : (
              <span className="preview-label">Enter a primary or secondary value</span>
            )}

            {tier.kind === "bundled" && <span className="preview-label">bundled · {tier.name}</span>}
            {tier.kind === "iconify" && <span className="preview-label">{tier.collection}:{tier.slug}</span>}
            {tier.kind === "url" && <span className="preview-label">url</span>}
            {tier.kind === "miss" && (primary || secondary) && <span className="preview-label">no match</span>}
          </div>
          <div className="resolution-path">
            {steps.map((s, i) => <div key={i}>{i + 1}. {s}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

const allIconNames = Object.keys(IconMap).sort();

const swatchColors = [
  { name: "error", bg: "#ef4444" },
  { name: "success", bg: "#22c55e" },
  { name: "warning", bg: "#f97316" },
  { name: "blue", bg: "#3b82f6" },
  { name: "gray", bg: "#6b7280" },
];

function resolveSteps(name: string, secondary: string): string[] {
  const steps: string[] = [];
  if (!name && !secondary) return ["no input"];
  if (name?.startsWith("http:") || name?.startsWith("https://")) return ["URL detected -> <img> tag"];

  let resolvedName = name;
  let resolvedSecondary = secondary;
  if (name?.includes("::")) {
    const [primary, nested] = name.split("::");
    resolvedName = nested;
    resolvedSecondary = secondary || primary;
    steps.push(`nested: split "${name}" -> name="${nested}", secondary="${resolvedSecondary}"`);
  }

  const normalized = processIconNameSearch(resolvedName);
  if (normalized !== resolvedName) steps.push(`normalize: "${resolvedName}" -> "${normalized}"`);

  const icon = findByName(resolvedName, IconMap);
  if (icon) {
    steps.push(`found: "${normalized}"`);
    return steps;
  }

  steps.push(`"${normalized}" not found in IconMap`);
  if (resolvedSecondary) {
    const secIcon = findByName(resolvedSecondary, IconMap);
    if (secIcon) {
      steps.push(`fallback to secondary: "${resolvedSecondary}" -> found`);
    } else {
      steps.push(`secondary "${resolvedSecondary}" also not found`);
    }
  }
  return steps;
}

function Tabs({ tabs, active, onSelect }: { tabs: string[]; active: string; onSelect: (t: string) => void }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t} className={`tab ${active === t ? "active" : ""}`} onClick={() => onSelect(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

const examples = [
  {
    title: "Direct Names", desc: "Use the SVG filename (without extension)",
    items: [{ name: "aws-ec2" }, { name: "k8s-pod" }, { name: "postgres" }, { name: "grafana" }],
  },
  {
    title: "Aliases", desc: "Common names map to icons",
    items: [
      { name: "kubernetes" }, { name: "aws-s3-bucket" },
      { name: "k8s-certificate" }, { name: "healthy" },
    ],
  },
  {
    title: "Prefix Matching", desc: "Action verbs match to icons",
    items: [
      { name: "createuser" }, { name: "deleteinstance" },
      { name: "downloadarchive" }, { name: "upgradefirmware" },
    ],
  },
  {
    title: "Nested Icons (::)", desc: 'Kubernetes::Namespace resolves "Namespace", falls back to "Kubernetes"',
    items: [
      { name: "Kubernetes::Namespace" }, { name: "Kubernetes::Pod" },
      { name: "AWS::EC2" }, { name: "Azure::VM" },
    ],
  },
  {
    title: "Cloud Provider Normalization", desc: "Prefixes are tried automatically",
    items: [
      { name: "ec2" }, { name: "kubernetes-node" }, { name: "k8-pod" },
    ],
  },
  {
    title: "Semantic Colors", desc: "Named colors map to fill classes",
    items: [
      { name: "check", color: "success" }, { name: "error", color: "error" },
      { name: "warning", color: "warning" }, { name: "heart", color: "blue" },
    ],
  },
  {
    title: "CSS Colors", desc: "Arbitrary CSS color values",
    items: [
      { name: "aws-ec2", color: "#e11d48" }, { name: "k8s", color: "rgb(37,99,235)" },
      { name: "helm", color: "purple" },
    ],
  },
  {
    title: "Secondary Fallback", desc: "If primary is not found, try secondary",
    items: [
      { name: "nonexistent", secondary: "aws-s3" },
      { name: "unknown-thing", secondary: "k8s" },
    ],
  },
  {
    title: "URL Icons", desc: "HTTP(S) URLs render as <img> tags",
    items: [
      { name: "https://cdn.jsdelivr.net/gh/flanksource/flanksource-icons/svg/flanksource.svg" },
    ],
  },
  {
    title: "Wide Logos", desc: "viewBox aspect >= 2:1 — render at natural width (height-driven)",
    items: [
      { name: "mission-control-logo" },
      { name: "claude_logo" },
      { name: "clickhouse_logo" },
      { name: "kong" },
      { name: "velero" },
      { name: "keda-logo" },
    ],
  },
];

const fileTypeExamples = [
  {
    title: "Programming Languages",
    items: ["main.go", "app.py", "lib.rs", "App.java", "main.kt", "hello.scala", "main.swift", "main.c", "main.cpp", "Program.cs", "script.pl", "init.lua", "Main.hs", "main.dart", "app.ex", "server.erl"],
  },
  {
    title: "Config & Data",
    items: ["config.yaml", "data.json", "config.toml", "settings.ini", ".env", "main.tf", "site.xml", "query.sql", "data.csv", "schema.proto", "schema.graphql"],
  },
  {
    title: "Web & Docs",
    items: ["index.html", "style.css", "App.vue", "App.svelte", "index.tsx", "README.md", "report.pdf", "doc.docx", "data.xlsx", "notes.txt"],
  },
  {
    title: "DevOps & Build",
    items: ["Dockerfile", "docker-compose.yml", "Makefile", "Jenkinsfile", "Vagrantfile", "helmfile.yaml", "kustomization.yaml", "deploy.sh", "pom.xml", ".gitignore"],
  },
  {
    title: "Special Files",
    items: ["Cargo.toml", "go.mod", "Gemfile", "Chart.yaml", "values.yaml", "nginx.conf", "LICENSE", "package.json", "tsconfig.json"],
  },
];

function Examples({ onSelect }: { onSelect: (name: string, secondary?: string, color?: string) => void }) {
  return (
    <div className="examples-grid">
      {examples.map((group) => (
        <div key={group.title} className="example-card">
          <h3>{group.title}</h3>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{group.desc}</div>
          {group.items.map((item, i) => {
            const wide = isWideName(item.name, item.secondary);
            return (
              <div key={i} className="example-row" style={{ cursor: "pointer" }}
                onClick={() => onSelect(item.name, item.secondary, item.color)}>
                <Icon name={item.name} secondary={item.secondary} color={item.color}
                  className={wide ? "h-7" : "h-7 max-w-7"}
                  style={wide ? { height: 28 } : { width: 28, height: 28 }} />
                <span className="name-code">
                  {item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name}
                </span>
                {item.color && (
                  <div style={{
                    width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                    background: colorClassMap[item.color] ? getCssColorForClass(colorClassMap[item.color]) : item.color,
                  }} title={item.color} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function getCssColorForClass(cls: string): string {
  const map: Record<string, string> = {
    "fill-red-500": "#ef4444", "fill-green-500": "#22c55e", "fill-orange-500": "#f97316",
    "fill-gray-500": "#6b7280", "fill-blue-500": "#3b82f6",
  };
  return map[cls] || "#888";
}

function FileTypeExamples() {
  return (
    <div className="examples-grid">
      {fileTypeExamples.map((group) => (
        <div key={group.title} className="example-card">
          <h3>{group.title}</h3>
          {group.items.map((filename) => (
            <div key={filename} className="example-row">
              <FileTypeIcon name={filename} className="h-7 max-w-7" style={{ width: 28, height: 28 }} />
              <span className="name-code">{filename}</span>
              <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                {resolveFileTypeIcon(filename)}
              </span>
            </div>
          ))}
        </div>
      ))}
      <div className="example-card">
        <h3>Usage</h3>
        <div className="code-snippet" style={{ fontSize: 12 }}>
          {'import { FileTypeIcon } from "@flanksource/icons/icon";\n\n<FileTypeIcon name="main.go" />\n<FileTypeIcon name="Dockerfile" />\n<FileTypeIcon name="config.yaml" />'}
        </div>
      </div>
    </div>
  );
}

function Browse({ onSelect }: { onSelect: (name: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => allIconNames.filter((n) => n.includes(search.toLowerCase())),
    [search],
  );

  return (
    <div className="card">
      <div className="search-bar">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..." />
        <span id="iconCount">{filtered.length} / {allIconNames.length}</span>
      </div>
      <div className="icons-grid">
        {filtered.map((name) => (
          <div key={name} className="icon-item" onClick={() => onSelect(name)}>
            <Icon name={name} className="h-10 max-w-10" style={{ width: 40, height: 40 }} />
            <div className="icon-name">{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Icons UI (new) ----------------------------------------------------------
// Build a stable list of base names (outline variants without the "Filled"
// suffix). For each base we record whether a Filled twin exists so the
// browser can offer the variant toggle per icon.
type IconsUiEntry = { name: string; outline?: React.FC<any>; filled?: React.FC<any> };
const iconsUiEntries: IconsUiEntry[] = (() => {
  const map = new Map<string, IconsUiEntry>();
  for (const [exportName, fn] of Object.entries(IconsUi)) {
    if (typeof fn !== "function") continue; // skip type-only re-exports
    if (exportName.endsWith("Filled")) {
      const base = exportName.slice(0, -"Filled".length);
      const e = map.get(base) ?? { name: base };
      e.filled = fn as React.FC<any>;
      map.set(base, e);
    } else {
      const e = map.get(exportName) ?? { name: exportName };
      e.outline = fn as React.FC<any>;
      map.set(exportName, e);
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
})();

function IconsUiBrowse({ onSelect }: { onSelect: (name: string) => void }) {
  const [search, setSearch] = useState("");
  const [variant, setVariant] = useState<"outline" | "filled">("outline");
  const filtered = useMemo(
    () =>
      iconsUiEntries.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  return (
    <div className="card">
      <div className="search-bar">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons-ui (UiCheck, UiUpload, UiClass, …)"
        />
        <span id="iconCount">
          {filtered.length} / {iconsUiEntries.length}
        </span>
        <div className="color-swatches" style={{ marginTop: 0 }}>
          {(["outline", "filled"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={`tab ${variant === v ? "active" : ""}`}
              style={{ padding: "4px 12px", fontSize: 12 }}
              onClick={() => setVariant(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 12, lineHeight: 1.5 }}>
        Generated from <code>hack/icon-selections.json</code>. Click any icon to open the
        detail view (variant toggle, color & size controls, copy import + JSX). Outline
        icons use <code>currentColor</code> so <code>className="text-blue-500"</code>{" "}
        works; filled JetBrains expui glyphs keep their brand colors.
      </div>
      <div className="icons-grid">
        {filtered.map((entry) => {
          // Variant fallback: if the user picked "filled" but only outline exists, render
          // the outline rather than nothing — clearer than an empty cell.
          const Comp = variant === "filled" ? entry.filled ?? entry.outline : entry.outline ?? entry.filled;
          if (!Comp) return null;
          const has = entry.outline && entry.filled ? "both" : entry.filled ? "filled-only" : "outline-only";
          return (
            <div
              key={entry.name}
              className="icon-item"
              onClick={() => onSelect(entry.name)}
              title={`${entry.name} (${has}) — click for detail`}
            >
              <Comp width={40} height={40} />
              <div className="icon-name" style={{ fontFamily: "'SF Mono', Monaco, monospace" }}>
                {entry.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Icons UI detail page ----------------------------------------------------
const COLOR_PRESETS: Array<{ label: string; className?: string; css?: string }> = [
  { label: "currentColor", css: "currentColor" },
  { label: "slate", className: "text-slate-700", css: "#334155" },
  { label: "blue", className: "text-blue-500", css: "#3b82f6" },
  { label: "emerald", className: "text-emerald-600", css: "#059669" },
  { label: "amber", className: "text-amber-600", css: "#d97706" },
  { label: "rose", className: "text-rose-500", css: "#f43f5e" },
  { label: "violet", className: "text-violet-600", css: "#7c3aed" },
];

function IconsUiDetail({ name, onBack, onOpen }: { name: string; onBack: () => void; onOpen: (n: string) => void }) {
  const entry = iconsUiEntries.find((e) => e.name === name);
  const [variant, setVariant] = useState<"outline" | "filled">(
    entry?.outline ? "outline" : "filled",
  );
  const [size, setSize] = useState(48);
  const [colorIdx, setColorIdx] = useState(0);
  const [customColor, setCustomColor] = useState("");
  const [title, setTitle] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [svgString, setSvgString] = useState<string>("");
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  // Refresh the raw-SVG view from the live preview after every render. This
  // captures whatever React painted (current variant, size, color), so the
  // copied SVG always matches the on-screen icon.
  React.useEffect(() => {
    const svg = previewRef.current?.querySelector("svg");
    if (!svg) { setSvgString(""); return; }
    // Clone, normalise color to currentColor on the wrapper if a custom color
    // is set so the copied SVG is portable (it'll inherit color from CSS).
    const clone = svg.cloneNode(true) as SVGElement;
    setSvgString(clone.outerHTML);
  });

  if (!entry) {
    return (
      <div className="card">
        <button className="tab" onClick={onBack}>← Back</button>
        <p>Icon not found: <code>{name}</code></p>
      </div>
    );
  }

  const Comp = variant === "filled" ? entry.filled ?? entry.outline : entry.outline ?? entry.filled;
  const altComp = variant === "filled" ? entry.outline : entry.filled;
  if (!Comp) {
    return (
      <div className="card">
        <button className="tab" onClick={onBack}>← Back</button>
        <p>Icon has no renderable variant: <code>{name}</code></p>
      </div>
    );
  }

  const compNameForVariant = variant === "filled"
    ? (entry.filled ? `${entry.name}Filled` : entry.name)
    : entry.name;
  const importedNames = [entry.outline ? entry.name : null, entry.filled ? `${entry.name}Filled` : null]
    .filter(Boolean)
    .join(", ");
  const importLine = `import { ${importedNames} } from "@flanksource/icons-ui";`;

  const colorPreset = COLOR_PRESETS[colorIdx];
  const colorSpec = customColor.trim() || colorPreset.css || "currentColor";
  const className = customColor.trim() ? "" : colorPreset.className ?? "";

  // JSX snippet — only show props that aren't defaults.
  const props: string[] = [];
  if (size !== 16) props.push(`size={${size}}`);
  if (className) props.push(`className="${className}"`);
  if (!className && customColor.trim()) props.push(`style={{ color: "${customColor.trim()}" }}`);
  if (title) props.push(`title="${title}"`);
  const jsxSnippet = `<${compNameForVariant}${props.length ? " " + props.join(" ") : ""} />`;

  const previewStyle: React.CSSProperties = {
    color: colorSpec,
  };

  const copy = (s: string, label: string) => {
    void navigator.clipboard?.writeText(s);
    setCopied(label);
    setTimeout(() => setCopied(null), 1400);
  };

  // Source attribution metadata is attached by the codegen on the underlying
  // function. `Object.assign` preserves the static field.
  const sourceMeta = (Comp as any).__source ?? "(unknown)";

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button className="tab" onClick={onBack} style={{ padding: "6px 14px" }}>← Back to grid</button>
        <h2 style={{ margin: 0, fontFamily: "'SF Mono', Monaco, monospace" }}>{entry.name}</h2>
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            background: "#f3f4f6",
            color: "#6b7280",
            borderRadius: 999,
            fontFamily: "'SF Mono', Monaco, monospace",
          }}
          title={`Upstream: ${sourceMeta}`}
        >
          {sourceMeta}
        </span>
      </div>

      <div className="playground-grid">
        <div>
          <div className="form-group">
            <label>Variant</label>
            <div className="color-swatches">
              {(["outline", "filled"] as const).map((v) => {
                const available = v === "outline" ? !!entry.outline : !!entry.filled;
                return (
                  <button
                    key={v}
                    type="button"
                    className={`tab ${variant === v ? "active" : ""}`}
                    style={{ padding: "4px 12px", fontSize: 12, opacity: available ? 1 : 0.4 }}
                    onClick={() => available && setVariant(v)}
                    disabled={!available}
                    title={available ? `Switch to ${v}` : `${v} variant not available for this icon`}
                  >
                    {v}{!available ? " (n/a)" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-swatches">
              {COLOR_PRESETS.map((c, i) => (
                <div
                  key={c.label}
                  className={`color-swatch ${colorIdx === i && !customColor ? "active" : ""}`}
                  style={{ background: c.css ?? "transparent", border: c.css === "currentColor" ? "2px dashed #999" : undefined }}
                  title={c.label + (c.className ? ` (${c.className})` : "")}
                  onClick={() => { setColorIdx(i); setCustomColor(""); }}
                />
              ))}
            </div>
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="custom CSS color (e.g. #ff0080, hsl(280 80% 50%))"
              style={{ marginTop: 8 }}
            />
          </div>

          <div className="form-group">
            <label>Size: {size}px</label>
            <input
              type="range"
              min={16}
              max={96}
              step={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-group">
            <label>Accessible label (title)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "upload file" — sets role="img" + aria-label'
            />
          </div>

          <div className="form-group">
            <label>Import</label>
            <div className="code-snippet" style={{ position: "relative" }}>
              {importLine}
              <button
                type="button"
                onClick={() => copy(importLine, "import")}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  padding: "2px 8px",
                  fontSize: 11,
                  background: copied === "import" ? "#16a34a" : "#475569",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {copied === "import" ? "✓ copied" : "copy"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>JSX</label>
            <div className="code-snippet" style={{ position: "relative" }}>
              {jsxSnippet}
              <button
                type="button"
                onClick={() => copy(jsxSnippet, "jsx")}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  padding: "2px 8px",
                  fontSize: 11,
                  background: copied === "jsx" ? "#16a34a" : "#475569",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {copied === "jsx" ? "✓ copied" : "copy"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div ref={previewRef} className="preview-area resolved detail-large-preview" style={{ ...previewStyle, padding: 24 }}>
            <Comp width={size} height={size} className={className || undefined} title={title || undefined} />
            <span className="preview-label">{compNameForVariant} @ {size}px</span>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontWeight: 600 }}>Sizes</div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, background: "#fafafa", borderRadius: 6, ...previewStyle }}>
              {[16, 24, 32, 48].map((s) => (
                <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Comp width={s} height={s} className={className || undefined} />
                  <span style={{ fontSize: 10, color: "#888" }}>{s}px</span>
                </div>
              ))}
            </div>
          </div>

          {altComp && (() => {
            const AltComp = altComp;
            return (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontWeight: 600 }}>
                  Other variant ({variant === "filled" ? "outline" : "filled"})
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, background: "#fafafa", borderRadius: 6, ...previewStyle }}>
                  {[16, 24, 32, 48].map((s) => (
                    <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <AltComp width={s} height={s} className={className || undefined} />
                      <span style={{ fontSize: 10, color: "#888" }}>{s}px</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {(() => {
            // Sub-icon variants — find every component in the bundle whose
            // name starts with this entry's name (Ui<Base><Suffix>) but is a
            // longer string. e.g. for UiDatabase we surface UiDatabasePlus,
            // UiDatabaseMinus, etc. Skip the row's own outline/filled twins.
            const variants = iconsUiEntries
              .filter((e) =>
                e.name !== entry.name &&
                e.name.startsWith(entry.name) &&
                // Don't surface the *Filled twin (already shown via the
                // "Other variant" block above).
                e.name !== entry.name + "Filled" &&
                // Don't surface composites of an unrelated base just because
                // of name overlap — only single-suffix children. e.g. for
                // entry "UiUser" we want UiUserPlus but not UiUserCircle
                // (UserCircle is a separate base row).
                /^[A-Z][a-z]+$/.test(e.name.slice(entry.name.length)),
              )
              .sort((a, b) => a.name.localeCompare(b.name));
            if (variants.length === 0) return null;
            return (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontWeight: 600 }}>
                  Sub-icon variants ({variants.length})
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-end", padding: 16, background: "#fafafa", borderRadius: 6, flexWrap: "wrap" }}>
                  {variants.map((v) => {
                    const VComp = v.outline ?? v.filled;
                    if (!VComp) return null;
                    return (
                      <div
                        key={v.name}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", padding: 6, borderRadius: 4 }}
                        onClick={() => onOpen(v.name)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#eef2ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title={`Click to open ${v.name}`}
                      >
                        <VComp width={32} height={32} />
                        <span style={{ fontSize: 11, color: "#374151", fontFamily: "'SF Mono', Monaco, monospace" }}>
                          {v.name.slice(entry.name.length)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Raw SVG ({svgString.length} bytes)</span>
              <button
                type="button"
                onClick={() => copy(svgString, "svg")}
                disabled={!svgString}
                style={{
                  padding: "2px 10px",
                  fontSize: 11,
                  background: copied === "svg" ? "#16a34a" : "#475569",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: svgString ? "pointer" : "not-allowed",
                  opacity: svgString ? 1 : 0.5,
                }}
              >
                {copied === "svg" ? "✓ copied" : "copy SVG"}
              </button>
            </div>
            <pre
              style={{
                fontSize: 11,
                fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace",
                background: "#0f172a",
                color: "#e2e8f0",
                padding: 12,
                borderRadius: 4,
                overflowX: "auto",
                maxHeight: 240,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                margin: 0,
              }}
            >
              {svgString || <span style={{ color: "#94a3b8" }}>(rendering…)</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function LlmUsage() {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>LLM Usage</h2>
      <p style={{ color: "#555", lineHeight: 1.6 }}>
        Use <a href="llm.txt" target="_blank" rel="noopener noreferrer">llm.txt</a>{" "}
        for copy-ready examples and complete generated listings of{" "}
        <code>@flanksource/icons</code> names and <code>@flanksource/icons-ui</code>{" "}
        components.
      </p>

      <div className="examples-grid" style={{ marginTop: 16 }}>
        <div className="example-card">
          <h3>Icon names</h3>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 8 }}>
            Prefer exact names from the generated list. The demo currently exposes{" "}
            {allIconNames.length} bundled SVG icons.
          </div>
          <div className="code-snippet" style={{ fontSize: 12 }}>
            {'import { Icon } from "@flanksource/icons/icon";\n\n<Icon name="aws-ec2" className="h-6 max-w-6" />\n<Icon name="k8s-pod" color="blue" />'}
          </div>
        </div>

        <div className="example-card">
          <h3>Runtime resources</h3>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 8 }}>
            Use ResourceIcon when the name comes from provider, resource type, service, or config data.
          </div>
          <div className="code-snippet" style={{ fontSize: 12 }}>
            {'import { ResourceIcon } from "@flanksource/icons/icon";\n\n<ResourceIcon primary="Kubernetes::Pod" secondary="KubernetesResource" />\n<ResourceIcon primary="datadog" />'}
          </div>
        </div>

        <div className="example-card">
          <h3>File types</h3>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 8 }}>
            Use FileTypeIcon for filenames and extensions instead of guessing icon names.
          </div>
          <div className="code-snippet" style={{ fontSize: 12 }}>
            {'import { FileTypeIcon } from "@flanksource/icons/icon";\n\n<FileTypeIcon name="config.yaml" />\n<FileTypeIcon name="main.go" />'}
          </div>
        </div>

        <div className="example-card">
          <h3>UI components</h3>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 8 }}>
            Use the {iconsUiEntries.length} generated React components for interface controls and states.
          </div>
          <div className="code-snippet" style={{ fontSize: 12 }}>
            {'import { UiCheck, UiSearch, UiUpload } from "@flanksource/icons-ui";\n\n<UiSearch size={16} className="text-slate-700" />\n<UiCheck size={16} className="text-emerald-600" />\n<UiUpload size={16} />'}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState("Icon Playground");
  const [pgState, setPgState] = useState({ name: "aws-ec2", secondary: "", color: "", square: "auto" as "auto" | "true" | "false" });
  const [resState, setResState] = useState({ primary: "Kubernetes::Pod", secondary: "" });
  const [iconsUiDetail, setIconsUiDetail] = useState<string | null>(null);

  const switchToPlayground = (name: string, secondary?: string, color?: string) => {
    setPgState({ name, secondary: secondary || "", color: color || "", square: "auto" });
    setTab("Icon Playground");
  };

  const switchToResource = (primary: string, secondary?: string) => {
    setResState({ primary, secondary: secondary || "" });
    setTab("Resource Icons");
  };

  return (
    <>
      <h1>Flanksource Icons</h1>
      <p className="subtitle">
        ~{allIconNames.length} curated icons in <code>@flanksource/icons</code>{" "}
        + {iconsUiEntries.length} curated React components in{" "}
        <code>@flanksource/icons-ui</code> &mdash;{" "}
        <a href="https://github.com/flanksource/flanksource-icons">GitHub</a>{" "}
        &middot; <a href="llm.txt">llm.txt</a>
      </p>
      <Tabs
        tabs={[
          "Icon Playground",
          "Resource Icons",
          "Examples",
          "File Types",
          "Browse All",
          `Icons UI (${iconsUiEntries.length})`,
          "LLM Usage",
        ]}
        active={tab}
        onSelect={setTab}
      />
      {tab === "Icon Playground" && <PlaygroundControlled {...pgState} onChange={setPgState} />}
      {tab === "Resource Icons" && (
        <>
          <ResourcePlayground {...resState} onChange={setResState} />
          <ResourceExamples onSelect={switchToResource} />
        </>
      )}
      {tab === "Examples" && <Examples onSelect={switchToPlayground} />}
      {tab === "File Types" && <FileTypeExamples />}
      {tab === "Browse All" && <Browse onSelect={(name) => switchToPlayground(name)} />}
      {tab === "LLM Usage" && <LlmUsage />}
      {tab.startsWith("Icons UI") && (
        iconsUiDetail
          ? <IconsUiDetail name={iconsUiDetail} onBack={() => setIconsUiDetail(null)} onOpen={(n) => setIconsUiDetail(n)} />
          : <IconsUiBrowse onSelect={(name) => setIconsUiDetail(name)} />
      )}
    </>
  );
}

function PlaygroundControlled({ name, secondary, color, square, onChange }: {
  name: string; secondary: string; color: string; square: "auto" | "true" | "false";
  onChange: (s: { name: string; secondary: string; color: string; square: "auto" | "true" | "false" }) => void;
}) {
  const [cls, setCls] = useState("");
  const squareProp: boolean | undefined =
    square === "true" ? true : square === "false" ? false : undefined;
  const autoWide = isWideName(name, secondary);
  const renderingWide = squareProp === false || (squareProp === undefined && autoWide);
  // When the icon is rendering aspect-preserving, only constrain height — letting
  // width be intrinsic. Otherwise constrain both so the preview shows a square box.
  const previewStyle: React.CSSProperties =
    renderingWide ? { height: 64 } : { width: 64, height: 64 };
  const displayClass = cls || (renderingWide ? "h-16" : "h-6 max-w-6");
  const steps = useMemo(() => resolveSteps(name, secondary), [name, secondary]);

  let code = "<Icon";
  if (name) code += ` name="${name}"`;
  if (secondary) code += ` secondary="${secondary}"`;
  if (color) code += ` color="${color}"`;
  if (squareProp !== undefined) code += ` square={${squareProp}}`;
  if (cls) code += ` className="${cls}"`;
  code += " />";

  const hasIcon = name && (findByName(name, IconMap) || findByName(secondary, IconMap) ||
    name.startsWith("http:") || name.startsWith("https://"));

  return (
    <div className="card">
      <div className="playground-grid">
        <div>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name}
              onChange={(e) => onChange({ name: e.target.value, secondary, color, square })}
              placeholder='e.g. aws-ec2, Kubernetes::Namespace, kubernetes' />
          </div>
          <div className="form-group">
            <label>Secondary (fallback)</label>
            <input type="text" value={secondary}
              onChange={(e) => onChange({ name, secondary: e.target.value, color, square })}
              placeholder="e.g. k8s" />
          </div>
          <div className="form-group">
            <label>Color</label>
            <input type="text" value={color}
              onChange={(e) => onChange({ name, secondary, color: e.target.value, square })}
              placeholder='e.g. error, success, #ff0000, blue' />
            <div className="color-swatches">
              {swatchColors.map((c) => (
                <div key={c.name} className={`color-swatch ${color === c.name ? "active" : ""}`}
                  style={{ background: c.bg }} title={c.name}
                  onClick={() => onChange({ name, secondary, color: c.name, square })} />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Square</label>
            <div className="color-swatches">
              {(["auto", "true", "false"] as const).map((opt) => (
                <button key={opt}
                  className={`tab ${square === opt ? "active" : ""}`}
                  style={{ padding: "4px 10px", fontSize: 12 }}
                  onClick={() => onChange({ name, secondary, color, square: opt })}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>CSS Class</label>
            <input type="text" value={cls} onChange={(e) => setCls(e.target.value)}
              placeholder="e.g. h-6 max-w-6 (default)" />
          </div>
          <div className="code-snippet">{code}</div>
        </div>
        <div>
          <div className={`preview-area ${hasIcon ? "resolved" : name ? "not-found" : ""}`}>
            {name ? (
              <Icon name={name} secondary={secondary} color={color} square={squareProp}
                className={displayClass} style={previewStyle} />
            ) : (
              <span className="preview-label">Enter an icon name</span>
            )}
            {hasIcon && <span className="preview-label">{name}</span>}
            {!hasIcon && name && <span className="preview-label">Icon not found</span>}
          </div>
          <div className="resolution-path">
            {steps.map((s, i) => <div key={i}>{i + 1}. {s}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
