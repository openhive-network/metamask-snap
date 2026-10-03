#!/usr/bin/env bash
# The checks AIDEV's verification slots run (.aidev/project.yaml), as one junit
# report per suite: each named step is a test case, its log the failure body.
#
#   .aidev/run-checks.sh <suite> <step>...   steps: lint typecheck snapper build test
#
#   lint       ESLint (package.json `lint`, CI's lint job)
#   typecheck  tsc --noEmit over src/, tests/ and snap.config.ts (tsconfig.json).
#              Not bound to a slot: CI doesn't run it and it fails today
#              (TS5110, `module` must be Node16 with `moduleResolution: node16`).
#   snapper    scripts/snapper.sh, the security analysis package.json `prebuild`
#              runs before every `pnpm build`
#   build      `mm-snap build` (CI's build job) -> dist/bundle.js. The build
#              rewrites snap.manifest.json's shasum when it differs from the
#              bundle (CI's build does too: the published package carries the
#              rebuilt manifest). The rebuilt manifest is what `test` installs;
#              the committed one is put back when the script exits, and a
#              difference is reported as the skipped case `manifest-shasum`.
#   test       Jest with @metamask/snaps-jest against dist/bundle.js (CI's test
#              job; needs `build` first), every test its own junit case in
#              $out/jest-junit.xml. The image-hoster upload test posts to
#              images.hive.blog; suites run without network, so it is skipped.
set -uo pipefail
cd "$(dirname "$0")/.."

suite="${1:?usage: $0 <suite> <step>...}"; shift
out="test-results/$suite"
rm -rf "$out"; mkdir -p "$out"
cases="$out/cases.tsv"; : > "$cases"

# shellcheck source=pnpm-deps.sh
if ! source .aidev/pnpm-deps.sh; then
    printf 'case\tinstall\tfail\t0\tpnpm install --offline failed\n' >> "$cases"
    source .aidev/junit-helpers.sh; junit_write_cases "$out/junit.xml" "$suite" "$cases"
    exit 1
fi
source .aidev/junit-helpers.sh

status=0
step() {
    local name="$1"; shift
    local log="$out/$name.log" t0=$SECONDS rc=0
    echo "== $name" >&2
    "$@" > "$log" 2>&1 < /dev/null || rc=$?
    if [ "$rc" -eq 0 ]; then
        printf 'case\t%s\tpass\t%s\t\n' "$name" "$((SECONDS - t0))" >> "$cases"
    else
        status=1; tail -40 "$log" >&2
        printf 'case\t%s\tfail\t%s\texit %s\t%s\n' "$name" "$((SECONDS - t0))" "$rc" "$log" >> "$cases"
    fi
    return "$rc"
}

# Network-dependent tests, excluded by name (jest -t takes a regex).
OFFLINE_ONLY='^(?!.*should sign image for image hoster).*$'

manifest_saved="$out/snap.manifest.committed.json"
restore_manifest() { [ -f "$manifest_saved" ] && cp "$manifest_saved" snap.manifest.json; }
trap restore_manifest EXIT

snap_build() {
    [ -f "$manifest_saved" ] || cp snap.manifest.json "$manifest_saved"
    rm -rf dist && pnpm exec mm-snap build
}

# Not a failure: the committed shasum is routinely stale (CI's build reports it
# "(fixed)"), and the bundle's bytes differ between build environments.
record_manifest() {
    if cmp -s "$manifest_saved" snap.manifest.json; then
        printf 'case\tmanifest-shasum\tpass\t0\t\n' >> "$cases"
    else
        printf 'case\tmanifest-shasum\tskip\t0\tmm-snap build rewrote the committed shasum (%s)\n' \
            "$(node -p 'require("./snap.manifest.json").source.shasum')" >> "$cases"
    fi
}

jest_tests() {
    [ -s dist/bundle.js ] || { echo "dist/bundle.js is missing: run the build step first" >&2; return 1; }
    env -u CI JEST_JUNIT_OUTPUT_DIR="$out" JEST_JUNIT_OUTPUT_NAME=jest-junit.xml \
        pnpm exec jest --maxWorkers=4 --reporters=default --reporters=jest-junit -t "$OFFLINE_ONLY"
}

for s in "$@"; do
    case "$s" in
        lint) step lint pnpm exec eslint . ;;
        typecheck) step typecheck pnpm exec tsc --noEmit ;;
        snapper) step snapper scripts/snapper.sh ;;
        build) step build snap_build && record_manifest ;;
        test) step test jest_tests ;;
        *) echo "unknown step: $s" >&2; exit 2 ;;
    esac
done
junit_write_cases "$out/junit.xml" "$suite" "$cases"
exit "$status"
