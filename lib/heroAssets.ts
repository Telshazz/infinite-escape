// ---------------------------------------------------------------------------
// Higgsfield-generated hero prop meshes (image_to_3d, textured GLB).
//
// By default these load straight from Higgsfield's CDN in the player's
// browser. If a fetch fails (offline, CORS), the renderer silently falls
// back to the procedural build of the same prop — the demo never breaks.
//
// To make the app self-contained, run  scripts/fetch-hero-props.sh  from a
// machine with open egress (it vendors the files into public/models/), then
// flip VENDORED to true.
// ---------------------------------------------------------------------------

const VENDORED = false;

const CDN: Record<string, string> = {
  'atlantis-altar':
    'https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/22a3e4cc-4cc1-4879-8ccb-255ea84d8da3.glb',
  'atlantis-leviathan':
    'https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/f1acff44-6b47-44b5-8f6d-fe0f7f44d50f.glb',
};

export const heroGlb = (key: keyof typeof CDN): string =>
  VENDORED ? `/models/${key}.glb` : CDN[key];
