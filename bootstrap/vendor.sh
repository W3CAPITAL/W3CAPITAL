#!/usr/bin/env bash
set -euo pipefail
UPSTREAM='https://github.com/bilawalsidhu/gods-eye-view.git'
PIN='e28df70fdb192b771f470b80e31413f3ea6ece6b'
if [[ -f .god-eye-imported ]]; then echo 'Already imported'; exit 0; fi
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
git -C "$TEMP" init -q
git -C "$TEMP" remote add origin "$UPSTREAM"
git -C "$TEMP" fetch --depth 1 origin "$PIN"
git -C "$TEMP" checkout -q FETCH_HEAD
# Keep W1CAPITAL cloud integrations and omit upstream GitHub Actions.
git -C "$TEMP" archive HEAD | tar -x -C . \
  --exclude='.github/workflows' --exclude='.github/workflows/*' \
  --exclude='bootstrap' --exclude='bootstrap/*' \
  --exclude='api' --exclude='api/*' \
  --exclude='vercel.json' --exclude='README-BR.md' \
  --exclude='src/search/brazilGeocoder.js' --exclude='src/search/brazilGeocoder.test.mjs' \
  --exclude='src/search/cepGeocoder.js' --exclude='src/search/cepGeocoder.test.mjs'
# Defensive cleanup if an upstream workflow escaped the tar filter.
find .github/workflows -maxdepth 1 -type f ! -name 'vendor.yml' -delete
node bootstrap/patch.mjs
printf 'Upstream %s\n' "$PIN" > .god-eye-imported
git add -A
git -c user.name='github-actions[bot]' -c user.email='41898282+github-actions[bot]@users.noreply.github.com' commit -m 'feat: import Gods Eye View and optimize Brazilian search'
git push origin HEAD:main
