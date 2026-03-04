import React, { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Icon, aliases, prefixes, colorClassMap, processIconNameSearch, findByName } from "./Icon";
import { IconMap } from "@flanksource/icons/mi";
import type { IconType } from "./iconBase";

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
];

function Examples({ onSelect }: { onSelect: (name: string, secondary?: string, color?: string) => void }) {
  return (
    <div className="examples-grid">
      {examples.map((group) => (
        <div key={group.title} className="example-card">
          <h3>{group.title}</h3>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{group.desc}</div>
          {group.items.map((item, i) => (
            <div key={i} className="example-row" style={{ cursor: "pointer" }}
              onClick={() => onSelect(item.name, item.secondary, item.color)}>
              <Icon name={item.name} secondary={item.secondary} color={item.color}
                className="h-7 max-w-7" style={{ width: 28, height: 28 }} />
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
          ))}
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

function App() {
  const [tab, setTab] = useState("Icon Playground");
  const [pgState, setPgState] = useState({ name: "aws-ec2", secondary: "", color: "" });

  const switchToPlayground = (name: string, secondary?: string, color?: string) => {
    setPgState({ name, secondary: secondary || "", color: color || "" });
    setTab("Icon Playground");
  };

  return (
    <>
      <h1>Flanksource Icons</h1>
      <p className="subtitle">
        ~{allIconNames.length} curated SVG icons for cloud infrastructure &mdash;{" "}
        <a href="https://github.com/flanksource/flanksource-icons">GitHub</a>
      </p>
      <Tabs tabs={["Icon Playground", "Examples", "Browse All"]} active={tab} onSelect={setTab} />
      {tab === "Icon Playground" && <PlaygroundControlled {...pgState} onChange={setPgState} />}
      {tab === "Examples" && <Examples onSelect={switchToPlayground} />}
      {tab === "Browse All" && <Browse onSelect={(name) => switchToPlayground(name)} />}
    </>
  );
}

function PlaygroundControlled({ name, secondary, color, onChange }: {
  name: string; secondary: string; color: string;
  onChange: (s: { name: string; secondary: string; color: string }) => void;
}) {
  const [cls, setCls] = useState("");
  const displayClass = cls || "h-6 max-w-6";
  const steps = useMemo(() => resolveSteps(name, secondary), [name, secondary]);

  let code = "<Icon";
  if (name) code += ` name="${name}"`;
  if (secondary) code += ` secondary="${secondary}"`;
  if (color) code += ` color="${color}"`;
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
              onChange={(e) => onChange({ name: e.target.value, secondary, color })}
              placeholder='e.g. aws-ec2, Kubernetes::Namespace, kubernetes' />
          </div>
          <div className="form-group">
            <label>Secondary (fallback)</label>
            <input type="text" value={secondary}
              onChange={(e) => onChange({ name, secondary: e.target.value, color })}
              placeholder="e.g. k8s" />
          </div>
          <div className="form-group">
            <label>Color</label>
            <input type="text" value={color}
              onChange={(e) => onChange({ name, secondary, color: e.target.value })}
              placeholder='e.g. error, success, #ff0000, blue' />
            <div className="color-swatches">
              {swatchColors.map((c) => (
                <div key={c.name} className={`color-swatch ${color === c.name ? "active" : ""}`}
                  style={{ background: c.bg }} title={c.name}
                  onClick={() => onChange({ name, secondary, color: c.name })} />
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
              <Icon name={name} secondary={secondary} color={color} className={displayClass}
                style={{ width: 64, height: 64 }} />
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
