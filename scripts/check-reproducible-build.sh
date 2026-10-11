#!/usr/bin/env bash
# Builds the snap from two copies of this checkout at different absolute paths
# and fails unless both produce the same dist/bundle.js and the same
# snap.manifest.json source.shasum. Each copy gets its own `pnpm install`, so
# paths under node_modules differ between the two builds as well.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

build_in() {
  local dir="$1"
  mkdir -p "$dir"
  tar -C "$root" --exclude=.git --exclude=node_modules --exclude=./dist \
    --exclude=./test-results --exclude=./.aidev-artifacts --exclude=./.pnpm-store --exclude='./*.tgz' -cf - . \
    | tar -C "$dir" -xf -
  echo "== building in $dir" >&2
  (
    cd "$dir"
    # Copy rather than hardlink: on the store's filesystem, pnpm chmods linked
    # files, which fails when the store belongs to another user (the AIDEV image).
    pnpm install --frozen-lockfile --ignore-scripts --prefer-offline --package-import-method=copy \
      < /dev/null > install.log 2>&1 \
      || { cat install.log >&2; exit 1; }
    pnpm exec mm-snap build < /dev/null
  )
}

shasum_of() {
  node -p 'require(process.argv[1]).source.shasum' "$1/snap.manifest.json"
}

a="$work/a/metamask-snap"
b="$work/b/x/metamask-snap"
build_in "$a"
build_in "$b"

sha_a="$(shasum_of "$a")"
sha_b="$(shasum_of "$b")"
echo "shasum $sha_a ($a)"
echo "shasum $sha_b ($b)"

status=0
if [ "$sha_a" != "$sha_b" ]; then
  echo "FAIL: snap.manifest.json source.shasum differs between the two checkouts" >&2
  status=1
fi
if ! cmp "$a/dist/bundle.js" "$b/dist/bundle.js"; then
  echo "FAIL: dist/bundle.js differs between the two checkouts" >&2
  status=1
fi
for dir in "$a" "$b"; do
  n="$( { grep -oF "$work" "$dir/dist/bundle.js" || true; } | wc -l)"
  [ "$n" -eq 0 ] || echo "dist/bundle.js built in $dir embeds its build path $n time(s)" >&2
done
[ "$status" -eq 0 ] && echo "OK: builds from different paths are identical"
exit "$status"
