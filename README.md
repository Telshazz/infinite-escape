# Infinite Escape™ — Playable FPS Investor Demo

**"We don't rebuild rooms. We rebuild reality."**

A first-person, physically-simulated, browser-based demo of the Infinite
Escape AI-powered mixed reality escape room operating system. Three physical
chambers, seven AI-generated realities, five reusable puzzle engines — all
running on software, zero rebuilds.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (Chrome/Edge, desktop only — this is a high-end
investor demo, not a mobile experience).

Production build: `npm run build && npm start`

URL flags: `?nofx` disables the postprocessing chain (low-end GPU fallback),
`?debug` exposes the game store on `window.__game` for automated testing.

## Controls

| Input | Action |
| --- | --- |
| Click | Lock pointer / interact with the aimed object |
| WASD | Move (8 ft/s walk) |
| Shift / C | Sprint (13 ft/s) / crouch |
| E | Interact (examine anchor, open door, inspect clue) |
| Esc | Release pointer (pause) / step back from a puzzle |
| H | Request adaptive hint |
| V | Cycle reality layer (Physical / Mixed Reality / Mapping) |
| G | Toggle the Game Master drawer |

## Demo walkthrough (5 minutes)

1. **Launch Investor Demo** → build the group profile. Every field has real
   cause and effect (see *Session spec resolver* below).
2. The **generation sequence** shows the actual resolved spec — chambers kept,
   puzzle count, hint budget, effect intensity — not a fake animation.
3. **Enter the room in first person.** Walk up to the Navigation Altar,
   press E, and solve it as an in-world mechanism. Solving it unseals the
   passage east.
4. Walk through the door — "reality reconfigures" — into the Archive Vault,
   then the Portal Hall. Solve everything to open the Portal Gate and escape.
5. From the pause menu (Esc): **Regenerate the facility** into any of 7
   themes — same chambers, new story, new puzzle graph, genuinely different
   mechanics. Wonderland is the non-linear showcase (hub + side chambers in
   any order).
6. **Investor View** shows the business case plus the fixed/swappable layer
   split that makes the pitch honest.

## Architecture

Everything splits into the two layers that ARE the product:

- **Fixed layer** (`lib/facility.ts`) — the physical venue: 3 chamber shells
  (20×20, 16×20, 20×24 ft), 5 doorway positions, effects rig (fans, misters,
  LED channels, speakers). Real capex; identical across all themes. Doorways
  a theme doesn't use render as sealed panels.
- **Swappable layer** (`lib/themes/*.ts`) — per-theme room graphs mapped onto
  those shells: themed rooms, doors with **gate conditions**, anchors with a
  **mechanic engine + config** each, clue props, set dressing, GM copy.

### The 5 mechanic engines (`components/mechanics/`)

`sequence` (pick in order) · `dial` (rotate wheels to a code) · `connect`
(wire left↔right) · `arrange` (place items into slots) · `riddle`
(free text, multiple-choice on Guided). Each theme skins them differently —
Atlantis's dial is a relic cipher, Pirate's is a compass bearing lock,
Corporate's is a badge keypad. Same engine, different gameplay.

### Room graph, not room chain (`lib/spec.ts`, `lib/store.ts`)

Doors carry generic gate conditions (`always` / `anchors allOf` /
`allRequired`) evaluated against the completed-anchor set — never "the next
room in sequence." Only one room is mounted at a time (scene swap with a
"reality reconfigures" transition, not streaming). Traversal is bidirectional
once a gate opens, which is what makes cross-room clue runs work.

### Session spec resolver (`lib/spec.ts`)

`resolveSessionSpec(theme, profile)` deterministically turns all six profile
fields into one spec. Precedence when fields conflict:
**Mode caps > Fear Level multiplier > Difficulty baseline.**

- **Difficulty** → band (guided/standard/hard/expert): puzzles per room,
  decoys, cross-room dependencies, hint cap per puzzle (∞/5/2/1) + starting
  tier (existing subtle→moderate→clear escalation still applies), GM posture
  (proactive / on-request / silent), baseline effect intensity.
- **Session length** → chamber budget (30 min = 2 chambers; linear chains
  collapse around pruned rooms, hub leaves just drop). Independent axis from
  difficulty: a 30-min Expert run is fewer rooms with denser puzzles.
- **Player count** → parallel anchor stations spawn at ≥5 players (or always
  in Corporate mode) so groups can split up.
- **Mode** → ceilings: Family Friendly hard-caps fear-adjacent intensity,
  disables startle cues and switches the timer to count-up; Horror raises the
  intensity floor; Corporate biases parallel + professional register.
- **Fear level** → multiplier on effect intensity within the mode ceiling.

The "AI generating…" sequence surfaces the resolver's actual notes.

### Scene stack

Next.js 14 · React Three Fiber · Rapier (`@react-three/rapier`, capsule
collider, pointer-lock FPS at 5'6" eye height, 1 unit = 1 ft) ·
`@react-three/postprocessing` (N8AO, bloom, ACES filmic, vignette, subtle
chromatic aberration) · procedural PBR textures generated on-canvas
(`lib/textures.ts` — albedo/normal/roughness from tileable noise, no texture
binaries, no network fetches) · positional audio hooks on the speaker rig ·
Zustand store as the single source of truth.

Hero props can be swapped from procedural builds to Higgsfield-generated GLB
meshes via `PropSpec.glbUrl` (files live in `public/models/`).

## MCP tooling used to build this

- **Higgsfield MCP** — `generate_image` → `generate_3d` for hero prop GLBs
  (see `public/models/`). Note: Higgsfield's `generate_audio` is
  text-to-speech only — it cannot produce ambient soundscape loops, so the
  positional-audio hooks look for files in `public/audio/` and fail silent
  when absent. Drop any `*-ambient.mp3` loops there to activate them.
- **Vercel MCP** — deployment to a live shareable URL.

## Testing

Automated Playwright flows live outside the repo (session scratchpad) and
drive: full Atlantis playthrough (all engines via real clicks), door gate
enforcement, session completion, hint caps, all-7-theme regeneration, and
spec resolver edge cases (30-min Expert, Family Friendly + Intense, Guided,
Corporate). `npx tsc --noEmit` and `next build` are clean.
