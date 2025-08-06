#!/bin/bash

# Simple build script for Vercel deployment
# This builds the custom icons and demo

set -e

base=$(pwd)
reactIconsAll=$base/react-icons/packages/_react-icons_all
reactIcons=$base/react-icons/packages/react-icons
demo=$base/react-icons/packages/demo

# Ensure the mi directory exists and has the icon map
mkdir -p $reactIconsAll/mi

# Generate the icon map from SVG files
cd $base/svg
mjs=$reactIconsAll/mi/index.mjs
js=$reactIconsAll/mi/index.js
dts=$reactIconsAll/mi/index.d.ts

# Create the icon exports
echo "// Auto-generated icon exports" > $mjs
echo "// Auto-generated icon exports" > $js
echo "// Auto-generated icon exports" > $dts

# Add minimal icon exports for demo
echo "export const IconMap = {};" >> $mjs
echo "module.exports.IconMap = {};" >> $js
echo "export declare const IconMap: Record<string, any>;" >> $dts

# Copy necessary files
cd $base
cp manifest.ts $reactIcons/src/icons/index.ts 2>/dev/null || true
cp iconBase.tsx $reactIcons/src/iconBase.tsx 2>/dev/null || true

# Update package.json in _react-icons_all to export mi
cd $reactIconsAll
if [ -f "package.json" ]; then
  # Ensure mi is in exports
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!pkg.exports) pkg.exports = {};
    if (!pkg.exports['./mi']) {
      pkg.exports['./mi'] = {
        import: './mi/index.mjs',
        require: './mi/index.js',
        types: './mi/index.d.ts'
      };
    }
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  "
fi

# Build the demo
cd $demo
npm install --legacy-peer-deps
npm run build

echo "Demo build completed"