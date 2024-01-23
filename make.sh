sed -i 's|"Icon" +||' node_modules/create-react-icons/lib/generate-icons.js
rm -rf src/
create-react-icons -s 'svg/*.svg' -d src --typescript
