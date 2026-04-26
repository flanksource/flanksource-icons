# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flanksource Icons is a curated SVG icon library (~1,000 icons) published as `@flanksource/icons` on npm. It uses a forked `react-icons` build system (git submodule) to convert SVGs into React components with an `IconMap` for name-based lookups.

Live demo: https://flanksource.github.io/flanksource-icons/

## Prerequisites

- `rsvg-convert` (from librsvg)
- `svgo` (npm global or local)
- `jq`
- Node 18+, Yarn (for react-icons submodule build)

## Common Commands

### Adding/updating an icon
```sh
# Add SVG to svg/ directory, then process it:
make svg/<new-icon.svg>
```
This resizes to 32px height via `rsvg-convert` and optimizes with `svgo`.

### Full build (SVG to React components)
```sh
npm run build    # init submodule + install + build
npm run svg      # just the SVG-to-React build (runs make.sh)
```

### Optimize all SVGs
```sh
npm run svgo     # resize + optimize all SVGs in svg/
```

### Process only modified SVGs
```sh
make             # processes git-modified/added SVGs only
```

### Local demo
```sh
make demo && open demo.html
```

## Architecture

### Build Pipeline

1. SVGs live in `svg/` (kebab-case names, 32x32px)
2. `manifest.ts` defines the icon set for react-icons (id: `mi`, multiColor: true)
3. `make.sh` copies manifest + `iconBase.tsx` into the react-icons submodule, runs its build, then appends an `IconMap` (name-to-component mapping) to the output
4. Built output goes to `react-icons/packages/_react-icons_all/mi/` which becomes the npm package root

### Key Files

| File | Purpose |
|------|---------|
| `svg/*.svg` | Source SVG icons |
| `manifest.ts` | react-icons icon set config (source glob, name formatter) |
| `iconBase.tsx` | Base React component for rendering icons (GenIcon factory) |
| `make.sh` | Main build: copies config into submodule, builds, generates IconMap |
| `svgo.sh` | Batch resize + optimize SVGs |
| `svgo.config.mjs` | SVGO config: 32x32, multipass, path merging, ID prefixing |
| `Makefile` | Per-file SVG processing (resize + optimize) |
| `demo.html` | Searchable icon browser (loads from GitHub CDN) |
| `.releaserc` | Semantic release config (all non-ci/style commits = patch) |

### Icon Naming

- SVG files use kebab-case: `add-alarm.svg`, `aws-ec2.svg`
- React components use PascalCase: `AddAlarm`, `AwsEc2`
- Name conversion: `camelcase` with pascalCase, `K8s` -> `K8S`, underscores/ampersands removed
- `IconMap` keys match the original kebab-case SVG filename (without extension)

### Publishing

Automated via `.github/workflows/publish.yaml` using semantic-release. The package is published as `@flanksource/icons` with public access. The `react-icons/packages/_react-icons_all/` directory becomes the package root.
