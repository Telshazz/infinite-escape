#!/usr/bin/env bash
# Vendors the Higgsfield-generated hero prop GLBs into public/models/ so the
# app no longer depends on the generation CDN. Run from the repo root on a
# machine with open egress, then set VENDORED = true in lib/heroAssets.ts.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/models

curl -fSL -o public/models/atlantis-altar.glb \
  'https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/22a3e4cc-4cc1-4879-8ccb-255ea84d8da3.glb'
curl -fSL -o public/models/atlantis-leviathan.glb \
  'https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/f1acff44-6b47-44b5-8f6d-fe0f7f44d50f.glb'

ls -la public/models/
echo
echo "Done. Now set VENDORED = true in lib/heroAssets.ts."
echo "Optional: compress with  npx @gltf-transform/cli optimize <in> <out>"
