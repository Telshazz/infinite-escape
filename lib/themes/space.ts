import type { Theme } from '../types';

// ---------------------------------------------------------------------------
// SPACE STATION — derelict orbital platform. LINEAR chain:
//   Reactor Deck (A) → Cryo Lab (B) → Docking Bay (C)
//
// Mechanic assignments (one engine per anchor, §2.5):
//   spc-reactor    sequence  — cold-start the reactor, subsystems in order
//   spc-coolant    connect   — route coolant loops to heat loads (parallel)
//   spc-telemetry  dial      — the orbital telemetry cipher (9 · 2 · 5)
//   spc-cryo       arrange   — rack the cryo samples; the storage manifest
//                              placard hangs on the REACTOR DECK (cross-room)
//   spc-ai         riddle    — VESTA, the station AI, asks one question
// ---------------------------------------------------------------------------

export const space: Theme = {
  id: 'space',
  name: 'Space Station',
  tagline: 'A dead station wakes when you dock. Its AI has one condition for letting you leave.',
  gmIntro:
    'THIS IS VESTA, STATION INTELLIGENCE. Crew complement detected after 4,000 days of silence. Main power is offline and the docking clamps are fused. Restore my systems deck by deck — I will open the bay doors when every subsystem reports green.',
  samplePuzzleType: 'Reactor startup sequence · orbital cipher · coolant routing',
  structure: 'linear',
  palette: {
    fog: '#0a1024',
    floor: '#101a33',
    wall: '#152242',
    primary: '#2a4a8f',
    secondary: '#4aa8ff',
    accent: '#ff8a3d',
    keyLight: '#4aa8ff',
    fillLight: '#1f3a6b',
  },
  twins: {
    fan: 'Atmo Circulation Duct',
    mister: 'Coolant Bleed Valve',
    ledStrip: 'Guidance Lightway',
    speaker: 'VESTA Voice Node',
    crate: 'Supply Pod',
    door: 'Pressure Bulkhead',
  },
  ambientAudio: '/audio/space-ambient.mp3',
  rooms: [
    {
      id: 'reactor-deck',
      chamber: 'A',
      name: 'The Reactor Deck',
      flavor:
        'Emergency strips glow along the floor. The reactor console sits dark at the center of the deck, its startup panel waiting for hands that know the order.',
      priority: 1,
      anchors: [
        {
          id: 'spc-reactor',
          roomId: 'reactor-deck',
          name: 'Reactor Startup Console',
          role: 'core',
          mechanic: 'sequence',
          prop: { kind: 'console' },
          position: [0, 0, 0.5],
          size: [4.5, 3.2, 2.5],
          facing: [0, 0, -1],
          objective: 'Cold-start the fusion reactor by engaging its subsystems in the correct order.',
          clueEasy:
            'The startup checklist is stenciled on the panel: FUEL CELLS first, then COOLANT PUMPS, then CONTAINMENT RING, and only then CORE IGNITION.',
          clueHard:
            'A scorched decal warns: "Feed it before you cool it. Cage it before you light it. Ignition without containment is how Deck 4 died."',
          config: {
            kind: 'sequence',
            options: [
              { id: 'fuel', label: 'Fuel Cells', glyph: 'fuse' },
              { id: 'coolant', label: 'Coolant Pumps', glyph: 'snowflake' },
              { id: 'containment', label: 'Containment Ring', glyph: 'gear' },
              { id: 'ignition', label: 'Core Ignition', glyph: 'bolt' },
              { id: 'comms', label: 'Comm Array', glyph: 'satellite', decoy: true },
              { id: 'floodlights', label: 'Floodlights', glyph: 'moon', decoy: true },
            ],
            solution: ['fuel', 'coolant', 'containment', 'ignition'],
          },
          hints: {
            clear: [
              'Engage in this exact order: Fuel Cells → Coolant Pumps → Containment Ring → Core Ignition.',
              'Start with the Fuel Cells. Ignition is always the final step.',
            ],
            moderate: [
              'Feed, cool, cage, light. Four steps, in that order.',
              'The Comm Array and Floodlights are not part of the reactor startup.',
            ],
            subtle: [
              'A reactor is fed before it is lit, and caged before either matters.',
              'Not every switch on this console belongs to the checklist.',
            ],
          },
          solvedCopy:
            'REACTOR ONLINE. Main power restored to 61%. VESTA reports: the bulkhead to the Cryo Lab is accepting commands again.',
          solvedEffects: ['lighting', 'vibration'],
        },
        {
          id: 'spc-coolant',
          roomId: 'reactor-deck',
          name: 'Coolant Manifold',
          role: 'parallel',
          mechanic: 'connect',
          prop: { kind: 'pipe' },
          position: [9.7, 3.2, -5],
          size: [0.5, 4.5, 5],
          facing: [-1, 0, 0],
          objective: 'Route each coolant loop to the system it was built to keep alive.',
          clueEasy:
            'The maintenance tag reads: PRIMARY loop feeds the REACTOR CORE. AUXILIARY loop feeds LIFE SUPPORT. EMERGENCY loop feeds the COMPUTER CORE.',
          clueHard:
            'A half-torn maintenance tag: "Primary takes the hottest thing aboard. Auxiliary keeps the crew breathing. Emergency exists so VESTA never overheats."',
          config: {
            kind: 'connect',
            left: [
              { id: 'primary', label: 'Primary Loop', glyph: 'wheel' },
              { id: 'auxiliary', label: 'Auxiliary Loop', glyph: 'gear' },
              { id: 'emergency', label: 'Emergency Loop', glyph: 'snowflake' },
            ],
            right: [
              { id: 'core', label: 'Reactor Core', glyph: 'atom' },
              { id: 'lifesupport', label: 'Life Support', glyph: 'plant' },
              { id: 'computer', label: 'Computer Core', glyph: 'server' },
            ],
            pairs: { primary: 'core', auxiliary: 'lifesupport', emergency: 'computer' },
            leftTitle: 'Coolant Loops',
            rightTitle: 'Heat Loads',
          },
          hints: {
            clear: [
              'Primary→Reactor Core, Auxiliary→Life Support, Emergency→Computer Core.',
              'The biggest loop takes the biggest heat: Primary goes to the Reactor Core.',
            ],
            moderate: [
              'Match by importance: hottest system gets the primary loop.',
              'The emergency loop was installed for VESTA herself.',
            ],
            subtle: [
              'What aboard this station runs hottest? Start there.',
              'The maintenance tag on the manifold has not fully peeled away.',
            ],
          },
          solvedCopy:
            'Coolant pressure nominal. VESTA reports: "Thank you. I was beginning to feel feverish."',
          solvedEffects: ['mist'],
        },
      ],
      clueProps: [
        {
          id: 'spc-manifest',
          roomId: 'reactor-deck',
          name: 'Cryo Storage Manifest',
          forAnchor: 'spc-cryo',
          text:
            'A laminated manifest bolted to the wall: "CRYO RACK PROTOCOL — Bay 1: MICROBE VIAL. Bay 2: SEED POD. Bay 3: ICE CORE. Bay 4: TISSUE FLASK. Contaminated samples are NEVER racked." Someone underlined "never" three times.',
          prop: { kind: 'panel' },
          position: [-9.6, 4.5, 3],
          size: [0.4, 5, 6],
          rotationY: 0,
        },
      ],
      setPieces: [
        { prop: { kind: 'crate' }, position: [-7, 0, -7], size: [2, 2, 2], rotationY: 0.3 },
        { prop: { kind: 'crate' }, position: [7.2, 0, 6.2], size: [2, 2, 2], rotationY: -0.2 },
        { prop: { kind: 'barrel' }, position: [-7.5, 0, 7.5], size: [1.6, 3, 1.6], rotationY: 0.6 },
        { prop: { kind: 'pipe' }, position: [4.5, 0, -7.5], size: [1.2, 8, 1.2] },
      ],
    },
    {
      id: 'cryo-lab',
      chamber: 'B',
      name: 'The Cryo Lab',
      flavor:
        'Frost feathers every surface. Empty sleep pods line the walls, and the telemetry lock blinks three amber digits that the station never forgot.',
      priority: 3,
      pruneCollapseTo: 'docking-bay',
      anchors: [
        {
          id: 'spc-telemetry',
          roomId: 'cryo-lab',
          name: 'Telemetry Cipher Lock',
          role: 'core',
          mechanic: 'dial',
          prop: { kind: 'cabinet' },
          position: [-7.2, 0, -4],
          size: [1.6, 6.5, 4],
          facing: [1, 0, 0],
          objective: 'Unlock the telemetry vault by dialing in the station’s orbital numbers.',
          clueEasy:
            'The mission plaque beside the lock reads: "NINE orbits each day. TWO solar wings. FIVE years on station." Enter 9 · 2 · 5.',
          clueHard:
            'A tarnished mission plaque: it lists how many times the station circles the planet each day, how many solar wings it spreads, and how many years it has burned in orbit.',
          config: {
            kind: 'dial',
            wheels: [
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            ],
            code: ['9', '2', '5'],
            wheelLabels: ['Orbits', 'Wings', 'Years'],
            submitLabel: 'Transmit Code',
          },
          hints: {
            clear: [
              'The code is 9 · 2 · 5 — orbits, wings, years.',
              'Nine orbits per day. Two solar wings. Five years in service.',
            ],
            moderate: [
              'The mission plaque near the lock counts three things about this station.',
              'Orbits first, wings second, years last.',
            ],
            subtle: [
              'A station measures its life in circles, wings, and years.',
              'VESTA remembers her own specifications. So does the plaque.',
            ],
          },
          solvedCopy:
            'TELEMETRY VAULT OPEN. Navigation data recovered. VESTA reports: the Docking Bay bulkhead will release once this deck is secure.',
          solvedEffects: ['lighting'],
        },
        {
          id: 'spc-cryo',
          roomId: 'cryo-lab',
          name: 'Cryo Sample Rack',
          role: 'extra',
          crossRoom: true,
          mechanic: 'arrange',
          prop: { kind: 'cabinet' },
          position: [7.4, 0, 3],
          size: [1.4, 6, 4],
          facing: [-1, 0, 0],
          objective:
            'Rack the recovered samples in protocol order. The storage manifest is posted somewhere you have already been.',
          clueEasy:
            'The manifest back on the Reactor Deck spells it out: Bay 1 microbe vial, Bay 2 seed pod, Bay 3 ice core, Bay 4 tissue flask — and contaminated samples are never racked.',
          clueHard:
            'The rack bays are unlabeled and the frost has eaten the local placard. The station posted its cryo protocol on a wall in another deck.',
          config: {
            kind: 'arrange',
            slots: [
              { id: 'bay1', label: 'Bay 1' },
              { id: 'bay2', label: 'Bay 2' },
              { id: 'bay3', label: 'Bay 3' },
              { id: 'bay4', label: 'Bay 4' },
            ],
            items: [
              { id: 'microbe', label: 'Microbe Vial', glyph: 'vial' },
              { id: 'seed', label: 'Seed Pod', glyph: 'plant' },
              { id: 'ice', label: 'Ice Core', glyph: 'snowflake' },
              { id: 'tissue', label: 'Tissue Flask', glyph: 'flask' },
              { id: 'contaminated', label: 'Contaminated Sample', glyph: 'biohazard', decoy: true },
            ],
            solution: { bay1: 'microbe', bay2: 'seed', bay3: 'ice', bay4: 'tissue' },
            submitLabel: 'Seal the Rack',
          },
          hints: {
            clear: [
              'Bay 1 Microbe Vial, Bay 2 Seed Pod, Bay 3 Ice Core, Bay 4 Tissue Flask. Leave the contaminated sample out.',
              'The manifest on the Reactor Deck wall lists the exact bay order.',
            ],
            moderate: [
              'Walk back to the Reactor Deck and read the laminated manifest on the west wall.',
              'One of these samples should never touch the rack at all.',
            ],
            subtle: [
              'Protocols on this station are posted where crews suit up, not where they work.',
              'The biohazard label means what it says.',
            ],
          },
          solvedCopy:
            'Cryo rack sealed and stable. VESTA reports: "Sample integrity preserved. The science team would have been proud. Would have been."',
          solvedEffects: ['mist', 'lighting'],
        },
      ],
      setPieces: [
        { prop: { kind: 'shelf' }, position: [4, 0, -8.8], size: [6, 7, 1.2] },
        { prop: { kind: 'shelf' }, position: [-4, 0, 8.8], size: [6, 7, 1.2], rotationY: Math.PI },
        { prop: { kind: 'crate' }, position: [6.5, 0, -7.5], size: [2, 2, 2], rotationY: 0.4 },
        { prop: { kind: 'pipe' }, position: [-6.5, 0, 7], size: [1.2, 8, 1.2] },
      ],
    },
    {
      id: 'docking-bay',
      chamber: 'C',
      name: 'The Docking Bay',
      flavor:
        'The bay doors fill the far wall, ribbed with frost and warning stripes. A single console glows at the center — VESTA is waiting there, and she has a question.',
      priority: 2,
      anchors: [
        {
          id: 'spc-ai',
          roomId: 'docking-bay',
          name: 'VESTA’s Final Question',
          role: 'core',
          mechanic: 'riddle',
          prop: { kind: 'console' },
          position: [0, 0, -1],
          size: [4, 3.2, 2.2],
          facing: [0, 0, 1],
          objective:
            'VESTA will not cycle the bay doors for anyone who cannot answer her question.',
          clueEasy:
            '"I have no hands, yet I hold every ship. I bend the path of light itself. Escape me and you drift forever. What am I?" (It is the force that keeps this station falling around the planet.)',
          clueHard:
            '"I have no hands, yet I hold every ship. I bend the path of light itself. Escape me and you drift forever. What am I?"',
          config: {
            kind: 'riddle',
            prompt:
              'I have no hands, yet I hold every ship. I bend the path of light itself. Escape me and you drift forever. What am I?',
            answers: ['gravity', 'gravitation', 'the gravity'],
            choices: ['Gravity', 'The Vacuum', 'Magnetism', 'Inertia'],
            placeholder: 'State your answer for VESTA…',
          },
          hints: {
            clear: [
              'The answer is gravity.',
              'It is what keeps the station in orbit — and what you fight at every launch.',
            ],
            moderate: [
              'It holds the moon to the planet and the planet to the sun.',
              'Even light cannot travel past it in a straight line.',
            ],
            subtle: [
              'The station has been falling for five years and never landed.',
              'You have felt it every second of your life, except up here.',
            ],
          },
          solvedCopy:
            'VESTA reports: "Correct. You understand what holds you. Cycling bay doors — it has been an honor, crew."',
          solvedEffects: ['audio', 'lighting'],
        },
      ],
      setPieces: [
        { prop: { kind: 'crate' }, position: [8, 0, 5], size: [2.4, 2.4, 2.4], rotationY: -0.4 },
        { prop: { kind: 'crate' }, position: [-8, 0, 5], size: [2.4, 2.4, 2.4], rotationY: 0.5 },
        { prop: { kind: 'barrel' }, position: [-5, 0, 9], size: [1.5, 3, 1.5] },
        { prop: { kind: 'barrel' }, position: [5, 0, 9], size: [1.5, 3, 1.5] },
        { prop: { kind: 'pipe' }, position: [-8, 0, -6], size: [1.2, 8, 1.2] },
      ],
    },
  ],
  doors: [
    {
      id: 'spc-door-1',
      doorway: 'A-B',
      from: 'reactor-deck',
      to: 'cryo-lab',
      name: 'Bulkhead East',
      gate: { type: 'anchors', allOf: ['spc-reactor'] },
      lockedCopy:
        'VESTA reports: "Bulkhead sealed. I cannot open doors on emergency power — the reactor must come online first."',
      transitionCopy: 'The bulkhead cycles with a hiss of equalizing pressure…',
    },
    {
      id: 'spc-door-2',
      doorway: 'B-C',
      from: 'cryo-lab',
      to: 'docking-bay',
      name: 'Cryo Bulkhead North',
      gate: { type: 'anchors', allOf: ['spc-telemetry', 'spc-cryo'] },
      lockedCopy:
        'VESTA reports: "This deck is not secure. Every system in the Cryo Lab must report green before I unseal the bay."',
      transitionCopy: 'Frost cracks off the seals as the bulkhead grinds open…',
    },
    {
      id: 'spc-exit',
      doorway: 'EXIT-C',
      from: 'docking-bay',
      to: 'ESCAPE',
      name: 'Docking Bay Doors',
      gate: { type: 'allRequired' },
      lockedCopy:
        'VESTA reports: "Bay doors locked. Not every subsystem is green. I will not lose another crew to haste."',
      transitionCopy: 'The bay doors part — starlight floods the deck as your shuttle detaches…',
    },
  ],
};
