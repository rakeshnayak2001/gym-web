import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, BookmarkPlus, Check, Copy, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { findExercise, findProgram, toProgramPayload } from '@/lib/library';
import { useProgram, useSaveProgram } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { Badge, EmptyState } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { ExerciseMedia, ExerciseSheet } from '@/components/Exercise';

export default function ProgramView() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const template = slug ? findProgram(slug) : null;
  const saved = useProgram(id);
  const program = template ?? saved.data;
  const save = useSaveProgram();
  const [dayIdx, setDayIdx] = useState(0);
  const [open, setOpen] = useState(null);
  const [done, setDone] = useState({});

  if (id && saved.isPending) return <div className="space-y-4"><Skeleton className="h-12 w-72" /><Skeleton className="h-96" /></div>;
  if (!program) return <EmptyState title="Program not found" description="It may have been deleted." action={<Button to="/app/programs" variant="secondary">Back to programs</Button>} />;

  const day = program.days[Math.min(dayIdx, program.days.length - 1)];
  const key = (i) => `${dayIdx}:${i}`;
  const completed = day.exercises.filter((_, i) => done[key(i)]).length;

  const saveTemplate = () =>
    save.mutate(
      { payload: toProgramPayload({ name: program.name, description: program.tagline, days: program.days }) },
      {
        onSuccess: (p) => {
          toast.success('Saved to My programs', { action: { label: 'Customize', onClick: () => navigate(`/app/builder/${p._id}`) } });
        },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <div>
      <button onClick={() => navigate('/app/programs')} className="mb-6 flex items-center gap-2 text-sm text-ink-400 transition hover:text-white">
        <ArrowLeft className="size-4" /> Programs
      </button>

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            {template ? (
              <>
                <Badge color={template.accent}>{template.level}</Badge>
                <Badge>{template.perWeek}× / week</Badge>
                <Badge>~{template.minutes} min</Badge>
              </>
            ) : (
              <Badge color="var(--color-volt)">Custom</Badge>
            )}
          </div>
          <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-white sm:text-[40px]">{program.name}</h1>
          <p className="mt-1 max-w-xl text-ink-300">{template?.tagline ?? program.description}</p>
        </div>
        <div className="flex gap-2">
          {template ? (
            <Button onClick={saveTemplate} loading={save.isPending}><BookmarkPlus className="size-4" />Save to my programs</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => save.mutate({ payload: toProgramPayload({ ...program, name: `${program.name} (copy)`.slice(0, 60) }) }, { onSuccess: () => toast.success('Duplicated') })}><Copy className="size-4" />Duplicate</Button>
              <Button to={`/app/builder/${program._id}`}><Pencil className="size-4" />Edit</Button>
            </>
          )}
        </div>
      </div>

      {/* Day tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {program.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setDayIdx(i)}
            className={cn('relative shrink-0 rounded-2xl border px-4 py-2.5 text-left transition', i === dayIdx ? 'border-transparent' : 'border-white/[0.07] hover:border-white/15')}
          >
            {i === dayIdx && <motion.span layoutId="day-tab" className="absolute inset-0 rounded-2xl bg-volt" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />}
            <span className={cn('relative block font-mono text-[10px] uppercase tracking-wider', i === dayIdx ? 'text-ink-950/70' : 'text-ink-500')}>Day {i + 1}</span>
            <span className={cn('relative block text-sm font-semibold', i === dayIdx ? 'text-ink-950' : 'text-white')}>{d.name}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-300">{day.focus ?? `${day.exercises.length} movements`}</p>
        <p className="font-mono text-xs text-ink-400">{completed}/{day.exercises.length} done</p>
      </div>
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div className="h-full bg-volt" animate={{ width: `${(completed / Math.max(1, day.exercises.length)) * 100}%` }} transition={{ type: 'spring', bounce: 0, duration: 0.6 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.ol key={dayIdx} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="space-y-2.5">
          {day.exercises.map((e, i) => {
            const isDone = done[key(i)];
            const full = { ...findExercise(e.id), ...e };
            return (
              <li key={`${e.id}-${i}`} className={cn('surface flex items-center gap-4 rounded-2xl p-3 pr-4 transition', isDone && 'opacity-60')}>
                <button onClick={() => setOpen(full)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                  <div className="shrink-0 rounded-xl bg-white p-1"><ExerciseMedia exercise={full} className="size-14 bg-white sm:size-16" rounded="rounded-lg" /></div>
                  <div className="min-w-0">
                    <p className={cn('truncate font-semibold text-white', isDone && 'line-through decoration-volt/60')}>{e.name}</p>
                    <p className="text-xs text-ink-400">{e.muscle}</p>
                  </div>
                </button>
                <span className="hidden font-mono text-sm text-ink-200 sm:block">{e.sets ?? 3} × {e.reps ?? 10}</span>
                <button
                  aria-label={isDone ? 'Mark not done' : 'Mark done'}
                  onClick={() => setDone((d) => ({ ...d, [key(i)]: !d[key(i)] }))}
                  className={cn('grid size-9 shrink-0 place-items-center rounded-xl border transition', isDone ? 'border-volt bg-volt text-ink-950' : 'border-white/10 text-ink-500 hover:border-volt/50 hover:text-volt')}
                >
                  <Check className="size-4" />
                </button>
              </li>
            );
          })}
        </motion.ol>
      </AnimatePresence>

      <ExerciseSheet exercise={open} onClose={() => setOpen(null)} />
    </div>
  );
}
