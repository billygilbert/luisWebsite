#!/bin/bash
# Create smaller JPEGs for the directing portfolio.
# After adding new photos under images/directing_page/<show>/, run:
#   bash scripts/make-directing-thumbs.sh
#
# thumbs/  ~400px  (heroes and thumbnail strips)
# large/   ~1600px (lightbox / full-size view)

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)/images/directing_page"

find "$ROOT" -type d \( -name thumbs -o -name large \) -prune -o -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) -print | while IFS= read -r src; do
	dir="$(dirname "$src")"
	base="$(basename "$src")"
	mkdir -p "$dir/thumbs" "$dir/large"
	sips -Z 400 -s format jpeg -s formatOptions 68 "$src" --out "$dir/thumbs/$base" >/dev/null
	sips -Z 1600 -s format jpeg -s formatOptions 78 "$src" --out "$dir/large/$base" >/dev/null
	echo "thumbs+large: $base"
done
