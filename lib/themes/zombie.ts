import type { Theme } from '../types';

// ---------------------------------------------------------------------------
// ZOMBIE APOCALYPSE — a LINEAR escape from a failing quarantine facility:
//   Triage Bay (A) → Cold Storage (B) → Airlock Gallery (C)
//
// GM register: tense but never gory. Pressure, not splatter.
//
// Mechanic assignments (one engine per anchor, §2.5):
//   zmb-generator  connect   — patch the breakers back onto the subsystems
//   zmb-timeline   sequence  — reorder the infection timeline (extra, hard+)
//   zmb-keypad     dial      — the antidote cold-chain batch code
//   zmb-centrifuge arrange   — load the centrifuge vials by density (parallel)
//   zmb-override   riddle    — speak the project codename to force the airlock;
//                              the passphrase is scrawled on a whiteboard back
//                              in the TRIAGE BAY (cross-room, hard+)
// ---------------------------------------------------------------------------

export const zombie: Theme = {
  id: 'zombie',
  name: 'Zombie Apocalypse',
  tagline: 'The quarantine failed hours ago. The airlock is the only way out.',
  gmIntro:
    'You made it inside — now make it out. Power is dying, the cold-chain is slipping, and the doors between you and the surface run on protocols nobody left running. Stay quiet. Work fast. I’ll route what power I can.',
  samplePuzzleType: 'Breaker patching · cold-chain code · airlock override',
  structure: 'linear',
  palette: {
    fog: '#141b12',
    floor: '#1a2418',
    wall: '#22301e',
    primary: '#3f6b2f',
    secondary: '#8fe03a',
    accent: '#c23b22',
    keyLight: '#8fe03a',
    fillLight: '#2f4d24',
  },
  twins: {
    fan: 'HVAC Scrubber',
    mister: 'Decon Fogger',
    ledStrip: 'Emergency Strip',
    speaker: 'PA Horn',
    crate: 'Supply Case',
    barrel: 'Biohazard Drum',
    door: 'Blast Door',
  },
  ambientAudio: '/audio/zombie-ambient.mp3',
  rooms: [
    {
      id: 'triage-bay',
      chamber: 'A',
      name: 'The Triage Bay',
      flavor:
        'Overturned gurneys, a flickering emergency strip, and the low thud of something against a sealed door down the hall. A dead breaker panel hums to be woken.',
      priority: 1,
      anchors: [
        {
          id: 'zmb-generator',
          roomId: 'triage-bay',
          name: 'Main Breaker Panel',
          role: 'core',
          mechanic: 'connect',
          prop: { kind: 'panel' },
          position: [-9.6, 3.6, 5],
          size: [0.5, 4.5, 5],
          facing: [1, 0, 0],
          objective: 'Patch each live breaker back onto the subsystem it feeds to restore power.',
          clueEasy:
            'A wiring card taped inside the panel: Breaker 1 → Lights, Breaker 2 → Door Servos, Breaker 3 → Comms. Match them.',
          clueHard:
            'The panel labels are peeled off. A card notes the load order: lighting first, then the doors, then the radios.',
          config: {
            kind: 'connect',
            left: [
              { id: 'brk1', label: 'Breaker 1', glyph: 'bolt' },
              { id: 'brk2', label: 'Breaker 2', glyph: 'bolt' },
              { id: 'brk3', label: 'Breaker 3', glyph: 'bolt' },
            ],
            right: [
              { id: 'lights', label: 'Lighting', glyph: 'sun' },
              { id: 'servos', label: 'Door Servos', glyph: 'gear' },
              { id: 'comms', label: 'Comms', glyph: 'satellite' },
            ],
            pairs: { brk1: 'lights', brk2: 'servos', brk3: 'comms' },
            leftTitle: 'Breakers',
            rightTitle: 'Subsystems',
          },
          hints: {
            clear: [
              'Breaker 1→Lighting, Breaker 2→Door Servos, Breaker 3→Comms.',
              'Follow the load order on the card: lights, doors, radios.',
            ],
            moderate: [
              'The card lists the subsystems in the order the breakers are numbered.',
              'Power the lights before anything that moves.',
            ],
            subtle: [
              'The wiring card is still taped inside the panel door.',
              'Three breakers, three loads, one obvious order.',
            ],
          },
          solvedCopy:
            'The strip lights steady and the door servos whir awake. It’s louder now — but you can see.',
          solvedEffects: ['lighting'],
        },
        {
          id: 'zmb-timeline',
          roomId: 'triage-bay',
          name: 'Infection Timeline Board',
          role: 'extra',
          mechanic: 'sequence',
          prop: { kind: 'console' },
          position: [6.5, 0, 5.5],
          size: [2.6, 3.2, 1.8],
          facing: [-1, 0, 0],
          objective: 'Reconstruct the outbreak timeline in the order events were logged.',
          clueEasy:
            'The intake logs run: Exposure, then Fever, then Collapse, then Turn. Set the cards in that order.',
          clueHard:
            'Scattered log cards. The clinic charted every case the same way, from first contact to final stage.',
          config: {
            kind: 'sequence',
            options: [
              { id: 'exposure', label: 'Exposure', glyph: 'biohazard' },
              { id: 'fever', label: 'Fever Onset', glyph: 'flask' },
              { id: 'collapse', label: 'Collapse', glyph: 'hourglass' },
              { id: 'turn', label: 'The Turn', glyph: 'skull' },
              { id: 'recovery', label: 'Full Recovery', glyph: 'star', decoy: true },
              { id: 'immunity', label: 'Natural Immunity', glyph: 'shield', decoy: true },
            ],
            solution: ['exposure', 'fever', 'collapse', 'turn'],
          },
          hints: {
            clear: [
              'Exposure → Fever Onset → Collapse → The Turn.',
              'There was no recovery and no immunity — those two cards are wishful thinking.',
            ],
            moderate: [
              'Start at first contact, end at the final stage.',
              'Two of these outcomes never happened here. Leave them out.',
            ],
            subtle: [
              'The clinic logged every case the same way.',
              'Not every card on the board is a real outcome.',
            ],
          },
          solvedCopy:
            'The timeline resolves on-screen. The pattern is grim, but the terminal unlocks a stored access token.',
          solvedEffects: ['lighting', 'audio'],
        },
      ],
      clueProps: [
        {
          id: 'zmb-whiteboard',
          roomId: 'triage-bay',
          name: 'Staff Whiteboard',
          forAnchor: 'zmb-override',
          text:
            'Half-erased marker on the whiteboard, scrawled in a hurry: "IF CONTAINMENT FAILS — airlock override = project codename. It’s LAZARUS. Do NOT write it anywhere they can find it." (Someone already did.)',
          prop: { kind: 'panel' },
          position: [4, 4.5, 9.7],
          size: [5, 3.5, 0.3],
          rotationY: Math.PI,
        },
      ],
      setPieces: [
        { prop: { kind: 'table' }, position: [3, 0, -6], size: [3, 2.5, 1.6], rotationY: 0.2 },
        { prop: { kind: 'cabinet' }, position: [7.5, 0, -7], size: [2, 4, 1.5], rotationY: -0.3 },
        { prop: { kind: 'barrel' }, position: [-7, 0, -7], size: [1.6, 2.4, 1.6] },
        { prop: { kind: 'crate' }, position: [-7, 0, 8], size: [2, 2, 2], rotationY: 0.4 },
      ],
    },
    {
      id: 'cold-storage',
      chamber: 'B',
      name: 'Cold Storage',
      flavor:
        'Breath fogs the air. Sample racks line the frost-rimed walls, and a sealed keypad guards the antidote fridge. A centrifuge sits dark on the bench.',
      priority: 3,
      pruneCollapseTo: 'airlock-gallery',
      anchors: [
        {
          id: 'zmb-keypad',
          roomId: 'cold-storage',
          name: 'Antidote Fridge Keypad',
          role: 'core',
          mechanic: 'dial',
          prop: { kind: 'cabinet' },
          position: [7, 0, -2],
          size: [1.6, 6.5, 4],
          facing: [-1, 0, 0],
          objective: 'Enter the cold-chain batch code to release the antidote.',
          clueEasy:
            'A cold-chain tag hangs from the shelf: "Batch 4-1-9. Keep at 4°C." Enter 4 · 1 · 9.',
          clueHard:
            'The antidote log lists the viable batch by its three-digit lot: four, then one, then nine.',
          config: {
            kind: 'dial',
            wheels: [
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            ],
            code: ['4', '1', '9'],
            wheelLabels: ['Lot', 'Line', 'Run'],
            submitLabel: 'Release Antidote',
          },
          hints: {
            clear: [
              'The code is 4 · 1 · 9.',
              'Read the cold-chain tag hanging from the antidote shelf.',
            ],
            moderate: [
              'Only one batch is still viable — find its lot number.',
              'Three digits, printed on the shelf tag.',
            ],
            subtle: [
              'The storage temperature is a red herring. The lot number is the code.',
              'Check the tags before the frost hides them.',
            ],
          },
          solvedCopy:
            'The fridge seal pops with a gasp of cold vapor. The antidote case is yours — and the inner door unlocks.',
          solvedEffects: ['mist', 'lighting'],
        },
        {
          id: 'zmb-centrifuge',
          roomId: 'cold-storage',
          name: 'Sample Centrifuge',
          role: 'parallel',
          mechanic: 'arrange',
          prop: { kind: 'console' },
          position: [0, 0, -3],
          size: [3.2, 3, 2.4],
          facing: [0, 0, 1],
          objective: 'Load the centrifuge vials into their bays from lightest to densest.',
          clueEasy:
            'The bench card: "Balance by density — Plasma, then Serum, then Reagent, then Sediment." Load them in that order.',
          clueHard:
            'The centrifuge only spins true when balanced lightest to heaviest. The bench card ranks each sample by density.',
          config: {
            kind: 'arrange',
            slots: [
              { id: 'bay1', label: 'Bay 1 — Lightest' },
              { id: 'bay2', label: 'Bay 2' },
              { id: 'bay3', label: 'Bay 3' },
              { id: 'bay4', label: 'Bay 4 — Densest' },
            ],
            items: [
              { id: 'plasma', label: 'Plasma Vial', glyph: 'vial' },
              { id: 'serum', label: 'Serum Vial', glyph: 'flask' },
              { id: 'reagent', label: 'Reagent Vial', glyph: 'vial' },
              { id: 'sediment', label: 'Sediment Vial', glyph: 'flask' },
              { id: 'empty', label: 'Empty Vial', glyph: 'vial', decoy: true },
            ],
            solution: { bay1: 'plasma', bay2: 'serum', bay3: 'reagent', bay4: 'sediment' },
            submitLabel: 'Spin the Rotor',
          },
          hints: {
            clear: [
              'Plasma → Serum → Reagent → Sediment, lightest to densest.',
              'The empty vial has no place in a balanced rotor.',
            ],
            moderate: [
              'Order by density. Plasma is thinnest; sediment is thickest.',
              'One vial is empty — leave it out or the rotor wobbles.',
            ],
            subtle: [
              'A centrifuge must be balanced to spin.',
              'The bench card lists them in the right order already.',
            ],
          },
          solvedCopy:
            'The rotor spins up smooth and true. A clean sample separates out — one more piece of the cure secured.',
          solvedEffects: ['vibration'],
        },
      ],
      setPieces: [
        { prop: { kind: 'shelf' }, position: [-5, 0, 9.2], size: [4, 6.5, 1], rotationY: Math.PI },
        { prop: { kind: 'shelf' }, position: [6, 0, 7.5], size: [4, 6.5, 1], rotationY: -0.3 },
        { prop: { kind: 'barrel' }, position: [-6, 0, -7], size: [1.6, 2.4, 1.6] },
        { prop: { kind: 'crate' }, position: [5, 0, -8], size: [2, 2, 2], rotationY: 0.3 },
      ],
    },
    {
      id: 'airlock-gallery',
      chamber: 'C',
      name: 'The Airlock Gallery',
      flavor:
        'The last stretch. A long observation gallery ends at the surface airlock, its override console blinking red. Daylight leaks around the seal — so close now.',
      priority: 2,
      anchors: [
        {
          id: 'zmb-override',
          roomId: 'airlock-gallery',
          name: 'Airlock Override Console',
          role: 'core',
          mechanic: 'riddle',
          // the passphrase whiteboard lives in Triage Bay, but the puzzle
          // itself must spawn at every difficulty (clueEasy is self-contained)
          prop: { kind: 'console' },
          position: [-7, 0, 3],
          size: [3, 3.4, 2],
          facing: [1, 0, 0],
          objective: 'The airlock demands the project codename. Speak it to force the seal.',
          clueEasy:
            'The console prompt: "ENTER PROJECT CODENAME." It was scrawled on the staff whiteboard back in the Triage Bay — LAZARUS.',
          clueHard:
            'The override won’t take a password reset — only the original project codename, the one the staff swore never to write down.',
          config: {
            kind: 'riddle',
            prompt:
              'AIRLOCK OVERRIDE — enter the project codename. (A frightened hand wrote it on a whiteboard you’ve already passed.)',
            answers: ['lazarus', 'project lazarus', 'the lazarus protocol', 'lazarus protocol'],
            choices: ['LAZARUS', 'PROMETHEUS', 'ICARUS', 'ORPHEUS'],
            placeholder: 'Enter codename…',
          },
          hints: {
            clear: [
              'The codename is LAZARUS.',
              'Read the staff whiteboard back in the Triage Bay.',
            ],
            moderate: [
              'The answer isn’t in this room — it’s scrawled one bay back.',
              'Think of the name for something brought back from the dead.',
            ],
            subtle: [
              'Someone wrote it down against orders. Go find where.',
              'The project was named for a man who rose again.',
            ],
          },
          solvedCopy:
            'The console flashes green. Bolts retract along the airlock frame — the seal breaks and cold, clean air rushes in.',
          solvedEffects: ['wind', 'lighting', 'audio'],
        },
      ],
      setPieces: [
        { prop: { kind: 'pipe' }, position: [8, 0, 4], size: [1.4, 8, 1.4] },
        { prop: { kind: 'gate' }, position: [8, 0, 9], size: [4, 6, 1], rotationY: -0.2 },
        { prop: { kind: 'barrel' }, position: [-8, 0, -6], size: [1.6, 2.4, 1.6] },
        { prop: { kind: 'crate' }, position: [-8, 0, 8], size: [2, 2, 2], rotationY: 0.4 },
        { prop: { kind: 'cabinet' }, position: [4, 0, 9], size: [2, 4, 1.5], rotationY: 0.1 },
      ],
    },
  ],
  doors: [
    {
      id: 'zmb-door-1',
      doorway: 'A-B',
      from: 'triage-bay',
      to: 'cold-storage',
      name: 'The Inner Blast Door',
      gate: { type: 'anchors', allOf: ['zmb-generator', 'zmb-timeline'] },
      lockedCopy: 'The blast door stays sealed. Its servos won’t move until this bay is fully powered.',
      transitionCopy: 'The blast door grinds aside — a wall of cold air spills out to meet you…',
    },
    {
      id: 'zmb-door-2',
      doorway: 'B-C',
      from: 'cold-storage',
      to: 'airlock-gallery',
      name: 'The Decon Door',
      gate: { type: 'anchors', allOf: ['zmb-keypad'] },
      lockedCopy: 'The decon door holds. The antidote fridge must be opened before it cycles.',
      transitionCopy: 'The decon door hisses open — sprayers pulse, and the gallery stretches ahead…',
    },
    {
      id: 'zmb-exit',
      doorway: 'EXIT-C',
      from: 'airlock-gallery',
      to: 'ESCAPE',
      name: 'The Surface Airlock',
      gate: { type: 'allRequired' },
      lockedCopy: 'The airlock is dead-bolted until every system in the facility is squared away. Not yet.',
      transitionCopy: 'The airlock cycles one last time — and then you’re out, into the light…',
    },
  ],
};
