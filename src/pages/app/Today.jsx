import { useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Bot, Camera, ChevronRight, LayoutGrid, MapPin, Plus, Sparkles, Trash2, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { hasTargets, useDeleteMeal, useLogs, usePrograms } from '@/lib/queries';
import { formatDay, greeting, isoDay, round, shiftDay } from '@/lib/utils';
import { Card, EmptyState, Rise, Stagger } from '@/components/ui/Layout';
import { MacroBar, Ring } from '@/components/ui/Ring';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';

const MACROS = [
  ['protein', 'Protein', 'var(--color-volt)', 'dailyProteinNeeds'],
  ['carbs', 'Carbs', 'var(--color-sky)', 'dailyCarbsNeeds'],
  ['fats', 'Fat', 'var(--color-ember)', 'dailyFatsNeeds'],
];

function FuelCard({ user, log, loading }) {
  const totals = log?.dailyTotals ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const target = user.dailyCalorieNeeds;
  const left = Math.max(0, target - totals.calories);

  if (!hasTargets(user)) {
    return (
      <Card className="relative overflow-hidden lg:col-span-2">
        <div aria-hidden className="absolute -right-10 -top-10 size-48 rounded-full bg-volt/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Ring value={0} max={1} size={120}><Sparkles className="size-6 text-volt" /></Ring>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Unlock your daily targets</h3>
            <p className="mt-1 text-sm text-ink-300">Add your height, weight and goal — Kinetiq calculates calories and macros for you in seconds.</p>
            <Button to="/app/fuel" className="mt-4">Set up Fuel <ArrowRight className="size-4" /></Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">Fuel · today</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{left > 0 ? `${round(left).toLocaleString()} kcal to go` : 'Target reached'}</h3>
        </div>
        <Button to="/app/scan" size="sm" variant="secondary"><Camera className="size-3.5" />Snap a meal</Button>
      </div>
      <div className="mt-6 grid items-center gap-8 sm:grid-cols-[auto_1fr]">
        {loading ? (
          <Skeleton className="mx-auto size-40 rounded-full" />
        ) : (
          <Ring value={totals.calories} max={target} size={164} stroke={14} className="mx-auto">
            <div>
              <p className="font-mono text-3xl font-semibold tracking-tight text-white tabular">{round(totals.calories).toLocaleString()}</p>
              <p className="text-xs text-ink-400">of {target.toLocaleString()} kcal</p>
            </div>
          </Ring>
        )}
        <div className="space-y-5">
          {MACROS.map(([key, label, color, targetKey]) => (
            <MacroBar key={key} label={label} value={totals[key]} target={user[targetKey]} color={color} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function WeekStrip({ user }) {
  const today = isoDay();
  const from = shiftDay(today, -6);
  const { data: logs = [] } = useLogs(from, today);
  const days = useMemo(() => {
    const byDay = new Map(logs.map((l) => [l.date.slice(0, 10), l.dailyTotals.calories]));
    return Array.from({ length: 7 }, (_, i) => {
      const d = shiftDay(from, i);
      return { d, kcal: byDay.get(d) ?? 0 };
    });
  }, [logs, from]);
  const max = Math.max(user.dailyCalorieNeeds || 0, ...days.map((d) => d.kcal), 1);
  const logged = days.filter((d) => d.kcal > 0).length;

  return (
    <Card>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">Last 7 days</p>
      <h3 className="mt-1 text-lg font-semibold text-white">{logged} / 7 days logged</h3>
      <div className="mt-6 flex h-32 items-end gap-2">
        {days.map(({ d, kcal }, i) => (
          <div key={d} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-24 w-full items-end overflow-hidden rounded-lg bg-white/[0.03]">
              {user.dailyCalorieNeeds > 0 && (
                <span className="absolute inset-x-0 border-t border-dashed border-white/15" style={{ bottom: `${(user.dailyCalorieNeeds / max) * 100}%` }} />
              )}
              <motion.span
                className={`w-full rounded-lg ${d === today ? 'bg-volt' : 'bg-volt/35'}`}
                initial={{ height: 0 }}
                animate={{ height: `${(kcal / max) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                title={`${round(kcal)} kcal`}
              />
            </div>
            <span className={`font-mono text-[10px] ${d === today ? 'text-volt' : 'text-ink-400'}`}>{formatDay(d, { weekday: 'narrow' })}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MealsCard({ log, loading }) {
  const del = useDeleteMeal();
  const meals = log?.meals ?? [];
  return (
    <Card className="lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Meals today</h3>
        <Link to="/app/scan" className="flex items-center gap-1 text-[13px] text-volt hover:underline"><Plus className="size-3.5" />Add</Link>
      </div>
      {loading ? (
        <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
      ) : meals.length === 0 ? (
        <EmptyState icon={Utensils} title="Nothing logged yet" description="Snap a photo of your next meal and Kinetiq fills in the macros." action={<Button to="/app/scan" size="sm"><Camera className="size-3.5" />Snap & Log</Button>} />
      ) : (
        <ul className="divide-y divide-white/[0.05]">
          {meals.map((m) => (
            <motion.li layout key={m._id} className="group flex items-center gap-4 py-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white/[0.04] font-mono text-[10px] uppercase text-ink-300">{m.mealTime.slice(0, 3)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{m.foodName}</p>
                <p className="font-mono text-xs text-ink-400">P {round(m.protein)} · C {round(m.carbs)} · F {round(m.fats)}</p>
              </div>
              <span className="font-mono text-sm text-white tabular">{round(m.calories)}<span className="text-ink-400"> kcal</span></span>
              <button
                aria-label={`Remove ${m.foodName}`}
                onClick={() => del.mutate({ logId: log._id, mealId: m._id }, { onSuccess: () => toast('Meal removed') })}
                className="grid size-8 place-items-center rounded-lg text-ink-500 opacity-0 transition hover:bg-rose/10 hover:text-rose group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="size-4" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ProgramsCard() {
  const { data: programs, isPending } = usePrograms();
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Your programs</h3>
        <Link to="/app/programs" className="text-[13px] text-ink-300 hover:text-white">All</Link>
      </div>
      {isPending ? (
        <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
      ) : programs?.length ? (
        <ul className="space-y-2">
          {programs.slice(0, 4).map((p) => (
            <li key={p._id}>
              <Link to={`/app/programs/${p._id}`} className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] p-3 transition hover:border-white/15 hover:bg-white/[0.03]">
                <span className="grid size-10 place-items-center rounded-xl bg-volt/10 font-mono text-xs font-semibold text-volt">{p.days.length}d</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{p.name}</span>
                  <span className="block text-xs text-ink-400">{p.days.reduce((n, d) => n + d.exercises.length, 0)} movements</span>
                </span>
                <ChevronRight className="size-4 text-ink-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink-300">No saved programs yet. Start from a proven template.</p>
          <Button to="/app/programs" variant="secondary" size="sm"><LayoutGrid className="size-3.5" />Browse programs</Button>
        </div>
      )}
    </Card>
  );
}

const QUICK = [
  { to: '/app/coach', icon: Bot, title: 'Ask the coach', body: 'Form checks, plateaus, recovery.' },
  { to: '/app/builder', icon: Plus, title: 'Build a program', body: 'Your days, your movements.' },
  { to: '/app/gyms', icon: MapPin, title: 'Find a gym', body: 'Open map data near you.' },
];

export default function Today() {
  const { user } = useAuth();
  const today = isoDay();
  const { data: logs, isPending } = useLogs(today);
  const log = logs?.[0];

  return (
    <Stagger className="space-y-6">
      <Rise className="flex flex-col gap-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-volt/80">{formatDay(today)}</p>
        <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-white sm:text-[38px]">
          {greeting()}, {user.name.split(' ')[0]}.
        </h1>
      </Rise>

      <div className="grid gap-4 lg:grid-cols-3">
        <Rise className="lg:col-span-2"><FuelCard user={user} log={log} loading={isPending} /></Rise>
        <Rise><WeekStrip user={user} /></Rise>
        <Rise className="lg:col-span-2"><MealsCard log={log} loading={isPending} /></Rise>
        <Rise><ProgramsCard /></Rise>
      </div>

      <Rise className="grid gap-4 sm:grid-cols-3">
        {QUICK.map(({ to, icon: Icon, title, body }) => (
          <Link key={to} to={to} className="surface group flex items-center gap-4 rounded-3xl p-5 transition hover:-translate-y-0.5 hover:border-white/15">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/[0.05] text-volt transition group-hover:bg-volt group-hover:text-ink-950"><Icon className="size-5" /></span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-white">{title}</span>
              <span className="block text-xs text-ink-400">{body}</span>
            </span>
            <ArrowUpRight className="size-4 text-ink-500 transition group-hover:text-white" />
          </Link>
        ))}
      </Rise>
    </Stagger>
  );
}
