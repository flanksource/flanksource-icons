import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const svgDir = join(repoRoot, "svg");
const iconsUiIndex = join(repoRoot, "packages", "ui", "src", "index.ts");
const outPath = join(repoRoot, "llm.txt");

async function readSvgIconNames() {
  const files = await readdir(svgDir);
  return files
    .filter((file) => file.endsWith(".svg"))
    .map((file) => file.slice(0, -".svg".length))
    .sort((a, b) => a.localeCompare(b));
}

async function readIconsUiNames() {
  const source = await readFile(iconsUiIndex, "utf8");
  const names = new Set();

  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^export \{ ([A-Za-z0-9_]+) \} from "\.\/icons\//);
    if (match) names.add(match[1]);
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

function wrapList(names, perLine = 8) {
  const lines = [];
  for (let i = 0; i < names.length; i += perLine) {
    lines.push(names.slice(i, i + perLine).join(", "));
  }
  return lines.join("\n");
}

function render(iconNames, iconsUiNames) {
  return `# Flanksource Icons LLM Usage

This file is generated from the Flanksource Icons repository for LLMs and coding agents.
Use exact icon names from the listings below when generating code.

Demo: https://flanksource.github.io/flanksource-icons/
Repository: https://github.com/flanksource/flanksource-icons
NPM packages: @flanksource/icons, @flanksource/icons-ui

## Install

\`\`\`sh
pnpm add @flanksource/icons @flanksource/icons-ui
\`\`\`

Both packages require React as a peer dependency.

## Choose The Right Component

- Use @flanksource/icons/icon Icon when you know a curated SVG icon name.
- Use ResourceIcon when the icon name comes from runtime data such as resource type, cloud provider, service, or config class.
- Use FileTypeIcon when rendering file names or file extensions.
- Use @flanksource/icons-ui components for UI actions, status, navigation, and product interface symbols.

## Usage Examples

\`\`\`tsx
import { Icon, ResourceIcon, FileTypeIcon } from "@flanksource/icons/icon";

export function Examples() {
  return (
    <>
      <Icon name="aws-ec2" className="h-6 max-w-6" />
      <Icon name="k8s-pod" color="blue" />
      <ResourceIcon primary="Kubernetes::Pod" secondary="KubernetesResource" className="h-6 max-w-6" />
      <ResourceIcon primary="datadog" className="h-6 max-w-6" />
      <FileTypeIcon name="config.yaml" className="h-6 max-w-6" />
    </>
  );
}
\`\`\`

\`\`\`tsx
import { UiCheck, UiUpload, UiSearch, UiWarningCircleFilled } from "@flanksource/icons-ui";

export function Toolbar() {
  return (
    <>
      <UiSearch size={16} className="text-slate-700" />
      <UiUpload size={16} />
      <UiCheck size={16} className="text-emerald-600" title="complete" />
      <UiWarningCircleFilled size={16} className="text-amber-600" />
    </>
  );
}
\`\`\`

## Resolution Notes

Icon accepts exact names from the @flanksource/icons listing and also supports the aliases and prefix matching built into the package.
ResourceIcon first checks bundled icons, then falls back to allowed Iconify logo/devicon matches when enabled.
FileTypeIcon maps common filenames and extensions to bundled icons.
Most @flanksource/icons-ui outline icons use currentColor, so CSS color utilities such as className="text-blue-500" work.

## @flanksource/icons Names (${iconNames.length})

${wrapList(iconNames)}

## @flanksource/icons-ui Components (${iconsUiNames.length})

${wrapList(iconsUiNames, 6)}
`;
}

const iconNames = await readSvgIconNames();
const iconsUiNames = await readIconsUiNames();
await writeFile(outPath, render(iconNames, iconsUiNames));

console.log(`Generated llm.txt with ${iconNames.length} icon names and ${iconsUiNames.length} UI components.`);
