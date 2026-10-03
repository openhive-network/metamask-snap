# Sourced by the .aidev suite scripts: make node_modules match pnpm-lock.yaml,
# offline, from the image's store. A marker records the lockfile and Node it was
# installed for; it is written only after an install that succeeded, and an
# install whose tools don't resolve is redone. Lifecycle scripts stay off, as in
# CI (`pnpm install --ignore-scripts`): @lavamoat/preinstall-always-fail exists
# to fail any install that runs them.
if [ ! -e pnpm-workspace.yaml ] || [ ! -e .npmrc ]; then
    echo "pnpm-workspace.yaml/.npmrc are symlinks into the npm-common-config submodule, which is not checked out" >&2
    return 1
fi
lock_id="$(sha256sum pnpm-lock.yaml | cut -d' ' -f1) $(node --version)"
marker=node_modules/.aidev-pnpm-lock
tools_ok() { [ -e node_modules/.bin/mm-snap ] && [ -e node_modules/.bin/jest ] && [ -e node_modules/.bin/eslint ] && [ -e node_modules/.bin/tsc ]; }
if [ "$(cat "$marker" 2>/dev/null)" != "$lock_id" ] || ! tools_ok; then
    echo "node_modules is not current for pnpm-lock.yaml: pnpm install --offline" >&2
    pnpm install --offline --frozen-lockfile --ignore-scripts < /dev/null || return 1
    tools_ok || { echo "pnpm install left no mm-snap/jest/eslint/tsc" >&2; return 1; }
    printf '%s\n' "$lock_id" > "$marker.tmp" && mv "$marker.tmp" "$marker"
fi
