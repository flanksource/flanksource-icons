import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgDir = join(repoRoot, "svg");

type Status = "NEW" | "EXISTS" | "ALIAS";

type Group =
  | "ui-controls"
  | "navigation"
  | "layout-dashboard"
  | "forms-editing"
  | "health-status"
  | "approval-review"
  | "security-auth"
  | "severity"
  | "insight"
  | "change-types"
  | "trees-lists-tables"
  | "data-analytics"
  | "playbooks-workflows"
  | "runtime-process"
  | "configs-metadata"
  | "uir-ast-code"
  | "uir-sql"
  | "files-code"
  | "git-source-control"
  | "dev-tools"
  | "ai-ml"
  | "infrastructure"
  | "actions-tools"
  | "people-orgs"
  | "time"
  | "communication"
  | "media"
  | "misc";

const GROUP_LABELS: Record<Group, string> = {
  "ui-controls": "UI controls (chevrons, close, ellipsis, search)",
  navigation: "Navigation",
  "layout-dashboard": "Layout & dashboard",
  "forms-editing": "Forms & editing",
  "health-status": "Health & status",
  "approval-review": "Approval & review",
  "security-auth": "Security & auth",
  severity: "Severity (flanksource-ui ConfigChangeSeverity)",
  insight: "Insight types (flanksource-ui ConfigInsightsIcon)",
  "change-types": "Change types (duty/types/config_changes.go)",
  "trees-lists-tables": "Trees, lists & tables",
  "data-analytics": "Data & analytics",
  "playbooks-workflows": "Playbooks & workflows",
  "runtime-process": "Runtime & process",
  "configs-metadata": "Configs & metadata",
  "uir-ast-code": "UIR / AST — code (arch-unit)",
  "uir-sql": "UIR / AST — SQL (oipa-cli)",
  "files-code": "Files & code",
  "git-source-control": "Git & source control",
  "dev-tools": "Dev tools & terminal",
  "ai-ml": "AI & ML",
  infrastructure: "Infrastructure (servers, db, cloud, network)",
  "actions-tools": "Actions & tools",
  "people-orgs": "People & orgs",
  time: "Time",
  communication: "Communication & notifications",
  media: "Media",
  misc: "Misc",
};

const GROUP_ORDER: Group[] = [
  "ui-controls",
  "navigation",
  "layout-dashboard",
  "forms-editing",
  "health-status",
  "approval-review",
  "security-auth",
  "severity",
  "insight",
  "change-types",
  "trees-lists-tables",
  "data-analytics",
  "playbooks-workflows",
  "runtime-process",
  "configs-metadata",
  "uir-ast-code",
  "uir-sql",
  "files-code",
  "git-source-control",
  "dev-tools",
  "ai-ml",
  "infrastructure",
  "actions-tools",
  "people-orgs",
  "time",
  "communication",
  "media",
  "misc",
];

type Row = {
  consumerName: string;
  filename: string;
  phosphorName: string;
  status: Status;
  group: Group;
  usedIn: string;
  currentIcons: string[];
  /**
   * Optional alternate candidates from other Iconify collections (or icons8)
   * shown next to the Phosphor preview so reviewers can compare. Format:
   * "prefix:name" (matches Iconify CDN URL: /<prefix>/<name>.svg).
   */
  alternates?: string[];
  incumbentSvg?: string;
  notes: string;
};

const rows: Row[] = [
  // ---- UI controls ----
  { consumerName: "chevron-down", filename: "chevron-down.svg", phosphorName: "caret-down", status: "NEW", group: "ui-controls", usedIn: "clicky-ui (8x), gavel (3x)", currentIcons: ["codicon:chevron-down", "lucide:chevron-down"], notes: "outline only — never use Fill weight; alias caret-down" },
  { consumerName: "chevron-right", filename: "chevron-right.svg", phosphorName: "caret-right", status: "NEW", group: "ui-controls", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:chevron-right"], notes: "outline only — never use Fill weight; alias caret-right" },
  { consumerName: "chevron-up", filename: "chevron-up.svg", phosphorName: "caret-up", status: "NEW", group: "ui-controls", usedIn: "clicky-ui (4x)", currentIcons: ["codicon:chevron-up"], notes: "outline only — never use Fill weight; alias caret-up" },
  { consumerName: "close", filename: "close.svg", phosphorName: "x", status: "NEW", group: "ui-controls", usedIn: "clicky-ui, scraper UI", currentIcons: ["codicon:close"], notes: "outline only; alias x, x-thin" },
  { consumerName: "ellipsis", filename: "ellipsis.svg", phosphorName: "dots-three", status: "NEW", group: "ui-controls", usedIn: "clicky-ui", currentIcons: ["codicon:ellipsis"], notes: "outline only — never use Fill weight" },
  { consumerName: "collapse-all", filename: "collapse-all.svg", phosphorName: "arrows-in-simple", status: "NEW", group: "ui-controls", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:collapse-all"], notes: "Phosphor: arrows-in-simple (closest match — outline only)" },
  { consumerName: "expand-all", filename: "expand-all.svg", phosphorName: "arrows-out-simple", status: "NEW", group: "ui-controls", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:expand-all"], notes: "Phosphor: arrows-out-simple (closest match — outline only)" },
  { consumerName: "search", filename: "search.svg", phosphorName: "magnifying-glass", status: "EXISTS", group: "ui-controls", usedIn: "clicky-ui, gavel, scraper UI, flanksource-ui", currentIcons: ["codicon:search"], alternates: ["ph:magnifying-glass-bold", "tabler:zoom-filled", "mdi:magnify", "fluent:search-24-filled", "carbon:search"], notes: "Phosphor: magnifying-glass; reskin in place. Filled variants: ph:magnifying-glass-bold (heavier outline), tabler:zoom-filled, mdi:magnify (solid)." },
  { consumerName: "filter", filename: "filter.svg", phosphorName: "funnel", status: "EXISTS", group: "ui-controls", usedIn: "flanksource-ui", currentIcons: [], notes: "Phosphor: funnel; reskin in place" },
  { consumerName: "add", filename: "add.svg", phosphorName: "plus-circle", status: "EXISTS", group: "ui-controls", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:add"], notes: "Phosphor: plus-circle (circle, not square)" },
  { consumerName: "remove", filename: "remove.svg", phosphorName: "minus-circle", status: "EXISTS", group: "ui-controls", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:remove"], notes: "Phosphor: minus-circle (circle, not square)" },
  { consumerName: "eye", filename: "eye.svg", phosphorName: "eye", status: "NEW", group: "ui-controls", usedIn: "gavel", currentIcons: ["codicon:eye"], notes: "alias preview" },
  { consumerName: "eye-closed", filename: "eye-closed.svg", phosphorName: "eye-slash", status: "NEW", group: "ui-controls", usedIn: "gavel", currentIcons: ["codicon:eye-closed"], notes: "Phosphor: eye-slash" },
  { consumerName: "x -> close", filename: "(alias)", phosphorName: "x", status: "ALIAS", group: "ui-controls", usedIn: "any phosphor consumer", currentIcons: [], notes: "alias x, x-thin" },
  { consumerName: "caret-down -> chevron-down", filename: "(alias)", phosphorName: "caret-down", status: "ALIAS", group: "ui-controls", usedIn: "any phosphor consumer", currentIcons: [], notes: "alias entry only" },
  { consumerName: "magnifying-glass -> search", filename: "(alias)", phosphorName: "magnifying-glass", status: "ALIAS", group: "ui-controls", usedIn: "any phosphor consumer", currentIcons: [], alternates: ["ph:magnifying-glass-bold", "tabler:zoom-filled", "mdi:magnify", "fluent:search-24-filled", "carbon:search"], notes: "Alias of search. Filled variant alternatives if ph:magnifying-glass-fill reads too thin: ph:magnifying-glass-bold, tabler:zoom-filled, mdi:magnify (solid)." },
  { consumerName: "funnel -> filter", filename: "(alias)", phosphorName: "funnel", status: "ALIAS", group: "ui-controls", usedIn: "any phosphor consumer", currentIcons: [], notes: "alias entry only" },

  // ---- Navigation ----
  { consumerName: "arrow-left", filename: "arrow-left.svg", phosphorName: "arrow-left", status: "NEW", group: "navigation", usedIn: "gavel", currentIcons: ["codicon:arrow-left"], notes: "outline only — never use Fill weight" },
  { consumerName: "link", filename: "link.svg", phosphorName: "link", status: "EXISTS", group: "navigation", usedIn: "scraper UI", currentIcons: ["codicon:link"], notes: "outline only — never use Fill weight" },
  { consumerName: "link-external", filename: "link-external.svg", phosphorName: "arrow-square-out", status: "NEW", group: "navigation", usedIn: "gavel (5x)", currentIcons: ["codicon:link-external"], notes: "outline only — never use Fill weight; Phosphor: arrow-square-out" },
  { consumerName: "globe", filename: "globe.svg", phosphorName: "globe", status: "EXISTS", group: "navigation", usedIn: "gavel, scraper UI", currentIcons: ["codicon:globe"], notes: "incumbent is globe1.svg; rename to globe.svg + reskin" },
  { consumerName: "location", filename: "location.svg", phosphorName: "map-pin", status: "NEW", group: "navigation", usedIn: "scraper UI", currentIcons: ["codicon:location"], notes: "Phosphor: map-pin" },
  { consumerName: "route", filename: "route.svg", phosphorName: "path", status: "NEW", group: "navigation", usedIn: "clicky-ui", currentIcons: ["lucide:route"], notes: "Phosphor: path" },

  // ---- Health & status ----
  { consumerName: "warning-circle", filename: "warning-circle.svg", phosphorName: "warning-circle", status: "EXISTS", group: "health-status", usedIn: "facet (3x), gavel (5x)", currentIcons: ["codicon:warning", "ion:alert-circle-outline"], notes: "reskin candidate" },
  { consumerName: "warning-triangle", filename: "warning-triangle.svg", phosphorName: "warning", status: "NEW", group: "health-status", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:warning", "lucide:triangle-alert"], notes: "Phosphor: warning (triangle)" },
  { consumerName: "error", filename: "error.svg", phosphorName: "x-circle", status: "EXISTS", group: "health-status", usedIn: "clicky-ui (5x), gavel, scraper UI (5x)", currentIcons: ["codicon:error"], notes: "Phosphor: x-circle (or warning); reskin in place" },
  { consumerName: "circle-x", filename: "circle-x.svg", phosphorName: "x-circle", status: "NEW", group: "health-status", usedIn: "clicky-ui", currentIcons: ["lucide:circle-x"], notes: "Phosphor: x-circle" },
  { consumerName: "info", filename: "info.svg", phosphorName: "info", status: "EXISTS", group: "health-status", usedIn: "clicky-ui", currentIcons: ["codicon:info", "lucide:info"], notes: "reskin candidate" },
  { consumerName: "question", filename: "question.svg", phosphorName: "question", status: "EXISTS", group: "health-status", usedIn: "clicky-ui", currentIcons: ["codicon:question"], notes: "reskin candidate" },
  { consumerName: "circle-outline", filename: "circle-outline.svg", phosphorName: "circle", status: "NEW", group: "health-status", usedIn: "clicky-ui, scraper UI (3x)", currentIcons: ["codicon:circle-outline"], notes: "MAINTAIN as separate from circle-filled — uses Light weight" },
  { consumerName: "circle-filled", filename: "circle-filled.svg", phosphorName: "circle", status: "NEW", group: "health-status", usedIn: "clicky-ui", currentIcons: ["codicon:circle-filled"], notes: "MAINTAIN as separate from circle-outline — uses Fill weight" },
  { consumerName: "pulse", filename: "pulse.svg", phosphorName: "pulse", status: "NEW", group: "health-status", usedIn: "gavel, clicky-ui", currentIcons: ["codicon:pulse", "lucide:activity"], notes: "" },
  { consumerName: "lightbulb", filename: "lightbulb.svg", phosphorName: "lightbulb", status: "NEW", group: "health-status", usedIn: "gavel", currentIcons: ["codicon:lightbulb"], notes: "" },
  { consumerName: "debug", filename: "debug-stop.svg", phosphorName: "bug", status: "NEW", group: "health-status", usedIn: "gavel", currentIcons: ["codicon:debug-stop", "codicon:debug-alt", "codicon:debug-restart", "codicon:debug-step-over", "codicon:debug-alt-small"], notes: "Phosphor: bug — single glyph for all debug-* variants" },

  // ---- Approval & review ----
  { consumerName: "check", filename: "check.svg", phosphorName: "check", status: "EXISTS", group: "approval-review", usedIn: "clicky-ui (4x codicon + 9x lucide), gavel (5x), flanksource-ui", currentIcons: ["codicon:check", "lucide:check", "ph:check-thin"], notes: "incumbent is filled; rename incumbent->check-filled.svg, new ph-light at check.svg" },
  { consumerName: "check-thin -> check", filename: "(alias)", phosphorName: "check", status: "ALIAS", group: "approval-review", usedIn: "clicky-ui (ph:check-thin)", currentIcons: ["ph:check-thin"], notes: "alias" },
  { consumerName: "pass", filename: "pass.svg", phosphorName: "check-circle", status: "EXISTS", group: "approval-review", usedIn: "clicky-ui, scraper UI (3x)", currentIcons: ["codicon:pass", "codicon:pass-filled"], notes: "Phosphor: check-circle (circle — never check-square)" },
  { consumerName: "shield-check", filename: "shield-check.svg", phosphorName: "shield-check", status: "EXISTS", group: "approval-review", usedIn: "clicky-ui (3x)", currentIcons: ["lucide:shield-check"], notes: "reskin candidate" },
  { consumerName: "star", filename: "star.svg", phosphorName: "star", status: "EXISTS", group: "approval-review", usedIn: "clicky-ui", currentIcons: ["codicon:star"], notes: "reskin candidate" },
  { consumerName: "lock", filename: "lock.svg", phosphorName: "lock", status: "EXISTS", group: "approval-review", usedIn: "clicky-ui", currentIcons: ["codicon:lock", "lucide:lock"], notes: "reskin candidate" },

  // ---- Trees, lists, tables ----
  { consumerName: "list-flat", filename: "list-flat.svg", phosphorName: "list", status: "NEW", group: "trees-lists-tables", usedIn: "clicky-ui", currentIcons: ["codicon:list-flat"], notes: "Phosphor: list" },
  { consumerName: "list-tree", filename: "list-tree.svg", phosphorName: "tree-structure", status: "NEW", group: "trees-lists-tables", usedIn: "gavel, scraper UI", currentIcons: ["codicon:list-tree", "codicon:type-hierarchy"], notes: "shared with type-hierarchy" },
  { consumerName: "table", filename: "table.svg", phosphorName: "table", status: "NEW", group: "trees-lists-tables", usedIn: "clicky-ui", currentIcons: ["codicon:table"], notes: "" },
  { consumerName: "graph", filename: "graph.svg", phosphorName: "chart-line", status: "NEW", group: "trees-lists-tables", usedIn: "clicky-ui", currentIcons: ["codicon:graph"], notes: "Phosphor: chart-line" },
  { consumerName: "boxes", filename: "boxes.svg", phosphorName: "stack", status: "NEW", group: "trees-lists-tables", usedIn: "clicky-ui", currentIcons: ["lucide:boxes"], notes: "Phosphor: stack" },
  { consumerName: "inbox", filename: "inbox.svg", phosphorName: "tray", status: "NEW", group: "trees-lists-tables", usedIn: "clicky-ui", currentIcons: ["codicon:inbox"], notes: "Phosphor: tray" },

  // ---- Playbooks & workflows ----
  { consumerName: "playbook", filename: "playbook.svg", phosphorName: "book-open-text", status: "EXISTS", group: "playbooks-workflows", usedIn: "flanksource-ui (3x)", currentIcons: [], notes: "reskin candidate" },
  { consumerName: "workflow", filename: "workflow.svg", phosphorName: "flow-arrow", status: "EXISTS", group: "playbooks-workflows", usedIn: "flanksource-ui (2x)", currentIcons: [], notes: "Phosphor: flow-arrow; reskin candidate" },
  { consumerName: "rocket", filename: "rocket.svg", phosphorName: "rocket-launch", status: "EXISTS", group: "playbooks-workflows", usedIn: "clicky-ui", currentIcons: ["lucide:rocket"], notes: "Phosphor: rocket-launch; reskin candidate" },
  { consumerName: "ship-wheel", filename: "ship-wheel.svg", phosphorName: "steering-wheel", status: "NEW", group: "playbooks-workflows", usedIn: "clicky-ui", currentIcons: ["lucide:ship-wheel"], alternates: ["ph:steering-wheel-thin", "ph:wrench-thin", "solar:wheel-angle-linear"], notes: "Lucide is 2px. Thinner: ph:steering-wheel-thin (1px). solar:wheel-angle-linear is a clean alt thin set." },
  { consumerName: "zap", filename: "zap.svg", phosphorName: "lightning", status: "NEW", group: "playbooks-workflows", usedIn: "clicky-ui", currentIcons: ["lucide:zap"], notes: "Phosphor: lightning" },

  // ---- Configs & metadata ----
  { consumerName: "config", filename: "config.svg", phosphorName: "gear", status: "EXISTS", group: "configs-metadata", usedIn: "flanksource-ui", currentIcons: [], notes: "reskin candidate" },
  { consumerName: "tag", filename: "tag.svg", phosphorName: "tag", status: "NEW", group: "configs-metadata", usedIn: "common metadata glyph", currentIcons: [], notes: "useful generic metadata icon" },

  // ---- UIR/AST — code (arch-unit + LSP/codicon symbol-*) — distinctive icons per type ----
  // arch-unit emits 5 raw kinds (package/type/method/field/variable) plus UI-facing class/interface/struct/record/endpoint/module.
  // Each gets a distinct primary icon + 2 alternates so reviewers can pick the most legible.

  // Container/scope-level
  { consumerName: "uir-package", filename: "uir-package.svg", phosphorName: "package", status: "NEW", group: "uir-ast-code", usedIn: "arch-unit (package)", currentIcons: ["codicon:package", "lucide:package"], alternates: ["tabler:package", "mdi:package-variant"], notes: "Top-level module/package container. arch-unit currently uses Lucide Package (amber)." },
  { consumerName: "uir-namespace", filename: "uir-namespace.svg", phosphorName: "stack-simple", status: "NEW", group: "uir-ast-code", usedIn: "logical (C#/C++/PHP)", currentIcons: ["codicon:symbol-namespace"], alternates: ["tabler:braces", "mdi:code-tags"], notes: "Logical sub-package / namespace under a package." },
  { consumerName: "uir-module", filename: "uir-module.svg", phosphorName: "stack", status: "ALIAS", group: "uir-ast-code", usedIn: "arch-unit (module alias)", currentIcons: ["codicon:symbol-module"], alternates: [], notes: "alias of uir-namespace" },
  { consumerName: "uir-import", filename: "uir-import.svg", phosphorName: "sign-in", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: [], alternates: ["ph:arrow-square-in-light", "ph:tray-arrow-down-light", "ph:file-arrow-down-light", "tabler:file-import", "mdi:import"], notes: "import / use / require statement — Phosphor sign-in (entering scope), or tray-arrow-down for 'into the package'" },
  { consumerName: "uir-export", filename: "uir-export.svg", phosphorName: "arrow-elbow-up-right", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: [], alternates: ["tabler:arrow-bar-to-up", "mdi:export"], notes: "export / public binding" },

  // Type-shaped declarations — three different cubes so the family reads as related but distinct
  { consumerName: "uir-class", filename: "uir-class.svg", phosphorName: "cube", status: "NEW", group: "uir-ast-code", usedIn: "arch-unit (type:class)", currentIcons: ["codicon:symbol-class", "lucide:box"], alternates: ["tabler:cube", "mdi:cube-outline"], notes: "Class. arch-unit currently uses Lucide Box (sky)." },
  { consumerName: "uir-struct", filename: "uir-struct.svg", phosphorName: "cube-focus", status: "NEW", group: "uir-ast-code", usedIn: "logical (Go/Rust/C++)", currentIcons: ["lucide:braces"], alternates: ["tabler:cube-3d-sphere", "mdi:cube-scan"], notes: "Struct / record-like value type." },
  { consumerName: "uir-interface", filename: "uir-interface.svg", phosphorName: "cube-transparent", status: "NEW", group: "uir-ast-code", usedIn: "logical (Go/Java/TS)", currentIcons: ["codicon:symbol-interface"], alternates: ["tabler:components", "mdi:shape-outline"], notes: "Interface / trait / protocol — abstract type contract." },
  { consumerName: "uir-trait", filename: "uir-trait.svg", phosphorName: "puzzle-piece", status: "NEW", group: "uir-ast-code", usedIn: "logical (Rust/Scala)", currentIcons: [], alternates: ["tabler:puzzle", "mdi:puzzle-outline"], notes: "Rust/Scala trait — distinct from interface." },
  { consumerName: "uir-record", filename: "uir-record.svg", phosphorName: "rows", status: "NEW", group: "uir-ast-code", usedIn: "arch-unit (type:record)", currentIcons: ["lucide:braces"], alternates: ["tabler:list-details", "mdi:table-row"], notes: "Record / data class. arch-unit currently uses Lucide Braces (orange)." },
  { consumerName: "uir-type-alias", filename: "uir-type-alias.svg", phosphorName: "equals", status: "NEW", group: "uir-ast-code", usedIn: "logical (TS/Rust)", currentIcons: [], alternates: ["tabler:equal", "mdi:equal"], notes: "type Foo = Bar — alias only" },
  { consumerName: "uir-enum", filename: "uir-enum.svg", phosphorName: "list-bullets", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-enum"], alternates: ["tabler:list-letters", "mdi:format-list-bulleted-type"], notes: "Enum type" },
  { consumerName: "uir-enum-member", filename: "uir-enum-member.svg", phosphorName: "list-checks", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-enum-member"], alternates: ["tabler:list-check", "mdi:format-list-checks"], notes: "Single enum variant" },
  { consumerName: "uir-type-parameter", filename: "uir-type-parameter.svg", phosphorName: "brackets-angle", status: "NEW", group: "uir-ast-code", usedIn: "logical (TS/Java/Rust generics)", currentIcons: ["codicon:symbol-type-parameter"], alternates: ["tabler:brackets-angle", "mdi:code-greater-than"], notes: "Generic / type parameter — <T>" },

  // Callables
  { consumerName: "uir-function", filename: "uir-function.svg", phosphorName: "function", status: "NEW", group: "uir-ast-code", usedIn: "arch-unit (method)", currentIcons: ["codicon:symbol-function", "lucide:function-square"], alternates: ["tabler:math-function", "mdi:function-variant"], notes: "Free function. arch-unit currently uses Lucide FunctionSquare (violet)." },
  { consumerName: "uir-method", filename: "uir-method.svg", phosphorName: "function", status: "ALIAS", group: "uir-ast-code", usedIn: "arch-unit (method)", currentIcons: ["codicon:symbol-method"], alternates: [], notes: "Method on a type — alias of function (same icon, contextual color)" },
  { consumerName: "uir-constructor", filename: "uir-constructor.svg", phosphorName: "hammer", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: [], alternates: ["ph:factory-light", "ph:wrench-light", "ph:sparkle-light", "tabler:wand", "mdi:hammer-wrench", "mdi:auto-fix"], notes: "Constructor / initializer — Phosphor hammer (build), or factory (manufactures instance), or sparkle (new)" },
  { consumerName: "uir-lambda", filename: "uir-lambda.svg", phosphorName: "arrow-bend-right-up", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: [], alternates: ["tabler:lambda", "mdi:lambda"], notes: "Lambda / closure / arrow function — Phosphor has no lambda; tabler:lambda is the cleanest" },
  { consumerName: "uir-async-fn", filename: "uir-async-fn.svg", phosphorName: "clock-clockwise", status: "NEW", group: "uir-ast-code", usedIn: "logical (Go goroutine, JS async)", currentIcons: [], alternates: ["ph:atom-light", "ph:spinner-gap-light", "ph:circle-half-tilt-light", "tabler:clock-bolt", "mdi:autorenew", "mdi:refresh-auto"], notes: "Async/concurrent (goroutine, async fn, coroutine) — clock-clockwise = 'time-bound continuation'; atom = parallel particles; tabler:clock-bolt blends both" },
  { consumerName: "uir-macro", filename: "uir-macro.svg", phosphorName: "magic-wand", status: "NEW", group: "uir-ast-code", usedIn: "logical (Rust/Lisp/C)", currentIcons: [], alternates: ["ph:sparkle-light", "ph:asterisk-light", "ph:lightning-light", "ph:code-block-light", "tabler:macro", "mdi:code-array", "mdi:rabbit"], notes: "Macro / preprocessor / metaprogramming. magic-wand for the 'expansion' metaphor; sparkle for 'auto-generated'; asterisk matches Lisp/Scheme macro convention." },
  { consumerName: "uir-decorator", filename: "uir-decorator.svg", phosphorName: "at", status: "NEW", group: "uir-ast-code", usedIn: "logical (Python/TS/Java)", currentIcons: [], alternates: ["tabler:at", "mdi:at"], notes: "Decorator / annotation / attribute (@deprecated)" },

  // Fields & values
  { consumerName: "uir-field", filename: "uir-field.svg", phosphorName: "textbox", status: "NEW", group: "uir-ast-code", usedIn: "arch-unit (field)", currentIcons: ["codicon:symbol-field", "lucide:hash"], alternates: ["ph:text-t-light", "tabler:forms", "tabler:input-search", "mdi:form-textbox", "mdi:rename-box", "codicon:symbol-field"], notes: "Field — input-field style. Phosphor textbox is the cleanest 'data-entry slot'; tabler:forms is wider; mdi:form-textbox is most literal" },
  { consumerName: "uir-property", filename: "uir-property.svg", phosphorName: "sliders-horizontal", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-property"], alternates: ["ph:equalizer-light", "ph:list-bullets-light", "tabler:adjustments", "mdi:format-list-text", "mdi:tag-text", "mdi:wrench-outline"], notes: "Property — accessor/setting/computed. sliders-horizontal = 'adjustable attribute'; equalizer same family; mdi:tag-text reads as labelled value" },
  { consumerName: "uir-variable", filename: "uir-variable.svg", phosphorName: "text-aa", status: "NEW", group: "uir-ast-code", usedIn: "arch-unit (variable)", currentIcons: ["codicon:symbol-variable"], alternates: ["tabler:variable", "mdi:variable"], notes: "Local/global variable. tabler:variable reads cleanest." },
  { consumerName: "uir-constant", filename: "uir-constant.svg", phosphorName: "snowflake", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-constant"], alternates: ["ph:anchor-light", "ph:lock-laminated-light", "ph:lock-simple-light", "tabler:snowflake", "mdi:format-letter-case", "mdi:lock-pattern"], notes: "Constant — frozen/immutable. snowflake reads 'frozen' clearly; anchor = pinned; mdi:format-letter-case (UPPER) for SCREAMING_CASE convention" },
  { consumerName: "uir-parameter", filename: "uir-parameter.svg", phosphorName: "hand-pointing", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-parameter"], alternates: ["mdi:variable", "tabler:parentheses", "ph:cursor-text-light", "ph:textbox-light", "mdi:tooltip-edit", "ph:arrow-fat-line-right-light"], notes: "User note: '$v jv=b' — placeholder/value-substitution. RECOMMENDED: mdi:variable (literal 'x' italic = math variable) or tabler:parentheses (signature slot). hand-pointing reads 'passed in'." },
  { consumerName: "uir-keyword", filename: "uir-keyword.svg", phosphorName: "text-bolder", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-keyword"], alternates: ["ph:quotes-light", "ph:hash-light", "ph:asterisk-light", "ph:star-light", "tabler:square-letter-k", "mdi:alphabetical", "mdi:format-letter-case"], notes: "Reserved keyword. text-bolder reads 'bold word'; quotes for 'string literal name'; tabler:square-letter-k literal 'K'." },
  { consumerName: "uir-operator", filename: "uir-operator.svg", phosphorName: "math-operations", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-operator"], alternates: ["tabler:math-symbols", "mdi:plus-minus"], notes: "Operator / overload" },

  // Primitive value types
  { consumerName: "uir-string", filename: "uir-string.svg", phosphorName: "quotes", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-string"], alternates: ["tabler:quote", "mdi:format-quote-close"], notes: "String literal type" },
  { consumerName: "uir-numeric", filename: "uir-numeric.svg", phosphorName: "list-numbers", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-numeric"], alternates: ["tabler:number-123", "mdi:numeric"], notes: "Number / int / float — tabler:number-123 has the clearest '123' affordance" },
  { consumerName: "uir-boolean", filename: "uir-boolean.svg", phosphorName: "circuitry", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-boolean"], alternates: ["tabler:binary", "ph:yin-yang-light", "tabler:yin-yang", "ph:toggle-right-light", "mdi:circle-half-full", "codicon:symbol-boolean"], notes: "Boolean — true/false. RECOMMENDED: tabler:binary (literal '01' digits read most clearly as data type). Phosphor circuitry / yin-yang are abstract; tabler:binary matches user's note 'use a true/false'." },
  { consumerName: "uir-array", filename: "uir-array.svg", phosphorName: "brackets-square", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-array"], alternates: ["tabler:brackets", "mdi:code-array"], notes: "Array / list / Vec" },
  { consumerName: "uir-object", filename: "uir-object.svg", phosphorName: "diamond", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-object"], alternates: ["ph:cube-light", "ph:sparkle-light", "tabler:json", "tabler:box-multiple", "mdi:code-json", "mdi:cube-outline"], notes: "Object / dict / map. diamond = composite value (vs cube=class); tabler:json or mdi:code-json if JSON-leaning; cube only if it doesn't clash with uir-class" },
  { consumerName: "uir-null", filename: "uir-null.svg", phosphorName: "prohibit", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:symbol-null"], alternates: ["ph:empty-light", "ph:circle-dashed-light", "tabler:circle-off", "tabler:forbid", "mdi:null", "mdi:circle-off-outline"], notes: "null / nil / None. prohibit ⊘ reads 'forbidden value'; ph:empty = literal empty set; mdi:null is the most literal (text 'null') but small at 24px" },
  { consumerName: "uir-event", filename: "uir-event.svg", phosphorName: "lightning", status: "NEW", group: "uir-ast-code", usedIn: "logical (C# event)", currentIcons: ["codicon:symbol-event"], alternates: ["tabler:bolt", "mdi:flash-outline"], notes: "Event handler" },

  // arch-unit-specific kinds
  { consumerName: "uir-endpoint", filename: "uir-endpoint.svg", phosphorName: "globe-hemisphere-east", status: "NEW", group: "uir-ast-code", usedIn: "arch-unit (endpoint)", currentIcons: ["lucide:globe"], alternates: ["tabler:api", "mdi:api"], notes: "HTTP endpoint / route handler. arch-unit currently uses Lucide Globe (rose)." },
  { consumerName: "uir-test", filename: "uir-test.svg", phosphorName: "flask", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:beaker"], alternates: ["tabler:test-pipe", "mdi:test-tube"], notes: "Test function / spec" },
  { consumerName: "uir-comment", filename: "uir-comment.svg", phosphorName: "chat-text", status: "NEW", group: "uir-ast-code", usedIn: "logical", currentIcons: ["codicon:comment"], alternates: ["tabler:message", "mdi:comment-text-outline"], notes: "Doc comment / annotation block" },
  { consumerName: "uir-unknown", filename: "uir-unknown.svg", phosphorName: "question", status: "NEW", group: "uir-ast-code", usedIn: "arch-unit fallback", currentIcons: ["lucide:puzzle"], alternates: ["tabler:help-circle", "mdi:help-circle-outline"], notes: "Fallback when kind is missing/unknown. arch-unit currently uses Lucide Puzzle." },

  // ---- UIR/AST — SQL (oipa-cli) — distinctive icons per type ----
  { consumerName: "uir-sql-schema", filename: "uir-sql-schema.svg", phosphorName: "tree-structure", status: "NEW", group: "uir-sql", usedIn: "oipa-cli (schema)", currentIcons: [], alternates: ["tabler:schema", "mdi:file-tree-outline"], notes: "Database schema root container — currently no icon" },
  { consumerName: "uir-sql-table", filename: "uir-sql-table.svg", phosphorName: "table", status: "NEW", group: "uir-sql", usedIn: "oipa-cli (sql:table)", currentIcons: ["codicon:table", "lucide:table"], alternates: ["tabler:table", "mdi:table"], notes: "Table. oipa-cli currently uses Lucide Table (emerald)." },
  { consumerName: "uir-sql-view", filename: "uir-sql-view.svg", phosphorName: "eye", status: "NEW", group: "uir-sql", usedIn: "oipa-cli (sql:view)", currentIcons: ["lucide:eye"], alternates: ["tabler:eye", "mdi:table-eye"], notes: "Materialized/derived view. oipa-cli currently uses Lucide Eye (slate)." },
  { consumerName: "uir-sql-trigger", filename: "uir-sql-trigger.svg", phosphorName: "lightning", status: "NEW", group: "uir-sql", usedIn: "oipa-cli (sql:trigger)", currentIcons: ["lucide:zap"], alternates: ["tabler:bolt", "mdi:flash"], notes: "Trigger — fires on row event. oipa-cli currently uses Lucide Zap (amber)." },
  { consumerName: "uir-sql-stored-proc", filename: "uir-sql-stored-proc.svg", phosphorName: "scroll", status: "NEW", group: "uir-sql", usedIn: "oipa-cli (sql:stored_proc)", currentIcons: ["lucide:cog"], alternates: ["tabler:script", "mdi:database-cog"], notes: "Stored procedure. oipa-cli currently uses Lucide Cog (purple) — scroll reads more 'script-like'." },
  { consumerName: "uir-sql-function", filename: "uir-sql-function.svg", phosphorName: "function", status: "NEW", group: "uir-sql", usedIn: "oipa-cli (sql:function)", currentIcons: ["lucide:function-square"], alternates: ["tabler:math-function", "mdi:function-variant"], notes: "User-defined SQL function. oipa-cli currently uses Lucide FunctionSquare (teal)." },
  { consumerName: "uir-sql-index", filename: "uir-sql-index.svg", phosphorName: "list-magnifying-glass", status: "NEW", group: "uir-sql", usedIn: "oipa-cli (sql:index)", currentIcons: ["lucide:list-tree"], alternates: ["tabler:list-search", "mdi:database-search"], notes: "Index. oipa-cli currently uses Lucide ListTree — list-magnifying-glass is more semantic." },
  { consumerName: "uir-sql-column", filename: "uir-sql-column.svg", phosphorName: "tag", status: "NEW", group: "uir-sql", usedIn: "oipa-cli (field)", currentIcons: [], alternates: ["tabler:column-insert-right", "mdi:table-column"], notes: "Column / field on a table" },
  { consumerName: "uir-sql-primary-key", filename: "uir-sql-primary-key.svg", phosphorName: "key", status: "NEW", group: "uir-sql", usedIn: "logical", currentIcons: [], alternates: ["ph:asterisk-light", "ph:identification-card-light", "tabler:key", "mdi:key-variant", "mdi:table-key", "carbon:identification", "lucide:key-round"], notes: "PK glyph — Phosphor key is canonical; mdi:table-key is the most explicit 'PK on a table'; asterisk works at small sizes for the convention '* = PK'" },
  { consumerName: "uir-sql-foreign-key", filename: "uir-sql-foreign-key.svg", phosphorName: "key-return", status: "NEW", group: "uir-sql", usedIn: "logical", currentIcons: [], alternates: ["ph:link-light", "ph:share-network-light", "ph:arrow-bend-up-right-light", "tabler:link", "tabler:relation-one-to-many", "mdi:key-link", "mdi:relation-many-to-many", "carbon:join-inner"], notes: "FK glyph — key-return = 'key that points back'; mdi:key-link = key + chain; tabler:relation-one-to-many = the SQL relation directly" },
  { consumerName: "uir-sql-constraint", filename: "uir-sql-constraint.svg", phosphorName: "function", status: "NEW", group: "uir-sql", usedIn: "logical", currentIcons: [], alternates: ["ph:scales-light", "ph:equals-light", "ph:seal-check-light", "ph:check-square-light", "tabler:math-symbols", "tabler:math-equal-greater", "mdi:approximately-equal", "mdi:check-decagram-outline", "carbon:rule"], notes: "Expression-based constraint — function f(x) reads as 'CHECK expression'; scales = balance/balance-rule; carbon:rule = the literal SQL term" },
  { consumerName: "uir-sql-sequence", filename: "uir-sql-sequence.svg", phosphorName: "hash", status: "NEW", group: "uir-sql", usedIn: "logical", currentIcons: [], alternates: ["jb-expui-general:hashtag", "tabler:123", "ph:list-numbers-light", "ph:identification-badge-light", "ph:infinity-light", "tabler:sort-ascending-numbers", "mdi:counter", "mdi:autorenew", "mdi:auto-mode", "carbon:autoscaling"], notes: "User note: 'use jb numeric but with a blue hash'. RECOMMENDED outline: ph:hash (#) — semantically the SQL sequence/serial convention. jb-expui-general:hashtag is the JetBrains '#' glyph the user referenced. Pair with consumer color (blue)." },
  { consumerName: "uir-sql-array", filename: "uir-sql-array.svg", phosphorName: "stack", status: "NEW", group: "uir-sql", usedIn: "oipa-cli (field type:array)", currentIcons: ["lucide:list-tree"], alternates: ["ph:rows-light", "ph:list-light", "ph:grid-four-light", "ph:brackets-square-light", "tabler:dimensions", "tabler:box-multiple", "mdi:code-array", "carbon:data-set"], notes: "Array column type — distinct from uir-array. stack = stacked rows in a single cell; rows = literal multi-row; tabler:dimensions for dimensional arrays; mdi:code-array for raw [] type" },
  { consumerName: "uir-sql-query", filename: "uir-sql-query.svg", phosphorName: "magnifying-glass", status: "NEW", group: "uir-sql", usedIn: "logical", currentIcons: [], alternates: ["ph:magnifying-glass-thin", "ph:database-thin", "material-symbols-light:database-search-outline", "tabler:sql", "mdi:database-search-outline"], notes: "SELECT / query reference. Thin: ph:magnifying-glass-thin or ph:database-thin (1px). material-symbols-light:database-search-outline is a thinner composite than mdi." },
  { consumerName: "uir-sql-database", filename: "uir-sql-database.svg", phosphorName: "database", status: "ALIAS", group: "uir-sql", usedIn: "oipa-cli", currentIcons: ["codicon:database"], alternates: [], notes: "Top-level database (parent of schemas) — alias of database" },

  // ---- Files & code ----
  { consumerName: "file", filename: "file.svg", phosphorName: "file", status: "NEW", group: "files-code", usedIn: "scraper UI", currentIcons: ["codicon:file"], notes: "" },
  { consumerName: "file-code", filename: "file-code.svg", phosphorName: "file-code", status: "NEW", group: "files-code", usedIn: "clicky-ui, scraper UI", currentIcons: ["codicon:file-code"], notes: "" },
  { consumerName: "folder", filename: "folder.svg", phosphorName: "folder", status: "EXISTS", group: "files-code", usedIn: "gavel", currentIcons: ["codicon:folder"], notes: "reskin candidate" },
  { consumerName: "json", filename: "json.svg", phosphorName: "brackets-curly", status: "EXISTS", group: "files-code", usedIn: "gavel", currentIcons: ["codicon:json"], notes: "Phosphor: brackets-curly" },
  { consumerName: "markdown", filename: "markdown.svg", phosphorName: "file-text", status: "EXISTS", group: "files-code", usedIn: "gavel", currentIcons: ["codicon:markdown"], notes: "Phosphor has no markdown logo; keep incumbent" },
  { consumerName: "copy", filename: "copy.svg", phosphorName: "copy", status: "NEW", group: "files-code", usedIn: "scraper UI", currentIcons: ["codicon:copy"], notes: "" },

  // ---- Git & source control ----
  { consumerName: "git-branch", filename: "git-branch.svg", phosphorName: "git-branch", status: "NEW", group: "git-source-control", usedIn: "clicky-ui", currentIcons: ["lucide:git-branch"], notes: "" },
  { consumerName: "git-merge", filename: "git-merge.svg", phosphorName: "git-merge", status: "NEW", group: "git-source-control", usedIn: "gavel", currentIcons: ["codicon:git-merge"], notes: "" },
  { consumerName: "git-pull-request -> git-pr", filename: "(alias)", phosphorName: "git-pull-request", status: "ALIAS", group: "git-source-control", usedIn: "gavel", currentIcons: ["codicon:git-pull-request"], notes: "alias entry" },
  { consumerName: "repo -> folder-git", filename: "(alias)", phosphorName: "git-fork", status: "ALIAS", group: "git-source-control", usedIn: "gavel", currentIcons: ["codicon:repo"], notes: "alias entry" },
  { consumerName: "diff", filename: "diff.svg", phosphorName: "arrows-left-right", status: "EXISTS", group: "git-source-control", usedIn: "flanksource-ui", currentIcons: [], notes: "MAINTAIN incumbent svg/diff.svg — Phosphor has no git-diff equivalent" },

  // ---- Infrastructure ----
  { consumerName: "server", filename: "server.svg", phosphorName: "hard-drives", status: "EXISTS", group: "infrastructure", usedIn: "clicky-ui", currentIcons: ["lucide:server"], notes: "reskin candidate" },
  { consumerName: "server-process", filename: "server-process.svg", phosphorName: "hard-drives", status: "NEW", group: "infrastructure", usedIn: "clicky-ui, gavel, scraper UI", currentIcons: ["codicon:server-process"], notes: "Phosphor: hard-drives" },
  { consumerName: "database", filename: "database.svg", phosphorName: "database", status: "EXISTS", group: "infrastructure", usedIn: "gavel, scraper UI", currentIcons: ["codicon:database"], notes: "incumbent is filled; rename incumbent->database-filled, ph-light at database.svg" },
  { consumerName: "database-plus", filename: "database-plus.svg", phosphorName: "database", status: "EXISTS", group: "infrastructure", usedIn: "flanksource-ui", currentIcons: [], notes: "MAINTAIN incumbent svg/database-plus.svg — composite glyph (db + plus); no Phosphor equivalent" },
  { consumerName: "cloud", filename: "cloud.svg", phosphorName: "cloud", status: "NEW", group: "infrastructure", usedIn: "clicky-ui", currentIcons: ["lucide:cloud"], notes: "" },
  { consumerName: "cloud-download", filename: "cloud-download.svg", phosphorName: "cloud-arrow-down", status: "EXISTS", group: "infrastructure", usedIn: "clicky-ui, scraper UI", currentIcons: ["codicon:cloud-download"], notes: "Phosphor: cloud-arrow-down" },
  { consumerName: "chip", filename: "chip.svg", phosphorName: "cpu", status: "NEW", group: "infrastructure", usedIn: "clicky-ui", currentIcons: ["codicon:chip"], notes: "Phosphor: cpu" },

  // ---- Actions & tools ----
  { consumerName: "refresh", filename: "refresh.svg", phosphorName: "arrows-clockwise", status: "NEW", group: "actions-tools", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:refresh", "codicon:sync"], notes: "alias sync, arrows-clockwise" },
  { consumerName: "arrows-clockwise -> refresh", filename: "(alias)", phosphorName: "arrows-clockwise", status: "ALIAS", group: "actions-tools", usedIn: "any phosphor consumer", currentIcons: [], notes: "alias entry; also alias 'sync'" },
  { consumerName: "trash", filename: "trash.svg", phosphorName: "trash", status: "EXISTS", group: "actions-tools", usedIn: "gavel", currentIcons: ["codicon:trash"], notes: "reskin candidate" },
  { consumerName: "beaker", filename: "beaker.svg", phosphorName: "flask", status: "NEW", group: "actions-tools", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:beaker"], notes: "Phosphor: flask" },

  // ---- People & orgs ----
  { consumerName: "person -> user", filename: "(alias)", phosphorName: "user", status: "ALIAS", group: "people-orgs", usedIn: "gavel (codicon:person)", currentIcons: ["codicon:person"], notes: "alias entry" },
  { consumerName: "organization", filename: "organization.svg", phosphorName: "buildings", status: "NEW", group: "people-orgs", usedIn: "gavel (5x)", currentIcons: ["codicon:organization"], notes: "Phosphor: buildings" },
  { consumerName: "hubot", filename: "hubot.svg", phosphorName: "robot", status: "NEW", group: "people-orgs", usedIn: "gavel", currentIcons: ["codicon:hubot"], notes: "Phosphor: robot" },

  // ---- Time ----
  { consumerName: "clock", filename: "clock.svg", phosphorName: "clock", status: "EXISTS", group: "time", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:clock", "lucide:clock-3"], notes: "reskin candidate" },
  { consumerName: "watch", filename: "watch.svg", phosphorName: "timer", status: "NEW", group: "time", usedIn: "clicky-ui, gavel", currentIcons: ["codicon:watch"], notes: "Phosphor: timer" },
  { consumerName: "stopwatch -> watch (timer)", filename: "(alias)", phosphorName: "timer", status: "ALIAS", group: "time", usedIn: "gavel", currentIcons: ["codicon:watch"], notes: "alias entry" },
  { consumerName: "hourglass-medium -> hourglass", filename: "(alias)", phosphorName: "hourglass-medium", status: "ALIAS", group: "time", usedIn: "clicky-ui (ph:hourglass-medium-thin)", currentIcons: ["ph:hourglass-medium-thin"], notes: "alias" },

  // ---- UI controls (additions from arch-unit / oipa-cli / logical coverage) ----
  { consumerName: "chevrons-down", filename: "chevrons-down.svg", phosphorName: "caret-double-down", status: "NEW", group: "ui-controls", usedIn: "arch-unit", currentIcons: ["lucide:chevrons-down"], notes: "outline only — never use Fill weight" },
  { consumerName: "chevrons-up", filename: "chevrons-up.svg", phosphorName: "caret-double-up", status: "NEW", group: "ui-controls", usedIn: "arch-unit", currentIcons: ["lucide:chevrons-up"], notes: "outline only — never use Fill weight" },
  { consumerName: "square", filename: "square.svg", phosphorName: "square", status: "NEW", group: "ui-controls", usedIn: "oipa-cli", currentIcons: ["lucide:square"], notes: "checkbox/empty container" },
  { consumerName: "menu", filename: "menu.svg", phosphorName: "list", status: "NEW", group: "ui-controls", usedIn: "logical coverage", currentIcons: [], notes: "Phosphor: list (hamburger); outline only" },
  { consumerName: "dots-vertical", filename: "dots-vertical.svg", phosphorName: "dots-three-vertical", status: "NEW", group: "ui-controls", usedIn: "logical coverage", currentIcons: [], notes: "outline only — never use Fill weight" },

  // ---- Navigation (additions) ----
  { consumerName: "arrow-right", filename: "arrow-right.svg", phosphorName: "arrow-right", status: "NEW", group: "navigation", usedIn: "arch-unit, oipa-cli", currentIcons: ["lucide:arrow-right"], notes: "outline only — never use Fill weight" },
  { consumerName: "arrow-up", filename: "arrow-up.svg", phosphorName: "arrow-up", status: "NEW", group: "navigation", usedIn: "logical coverage", currentIcons: [], notes: "outline only — never use Fill weight; sort/scroll-to-top" },
  { consumerName: "arrow-down", filename: "arrow-down.svg", phosphorName: "arrow-down", status: "NEW", group: "navigation", usedIn: "logical coverage", currentIcons: [], notes: "outline only — never use Fill weight; sort" },
  { consumerName: "external-link", filename: "external-link.svg", phosphorName: "arrow-square-out", status: "ALIAS", group: "navigation", usedIn: "common", currentIcons: [], notes: "outline only; alias of link-external" },
  { consumerName: "home", filename: "home.svg", phosphorName: "house", status: "NEW", group: "navigation", usedIn: "logical coverage", currentIcons: [], notes: "Phosphor: house" },

  // ---- Layout & dashboard ----
  { consumerName: "layout-dashboard", filename: "layout-dashboard.svg", phosphorName: "squares-four", status: "NEW", group: "layout-dashboard", usedIn: "arch-unit", currentIcons: ["lucide:layout-dashboard"], notes: "Phosphor: squares-four" },
  { consumerName: "package", filename: "package.svg", phosphorName: "package", status: "NEW", group: "layout-dashboard", usedIn: "arch-unit", currentIcons: ["lucide:package"], notes: "module/package boundary" },
  { consumerName: "puzzle", filename: "puzzle.svg", phosphorName: "puzzle-piece", status: "NEW", group: "layout-dashboard", usedIn: "arch-unit", currentIcons: ["lucide:puzzle"], notes: "Phosphor: puzzle-piece (plugin/module)" },
  { consumerName: "box", filename: "box.svg", phosphorName: "cube", status: "NEW", group: "layout-dashboard", usedIn: "arch-unit", currentIcons: ["lucide:box"], notes: "Phosphor: cube" },
  { consumerName: "grid", filename: "grid.svg", phosphorName: "grid-four", status: "NEW", group: "layout-dashboard", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "sidebar", filename: "sidebar.svg", phosphorName: "sidebar", status: "NEW", group: "layout-dashboard", usedIn: "logical coverage", currentIcons: [], notes: "" },

  // ---- Forms & editing ----
  { consumerName: "edit", filename: "edit.svg", phosphorName: "pencil-simple", status: "NEW", group: "forms-editing", usedIn: "logical coverage", currentIcons: [], notes: "Phosphor: pencil-simple" },
  { consumerName: "save", filename: "save.svg", phosphorName: "floppy-disk", status: "NEW", group: "forms-editing", usedIn: "logical coverage", currentIcons: [], notes: "Phosphor: floppy-disk" },
  { consumerName: "cancel", filename: "cancel.svg", phosphorName: "x", status: "ALIAS", group: "forms-editing", usedIn: "logical coverage", currentIcons: [], notes: "alias of close" },
  { consumerName: "form", filename: "form.svg", phosphorName: "list-bullets", status: "NEW", group: "forms-editing", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "select", filename: "select.svg", phosphorName: "selection", status: "NEW", group: "forms-editing", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "calendar", filename: "calendar.svg", phosphorName: "calendar", status: "NEW", group: "forms-editing", usedIn: "logical coverage", currentIcons: [], notes: "date picker" },
  { consumerName: "calendar-blank", filename: "calendar-blank.svg", phosphorName: "calendar-blank", status: "NEW", group: "forms-editing", usedIn: "logical coverage", currentIcons: [], notes: "" },

  // ---- Health & status (additions) ----
  { consumerName: "loader", filename: "loader.svg", phosphorName: "spinner", status: "NEW", group: "health-status", usedIn: "oipa-cli", currentIcons: ["lucide:loader-2"], notes: "Phosphor: spinner; svg-spinners stays for animation" },
  { consumerName: "skull", filename: "skull.svg", phosphorName: "skull", status: "NEW", group: "health-status", usedIn: "oipa-cli", currentIcons: ["lucide:skull"], notes: "fatal error" },
  { consumerName: "siren", filename: "siren.svg", phosphorName: "siren", status: "NEW", group: "health-status", usedIn: "logical coverage", currentIcons: [], notes: "incident/alert" },

  // ---- Approval & review (additions) ----
  { consumerName: "thumbs-up", filename: "thumbs-up.svg", phosphorName: "thumbs-up", status: "NEW", group: "approval-review", usedIn: "logical coverage (flanksource-ui heroicons)", currentIcons: [], notes: "" },
  { consumerName: "thumbs-down", filename: "thumbs-down.svg", phosphorName: "thumbs-down", status: "NEW", group: "approval-review", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "seal-check", filename: "seal-check.svg", phosphorName: "seal-check", status: "NEW", group: "approval-review", usedIn: "logical coverage", currentIcons: [], notes: "verified/certified" },

  // ---- Security & auth ----
  { consumerName: "key", filename: "key.svg", phosphorName: "key", status: "NEW", group: "security-auth", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "shield", filename: "shield.svg", phosphorName: "shield", status: "NEW", group: "security-auth", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "shield-warning", filename: "shield-warning.svg", phosphorName: "shield-warning", status: "NEW", group: "security-auth", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "fingerprint", filename: "fingerprint.svg", phosphorName: "fingerprint", status: "NEW", group: "security-auth", usedIn: "logical coverage", currentIcons: [], notes: "biometric auth" },
  { consumerName: "user-circle", filename: "user-circle.svg", phosphorName: "user-circle", status: "NEW", group: "security-auth", usedIn: "logical coverage", currentIcons: [], notes: "current user/profile" },
  { consumerName: "sign-in", filename: "sign-in.svg", phosphorName: "sign-in", status: "NEW", group: "security-auth", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "sign-out", filename: "sign-out.svg", phosphorName: "sign-out", status: "NEW", group: "security-auth", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "lock-open", filename: "lock-open.svg", phosphorName: "lock-open", status: "NEW", group: "security-auth", usedIn: "logical coverage", currentIcons: [], notes: "" },

  // ---- Trees, lists, tables (additions) ----
  { consumerName: "table-properties", filename: "table-properties.svg", phosphorName: "table", status: "ALIAS", group: "trees-lists-tables", usedIn: "arch-unit", currentIcons: ["lucide:table-properties"], notes: "alias of table" },
  { consumerName: "rows", filename: "rows.svg", phosphorName: "rows", status: "NEW", group: "trees-lists-tables", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "columns", filename: "columns.svg", phosphorName: "columns", status: "NEW", group: "trees-lists-tables", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "kanban", filename: "kanban.svg", phosphorName: "kanban", status: "NEW", group: "trees-lists-tables", usedIn: "logical coverage", currentIcons: [], notes: "" },

  // ---- Data & analytics ----
  { consumerName: "chart-bar", filename: "chart-bar.svg", phosphorName: "chart-bar", status: "NEW", group: "data-analytics", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "chart-pie", filename: "chart-pie.svg", phosphorName: "chart-pie", status: "NEW", group: "data-analytics", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "git-graph", filename: "git-graph.svg", phosphorName: "graph", status: "NEW", group: "data-analytics", usedIn: "arch-unit", currentIcons: ["lucide:git-graph"], notes: "Phosphor: graph (network)" },
  { consumerName: "trend-up", filename: "trend-up.svg", phosphorName: "trend-up", status: "NEW", group: "data-analytics", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "trend-down", filename: "trend-down.svg", phosphorName: "trend-down", status: "NEW", group: "data-analytics", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "funnel-data", filename: "funnel-data.svg", phosphorName: "funnel", status: "ALIAS", group: "data-analytics", usedIn: "logical coverage", currentIcons: [], notes: "alias of filter" },

  // ---- Runtime & process ----
  { consumerName: "play", filename: "play.svg", phosphorName: "play", status: "NEW", group: "runtime-process", usedIn: "oipa-cli", currentIcons: ["lucide:play"], notes: "" },
  { consumerName: "pause", filename: "pause.svg", phosphorName: "pause", status: "NEW", group: "runtime-process", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "stop", filename: "stop.svg", phosphorName: "stop", status: "NEW", group: "runtime-process", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "skip-forward", filename: "skip-forward.svg", phosphorName: "skip-forward", status: "NEW", group: "runtime-process", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "history", filename: "history.svg", phosphorName: "clock-counter-clockwise", status: "NEW", group: "runtime-process", usedIn: "oipa-cli", currentIcons: ["lucide:history"], notes: "Phosphor: clock-counter-clockwise" },

  // ---- Configs & metadata (additions) ----
  { consumerName: "cog", filename: "cog.svg", phosphorName: "gear", status: "ALIAS", group: "configs-metadata", usedIn: "oipa-cli", currentIcons: ["lucide:cog"], notes: "alias of config/gear" },
  { consumerName: "sliders", filename: "sliders.svg", phosphorName: "sliders", status: "NEW", group: "configs-metadata", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "toggle-on", filename: "toggle-on.svg", phosphorName: "toggle-right", status: "NEW", group: "configs-metadata", usedIn: "logical coverage", currentIcons: [], notes: "feature flag on" },
  { consumerName: "toggle-off", filename: "toggle-off.svg", phosphorName: "toggle-left", status: "NEW", group: "configs-metadata", usedIn: "logical coverage", currentIcons: [], notes: "feature flag off" },

  // ---- Files & code (additions) ----
  { consumerName: "code-2", filename: "code-2.svg", phosphorName: "code", status: "NEW", group: "files-code", usedIn: "arch-unit", currentIcons: ["lucide:code-2"], notes: "Phosphor: code" },
  { consumerName: "binary", filename: "binary.svg", phosphorName: "binary", status: "NEW", group: "files-code", usedIn: "arch-unit", currentIcons: ["lucide:binary"], notes: "" },
  { consumerName: "braces", filename: "braces.svg", phosphorName: "brackets-curly", status: "ALIAS", group: "files-code", usedIn: "arch-unit", currentIcons: ["lucide:braces"], notes: "alias of json (brackets-curly)" },
  { consumerName: "file-json", filename: "file-json.svg", phosphorName: "file-code", status: "ALIAS", group: "files-code", usedIn: "oipa-cli", currentIcons: ["lucide:file-json"], alternates: ["ph:file-code-thin", "ph:brackets-curly-thin", "solar:document-text-linear", "material-symbols-light:code-blocks-outline"], notes: "Lucide:file-json has 2px stroke. Thinner: ph:file-code-thin or ph:brackets-curly-thin (1px Phosphor). solar:document-text-linear is full thin set." },
  { consumerName: "file-text", filename: "file-text.svg", phosphorName: "file-text", status: "NEW", group: "files-code", usedIn: "oipa-cli", currentIcons: ["lucide:file-text"], notes: "" },
  { consumerName: "file-spreadsheet", filename: "file-spreadsheet.svg", phosphorName: "file-xls", status: "NEW", group: "files-code", usedIn: "oipa-cli", currentIcons: ["lucide:file-spreadsheet"], alternates: ["ph:file-xls-thin", "ph:microsoft-excel-logo-thin", "solar:document-text-linear", "material-symbols-light:table-outline"], notes: "Lucide is 2px. Thinner: ph:file-xls-thin or ph:microsoft-excel-logo-thin (1px Phosphor). solar:document-text-linear if the xls suffix is too literal." },
  { consumerName: "function-square", filename: "function-square.svg", phosphorName: "function", status: "ALIAS", group: "files-code", usedIn: "arch-unit, oipa-cli", currentIcons: ["lucide:function-square"], alternates: ["ph:function-thin", "ph:code-block-thin", "solar:square-bottom-up-linear"], notes: "Lucide is 2px. Thinner: ph:function-thin (1px) — same family as the rest of the AST set. solar:square-bottom-up-linear for an alternate thin take." },
  { consumerName: "download", filename: "download.svg", phosphorName: "download-simple", status: "NEW", group: "files-code", usedIn: "oipa-cli", currentIcons: ["lucide:download"], notes: "" },
  { consumerName: "upload", filename: "upload.svg", phosphorName: "upload-simple", status: "NEW", group: "files-code", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "archive", filename: "archive.svg", phosphorName: "archive", status: "NEW", group: "files-code", usedIn: "oipa-cli", currentIcons: ["lucide:archive"], notes: "" },
  { consumerName: "folder-git-2", filename: "folder-git-2.svg", phosphorName: "folder-simple", status: "ALIAS", group: "files-code", usedIn: "arch-unit", currentIcons: ["lucide:folder-git-2"], alternates: ["ph:folder-simple-thin", "ph:folder-thin", "ph:git-branch-thin", "solar:folder-linear", "solar:branching-paths-up-linear", "material-symbols-light:folder-outline", "mage:folder"], notes: "Lucide is 2px. Thinner: ph:folder-simple-thin or ph:folder-thin (1px Phosphor). solar:folder-linear is a clean thin alternative; ph:git-branch-thin if you want the git overlay." },

  // ---- Dev tools & terminal ----
  { consumerName: "terminal", filename: "terminal.svg", phosphorName: "terminal-window", status: "NEW", group: "dev-tools", usedIn: "oipa-cli", currentIcons: ["lucide:terminal"], notes: "Phosphor: terminal-window" },
  { consumerName: "command", filename: "command.svg", phosphorName: "command", status: "NEW", group: "dev-tools", usedIn: "logical coverage", currentIcons: [], notes: "keyboard shortcut" },
  { consumerName: "wrench", filename: "wrench.svg", phosphorName: "wrench", status: "NEW", group: "dev-tools", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "bug", filename: "bug.svg", phosphorName: "bug", status: "NEW", group: "dev-tools", usedIn: "oipa-cli", currentIcons: ["lucide:bug"], notes: "" },

  // ---- AI & ML ----
  { consumerName: "sparkles", filename: "sparkles.svg", phosphorName: "sparkle", status: "NEW", group: "ai-ml", usedIn: "arch-unit", currentIcons: ["lucide:sparkles"], notes: "Phosphor: sparkle (AI marker)" },
  { consumerName: "brain", filename: "brain.svg", phosphorName: "brain", status: "NEW", group: "ai-ml", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "robot-ai", filename: "robot-ai.svg", phosphorName: "robot", status: "ALIAS", group: "ai-ml", usedIn: "logical coverage", currentIcons: [], notes: "alias of hubot" },
  { consumerName: "magic-wand", filename: "magic-wand.svg", phosphorName: "magic-wand", status: "NEW", group: "ai-ml", usedIn: "logical coverage", currentIcons: [], notes: "AI auto-fix/generate" },

  // ---- Infrastructure (additions) ----
  { consumerName: "network", filename: "network.svg", phosphorName: "network", status: "NEW", group: "infrastructure", usedIn: "oipa-cli", currentIcons: ["lucide:network"], notes: "" },
  { consumerName: "broadcast", filename: "broadcast.svg", phosphorName: "broadcast", status: "NEW", group: "infrastructure", usedIn: "logical coverage", currentIcons: [], notes: "pub/sub" },
  { consumerName: "queue", filename: "queue.svg", phosphorName: "queue", status: "NEW", group: "infrastructure", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "swap", filename: "swap.svg", phosphorName: "swap", status: "NEW", group: "infrastructure", usedIn: "logical coverage", currentIcons: [], notes: "" },

  // ---- Communication & notifications (additions) ----
  { consumerName: "bell", filename: "bell.svg", phosphorName: "bell", status: "NEW", group: "communication", usedIn: "logical coverage", currentIcons: [], notes: "notification" },
  { consumerName: "bell-slash", filename: "bell-slash.svg", phosphorName: "bell-slash", status: "NEW", group: "communication", usedIn: "logical coverage", currentIcons: [], notes: "muted" },
  { consumerName: "envelope", filename: "envelope.svg", phosphorName: "envelope", status: "NEW", group: "communication", usedIn: "logical coverage", currentIcons: [], notes: "email" },
  { consumerName: "phone", filename: "phone.svg", phosphorName: "phone", status: "NEW", group: "communication", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "share", filename: "share.svg", phosphorName: "share-network", status: "NEW", group: "communication", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "at", filename: "at.svg", phosphorName: "at", status: "NEW", group: "communication", usedIn: "logical coverage", currentIcons: [], notes: "mention" },

  // ---- Media ----
  { consumerName: "image", filename: "image.svg", phosphorName: "image", status: "NEW", group: "media", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "camera", filename: "camera.svg", phosphorName: "camera", status: "NEW", group: "media", usedIn: "logical coverage", currentIcons: [], notes: "" },
  { consumerName: "video", filename: "video.svg", phosphorName: "video-camera", status: "NEW", group: "media", usedIn: "logical coverage", currentIcons: [], notes: "Phosphor: video-camera" },
  { consumerName: "speaker", filename: "speaker.svg", phosphorName: "speaker-high", status: "NEW", group: "media", usedIn: "logical coverage", currentIcons: [], notes: "" },

  // ---- Severity (flanksource-ui ConfigChangeSeverity.tsx:15-63) ----
  { consumerName: "severity-critical", filename: "severity-critical.svg", phosphorName: "caret-double-up", status: "NEW", group: "severity", usedIn: "flanksource-ui (configChangeSeverity)", currentIcons: ["heroicons-outline:chevron-double-up"], alternates: ["ph:warning-octagon-light", "ph:siren-light", "tabler:alert-octagon", "mdi:alert-octagram"], notes: "Highest severity. Phosphor caret-double-up matches the existing HiOutlineChevronDoubleUp; warning-octagon if you want shape-coded severity." },
  { consumerName: "severity-high", filename: "severity-high.svg", phosphorName: "caret-up", status: "NEW", group: "severity", usedIn: "flanksource-ui", currentIcons: ["heroicons-outline:minus"], alternates: ["ph:warning-light", "ph:arrow-up-light", "tabler:alert-triangle"], notes: "" },
  { consumerName: "severity-medium", filename: "severity-medium.svg", phosphorName: "minus", status: "NEW", group: "severity", usedIn: "flanksource-ui", currentIcons: ["heroicons-outline:chevron-down"], alternates: ["ph:caret-down-light", "ph:dot-light", "tabler:minus"], notes: "" },
  { consumerName: "severity-low", filename: "severity-low.svg", phosphorName: "caret-double-down", status: "NEW", group: "severity", usedIn: "flanksource-ui", currentIcons: ["heroicons-outline:chevron-double-down"], alternates: ["ph:arrow-down-light", "ph:dot-outline-light"], notes: "" },
  { consumerName: "severity-info", filename: "severity-info.svg", phosphorName: "info", status: "NEW", group: "severity", usedIn: "flanksource-ui", currentIcons: ["heroicons:information-circle"], alternates: ["ph:info-light", "ph:circle-light"], notes: "Same icon as the generic info row but in severity context." },
  { consumerName: "severity-warning", filename: "severity-warning.svg", phosphorName: "warning", status: "NEW", group: "severity", usedIn: "flanksource-ui (color-only today)", currentIcons: [], alternates: ["ph:warning-circle-light", "ph:warning-triangle-light"], notes: "Severity-tier warning; distinct from change-type warning." },
  { consumerName: "severity-blocker", filename: "severity-blocker.svg", phosphorName: "warning-octagon", status: "NEW", group: "severity", usedIn: "flanksource-ui (alias of critical)", currentIcons: [], alternates: ["ph:hand-light", "ph:prohibit-light", "tabler:hand-stop"], notes: "Frequently aliased to critical, but the semantic 'work cannot proceed' meaning warrants a distinct glyph option." },

  // ---- Insight types (flanksource-ui ConfigInsightsIcon.tsx:29-109) ----
  { consumerName: "insight-cost", filename: "insight-cost.svg", phosphorName: "currency-dollar", status: "NEW", group: "insight", usedIn: "flanksource-ui (CiDollar)", currentIcons: ["circum:dollar"], alternates: ["ph:coin-light", "ph:money-light", "tabler:coin", "mdi:cash"], notes: "" },
  { consumerName: "insight-availability", filename: "insight-availability.svg", phosphorName: "heartbeat", status: "NEW", group: "insight", usedIn: "flanksource-ui (PiHeartStraightBreakThin)", currentIcons: ["ph:heart-straight-break-thin"], alternates: ["ph:heart-break-light", "ph:pulse-light", "tabler:heart-broken"], notes: "Phosphor heartbeat reads 'liveness' more clearly than heart-break." },
  { consumerName: "insight-performance", filename: "insight-performance.svg", phosphorName: "gauge", status: "NEW", group: "insight", usedIn: "flanksource-ui (CiStopwatch)", currentIcons: ["circum:stopwatch"], alternates: ["ph:speedometer-light", "ph:timer-light", "tabler:gauge"], notes: "" },
  { consumerName: "insight-security", filename: "insight-security.svg", phosphorName: "shield-check", status: "NEW", group: "insight", usedIn: "flanksource-ui (PiShieldCheckeredFill)", currentIcons: ["ph:shield-checkered-fill"], alternates: ["ph:shield-checkered-light", "ph:lock-light", "tabler:shield-check"], notes: "" },
  { consumerName: "insight-integration", filename: "insight-integration.svg", phosphorName: "link", status: "NEW", group: "insight", usedIn: "flanksource-ui (CiLink)", currentIcons: ["circum:link"], alternates: ["ph:plug-light", "ph:share-network-light", "tabler:plug-connected"], notes: "" },
  { consumerName: "insight-compliance", filename: "insight-compliance.svg", phosphorName: "scales", status: "NEW", group: "insight", usedIn: "flanksource-ui (PiBankThin)", currentIcons: ["ph:bank-thin"], alternates: ["ph:bank-light", "ph:gavel-light", "tabler:scale", "mdi:scale-balance"], notes: "Phosphor scales reads more 'rule of law' than bank." },
  { consumerName: "insight-reliability", filename: "insight-reliability.svg", phosphorName: "clock", status: "NEW", group: "insight", usedIn: "flanksource-ui (CiClock2)", currentIcons: ["circum:clock-2"], alternates: ["ph:check-circle-light", "ph:hourglass-light", "tabler:clock-check"], notes: "" },
  { consumerName: "insight-technical-debt", filename: "insight-technical-debt.svg", phosphorName: "wrench", status: "NEW", group: "insight", usedIn: "flanksource-ui (CiBandage)", currentIcons: ["circum:bandage"], alternates: ["ph:bandaids-light", "ph:hammer-light", "mdi:wrench-clock"], notes: "Wrench reads as 'needs maintenance' more clearly than a bandage." },
  { consumerName: "insight-recommendation", filename: "insight-recommendation.svg", phosphorName: "lightbulb", status: "NEW", group: "insight", usedIn: "flanksource-ui (PiLightbulbThin)", currentIcons: ["ph:lightbulb-thin"], alternates: ["ph:sparkle-light", "ph:lightbulb-filament-light"], notes: "" },

  // ---- Change types (duty/types/config_changes.go:45-91) — full canonical set ----
  // Lifecycle (4)
  { consumerName: "change-create", filename: "change-create.svg", phosphorName: "plus-circle", status: "NEW", group: "change-types", usedIn: "duty (CREATE)", currentIcons: [], alternates: ["jb-expui-actions:newFolder", "tabler:plus", "mdi:plus-circle"], notes: "Aliases the generic add row; emit a separate component for clarity in change feeds." },
  { consumerName: "change-update", filename: "change-update.svg", phosphorName: "pencil-simple", status: "NEW", group: "change-types", usedIn: "duty (UPDATE)", currentIcons: [], alternates: ["ph:pencil-light", "jb-expui-general:edit", "tabler:pencil"], notes: "" },
  { consumerName: "change-delete", filename: "change-delete.svg", phosphorName: "trash", status: "NEW", group: "change-types", usedIn: "duty (DELETE)", currentIcons: [], alternates: ["jb-expui-general:delete", "tabler:trash"], notes: "Alias of trash row." },
  { consumerName: "change-diff", filename: "change-diff.svg", phosphorName: "arrows-left-right", status: "EXISTS", group: "change-types", usedIn: "duty (diff)", currentIcons: [], alternates: ["ph:git-diff-light", "tabler:git-compare", "mdi:vector-difference", "jb-expui-vcs:diff", "jb-expui-actions:diagramDiff"], notes: "MAINTAIN incumbent svg/diff.svg as outline default. Filled: ph:git-diff-fill if you want a Phosphor solid; tabler:git-compare reads as 'side-by-side comparison'." },

  // User & group (4)
  { consumerName: "change-user-created", filename: "change-user-created.svg", phosphorName: "user-plus", status: "NEW", group: "change-types", usedIn: "duty (UserCreated)", currentIcons: [], alternates: ["tabler:user-plus", "mdi:account-plus"], notes: "" },
  { consumerName: "change-user-deleted", filename: "change-user-deleted.svg", phosphorName: "user-minus", status: "NEW", group: "change-types", usedIn: "duty (UserDeleted)", currentIcons: [], alternates: ["tabler:user-minus", "mdi:account-minus"], notes: "" },
  { consumerName: "change-group-member-added", filename: "change-group-member-added.svg", phosphorName: "users-three", status: "NEW", group: "change-types", usedIn: "duty (GroupMemberAdded)", currentIcons: [], alternates: ["ph:user-plus-light", "tabler:users-plus", "mdi:account-multiple-plus", "mdi:account-multiple-plus-outline"], notes: "User wanted plus/minus markers. Phosphor lacks users-plus/users-minus; closest Phosphor option is ph:user-plus (single user). For group context with explicit + marker, prefer tabler:users-plus or mdi:account-multiple-plus-outline." },
  { consumerName: "change-group-member-removed", filename: "change-group-member-removed.svg", phosphorName: "users-three", status: "NEW", group: "change-types", usedIn: "duty (GroupMemberRemoved)", currentIcons: [], alternates: ["ph:user-minus-light", "tabler:users-minus", "mdi:account-multiple-minus", "mdi:account-multiple-minus-outline"], notes: "User wanted plus/minus markers. tabler:users-minus or mdi:account-multiple-minus-outline have the explicit '-' marker on a multi-person glyph." },

  // Screenshot (1)
  { consumerName: "change-screenshot", filename: "change-screenshot.svg", phosphorName: "camera", status: "NEW", group: "change-types", usedIn: "duty (Screenshot)", currentIcons: [], alternates: ["ph:image-light", "tabler:camera", "mdi:camera"], notes: "" },

  // Permissions (2)
  { consumerName: "change-permission-added", filename: "change-permission-added.svg", phosphorName: "key", status: "NEW", group: "change-types", usedIn: "duty (PermissionAdded)", currentIcons: [], alternates: ["ph:lock-key-open-light", "ph:user-circle-plus-light", "ph:sign-in-light", "tabler:lock-plus", "mdi:key-plus", "mdi:shield-plus-outline"], notes: "User wanted explicit plus/minus markers on the key. Phosphor lacks key-plus; tabler:lock-plus and mdi:key-plus are the closest with literal +. ph:lock-key-open conveys 'just-granted'." },
  { consumerName: "change-permission-removed", filename: "change-permission-removed.svg", phosphorName: "key", status: "NEW", group: "change-types", usedIn: "duty (PermissionRemoved)", currentIcons: [], alternates: ["ph:lock-key-light", "ph:user-circle-minus-light", "ph:sign-out-light", "tabler:lock-minus", "tabler:key-off", "mdi:key-minus"], notes: "User wanted explicit plus/minus markers. tabler:lock-minus / mdi:key-minus carry the literal − on a key/lock." },

  // Deployment (5)
  { consumerName: "change-deployment", filename: "change-deployment.svg", phosphorName: "rocket-launch", status: "NEW", group: "change-types", usedIn: "duty (Deployment)", currentIcons: [], alternates: ["jb-expui-actions:deploy", "ph:cloud-arrow-up-light", "tabler:rocket"], notes: "" },
  { consumerName: "change-promotion", filename: "change-promotion.svg", phosphorName: "arrow-fat-line-right", status: "NEW", group: "change-types", usedIn: "duty (Promotion)", currentIcons: [], alternates: ["ph:arrow-fat-line-right-thin", "ph:arrow-fat-right-thin", "ph:arrow-square-right-thin", "ph:arrow-circle-right-thin", "ph:arrow-fat-right-light", "ph:arrow-square-right-light", "ph:arrow-circle-right-light", "ph:arrow-bend-up-right-light", "tabler:arrow-big-right-line", "tabler:arrow-merge-right", "mdi:arrow-right-bold", "mdi:source-branch-check"], notes: "Promotion is left → right (env to env). arrow-fat-line-right reads 'pushed forward'. Thin variants (ph:*-thin) match the rest of the set at 1px stroke." },
  { consumerName: "change-approved", filename: "change-approved.svg", phosphorName: "check-circle", status: "NEW", group: "change-types", usedIn: "duty (Approved)", currentIcons: [], alternates: ["ph:seal-check-light", "tabler:circle-check", "mdi:check-decagram"], notes: "" },
  { consumerName: "change-rejected", filename: "change-rejected.svg", phosphorName: "x-circle", status: "NEW", group: "change-types", usedIn: "duty (Rejected)", currentIcons: [], alternates: ["ph:prohibit-light", "tabler:circle-x", "mdi:close-circle"], notes: "" },
  { consumerName: "change-rollback", filename: "change-rollback.svg", phosphorName: "arrow-counter-clockwise", status: "NEW", group: "change-types", usedIn: "duty (Rollback)", currentIcons: [], alternates: ["jb-expui-vcs:revert", "ph:arrow-u-up-left-light", "tabler:rotate-clockwise-2"], notes: "" },

  // Backup (5)
  { consumerName: "change-backup-started", filename: "change-backup-started.svg", phosphorName: "database", status: "NEW", group: "change-types", usedIn: "duty (BackupStarted)", currentIcons: [], alternates: ["ph:database-thin", "ph:cloud-arrow-up-thin", "ph:cloud-arrow-up-light", "ph:floppy-disk-light", "ph:archive-light", "solar:database-linear", "solar:upload-linear", "material-symbols-light:database-upload-outline", "tabler:database-import", "mdi:database-arrow-up", "mdi:database-export"], notes: "User asked for ph:database + arrow-up. Thin alternatives: ph:database-thin or ph:cloud-arrow-up-thin (1px stroke, matches Phosphor Light family). solar:database-linear or material-symbols-light:database-upload-outline if you want a full composite glyph thinner than mdi." },
  { consumerName: "change-backup-completed", filename: "change-backup-completed.svg", phosphorName: "database", status: "NEW", group: "change-types", usedIn: "duty (BackupCompleted)", currentIcons: [], alternates: ["ph:database-thin", "ph:check-circle-thin", "ph:check-circle-light", "ph:floppy-disk-back-light", "ph:check-square-light", "ph:archive-light", "solar:database-linear", "solar:check-circle-linear", "streamline:database-check", "mdi:database-check"], notes: "User asked for ph:database + check. Thin: ph:database-thin + ph:check-circle-thin pair, or solar:database-linear + solar:check-circle-linear. streamline:database-check is the closest single composite at thin weight." },
  { consumerName: "change-backup-restored", filename: "change-backup-restored.svg", phosphorName: "database", status: "NEW", group: "change-types", usedIn: "duty (BackupRestored)", currentIcons: [], alternates: ["ph:database-thin", "ph:cloud-arrow-down-thin", "ph:cloud-arrow-down-light", "ph:arrow-counter-clockwise-light", "ph:download-simple-light", "solar:database-linear", "solar:download-linear", "streamline:database-refresh", "material-symbols-light:cloud-download-outline", "tabler:database-import", "mdi:database-arrow-down"], notes: "User asked for ph:database + restore. Thin: ph:database-thin + ph:cloud-arrow-down-thin, or solar:database-linear + solar:download-linear. streamline:database-refresh single composite reads 'restored'." },
  { consumerName: "change-backup-failed", filename: "change-backup-failed.svg", phosphorName: "database", status: "NEW", group: "change-types", usedIn: "duty (BackupFailed)", currentIcons: [], alternates: ["ph:database-thin", "ph:warning-octagon-thin", "ph:warning-octagon-light", "ph:cloud-warning-light", "ph:cloud-x-light", "ph:x-circle-light", "ph:x-circle-thin", "solar:database-linear", "solar:close-circle-linear", "material-symbols-light:cloud-off-outline", "tabler:database-off", "mdi:database-alert"], notes: "User asked for ph variant. Thin: ph:database-thin + ph:warning-octagon-thin pair (1px), or solar composites. ph:cloud-warning is the 'backup target broken' Phosphor option in Light; ph:warning-octagon is the clean Light option." },
  { consumerName: "change-backup-deleted", filename: "change-backup-deleted.svg", phosphorName: "database", status: "NEW", group: "change-types", usedIn: "duty (BackupDeleted)", currentIcons: [], alternates: ["ph:database-thin", "ph:trash-thin", "ph:trash-light", "ph:x-circle-light", "solar:database-linear", "solar:trash-bin-trash-linear", "streamline:database-remove", "tabler:database-x", "mdi:database-remove"], notes: "Pair ph:database-thin with ph:trash-thin (matching 1px stroke). streamline:database-remove single composite at thin weight." },

  // Pipeline (3)
  { consumerName: "change-pipeline-run-started", filename: "change-pipeline-run-started.svg", phosphorName: "play-circle", status: "NEW", group: "change-types", usedIn: "duty (PipelineRunStarted)", currentIcons: [], alternates: ["ph:flow-arrow-light", "jb-expui-toolwindows:run", "tabler:player-play"], notes: "" },
  { consumerName: "change-pipeline-run-completed", filename: "change-pipeline-run-completed.svg", phosphorName: "check-circle", status: "NEW", group: "change-types", usedIn: "duty (PipelineRunCompleted)", currentIcons: [], alternates: ["ph:flow-arrow-light", "ph:flag-checkered-light", "tabler:flag-check"], notes: "" },
  { consumerName: "change-pipeline-run-failed", filename: "change-pipeline-run-failed.svg", phosphorName: "x-circle", status: "NEW", group: "change-types", usedIn: "duty (PipelineRunFailed)", currentIcons: [], alternates: ["ph:warning-octagon-light", "jb-expui-run:testFailed", "tabler:flag-x"], notes: "" },

  // Scaling (1)
  { consumerName: "change-scaling", filename: "change-scaling.svg", phosphorName: "arrows-out-line-horizontal", status: "NEW", group: "change-types", usedIn: "duty (Scaling)", currentIcons: [], alternates: ["ph:resize-light", "tabler:arrows-horizontal", "mdi:arrow-expand-horizontal"], notes: "Phosphor arrows-out-line-horizontal reads as 'expand'; pair with text for direction (up/down)." },

  // Certificate (2)
  { consumerName: "change-certificate-renewed", filename: "change-certificate-renewed.svg", phosphorName: "certificate", status: "NEW", group: "change-types", usedIn: "duty (CertificateRenewed)", currentIcons: [], alternates: ["ph:seal-check-light", "tabler:certificate", "mdi:certificate-outline"], notes: "" },
  { consumerName: "change-certificate-expired", filename: "change-certificate-expired.svg", phosphorName: "certificate", status: "NEW", group: "change-types", usedIn: "duty (CertificateExpired)", currentIcons: [], alternates: ["ph:certificate-thin", "ph:hourglass-medium-thin", "ph:hourglass-medium-light", "solar:diploma-linear", "solar:diploma-verified-linear", "fluent:certificate-24-regular", "tabler:certificate-2-off", "tabler:certificate-off", "mdi:certificate-outline"], notes: "Same glyph as renewed; consumer colors red. Thin alternatives: ph:certificate-thin (1px) or ph:hourglass-medium-thin. solar:diploma-linear is a fresh thin take. tabler:certificate-2-off has a built-in × marker." },

  // Cost (1)
  { consumerName: "change-cost-change", filename: "change-cost-change.svg", phosphorName: "currency-dollar", status: "NEW", group: "change-types", usedIn: "duty (CostChange)", currentIcons: [], alternates: ["ph:trend-up-light", "ph:trend-down-light", "tabler:coin"], notes: "Alias of insight-cost." },

  // Playbook (3)
  { consumerName: "change-playbook-started", filename: "change-playbook-started.svg", phosphorName: "book-open-text", status: "NEW", group: "change-types", usedIn: "duty (PlaybookStarted)", currentIcons: [], alternates: ["ph:play-circle-light", "ph:book-open-light", "mdi:book-play"], notes: "" },
  { consumerName: "change-playbook-completed", filename: "change-playbook-completed.svg", phosphorName: "book-bookmark", status: "NEW", group: "change-types", usedIn: "duty (PlaybookCompleted)", currentIcons: [], alternates: ["ph:check-circle-light", "ph:book-open-text-light", "mdi:book-check"], notes: "" },
  { consumerName: "change-playbook-failed", filename: "change-playbook-failed.svg", phosphorName: "warning-octagon", status: "NEW", group: "change-types", usedIn: "duty (PlaybookFailed)", currentIcons: [], alternates: ["ph:book-open-text-light", "ph:x-circle-light", "mdi:book-alert"], notes: "" },

  // Instance / node (3)
  { consumerName: "change-run-instances", filename: "change-run-instances.svg", phosphorName: "hard-drives", status: "NEW", group: "change-types", usedIn: "duty (RunInstances)", currentIcons: [], alternates: ["ph:cloud-light", "jb-expui-actions:install", "tabler:server-2"], notes: "AWS-style 'launch instance'." },
  { consumerName: "change-register-node", filename: "change-register-node.svg", phosphorName: "plus-circle", status: "NEW", group: "change-types", usedIn: "duty (RegisterNode)", currentIcons: [], alternates: ["ph:hard-drives-thin", "ph:hard-drives-light", "ph:plus-circle-thin", "solar:server-linear", "solar:server-square-update-linear", "fluent:server-24-regular", "mage:server", "tabler:server", "tabler:server-2", "mdi:server-plus"], notes: "Thin alternatives: ph:hard-drives-thin paired with ph:plus-circle-thin (Phosphor Light family, 1px). solar:server-square-update-linear is the closest single composite (server + plus marker) at thin weight. mage:server is very thin." },
  { consumerName: "change-pulled", filename: "change-pulled.svg", phosphorName: "cloud-arrow-down", status: "NEW", group: "change-types", usedIn: "duty (Pulled)", currentIcons: [], alternates: ["ph:download-simple-light", "tabler:download", "mdi:cloud-download"], notes: "Image/repo pull." },
];

const sizes = [16, 24, 32, 48];
const DEFAULT_SIZE = "24";

/**
 * JetBrains IntelliJ Platform "Expressive UI" icon alternates for UIR rows.
 * Source: https://github.com/JetBrains/intellij-community/tree/master/platform/icons/src/expui/nodes
 * License: Apache 2.0 — attribution required if vendored.
 *
 * Each value is a `jb-expui-<dir>:<name>` spec recognized by iconUrl().
 * Listing them as alternates lets reviewers click-pick a JetBrains glyph
 * for the variant where it reads better than Phosphor (notably class /
 * interface / constant / enum which use distinct shapes + brand colors).
 */
const JB_EXPUI_BY_UIR: Record<string, string[]> = {
  // ---- Code AST ----
  // Containers
  "uir-package": ["jb-expui-nodes:package"],
  "uir-namespace": ["jb-expui-nodes:moduleGroup"],
  "uir-module": ["jb-expui-nodes:module", "jb-expui-nodes:moduleJava"],
  "uir-import": ["jb-expui-nodes:include", "jb-expui-general:import"],
  "uir-export": ["jb-expui-general:export"],

  // Type-shaped
  "uir-class": ["jb-expui-nodes:class", "jb-expui-nodes:classAbstract"],
  "uir-struct": ["jb-expui-nodes:record"],
  "uir-interface": ["jb-expui-nodes:interface"],
  "uir-trait": ["jb-expui-nodes:interface"],
  "uir-record": ["jb-expui-nodes:record"],
  "uir-type-alias": ["jb-expui-nodes:alias"],
  "uir-enum": ["jb-expui-nodes:enum"],
  "uir-enum-member": ["jb-expui-nodes:multipleTypeDefinitions", "jb-expui-nodes:tag"],
  "uir-type-parameter": ["jb-expui-nodes:type"],

  // Callables
  "uir-function": ["jb-expui-nodes:function"],
  "uir-method": ["jb-expui-nodes:method", "jb-expui-nodes:methodAbstract", "jb-expui-nodes:methodReference"],
  "uir-constructor": ["jb-expui-nodes:constructor"],
  "uir-lambda": ["jb-expui-nodes:lambda"],
  "uir-async-fn": ["jb-expui-breakpoints:breakpointLambda", "jb-expui-debugger:thaw"],
  "uir-macro": ["jb-expui-codeInsight:intentionBulb", "jb-expui-codeInsight:quickfixBulb"],
  "uir-decorator": ["jb-expui-nodes:annotation"],

  // Fields & values
  "uir-field": ["jb-expui-nodes:field"],
  "uir-property": ["jb-expui-nodes:property"],
  "uir-variable": ["jb-expui-nodes:variable", "jb-expui-nodes:gvariable"],
  "uir-constant": ["jb-expui-nodes:constant"],
  "uir-parameter": ["jb-expui-nodes:parameter"],
  "uir-keyword": ["jb-expui-nodes:tag"],
  "uir-operator": ["jb-expui-fileTypes:regexp"],

  // Primitives — JetBrains has rich variants in debugger/* and json/*
  "uir-string": ["jb-expui-nodes:textArea", "jb-expui-debugger:dbPrimitive"],
  "uir-numeric": ["jb-expui-general:hashtag", "jb-expui-debugger:dbPrimitive"],
  "uir-boolean": ["jb-expui-debugger:dbPrimitive"],
  "uir-array": ["jb-expui-json:array", "jb-expui-debugger:dbArray"],
  "uir-object": ["jb-expui-json:object", "jb-expui-debugger:dbObject"],
  "uir-null": ["jb-expui-debugger:dbPrimitive", "jb-expui-status:errorOutline"],
  "uir-event": ["jb-expui-nodes:exception", "jb-expui-debugger:thaw"],

  // arch-unit specific
  "uir-endpoint": ["jb-expui-toolwindows:web", "jb-expui-javaee:webService", "jb-expui-nodes:servlet"],
  "uir-test": ["jb-expui-nodes:test", "jb-expui-nodes:testGroup", "jb-expui-runConfigurations:junit"],
  "uir-comment": ["jb-expui-nodes:textArea", "jb-expui-toolwindows:documentation"],
  "uir-unknown": ["jb-expui-nodes:unknown"],

  // ---- SQL UIR — JetBrains DataGrip glyphs ----
  // Containers
  "uir-sql-schema": ["jb-expui-nodes:dataSchema", "jb-expui-gutter:dataSchema"],
  "uir-sql-database": ["jb-expui-toolwindows:toolWindowDataView"],

  // Tables & views
  "uir-sql-table": ["jb-expui-nodes:dataTables"],
  "uir-sql-view": ["jb-expui-nodes:dataTables", "jb-expui-actions:preview"],

  // Functional
  "uir-sql-trigger": ["jb-expui-actions:lightning", "jb-expui-debugger:thaw"],
  "uir-sql-stored-proc": ["jb-expui-nodes:method", "jb-expui-nodes:function"],
  "uir-sql-function": ["jb-expui-nodes:function"],

  // Indices, constraints, columns, sequences
  "uir-sql-index": ["jb-expui-toolwindows:find", "jb-expui-actions:findEntireFile"],
  "uir-sql-column": ["jb-expui-nodes:dataColumn"],
  "uir-sql-primary-key": ["jb-expui-nodes:dataColumn", "jb-expui-xml:id"],
  "uir-sql-foreign-key": ["jb-expui-nodes:related", "jb-expui-actions:diagramDiff"],
  "uir-sql-constraint": ["jb-expui-nodes:locked", "jb-expui-status:warningOutline"],
  "uir-sql-sequence": ["jb-expui-general:hashtag", "jb-expui-actions:groupByModule"],

  // Array column type — JetBrains json:array reads cleanly here too
  "uir-sql-array": ["jb-expui-json:array", "jb-expui-debugger:dbArray"],

  // Query
  "uir-sql-query": ["jb-expui-toolwindows:find", "jb-expui-actions:preview"],

  // ---- UI controls ----
  "chevron-down": ["jb-expui-general:chevronDown"],
  "chevron-up": ["jb-expui-general:chevronUp"],
  "chevron-right": ["jb-expui-general:chevronRight"],
  "close": ["jb-expui-general:close", "jb-expui-general:closeSmall"],
  "ellipsis": ["jb-expui-general:moreHorizontal"],
  "dots-vertical": ["jb-expui-general:moreVertical"],
  "collapse-all": ["jb-expui-general:collapseAll"],
  "expand-all": ["jb-expui-general:expandAll"],
  "search": ["jb-expui-general:search", "jb-expui-toolwindows:find"],
  "filter": ["jb-expui-general:filter"],
  "add": ["jb-expui-general:add", "jb-expui-actions:newFolder"],
  "remove": ["jb-expui-general:remove", "jb-expui-general:delete"],
  "eye": ["jb-expui-general:show", "jb-expui-actions:preview"],
  "eye-closed": ["jb-expui-general:hide"],
  "menu": ["jb-expui-general:menu"],
  "square": ["jb-expui-actions:checked"],
  "chevrons-down": ["jb-expui-general:scrollDown"],
  "chevrons-up": ["jb-expui-general:scrollUp"],

  // ---- Navigation ----
  "arrow-left": ["jb-expui-general:left", "jb-expui-vcs:arrowLeft"],
  "arrow-right": ["jb-expui-general:right", "jb-expui-vcs:arrowRight"],
  "arrow-up": ["jb-expui-general:up", "jb-expui-general:moveUp"],
  "arrow-down": ["jb-expui-general:down", "jb-expui-general:moveDown"],
  "link": ["jb-expui-general:open"],
  "link-external": ["jb-expui-ide:externalLink"],
  "external-link": ["jb-expui-ide:externalLink"],
  "globe": ["jb-expui-toolwindows:web", "jb-expui-gutter:web"],
  "location": ["jb-expui-general:locate"],
  "home": ["jb-expui-javaee:home"],
  "route": ["jb-expui-graph:graphLayout"],

  // ---- Layout & dashboard ----
  "layout-dashboard": ["jb-expui-toolwindows:project"],
  "package": ["jb-expui-nodes:package"],
  "puzzle": ["jb-expui-nodes:plugin", "jb-expui-toolwindows:dependencies"],
  "box": ["jb-expui-nodes:artifact"],

  // ---- Forms & editing ----
  "edit": ["jb-expui-general:edit", "jb-expui-inline:inlineEdit"],
  "save": ["jb-expui-general:save"],
  "cancel": ["jb-expui-general:close"],
  "calendar": ["jb-expui-actions:stopWatch"],

  // ---- Health & status ----
  "warning-circle": ["jb-expui-status:warning", "jb-expui-status:warningOutline"],
  "warning-triangle": ["jb-expui-status:warning"],
  "error": ["jb-expui-status:error", "jb-expui-status:errorOutline"],
  "circle-x": ["jb-expui-general:errorDialog"],
  "info": ["jb-expui-status:info", "jb-expui-status:infoOutline", "jb-expui-general:informationDialog"],
  "question": ["jb-expui-general:questionDialog", "jb-expui-general:questionMark"],
  "circle-outline": ["jb-expui-status:infoOutline"],
  "circle-filled": ["jb-expui-status:info"],
  "pulse": ["jb-expui-toolwindows:profiler"],
  "lightbulb": ["jb-expui-codeInsight:intentionBulb", "jb-expui-codeInsight:quickfixBulb"],
  "loader": ["jb-expui-status:failedInProgress"],
  "skull": ["jb-expui-status:error"],
  "siren": ["jb-expui-status:warning"],
  "debug": ["jb-expui-toolwindows:debug", "jb-expui-run:debug"],

  // ---- Approval & review ----
  "check": ["jb-expui-general:greenCheckmark", "jb-expui-actions:checked"],
  "pass": ["jb-expui-general:successDialog", "jb-expui-run:testPassed"],
  "shield-check": ["jb-expui-codeInsight:inlaySecuredShield"],
  "star": ["jb-expui-nodes:star"],
  "lock": ["jb-expui-general:locked", "jb-expui-nodes:locked"],
  "thumbs-up": ["jb-expui-survey:satisfied", "jb-expui-survey:verySatisfied"],
  "thumbs-down": ["jb-expui-survey:dissatisfied", "jb-expui-survey:veryDissatisfied"],
  "seal-check": ["jb-expui-general:greenCheckmark"],

  // ---- Security & auth ----
  "key": ["jb-expui-xml:id"],
  "shield": ["jb-expui-codeInsight:inlaySecuredShield"],
  "shield-warning": ["jb-expui-status:warning"],
  "user-circle": ["jb-expui-general:user"],
  "lock-open": ["jb-expui-general:unlocked"],

  // ---- Trees, lists & tables ----
  "list-flat": ["jb-expui-general:listFiles"],
  "list-tree": ["jb-expui-general:tree", "jb-expui-general:showAsTree"],
  "table": ["jb-expui-toolwindows:toolWindowDataView"],
  "graph": ["jb-expui-toolwindows:hierarchy", "jb-expui-graph:graphLayout"],
  "boxes": ["jb-expui-nodes:models"],
  "inbox": ["jb-expui-toolwindows:messages"],
  "table-properties": ["jb-expui-nodes:dataTables"],
  "kanban": ["jb-expui-toolwindows:project"],

  // ---- Data & analytics ----
  "chart-bar": ["jb-expui-toolwindows:profiler"],
  "chart-pie": ["jb-expui-toolwindows:profiler"],
  "git-graph": ["jb-expui-toolwindows:hierarchy"],
  "trend-up": ["jb-expui-general:moveUp"],
  "trend-down": ["jb-expui-general:moveDown"],

  // ---- Playbooks & workflows ----
  "playbook": ["jb-expui-toolwindows:documentation"],
  "workflow": ["jb-expui-toolwindows:dataflow"],
  "rocket": ["jb-expui-actions:install", "jb-expui-actions:deploy"],
  "ship-wheel": ["jb-expui-actions:install"],
  "zap": ["jb-expui-actions:lightning"],

  // ---- Configs & metadata ----
  "config": ["jb-expui-general:settings", "jb-expui-fileTypes:config"],
  "tag": ["jb-expui-nodes:tag"],
  "cog": ["jb-expui-general:settings"],
  "sliders": ["jb-expui-general:settings"],

  // ---- Files & code ----
  "file": ["jb-expui-fileTypes:text"],
  "file-code": ["jb-expui-fileTypes:javaScript", "jb-expui-fileTypes:json"],
  "folder": ["jb-expui-nodes:folder"],
  "json": ["jb-expui-fileTypes:json"],
  "markdown": ["jb-expui-fileTypes:text"],
  "copy": ["jb-expui-general:copy", "jb-expui-inline:copy"],
  "code-2": ["jb-expui-fileTypes:javaScript"],
  "binary": ["jb-expui-fileTypes:binaryData"],
  "braces": ["jb-expui-fileTypes:json"],
  "file-json": ["jb-expui-fileTypes:json"],
  "file-text": ["jb-expui-fileTypes:text"],
  "file-spreadsheet": ["jb-expui-fileTypes:csv"],
  "function-square": ["jb-expui-nodes:function"],
  "download": ["jb-expui-general:download"],
  "upload": ["jb-expui-general:upload"],
  "archive": ["jb-expui-fileTypes:archive"],
  "folder-git-2": ["jb-expui-nodes:folderGithub"],
  "diff": ["jb-expui-vcs:diff", "jb-expui-actions:diagramDiff"],

  // ---- Git & source control ----
  "git-branch": ["jb-expui-vcs:changelist"],
  "git-merge": ["jb-expui-vcs:merge"],
  "git-pull-request -> git-pr": ["jb-expui-welcome:fromVCSTab"],
  "repo -> folder-git": ["jb-expui-nodes:folderGithub"],

  // ---- Dev tools & terminal ----
  "terminal": ["jb-expui-fileTypes:shell"],
  "command": ["jb-expui-general:keyboard"],
  "wrench": ["jb-expui-build:dependencyAnalyzer"],
  "bug": ["jb-expui-toolwindows:debug"],

  // ---- AI & ML ----
  "sparkles": ["jb-expui-actions:aiIntentionBulb", "jb-expui-toolwindows:toolWindowAskAI"],
  "brain": ["jb-expui-toolwindows:toolWindowAskAI"],
  "robot-ai": ["jb-expui-toolwindows:toolWindowAskAI"],
  "magic-wand": ["jb-expui-actions:realIntentionBulb", "jb-expui-actions:suggestedRefactoringBulb"],

  // ---- Infrastructure ----
  "server": ["jb-expui-toolwindows:webServer"],
  "server-process": ["jb-expui-toolwindows:webServer"],
  "database": ["jb-expui-toolwindows:toolWindowDataView", "jb-expui-nodes:dataTables"],
  "database-plus": ["jb-expui-toolwindows:toolWindowDataView"],
  "cloud": ["jb-expui-actions:deploy"],
  "cloud-download": ["jb-expui-general:download"],
  "chip": ["jb-expui-fileTypes:hprof"],
  "network": ["jb-expui-graph:graphLayout"],
  "broadcast": ["jb-expui-actions:lightning"],
  "queue": ["jb-expui-toolwindows:messages"],

  // ---- Actions & tools ----
  "refresh": ["jb-expui-general:refresh"],
  "trash": ["jb-expui-general:delete"],
  "beaker": ["jb-expui-runConfigurations:junit", "jb-expui-toolwindows:run"],

  // ---- People & orgs ----
  "person -> user": ["jb-expui-general:user"],
  "organization": ["jb-expui-general:groups"],
  "hubot": ["jb-expui-toolwindows:toolWindowAskAI"],

  // ---- Time ----
  "clock": ["jb-expui-actions:stopWatch", "jb-expui-general:history"],
  "watch": ["jb-expui-actions:stopWatch"],
  "stopwatch -> watch (timer)": ["jb-expui-actions:stopWatch"],

  // ---- Communication ----
  "comment-discussion": ["jb-expui-toolwindows:messages", "jb-expui-toolwindows:notifications"],
  "bell": ["jb-expui-toolwindows:notifications"],
  "envelope": ["jb-expui-toolwindows:messages"],
  "share": ["jb-expui-vcs:push"],

  // ---- Media ----
  "image": ["jb-expui-fileTypes:image", "jb-expui-actions:viewAsImage"],

  // ---- Runtime & process ----
  "play": ["jb-expui-progress:resume", "jb-expui-run:run"],
  "pause": ["jb-expui-progress:pause", "jb-expui-run:pause"],
  "stop": ["jb-expui-progress:stop", "jb-expui-run:stop"],
  "skip-forward": ["jb-expui-actions:playForward"],
  "history": ["jb-expui-general:history", "jb-expui-actions:stopWatch"],

  // ---- Final pass: aliases + exotic ----
  // Aliases — same JB glyph as their target row (visual cue that they map to the same thing)
  "x -> close": ["jb-expui-general:close"],
  "caret-down -> chevron-down": ["jb-expui-general:chevronDown"],
  "magnifying-glass -> search": ["jb-expui-general:search"],
  "funnel -> filter": ["jb-expui-general:filter"],
  "check-thin -> check": ["jb-expui-general:greenCheckmark"],
  "arrows-clockwise -> refresh": ["jb-expui-general:refresh"],
  "hourglass-medium -> hourglass": ["jb-expui-status:failedInProgress"],
  "funnel-data": ["jb-expui-general:filter"],

  // Communication
  "bell-slash": ["jb-expui-toolwindows:notifications"], // closest JB has — same glyph as bell, no muted variant
  "phone": ["jb-expui-toolwindows:messages"],
  "at": ["jb-expui-general:user"],

  // Forms / config
  "toggle-on": ["jb-expui-general:show"],
  "toggle-off": ["jb-expui-general:hide"],
  "form": ["jb-expui-fileTypes:uiForm"],
  "select": ["jb-expui-general:dropdown"],
  "calendar-blank": ["jb-expui-actions:stopWatch"],

  // Infra
  "swap": ["jb-expui-actions:swapPanels"],

  // Layout
  "grid": ["jb-expui-image:grid"],
  "sidebar": ["jb-expui-toolwindows:project"],

  // Trees/tables
  "rows": ["jb-expui-table:pagination"],
  "columns": ["jb-expui-actions:split"],

  // Security
  "fingerprint": ["jb-expui-general:user"],
  "sign-in": ["jb-expui-general:successLogin", "jb-expui-vcs:fetch"],
  "sign-out": ["jb-expui-general:exit"],

  // Media — JetBrains lacks dedicated camera/video/speaker glyphs. Closest:
  "camera": ["jb-expui-actions:viewAsImage"],
  "video": ["jb-expui-actions:playForward"],
  "speaker": ["jb-expui-toolwindows:notifications"],
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function readIncumbentSvg(filename: string): string | undefined {
  const p = join(svgDir, filename);
  if (!existsSync(p)) return undefined;
  return readFileSync(p, "utf8");
}

type Variant = "outline" | "filled";

function pickAttrs(pick: string | undefined, variant: Variant | undefined): string {
  if (!pick || !variant) return "";
  return ` data-pick="${escapeHtml(pick)}" data-variant="${variant}" role="button" tabindex="0"`;
}

function iconUrl(prefixedName: string, size: number): string {
  // Synthetic "jb-expui-<dir>:<file>" prefix maps to raw GitHub URL for the
  // JetBrains intellij-community Expressive UI icon set (Apache 2.0).
  // Example: "jb-expui-nodes:class" -> .../platform/icons/src/expui/nodes/class.svg
  const colon = prefixedName.indexOf(":");
  const prefix = prefixedName.slice(0, colon);
  const name = prefixedName.slice(colon + 1);
  if (prefix.startsWith("jb-expui-")) {
    const dir = prefix.slice("jb-expui-".length);
    return `https://raw.githubusercontent.com/JetBrains/intellij-community/master/platform/icons/src/expui/${dir}/${name}.svg`;
  }
  // Default: Iconify CDN. Note: Iconify ignores `?height=` for the SVG endpoint
  // when used as <img src> (it controls intrinsic dimensions, not render size),
  // but the CSS still scales the image — kept for cache-busting parity.
  return `https://api.iconify.design/${prefix}/${name}.svg?height=${size}`;
}

function iconifyImg(prefixedName: string, size: number, pick?: string, variant?: Variant): string {
  const url = iconUrl(prefixedName, size);
  const cls = pick ? `iconify pickable pick-${variant ?? "outline"}` : "iconify";
  const tip = pick ? ` — click to pick ${variant}` : "";
  return `<img class="${cls}" src="${url}" alt="${escapeHtml(prefixedName)}" title="${escapeHtml(prefixedName)}${tip}" loading="lazy"${pickAttrs(pick, variant)} />`;
}

function phosphorImg(name: string, size: number, weight: "light" | "fill", pick?: string, variant?: Variant): string {
  const iconName = `${name}-${weight}`;
  const cls = pick ? `iconify ph-${weight} pickable pick-${variant ?? "outline"}` : `iconify ph-${weight}`;
  const tip = pick ? ` — click to pick ${variant}` : "";
  return `<img class="${cls}" src="https://api.iconify.design/ph/${iconName}.svg?height=${size}" alt="ph:${escapeHtml(iconName)}" title="ph:${escapeHtml(iconName)}${tip}" loading="lazy"${pickAttrs(pick, variant)} />`;
}

function inlineSvg(svg: string, size: number, pick?: string, variant?: Variant): string {
  // Force width/height so all sizes render uniformly. Strip existing width/height.
  const cleaned = svg
    .replace(/\swidth\s*=\s*"[^"]*"/i, "")
    .replace(/\sheight\s*=\s*"[^"]*"/i, "")
    .replace(/<svg/i, `<svg width="${size}" height="${size}"`);
  const cls = pick ? `incumbent pickable pick-${variant ?? "outline"}` : "incumbent";
  const title = pick ? `incumbent ${size}px — click to pick ${variant}` : `incumbent svg/${size}px`;
  return `<span class="${cls}" title="${title}"${pickAttrs(pick, variant)}>${cleaned}</span>`;
}

function renderRow(row: Row): string {
  const incumbent = row.status === "EXISTS" ? readIncumbentSvg(row.filename) : undefined;
  const rowKey = row.consumerName;
  // Merge JetBrains expui alternates (UIR rows only) without mutating the source row.
  const jbExtras = JB_EXPUI_BY_UIR[rowKey] ?? [];
  const effectiveAlternates: string[] = [...(row.alternates ?? []), ...jbExtras];

  function inferVariant(spec: string): Variant {
    // Heuristic: filled-leaning suffixes + collections.
    const lower = spec.toLowerCase();
    if (lower.endsWith("-fill") || lower.endsWith("-filled") || lower.endsWith("-solid")) return "filled";
    if (lower.includes("logos") || lower.includes("vscode-icons") || lower.includes("simple-icons")) return "filled";
    if (lower.startsWith("jb-expui-")) return "filled"; // JetBrains expui = colored multi-tone
    return "outline";
  }

  const currentCells = sizes
    .map((sz) => {
      const parts: string[] = [];
      if (incumbent) parts.push(inlineSvg(incumbent, sz, "incumbent", "outline"));
      for (const ic of row.currentIcons) parts.push(iconifyImg(ic, sz, ic, inferVariant(ic)));
      return `<div class="size-cell" data-size="${sz}"><div class="size-label">${sz}px</div><div class="glyphs">${parts.join("") || '<span class="muted">—</span>'}</div></div>`;
    })
    .join("");

  const phLightPick = `ph:${row.phosphorName}-light`;
  const phFillPick = `ph:${row.phosphorName}-fill`;

  const proposedLightCells = sizes
    .map((sz) => {
      const phMain = phosphorImg(row.phosphorName, sz, "light", phLightPick, "outline");
      const alts = effectiveAlternates
        .map((spec) => {
          const v = inferVariant(spec);
          const url = iconUrl(spec, sz);
          // Compact label for the alt chip (jb-expui-nodes -> "jb").
          const prefix = spec.split(":")[0];
          const shortLabel = prefix.startsWith("jb-expui-") ? "jb" : prefix;
          return `<span class="alt-glyph pickable pick-${v}" title="${escapeHtml(spec)} — click to pick ${v}" data-pick="${escapeHtml(spec)}" data-variant="${v}" role="button" tabindex="0"><img class="iconify alt" src="${url}" alt="${escapeHtml(spec)}" loading="lazy" /><span class="alt-label">${escapeHtml(shortLabel)}</span></span>`;
        })
        .join("");
      return `<div class="size-cell" data-size="${sz}"><div class="size-label">${sz}px</div><div class="glyphs">${phMain}${alts}</div></div>`;
    })
    .join("");

  const proposedFillCells = sizes
    .map(
      (sz) =>
        `<div class="size-cell" data-size="${sz}"><div class="size-label">${sz}px</div><div class="glyphs">${phosphorImg(row.phosphorName, sz, "fill", phFillPick, "filled")}</div></div>`,
    )
    .join("");

  const statusClass = row.status.toLowerCase();

  // Two independent radio groups per row: outline + filled. Each carries the
  // same option set (incumbent / ph weights / current sources / alternates +
  // skip/maintain), so the user picks both variants for every row.
  type Choice = { value: string; label: string; help?: string };
  const baseChoices: Choice[] = [];
  if (row.status === "EXISTS") baseChoices.push({ value: "incumbent", label: "incumbent", help: `svg/${row.filename}` });
  baseChoices.push({ value: `ph:${row.phosphorName}-light`, label: "ph light", help: `ph:${row.phosphorName}-light` });
  baseChoices.push({ value: `ph:${row.phosphorName}-fill`, label: "ph fill", help: `ph:${row.phosphorName}-fill` });
  for (const alt of effectiveAlternates) {
    const altPrefix = alt.split(":")[0];
    const altLabel = altPrefix.startsWith("jb-expui-") ? "jb" : altPrefix;
    baseChoices.push({ value: alt, label: altLabel, help: alt });
  }
  for (const ic of row.currentIcons) baseChoices.push({ value: ic, label: `keep ${ic.split(":")[0]}`, help: ic });
  baseChoices.push({ value: "skip", label: "skip", help: "skip this variant — needs revisit" });
  baseChoices.push({ value: "maintain", label: "maintain", help: "no new icon for this variant — keep incumbent" });

  function chipsFor(variant: Variant): string {
    const groupName = `sel-${variant}-${rowKey.replace(/[^a-z0-9]+/gi, "_")}`;
    return baseChoices
      .map(
        (c) =>
          `<label class="chip" title="${escapeHtml(c.help ?? c.label)}"><input type="radio" name="${groupName}" value="${escapeHtml(c.value)}" data-row="${escapeHtml(rowKey)}" data-variant="${variant}" /><span>${escapeHtml(c.label)}</span></label>`,
      )
      .join("");
  }
  const chips = `
    <div class="variant-block">
      <div class="variant-label">outline <button class="unpick" type="button" data-row="${escapeHtml(rowKey)}" data-variant="outline" title="unpick — clear outline choice for this row">×</button></div>
      <div class="chips" data-variant="outline">${chipsFor("outline")}</div>
    </div>
    <div class="variant-block">
      <div class="variant-label">filled <button class="unpick" type="button" data-row="${escapeHtml(rowKey)}" data-variant="filled" title="unpick — clear filled choice for this row">×</button></div>
      <div class="chips" data-variant="filled">${chipsFor("filled")}</div>
    </div>`;

  // Component name as the consumer would import it (e.g. "Ui<Name>"; matches
  // the codegen rule in packages/ui/scripts/build.ts).
  const stripPrefix = (n: string) =>
    n.startsWith("uir-sql-") ? "sql-" + n.slice("uir-sql-".length) :
    n.startsWith("uir-") ? n.slice("uir-".length) : n;
  const componentBase = "Ui" + stripPrefix(rowKey)
    .replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/)
    .map(w => w[0].toUpperCase() + w.slice(1)).join("");

  return `
  <tr data-status="${row.status}" data-group="${row.group}" data-consumer="${escapeHtml(row.consumerName)}" data-row-key="${escapeHtml(rowKey)}">
    <td class="name">
      <div class="primary"><a class="row-detail-toggle" data-row="${escapeHtml(rowKey)}" href="#row=${encodeURIComponent(rowKey)}" title="Open detail panel">${escapeHtml(row.consumerName)}</a></div>
      <div class="muted small">${escapeHtml(row.filename)}</div>
      <div class="muted small" style="font-family:'SF Mono',Monaco,monospace;color:#2563eb">${escapeHtml(componentBase)}</div>
    </td>
    <td class="used-in muted small">${escapeHtml(row.usedIn)}</td>
    <td class="cell current">${currentCells}</td>
    <td class="cell proposed-light">${proposedLightCells}</td>
    <td class="cell proposed-fill">${proposedFillCells}</td>
    <td class="status"><span class="badge ${statusClass}">${row.status}</span></td>
    <td class="notes muted small">${escapeHtml(row.notes)}<div class="muted small">ph:${escapeHtml(row.phosphorName)}</div></td>
    <td class="select-cell">
      ${chips}
      <input class="row-note" type="text" placeholder="note (optional)…" data-row="${escapeHtml(rowKey)}" />
    </td>
  </tr>
  <tr class="row-detail" data-detail-for="${escapeHtml(rowKey)}" hidden>
    <td colspan="8">
      <div class="detail-panel" data-detail-for="${escapeHtml(rowKey)}" data-component="${escapeHtml(componentBase)}">
        <div class="detail-controls">
          <div class="detail-control-block">
            <label>Variant</label>
            <div class="detail-variants">
              <button type="button" class="detail-variant active" data-variant="outline">outline</button>
              <button type="button" class="detail-variant" data-variant="filled">filled</button>
            </div>
          </div>
          <div class="detail-control-block">
            <label>Color</label>
            <div class="detail-colors">
              <button type="button" class="detail-color active" data-color="currentColor" style="background:transparent;border-style:dashed" title="currentColor"></button>
              <button type="button" class="detail-color" data-color="#334155" style="background:#334155" title="slate"></button>
              <button type="button" class="detail-color" data-color="#3b82f6" style="background:#3b82f6" title="blue"></button>
              <button type="button" class="detail-color" data-color="#059669" style="background:#059669" title="emerald"></button>
              <button type="button" class="detail-color" data-color="#d97706" style="background:#d97706" title="amber"></button>
              <button type="button" class="detail-color" data-color="#f43f5e" style="background:#f43f5e" title="rose"></button>
              <button type="button" class="detail-color" data-color="#7c3aed" style="background:#7c3aed" title="violet"></button>
              <input type="text" class="detail-color-custom" placeholder="custom #ff0080" />
            </div>
          </div>
          <div class="detail-control-block">
            <label>Size: <span class="detail-size-label">48</span>px</label>
            <input type="range" class="detail-size" min="16" max="96" value="48" />
          </div>
        </div>
        <div class="detail-preview-row">
          <div class="detail-preview-large"></div>
          <div class="detail-preview-grid">
            <div data-px="16"><div class="detail-px-label">16</div></div>
            <div data-px="24"><div class="detail-px-label">24</div></div>
            <div data-px="32"><div class="detail-px-label">32</div></div>
            <div data-px="48"><div class="detail-px-label">48</div></div>
          </div>
        </div>
        <div class="detail-snippets">
          <div class="detail-snippet">
            <div class="detail-snippet-label">Import</div>
            <code class="detail-snippet-import"></code>
            <button type="button" class="detail-copy" data-copy="import">copy</button>
          </div>
          <div class="detail-snippet">
            <div class="detail-snippet-label">JSX</div>
            <code class="detail-snippet-jsx"></code>
            <button type="button" class="detail-copy" data-copy="jsx">copy</button>
          </div>
        </div>
        <div class="detail-meta muted small">Source: <code class="detail-source">(determined by current pick)</code></div>
      </div>
    </td>
  </tr>`;
}

function renderGroupSection(group: Group, subset: Row[]): string {
  if (subset.length === 0) return "";
  const newCount = subset.filter((r) => r.status === "NEW").length;
  const existsCount = subset.filter((r) => r.status === "EXISTS").length;
  const aliasCount = subset.filter((r) => r.status === "ALIAS").length;
  const meta = [
    `${subset.length} total`,
    newCount ? `${newCount} new` : null,
    existsCount ? `${existsCount} existing` : null,
    aliasCount ? `${aliasCount} alias` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return `
  <section id="group-${group}" class="group" data-group="${group}">
    <h2 class="section-heading">${escapeHtml(GROUP_LABELS[group])} <span class="muted">(${meta})</span></h2>
    <table class="comparison">
      <thead>
        <tr>
          <th>Name / file</th>
          <th>Used in</th>
          <th>Current glyph(s)</th>
          <th class="proposed-light">Proposed — Phosphor Light</th>
          <th class="proposed-fill">Proposed — Phosphor Fill</th>
          <th>Status</th>
          <th>Notes</th>
          <th>Choose</th>
        </tr>
      </thead>
      <tbody>
        ${subset.map(renderRow).join("")}
      </tbody>
    </table>
  </section>`;
}

function buildHtml(): string {
  const counts = {
    NEW: rows.filter((r) => r.status === "NEW").length,
    EXISTS: rows.filter((r) => r.status === "EXISTS").length,
    ALIAS: rows.filter((r) => r.status === "ALIAS").length,
  };

  const css = `
    :root {
      --fg: #1f2937;
      --muted: #6b7280;
      --bg: #f9fafb;
      --card: #ffffff;
      --border: #e5e7eb;
      --new: #2563eb;
      --exists: #d97706;
      --alias: #6b7280;
    }
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--fg); background: var(--bg); margin: 0; padding: 24px; line-height: 1.4; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2.section-heading { font-size: 16px; margin: 32px 0 8px; padding: 6px 12px; background: var(--card); border-left: 4px solid var(--new); border-radius: 4px; }
    h2.section-heading + table .badge.exists { background: #fef3c7; color: var(--exists); }
    .summary { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; padding: 12px 16px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; }
    .summary .stat { font-size: 13px; color: var(--muted); }
    .summary .stat strong { color: var(--fg); font-weight: 600; }
    .controls { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .controls input[type=search] { padding: 6px 10px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; min-width: 220px; }
    .controls label { font-size: 13px; color: var(--muted); display: inline-flex; gap: 6px; align-items: center; }
    .controls .pill { padding: 4px 10px; border: 1px solid var(--border); border-radius: 999px; background: var(--card); font-size: 12px; cursor: pointer; user-select: none; }
    .controls .pill.active { background: var(--fg); color: white; border-color: var(--fg); }
    table.comparison { width: 100%; border-collapse: collapse; background: var(--card); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
    table.comparison th, table.comparison td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: top; }
    table.comparison th { position: sticky; top: 0; background: #f3f4f6; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); z-index: 1; }
    .name .primary { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 13px; }
    .small { font-size: 11px; }
    .muted { color: var(--muted); }
    .cell { white-space: nowrap; }
    .size-cell { display: inline-block; padding: 4px 8px; vertical-align: top; }
    .size-cell + .size-cell { border-left: 1px dashed var(--border); }
    .size-label { font-size: 10px; color: var(--muted); text-align: center; margin-bottom: 4px; }
    .glyphs { display: inline-flex; gap: 6px; align-items: center; min-height: 24px; }
    .glyphs img.iconify { display: inline-block; }
    .glyphs img.iconify.alt { opacity: 0.92; }
    .alt-glyph { display: inline-flex; flex-direction: column; align-items: center; gap: 2px; padding: 2px 4px; border-left: 1px dotted var(--border); }
    .alt-glyph .alt-label { font-size: 9px; color: var(--muted); text-transform: lowercase; letter-spacing: 0.02em; }
    .incumbent { display: inline-flex; align-items: center; padding: 2px; border: 1px dashed #d1d5db; border-radius: 3px; }
    .pickable { cursor: pointer; border-radius: 4px; transition: transform 80ms, box-shadow 80ms, background 80ms; }
    .pickable:hover { box-shadow: 0 0 0 2px #c7d2fe; transform: scale(1.06); }
    .pickable.pick-outline:hover { background: #eef2ff; }
    .pickable.pick-filled:hover { background: #fef3c7; box-shadow: 0 0 0 2px #fde68a; }
    .pickable:focus { outline: 2px solid #2563eb; outline-offset: 1px; }
    /* Selected states — independent rings for outline vs filled. Both can light up on the same icon if it was picked for both variants. */
    .pickable.selected-outline { background: #dbeafe; box-shadow: 0 0 0 2px #2563eb; }
    .pickable.selected-filled { background: #fef3c7; box-shadow: 0 0 0 2px #d97706; }
    .pickable.selected-outline.selected-filled { background: linear-gradient(135deg, #dbeafe 50%, #fef3c7 50%); box-shadow: 0 0 0 2px #2563eb, 0 0 0 4px #d97706; }
    .alt-glyph.pickable.selected-outline .alt-label { color: #2563eb; font-weight: 600; }
    .alt-glyph.pickable.selected-filled .alt-label { color: #d97706; font-weight: 600; }
    .variant-block { margin-bottom: 6px; }
    .variant-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 3px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
    button.unpick { width: 16px; height: 16px; padding: 0; border: 1px solid var(--border); border-radius: 50%; background: var(--card); color: var(--muted); font-size: 11px; line-height: 1; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    button.unpick:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
    .variant-block:nth-of-type(1) .variant-label { color: #2563eb; }
    .variant-block:nth-of-type(2) .variant-label { color: #d97706; }
    .variant-block .chips .chip:has(input:checked) { background: #2563eb; }
    .variant-block:nth-of-type(2) .chips .chip:has(input:checked) { background: #d97706; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; }
    .badge.new { background: #dbeafe; color: var(--new); }
    .badge.exists { background: #fef3c7; color: var(--exists); }
    .badge.alias { background: #f3f4f6; color: var(--alias); }
    body[data-size-filter="16"] .size-cell:not([data-size="16"]) { display: none; }
    body[data-size-filter="24"] .size-cell:not([data-size="24"]) { display: none; }
    body[data-size-filter="32"] .size-cell:not([data-size="32"]) { display: none; }
    body[data-size-filter="48"] .size-cell:not([data-size="48"]) { display: none; }
    body[data-status-filter="NEW"] tr[data-status]:not([data-status="NEW"]) { display: none; }
    body[data-status-filter="EXISTS"] tr[data-status]:not([data-status="EXISTS"]) { display: none; }
    body[data-status-filter="ALIAS"] tr[data-status]:not([data-status="ALIAS"]) { display: none; }
    /* Pick-state filter — driven by JS toggling .row-fully-picked / .row-partial / .row-unpicked on each <tr>. */
    body[data-pick-filter="unpicked"] tr[data-row-key]:not(.row-unpicked) { display: none; }
    body[data-pick-filter="partial"] tr[data-row-key]:not(.row-partial) { display: none; }
    body[data-pick-filter="needs-attn"] tr[data-row-key].row-fully-picked { display: none; }
    body[data-pick-filter="overridden"] tr[data-row-key]:not(.row-overridden) { display: none; }
    body[data-variant-filter="light"] td.proposed-fill, body[data-variant-filter="light"] th.proposed-fill { display: none; }
    body[data-variant-filter="fill"] td.proposed-light, body[data-variant-filter="fill"] th.proposed-light { display: none; }
    .footer { margin-top: 32px; padding: 16px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; font-size: 12px; color: var(--muted); line-height: 1.6; }
    .select-cell { min-width: 280px; max-width: 360px; }
    .chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .chip { display: inline-flex; align-items: center; padding: 2px 8px; border: 1px solid var(--border); border-radius: 999px; background: #f9fafb; font-size: 11px; cursor: pointer; user-select: none; transition: background 80ms, border-color 80ms; }
    .chip input { display: none; }
    .chip:hover { background: #eef2ff; border-color: #c7d2fe; }
    .chip:has(input:checked) { background: #2563eb; color: white; border-color: #2563eb; font-weight: 600; }
    .row-note { margin-top: 4px; width: 100%; padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 11px; }
    tr[data-row-key].chosen td { background: rgba(34, 197, 94, 0.04); }
    tr[data-row-key].chosen td.name .primary::after { content: " ✓"; color: #16a34a; }
    .save-bar { position: sticky; top: 0; z-index: 10; background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .save-bar .progress { font-size: 13px; color: var(--muted); }
    .save-bar .progress strong { color: var(--fg); }
    .save-bar progress { width: 200px; height: 8px; }
    .save-bar button { padding: 6px 14px; border: 1px solid var(--border); border-radius: 4px; background: var(--fg); color: white; font-size: 12px; font-weight: 600; cursor: pointer; }
    .save-bar button.secondary { background: var(--card); color: var(--fg); }
    .save-bar button:hover { opacity: 0.9; }
    .save-status { font-size: 12px; color: var(--muted); }
    .save-status.ok { color: #16a34a; }
    .save-status.err { color: #dc2626; }
    .callout { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; font-size: 12.5px; line-height: 1.6; }
    .callout strong { color: #92400e; }
    .callout ul { margin: 6px 0 0 18px; padding: 0; }
    .callout li { margin: 2px 0; color: #78350f; }
    .callout code { background: rgba(146, 64, 14, 0.08); padding: 1px 4px; border-radius: 3px; font-size: 11.5px; }
    nav.toc { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; font-size: 12px; }
    /* Detail panel */
    a.row-detail-toggle { color: var(--fg); text-decoration: none; cursor: pointer; }
    a.row-detail-toggle:hover { color: #2563eb; text-decoration: underline; }
    tr.row-detail td { background: #f8fafc; padding: 16px 20px !important; border-top: 0; }
    .detail-panel { display: flex; flex-direction: column; gap: 12px; max-width: 100%; }
    .detail-controls { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
    .detail-control-block { display: flex; flex-direction: column; gap: 6px; min-width: 160px; }
    .detail-control-block > label { font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .detail-variants, .detail-colors { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    button.detail-variant { padding: 4px 12px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--card); cursor: pointer; }
    button.detail-variant.active { background: #2563eb; color: white; border-color: #2563eb; font-weight: 600; }
    button.detail-color { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #e5e7eb; cursor: pointer; padding: 0; }
    button.detail-color.active { border-color: var(--fg); box-shadow: 0 0 0 2px white inset; }
    input.detail-color-custom { padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 12px; min-width: 140px; }
    input.detail-size { width: 200px; }
    .detail-preview-row { display: flex; gap: 24px; align-items: center; padding: 16px; background: white; border: 1px solid var(--border); border-radius: 6px; }
    .detail-preview-large { display: flex; align-items: center; justify-content: center; min-width: 96px; min-height: 96px; }
    .detail-preview-grid { display: flex; gap: 16px; align-items: flex-end; }
    .detail-preview-grid > div { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .detail-px-label { font-size: 10px; color: var(--muted); }
    .detail-snippets { display: flex; flex-direction: column; gap: 8px; }
    .detail-snippet { display: flex; align-items: center; gap: 8px; background: #1e293b; padding: 6px 10px; border-radius: 4px; }
    .detail-snippet-label { font-size: 10px; color: #94a3b8; min-width: 50px; text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-snippet code { flex: 1; color: #e2e8f0; font-size: 12px; font-family: 'SF Mono', Monaco, monospace; word-break: break-all; }
    button.detail-copy { background: #475569; color: white; border: none; border-radius: 3px; padding: 3px 10px; font-size: 11px; cursor: pointer; }
    button.detail-copy:hover { background: #64748b; }
    button.detail-copy.copied { background: #16a34a; }
    .detail-meta code { background: #f3f4f6; padding: 1px 6px; border-radius: 3px; font-size: 11px; }
    nav.toc a { color: var(--new); text-decoration: none; margin-right: 12px; display: inline-block; padding: 2px 0; }
    nav.toc a:hover { text-decoration: underline; }
    section.group { margin-bottom: 28px; }
  `;

  const groupedSections = GROUP_ORDER.map((g) => {
    const subset = rows.filter((r) => r.group === g);
    return { group: g, subset };
  }).filter(({ subset }) => subset.length > 0);

  // Defaults: every row defaults to ph:<name>-light / ph:<name>-fill so reviewers
  // only need to click the rows where Phosphor isn't the right pick.
  const defaultsByRow: Record<string, { outline: string; filled: string }> = {};
  for (const r of rows) {
    if (r.status === "ALIAS") continue; // aliases stay null until explicitly chosen
    defaultsByRow[r.consumerName] = {
      outline: `ph:${r.phosphorName}-light`,
      filled: `ph:${r.phosphorName}-fill`,
    };
  }

  // Pre-existing on-disk selections — merge into the initial state so reviewers
  // pick up where they left off even on a different machine / cleared localStorage.
  const selectionsPath = join(repoRoot, "hack", "icon-selections.json");
  let priorState: Record<string, { outline?: string | null; filled?: string | null; note?: string }> = {};
  if (existsSync(selectionsPath)) {
    try {
      const parsed = JSON.parse(readFileSync(selectionsPath, "utf8"));
      if (Array.isArray(parsed.rows)) {
        for (const r of parsed.rows) {
          if (!r || !r.consumerName) continue;
          priorState[r.consumerName] = {
            outline: r.outline ?? null,
            filled: r.filled ?? null,
            note: r.note ?? "",
          };
        }
      }
    } catch {
      // ignore — bad JSON; fall through with empty priorState
    }
  }

  const tocLinks = groupedSections
    .map(({ group, subset }) => `<a href="#group-${group}">${escapeHtml(GROUP_LABELS[group])} <span class="muted">(${subset.length})</span></a>`)
    .join("");

  const sectionsHtml = groupedSections.map(({ group, subset }) => renderGroupSection(group, subset)).join("");

  const js = `
    const STORAGE_KEY = 'flanksource-icons-selections-v2';
    const DEFAULTS = ${JSON.stringify(defaultsByRow)};
    const PRIOR = ${JSON.stringify(priorState)};
    const sizeButtons = document.querySelectorAll('[data-size-btn]');
    sizeButtons.forEach((btn) => btn.addEventListener('click', () => {
      sizeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.dataset.sizeBtn;
      if (v === 'all') document.body.removeAttribute('data-size-filter');
      else document.body.setAttribute('data-size-filter', v);
    }));
    const statusButtons = document.querySelectorAll('[data-status-btn]');
    statusButtons.forEach((btn) => btn.addEventListener('click', () => {
      statusButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.dataset.statusBtn;
      if (v === 'all') document.body.removeAttribute('data-status-filter');
      else document.body.setAttribute('data-status-filter', v);
    }));
    const variantButtons = document.querySelectorAll('[data-variant-btn]');
    variantButtons.forEach((btn) => btn.addEventListener('click', () => {
      variantButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.dataset.variantBtn;
      if (v === 'both') document.body.removeAttribute('data-variant-filter');
      else document.body.setAttribute('data-variant-filter', v);
    }));
    const pickButtons = document.querySelectorAll('[data-pick-btn]');
    pickButtons.forEach((btn) => btn.addEventListener('click', () => {
      pickButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.dataset.pickBtn;
      if (v === 'all') document.body.removeAttribute('data-pick-filter');
      else document.body.setAttribute('data-pick-filter', v);
    }));
    const search = document.getElementById('search');
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('tr[data-consumer]').forEach((tr) => {
        if (!q) { tr.style.display = ''; return; }
        const text = tr.textContent.toLowerCase();
        tr.style.display = text.includes(q) ? '' : 'none';
      });
    });

    // ---- Selection state ----
    // Shape: { [rowKey]: { outline?: string|null, filled?: string|null, note?: string } }
    // null means "explicitly unpicked" — different from absent (= default applies).
    // Initial state = DEFAULTS (ph light + ph fill) <- PRIOR (on-disk file) <- localStorage.
    function loadState() {
      const merged = {};
      // 1. Defaults — ph:<name>-{light,fill} for every non-alias row.
      for (const k of Object.keys(DEFAULTS)) {
        merged[k] = { outline: DEFAULTS[k].outline, filled: DEFAULTS[k].filled, note: '' };
      }
      // 2. Prior on-disk state — null values mean "explicitly cleared".
      for (const k of Object.keys(PRIOR)) {
        merged[k] = merged[k] || {};
        const p = PRIOR[k];
        if ('outline' in p) merged[k].outline = p.outline; // string or null
        if ('filled' in p) merged[k].filled = p.filled;
        if (p.note != null) merged[k].note = p.note;
      }
      // 3. localStorage on top (most recent in-browser edits win).
      try {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        for (const k of Object.keys(local)) {
          merged[k] = merged[k] || {};
          const l = local[k];
          if ('outline' in l) merged[k].outline = l.outline;
          if ('filled' in l) merged[k].filled = l.filled;
          if (l.note != null) merged[k].note = l.note;
        }
      } catch { /* ignore */ }
      return merged;
    }
    function saveState(state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    let state = loadState();

    function refreshRowHighlights(tr) {
      const key = tr.dataset.rowKey;
      const entry = state[key] || {};
      // Clear all variant-marked pickables in the row.
      tr.querySelectorAll('.pickable.selected-outline, .pickable.selected-filled').forEach((el) => {
        el.classList.remove('selected-outline', 'selected-filled');
      });
      if (entry.outline) {
        tr.querySelectorAll('[data-pick="' + CSS.escape(entry.outline) + '"]').forEach((el) => el.classList.add('selected-outline'));
      }
      if (entry.filled) {
        tr.querySelectorAll('[data-pick="' + CSS.escape(entry.filled) + '"]').forEach((el) => el.classList.add('selected-filled'));
      }
      // Pick-state classes — drive the picks filter pill.
      tr.classList.remove('chosen', 'row-fully-picked', 'row-partial', 'row-unpicked', 'row-overridden');
      const hasOutline = !!entry.outline;
      const hasFilled = !!entry.filled;
      if (hasOutline && hasFilled) {
        tr.classList.add('chosen', 'row-fully-picked');
      } else if (hasOutline || hasFilled) {
        tr.classList.add('row-partial');
      } else {
        tr.classList.add('row-unpicked');
      }
      const def = DEFAULTS[key];
      if (def) {
        const outOverride = entry.outline !== undefined && entry.outline !== def.outline;
        const fillOverride = entry.filled !== undefined && entry.filled !== def.filled;
        if (outOverride || fillOverride) tr.classList.add('row-overridden');
      }
    }

    function applyState() {
      document.querySelectorAll('tr[data-row-key]').forEach((tr) => {
        const key = tr.dataset.rowKey;
        const entry = state[key] || {};
        const note = tr.querySelector('input.row-note');
        // Clear all radios in the row first, then re-check for each variant.
        tr.querySelectorAll('input[type="radio"][data-row]').forEach((r) => { r.checked = false; });
        if (entry.outline) {
          const r = tr.querySelector('input[type="radio"][data-variant="outline"][value="' + CSS.escape(entry.outline) + '"]');
          if (r) r.checked = true;
        }
        if (entry.filled) {
          const r = tr.querySelector('input[type="radio"][data-variant="filled"][value="' + CSS.escape(entry.filled) + '"]');
          if (r) r.checked = true;
        }
        if (note) note.value = entry.note || '';
        refreshRowHighlights(tr);
      });
      updateProgress();
    }

    // Pick by clicking an icon/preview. Reads data-variant on the clicked element
    // to know whether the click sets the outline or filled choice.
    function pickFor(target) {
      const pickEl = target.closest('[data-pick]');
      if (!pickEl) return false;
      const tr = pickEl.closest('tr[data-row-key]');
      if (!tr) return false;
      const key = tr.dataset.rowKey;
      const value = pickEl.dataset.pick;
      const variant = pickEl.dataset.variant || 'outline';
      const radio = tr.querySelector('input[type="radio"][data-variant="' + variant + '"][value="' + CSS.escape(value) + '"]');
      if (!radio) return false;
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    document.addEventListener('click', (ev) => {
      const t = ev.target;
      // Unpick button → clear that variant for the row.
      if (t && t.matches && t.matches('button.unpick')) {
        const key = t.dataset.row;
        const variant = t.dataset.variant;
        state[key] = state[key] || {};
        state[key][variant] = null;
        saveState(state);
        const tr = t.closest('tr[data-row-key]');
        if (tr) {
          // Uncheck all radios in this variant group for the row.
          tr.querySelectorAll('input[type="radio"][data-variant="' + variant + '"]').forEach((r) => { r.checked = false; });
          refreshRowHighlights(tr);
        }
        updateProgress();
        ev.preventDefault();
        return;
      }
      if (pickFor(ev.target)) ev.preventDefault();
    });
    document.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const t = ev.target;
      if (t && t.matches && t.matches('[data-pick]')) {
        if (pickFor(t)) ev.preventDefault();
      }
    });

    function updateProgress() {
      const total = document.querySelectorAll('tr[data-row-key]').length;
      let bothChosen = 0, overridden = 0, unpicked = 0;
      document.querySelectorAll('tr[data-row-key]').forEach((tr) => {
        const k = tr.dataset.rowKey;
        const e = state[k] || {};
        if (e.outline && e.filled) bothChosen += 1;
        const def = DEFAULTS[k];
        if (def) {
          const outOverride = e.outline !== undefined && e.outline !== def.outline;
          const fillOverride = e.filled !== undefined && e.filled !== def.filled;
          if (outOverride || fillOverride) overridden += 1;
          if (e.outline === null || e.filled === null) unpicked += 1;
        }
      });
      document.getElementById('progress-count').textContent = bothChosen;
      document.getElementById('progress-any').textContent = overridden;
      document.getElementById('progress-total').textContent = total;
      document.getElementById('progress-bar').value = bothChosen;
      document.getElementById('progress-bar').max = total;
      const u = document.getElementById('progress-unpicked');
      if (u) u.textContent = unpicked;
    }

    // Listen for radio changes (event delegation) — variant-aware.
    document.addEventListener('change', (ev) => {
      const t = ev.target;
      if (t && t.matches('input[type="radio"][data-row]')) {
        const key = t.dataset.row;
        const variant = t.dataset.variant || 'outline';
        state[key] = state[key] || {};
        state[key][variant] = t.value;
        saveState(state);
        const tr = t.closest('tr[data-row-key]');
        if (tr) refreshRowHighlights(tr);
        updateProgress();
      }
    });
    // Listen for note input changes
    document.addEventListener('input', (ev) => {
      const t = ev.target;
      if (t && t.matches('input.row-note')) {
        const key = t.dataset.row;
        state[key] = state[key] || {};
        state[key].note = t.value;
        saveState(state);
      }
    });

    // ---- Save / download / clear ----
    function buildPayload() {
      const rows = [];
      document.querySelectorAll('tr[data-row-key]').forEach((tr) => {
        const key = tr.dataset.rowKey;
        const entry = state[key] || {};
        rows.push({
          consumerName: key,
          group: tr.dataset.group,
          status: tr.dataset.status,
          outline: entry.outline || null,
          filled: entry.filled || null,
          note: entry.note || '',
        });
      });
      return {
        savedAt: new Date().toISOString(),
        total: rows.length,
        bothChosen: rows.filter((r) => r.outline && r.filled).length,
        anyChosen: rows.filter((r) => r.outline || r.filled).length,
        rows,
      };
    }

    function setStatus(msg, kind) {
      const el = document.getElementById('save-status');
      el.textContent = msg;
      el.className = 'save-status ' + (kind || '');
    }

    document.getElementById('btn-save').addEventListener('click', async () => {
      const payload = buildPayload();
      try {
        const r = await fetch('/__save_selections', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json().catch(() => ({}));
        setStatus('Saved to ' + (j.path || 'selections.json'), 'ok');
      } catch (err) {
        setStatus('Save endpoint unavailable — use Download JSON instead. Run \`pnpm exec tsx hack/serve-comparison.ts\` to enable saving.', 'err');
      }
    });

    document.getElementById('btn-download').addEventListener('click', () => {
      const payload = buildPayload();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'icon-selections.json';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Downloaded icon-selections.json — drop it at hack/icon-selections.json for review.', 'ok');
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      if (!confirm('Reset to Phosphor defaults? This wipes your overrides — saved file is untouched until you click Save.')) return;
      localStorage.removeItem(STORAGE_KEY);
      state = loadState(); // re-merge defaults + on-disk priorState (no localStorage layer)
      applyState();
      setStatus('Reset to Phosphor defaults.', '');
    });

    document.getElementById('btn-jump-unchosen').addEventListener('click', () => {
      const trs = Array.from(document.querySelectorAll('tr[data-row-key]'));
      const next = trs.find((tr) => {
        const e = state[tr.dataset.rowKey] || {};
        return !e.outline || !e.filled;
      });
      if (!next) { setStatus('All rows have both variants chosen!', 'ok'); return; }
      next.scrollIntoView({ behavior: 'smooth', block: 'center' });
      next.style.outline = '2px solid #2563eb';
      setTimeout(() => { next.style.outline = ''; }, 1500);
    });

    // ---- Detail panel ----
    // Panels are rendered hidden under each row. Toggling shows the row's
    // current outline+filled picks at multiple sizes/colors with copy-to-
    // clipboard for the import + JSX snippets.
    function specToUrl(spec, size, color) {
      if (!spec || spec === 'skip' || spec === 'maintain' || spec === 'incumbent') return '';
      const colon = spec.indexOf(':');
      const prefix = spec.slice(0, colon);
      const name = spec.slice(colon + 1);
      if (prefix.startsWith('jb-expui-')) {
        const dir = prefix.slice('jb-expui-'.length);
        return 'https://raw.githubusercontent.com/JetBrains/intellij-community/master/platform/icons/src/expui/' + dir + '/' + name + '.svg';
      }
      let url = 'https://api.iconify.design/' + prefix + '/' + name + '.svg?height=' + size;
      if (color && color !== 'currentColor' && !prefix.startsWith('jb-expui-')) {
        url += '&color=' + encodeURIComponent(color);
      }
      return url;
    }
    function renderDetail(panel) {
      const rowKey = panel.dataset.detailFor;
      const componentBase = panel.dataset.component;
      const entry = state[rowKey] || {};
      const variantBtn = panel.querySelector('button.detail-variant.active');
      const variant = (variantBtn && variantBtn.dataset.variant) || 'outline';
      const colorBtn = panel.querySelector('button.detail-color.active');
      const customColor = panel.querySelector('input.detail-color-custom').value.trim();
      const color = customColor || (colorBtn && colorBtn.dataset.color) || 'currentColor';
      const sizeInput = panel.querySelector('input.detail-size');
      const size = Number(sizeInput.value);
      panel.querySelector('.detail-size-label').textContent = String(size);
      const spec = entry[variant];
      const compName = componentBase + (variant === 'filled' && entry.filled ? 'Filled' : '');
      // Large preview
      const large = panel.querySelector('.detail-preview-large');
      large.innerHTML = '';
      if (spec) {
        const img = document.createElement('img');
        img.src = specToUrl(spec, size, color);
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.alt = compName;
        if (color === 'currentColor') img.style.color = 'inherit';
        large.appendChild(img);
      } else {
        large.textContent = '(no ' + variant + ' variant picked)';
        large.style.fontSize = '12px';
        large.style.color = '#94a3b8';
      }
      // Size grid
      panel.querySelectorAll('.detail-preview-grid > div').forEach((cell) => {
        const px = Number(cell.dataset.px);
        const existing = cell.querySelector('img');
        if (existing) existing.remove();
        if (spec) {
          const img = document.createElement('img');
          img.src = specToUrl(spec, px, color);
          img.style.width = px + 'px';
          img.style.height = px + 'px';
          cell.insertBefore(img, cell.firstChild);
        }
      });
      // Snippets
      const importParts = [];
      if (entry.outline) importParts.push(componentBase);
      if (entry.filled) importParts.push(componentBase + 'Filled');
      const importLine = 'import { ' + importParts.join(', ') + ' } from "@flanksource/icons-ui";';
      panel.querySelector('.detail-snippet-import').textContent = importLine;
      const props = [];
      if (size !== 16) props.push('size={' + size + '}');
      if (color && color !== 'currentColor') props.push('style={{ color: "' + color + '" }}');
      const jsxSnippet = '<' + compName + (props.length ? ' ' + props.join(' ') : '') + ' />';
      panel.querySelector('.detail-snippet-jsx').textContent = jsxSnippet;
      // Source attribution
      panel.querySelector('.detail-source').textContent = spec || '(no pick for this variant)';
    }
    document.addEventListener('click', (ev) => {
      const t = ev.target;
      // Toggle detail row
      if (t && t.matches && t.matches('a.row-detail-toggle')) {
        ev.preventDefault();
        const rowKey = t.dataset.row;
        const detail = document.querySelector('tr.row-detail[data-detail-for="' + CSS.escape(rowKey) + '"]');
        if (!detail) return;
        const wasHidden = detail.hasAttribute('hidden');
        if (wasHidden) {
          detail.removeAttribute('hidden');
          history.replaceState(null, '', '#row=' + encodeURIComponent(rowKey));
          renderDetail(detail.querySelector('.detail-panel'));
        } else {
          detail.setAttribute('hidden', '');
          history.replaceState(null, '', location.pathname);
        }
        return;
      }
      // Variant button
      if (t && t.matches && t.matches('button.detail-variant')) {
        const panel = t.closest('.detail-panel');
        panel.querySelectorAll('button.detail-variant').forEach((b) => b.classList.remove('active'));
        t.classList.add('active');
        renderDetail(panel);
        return;
      }
      // Color preset
      if (t && t.matches && t.matches('button.detail-color')) {
        const panel = t.closest('.detail-panel');
        panel.querySelectorAll('button.detail-color').forEach((b) => b.classList.remove('active'));
        t.classList.add('active');
        panel.querySelector('input.detail-color-custom').value = '';
        renderDetail(panel);
        return;
      }
      // Copy buttons
      if (t && t.matches && t.matches('button.detail-copy')) {
        const panel = t.closest('.detail-panel');
        const which = t.dataset.copy;
        const text = which === 'import'
          ? panel.querySelector('.detail-snippet-import').textContent
          : panel.querySelector('.detail-snippet-jsx').textContent;
        void navigator.clipboard?.writeText(text || '');
        t.classList.add('copied');
        const orig = t.textContent;
        t.textContent = '✓';
        setTimeout(() => { t.classList.remove('copied'); t.textContent = orig; }, 1200);
        return;
      }
    });
    document.addEventListener('input', (ev) => {
      const t = ev.target;
      if (t && t.matches && t.matches('input.detail-size')) {
        const panel = t.closest('.detail-panel');
        renderDetail(panel);
      } else if (t && t.matches && t.matches('input.detail-color-custom')) {
        const panel = t.closest('.detail-panel');
        if (t.value.trim()) {
          panel.querySelectorAll('button.detail-color').forEach((b) => b.classList.remove('active'));
        }
        renderDetail(panel);
      }
    });
    // Open the detail panel from URL hash on first load.
    function openFromHash() {
      const m = location.hash.match(/^#row=([^&]+)$/);
      if (!m) return;
      const rowKey = decodeURIComponent(m[1]);
      const detail = document.querySelector('tr.row-detail[data-detail-for="' + CSS.escape(rowKey) + '"]');
      if (!detail) return;
      detail.removeAttribute('hidden');
      renderDetail(detail.querySelector('.detail-panel'));
      const mainRow = document.querySelector('tr[data-row-key="' + CSS.escape(rowKey) + '"]');
      if (mainRow) mainRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    window.addEventListener('hashchange', openFromHash);

    applyState();
    openFromHash();
  `;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Phosphor Light Icon Set — Comparison Review</title>
<style>${css}</style>
</head>
<body data-size-filter="${DEFAULT_SIZE}">
  <h1>Phosphor Light Icon Set — Comparison Review</h1>
  <div class="muted small">Side-by-side review of the proposed unified icon set sourced from <a href="https://github.com/phosphor-icons/core" target="_blank" rel="noopener">Phosphor Icons (Light, MIT)</a> against current Iconify references across <code>flanksource-ui</code>, <code>clicky-ui</code>, <code>facet</code>, <code>gavel</code>, and the scraper UI.</div>

  <div class="summary">
    <div class="stat"><strong>${rows.length}</strong> total rows</div>
    <div class="stat"><strong>${counts.NEW}</strong> new</div>
    <div class="stat"><strong>${counts.EXISTS}</strong> existing (reskin or rename-and-replace)</div>
    <div class="stat"><strong>${counts.ALIAS}</strong> alias-only</div>
    <div class="stat">excluded: <code>logos</code>, <code>vscode-icons</code> file-types (MAINTAIN colored file-type icons), <code>svg-spinners</code>, brand <code>simple-icons</code></div>
  </div>
  <div class="callout">
    <strong>Style rules</strong>
    <ul>
      <li><strong>Outline only</strong> (never use the Fill weight): chevrons, carets, dots/ellipsis, arrows, links/external-link, close/x, menu, expand/collapse-all.</li>
      <li><strong>Circles, not squares</strong>: <code>add</code>→<code>plus-circle</code>, <code>remove</code>→<code>minus-circle</code>, <code>pass</code>→<code>check-circle</code>. Never <code>plus-square</code>, <code>minus-square</code>, or <code>check-square</code>.</li>
      <li><strong>Maintain</strong> as-is: <code>circle-filled</code> + <code>circle-outline</code> as separate glyphs, <code>ship-wheel</code>, <code>diff</code>, <code>database-plus</code>, all <code>vscode-icons</code> colored file-type icons.</li>
      <li>Filled (Fill weight) is reserved for active/selected states of glyphs that have a meaningful fill — circles, hearts, stars, etc.</li>
    </ul>
  </div>

  <div class="controls">
    <input id="search" type="search" placeholder="Filter by name, source, notes..." />
    <span class="muted small">size:</span>
    <span class="pill" data-size-btn="all">all</span>
    <span class="pill" data-size-btn="16">16</span>
    <span class="pill active" data-size-btn="24">24</span>
    <span class="pill" data-size-btn="32">32</span>
    <span class="pill" data-size-btn="48">48</span>
    <span class="muted small" style="margin-left:12px">status:</span>
    <span class="pill active" data-status-btn="all">all</span>
    <span class="pill" data-status-btn="NEW">new</span>
    <span class="pill" data-status-btn="EXISTS">existing</span>
    <span class="pill" data-status-btn="ALIAS">alias</span>
    <span class="muted small" style="margin-left:12px">variant:</span>
    <span class="pill active" data-variant-btn="both">both</span>
    <span class="pill" data-variant-btn="light">light only</span>
    <span class="pill" data-variant-btn="fill">fill only</span>
    <span class="muted small" style="margin-left:12px">picks:</span>
    <span class="pill active" data-pick-btn="all">all</span>
    <span class="pill" data-pick-btn="needs-attn">needs attention</span>
    <span class="pill" data-pick-btn="unpicked">fully unpicked</span>
    <span class="pill" data-pick-btn="partial">partial (one variant)</span>
    <span class="pill" data-pick-btn="overridden">overridden</span>
  </div>

  <div class="save-bar">
    <span class="progress" title="all rows default to ph:<name>-light + ph:<name>-fill — change only the ones that need different icons">
      <strong id="progress-count">0</strong>/<span id="progress-total">${rows.length}</span> both ·
      <strong id="progress-any">0</strong> overridden ·
      <strong id="progress-unpicked">0</strong> unpicked
    </span>
    <progress id="progress-bar" value="0" max="${rows.length}" title="rows with both outline + filled chosen"></progress>
    <button id="btn-save" type="button">Save selections</button>
    <button id="btn-download" type="button" class="secondary">Download JSON</button>
    <button id="btn-clear" type="button" class="secondary" title="Wipe overrides and restore Phosphor defaults">Reset to defaults</button>
    <button id="btn-jump-unchosen" type="button" class="secondary">Jump to next unchosen</button>
    <span id="save-status" class="save-status"></span>
  </div>

  <nav class="toc">${tocLinks}</nav>

  ${sectionsHtml}

  <div class="footer">
    <strong>Notes</strong><br/>
    1. <em>Current</em> column shows incumbent <code>svg/&lt;name&gt;.svg</code> from this repo (dashed border) plus rendered references from each source Iconify collection (<code>codicon</code>, <code>lucide</code>, <code>ph</code>, <code>ion</code>) at 16/24/32/48 px so weight can be evaluated at small sizes.<br/>
    2. <em>Proposed</em> column renders <code>ph-light:&lt;name&gt;</code> via the public Iconify CDN. Once <code>@phosphor-icons/core</code> is installed, the importer will copy the same SVG bytes from <code>node_modules/@phosphor-icons/core/assets/light/&lt;name&gt;.svg</code>.<br/>
    3. <strong>Stroke weight at 32px</strong>: Phosphor Light is 1.5px at 24×24. Naive <code>rsvg-convert -h 32</code> scales strokes to ~2px. If 32px reads too heavy, the importer will set <code>stroke-width="1.125"</code> before svgo runs.<br/>
    4. <strong>Collisions</strong>: rows marked <em>existing</em> already have a file in <code>svg/</code>. Policy: if functionally distinct (e.g. <code>check.svg</code> is filled), rename incumbent to <code>&lt;name&gt;-filled.svg</code> and place the new Phosphor Light glyph at <code>&lt;name&gt;.svg</code>. Document in <code>BREAKING.md</code>.<br/>
    5. <strong>Out of scope</strong>: brand/logo collections (<code>logos</code>, <code>simple-icons</code>), <code>vscode-icons</code> file-types, and <code>svg-spinners</code> stay served by Iconify or existing flanksource-icons brand SVGs.<br/>
    6. Licenses: Phosphor MIT, Tabler MIT, Material Design Icons Apache 2.0, Codicons MIT, Carbon Apache 2.0, JetBrains IntelliJ Platform Apache 2.0 — attribution for any vendored set will be added to <code>NOTICE.md</code> at import time. JetBrains <code>jb-expui-*</code> previews load directly from <a href="https://github.com/JetBrains/intellij-community/tree/master/platform/icons/src/expui" target="_blank" rel="noopener">JetBrains/intellij-community</a> raw GitHub URLs.<br/>
    7. <strong>Selection workflow</strong>: every row <strong>defaults to <code>ph:&lt;name&gt;-light</code> for outline and <code>ph:&lt;name&gt;-fill</code> for filled</strong>. You only need to interact with rows where Phosphor isn't the right pick: <strong>click any rendered icon</strong> to override, or click the <strong>×</strong> next to <em>outline</em> or <em>filled</em> in the Choose column to unpick that variant for the row. Selected outline picks ring blue; filled picks ring amber; an icon picked for both lights up with a split blue/amber ring. Progress reads <code>X both · Y overridden · Z unpicked</code>. Selections persist in localStorage and are merged with prior on-disk state in <code>hack/icon-selections.json</code> on every page load. Click <em>Save selections</em> to POST the current state to <code>/__save_selections</code> (writes to <code>hack/icon-selections.json</code>) — start the server with <code>pnpm exec tsx hack/serve-comparison.ts</code> first. If running offline, use <em>Download JSON</em> and drop the file at <code>hack/icon-selections.json</code> manually. <em>Reset to defaults</em> wipes your overrides and reverts every row to the Phosphor defaults. Once saved, ask Claude to "review my icon selections" and the next pass will finalize the import script.
  </div>

  <script>${js}</script>
</body>
</html>
`;
}

const html = buildHtml();
const out = join(repoRoot, "comparison.html");
writeFileSync(out, html);
console.log(`Wrote ${out} (${rows.length} rows)`);
