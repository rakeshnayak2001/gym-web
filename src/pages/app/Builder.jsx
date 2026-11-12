import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AnimatePresence, Reorder } from 'motion/react';
import { ArrowLeft, GripVertical, Minus, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { EXERCISES, REGIONS, toProgramPayload } from '@/lib/library';
import { useProgram, useSaveProgram } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Spinner';
import { ExerciseMedia } from '@/components/Exercise';

let uid = 0;
const nextId = () => `k${++uid}`;
const withKeys = (days) => days.map((d) => ({ ...d, key: nextId(), exercises: d.exercises.map((e) => ({ ...e, key: nextId() })) }));

function Stepper({ value, onChange, min = 1, max = 50, label }) {
  return (
    <div className="flex items-center rounded-lg border border-white/[0.08] bg-ink-900" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid size-7 place-items-center text-ink-400 hover:text-white" aria-label={`Decrease ${label}`}><Minus className="size-3" /></button>
      <span className="w-6 text-center font-mono text-xs text-white tabular">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="grid size-7 place-items-center text-ink-400 hover:text-white" aria-label={`Increase ${label}`}><Plus className="size-3" /></button>
    </div>
  );
}

function Picker({ open, onClose, onPick, already }) {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('all');
  const list = useMemo(
    () => EXERCISES.filter((e) => (region === 'all' || e.region === region) && `${e.name} ${e.muscle}`.toLowerCase().includes(q.toLowerCase())),
    [q, region],
  );
  return (
    <Modal open={open} onClose={onClose} title="Add movements" wide>
      <div className="flex max-h-[85dvh] flex-col">
        <div className="space-y-3 border-b border-white/[0.06] p-5 pr-16">
          <h3 className="text-lg font-semibold text-white">Add movements</h3>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-10 w-full rounded-xl border border-white/[0.08] bg-ink-950 pl-9 text-sm text-white outline-none focus:border-volt/50" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {[{ id: 'all', label: 'All' }, ...REGIONS].map((r) => (
              <button key={r.id} onClick={() => setRegion(r.id)} className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-medium transition', region === r.id ? 'bg-volt text-ink-950' : 'bg-white/[0.04] text-ink-300 hover:text-white')}>{r.label}</button>
            ))}
          </div>
        </div>
        <div className="grid flex-1 gap-2 overflow-y-auto p-5 sm:grid-cols-2">
          {list.map((e) => {
            const count = already.filter((id) => id === e.id).length;
            return (
              <button key={e.id} onClick={() => onPick(e)} className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] p-2 pr-3 text-left transition hover:border-volt/40 hover:bg-volt/[0.04]">
                <div className="rounded-lg bg-white p-0.5"><ExerciseMedia exercise={e} className="size-12 bg-white" rounded="rounded-md" /></div>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{e.name}</span>
                  <span className="block text-xs text-ink-400">{e.muscle}</span>
                </span>
                {count > 0 ? (
                  <span className="rounded-md bg-volt/15 px-1.5 py-0.5 font-mono text-[10px] text-volt">×{count}</span>
                ) : (
                  <Plus className="size-4 text-ink-500 group-hover:text-volt" />
                )}
              </button>
            );
          })}
        </div>
        <div className="border-t border-white/[0.06] p-4 text-right"><Button onClick={onClose}>Done</Button></div>
      </div>
    </Modal>
  );
}

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useProgram(id);
  const save = useSaveProgram();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState(() => withKeys([{ name: 'Day 1', exercises: [] }]));
  const [active, setActive] = useState(0);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (existing.data) {
      setName(existing.data.name);
      setDescription(existing.data.description ?? '');
      setDays(withKeys(existing.data.days));
    }
  }, [existing.data]);

  if (id && existing.isPending) return <Skeleton className="h-96" />;

  const day = days[active];
  const patchDay = (fn) => setDays((ds) => ds.map((d, i) => (i === active ? fn(d) : d)));
  const addDay = () => {
    if (days.length >= 7) return toast('A program can have up to 7 days');
    setDays((ds) => [...ds, { key: nextId(), name: `Day ${ds.length + 1}`, exercises: [] }]);
    setActive(days.length);
  };
  const removeDay = (i) => {
    if (days.length === 1) return;
    setDays((ds) => ds.filter((_, j) => j !== i));
    setActive((a) => Math.max(0, a >= i ? a - 1 : a));
  };

  const submit = () => {
    if (name.trim().length < 3) return toast.error('Give your program a name (3+ characters)');
    if (days.some((d) => !d.exercises.length)) return toast.error('Every day needs at least one movement');
    save.mutate(
      { id, payload: toProgramPayload({ name: name.trim(), description: description.trim(), days }) },
      {
        onSuccess: (p) => {
          toast.success(id ? 'Program updated' : 'Program created');
          navigate(`/app/programs/${p._id}`);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const totalMoves = days.reduce((n, d) => n + d.exercises.length, 0);

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-ink-400 transition hover:text-white"><ArrowLeft className="size-4" />Back</button>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-volt/80">Program builder</p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-white">{id ? 'Edit program' : 'Build your week'}</h1>
        </div>
        <Button onClick={submit} loading={save.isPending} size="lg"><Save className="size-4" />{id ? 'Save changes' : 'Create program'}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="surface space-y-4 rounded-3xl p-5">
            <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Shred" maxLength={60} />
            <Field label="Description" hint="optional" as="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this program for?" maxLength={240} />
          </div>
          <div className="surface rounded-3xl p-3">
            <p className="px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">Days · {totalMoves} movements</p>
            <ul className="space-y-1">
              {days.map((d, i) => (
                <li key={d.key}>
                  <button
                    onClick={() => setActive(i)}
                    className={cn('group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition', i === active ? 'bg-white/[0.07] ring-1 ring-white/10' : 'hover:bg-white/[0.03]')}
                  >
                    <span className={cn('grid size-7 place-items-center rounded-lg font-mono text-[11px] font-semibold', i === active ? 'bg-volt text-ink-950' : 'bg-white/[0.05] text-ink-300')}>{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{d.name || 'Untitled'}</span>
                      <span className="block text-xs text-ink-400">{d.exercises.length} movements</span>
                    </span>
                    {days.length > 1 && (
                      <span role="button" tabIndex={0} aria-label={`Remove ${d.name}`} onClick={(e) => { e.stopPropagation(); removeDay(i); }} className="grid size-7 place-items-center rounded-lg text-ink-500 opacity-0 hover:text-rose group-hover:opacity-100">
                        <X className="size-3.5" />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={addDay} disabled={days.length >= 7} className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-2.5 text-sm text-ink-300 transition hover:border-volt/40 hover:text-volt disabled:opacity-40">
              <Plus className="size-4" />Add day
            </button>
          </div>
        </div>

        <div className="surface rounded-3xl p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <input
              value={day.name}
              onChange={(e) => patchDay((d) => ({ ...d, name: e.target.value.slice(0, 40) }))}
              className="min-w-0 flex-1 rounded-lg bg-transparent text-xl font-semibold text-white outline-none focus:bg-white/[0.03]"
              aria-label="Day name"
            />
            <Button size="sm" onClick={() => setPicking(true)}><Plus className="size-3.5" />Add movements</Button>
          </div>

          {day.exercises.length === 0 ? (
            <button onClick={() => setPicking(true)} className="grid w-full place-items-center rounded-2xl border border-dashed border-white/10 py-16 text-center transition hover:border-volt/40">
              <span className="mb-3 grid size-11 place-items-center rounded-2xl bg-volt/10 text-volt"><Plus className="size-5" /></span>
              <span className="text-sm font-medium text-white">Add your first movement</span>
              <span className="mt-1 text-xs text-ink-400">Pick from the library of {EXERCISES.length}</span>
            </button>
          ) : (
            <Reorder.Group axis="y" values={day.exercises} onReorder={(list) => patchDay((d) => ({ ...d, exercises: list }))} className="space-y-2">
              <AnimatePresence initial={false}>
                {day.exercises.map((e) => (
                  <Reorder.Item
                    key={e.key}
                    value={e}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileDrag={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(0,0,0,.6)' }}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-ink-900 p-2 pr-3"
                  >
                    <GripVertical className="size-4 shrink-0 cursor-grab text-ink-500 active:cursor-grabbing" />
                    <div className="shrink-0 rounded-lg bg-white p-0.5"><ExerciseMedia exercise={e} className="size-11 bg-white" rounded="rounded-md" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{e.name}</p>
                      <p className="text-xs text-ink-400">{e.muscle}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Stepper label="sets" value={e.sets} max={10} onChange={(v) => patchDay((d) => ({ ...d, exercises: d.exercises.map((x) => (x.key === e.key ? { ...x, sets: v } : x)) }))} />
                      <span className="text-xs text-ink-500">×</span>
                      <Stepper label="reps" value={e.reps} max={50} onChange={(v) => patchDay((d) => ({ ...d, exercises: d.exercises.map((x) => (x.key === e.key ? { ...x, reps: v } : x)) }))} />
                    </div>
                    <button aria-label={`Remove ${e.name}`} onClick={() => patchDay((d) => ({ ...d, exercises: d.exercises.filter((x) => x.key !== e.key) }))} className="grid size-8 place-items-center rounded-lg text-ink-500 transition hover:bg-rose/10 hover:text-rose">
                      <Trash2 className="size-4" />
                    </button>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </div>
      </div>

      <Picker
        open={picking}
        onClose={() => setPicking(false)}
        already={day.exercises.map((e) => e.id)}
        onPick={(e) => {
          if (day.exercises.length >= 30) return toast('Max 30 movements per day');
          patchDay((d) => ({ ...d, exercises: [...d.exercises, { ...e, sets: 3, reps: 10, key: nextId() }] }));
          toast.success(`${e.name} added`, { duration: 1200 });
        }}
      />
    </div>
  );
}
