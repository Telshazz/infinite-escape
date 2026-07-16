// Comprehensive UI-flow test against a production server (next start).
// Covers: start/business views, wizard controls, generation notes, pointer
// lock, WASD movement + wall collision, aim/E/Esc, V/G/H keybinds, hint
// caps, pause overlay, investor view, regenerator, Family Friendly timer.
// Setup: npm i -D playwright-core;  npm run build && npx next start -p 3100
// Usage: node scripts/e2e-uiflow.mjs   (CHROMIUM_PATH env overrides binary)
import { chromium } from 'playwright-core';

const results = [];
const check = (name, ok, detail = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
const pageErrors = [];
page.on('pageerror', (e) => {
  const m = e.message;
  if (!m.includes('Pointer Lock') && !m.includes('cloudfront')) pageErrors.push(m.slice(0, 140));
});
const tap = async (loc) => {
  await loc.first().waitFor({ state: 'visible', timeout: 8000 });
  await loc.first().dispatchEvent('click');
};
const st = (fn, arg) => page.evaluate(fn, arg);

// ---- 1. start screen + business model view ----
await page.goto('http://localhost:3100/?debug', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1500);
check('start screen renders', await page.getByText(/we don.t rebuild rooms/i).first().isVisible().catch(() => false));
await tap(page.getByRole('button', { name: /view business model/i }));
await page.waitForTimeout(900);
const bizText = await page.textContent('body');
check('business model view opens', /50,000|license|operator/i.test(bizText));
await page.screenshot({ path: '/tmp/shots-prod/1-business.png' });
await st(() => window.__game.getState().setView('start'));
await page.waitForTimeout(500);

// ---- 2. wizard: real control clicks ----
await tap(page.getByRole('button', { name: /launch investor demo/i }));
await page.waitForTimeout(700);
await tap(page.getByRole('button', { name: 'Horror', exact: true }));
await tap(page.getByRole('button', { name: 'Intense', exact: true }));
await tap(page.getByRole('button', { name: '60 min', exact: true }));
const prof = await st(() => window.__game.getState().profile);
check('wizard buttons update profile', prof.mode === 'Horror' && prof.fearLevel === 'Intense' && prof.sessionLength === 60,
  `${prof.mode}/${prof.fearLevel}/${prof.sessionLength}`);
await page.screenshot({ path: '/tmp/shots-prod/2-wizard.png' });

// ---- 3. generation shows resolved spec ----
await tap(page.getByRole('button', { name: /generate room experience/i }));
await page.getByText(/resolved session spec/i).waitFor({ timeout: 15000 });
const genText = await page.textContent('body');
check('generation surfaces resolver notes', /ceiling|intensity|chambers active/i.test(genText));
const specNow = await st(() => window.__game.getState().spec);
check('Horror+Intense arms startle cues', specNow.jumpScares === true, `intensity ${specNow.effectIntensity.toFixed(2)}`);
await page.screenshot({ path: '/tmp/shots-prod/3-generating.png' });
await page.getByText(/enter the room/i).first().waitFor({ timeout: 10000 });
await tap(page.getByText(/enter the room/i).first());
await page.waitForTimeout(5000);
check('room view mounts', (await st(() => window.__game.getState().view)) === 'room');

// ---- 4. pointer lock + real movement + wall collision ----
await page.locator('canvas').click({ position: { x: 720, y: 405 }, force: true });
await page.waitForTimeout(600);
check('pointer locks on click', await st(() => !!document.pointerLockElement));
const p0 = await st(() => window.__r3f.camera.position.toArray());
await page.keyboard.down('KeyW');
await page.waitForTimeout(900);
await page.keyboard.up('KeyW');
await page.waitForTimeout(300);
const p1 = await st(() => window.__r3f.camera.position.toArray());
check('WASD moves the player', Math.abs(p1[2] - p0[2]) > 1, `z ${p0[2].toFixed(1)} -> ${p1[2].toFixed(1)}`);
await page.keyboard.down('KeyS'); // walk backward into the south wall
await page.waitForTimeout(3000);
await page.keyboard.up('KeyS');
const p2 = await st(() => window.__r3f.camera.position.toArray());
check('walls stop the player (collision)', p2[2] > -9.6, `settled z ${p2[2].toFixed(2)} (wall at -10)`);
check('player still at eye height', Math.abs(p2[1] - 5.6) < 0.4, `y ${p2[1].toFixed(2)}`);

// ---- 5. aim + E focus + Esc back ----
await page.keyboard.down('KeyW'); // return toward altar
await page.waitForTimeout(1200);
await page.keyboard.up('KeyW');
await page.waitForTimeout(500);
const aim = await st(() => window.__game.getState().aim);
check('reticle aims at altar', aim?.id === 'atl-altar', aim?.prompt ?? 'no aim');
await page.keyboard.press('KeyE');
await page.waitForTimeout(1200);
check('E opens in-world panel', (await st(() => window.__game.getState().focusedAnchorId)) === 'atl-altar');
await page.screenshot({ path: '/tmp/shots-prod/4-panel.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(600);
check('Esc steps back from panel', (await st(() => window.__game.getState().focusedAnchorId)) === null);

// ---- 6. keybinds: V layer cycle, G drawer, H hint ----
// Esc from panel released pointer lock; V/H/G work regardless of lock
await st(() => window.__game.getState().setPaused(false));
await page.keyboard.press('KeyV');
await page.waitForTimeout(300);
check('V cycles reality layer', (await st(() => window.__game.getState().layer)) === 'mapping');
await page.screenshot({ path: '/tmp/shots-prod/5-mapping.png' });
await page.keyboard.press('KeyV');
await page.waitForTimeout(300);
await page.keyboard.press('KeyG');
await page.waitForTimeout(300);
check('G toggles GM drawer', (await st(() => window.__game.getState().gmOpen)) === false);
await page.keyboard.press('KeyG');
const msgs0 = await st(() => window.__game.getState().gmMessages.length);
await page.keyboard.press('KeyH');
await page.waitForTimeout(400);
const lastMsg = await st(() => window.__game.getState().gmMessages.at(-1).text);
check('H requests a hint', /hint/i.test(lastMsg), lastMsg.slice(0, 60));

// ---- 7. hint quantity cap (Horror D5 standard = 5/puzzle) ----
for (let i = 0; i < 7; i++) await st(() => window.__game.getState().requestHint());
const capMsg = await st(() => window.__game.getState().gmMessages.at(-1).text);
check('hint cap enforced with register copy', /said all i will say|no more|exhausted/i.test(capMsg), capMsg.slice(0, 70));

// ---- 8. pause overlay + investor view + regenerator ----
await st(() => document.exitPointerLock());
await st(() => window.__game.getState().setPaused(true));
await page.waitForTimeout(700);
check('pause overlay appears', await page.getByText(/pointer released/i).isVisible().catch(() => false));
await page.screenshot({ path: '/tmp/shots-prod/6-pause.png' });
await tap(page.getByRole('button', { name: /investor view/i }).first());
await page.waitForTimeout(800);
check('investor view: fixed vs swappable', await page.getByText(/architecture is the moat/i).isVisible().catch(() => false));
await page.screenshot({ path: '/tmp/shots-prod/7-investor.png' });
await tap(page.getByRole('button', { name: 'Close investor view' }));
await page.waitForTimeout(400);
await st(() => window.__game.getState().setRegenerator(true));
await page.waitForTimeout(700);
const cards = await page.locator('.holo .grid button').count();
check('regenerator lists all 7 themes', cards === 7, `${cards} cards`);
await page.screenshot({ path: '/tmp/shots-prod/8-regenerator.png' });
await st(() => window.__game.getState().setRegenerator(false));

// ---- 9. Family Friendly count-up timer ----
await st(() => {
  const g = window.__game.getState();
  g.setProfile({ mode: 'Family Friendly', fearLevel: 'Intense', difficulty: 9 });
  g.startGeneration();
});
await page.waitForTimeout(400);
const famSpec = await st(() => window.__game.getState().spec);
check('Family cap beats Intense fear', famSpec.effectIntensity <= 0.45 && !famSpec.jumpScares,
  `intensity ${famSpec.effectIntensity.toFixed(2)}, scares ${famSpec.jumpScares}`);
check('Family timer counts up', famSpec.timerPressure === false);
await st(() => window.__game.getState().enterRoom());
await page.waitForTimeout(3500);
const bodyTxt = await page.textContent('body');
check('ELAPSED label shown in Family mode', /ELAPSED/.test(bodyTxt));
await page.screenshot({ path: '/tmp/shots-prod/9-family.png' });

console.log(results.join('\n'));
console.log(`\n${results.filter((r) => r.startsWith('PASS')).length}/${results.length} passed`);
if (pageErrors.length) console.log('pageErrors:', pageErrors.slice(0, 5));
await browser.close();
