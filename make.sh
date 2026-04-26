#!/bin/bash

# cp generate-icons.js node_modules/create-react-icons/lib/generate-icons.js
# rm -rf src/index.ts src/icons
# mkdir src

base=$(pwd)
reactIconsAll=$base/react-icons/packages/_react-icons_all
reactIcons=$base/react-icons/packages/react-icons
cp manifest.ts $reactIcons/src/icons/index.ts
cp iconBase.tsx $reactIcons/src/iconBase.tsx

cd $reactIconsAll
git checkout package.json

cd $reactIcons
yarn install
yarn run  build


mjs=$reactIconsAll/mi/index.mjs
js=$reactIconsAll/mi/index.js
cd $base/svg
printf "\n" >> $mjs
echo "export const IconMap = {" >> $mjs
echo "module.exports.IconMap = {" >> $js

for img in $(ls  *.svg); do
  name=${img%.*}
  class=$(node -e  "import camelcase from  'camelcase'; console.log(camelcase('$name', {pascalCase: true}).replace('K8s', 'K8S'))"  --input-type module)
  echo '  "'$name'"': $class , >> $mjs
   echo '  "'$name'"': module.exports.$class , >> $js
done

echo "}" >> $mjs
echo "}" >> $js
echo "export declare const IconMap: Record<string,IconType>;" >> $reactIconsAll/mi/index.d.ts

cd $reactIconsAll
cat <<< $(jq '.name = "@flanksource/icons"' package.json ) > package.json
cat <<< $(jq '.repository.url = "https://github.com/flanksource/flanksource-icons"' package.json ) > package.json
cat <<< $(jq '.homepage = "https://github.com/flanksource/flanksource-icons"' package.json ) > package.json
cat <<< $(jq 'del(.bugs, .author, .contributors, .description)' package.json ) > package.json

# Build Icon component
cd $base
iconDir=$reactIconsAll/icon
mkdir -p $iconDir

# Copy source files needed for esbuild to resolve imports
cp aliases.ts prefixes.ts iconResolver.ts Icon.tsx fileTypeMap.ts FileTypeIcon.tsx ResourceIcon.tsx iconifyAllowlist.ts $reactIconsAll/
cp iconBase.tsx $reactIconsAll/iconBase.tsx
cp iconContext.tsx $reactIconsAll/iconContext.tsx

# ESM bundle — externalize @flanksource/icons/mi (icons loaded at runtime)
# and @iconify/react (peer-installed by consumers)
pnpm exec esbuild $reactIconsAll/Icon.tsx \
  --bundle --format=esm --jsx=automatic \
  --external:react --external:react/jsx-runtime \
  --external:@flanksource/icons/mi \
  --external:@iconify/react \
  --outfile=$iconDir/index.mjs

# CJS bundle
pnpm exec esbuild $reactIconsAll/Icon.tsx \
  --bundle --format=cjs --jsx=automatic \
  --external:react --external:react/jsx-runtime \
  --external:@flanksource/icons/mi \
  --external:@iconify/react \
  --outfile=$iconDir/index.js

# Generate type declarations
cat > $iconDir/index.d.ts << 'DTS'
import type { IconType } from "../lib/iconBase";
import * as React from "react";

export declare const aliases: Record<string, string>;
export declare const prefixes: Record<string, string>;
export declare const colorClassMap: Record<string, string>;

export declare function processIconNameSearch(name: string): string;
export declare function findByName(name: string | undefined, iconMap: Record<string, IconType>): IconType | undefined;
export declare function areTwoIconNamesEqual(firstIconName?: string, secondIconName?: string): boolean;
export declare function resolveColor(color?: string): { className?: string; style?: { color: string } } | undefined;

export type IconProps = {
  name?: string;
  secondary?: string;
  className?: string;
  color?: string;
  alt?: string;
  prefix?: React.ReactNode;
  size?: string | number;
  iconWithColor?: string;
};

export declare function Icon(props: IconProps): JSX.Element | null;
export type { IconType };

export declare const extMap: Record<string, string>;
export declare const specialFileMap: Record<string, string>;
export declare const defaultFileIcon: string;

export type FileTypeIconProps = Omit<IconProps, "name"> & { name: string };
export declare function resolveFileTypeIcon(filename: string): string;
export declare function FileTypeIcon(props: FileTypeIconProps): JSX.Element | null;

export type IconifyCollection = "logos" | "devicon";
export type ResourceIconProps = {
  primary?: string;
  secondary?: string;
  iconifyCollections?: ReadonlyArray<IconifyCollection>;
  iconifyFallback?: boolean;
  className?: string;
  color?: string;
  size?: string | number;
  alt?: string;
  iconMap?: Record<string, IconType>;
};
export declare function ResourceIcon(props: ResourceIconProps): JSX.Element | null;
DTS

# Add ./icon export to package.json
cat <<< $(jq '.exports["./icon"] = { "types": "./icon/index.d.ts", "require": "./icon/index.js", "import": "./icon/index.mjs", "default": "./icon/index.mjs" }' $reactIconsAll/package.json) > $reactIconsAll/package.json

# Bundle demo app (React + all icons inlined, self-contained for GH Pages).
# Force every import of `react` and `react/jsx-runtime` to the same physical
# path so the bundle has a single React instance — otherwise nested deps
# (e.g. @iconify/react) get a second copy and useState() crashes with
# "Cannot read properties of null".
react_root=$(node -e 'console.log(require.resolve("react/package.json"))' | xargs dirname)
cp DemoApp.tsx $reactIconsAll/
# Build the new @flanksource/icons-ui package first so the demo can browse it
# via a side-by-side tab. Skipped silently if the package directory is absent.
icons_ui_dir=$base/packages/ui
icons_ui_alias=""
if [ -d "$icons_ui_dir" ]; then
  echo "Building @flanksource/icons-ui for the demo…"
  (cd "$icons_ui_dir" && pnpm install --silent && pnpm run build:codegen >/dev/null)
  icons_ui_alias="--alias:@flanksource/icons-ui=$icons_ui_dir/src/index.ts"
fi
pnpm exec esbuild $reactIconsAll/DemoApp.tsx \
  --bundle --format=esm --jsx=automatic \
  --alias:@flanksource/icons/mi=$reactIconsAll/mi/index.mjs \
  --alias:react=$react_root/index.js \
  --alias:react/jsx-runtime=$react_root/jsx-runtime.js \
  $icons_ui_alias \
  --outfile=$reactIconsAll/demo-bundle.js \
  --minify

# Cleanup temporary build files
rm -f $reactIconsAll/aliases.ts $reactIconsAll/prefixes.ts $reactIconsAll/iconResolver.ts $reactIconsAll/Icon.tsx $reactIconsAll/iconBase.tsx $reactIconsAll/iconContext.tsx $reactIconsAll/DemoApp.tsx $reactIconsAll/fileTypeMap.ts $reactIconsAll/FileTypeIcon.tsx $reactIconsAll/ResourceIcon.tsx $reactIconsAll/iconifyAllowlist.ts
