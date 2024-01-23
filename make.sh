#!/bin/bash

# cp generate-icons.js node_modules/create-react-icons/lib/generate-icons.js
# rm -rf src/index.ts src/icons
# mkdir src

base=$(pwd)
reactIconsAll=$base/react-icons/packages/_react-icons_all
reactIcons=$base/react-icons/packages/react-icons
cp manifest.ts $reactIcons/src/icons/index.ts
cp iconBase.tsx  $reactIcons/src/iconBase.tsx .

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
cat <<< $(jq '.repository.url = "https://github.com/flanksource/icons"' package.json ) > package.json
cat <<< $(jq 'del(.bugs, .author, .contributors, .description)' package.json ) > package.json

cp $base/.releaserc $reactIconsAll
cp $base/.npmrc  $reactIconsAll
