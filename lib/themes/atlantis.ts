import type { Theme } from '../types';

// ---------------------------------------------------------------------------
// THE LOST CITY OF ATLANTIS — the vertical-slice theme. LINEAR chain:
//   Altar Chamber (A) → Archive Vault (B) → Portal Hall (C)
//
// Mechanic assignments (one engine per anchor, §2.5):
//   atl-altar      sequence  — the sacred symbol order
//   atl-reliquary  arrange   — offering shells on the tide shrine (parallel)
//   atl-archive    dial      — the 7·4·2 cipher
//   atl-conduits   connect   — reroute energy conduits; legend is etched in
//                              the ALTAR CHAMBER mural (cross-room, hard+)
//   atl-lens       arrange   — focus the portal lens array
//   atl-leviathan  riddle    — the Leviathan's question (extra, hard+)
// ---------------------------------------------------------------------------

export const atlantis: Theme = {
  id: 'atlantis',
  name: 'The Lost City of Atlantis',
  tagline: 'A drowned temple wakes for the first explorers in 3,000 years.',
  gmIntro:
    'Welcome, explorers. The temple has awakened. Restore the energy seals chamber by chamber — the portal only answers when every seal burns.',
  samplePuzzleType: 'Symbol sequence · numeric cipher · conduit routing',
  structure: 'linear',
  palette: {
    fog: '#06283a',
    floor: '#0a2f42',
    wall: '#0d3a52',
    primary: '#1f8f85',
    secondary: '#35e0ce',
    accent: '#d9a441',
    keyLight: '#35e0ce',
    fillLight: '#0e7c74',
  },
  twins: {
    fan: 'Ocean-Current Emitter',
    mister: 'Thermal Vent',
    ledStrip: 'Energy Channel',
    speaker: 'Leviathan Voice Source',
    crate: 'Ceremonial Offering Chest',
    door: 'Sealed Passage',
  },
  ambientAudio: '/audio/atlantis-ambient.mp3',
  rooms: [
    {
      id: 'altar-chamber',
      chamber: 'A',
      name: 'The Altar Chamber',
      flavor:
        'Water hums behind the walls. The navigation altar waits at the center, its sockets dark.',
      priority: 1,
      anchors: [
        {
          id: 'atl-altar',
          roomId: 'altar-chamber',
          name: 'Atlantean Navigation Altar',
          role: 'core',
          mechanic: 'sequence',
          prop: { kind: 'altar' },
          position: [0, 0, 0.5],
          size: [4.5, 3, 3],
          facing: [0, 0, -1],
          objective: 'Restore the first energy seal by entering the sacred sequence.',
          clueEasy:
            'The inscription reads plainly: first the weapon of the deep, then the rising tide, then the shell that remembers, then the light that guides.',
          clueHard:
            'A weathered inscription: "What Poseidon wields precedes what the moon commands. Memory coils before light leads home."',
          config: {
            kind: 'sequence',
            options: [
              { id: 'trident', label: 'Trident', glyph: 'trident' },
              { id: 'wave', label: 'Wave', glyph: 'wave' },
              { id: 'spiral', label: 'Nautilus', glyph: 'spiral' },
              { id: 'star', label: 'Guiding Star', glyph: 'star' },
              { id: 'eye', label: 'Watcher', glyph: 'eye', decoy: true },
              { id: 'column', label: 'Pillar', glyph: 'column', decoy: true },
            ],
            solution: ['trident', 'wave', 'spiral', 'star'],
          },
          hints: {
            clear: [
              'Select in this exact order: Trident → Wave → Nautilus → Guiding Star.',
              'Start with the Trident. End with the Guiding Star.',
            ],
            moderate: [
              'Poseidon acts first. The star always comes last.',
              'The Watcher and the Pillar play no part in the sequence.',
            ],
            subtle: [
              'Weapons precede water. Memory precedes light.',
              'Not every symbol offered belongs to the sequence.',
            ],
          },
          solvedCopy:
            'The first seal ignites. Water hums through the energy channels. The passage east is listening now.',
          solvedEffects: ['lighting'],
        },
        {
          id: 'atl-reliquary',
          roomId: 'altar-chamber',
          name: 'Tidal Reliquary',
          role: 'parallel',
          mechanic: 'arrange',
          prop: { kind: 'pedestal' },
          position: [8.2, 0, -5],
          size: [1.8, 3.4, 1.8],
          facing: [-1, 0, 0],
          objective:
            'Place the offerings on the reliquary in the order the tide would claim them.',
          clueEasy:
            'The shelf is carved: "Lightest gift floats first, heaviest gift drowns last." Shell, then pearl, then coral, then stone.',
          clueHard:
            'A carving of a sinking column: what floats is honored first; what sinks is honored last.',
          config: {
            kind: 'arrange',
            slots: [
              { id: 's1', label: 'First Tide' },
              { id: 's2', label: 'Second Tide' },
              { id: 's3', label: 'Third Tide' },
              { id: 's4', label: 'Last Tide' },
            ],
            items: [
              { id: 'shell', label: 'Shell', glyph: 'spiral' },
              { id: 'pearl', label: 'Pearl', glyph: 'pearl' },
              { id: 'coral', label: 'Coral', glyph: 'coral' },
              { id: 'stone', label: 'Stone', glyph: 'column' },
              { id: 'kelp', label: 'Kelp', glyph: 'plant', decoy: true },
            ],
            solution: { s1: 'shell', s2: 'pearl', s3: 'coral', s4: 'stone' },
            submitLabel: 'Offer to the Tide',
          },
          hints: {
            clear: [
              'Shell → Pearl → Coral → Stone. The kelp is not an offering.',
              'Order by weight, lightest first.',
            ],
            moderate: [
              'Would kelp survive a tide? Only four gifts are true offerings.',
              'The tide takes the light things first.',
            ],
            subtle: [
              'The carving speaks of floating and drowning.',
              'Weigh each gift in your mind.',
            ],
          },
          solvedCopy: 'The reliquary accepts the offerings. A side current stirs.',
          solvedEffects: ['mist'],
        },
      ],
      clueProps: [
        {
          id: 'atl-mural',
          roomId: 'altar-chamber',
          name: 'Conduit Mural',
          forAnchor: 'atl-conduits',
          text:
            'The mural maps the temple’s veins: "The TRIDENT drinks from the DEEP. The NAUTILUS drinks from the REEF. The STAR drinks from the SKY-WELL." Someone routed power by this legend once.',
          prop: { kind: 'panel' },
          position: [-9.6, 4.5, 3],
          size: [0.4, 5, 6],
          rotationY: 0,
        },
      ],
      setPieces: [
        { prop: { kind: 'crate' }, position: [-7, 0, -7], size: [2, 2, 2], rotationY: 0.3 },
        { prop: { kind: 'crate' }, position: [7.2, 0, 6.2], size: [2, 2, 2], rotationY: -0.2 },
        { prop: { kind: 'statue' }, position: [-7.5, 0, 7.5], size: [2, 6.5, 2], rotationY: 0.6 },
        { prop: { kind: 'brazier' }, position: [4.5, 0, -7.5], size: [1.4, 3, 1.4] },
      ],
    },
    {
      id: 'archive-vault',
      chamber: 'B',
      name: 'The Archive Vault',
      flavor:
        'Shelves of relics climb the walls. The archive lock glows faintly — three wheels, three numbers the city never forgot.',
      priority: 3,
      pruneCollapseTo: 'portal-hall',
      anchors: [
        {
          id: 'atl-archive',
          roomId: 'archive-vault',
          name: 'Relic Archive Lock',
          role: 'core',
          mechanic: 'dial',
          prop: { kind: 'cabinet' },
          position: [-7.2, 0, -4],
          size: [1.6, 6.5, 4],
          facing: [1, 0, 0],
          objective: 'Recover the second seal by unlocking the archive cipher.',
          clueEasy:
            'Etched inside the archive door: "Seven tides. Four pillars. Two moons." Enter 7 · 4 · 2.',
          clueHard:
            'A mural shows the tides that struck the city (VII), the pillars still standing (IV), and the moons above the gate (II).',
          config: {
            kind: 'dial',
            wheels: [
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            ],
            code: ['7', '4', '2'],
            wheelLabels: ['Tides', 'Pillars', 'Moons'],
            submitLabel: 'Unlock Archive',
          },
          hints: {
            clear: [
              'The code is 7 · 4 · 2 — tides, pillars, moons.',
              'Count downward: tides, then pillars, then moons.',
            ],
            moderate: [
              'Roman numerals hide in the mural: VII, IV, II.',
              'Three numbers, strictly decreasing.',
            ],
            subtle: [
              'The city counted everything in what it lost.',
              'Read the mural top to bottom, largest to smallest.',
            ],
          },
          solvedCopy:
            'The archive yields its relic. The second seal is restored — the gate beyond is listening now.',
          solvedEffects: ['mist', 'lighting'],
        },
        {
          id: 'atl-conduits',
          roomId: 'archive-vault',
          name: 'Energy Conduit Junction',
          role: 'extra',
          crossRoom: true,
          mechanic: 'connect',
          prop: { kind: 'panel' },
          position: [7.6, 3.6, 3],
          size: [0.5, 4.5, 5],
          facing: [-1, 0, 0],
          objective:
            'Reroute the temple’s energy conduits. The routing legend is written somewhere you have already been.',
          clueEasy:
            'The mural back in the Altar Chamber holds the legend: Trident←Deep, Nautilus←Reef, Star←Sky-Well.',
          clueHard:
            'The junction is unlabeled. The temple recorded its veins on a wall in another chamber.',
          config: {
            kind: 'connect',
            left: [
              { id: 'deep', label: 'The Deep', glyph: 'wave' },
              { id: 'reef', label: 'The Reef', glyph: 'coral' },
              { id: 'skywell', label: 'The Sky-Well', glyph: 'star' },
            ],
            right: [
              { id: 'trident', label: 'Trident Seal', glyph: 'trident' },
              { id: 'nautilus', label: 'Nautilus Seal', glyph: 'spiral' },
              { id: 'starseal', label: 'Star Seal', glyph: 'star' },
            ],
            pairs: { deep: 'trident', reef: 'nautilus', skywell: 'starseal' },
            leftTitle: 'Sources',
            rightTitle: 'Seals',
          },
          hints: {
            clear: [
              'Deep→Trident, Reef→Nautilus, Sky-Well→Star. The mural in the Altar Chamber says so.',
            ],
            moderate: ['Walk back to the Altar Chamber. Read the west mural.'],
            subtle: ['The temple never labels anything twice.'],
          },
          solvedCopy:
            'Power floods the junction. Somewhere, an old machine remembers its purpose.',
          solvedEffects: ['lighting', 'vibration'],
        },
      ],
      setPieces: [
        { prop: { kind: 'shelf' }, position: [4, 0, -8.8], size: [6, 7, 1.2] },
        { prop: { kind: 'shelf' }, position: [-4, 0, 8.8], size: [6, 7, 1.2], rotationY: Math.PI },
        { prop: { kind: 'crate' }, position: [6.5, 0, -7.5], size: [2, 2, 2], rotationY: 0.4 },
        { prop: { kind: 'brazier' }, position: [-6.5, 0, 7], size: [1.4, 3, 1.4] },
      ],
    },
    {
      id: 'portal-hall',
      chamber: 'C',
      name: 'The Portal Hall',
      flavor:
        'The gate fills the far wall — a ring of dead stone. Lenses on pedestals wait to catch light that is not yet flowing.',
      priority: 2,
      anchors: [
        {
          id: 'atl-lens',
          roomId: 'portal-hall',
          name: 'Portal Lens Array',
          role: 'core',
          mechanic: 'arrange',
          prop: { kind: 'console' },
          position: [0, 0, -1],
          size: [4, 3.2, 2.2],
          facing: [0, 0, 1],
          objective:
            'Seat each focusing lens in the mount that matches its element.',
          clueEasy:
            'The mounts are engraved: Sun takes amber, Moon takes pearl-glass, Deep takes teal, Storm takes violet.',
          clueHard:
            'Four mounts, four lenses. Each mount is engraved with a sky the city once watched.',
          config: {
            kind: 'arrange',
            slots: [
              { id: 'sun', label: 'Sun Mount' },
              { id: 'moon', label: 'Moon Mount' },
              { id: 'deep', label: 'Deep Mount' },
              { id: 'storm', label: 'Storm Mount' },
            ],
            items: [
              { id: 'amber', label: 'Amber Lens', glyph: 'sun' },
              { id: 'pearl', label: 'Pearl Lens', glyph: 'moon' },
              { id: 'teal', label: 'Teal Lens', glyph: 'wave' },
              { id: 'violet', label: 'Violet Lens', glyph: 'bolt' },
              { id: 'cracked', label: 'Cracked Lens', glyph: 'eye', decoy: true },
            ],
            solution: { sun: 'amber', moon: 'pearl', deep: 'teal', storm: 'violet' },
            submitLabel: 'Focus the Array',
          },
          hints: {
            clear: [
              'Sun→Amber, Moon→Pearl, Deep→Teal, Storm→Violet. Leave the cracked lens out.',
              'Match each lens color to its sky.',
            ],
            moderate: [
              'A cracked lens focuses nothing.',
              'Amber is the color of daylight through water.',
            ],
            subtle: [
              'The mounts are engraved. Look closely.',
              'One lens is a trap for hurried hands.',
            ],
          },
          solvedCopy: 'The lenses align. Light begins to pool at the gate’s rim.',
          solvedEffects: ['lighting', 'wind'],
        },
        {
          id: 'atl-leviathan',
          roomId: 'portal-hall',
          name: 'The Leviathan’s Question',
          role: 'extra',
          mechanic: 'riddle',
          prop: { kind: 'statue' },
          position: [-8, 0, 5],
          size: [2.4, 7, 2.4],
          facing: [1, 0, 0],
          objective:
            'The Leviathan statue speaks one question. Answer it truly.',
          clueEasy:
            '"I rise without wings, I fall without breaking, I rule the shore twice a day. What am I?" (It moves the whole ocean.)',
          clueHard:
            '"I rise without wings, I fall without breaking, I rule the shore twice a day. What am I?"',
          config: {
            kind: 'riddle',
            prompt:
              'I rise without wings. I fall without breaking. I rule the shore twice a day. What am I?',
            answers: ['tide', 'the tide', 'tides'],
            choices: ['The Wind', 'The Tide', 'The Moon', 'A Wave'],
            placeholder: 'Speak your answer…',
          },
          hints: {
            clear: ['The answer is the tide.'],
            moderate: ['It obeys the moon, but it is not the moon.'],
            subtle: ['Twice a day, every day, since before the city drowned.'],
          },
          solvedCopy: 'The Leviathan closes its stone eyes, satisfied.',
          solvedEffects: ['audio'],
        },
      ],
      setPieces: [
        { prop: { kind: 'statue' }, position: [8, 0, 5], size: [2.4, 7, 2.4], rotationY: -0.4 },
        { prop: { kind: 'pedestal' }, position: [-5, 0, 9], size: [1.5, 3.2, 1.5] },
        { prop: { kind: 'pedestal' }, position: [5, 0, 9], size: [1.5, 3.2, 1.5] },
        { prop: { kind: 'brazier' }, position: [-8, 0, -6], size: [1.4, 3, 1.4] },
        { prop: { kind: 'brazier' }, position: [8, 0, -6], size: [1.4, 3, 1.4] },
      ],
    },
  ],
  doors: [
    {
      id: 'atl-door-1',
      doorway: 'A-B',
      from: 'altar-chamber',
      to: 'archive-vault',
      name: 'Sealed Passage East',
      gate: { type: 'anchors', allOf: ['atl-altar'] },
      lockedCopy:
        'The passage does not answer. The Navigation Altar must burn first.',
      transitionCopy: 'The passage grinds open — water reroutes through the walls…',
    },
    {
      id: 'atl-door-2',
      doorway: 'B-C',
      from: 'archive-vault',
      to: 'portal-hall',
      name: 'Vault Gate North',
      gate: { type: 'anchors', allOf: ['atl-archive', 'atl-conduits'] },
      lockedCopy:
        'The vault gate holds. Every mechanism in this chamber must be satisfied.',
      transitionCopy: 'The vault gate rises — the Portal Hall breathes ahead…',
    },
    {
      id: 'atl-exit',
      doorway: 'EXIT-C',
      from: 'portal-hall',
      to: 'ESCAPE',
      name: 'The Portal Gate',
      gate: { type: 'allRequired' },
      lockedCopy:
        'The gate is deaf until every seal in the temple sings. Something remains undone.',
      transitionCopy: 'The portal stabilizes — reality folds open…',
    },
  ],
};
