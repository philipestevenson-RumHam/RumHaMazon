#!/usr/bin/env bash
# generate-images-json.sh
# Scans the products/ folder and writes images.json for Philip's Store.
# Run this from the root of your repository whenever you add or remove product images.
#
# Usage:  bash generate-images-json.sh
# Output: images.json  (place in repo root alongside index.html)

set -euo pipefail

PRODUCTS_DIR="products"
OUTPUT="images.json"
EXTENSIONS=("jpg" "jpeg" "png" "gif" "webp" "avif")

if [ ! -d "$PRODUCTS_DIR" ]; then
  echo "Error: '$PRODUCTS_DIR' directory not found. Run this script from your repo root." >&2
  exit 1
fi

echo "Scanning $PRODUCTS_DIR/ ..."
echo "{" > "$OUTPUT"

first_folder=true
for folder in "$PRODUCTS_DIR"/*/; do
  [ -d "$folder" ] || continue
  name=$(basename "$folder")

  images=()
  # Collect numbered images in order (1, 2, 3 …)
  for i in $(seq 1 20); do
    found=false
    for ext in "${EXTENSIONS[@]}"; do
      file="$i.$ext"
      if [ -f "$folder$file" ]; then
        images+=("$file")
        found=true
        break
      fi
    done
    $found || break
  done

  # If no numbered images, fall back to common names
  if [ ${#images[@]} -eq 0 ]; then
    for name_candidate in photo image pic main cover front; do
      for ext in "${EXTENSIONS[@]}"; do
        file="$name_candidate.$ext"
        if [ -f "$folder$file" ]; then
          images+=("$file")
        fi
      done
    done
  fi

  if [ ${#images[@]} -eq 0 ]; then
    echo "  Warning: no images found for '$name'" >&2
    continue
  fi

  $first_folder || echo "," >> "$OUTPUT"
  first_folder=false

  # Build JSON array for this folder
  printf '  "%s": [' "$name" >> "$OUTPUT"
  first_img=true
  for img in "${images[@]}"; do
    $first_img || printf ", " >> "$OUTPUT"
    first_img=false
    printf '"%s"' "$img" >> "$OUTPUT"
  done
  printf ']' >> "$OUTPUT"

  echo "  $name: ${images[*]}"
done

echo "" >> "$OUTPUT"
echo "}" >> "$OUTPUT"

echo ""
echo "✓ Written to $OUTPUT"
