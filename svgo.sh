cd svg
files=$(rg --files  --max-depth 1)
for img in $files; do
  name=$(basename $img)
  base=${name%.*}
  out=output/$name
  if ! grep -q 'height="32"' $img; then
    echo Resizing $img
    rsvg-convert $img -h 32 -a -f svg -o $out
    if [[ "$(wc  -cm $img | awk '{print $1}')" != "0" ]]; then
      mv  $out  $img
    fi
  fi
done

echo svgo -i $files -o . --config ../svgo.config.mjs

svgo -i $(cat .rgignore | grep svg) -o . --config ../svgo.config.mjs


for img in $files; do
  name=$(basename $img)
  base=${name%.*}
  sed  's|fill-rule="nonzero" fill="rgb(0%, 0%, 0%)" fill-opacity="1"||'  $img | sponge $img
done

