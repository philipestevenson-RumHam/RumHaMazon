#!/bin/bash
# Run this whenever you add/remove product images.
# Usage: cd github-store && bash build-images.sh

echo "{" > images.json
first=true
for dir in products/*/; do
  folder=$(basename "$dir")
  files=$(ls "$dir" 2>/dev/null | grep -iE '\.(jpg|jpeg|png|gif|webp|avif)$' | sort -V | tr '\n' ',' | sed 's/,$//')
  if [ -n "$files" ]; then
    if [ "$first" = true ]; then first=false; else echo "," >> images.json; fi
    # Format as JSON array
    json_arr=$(echo "$files" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')
    printf '  "%s": %s' "$folder" "$json_arr" >> images.json
  fi
done
echo "" >> images.json
echo "}" >> images.json
echo "✅ images.json updated!"
