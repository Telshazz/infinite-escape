'use client';

// ---------------------------------------------------------------------------
// The five reusable mechanic engines. Each is a generic interaction pattern;
// themes skin them via config (options, glyphs, labels, copy). Rendered
// inside the in-world focus panel of an anchor.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react';
import type {
  AnchorDef,
  ArrangeConfig,
  ConnectConfig,
  DialConfig,
  RiddleConfig,
  SequenceConfig,
} from '@/lib/types';
import { useGame } from '@/lib/store';
import { Glyph } from '../glyphs';
import { sfx } from '@/lib/audio';

interface EngineProps<C> {
  config: C;
  onSolve: () => void;
  onFail: () => void;
}

// ---------------------------------------------------------------------------
// 1. SEQUENCE-SELECT — pick options in the correct order
// ---------------------------------------------------------------------------
function SequenceEngine({ config, onSolve, onFail }: EngineProps<SequenceConfig>) {
  const [seq, setSeq] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);

  const pick = (id: string) => {
    if (seq.includes(id) || wrong) return;
    const next = [...seq, id];
    const ok = next.every((s, i) => config.solution[i] === s);
    if (!ok) {
      sfx.fail();
      onFail();
      setWrong(true);
      setTimeout(() => {
        setWrong(false);
        setSeq([]);
      }, 650);
      return;
    }
    sfx.click();
    setSeq(next);
    if (next.length === config.solution.length) {
      sfx.success();
      setTimeout(onSolve, 450);
    }
  };

  return (
    <div>
      <div className={`mb-5 flex justify-center gap-2.5 ${wrong ? 'shaking' : ''}`}>
        {config.solution.map((_, i) => {
          const opt = config.options.find((o) => o.id === seq[i]);
          return (
            <div
              key={i}
              className={`flex h-12 w-12 items-center justify-center border ${
                seq[i]
                  ? 'border-teal bg-teal/15 text-teal-glow shadow-holo'
                  : wrong
                    ? 'border-red-400/60'
                    : 'border-teal/25 text-mist/25'
              }`}
            >
              {opt ? (
                <Glyph name={opt.glyph} className="h-6 w-6" />
              ) : (
                <span className="font-hud text-xs">{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {config.options.map((o) => {
          const used = seq.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              disabled={used}
              className={`flex flex-col items-center gap-1 border px-2 py-2.5 transition-all ${
                used
                  ? 'border-teal/40 bg-teal/10 text-teal opacity-50'
                  : 'border-gold/25 text-gold hover:border-gold hover:bg-gold/10'
              }`}
            >
              <Glyph name={o.glyph} className="h-7 w-7" />
              <span className="font-hud text-[0.56rem] uppercase tracking-[0.12em]">
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. DIAL / CIPHER — rotate wheels to a code
// ---------------------------------------------------------------------------
function DialEngine({ config, onSolve, onFail }: EngineProps<DialConfig>) {
  const [idx, setIdx] = useState<number[]>(config.wheels.map(() => 0));
  const [wrong, setWrong] = useState(false);

  const bump = (w: number, dir: 1 | -1) => {
    sfx.click();
    setIdx((cur) => {
      const next = [...cur];
      const n = config.wheels[w].length;
      next[w] = (next[w] + dir + n) % n;
      return next;
    });
  };

  const submit = () => {
    const val = idx.map((i, w) => config.wheels[w][i]);
    if (val.join('|') === config.code.join('|')) {
      sfx.success();
      setTimeout(onSolve, 400);
    } else {
      sfx.fail();
      onFail();
      setWrong(true);
      setTimeout(() => setWrong(false), 650);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`flex gap-3 ${wrong ? 'shaking' : ''}`}>
        {config.wheels.map((wheel, w) => (
          <div key={w} className="flex flex-col items-center gap-1.5">
            {config.wheelLabels?.[w] && (
              <span className="font-hud text-[0.55rem] uppercase tracking-[0.15em] text-mist/50">
                {config.wheelLabels[w]}
              </span>
            )}
            <button onClick={() => bump(w, 1)} className="px-4 py-0.5 font-hud text-teal hover:bg-teal/10" aria-label={`wheel ${w + 1} up`}>
              ▲
            </button>
            <div
              className={`flex h-14 min-w-[3.4rem] items-center justify-center border px-2 font-display text-xl ${
                wrong
                  ? 'border-red-400/60 text-red-300'
                  : 'border-gold/40 bg-gold/5 text-gold shadow-holo-gold'
              }`}
            >
              {wheel[idx[w]]}
            </div>
            <button onClick={() => bump(w, -1)} className="px-4 py-0.5 font-hud text-teal hover:bg-teal/10" aria-label={`wheel ${w + 1} down`}>
              ▼
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={submit}
        className="bracket mt-5 bg-gradient-to-r from-teal to-teal-glow px-7 py-2 font-hud text-xs uppercase tracking-[0.2em] text-abyss"
      >
        {config.submitLabel}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. DRAG-CONNECT / REROUTE — link left nodes to right nodes
// ---------------------------------------------------------------------------
const LINK_COLORS = ['#35e0ce', '#e0a035', '#e05ad0', '#8fe03a', '#4aa8ff'];

function ConnectEngine({ config, onSolve, onFail }: EngineProps<ConnectConfig>) {
  const [links, setLinks] = useState<Record<string, string>>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);

  const linkColor = (leftId: string) =>
    LINK_COLORS[config.left.findIndex((l) => l.id === leftId) % LINK_COLORS.length];

  const clickLeft = (id: string) => {
    sfx.click();
    setActiveLeft(id === activeLeft ? null : id);
  };
  const clickRight = (id: string) => {
    if (!activeLeft) return;
    sfx.click();
    setLinks((cur) => {
      const next = { ...cur };
      // a right node can hold only one link
      for (const k of Object.keys(next)) if (next[k] === id) delete next[k];
      next[activeLeft] = id;
      return next;
    });
    setActiveLeft(null);
  };

  const complete = Object.keys(links).length === config.left.length;

  const submit = () => {
    const ok = config.left.every((l) => links[l.id] === config.pairs[l.id]);
    if (ok) {
      sfx.success();
      setTimeout(onSolve, 400);
    } else {
      sfx.fail();
      onFail();
      setWrong(true);
      setTimeout(() => {
        setWrong(false);
        // clear only the wrong links — partial progress survives
        setLinks((cur) => {
          const next: Record<string, string> = {};
          for (const [l, r] of Object.entries(cur))
            if (config.pairs[l] === r) next[l] = r;
          return next;
        });
      }, 700);
    }
  };

  return (
    <div className={wrong ? 'shaking' : ''}>
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 font-hud text-[0.58rem] uppercase tracking-[0.2em] text-mist/50">
            {config.leftTitle}
          </div>
          <div className="space-y-2">
            {config.left.map((n) => {
              const linked = links[n.id];
              return (
                <button
                  key={n.id}
                  onClick={() => clickLeft(n.id)}
                  className={`flex w-full items-center gap-2 border px-2.5 py-2 text-left transition-all ${
                    activeLeft === n.id
                      ? 'border-gold bg-gold/15 text-gold'
                      : linked
                        ? 'text-teal-glow'
                        : 'border-teal/25 text-mist/70 hover:border-teal/60'
                  }`}
                  style={linked ? { borderColor: linkColor(n.id) } : undefined}
                >
                  {n.glyph && <Glyph name={n.glyph} className="h-5 w-5 shrink-0" />}
                  <span className="font-hud text-[0.62rem] uppercase tracking-[0.1em]">
                    {n.label}
                  </span>
                  {linked && (
                    <span
                      className="ml-auto h-2 w-2 rounded-full"
                      style={{ background: linkColor(n.id) }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-2 text-right font-hud text-[0.58rem] uppercase tracking-[0.2em] text-mist/50">
            {config.rightTitle}
          </div>
          <div className="space-y-2">
            {config.right.map((n) => {
              const linkedBy = Object.keys(links).find((l) => links[l] === n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => clickRight(n.id)}
                  className={`flex w-full items-center gap-2 border px-2.5 py-2 text-left transition-all ${
                    linkedBy
                      ? 'text-teal-glow'
                      : activeLeft
                        ? 'border-gold/60 text-gold hover:bg-gold/10'
                        : 'border-teal/25 text-mist/70'
                  }`}
                  style={linkedBy ? { borderColor: linkColor(linkedBy) } : undefined}
                >
                  {linkedBy && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: linkColor(linkedBy) }}
                    />
                  )}
                  {n.glyph && <Glyph name={n.glyph} className="h-5 w-5 shrink-0" />}
                  <span className="font-hud text-[0.62rem] uppercase tracking-[0.1em]">
                    {n.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={submit}
          disabled={!complete}
          className={`bracket px-7 py-2 font-hud text-xs uppercase tracking-[0.2em] ${
            complete
              ? 'bg-gradient-to-r from-teal to-teal-glow text-abyss'
              : 'border border-teal/20 text-mist/40'
          }`}
        >
          Energize Connections
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. SPATIAL-ARRANGE — place items into the correct slots
// ---------------------------------------------------------------------------
function ArrangeEngine({ config, onSolve, onFail }: EngineProps<ArrangeConfig>) {
  const [placed, setPlaced] = useState<Record<string, string>>({}); // slot -> item
  const [held, setHeld] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);

  const itemFor = (slotId: string) =>
    config.items.find((i) => i.id === placed[slotId]);
  const isPlaced = (itemId: string) => Object.values(placed).includes(itemId);

  const clickItem = (id: string) => {
    if (isPlaced(id)) return;
    sfx.click();
    setHeld(id === held ? null : id);
  };
  const clickSlot = (slotId: string) => {
    sfx.click();
    setPlaced((cur) => {
      const next = { ...cur };
      if (held) {
        next[slotId] = held;
      } else if (next[slotId]) {
        delete next[slotId]; // pick back up
      }
      return next;
    });
    setHeld(null);
  };

  const complete = config.slots.every((s) => placed[s.id]);

  const submit = () => {
    const ok = config.slots.every((s) => placed[s.id] === config.solution[s.id]);
    if (ok) {
      sfx.success();
      setTimeout(onSolve, 400);
    } else {
      sfx.fail();
      onFail();
      setWrong(true);
      setTimeout(() => {
        setWrong(false);
        setPlaced({});
      }, 700);
    }
  };

  return (
    <div className={wrong ? 'shaking' : ''}>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        {config.slots.map((s) => {
          const item = itemFor(s.id);
          return (
            <button
              key={s.id}
              onClick={() => clickSlot(s.id)}
              className={`flex min-h-[3.6rem] flex-col items-center justify-center border px-2 py-2 transition-all ${
                item
                  ? 'border-teal bg-teal/10 text-teal-glow'
                  : held
                    ? 'border-gold/70 text-gold/70 hover:bg-gold/10'
                    : 'border-teal/25 text-mist/40'
              } ${wrong ? 'border-red-400/60' : ''}`}
            >
              <span className="font-hud text-[0.55rem] uppercase tracking-[0.14em] text-mist/50">
                {s.label}
              </span>
              {item ? (
                <span className="mt-1 flex items-center gap-1.5">
                  <Glyph name={item.glyph} className="h-5 w-5" />
                  <span className="font-hud text-[0.62rem] uppercase">{item.label}</span>
                </span>
              ) : (
                <span className="mt-1 font-hud text-[0.6rem] text-mist/25">— empty —</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {config.items.map((i) => {
          const used = isPlaced(i.id);
          return (
            <button
              key={i.id}
              onClick={() => clickItem(i.id)}
              disabled={used}
              className={`flex items-center gap-1.5 border px-2.5 py-1.5 transition-all ${
                used
                  ? 'border-teal/20 text-mist/25'
                  : held === i.id
                    ? 'border-gold bg-gold/15 text-gold'
                    : 'border-gold/30 text-gold hover:border-gold hover:bg-gold/10'
              }`}
            >
              <Glyph name={i.glyph} className="h-5 w-5" />
              <span className="font-hud text-[0.6rem] uppercase tracking-[0.1em]">{i.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={submit}
          disabled={!complete}
          className={`bracket px-7 py-2 font-hud text-xs uppercase tracking-[0.2em] ${
            complete
              ? 'bg-gradient-to-r from-teal to-teal-glow text-abyss'
              : 'border border-teal/20 text-mist/40'
          }`}
        >
          {config.submitLabel}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. RIDDLE / TEXT-INPUT — type or select the answer
// ---------------------------------------------------------------------------
function RiddleEngine({
  config,
  onSolve,
  onFail,
  guided,
}: EngineProps<RiddleConfig> & { guided: boolean }) {
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);

  const check = (raw: string) => {
    const norm = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    const ok = config.answers.some(
      (a) => a === norm || `the ${a}` === norm || a === `the ${norm}`
    );
    if (ok) {
      sfx.success();
      setTimeout(onSolve, 400);
    } else {
      sfx.fail();
      onFail();
      setWrong(true);
      setTimeout(() => setWrong(false), 650);
    }
  };

  return (
    <div className={wrong ? 'shaking' : ''}>
      <p className="mb-4 border-l-2 border-gold/50 bg-gold/5 px-3 py-2.5 text-[0.85rem] font-light italic leading-relaxed text-bone">
        “{config.prompt}”
      </p>
      {guided && config.choices ? (
        <div className="grid grid-cols-2 gap-2">
          {config.choices.map((c) => (
            <button
              key={c}
              onClick={() => check(c)}
              className="border border-teal/30 px-3 py-2.5 font-hud text-[0.68rem] uppercase tracking-[0.12em] text-mist/85 hover:border-teal hover:bg-teal/10 hover:text-teal-glow"
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) check(value);
          }}
          className="flex gap-2"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.placeholder ?? 'Your answer…'}
            autoFocus
            className={`min-w-0 flex-1 border bg-abyss/60 px-3 py-2 font-hud text-sm text-bone outline-none placeholder:text-mist/30 ${
              wrong ? 'border-red-400/60' : 'border-teal/30 focus:border-teal'
            }`}
          />
          <button
            type="submit"
            className="bracket bg-gradient-to-r from-teal to-teal-glow px-5 py-2 font-hud text-xs uppercase tracking-[0.18em] text-abyss"
          >
            Answer
          </button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher + framed panel used by the in-world anchor focus view
// ---------------------------------------------------------------------------

export function MechanicEngine({
  anchor,
  onSolve,
  onFail,
}: {
  anchor: AnchorDef;
  onSolve: () => void;
  onFail: () => void;
}) {
  const band = useGame((s) => s.spec?.band ?? 'standard');
  const c = anchor.config;
  switch (c.kind) {
    case 'sequence':
      return <SequenceEngine config={c} onSolve={onSolve} onFail={onFail} />;
    case 'dial':
      return <DialEngine config={c} onSolve={onSolve} onFail={onFail} />;
    case 'connect':
      return <ConnectEngine config={c} onSolve={onSolve} onFail={onFail} />;
    case 'arrange':
      return <ArrangeEngine config={c} onSolve={onSolve} onFail={onFail} />;
    case 'riddle':
      return (
        <RiddleEngine
          config={c}
          onSolve={onSolve}
          onFail={onFail}
          guided={band === 'guided'}
        />
      );
  }
}

const MECHANIC_LABEL: Record<string, string> = {
  sequence: 'Sequence Engine',
  dial: 'Cipher Engine',
  connect: 'Reroute Engine',
  arrange: 'Spatial Engine',
  riddle: 'Riddle Engine',
};

export function AnchorPanel({ anchor }: { anchor: AnchorDef }) {
  const difficulty = useGame((s) => s.profile.difficulty);
  const focusAnchor = useGame((s) => s.focusAnchor);
  const completeAnchor = useGame((s) => s.completeAnchor);
  const failAttempt = useGame((s) => s.failAttempt);
  const requestHint = useGame((s) => s.requestHint);
  const spec = useGame((s) => s.spec);
  const hintsUsed = useGame((s) => s.hintsUsed[anchor.id] ?? 0);
  const easy = difficulty <= 5;
  const cap = spec?.hintCapPerAnchor ?? Infinity;
  const hintsLeft = cap === Infinity ? '∞' : Math.max(0, cap - hintsUsed);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className="holo bracket w-[380px] max-w-[92vw] p-5"
      onClick={stop}
      onPointerDown={stop}
      onKeyDown={(e) => {
        // panel owns the keyboard while open (E/WASD must not leak to the game)
        e.stopPropagation();
      }}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="eyebrow eyebrow-gold">
          {MECHANIC_LABEL[anchor.mechanic]} · D{difficulty}
        </span>
        <button
          onClick={() => focusAnchor(null)}
          className="-mt-1 px-2 font-hud text-mist/50 hover:text-mist"
          aria-label="Step back"
        >
          ✕
        </button>
      </div>
      <h3 className="font-display text-xl font-semibold leading-tight text-bone">
        {anchor.name}
      </h3>
      <p className="mt-1 text-[0.78rem] font-light text-mist/75">{anchor.objective}</p>

      <div className="mt-3 border-l-2 border-teal/50 bg-teal/5 px-3 py-2 text-[0.8rem] font-light italic leading-relaxed text-mist/90">
        {easy ? anchor.clueEasy : anchor.clueHard}
      </div>

      <div className="mt-4">
        <MechanicEngine
          anchor={anchor}
          onSolve={() => completeAnchor(anchor.id)}
          onFail={() => failAttempt(anchor.id)}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-teal/15 pt-3">
        <button
          onClick={() => requestHint()}
          className="border border-gold/40 px-3 py-1.5 font-hud text-[0.62rem] uppercase tracking-[0.18em] text-gold hover:bg-gold/10"
        >
          Ask the GM · {hintsLeft} left
        </button>
        <span className="font-hud text-[0.55rem] uppercase tracking-[0.14em] text-mist/35">
          Esc to step back
        </span>
      </div>
    </div>
  );
}
