import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Apple, Bot, Camera, Check, Dumbbell, Flame, Home, LayoutGrid } from 'lucide-react';
import { Ring } from '../ui/Ring';

const MESSAGES = [
  'Drop to 3 × 8 on squats today — your sleep was short.',
  'Protein is 42 g behind. A Greek yogurt bowl closes the gap.',
  'New PR on bench. Add 2.5 kg next session.',
];

/** A self-animating mock of the product, rendered in the hero. Pure UI, no data. */
export function HeroPreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3200);
    return () => clearInterval(t);
  }, []);
  const sets = [true, true, tick % 3 >= 1, tick % 3 >= 2];
  const kcal = [1460, 1720, 1985][tick % 3];

  return (
    <div className="relative rounded-[28px] border border-white/10 bg-ink-900/90 p-2 shadow-[0_40px_120px_-30px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.03)] backdrop-blur">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="ml-3 rounded-md bg-white/[0.04] px-3 py-0.5 font-mono text-[10px] text-ink-400">kinetiq / today</span>
      </div>
      <div className="grid grid-cols-[52px_1fr] gap-2 overflow-hidden rounded-[22px] border border-white/[0.06] bg-ink-950 sm:grid-cols-[150px_1fr]">
        <div className="space-y-1 border-r border-white/[0.05] p-2 sm:p-3">
          {[
            [Home, 'Today', true],
            [LayoutGrid, 'Programs'],
            [Dumbbell, 'Library'],
            [Apple, 'Fuel'],
            [Camera, 'Snap & Log'],
            [Bot, 'Coach'],
          ].map(([Icon, label, active]) => (
            <div key={label} className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-[11px] ${active ? 'bg-white/[0.07] text-white' : 'text-ink-400'}`}>
              <Icon className={`size-3.5 shrink-0 ${active ? 'text-volt' : ''}`} />
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-2 p-2 sm:grid-cols-5 sm:p-3">
          {/* Workout card */}
          <div className="surface rounded-2xl p-4 sm:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-volt/80">Today · Lower · Heavy</p>
                <p className="mt-1 text-sm font-semibold text-white">Back Squat</p>
              </div>
              <span className="rounded-full bg-volt/10 px-2 py-0.5 font-mono text-[10px] text-volt">4 × 6 @ 100 kg</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {sets.map((done, i) => (
                <motion.div
                  key={i}
                  layout
                  className={`flex h-11 items-center justify-center rounded-xl border text-[11px] font-medium ${done ? 'border-volt/40 bg-volt/15 text-volt' : 'border-white/[0.07] text-ink-400'}`}
                >
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.span key="d" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Check className="size-4" /></motion.span>
                    ) : (
                      <motion.span key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Set {i + 1}</motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex items-end gap-1">
              {[34, 48, 40, 58, 52, 66, 61, 74, 70, 84, 78, 92].map((h, i) => (
                <motion.span
                  key={i}
                  className="flex-1 rounded-t-[3px] bg-gradient-to-t from-volt/20 to-volt/70"
                  initial={{ height: 0 }}
                  animate={{ height: h * 0.5 }}
                  transition={{ delay: 0.6 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </div>
            <p className="mt-2 font-mono text-[9px] text-ink-400">Estimated 1RM · 12 weeks · +14%</p>
          </div>

          {/* Fuel ring */}
          <div className="surface flex flex-col items-center justify-center rounded-2xl p-4 sm:col-span-2">
            <Ring value={kcal} max={2450} size={108} stroke={9}>
              <div>
                <motion.p key={kcal} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-lg font-semibold text-white tabular">{kcal}</motion.p>
                <p className="text-[9px] text-ink-400">of 2,450 kcal</p>
              </div>
            </Ring>
            <div className="mt-3 flex gap-3 font-mono text-[9px] text-ink-300">
              <span><i className="mr-1 inline-block size-1.5 rounded-full bg-volt" />P 138</span>
              <span><i className="mr-1 inline-block size-1.5 rounded-full bg-sky" />C 210</span>
              <span><i className="mr-1 inline-block size-1.5 rounded-full bg-ember" />F 62</span>
            </div>
          </div>

          {/* Coach bubble */}
          <div className="surface flex items-start gap-3 rounded-2xl p-3 sm:col-span-5">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-volt text-ink-950"><Bot className="size-3.5" /></span>
            <AnimatePresence mode="wait">
              <motion.p
                key={tick % MESSAGES.length}
                initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                className="pt-1 text-[12px] text-ink-200"
              >
                {MESSAGES[tick % MESSAGES.length]}
              </motion.p>
            </AnimatePresence>
            <Flame className="ml-auto mt-1 size-3.5 shrink-0 text-ember" />
          </div>
        </div>
      </div>
    </div>
  );
}
