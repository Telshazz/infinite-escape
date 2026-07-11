# Infinite Escape™ — Investor Demo

**"We don't rebuild rooms. We rebuild reality."**

A playable, browser-based investor simulation of the Infinite Escape AI-powered
mixed reality escape room operating system. One physical 20×20 room, unlimited
AI-generated realities.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (Chrome/Edge recommended, desktop-first).

Production build:

```bash
npm run build && npm start
```

## Demo walkthrough (3–5 minutes)

1. **Launch Investor Demo** → configure the group profile (players, difficulty,
   mode, fear level, session length). Difficulty changes clue directness and
   hint subtlety.
2. Watch the **AI generation sequence** (scan → map → story → puzzles → effects).
3. Explore the room: **drag to orbit, scroll to zoom, click glowing objects.**
4. Use the **Reality Switch** (bottom-left) to flip between **Physical /
   Mixed Reality / Mapping** — same props, different reality. Mapping shows
   every physical object → digital twin → interaction → linked effect.
5. Solve the 3-step chain: **Altar** (symbol sequence: Trident → Wave →
   Nautilus → Star) → **Relic Archive** (code 7·4·2) → **Portal Gate**.
6. Toggle the **physical effects rig** (bottom-right): wind, mist, lighting,
   audio, scent, vibration.
7. Use **Request Adaptive Hint** in the AI Game Master panel — hints scale
   with difficulty and sharpen on repeat requests.
8. Open **Investor View** for the business model + single-room ROI.
9. Hit **Regenerate Room** to re-skin the same physical space into Pirate,
   Zombie, Wonderland, Space Station, Castle, or Corporate — new story, labels,
   lighting, and puzzle type, zero construction.

## Stack

Next.js 14 · React 18 · TypeScript · React Three Fiber + drei · Zustand ·
Framer Motion · Tailwind CSS. No backend, login, or database — scripted
adaptive logic stands in for the future OpenAI-driven puzzle generator
(see `lib/store.ts` → `requestHint`, `lib/data.ts` → `THEMES`).

## Structure

```
app/page.tsx               View state machine (start → wizard → generating → room → business)
lib/types.ts               RoomAsset, DigitalTwinMapping, PlayerProfile, Puzzle, Theme, GameState…
lib/data.ts                20 mapped props, 3 puzzles, hint matrices, 7 themes, ROI figures
lib/store.ts               Zustand game state + adaptive hint/GM logic
components/scene/RoomScene.tsx   R3F scene: layers, effects, particles, camera shake
components/*.tsx           StartScreen, SetupWizard, GameMasterPanel, PuzzleModal,
                           EffectsRail, InvestorDashboard, ThemeRegenerator, BusinessModelView
```

Extending to real AI later: swap the scripted `gmSay`/hint logic for an
LLM call and generate `Puzzle`/`Theme` objects server-side — the type system
and store actions are already shaped for it.
