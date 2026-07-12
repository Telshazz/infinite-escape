import type { Theme } from '../types';

// ---------------------------------------------------------------------------
// ALICE IN WONDERLAND — the NON-LINEAR showcase. A HUB-AND-SPOKE shape:
//
//              Curiouser Cupboard (B, leaf)
//                        │  A-B
//   Tea Garden (A, HUB + START + FINALE) ── the Little Door (EXIT-A)
//                        │  A-C
//               Croquet Court (C, leaf)
//
// The Tea Garden is the start AND holds the finale — its Little Door only
// opens when EVERYTHING is done. Both spokes unlock together once the tea
// ceremony is solved, and may be visited in ANY order.
//
// Mechanic assignments (one engine per anchor, §2.5):
//   wl-tea      sequence  — the Mad Tea ceremony, in ritual order (hub)
//   wl-bottle   arrange   — order the size-shifting treats smallest→tallest
//   wl-mirror   riddle    — a looking-glass riddle written in reflected script;
//                           its readable twin hangs in the CROQUET COURT
//                           (cross-room, hard+)
//   wl-croquet  connect   — send each hedgehog through its royal arch
//   wl-rose     dial       — mix three coats of the Queen’s red (parallel)
// ---------------------------------------------------------------------------

export const wonderland: Theme = {
  id: 'wonderland',
  name: 'Alice in Wonderland',
  tagline: 'A garden with too many doors, a Queen with too little patience.',
  gmIntro:
    'Curiouser and curiouser! You’ve tumbled into the Tea Garden, and nothing here obeys the ordinary rules. Solve the party’s riddle and both little paths will open — wander them in whatever order pleases you. Only the Little Door leads home, and it is a stickler for finished business.',
  samplePuzzleType: 'Ritual sequence · size-sorting · looking-glass riddle',
  structure: 'nonlinear',
  palette: {
    fog: '#241033',
    floor: '#2e1542',
    wall: '#3a1b52',
    primary: '#7a3fa0',
    secondary: '#e05ad0',
    accent: '#ffd23f',
    keyLight: '#e05ad0',
    fillLight: '#5a2f7a',
  },
  twins: {
    fan: 'Whispering Breeze',
    mister: 'Garden Mist',
    ledStrip: 'Fairy-Light Vine',
    speaker: 'Cheshire Voice Source',
    crate: 'Hat Box',
    table: 'Long Tea Table',
    door: 'Painted Door',
  },
  ambientAudio: '/audio/wonderland-ambient.mp3',
  rooms: [
    {
      id: 'tea-garden',
      chamber: 'A',
      name: 'The Tea Garden',
      flavor:
        'A table set for a hundred and laid for none. Cups steam, chairs squeal, and a very small door sulks in the west wall, far too little to walk through — for now.',
      priority: 1,
      anchors: [
        {
          id: 'wl-tea',
          roomId: 'tea-garden',
          name: 'The Mad Tea Ceremony',
          role: 'core',
          mechanic: 'sequence',
          prop: { kind: 'table' },
          position: [0.5, 0, 0.5],
          size: [5, 3, 3],
          facing: [0, 0, -1],
          objective: 'Perform the unbirthday tea ceremony in its one true (and quite mad) order.',
          clueEasy:
            'The Hatter’s card insists: first Pour the Tea, then Toast the Unbirthday, then Move One Seat Down, then Sip and Smile.',
          clueHard:
            'A jam-stained card: "Tea before words, words before the shuffle, the shuffle before the sip. Cake and roses are for after — or never."',
          config: {
            kind: 'sequence',
            options: [
              { id: 'pour', label: 'Pour the Tea', glyph: 'teacup' },
              { id: 'toast', label: 'Toast the Unbirthday', glyph: 'bell' },
              { id: 'move', label: 'Move One Seat Down', glyph: 'hourglass' },
              { id: 'sip', label: 'Sip and Smile', glyph: 'feather' },
              { id: 'cake', label: 'Cut the Cake', glyph: 'cake', decoy: true },
              { id: 'rose', label: 'Sniff a Rose', glyph: 'rose', decoy: true },
            ],
            solution: ['pour', 'toast', 'move', 'sip'],
          },
          hints: {
            clear: [
              'Pour → Toast → Move One Seat Down → Sip.',
              'Cutting the cake and sniffing a rose have no place in the ceremony.',
            ],
            moderate: [
              'Tea is poured before anyone speaks, and sipped only at the very end.',
              'Two of these little rituals are lovely distractions. Skip them.',
            ],
            subtle: [
              'The Hatter always begins with the pouring.',
              'A mad ceremony is still an order — just a silly one.',
            ],
          },
          solvedCopy:
            'The whole table cheers "a very merry unbirthday!" — and with a click, both garden paths swing open at once.',
          solvedEffects: ['lighting', 'audio'],
        },
      ],
      setPieces: [
        { prop: { kind: 'statue' }, position: [7, 0, 6], size: [2.5, 5, 2.5], rotationY: -0.4 },
        { prop: { kind: 'plant' }, position: [-7, 0, 7], size: [2, 4.5, 2] },
        { prop: { kind: 'plant' }, position: [7, 0, -7], size: [2, 4.5, 2] },
        { prop: { kind: 'pedestal' }, position: [-6, 0, -6], size: [1.4, 2.4, 1.4] },
      ],
    },
    {
      id: 'curiouser-cupboard',
      chamber: 'B',
      name: 'The Curiouser Cupboard',
      flavor:
        'A pantry that cannot decide how big it is. Shelves stacked with bottles marked DRINK ME and cakes iced EAT ME, and a tall looking-glass hung crookedly, its writing all backwards.',
      priority: 2,
      anchors: [
        {
          id: 'wl-bottle',
          roomId: 'curiouser-cupboard',
          name: 'The Size-Shifting Shelf',
          role: 'core',
          mechanic: 'arrange',
          prop: { kind: 'shelf' },
          position: [-2, 0, -3],
          size: [4.5, 4, 1.6],
          facing: [0, 0, 1],
          objective: 'Line up the treats by the height they’d leave you — smallest self to tallest.',
          clueEasy:
            'A tag dangles from the shelf: DRINK ME shrinks you smallest, the left mushroom shrinks you a little, the right mushroom stretches you, and EAT ME makes you tallest.',
          clueHard:
            'Each treat changes your height. Arrange them by the you they would make — from the tiniest to the most towering.',
          config: {
            kind: 'arrange',
            slots: [
              { id: 's1', label: 'Smallest Self' },
              { id: 's2', label: 'A Little Small' },
              { id: 's3', label: 'A Little Tall' },
              { id: 's4', label: 'Tallest Self' },
            ],
            items: [
              { id: 'drink', label: 'DRINK ME Bottle', glyph: 'bottle' },
              { id: 'leftcap', label: 'Left of the Mushroom', glyph: 'plant' },
              { id: 'rightcap', label: 'Right of the Mushroom', glyph: 'plant' },
              { id: 'eat', label: 'EAT ME Cake', glyph: 'cake' },
              { id: 'key', label: 'The Golden Key', glyph: 'key', decoy: true },
            ],
            solution: { s1: 'drink', s2: 'leftcap', s3: 'rightcap', s4: 'eat' },
            submitLabel: 'Set the Shelf',
          },
          hints: {
            clear: [
              'DRINK ME → Left Mushroom → Right Mushroom → EAT ME.',
              'The Golden Key changes no one’s height — it only opens doors. Leave it off the shelf.',
            ],
            moderate: [
              'The bottle shrinks you most; the cake grows you most.',
              'One item on the shelf does nothing to your size at all.',
            ],
            subtle: [
              'The mushroom works both ways — one side down, one side up.',
              'Sort by who you’d become, not by what it is.',
            ],
          },
          solvedCopy:
            'The shelf rearranges itself with a contented sigh, and a hidden drawer springs open beneath it.',
          solvedEffects: ['lighting'],
        },
        {
          id: 'wl-mirror',
          roomId: 'curiouser-cupboard',
          name: 'The Looking-Glass Riddle',
          role: 'extra',
          crossRoom: true,
          mechanic: 'riddle',
          prop: { kind: 'panel' },
          position: [7.6, 3.8, 0],
          size: [0.4, 5, 4],
          facing: [-1, 0, 0],
          objective: 'The looking-glass poses a riddle in mirror-writing. Read it true and answer.',
          clueEasy:
            'The glass reads backwards. Its plain-writing twin hangs in the Croquet Court: "I mimic your every move and live behind the glass, yet I have no life of my own. What am I?" — a reflection.',
          clueHard:
            'Every letter runs the wrong way. Somewhere the same words hang the right way round — you’ll have to go and read them.',
          config: {
            kind: 'riddle',
            prompt:
              '?I ma tahW .nwo ym fo efil on evah I tey ,ssalg eht dniheb evil dna evom yreve ruoy cimim I',
            answers: ['a reflection', 'reflection', 'your reflection', 'my reflection'],
            choices: ['A Reflection', 'A Shadow', 'A Portrait', 'A Twin'],
            placeholder: 'Read the glass and answer…',
          },
          hints: {
            clear: [
              'The answer is a reflection.',
              'The readable version of this riddle hangs in the Croquet Court — go find it.',
            ],
            moderate: [
              'Hold the words to a mirror, or find the twin that already reads forwards.',
              'It copies you exactly but was never alive.',
            ],
            subtle: [
              'The glass writes everything the wrong way round.',
              'You have seen these same words written properly, elsewhere.',
            ],
          },
          solvedCopy:
            'The looking-glass ripples like water, pleased to be understood, then settles clear again.',
          solvedEffects: ['lighting', 'audio'],
        },
      ],
      setPieces: [
        { prop: { kind: 'shelf' }, position: [-5, 0, 9.2], size: [4, 6.5, 1], rotationY: Math.PI },
        { prop: { kind: 'cabinet' }, position: [6, 0, 7], size: [2, 4, 1.5], rotationY: -0.3 },
        { prop: { kind: 'crate' }, position: [5, 0, -7], size: [1.8, 1.8, 1.8], rotationY: 0.3 },
      ],
    },
    {
      id: 'croquet-court',
      chamber: 'C',
      name: 'The Croquet Court',
      flavor:
        'A lawn of impossible hoops, flamingo mallets tucked under the hedges, and white rose bushes trembling — the Queen does so hate a white rose. A framed verse hangs by the far hedge, written the right way round.',
      priority: 3,
      anchors: [
        {
          id: 'wl-croquet',
          roomId: 'croquet-court',
          name: 'The Royal Croquet Ground',
          role: 'core',
          mechanic: 'connect',
          prop: { kind: 'panel' },
          position: [-9.6, 3.6, 3],
          size: [0.5, 4.5, 5],
          facing: [1, 0, 0],
          objective: 'By royal decree, send each hedgehog rolling through its appointed arch.',
          clueEasy:
            'The Queen’s decree, posted on the ground: the Rust hedgehog through the Heart Arch, the Grey through the Spade Arch, the White through the Club Arch.',
          clueHard:
            'The Queen’s rules of play match each living ball to a single living hoop. Cross them and it’s off with your head.',
          config: {
            kind: 'connect',
            left: [
              { id: 'rust', label: 'Rust Hedgehog', glyph: 'coin' },
              { id: 'grey', label: 'Grey Hedgehog', glyph: 'coin' },
              { id: 'white', label: 'White Hedgehog', glyph: 'coin' },
            ],
            right: [
              { id: 'heart', label: 'Heart Arch', glyph: 'crown' },
              { id: 'spade', label: 'Spade Arch', glyph: 'shield' },
              { id: 'club', label: 'Club Arch', glyph: 'banner' },
            ],
            pairs: { rust: 'heart', grey: 'spade', white: 'club' },
            leftTitle: 'Hedgehogs',
            rightTitle: 'Arches',
          },
          hints: {
            clear: [
              'Rust→Heart, Grey→Spade, White→Club.',
              'Read the Queen’s decree posted on the croquet ground.',
            ],
            moderate: [
              'Each hedgehog has exactly one lawful arch.',
              'The decree pairs them by color to suit, top to bottom.',
            ],
            subtle: [
              'The Queen’s rules are absurd but consistent.',
              'Match warmest to grandest, palest to plainest.',
            ],
          },
          solvedCopy:
            'Every hedgehog rolls neatly home and the hoops bow. The Queen, for once, does not shout.',
          solvedEffects: ['lighting', 'audio'],
        },
        {
          id: 'wl-rose',
          roomId: 'croquet-court',
          name: 'The Rose-Painting Station',
          role: 'parallel',
          mechanic: 'dial',
          prop: { kind: 'cabinet' },
          position: [8.5, 0, 3],
          size: [1.6, 6.5, 4],
          facing: [-1, 0, 0],
          objective: 'Paint the white roses the only shade the Queen tolerates — three coats of her red.',
          clueEasy:
            'The gardeners’ warning: "One coat is never enough. Three full coats of Crimson, or it’s off with our heads." Set Crimson · Crimson · Crimson.',
          clueHard:
            'The Queen accepts exactly one color, laid on exactly three times. Any coat that isn’t her red ruins the whole bush.',
          config: {
            kind: 'dial',
            wheels: [
              ['White', 'Crimson', 'Gold', 'Black'],
              ['White', 'Crimson', 'Gold', 'Black'],
              ['White', 'Crimson', 'Gold', 'Black'],
            ],
            code: ['Crimson', 'Crimson', 'Crimson'],
            wheelLabels: ['First Coat', 'Second Coat', 'Third Coat'],
            submitLabel: 'Paint the Roses',
          },
          hints: {
            clear: [
              'All three coats are Crimson.',
              'The Queen’s red is the only color that survives her temper.',
            ],
            moderate: [
              'Every wheel should show the same shade.',
              'White, gold, and black will each cost a gardener his head.',
            ],
            subtle: [
              'One color, applied three times over.',
              'Think of the roses the Queen refuses to see white.',
            ],
          },
          solvedCopy:
            'The last white petal vanishes under a coat of dripping red. The gardeners exhale as one.',
          solvedEffects: ['lighting', 'mist'],
        },
      ],
      clueProps: [
        {
          id: 'wl-lookingglass',
          roomId: 'croquet-court',
          name: 'The Framed Verse',
          forAnchor: 'wl-mirror',
          text:
            'A little brass-framed verse hangs by the hedge, printed plainly the right way round: "I mimic your every move and live behind the glass, yet I have no life of my own. What am I?"',
          prop: { kind: 'panel' },
          position: [-5, 4.5, 11.5],
          size: [4, 3, 0.3],
          rotationY: Math.PI,
        },
      ],
      setPieces: [
        { prop: { kind: 'plant' }, position: [-8, 0, -6], size: [2, 4.5, 2] },
        { prop: { kind: 'plant' }, position: [8, 0, -6], size: [2, 4.5, 2] },
        { prop: { kind: 'statue' }, position: [-8, 0, 8], size: [2.2, 6, 2.2], rotationY: 0.4 },
        { prop: { kind: 'statue' }, position: [8, 0, 9], size: [2.2, 6, 2.2], rotationY: -0.3 },
      ],
    },
  ],
  doors: [
    {
      id: 'wl-door-1',
      doorway: 'A-B',
      from: 'tea-garden',
      to: 'curiouser-cupboard',
      name: 'The Cupboard Door',
      gate: { type: 'anchors', allOf: ['wl-tea'] },
      lockedCopy: 'The little cupboard door won’t budge until the tea ceremony is properly kept.',
      transitionCopy: 'The door swings wide onto shelves that can’t decide how big they are…',
    },
    {
      id: 'wl-door-2',
      doorway: 'A-C',
      from: 'tea-garden',
      to: 'croquet-court',
      name: 'The Hedge Gate',
      gate: { type: 'anchors', allOf: ['wl-tea'] },
      lockedCopy: 'The hedge gate stays knotted shut until the tea ceremony is properly kept.',
      transitionCopy: 'The hedge parts onto a lawn of impossible hoops and trembling roses…',
    },
    {
      id: 'wl-exit',
      doorway: 'EXIT-A',
      from: 'tea-garden',
      to: 'ESCAPE',
      name: 'The Little Door',
      gate: { type: 'allRequired' },
      lockedCopy: 'The Little Door yawns and refuses: not one soul leaves until every last thing in Wonderland is put right.',
      transitionCopy: 'You drink the last of the tea, shrink just so, and slip through the Little Door into daylight…',
    },
  ],
};
