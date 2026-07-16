# Infinite Escape™ — End-to-End QA Task List

For manual QA on real hardware. Automated coverage already exists
(`scripts/e2e-playthrough.mjs` certifies all 7 themes completable;
`scripts/e2e-uiflow.mjs` covers 23 UI checks) — this list focuses on what
automation can't judge: feel, readability, timing, sound, and visuals on
real GPUs.

**Conventions**
- ✅ = pass, ❌ = fail (file a bug), ⚠️ = pass with notes
- Unless stated, test at the default profile: 4 players, Difficulty 5,
  Adventure, Mild, 45 min, Atlantis.
- Bug reports: include browser + GPU, the session profile used, the theme,
  a screenshot, and console errors (F12 → Console).

---

## 0. Environment Setup

| # | Task |
|---|---|
| 0.1 | `npm install && npm run build && npx next start` — build completes with no errors |
| 0.2 | Open `http://localhost:3000` in Chrome (primary), then repeat critical sections in Edge and Firefox |
| 0.3 | Test on at least: one discrete-GPU machine, one integrated-GPU laptop |
| 0.4 | Run both automated suites and confirm green before manual passes (see file headers for setup) |

## 1. Entry Screens

| # | Task | Expected |
|---|---|---|
| 1.1 | Load the site | Start screen with title, tagline, two buttons; no console errors |
| 1.2 | Click **View Business Model** | Business view opens; return path works |
| 1.3 | Click **Launch Investor Demo** | Setup wizard appears |

## 2. Setup Wizard — every field must do something

| # | Task | Expected |
|---|---|---|
| 2.1 | Drag Players slider 2→10 | Value updates live |
| 2.2 | Drag Difficulty 1→10 | Value updates live |
| 2.3 | Click each Mode and Fear option | Selection highlights follow clicks |
| 2.4 | Click each Session Length | Selection updates |
| 2.5 | Generate at D2 | Notes report: no decoys, unlimited hints, proactive GM |
| 2.6 | Generate at D9 + 30 min | Notes report: chambers sealed (2 of 3 active), cross-chamber dependencies armed, 1 hint/puzzle, silent GM |
| 2.7 | Generate Family Friendly + Intense | Notes report intensity capped ≤45%, "no startle cues" |
| 2.8 | Generate 6 players or Corporate mode | Notes report parallel stations enabled |
| 2.9 | **Enter the Room** button appears only after all steps complete | Clicking enters first-person view |

## 3. First-Person Core (feel testing — real hardware judgment)

| # | Task | Expected |
|---|---|---|
| 3.1 | Click the 3D view | Pointer locks; mouselook is smooth; sensitivity feels natural |
| 3.2 | WASD in all directions, with Shift and C | Walk ~8 ft/s, sprint noticeably faster, crouch lowers eye height |
| 3.3 | Walk into every wall, the altar, crates, statues | Solid collision; no clipping, no climbing, no jitter |
| 3.4 | Walk every room corner-to-corner | Never fall through floor; eye height constant |
| 3.5 | Frame rate on discrete GPU | Smooth (≈60fps); note any hitches when entering rooms |
| 3.6 | Frame rate on integrated GPU, then with `?nofx` | Playable; `?nofx` visibly improves it |
| 3.7 | Esc, then click Resume | Pause overlay shows controls + profile; resume re-locks pointer |
| 3.8 | Alt-tab away and back | Game pauses gracefully; resume works |

## 4. Aiming & Interaction

| # | Task | Expected |
|---|---|---|
| 4.1 | Aim at the altar from across the room | No prompt when out of reach |
| 4.2 | Approach within ~8 ft | Reticle expands; "[E] Examine …" prompt; object glows |
| 4.3 | Press E (and separately, click) | Camera glides in; panel projects off the object; pointer freed |
| 4.4 | Esc / ✕ from panel | Camera returns; pointer re-locks without an extra click |
| 4.5 | Aim at a crate/statue (set dressing) | No interaction prompt |
| 4.6 | Aim at a locked door | Red-tinted prompt naming the door as locked |
| 4.7 | Aim at a wall mural/clue plaque, press E | GM relays the clue text in the panel log |

## 5. The Five Puzzle Engines (test each at least once)

| # | Engine | Where (default Atlantis run) | Checks |
|---|---|---|---|
| 5.1 | Sequence | Navigation Altar | Correct prefix advances; wrong pick shakes + resets; decoys (Watcher, Pillar) never needed; solve fires effects + GM line |
| 5.2 | Dial | Relic Archive (room 2) | Wheels wrap both directions; wrong code shakes without reset; 7·4·2 solves |
| 5.3 | Arrange | Portal Lens Array (room 3) | Place/pick-up works; submit disabled until full; wrong layout resets; cracked lens is a decoy |
| 5.4 | Connect | Regenerate → Zombie, Triage Bay generator | Left→right linking; relink replaces; wrong links clear on test, correct ones survive |
| 5.5 | Riddle | Regenerate → Castle at D5 vs D2 | D2 shows multiple choice; D5 shows free text; answer accepts case/spacing variants ("The Tide" = "tide") |

## 6. Doors, Gating & Multi-Room Flow

| # | Task | Expected |
|---|---|---|
| 6.1 | Try the east door before solving the altar | Locked; GM names the missing mechanism |
| 6.2 | Solve altar, use door | "Reality reconfigures" transition; spawn *facing into* the new room |
| 6.3 | Walk back through the door | Return trip works; first room state preserved (altar still solved) |
| 6.4 | Try the exit with puzzles unsolved | Locked with the missing list |
| 6.5 | Solve everything, open the exit | Escape banner; timer freezes at ESCAPED |
| 6.6 | At D8: solve the Conduit Junction (room 2) | Its legend is only readable on the room-1 mural — verify the walk-back loop is fair and the mural text matches the puzzle |

## 7. Wonderland — Non-Linear Structure

| # | Task | Expected |
|---|---|---|
| 7.1 | Regenerate → Wonderland | Both side doors from the Tea Garden unlock after the tea ceremony |
| 7.2 | Do the side chambers in BOTH orders (two runs) | Either order works |
| 7.3 | The Little Door | Only opens when everything is done; it's in the hub, not a far wall |

## 8. All Seven Themes (one full playthrough each, D5)

For each of Atlantis, Pirate, Zombie, Wonderland, Space, Castle, Corporate:

| # | Check |
|---|---|
| 8.1 | Completable start to escape without hints (use the GM puzzle map) |
| 8.2 | Clue copy is fair — the puzzle is solvable from in-room information |
| 8.3 | Theme skin is coherent: palette, GM voice, prop dressing, door names |
| 8.4 | Stock props render (crates/chests/cargo/furniture per theme) with no floating or clipping into walls |
| 8.5 | Ambient audio bed plays and differs per theme (bubbles / creaks / chimes / pings / gusts / moans) |
| 8.6 | No console errors during the run |

## 9. AI Game Master & Hints

| # | Task | Expected |
|---|---|---|
| 9.1 | Press H repeatedly on one puzzle at D8 | Hint 1 subtle, hint 2 clearer, hint 3 refused (cap = 2) with an in-character line |
| 9.2 | Same at D2 | Hints start clear and never run out |
| 9.3 | At D2, stand idle ~60s | GM proactively nudges toward the current puzzle |
| 9.4 | At D9, stand idle | GM stays silent |
| 9.5 | Solve each puzzle | Unique story line per mechanism in the log; system line when everything's done |
| 9.6 | G key + GM button | Drawer toggles both ways; log autoscrolls |
| 9.7 | Horror vs Corporate vs Family register | Generic GM lines (cap refusals, completion) change tone with mode |

## 10. Reality Switch & Effects Rig

| # | Task | Expected |
|---|---|---|
| 10.1 | V key cycles Physical → Mixed → Mapping | Bottom-left indicator follows |
| 10.2 | Physical layer | Plain gray set; hero/stock skins GONE (procedural stand-ins); rig hardware visible |
| 10.3 | Mapping layer | Labels over anchors (with engine + role), rig (with digital twin), doors (with gate status) |
| 10.4 | FX drawer: toggle all six | Wind spins fans + streaks; Mist raises particles; Lighting pulses LED channels; Audio silences/restores ambience; Vibration shakes camera briefly |
| 10.5 | Fear/mode intensity | Same theme at Family/None vs Horror/Intense: visibly calmer vs harsher (fog, flicker, particle density) |
| 10.6 | Horror + Intense, wait 1–2 min | Occasional startle cue (light dropout + sting); confirm NONE ever fire in Family Friendly |

## 11. Timers

| # | Task | Expected |
|---|---|---|
| 11.1 | Any pressured mode | Countdown from session length; turns red under 5:00 |
| 11.2 | Family Friendly | Counts UP with ELAPSED label |
| 11.3 | Escape | Timer replaced by ESCAPED |

## 12. Regeneration & Investor View

| # | Task | Expected |
|---|---|---|
| 12.1 | Regenerate mid-session | Sweep overlay; new theme starts fresh at its first room; old progress cleared |
| 12.2 | Regenerator modal | 7 cards; current theme marked Live and disabled |
| 12.3 | Investor View | Opens from pause + completion banner; ROI bars animate; "Architecture Is the Moat" shows live session stats matching your profile |
| 12.4 | Rapid regenerate 5+ times in a row | No crash, no memory runaway (watch task manager), rooms always playable |

## 13. Resilience & Fallbacks

| # | Task | Expected |
|---|---|---|
| 13.1 | Block network (DevTools offline) after load, regenerate + play | Hero/stock meshes fall back to procedural builds; game fully playable |
| 13.2 | `?nofx` | Post-processing off; everything else identical |
| 13.3 | Refresh mid-session | Returns to start screen cleanly (sessions are disposable by design) |
| 13.4 | Window resize / fullscreen | Scene and HUD reflow; no stretched rendering |
| 13.5 | Spam E / click during a door transition | No double-transition, no stuck black screen |
| 13.6 | Open a puzzle, walk away impossible? | Movement is frozen while a panel is open; Esc restores it |
| 13.7 | Type WASD/H/V/G into a riddle text box | Characters type into the box; game does NOT move or trigger keybinds |

## 14. Audio

| # | Task | Expected |
|---|---|---|
| 14.1 | First interaction after load | Audio unlocks (browser gesture rule); no errors if user never interacts |
| 14.2 | Walk across a room | Ambience is positional if recorded files are installed; synth bed otherwise |
| 14.3 | Solve/fail/unlock/escape | Distinct cues for each |
| 14.4 | Audio FX toggle off | Room goes quiet; UI cues remain |

## 15. Browser Matrix (repeat sections 3–6 minimum)

| Browser | Sections | Notes |
|---|---|---|
| Chrome (latest) | All | Primary |
| Edge (latest) | 3–6, 10 | |
| Firefox (latest) | 3–6, 10 | Watch pointer-lock behavior differences |
| Safari (latest, macOS) | 3–6 | Best-effort; note issues, not blockers |

## 16. Sign-off Criteria

- [ ] All seven themes completed manually at least once
- [ ] Zero console errors in a full Atlantis D5 and D8 run
- [ ] Both automated suites green on the release build
- [ ] Feel sign-off: mouselook, walk speed, and panel readability approved on discrete + integrated GPU
- [ ] Fallback matrix (section 13) fully green
