import type { Theme } from '../types';

// ---------------------------------------------------------------------------
// CORPORATE TEAM BUILDING MISSION — locked in HQ after the merger announcement.
// LINEAR chain (parallel-heavy, built for groups that split up):
//   Ops Floor (A) → Server Room (B) → Executive Suite (C)
//
// Mechanic assignments (one engine per anchor, §2.5):
//   corp-patchbay  connect   — patch each team to the service it owns
//   corp-kpi       arrange   — order the quarterly metrics wall (parallel)
//   corp-badge     dial      — the executive badge code (4 · 0 · 4)
//   corp-deploy    sequence  — run the release in runbook order; the runbook
//                              lives on the OPS FLOOR whiteboard (cross-room)
//   corp-merger    riddle    — the merger passphrase, spoken in the boardroom
// ---------------------------------------------------------------------------

export const corporate: Theme = {
  id: 'corporate',
  name: 'Corporate Team Building Mission',
  tagline: 'The building locked down at 5:01 PM. The only way out is through the org chart.',
  gmIntro:
    'Good evening, team. This is Facilities. The merger goes live at midnight and the building has entered mandatory lockdown — standard procedure, nothing personal. Clear each floor’s open action items and the executive exit will badge you out. Consider this your performance review.',
  samplePuzzleType: 'Network patching · KPI ordering · deploy runbook',
  structure: 'linear',
  palette: {
    fog: '#0e1620',
    floor: '#14202e',
    wall: '#1a2a3c',
    primary: '#2a5a7a',
    secondary: '#3dd6f5',
    accent: '#f5f5f0',
    keyLight: '#3dd6f5',
    fillLight: '#22506e',
  },
  twins: {
    fan: 'HVAC Vent Unit',
    mister: 'Humidity Regulator',
    ledStrip: 'Status Light Rail',
    speaker: 'PA / Facilities Intercom',
    crate: 'Shipping Box (Q3 Swag)',
    door: 'Badge-Reader Door',
  },
  ambientAudio: '/audio/corporate-ambient.mp3',
  rooms: [
    {
      id: 'ops-floor',
      chamber: 'A',
      name: 'The Ops Floor',
      flavor:
        'Monitors glow over empty standing desks. The network patch bay blinks red on the east wall, and somebody left the quarterly all-hands slides running on a loop.',
      priority: 1,
      anchors: [
        {
          id: 'corp-patchbay',
          roomId: 'ops-floor',
          name: 'Network Patch Bay',
          role: 'core',
          mechanic: 'connect',
          prop: { kind: 'panel' },
          position: [9.7, 3.2, -5],
          size: [0.5, 4.5, 5],
          facing: [-1, 0, 0],
          objective: 'Re-patch each team to the service it actually owns before the network audit fails.',
          clueEasy:
            'The ownership chart is taped beside the bay: PAYMENTS owns the LEDGER SERVER. ANALYTICS owns the DASHBOARD CLUSTER. SECURITY owns THE VAULT.',
          clueHard:
            'A coffee-stained ownership chart: "Who counts the money keeps the ledger. Who counts the clicks keeps the dashboards. Who trusts no one keeps the vault."',
          config: {
            kind: 'connect',
            left: [
              { id: 'payments', label: 'Payments Team', glyph: 'coin' },
              { id: 'analytics', label: 'Analytics Team', glyph: 'chart' },
              { id: 'security', label: 'Security Team', glyph: 'badge' },
            ],
            right: [
              { id: 'ledger', label: 'Ledger Server', glyph: 'server' },
              { id: 'dashboards', label: 'Dashboard Cluster', glyph: 'folder' },
              { id: 'vault', label: 'The Vault', glyph: 'lock' },
            ],
            pairs: { payments: 'ledger', analytics: 'dashboards', security: 'vault' },
            leftTitle: 'Teams',
            rightTitle: 'Services',
          },
          hints: {
            clear: [
              'Payments→Ledger Server, Analytics→Dashboard Cluster, Security→The Vault.',
              'Money to the ledger, clicks to the dashboards, secrets to the vault.',
            ],
            moderate: [
              'Match each team to what it would be blamed for at the postmortem.',
              'The vault only answers to the team that trusts no one.',
            ],
            subtle: [
              'Ownership is taped next to the bay, under a coffee ring.',
              'Ask yourself: who gets paged when each service goes down?',
            ],
          },
          solvedCopy:
            'All links green. Facilities notes: "Network audit passed. The east door has been notified of your competence."',
          solvedEffects: ['lighting'],
        },
        {
          id: 'corp-kpi',
          roomId: 'ops-floor',
          name: 'KPI Dashboard Wall',
          role: 'parallel',
          mechanic: 'arrange',
          prop: { kind: 'console' },
          position: [0, 0, 0.5],
          size: [4.5, 3.2, 2.2],
          facing: [0, 0, -1],
          objective: 'Restore the quarterly metrics to the dashboard in the order the year actually happened.',
          clueEasy:
            'The all-hands slide spells it out: "Q1 we planted the SEED FUNDING. Q2 the GROWTH CURVE climbed. Q3 the PRODUCT LAUNCH shipped. Q4 we earned the FIVE-STAR RATING." Ignore the vanity metric.',
          clueHard:
            'A looping all-hands slide: "First the money, then the climb, then the launch, then the praise. One tile on this board measures nothing at all."',
          config: {
            kind: 'arrange',
            slots: [
              { id: 'q1', label: 'Q1' },
              { id: 'q2', label: 'Q2' },
              { id: 'q3', label: 'Q3' },
              { id: 'q4', label: 'Q4' },
            ],
            items: [
              { id: 'seed', label: 'Seed Funding', glyph: 'coin' },
              { id: 'growth', label: 'Growth Curve', glyph: 'chart' },
              { id: 'launch', label: 'Product Launch', glyph: 'rocket' },
              { id: 'rating', label: 'Five-Star Rating', glyph: 'star' },
              { id: 'vanity', label: 'Vanity Metric', glyph: 'eye', decoy: true },
            ],
            solution: { q1: 'seed', q2: 'growth', q3: 'launch', q4: 'rating' },
            submitLabel: 'Publish Dashboard',
          },
          hints: {
            clear: [
              'Q1 Seed Funding, Q2 Growth Curve, Q3 Product Launch, Q4 Five-Star Rating. The Vanity Metric goes nowhere.',
              'Money, climb, launch, praise — in that order.',
            ],
            moderate: [
              'You cannot launch before you grow, and you cannot grow before you are funded.',
              'One of these tiles would never survive a board meeting.',
            ],
            subtle: [
              'The year tells a story. Put it back in order.',
              'Impressions are not a metric. Someone here knows that.',
            ],
          },
          solvedCopy:
            'Dashboard published. Facilities notes: "Beautiful narrative arc. Someone in this group deserves a promotion. This is not a formal offer."',
          solvedEffects: ['lighting', 'audio'],
        },
      ],
      clueProps: [
        {
          id: 'corp-whiteboard',
          roomId: 'ops-floor',
          name: 'Deploy Runbook Whiteboard',
          forAnchor: 'corp-deploy',
          text:
            'The whiteboard reads, in the release manager’s handwriting: "MIDNIGHT DEPLOY RUNBOOK — 1. FREEZE MERGES. 2. RUN TESTS. 3. BACKUP DATABASE. 4. SHIP IT. Deviate and you own the incident channel forever."',
          prop: { kind: 'panel' },
          position: [-9.6, 4.5, 3],
          size: [0.4, 5, 6],
          rotationY: 0,
        },
      ],
      setPieces: [
        { prop: { kind: 'table' }, position: [-7, 0, -7], size: [3, 2.6, 2], rotationY: 0.3 },
        { prop: { kind: 'crate' }, position: [7.2, 0, 6.2], size: [2, 2, 2], rotationY: -0.2 },
        { prop: { kind: 'plant' }, position: [-7.5, 0, 7.5], size: [1.4, 4, 1.4], rotationY: 0.6 },
        { prop: { kind: 'shelf' }, position: [4.5, 0, -7.8], size: [4, 5, 1.2] },
      ],
    },
    {
      id: 'server-room',
      chamber: 'B',
      name: 'The Server Room',
      flavor:
        'Rack fans roar in the cold air. The badge terminal by the racks blinks three empty digits, and a deploy console is frozen mid-release — waiting for someone who read the runbook.',
      priority: 3,
      pruneCollapseTo: 'executive-suite',
      anchors: [
        {
          id: 'corp-badge',
          roomId: 'server-room',
          name: 'Badge Code Terminal',
          role: 'core',
          mechanic: 'dial',
          prop: { kind: 'cabinet' },
          position: [-7.2, 0, -4],
          size: [1.6, 6.5, 4],
          facing: [1, 0, 0],
          objective: 'Enter the emergency badge override code that IT swore they never wrote down.',
          clueEasy:
            'The sticky note on the rack reads: "If the badge reader fails, the override is the error every engineer fears the most: NOT FOUND." Enter 4 · 0 · 4.',
          clueHard:
            'A sticky note in IT handwriting: "Override = the status code for what this exit currently is." Somewhere, a web developer is laughing.',
          config: {
            kind: 'dial',
            wheels: [
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            ],
            code: ['4', '0', '4'],
            wheelLabels: ['First', 'Second', 'Third'],
            submitLabel: 'Badge In',
          },
          hints: {
            clear: [
              'The code is 4 · 0 · 4.',
              'It is the HTTP status code for "Not Found."',
            ],
            moderate: [
              'What does a server say when it cannot find the page?',
              'The exit is currently… not found. There is a number for that.',
            ],
            subtle: [
              'IT jokes are load-bearing in this company.',
              'The sticky note is the documentation. It is always the sticky note.',
            ],
          },
          solvedCopy:
            'ACCESS GRANTED. Facilities notes: "Override accepted. Please do not tell IT you found the sticky note."',
          solvedEffects: ['lighting'],
        },
        {
          id: 'corp-deploy',
          roomId: 'server-room',
          name: 'Midnight Deploy Console',
          role: 'extra',
          crossRoom: true,
          mechanic: 'sequence',
          prop: { kind: 'console' },
          position: [6.6, 0, 3],
          size: [3.5, 3.2, 2.2],
          facing: [-1, 0, 0],
          objective:
            'Run the merger release in the exact runbook order. The runbook is written somewhere you have already been.',
          clueEasy:
            'The whiteboard back on the Ops Floor lists it: 1. Freeze Merges, 2. Run Tests, 3. Backup Database, 4. Ship It.',
          clueHard:
            'The console shows six actions and zero documentation. The release manager wrote the runbook on a wall on another floor.',
          config: {
            kind: 'sequence',
            options: [
              { id: 'freeze', label: 'Freeze Merges', glyph: 'lock' },
              { id: 'tests', label: 'Run Tests', glyph: 'flask' },
              { id: 'backup', label: 'Backup Database', glyph: 'server' },
              { id: 'ship', label: 'Ship It', glyph: 'rocket' },
              { id: 'replyall', label: 'Reply-All Update', glyph: 'note', decoy: true },
              { id: 'hotfix', label: 'Hotfix in Prod', glyph: 'flame', decoy: true },
            ],
            solution: ['freeze', 'tests', 'backup', 'ship'],
          },
          hints: {
            clear: [
              'Freeze Merges → Run Tests → Backup Database → Ship It.',
              'The whiteboard on the Ops Floor has the numbered runbook.',
            ],
            moderate: [
              'Walk back to the Ops Floor and read the release manager’s whiteboard.',
              'Nobody ships before they back up. Nobody sane, anyway.',
            ],
            subtle: [
              'The documentation exists — just not on this floor.',
              'Two of these buttons end careers.',
            ],
          },
          solvedCopy:
            'DEPLOY SUCCESSFUL. Zero downtime. Facilities notes: "The incident channel stays quiet tonight. Legends, all of you."',
          solvedEffects: ['lighting', 'vibration'],
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
      id: 'executive-suite',
      chamber: 'C',
      name: 'The Executive Suite',
      flavor:
        'Floor-to-ceiling windows, a boardroom table the size of a lifeboat, and one last badge reader on the exit. The merger agreement sits open on the table — unsigned, waiting on a single word.',
      priority: 2,
      anchors: [
        {
          id: 'corp-merger',
          roomId: 'executive-suite',
          name: 'Merger Passphrase Lectern',
          role: 'core',
          mechanic: 'riddle',
          prop: { kind: 'table' },
          position: [0, 0, -1],
          size: [4.5, 3, 2.4],
          facing: [0, 0, 1],
          objective:
            'Speak the passphrase the founders chose — the one thing every merger is really built on.',
          clueEasy:
            '"Hard to earn, easy to lose. I am spent, though I am not money. Every deal is signed with me before the ink." (It is why anyone shakes hands at all.)',
          clueHard:
            '"Hard to earn, easy to lose. I am spent, though I am not money. Every deal is signed with me before the ink. What am I?"',
          config: {
            kind: 'riddle',
            prompt:
              'Hard to earn, easy to lose. I am spent, though I am not money. Every deal is signed with me before the ink. What am I?',
            answers: ['trust', 'the trust'],
            choices: ['Trust', 'Capital', 'Reputation', 'Time'],
            placeholder: 'Speak the passphrase…',
          },
          hints: {
            clear: [
              'The passphrase is "trust."',
              'It is what a handshake spends and a scandal bankrupts.',
            ],
            moderate: [
              'You can build it for years and lose it in a sentence.',
              'No contract works without it, yet it appears in none of the clauses.',
            ],
            subtle: [
              'Think about what the founders shook hands on before any lawyer arrived.',
              'It is spent between people, not accounts.',
            ],
          },
          solvedCopy:
            'The lectern chimes. Facilities notes: "Passphrase accepted. The founders would be proud — or at least legally satisfied."',
          solvedEffects: ['audio', 'lighting'],
        },
      ],
      setPieces: [
        { prop: { kind: 'plant' }, position: [8, 0, 5], size: [1.4, 4.5, 1.4], rotationY: -0.4 },
        { prop: { kind: 'plant' }, position: [-8, 0, 5], size: [1.4, 4.5, 1.4], rotationY: 0.5 },
        { prop: { kind: 'pedestal' }, position: [-5, 0, 9], size: [1.5, 3.2, 1.5] },
        { prop: { kind: 'pedestal' }, position: [5, 0, 9], size: [1.5, 3.2, 1.5] },
        { prop: { kind: 'shelf' }, position: [8, 0, -6], size: [3.5, 6, 1.2], rotationY: Math.PI / 2 },
      ],
    },
  ],
  doors: [
    {
      id: 'corp-door-1',
      doorway: 'A-B',
      from: 'ops-floor',
      to: 'server-room',
      name: 'Badge Door East',
      gate: { type: 'anchors', allOf: ['corp-patchbay'] },
      lockedCopy:
        'The badge reader flashes red. Facilities notes: "The network audit is still failing. Fix the patch bay and we can talk."',
      transitionCopy: 'The badge reader chirps green — cold server-room air rolls out…',
    },
    {
      id: 'corp-door-2',
      doorway: 'B-C',
      from: 'server-room',
      to: 'executive-suite',
      name: 'Server Room Door North',
      gate: { type: 'anchors', allOf: ['corp-badge', 'corp-deploy'] },
      lockedCopy:
        'The door holds. Facilities notes: "Every open action item in the Server Room blocks this door. It is on the sprint board."',
      transitionCopy: 'The door slides open — carpet, glass, and the smell of executive coffee…',
    },
    {
      id: 'corp-exit',
      doorway: 'EXIT-C',
      from: 'executive-suite',
      to: 'ESCAPE',
      name: 'Badge-Locked Executive Exit',
      gate: { type: 'allRequired' },
      lockedCopy:
        'The executive exit stays red. Facilities notes: "Outstanding action items detected. The lockdown lifts when the board of You finishes the agenda."',
      transitionCopy: 'The exit badges green — the lockdown lifts, and the night is yours. Great offsite, everyone…',
    },
  ],
};
