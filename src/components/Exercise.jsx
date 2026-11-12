import { useState } from 'react';
import { Dumbbell, Repeat, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REGIONS } from '@/lib/library';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Layout';

/** Exercise demo image with a graceful fallback when the remote GIF can't load. */
export function ExerciseMedia({ exercise, className, rounded = 'rounded-2xl' }) {
  const [failed, setFailed] = useState(!exercise?.gif_url);
  return (
    <div className={cn('relative overflow-hidden bg-ink-800', rounded, className)}>
      {!failed ? (
        <img
          src={exercise.gif_url}
          alt={`${exercise.name} demonstration`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(212,255,58,.12),transparent_60%)]">
          <Dumbbell className="size-7 text-ink-500" />
        </div>
      )}
    </div>
  );
}

export const regionOf = (exercise) => REGIONS.find((r) => r.id === exercise?.region);

export function ExerciseSheet({ exercise, onClose, action }) {
  const region = regionOf(exercise);
  return (
    <Modal open={Boolean(exercise)} onClose={onClose} title={exercise?.name} wide>
      {exercise && (
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="bg-white p-4 md:rounded-l-3xl">
            <ExerciseMedia exercise={exercise} className="aspect-square w-full bg-white" rounded="rounded-xl" />
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge color={region?.hue}><Target className="size-3" />{exercise.muscle}</Badge>
              {exercise.sets && <Badge><Repeat className="size-3" />{exercise.sets} × {exercise.reps}</Badge>}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{exercise.name}</h2>
            <ol className="mt-6 space-y-4">
              {[exercise.description1, exercise.description2].filter(Boolean).map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-volt/10 font-mono text-xs font-semibold text-volt">{i + 1}</span>
                  <p className="pt-0.5 text-[15px] leading-relaxed text-ink-200">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-[13px] text-ink-300">
              <span className="font-medium text-white">Coach cue · </span>
              Control the lowering phase for 2–3 seconds, keep a neutral spine and stop 1–2 reps before form breaks.
            </div>
            {action && <div className="mt-auto pt-6">{action}</div>}
          </div>
        </div>
      )}
    </Modal>
  );
}
