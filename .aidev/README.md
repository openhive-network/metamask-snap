# metamask-snap under AIDEV

AIDEV verifies changes to the snap through the slots in `project.yaml`, integrates them
into `aidev/integration`, and people merge that into `main` through merge requests.
GitLab CI doesn't run for AIDEV branches; see `.gitlab-ci.yml` `workflow:`.

## Suites

`.aidev/run-checks.sh <suite> <step>...` runs the named steps and writes
`test-results/<suite>/junit.xml`, one test case per step, with the step's log tail as
the failure body. The Jest suite also writes one case per test to `jest-junit.xml`.

| Step | What |
|---|---|
| `lint` | ESLint (package.json `lint`, CI's lint job) |
| `snapper` | `scripts/snapper.sh`, the security analysis `pnpm build` runs first (`prebuild`) |
| `build` | `mm-snap build` -> `dist/bundle.js` (CI's build job) |
| `manifest-shasum` | (after `build`) pass when the build left `snap.manifest.json` as committed, skipped otherwise |
| `test` | Jest + `@metamask/snaps-jest` against `dist/bundle.js` (CI's test job) |
| `reproducible` | `scripts/check-reproducible-build.sh`: builds two copies of the checkout at different absolute paths, fails unless `dist/bundle.js` and the manifest shasum match (CI's `reproducible_build` job) |
| `typecheck` | `tsc --noEmit`; not bound, it fails today (TS5110 in `tsconfig.json`) and CI doesn't run it |

| Slot | Steps |
|---|---|
| quick, canary | lint, snapper, build, test |
| full | lint, snapper, build, test, reproducible |
| static | lint, snapper |
| baseline, coverage, system | build, test |

Differences from CI:

- **The image-hoster test is skipped.** `should sign image for image hoster` uploads to
  `images.hive.blog`, and suites run with `--network none`.
- **The manifest shasum.** `mm-snap build` rewrites `snap.manifest.json`'s `shasum` when it
  doesn't match the bundle, and CI's build reports this as `(fixed)` and ships the rewritten
  manifest. The bundle doesn't depend on the checkout path (`snap.config.ts`), so the committed
  shasum matches a build from the same sources and lockfile; after a change to either, the
  tests install the rebuilt manifest and the script restores the committed one when it exits,
  so the working tree stays clean.
- **`.npmrc` and `pnpm-workspace.yaml`** are symlinks into the `npm-common-config`
  submodule (hive/common-ci-configuration). The install fails with a clear message when
  the submodule isn't checked out.

## The test runtime image (`runtime/`)

The suites run in a container with `--network none` and your uid. The image carries
Node 24.21.0 (CI's `image: node:24.21.0`), jq, pnpm (from package.json `packageManager`,
through corepack) and a pnpm store filled with `pnpm fetch`. `pnpm-deps.sh` installs
`node_modules` offline from it, with `--ignore-scripts` as in CI.

When `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `packageManager` or
`runtime/Dockerfile` change, rebuild and re-pin **in the same commit**:

```bash
.aidev/runtime/build.sh --push   # registry digest if aidev-<input hash> exists, else build + push
# put the printed repo@sha256:<digest> into project.yaml environment.image
```

Run a suite by hand the same way AIDEV does:

```bash
docker run --rm --network none --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -v "$PWD":/work -w /work <environment.image> .aidev/run-checks.sh quick lint snapper build test
```
