import { useDeferredValue, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { EXERCISES, REGIONS, findExercise } from '@/lib/library';
import { cn } from '@/lib/utils';
import { PageHeader, EmptyState } from '@/components/ui/Layout';
import { ExerciseMedia, ExerciseSheet, regionOf } from '@/components/Exercise';
import { Button } from '@/components/ui/Button';

export default function Library() {
  const [params, setParams] = useSearchParams();
  const region = params.get('region') ?? 'all';
  const q = params.get('q') ?? '';
  const deferredQ = useDeferredValue(q);
  const selected = findExercise(params.get('move'));

  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const term = deferredQ.trim().toLowerCase();
    return EXERCISES.filter(
      (e) => (region === 'all' || e.region === region) && (!term || `${e.name} ${e.muscle}`.toLowerCase().includes(term)),
    );
  }, [region, deferredQ]);

  const counts = useMemo(() => Object.fromEntries(REGIONS.map((r) => [r.id, EXERCISES.filter((e) => e.region === r.id).length])), []);

  return (
    <div>
      <PageHeader eyebrow="Library" title="Movement library" description={`${EXERCISES.length} guided movements with demos and step-by-step cues.`} />

      <div className="sticky top-14 z-20 -mx-4 mb-6 space-y-3 bg-ink-950/85 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:top-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search movements or muscles…"
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-ink-900 pl-10 pr-10 text-sm text-white outline-none placeholder:text-ink-400 focus:border-volt/50"
          />
          {q && (
            <button onClick={() => update({ q: '' })} aria-label="Clear search" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-400 hover:text-white">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {[{ id: 'all', label: 'All', hue: 'var(--color-volt)' }, ...REGIONS].map((r) => {
            const active = region === r.id;
            return (
              <button
                key={r.id}
                onClick={() => update({ region: r.id === 'all' ? '' : r.id })}
                className={cn('relative shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition', active ? 'border-transparent text-ink-950' : 'border-white/[0.08] text-ink-300 hover:text-white')}
              >
                {active && <motion.span layoutId="region-pill" className="absolute inset-0 rounded-full bg-volt" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />}
                <span className="relative">
                  {r.label}
                  <span className="ml-1.5 font-mono text-[11px] opacity-60">{r.id === 'all' ? EXERCISES.length : counts[r.id]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Search} title="No movements found" description={`Nothing matches “${q}”. Try a muscle like “glutes” or “triceps”.`} action={<Button variant="secondary" size="sm" onClick={() => update({ q: '', region: '' })}>Reset filters</Button>} />
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((e, i) => {
              const r = regionOf(e);
              return (
                <motion.button
                  layout
                  key={e.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i * 0.02, 0.3) } }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  onClick={() => update({ move: e.id })}
                  className="surface group overflow-hidden rounded-3xl text-left transition hover:-translate-y-1 hover:border-white/15"
                >
                  <div className="bg-white p-2">
                    <ExerciseMedia exercise={e} className="aspect-[4/3] w-full bg-white transition duration-500 group-hover:scale-[1.03]" rounded="rounded-xl" />
                  </div>
                  <div className="p-4">
                    <p className="truncate text-sm font-semibold text-white">{e.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
                      <span className="size-1.5 rounded-full" style={{ background: r?.hue }} />
                      {e.muscle}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <ExerciseSheet exercise={selected} onClose={() => update({ move: '' })} />
    </div>
  );
}
