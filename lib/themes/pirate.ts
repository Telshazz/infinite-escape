import type { Theme } from '../types';

// ---------------------------------------------------------------------------
// PIRATE ADVENTURE — a LINEAR run up through a captured galleon:
//   Cargo Hold (A) → Powder Magazine (B) → Quarterdeck (C)
//
// Mechanic assignments (one engine per anchor, §2.5):
//   pir-chart    arrange   — reassemble the torn sea-chart on the chart table
//   pir-rigging  sequence  — belay the rigging knots in working order (parallel)
//   pir-compass  dial      — box the compass to the captain's buried bearing
//   pir-fuse     connect   — wire the powder fuses to their charges; the color
//                            legend is painted on a crate down in the CARGO
//                            HOLD (cross-room, hard+)
//   pir-riddle   riddle    — the captain's parting riddle at the wheel
// ---------------------------------------------------------------------------

export const pirate: Theme = {
  id: 'pirate',
  name: 'Pirate Adventure',
  tagline: 'A becalmed galleon, a locked powder store, and one bearing to freedom.',
  gmIntro:
    'Welcome aboard, you salty dogs. The old captain left this ship to whoever could read her secrets. Work her decks stem to stern — the wheel only turns for a crew that has earned it.',
  samplePuzzleType: 'Chart assembly · compass bearing · fuse routing',
  structure: 'linear',
  palette: {
    fog: '#2a1c0e',
    floor: '#3a2a16',
    wall: '#4a3319',
    primary: '#8a5a24',
    secondary: '#e0a035',
    accent: '#c23b22',
    keyLight: '#ffb347',
    fillLight: '#8a5a24',
  },
  twins: {
    fan: 'Sea-Wind Bellows',
    mister: 'Sea-Spray Vent',
    ledStrip: 'Lantern Line',
    speaker: "Captain's Voice Source",
    crate: 'Cargo Crate',
    barrel: 'Powder Keg',
    door: 'Battened Hatch',
  },
  ambientAudio: '/audio/pirate-ambient.mp3',
  rooms: [
    {
      id: 'cargo-hold',
      chamber: 'A',
      name: 'The Cargo Hold',
      flavor:
        'Crates creak in the bilge-dark. A long chart table sits under a swinging lantern, its map torn to pieces and scattered.',
      priority: 1,
      anchors: [
        {
          id: 'pir-chart',
          roomId: 'cargo-hold',
          name: 'The Chart Table',
          role: 'core',
          mechanic: 'arrange',
          prop: { kind: 'table' },
          position: [0.5, 0, -1],
          size: [4.5, 3, 3],
          facing: [0, 0, -1],
          objective: 'Rebuild the torn sea-chart by laying its fragments bow to stern.',
          clueEasy:
            'The chart reads west to east, as the ship sailed: Home Port, then the Reef, then Skull Isle, then the open Trade Lane.',
          clueHard:
            'A note pinned to the table: "Read her as we ran her — from the harbor we fled, to the water we vanished into."',
          config: {
            kind: 'arrange',
            slots: [
              { id: 's1', label: 'Western Edge' },
              { id: 's2', label: 'Left of Center' },
              { id: 's3', label: 'Right of Center' },
              { id: 's4', label: 'Eastern Edge' },
            ],
            items: [
              { id: 'port', label: 'Home Port', glyph: 'anchor' },
              { id: 'reef', label: 'The Reef', glyph: 'wave' },
              { id: 'skull', label: 'Skull Isle', glyph: 'skull' },
              { id: 'lane', label: 'Trade Lane', glyph: 'map' },
              { id: 'kraken', label: 'Kraken Waters', glyph: 'spiral', decoy: true },
            ],
            solution: { s1: 'port', s2: 'reef', s3: 'skull', s4: 'lane' },
            submitLabel: 'Lay the Chart',
          },
          hints: {
            clear: [
              'Home Port → The Reef → Skull Isle → Trade Lane, left to right.',
              'The Kraken Waters fragment belongs to no honest chart. Set it aside.',
            ],
            moderate: [
              'The ship fled the harbor first and reached open water last.',
              'One fragment is a forgery meant to run you aground.',
            ],
            subtle: [
              'Charts are read the way a ship is sailed.',
              'Count the pieces that are true — only four fit the table.',
            ],
          },
          solvedCopy:
            'The chart lies whole. A bearing is inked faintly across it — the magazine hatch clunks and gives.',
          solvedEffects: ['lighting'],
        },
        {
          id: 'pir-rigging',
          roomId: 'cargo-hold',
          name: 'The Rigging Cleat',
          role: 'parallel',
          mechanic: 'sequence',
          prop: { kind: 'pipe' },
          position: [7.5, 0, 6],
          size: [1.8, 7, 1.8],
          facing: [-1, 0, 0],
          objective: 'Belay the rigging by tying the knots in a bosun’s working order.',
          clueEasy:
            'A rigging card hangs on the cleat: first the Anchor Bend, then the Bowline, then the Clove Hitch, then the Cleat Knot to finish.',
          clueHard:
            'The bosun’s card, faded: "Bend her to the anchor, loop the standing part, hitch her fast, then cleat her off."',
          config: {
            kind: 'sequence',
            options: [
              { id: 'anchor', label: 'Anchor Bend', glyph: 'anchor' },
              { id: 'bowline', label: 'Bowline', glyph: 'knot' },
              { id: 'clove', label: 'Clove Hitch', glyph: 'knot' },
              { id: 'cleat', label: 'Cleat Knot', glyph: 'knot' },
              { id: 'noose', label: 'Slip Noose', glyph: 'knot', decoy: true },
              { id: 'tangle', label: 'Fouled Line', glyph: 'spiral', decoy: true },
            ],
            solution: ['anchor', 'bowline', 'clove', 'cleat'],
          },
          hints: {
            clear: [
              'Anchor Bend → Bowline → Clove Hitch → Cleat Knot.',
              'The Slip Noose and the Fouled Line are no working knots — ignore them.',
            ],
            moderate: [
              'Begin at the anchor, finish at the cleat.',
              'A noose and a tangle never held a sail — two choices are traps.',
            ],
            subtle: [
              'A bosun works from the anchor outward.',
              'Not every knot on the card is a knot worth tying.',
            ],
          },
          solvedCopy: 'The lines snap taut overhead. Somewhere a sail fills with imagined wind.',
          solvedEffects: ['wind'],
        },
      ],
      clueProps: [
        {
          id: 'pir-fuse-legend',
          roomId: 'cargo-hold',
          name: 'Powder-Master’s Crate',
          forAnchor: 'pir-fuse',
          text:
            'Stenciled on the crate lid in the powder-master’s hand: "RED cord to the BOW gun. BLUE cord to the MAIN mast charge. GREEN cord to the STERN gun. Mind the colors or mind the blast."',
          prop: { kind: 'crate' },
          position: [-7.5, 0.6, 4],
          size: [2, 1.6, 2],
          rotationY: 0.3,
        },
      ],
      setPieces: [
        { prop: { kind: 'barrel' }, position: [7, 0, -7], size: [1.6, 2.2, 1.6] },
        { prop: { kind: 'crate' }, position: [-7, 0, 7.5], size: [2, 2, 2], rotationY: -0.2 },
        { prop: { kind: 'crate' }, position: [4.5, 0, 8], size: [2, 2, 2], rotationY: 0.4 },
        { prop: { kind: 'barrel' }, position: [-6.5, 0, -6.5], size: [1.6, 2.2, 1.6] },
      ],
    },
    {
      id: 'powder-magazine',
      chamber: 'B',
      name: 'The Powder Magazine',
      flavor:
        'Kegs stacked to the beams, the air sharp with saltpeter. A brass binnacle bolts to one wall; a rack of colored fuses waits on another.',
      priority: 3,
      pruneCollapseTo: 'quarterdeck',
      anchors: [
        {
          id: 'pir-compass',
          roomId: 'powder-magazine',
          name: 'The Binnacle Compass',
          role: 'core',
          mechanic: 'dial',
          prop: { kind: 'cabinet' },
          position: [7, 0, -2],
          size: [1.6, 6.5, 4],
          facing: [-1, 0, 0],
          objective: 'Box the compass to the three-leg bearing from the captain’s buried cache.',
          clueEasy:
            'The captain’s log lies open: "Three legs to the gold — northeast, then south, then west." Set NE · S · W.',
          clueHard:
            'The log, water-stained: "From the cove I walked toward the sunrise-and-north, then straight to the noon-shadow, then into the sunset."',
          config: {
            kind: 'dial',
            wheels: [
              ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
              ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
              ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
            ],
            code: ['NE', 'S', 'W'],
            wheelLabels: ['First Leg', 'Second Leg', 'Third Leg'],
            submitLabel: 'Set the Bearing',
          },
          hints: {
            clear: [
              'The bearing is NE · S · W.',
              'Sunrise-and-north is northeast; noon-shadow is south; sunset is west.',
            ],
            moderate: [
              'Three legs, three points of the rose.',
              'Translate the captain’s poetry: where does the sun rise, sit, and set?',
            ],
            subtle: [
              'The log describes the sky, not the compass.',
              'Read the three legs in the order he walked them.',
            ],
          },
          solvedCopy:
            'The compass card locks with a brass click. A hidden drawer slides open in the binnacle’s base.',
          solvedEffects: ['lighting', 'audio'],
        },
        {
          id: 'pir-fuse',
          roomId: 'powder-magazine',
          name: 'The Fuse Board',
          role: 'extra',
          crossRoom: true,
          mechanic: 'connect',
          prop: { kind: 'panel' },
          position: [-3, 3.6, -9.6],
          size: [5, 4.5, 0.5],
          facing: [0, 0, 1],
          objective:
            'Run each colored fuse to its proper charge. The color legend is stenciled on a crate down in the cargo hold.',
          clueEasy:
            'The powder-master’s crate below reads: Red→Bow, Blue→Main, Green→Stern. Wire the cords to match.',
          clueHard:
            'The board is bare of labels. Only the powder-master knew which cord fed which gun — and he wrote it on a crate elsewhere.',
          config: {
            kind: 'connect',
            left: [
              { id: 'red', label: 'Red Cord', glyph: 'fuse' },
              { id: 'blue', label: 'Blue Cord', glyph: 'fuse' },
              { id: 'green', label: 'Green Cord', glyph: 'fuse' },
            ],
            right: [
              { id: 'bow', label: 'Bow Gun', glyph: 'flame' },
              { id: 'main', label: 'Main Charge', glyph: 'flame' },
              { id: 'stern', label: 'Stern Gun', glyph: 'flame' },
            ],
            pairs: { red: 'bow', blue: 'main', green: 'stern' },
            leftTitle: 'Fuses',
            rightTitle: 'Charges',
          },
          hints: {
            clear: [
              'Red→Bow, Blue→Main, Green→Stern. The cargo-hold crate says so.',
              'Walk back down to the hold and read the powder-master’s crate lid.',
            ],
            moderate: [
              'The legend is not in this room. You have already walked past it.',
              'Colors matter more than position — match the stencil exactly.',
            ],
            subtle: [
              'A powder-master never labels his board where a boarding party could read it.',
              'The answer is painted on wood, one deck below.',
            ],
          },
          solvedCopy:
            'The fuses seat with a hiss of dry cord. The magazine hatch to the upper deck falls open.',
          solvedEffects: ['lighting', 'vibration'],
        },
      ],
      setPieces: [
        { prop: { kind: 'barrel' }, position: [6, 0, 7], size: [1.6, 2.2, 1.6] },
        { prop: { kind: 'barrel' }, position: [4.5, 0, 8], size: [1.6, 2.2, 1.6] },
        { prop: { kind: 'shelf' }, position: [-5, 0, 9.2], size: [4, 6, 1], rotationY: Math.PI },
        { prop: { kind: 'crate' }, position: [-6, 0, -7], size: [2, 2, 2], rotationY: 0.3 },
      ],
    },
    {
      id: 'quarterdeck',
      chamber: 'C',
      name: 'The Quarterdeck',
      flavor:
        'Open sky at last. The ship’s wheel stands dead ahead, and a carved captain’s figurehead leans from the rail, mouth half-open as if mid-sentence.',
      priority: 2,
      anchors: [
        {
          id: 'pir-riddle',
          roomId: 'quarterdeck',
          name: 'The Captain’s Riddle',
          role: 'core',
          mechanic: 'riddle',
          prop: { kind: 'statue' },
          position: [-7, 0, 2],
          size: [2.4, 7, 2.4],
          facing: [1, 0, 0],
          objective: 'The figurehead speaks the captain’s last riddle. Answer it to take the wheel.',
          clueEasy:
            '"I have cities but no houses, forests but no trees, and water but no fish. What am I?" (You laid one flat in the hold.)',
          clueHard:
            '"I have cities but no houses, forests but no trees, and water but no fish. What am I?"',
          config: {
            kind: 'riddle',
            prompt:
              'I have cities but no houses, forests but no trees, and water but no fish. What am I?',
            answers: ['a map', 'map', 'the map', 'a chart', 'chart'],
            choices: ['A Map', 'A Compass', 'The Horizon', 'A Spyglass'],
            placeholder: 'Answer the captain…',
          },
          hints: {
            clear: [
              'The answer is a map.',
              'You rebuilt one on the chart table in the cargo hold.',
            ],
            moderate: [
              'It shows the world but holds none of it.',
              'Cities, forests, water — all drawn, none real.',
            ],
            subtle: [
              'Think of the thing that has everything and nothing at once.',
              'A sailor could not sail without it.',
            ],
          },
          solvedCopy:
            'The figurehead falls silent, satisfied. The wheel turns free under your hands.',
          solvedEffects: ['audio', 'wind'],
        },
      ],
      setPieces: [
        { prop: { kind: 'statue' }, position: [8, 0, 4], size: [2.4, 7, 2.4], rotationY: -0.4 },
        { prop: { kind: 'barrel' }, position: [-8, 0, -6], size: [1.6, 2.2, 1.6] },
        { prop: { kind: 'barrel' }, position: [8, 0, -6], size: [1.6, 2.2, 1.6] },
        { prop: { kind: 'crate' }, position: [-8, 0, 8], size: [2, 2, 2], rotationY: 0.5 },
        { prop: { kind: 'crate' }, position: [8, 0, 9], size: [2, 2, 2], rotationY: -0.3 },
      ],
    },
  ],
  doors: [
    {
      id: 'pir-door-1',
      doorway: 'A-B',
      from: 'cargo-hold',
      to: 'powder-magazine',
      name: 'The Magazine Hatch',
      gate: { type: 'anchors', allOf: ['pir-chart'] },
      lockedCopy: 'The hatch is battened tight. The chart must be made whole before it gives.',
      transitionCopy: 'The hatch swings back — the reek of powder rolls up to meet you…',
    },
    {
      id: 'pir-door-2',
      doorway: 'B-C',
      from: 'powder-magazine',
      to: 'quarterdeck',
      name: 'The Companion Ladder',
      gate: { type: 'anchors', allOf: ['pir-compass', 'pir-fuse'] },
      lockedCopy: 'The ladder hatch holds fast. Every mechanism in the magazine must be set right.',
      transitionCopy: 'The hatch lifts — daylight and salt air pour down the ladder…',
    },
    {
      id: 'pir-exit',
      doorway: 'EXIT-C',
      from: 'quarterdeck',
      to: 'ESCAPE',
      name: 'The Ship’s Wheel',
      gate: { type: 'allRequired' },
      lockedCopy: 'The wheel is lashed until every deck of the ship is squared away. Something is still adrift.',
      transitionCopy: 'The wheel spins hard over — the galleon comes about toward open sea…',
    },
  ],
};
