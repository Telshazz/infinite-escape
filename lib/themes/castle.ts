import type { Theme } from '../types';

// ---------------------------------------------------------------------------
// MEDIEVAL CASTLE — a locked keep on coronation eve. LINEAR chain:
//   Great Hall (A) → Reliquary (B) → Vault Gate Hall (C)
//
// Mechanic assignments (one engine per anchor, §2.5):
//   cas-heraldry   arrange   — hang each crest beneath its noble house
//   cas-drill      sequence  — the squire's morning drill (parallel)
//   cas-sigil      dial      — the reliquary sigil lock (crown · rose · key)
//   cas-bellropes  connect   — tie each bell rope to its true bell; the tone
//                              legend is woven into the GREAT HALL tapestry
//                              (cross-room, hard+)
//   cas-crown      riddle    — the Gatekeeper's riddle before the Great Gate
// ---------------------------------------------------------------------------

export const castle: Theme = {
  id: 'castle',
  name: 'Medieval Castle',
  tagline: 'The keep sealed itself the night the old king died. Tonight, it tests who may leave.',
  gmIntro:
    'Hear me, honored guests. The castle was sworn to open its Great Gate only for those who know its houses, its relics, and its riddles. Prove yourselves hall by hall — the Gate answers to no key, only to worth.',
  samplePuzzleType: 'Heraldry matching · sigil cipher · bell-rope routing',
  structure: 'linear',
  palette: {
    fog: '#1c1610',
    floor: '#262019',
    wall: '#332a20',
    primary: '#6b5638',
    secondary: '#d9a441',
    accent: '#8f2f2f',
    keyLight: '#ffcf7a',
    fillLight: '#6b5638',
  },
  twins: {
    fan: 'Arrow-Slit Draft',
    mister: 'Cold Hearth Smoke',
    ledStrip: 'Torch Ember Channel',
    speaker: 'Herald Voice Gallery',
    crate: 'Provision Chest',
    door: 'Iron-Banded Door',
  },
  ambientAudio: '/audio/castle-ambient.mp3',
  rooms: [
    {
      id: 'great-hall',
      chamber: 'A',
      name: 'The Great Hall',
      flavor:
        'Cold torchlight gutters over a bare feast table. Above the dais, four noble houses wait for their crests — and the hall remembers which banner belongs to whom.',
      priority: 1,
      anchors: [
        {
          id: 'cas-heraldry',
          roomId: 'great-hall',
          name: 'Wall of Banners',
          role: 'core',
          mechanic: 'arrange',
          prop: { kind: 'panel' },
          position: [4, 4, 9.6],
          size: [6, 5, 0.4],
          facing: [0, 0, -1],
          objective: 'Hang each crest beneath the noble house that bears it.',
          clueEasy:
            'The herald’s ledger is carved below: "ALDRIC wears the CROWN. MERROW wears the ROSE. THORNE wears the FLAME. VALE wears the SHIELD." The skull crest belongs to a house long stricken from the rolls.',
          clueHard:
            'A carved verse: "The first house rules, the second house loves, the third house burns, the fourth house guards. One crest here belongs to a house the castle has forgotten."',
          config: {
            kind: 'arrange',
            slots: [
              { id: 'aldric', label: 'House Aldric' },
              { id: 'merrow', label: 'House Merrow' },
              { id: 'thorne', label: 'House Thorne' },
              { id: 'vale', label: 'House Vale' },
            ],
            items: [
              { id: 'crowncrest', label: 'Crown Crest', glyph: 'crown' },
              { id: 'rosecrest', label: 'Rose Crest', glyph: 'rose' },
              { id: 'flamecrest', label: 'Flame Crest', glyph: 'flame' },
              { id: 'shieldcrest', label: 'Shield Crest', glyph: 'shield' },
              { id: 'skullcrest', label: 'Skull Crest', glyph: 'skull', decoy: true },
            ],
            solution: {
              aldric: 'crowncrest',
              merrow: 'rosecrest',
              thorne: 'flamecrest',
              vale: 'shieldcrest',
            },
            submitLabel: 'Raise the Banners',
          },
          hints: {
            clear: [
              'Aldric→Crown, Merrow→Rose, Thorne→Flame, Vale→Shield. The skull crest hangs nowhere.',
              'The ruling house takes the crown; the guarding house takes the shield.',
            ],
            moderate: [
              'Rules, loves, burns, guards — match each verb to a crest.',
              'A stricken house has no place on this wall.',
            ],
            subtle: [
              'Read the carved verse beneath the empty hooks.',
              'Five crests, four houses. The hall is testing you.',
            ],
          },
          solvedCopy:
            'The banners catch a wind that should not exist, and the hall exhales. The eastern door remembers its duty.',
          solvedEffects: ['lighting', 'wind'],
        },
        {
          id: 'cas-drill',
          roomId: 'great-hall',
          name: 'Squire’s Drill Post',
          role: 'parallel',
          mechanic: 'sequence',
          prop: { kind: 'pedestal' },
          position: [7.2, 0, 6.2],
          size: [1.8, 3.4, 1.8],
          facing: [-1, 0, 0],
          objective: 'Perform the squire’s morning drill in the order every knight once learned it.',
          clueEasy:
            'The drill rhyme is scratched into the post: "First honor the head that rules (crown), then the cloth that flies (banner), then the voice that calls (bell), last the arm that guards (shield)."',
          clueHard:
            'A scratched rhyme: "Honor the head, salute the cloth, answer the voice, trust the arm — a squire who forgets the order polishes boots for a year."',
          config: {
            kind: 'sequence',
            options: [
              { id: 'crown', label: 'Honor the Crown', glyph: 'crown' },
              { id: 'banner', label: 'Salute the Banner', glyph: 'banner' },
              { id: 'bell', label: 'Answer the Bell', glyph: 'bell' },
              { id: 'shield', label: 'Trust the Shield', glyph: 'shield' },
              { id: 'coin', label: 'Pocket the Coin', glyph: 'coin', decoy: true },
              { id: 'skull', label: 'Salute the Crypt', glyph: 'skull', decoy: true },
            ],
            solution: ['crown', 'banner', 'bell', 'shield'],
          },
          hints: {
            clear: [
              'The order is Crown → Banner → Bell → Shield.',
              'Begin with the Crown. End with the Shield.',
            ],
            moderate: [
              'Head, cloth, voice, arm — the rhyme names them in order.',
              'No squire ever drilled with coins or crypts.',
            ],
            subtle: [
              'What rules comes before what flies; what calls comes before what guards.',
              'Two of these gestures would earn a squire a beating.',
            ],
          },
          solvedCopy:
            'Somewhere above, an old drill-master’s ghost grunts approval. A side passage breathes easier.',
          solvedEffects: ['audio'],
        },
      ],
      clueProps: [
        {
          id: 'cas-tapestry',
          roomId: 'great-hall',
          name: 'Bellfounder’s Tapestry',
          forAnchor: 'cas-bellropes',
          text:
            'The tapestry weaves three bells above three towers: "The BRONZE bell calls the CHAPEL to prayer. The SILVER bell calls the WATCHTOWER to arms. The IRON bell calls the GREAT GATE to open." The weaver signed it with a tiny key.',
          prop: { kind: 'panel' },
          position: [-9.6, 4.5, 3],
          size: [0.4, 5, 6],
          rotationY: 0,
        },
      ],
      setPieces: [
        { prop: { kind: 'table' }, position: [-7, 0, -7], size: [3, 2.6, 2], rotationY: 0.3 },
        { prop: { kind: 'crate' }, position: [7, 0, -7], size: [2, 2, 2], rotationY: -0.2 },
        { prop: { kind: 'statue' }, position: [-7.5, 0, 7.5], size: [2, 6.5, 2], rotationY: 0.6 },
        { prop: { kind: 'brazier' }, position: [4.5, 0, -7.5], size: [1.4, 3, 1.4] },
        { prop: { kind: 'brazier', glbUrl: '/models/stock/torch_lit.glb' }, position: [4, 0, 7.5], size: [1, 4.5, 1] },
        { prop: { kind: 'pedestal', glbUrl: '/models/stock/column.glb' }, position: [-4.5, 0, -7.8], size: [1.6, 6.5, 1.6] },
      ],
    },
    {
      id: 'reliquary',
      chamber: 'B',
      name: 'The Reliquary',
      flavor:
        'Relic cases climb the walls in the candle-dark. At the far side, the sigil lock waits — three carved wheels, three glyphs the castle will not surrender to guesswork.',
      priority: 3,
      pruneCollapseTo: 'vault-gate-hall',
      anchors: [
        {
          id: 'cas-sigil',
          roomId: 'reliquary',
          name: 'Reliquary Sigil Lock',
          role: 'core',
          mechanic: 'dial',
          prop: { kind: 'cabinet' },
          position: [-7.2, 0, -4],
          size: [1.6, 6.5, 4],
          facing: [1, 0, 0],
          objective: 'Turn the three sigil wheels to the glyphs that open the reliquary.',
          clueEasy:
            'The reliquary inscription reads: "The relic sleeps beneath the KING’s brow (crown), the LADY’s flower (rose), and the WARDEN’s iron (key)." Set crown · rose · key.',
          clueHard:
            'An inscription in old script: "Three keepers guard the relic — one rules, one loves, one locks. Turn each wheel to the keeper’s own mark."',
          config: {
            kind: 'dial',
            wheels: [
              ['crown', 'shield', 'rose', 'bell', 'key', 'flame'],
              ['crown', 'shield', 'rose', 'bell', 'key', 'flame'],
              ['crown', 'shield', 'rose', 'bell', 'key', 'flame'],
            ],
            code: ['crown', 'rose', 'key'],
            wheelLabels: ['The King', 'The Lady', 'The Warden'],
            submitLabel: 'Turn the Sigils',
          },
          hints: {
            clear: [
              'Set the wheels to Crown · Rose · Key.',
              'King takes the crown, Lady takes the rose, Warden takes the key.',
            ],
            moderate: [
              'One rules, one loves, one locks — match each keeper to a glyph.',
              'The warden’s mark is the one that opens doors.',
            ],
            subtle: [
              'Every keeper in this castle signed their work with a single mark.',
              'The inscription names three people, not three objects.',
            ],
          },
          solvedCopy:
            'The sigils align and the reliquary sighs open. The relic’s light seeps under the north gate — it is listening now.',
          solvedEffects: ['lighting'],
        },
        {
          id: 'cas-bellropes',
          roomId: 'reliquary',
          name: 'Bell-Rope Frame',
          role: 'extra',
          crossRoom: true,
          mechanic: 'connect',
          prop: { kind: 'panel' },
          position: [7.6, 3.6, 3],
          size: [0.5, 4.5, 5],
          facing: [-1, 0, 0],
          objective:
            'Tie each bell rope to the bell it truly serves. The bellfounder recorded the tones somewhere you have already stood.',
          clueEasy:
            'The tapestry back in the Great Hall holds the legend: Bronze→Chapel, Silver→Watchtower, Iron→Great Gate.',
          clueHard:
            'The ropes are unmarked and the bells hang out of sight. The bellfounder wove the legend into cloth in another hall.',
          config: {
            kind: 'connect',
            left: [
              { id: 'bronze', label: 'Bronze Bell', glyph: 'bell' },
              { id: 'silver', label: 'Silver Bell', glyph: 'note' },
              { id: 'iron', label: 'Iron Bell', glyph: 'anchor' },
            ],
            right: [
              { id: 'chapel', label: 'The Chapel', glyph: 'book' },
              { id: 'watchtower', label: 'The Watchtower', glyph: 'eye' },
              { id: 'greatgate', label: 'The Great Gate', glyph: 'key' },
            ],
            pairs: { bronze: 'chapel', silver: 'watchtower', iron: 'greatgate' },
            leftTitle: 'Bells',
            rightTitle: 'Callings',
          },
          hints: {
            clear: [
              'Bronze→Chapel, Silver→Watchtower, Iron→Great Gate. The Great Hall tapestry says so.',
              'The heaviest metal calls the heaviest door.',
            ],
            moderate: [
              'Walk back to the Great Hall and read the woven bells above the towers.',
              'Prayer, arms, and opening — each bell has one calling.',
            ],
            subtle: [
              'The castle never writes anything twice.',
              'A weaver signed the answer with a tiny key.',
            ],
          },
          solvedCopy:
            'Three true tones roll through the stone, and far away something enormous unclenches.',
          solvedEffects: ['audio', 'vibration'],
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
      id: 'vault-gate-hall',
      chamber: 'C',
      name: 'The Vault Gate Hall',
      flavor:
        'The Great Gate fills the far wall, iron-banded and older than every house upstairs. Before it stands the Gatekeeper’s statue, and its stone lips are already moving.',
      priority: 2,
      anchors: [
        {
          id: 'cas-crown',
          roomId: 'vault-gate-hall',
          name: 'The Gatekeeper’s Riddle',
          role: 'core',
          mechanic: 'riddle',
          prop: { kind: 'statue' },
          position: [0, 0, -1],
          size: [2.4, 7, 2.4],
          facing: [0, 0, 1],
          objective: 'The Gatekeeper asks one riddle of all who would pass. Answer it truly.',
          clueEasy:
            '"I am tall when I am young and short when I am old, and every evening I die a little to give the hall its light. What am I?" (You have walked past dozens of them tonight.)',
          clueHard:
            '"I am tall when I am young and short when I am old, and every evening I die a little to give the hall its light. What am I?"',
          config: {
            kind: 'riddle',
            prompt:
              'I am tall when I am young and short when I am old, and every evening I die a little to give the hall its light. What am I?',
            answers: ['candle', 'a candle', 'the candle', 'candles'],
            choices: ['A Candle', 'A Shadow', 'An Hourglass', 'A King'],
            placeholder: 'Speak your answer to the Gatekeeper…',
          },
          hints: {
            clear: [
              'The answer is a candle.',
              'It burns down as the night goes on — tall at dusk, a stub by dawn.',
            ],
            moderate: [
              'It gives light by consuming itself.',
              'Its youth is measured in inches of wax.',
            ],
            subtle: [
              'The hall is full of them, dying quietly in their sconces.',
              'What grows shorter the longer it serves?',
            ],
          },
          solvedCopy:
            'The Gatekeeper’s stone eyes soften. "Wisdom enough. The Gate will weigh the rest of your deeds."',
          solvedEffects: ['audio', 'lighting'],
        },
      ],
      setPieces: [
        { prop: { kind: 'statue' }, position: [8, 0, 5], size: [2.4, 7, 2.4], rotationY: -0.4 },
        { prop: { kind: 'pedestal', glbUrl: '/models/stock/pillar.glb' }, position: [-5, 0, 9], size: [1.6, 6, 1.6] },
        { prop: { kind: 'pedestal', glbUrl: '/models/stock/pillar.glb' }, position: [5, 0, 9], size: [1.6, 6, 1.6] },
        { prop: { kind: 'brazier' }, position: [-8, 0, -6], size: [1.4, 3, 1.4] },
        { prop: { kind: 'brazier' }, position: [8, 0, -6], size: [1.4, 3, 1.4] },
      ],
    },
  ],
  doors: [
    {
      id: 'cas-door-1',
      doorway: 'A-B',
      from: 'great-hall',
      to: 'reliquary',
      name: 'Iron Door East',
      gate: { type: 'anchors', allOf: ['cas-heraldry'] },
      lockedCopy:
        'The iron door does not stir. The hall will not pass anyone while its houses hang bare.',
      transitionCopy: 'The iron door swings wide — candle smoke curls into the dark beyond…',
    },
    {
      id: 'cas-door-2',
      doorway: 'B-C',
      from: 'reliquary',
      to: 'vault-gate-hall',
      name: 'Reliquary Gate North',
      gate: { type: 'anchors', allOf: ['cas-sigil', 'cas-bellropes'] },
      lockedCopy:
        'The north gate holds fast. Every duty in the Reliquary must be discharged before it moves.',
      transitionCopy: 'The gate lifts on groaning chains — the Great Gate waits ahead…',
    },
    {
      id: 'cas-exit',
      doorway: 'EXIT-C',
      from: 'vault-gate-hall',
      to: 'ESCAPE',
      name: 'The Great Gate',
      gate: { type: 'allRequired' },
      lockedCopy:
        'The Great Gate is deaf to pleading. Somewhere in the keep, a duty remains undone.',
      transitionCopy: 'The Great Gate swings open — cold night air and freedom pour in…',
    },
  ],
};
