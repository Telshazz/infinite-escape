// Generic completability test: plays themes end-to-end at hard difficulty
// (extras + cross-room + parallel anchors all spawned), solving each
// mechanic through the real panel DOM and traversing doors via the store.
//
// Setup:  npm i -D playwright-core   (and a Chromium binary)
//         npm run dev                (in another terminal, port 3000)
// Usage:  node scripts/e2e-playthrough.mjs atlantis pirate zombie \
//           wonderland space castle corporate
//
// Notes: clicks use dispatchEvent because software-GL CI renderers starve
// Playwright's two-stable-frames actionability check; on a real GPU,
// regular clicks work (interaction fidelity is covered by manual play).
import { chromium } from 'playwright-core';

const THEMES = process.argv.slice(2);
if (THEMES.length === 0) {
  console.error('pass theme ids');
  process.exit(1);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
const pageErrors = [];
page.on('pageerror', (e) => {
  const m = e.message;
  if (!m.includes('Pointer Lock') && !m.includes('cloudfront')) pageErrors.push(m.slice(0, 160));
});

const st = (fn) => page.evaluate(fn);
const getSpec = () =>
  st(() => {
    const s = window.__game.getState();
    return {
      required: s.spec.requiredAnchors,
      anchors: s.spec.anchors,
      doors: s.spec.doors.map((d) => ({ id: d.id, from: d.from, to: d.to })),
      rooms: s.spec.rooms.map((r) => r.id),
    };
  });

async function goToRoom(target) {
  const cur = await st(() => window.__game.getState().currentRoomId);
  if (cur === target) return true;
  const { doors } = await getSpec();
  // BFS over bidirectional door edges
  const adj = {};
  for (const d of doors) {
    if (d.to === 'ESCAPE') continue;
    (adj[d.from] ??= []).push({ to: d.to, door: d.id });
    (adj[d.to] ??= []).push({ to: d.from, door: d.id });
  }
  const prev = { [cur]: null };
  const q = [cur];
  while (q.length) {
    const n = q.shift();
    for (const e of adj[n] ?? []) {
      if (!(e.to in prev)) {
        prev[e.to] = { from: n, door: e.door };
        q.push(e.to);
      }
    }
  }
  if (!(target in prev)) return false;
  const hops = [];
  for (let n = target; prev[n]; n = prev[n].from) hops.unshift(prev[n].door);
  for (const doorId of hops) {
    await page.evaluate((d) => window.__game.getState().useDoor(d), doorId);
    await page.waitForTimeout(2200);
    const now = await st(() => {
      const g = window.__game.getState();
      return { room: g.currentRoomId, gm: g.gmMessages[g.gmMessages.length - 1]?.text?.slice(0, 90) };
    });
    console.log(`   hop ${doorId} -> ${now.room} | ${now.gm}`);
  }
  return (await st(() => window.__game.getState().currentRoomId)) === target;
}

const exact = (name) => page.getByRole('button', { name, exact: true });
const tap = async (locator) => {
  await locator.first().waitFor({ state: 'visible', timeout: 6000 });
  await locator.first().dispatchEvent('click');
};

// The dev-server error overlay (expected GLB fetch failures in this
// sandbox) intercepts pointer events; production builds have no overlay.
const zapOverlay = () =>
  page.evaluate(() =>
    document.querySelectorAll('nextjs-portal').forEach((n) => n.remove())
  );

async function solveAnchor(id) {
  const a = await page.evaluate((x) => window.__game.getState().spec.anchors[x], id);
  if (!a) return `anchor ${id} missing from live spec`;
  if (!(await goToRoom(a.roomId))) return `NO PATH to ${a.roomId}`;
  await page.evaluate((x) => window.__game.getState().focusAnchor(x), id);
  await page.waitForTimeout(900);
  await zapOverlay();
  const c = a.config;
  try {
    if (c.kind === 'sequence') {
      for (const solId of c.solution) {
        const opt = c.options.find((o) => o.id === solId);
        await tap(exact(opt.label));
        await page.waitForTimeout(220);
      }
    } else if (c.kind === 'dial') {
      for (let w = 0; w < c.wheels.length; w++) {
        const idx = c.wheels[w].indexOf(c.code[w]);
        if (idx < 0) return `code ${c.code[w]} not in wheel ${w}`;
        const up = page.getByRole('button', { name: `wheel ${w + 1} up` });
        for (let i = 0; i < idx; i++) {
          await tap(up);
          await page.waitForTimeout(40);
        }
      }
      await tap(exact(c.submitLabel));
    } else if (c.kind === 'connect') {
      for (const [l, r] of Object.entries(c.pairs)) {
        const left = c.left.find((n) => n.id === l);
        const right = c.right.find((n) => n.id === r);
        await tap(exact(left.label));
        await page.waitForTimeout(120);
        await tap(exact(right.label));
        await page.waitForTimeout(120);
      }
      await tap(page.getByRole('button', { name: /energize connections/i }));
    } else if (c.kind === 'arrange') {
      for (const [slot, item] of Object.entries(c.solution)) {
        const it = c.items.find((i) => i.id === item);
        const sl = c.slots.find((s) => s.id === slot);
        await tap(exact(it.label));
        await page.waitForTimeout(120);
        await tap(page.getByRole('button', { name: new RegExp(sl.label, 'i') }));
        await page.waitForTimeout(120);
      }
      await tap(exact(c.submitLabel));
    } else if (c.kind === 'riddle') {
      // hard band → free text input
      const input = page.locator('.holo input').first();
      await input.waitFor({ state: 'visible', timeout: 6000 });
      await input.evaluate((el, v) => {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, c.answers[0]);
      await page.waitForTimeout(150);
      await tap(page.getByRole('button', { name: /^answer$/i }));
    }
  } catch (e) {
    return `UI: ${String(e).slice(0, 140)}`;
  }
  await page.waitForTimeout(1100);
  const done = await page.evaluate(
    (x) => window.__game.getState().completedAnchors.includes(x),
    id
  );
  if (!done) {
    await st(() => window.__game.getState().focusAnchor(null));
    return 'NOT COMPLETED after solve attempt';
  }
  return null;
}

const PORT = process.env.PORT ?? '3000';
await page.goto(`http://localhost:${PORT}/?debug`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.getByRole('button', { name: /launch investor demo/i }).click({ timeout: 60000 });
// hard difficulty, big group, full length → maximum spawned content
await st(() => {
  const g = window.__game.getState();
  g.setProfile({ difficulty: 8, playerCount: 6, sessionLength: 60, mode: 'Adventure', fearLevel: 'Mild' });
});
await page.getByText(/generate room experience/i).first().click();
await page.getByText(/enter the room/i).first().waitFor({ timeout: 20000 });
await page.getByText(/enter the room/i).first().click();
await page.waitForTimeout(3500);

for (const theme of THEMES) {
  await page.evaluate((t) => window.__game.getState().regenerateTheme(t), theme);
  await page.waitForTimeout(4500);
  const spec = await getSpec();
  console.log(`-- ${theme}: required=${spec.required.join(',')} | anchors=${Object.keys(spec.anchors).join(',')} | rooms=${spec.rooms.join(',')}`);
  const fails = [];
  for (const id of spec.required) {
    const err = await solveAnchor(id);
    if (err) fails.push(`${id}: ${err}`);
  }
  // exit door
  const exit = spec.doors.find((d) => d.to === 'ESCAPE');
  const exitRoom = exit ? spec.doors.find((d) => d.to === 'ESCAPE') : null;
  if (exit) {
    // walk to the exit's room first
    const exitFrom = await page.evaluate(
      (x) => window.__game.getState().spec.doors.find((d) => d.id === x).from,
      exit.id
    );
    await goToRoom(exitFrom);
    await page.evaluate((x) => window.__game.getState().useDoor(x), exit.id);
    await page.waitForTimeout(2200);
  }
  const complete = await st(() => window.__game.getState().sessionComplete);
  console.log(
    `${theme}: ${spec.required.length} anchors | ${
      fails.length === 0 && complete ? 'ESCAPED ✓' : 'FAILED'
    }${fails.length ? ' | ' + fails.join(' ; ') : ''}${!complete && !fails.length ? ' | exit did not open' : ''}`
  );
}
if (pageErrors.length) console.log('pageErrors:', pageErrors.slice(0, 5));
await browser.close();
