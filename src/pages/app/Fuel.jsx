import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Flame, PartyPopper, Sparkles, Square } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { hasTargets, useSaveMetrics } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { Card, PageHeader } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Field, Segmented, Select } from '@/components/ui/Field';
import { Ring } from '@/components/ui/Ring';

const ACTIVITY = [
  { value: 'sedentary', label: 'Sedentary — desk job, little exercise' },
  { value: 'lightly active', label: 'Light — 1–3 sessions / week' },
  { value: 'moderately active', label: 'Moderate — 3–5 sessions / week' },
  { value: 'very active', label: 'Very active — 6–7 sessions / week' },
  { value: 'extremely active', label: 'Athlete — twice daily / physical job' },
];
const GOALS = [
  { value: 'weight loss', label: 'Lose fat', short: 'lose' },
  { value: 'weight maintenance', label: 'Maintain', short: 'maintain' },
  { value: 'muscle gain', label: 'Build muscle', short: 'gain' },
];

function TargetsPanel({ user }) {
  const items = [
    ['Protein', user.dailyProteinNeeds, 4, 'var(--color-volt)'],
    ['Carbs', user.dailyCarbsNeeds, 4, 'var(--color-sky)'],
    ['Fat', user.dailyFatsNeeds, 9, 'var(--color-ember)'],
  ];
  const kcal = user.dailyCalorieNeeds;
  return (
    <Card className="relative overflow-hidden">
      <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-volt/10 blur-3xl" />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">Your daily targets</p>
      <div className="relative mt-5 flex items-center gap-6">
        <div className="grid size-28 shrink-0 place-items-center rounded-full border border-volt/30 bg-volt/[0.06] shadow-[0_0_50px_-10px_rgba(212,255,58,.45)]">
          <div className="text-center">
            <Flame className="mx-auto size-4 text-volt" />
            <motion.p key={kcal} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-2xl font-semibold text-white tabular">{kcal.toLocaleString()}</motion.p>
            <p className="text-[10px] text-ink-400">kcal / day</p>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2">
          {items.map(([label, g, k, color]) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Ring value={g * k} max={kcal} size={70} stroke={6} color={color}>
                <span className="font-mono text-[11px] text-white">{Math.round(((g * k) / kcal) * 100)}%</span>
              </Ring>
              <div className="text-center">
                <p className="font-mono text-sm font-semibold text-white tabular">{g}g</p>
                <p className="text-[11px] text-ink-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MealPlanner({ user }) {
  const goal = GOALS.find((g) => user.fitnessGoals?.includes(g.value))?.short ?? 'maintain';
  const [meals, setMeals] = useState(4);
  const [cuisine, setCuisine] = useState('');
  const [avoid, setAvoid] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  const generate = async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setText('');
    setLoading(true);
    try {
      await api.stream(
        '/api/ai/meal-plan',
        {
          calories: user.dailyCalorieNeeds, protein: user.dailyProteinNeeds, carbs: user.dailyCarbsNeeds, fats: user.dailyFatsNeeds,
          goal, diet: user.dietType, meals, cuisine: cuisine || undefined, avoid: avoid || undefined,
        },
        { onChunk: setText, signal: ctrl.signal },
      );
    } catch (e) {
      if (e.name !== 'AbortError') toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white"><Sparkles className="size-4 text-volt" />AI meal plan</h3>
          <p className="mt-1 text-sm text-ink-300">A full day of {user.dietType} meals that hits your targets.</p>
        </div>
        {text && !loading && (
          <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
            {copied ? <Check className="size-3.5 text-volt" /> : <Copy className="size-3.5" />}{copied ? 'Copied' : 'Copy'}
          </Button>
        )}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-ink-200">Meals</p>
          <Segmented size="sm" layoutId="meals" value={meals} onChange={setMeals} options={[3, 4, 5].map((n) => ({ value: n, label: String(n) }))} />
        </div>
        <Field label="Cuisine" hint="optional" placeholder="e.g. Indian, Mediterranean" value={cuisine} onChange={(e) => setCuisine(e.target.value)} maxLength={40} />
        <Field label="Avoid" hint="optional" placeholder="e.g. dairy, peanuts" value={avoid} onChange={(e) => setAvoid(e.target.value)} maxLength={200} />
        {loading ? (
          <Button variant="secondary" onClick={() => abortRef.current?.abort()}><Square className="size-3.5" />Stop</Button>
        ) : (
          <Button onClick={generate}><Sparkles className="size-4" />{text ? 'Regenerate' : 'Generate'}</Button>
        )}
      </div>

      <AnimatePresence>
        {(text || loading) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-ink-950/60 p-5 sm:p-6">
              {text ? (
                <div className="prose-k">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                  {loading && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-volt align-middle" />}
                </div>
              ) : (
                <div className="space-y-3">
                  {[80, 95, 60, 88, 70].map((w, i) => <div key={i} className="shimmer h-3 rounded-full" style={{ width: `${w}%` }} />)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function Fuel() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const onboarding = params.get('onboard') === '1';
  const save = useSaveMetrics();
  const [form, setForm] = useState(() => ({
    weight: user.weight || '',
    height: user.height || '',
    age: user.age || '',
    gender: user.gender ?? 'other',
    activityLevel: user.activityLevel ?? 'moderately active',
    dietType: user.dietType ?? 'non-vegetarian',
    goal: GOALS.find((g) => user.fitnessGoals?.includes(g.value))?.value ?? 'weight maintenance',
  }));
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));

  const submit = (e) => {
    e.preventDefault();
    const weight = Number(form.weight);
    const height = Number(form.height);
    const age = Number(form.age);
    if (!(weight >= 25 && weight <= 350)) return toast.error('Weight should be between 25 and 350 kg');
    if (!(height >= 100 && height <= 250)) return toast.error('Height should be between 100 and 250 cm');
    if (!(Number.isInteger(age) && age >= 13 && age <= 100)) return toast.error('Age should be a whole number from 13 to 100');
    save.mutate(
      { weight, height, age, gender: form.gender, activityLevel: form.activityLevel, dietType: form.dietType, fitnessGoals: [form.goal] },
      {
        onSuccess: () => {
          toast.success('Targets updated');
          if (onboarding) setParams({}, { replace: true });
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div>
      <PageHeader eyebrow="Fuel" title="Eat for your goal" description="Your calorie and macro targets, calculated from your body and training — plus AI meal plans that hit them." />

      <AnimatePresence>
        {onboarding && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="mb-6 flex items-center gap-4 rounded-2xl border border-volt/30 bg-volt/[0.06] p-4">
            <PartyPopper className="size-5 shrink-0 text-volt" />
            <p className="text-sm text-ink-100"><span className="font-semibold text-white">You’re in!</span> Fill in a few details to get your personal targets.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <p className="text-[13px] font-medium text-ink-200">Goal</p>
              <Segmented className="flex w-full" layoutId="goal" value={form.goal} onChange={set('goal')} options={GOALS} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Weight" type="number" inputMode="decimal" suffix="kg" value={form.weight} onChange={set('weight')} placeholder="72" />
              <Field label="Height" type="number" inputMode="numeric" suffix="cm" value={form.height} onChange={set('height')} placeholder="175" />
              <Field label="Age" type="number" inputMode="numeric" value={form.age} onChange={set('age')} placeholder="28" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[13px] font-medium text-ink-200">Sex <span className="font-normal text-ink-400">(for BMR)</span></p>
              <Segmented className="flex w-full" layoutId="sex" value={form.gender} onChange={set('gender')} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Prefer not to say' }]} />
            </div>
            <Select label="Activity" value={form.activityLevel} onChange={set('activityLevel')} options={ACTIVITY} />
            <div className="space-y-1.5">
              <p className="text-[13px] font-medium text-ink-200">Diet</p>
              <Segmented className="flex w-full" layoutId="diet" value={form.dietType} onChange={set('dietType')} options={[{ value: 'non-vegetarian', label: 'Omnivore' }, { value: 'vegetarian', label: 'Vegetarian' }, { value: 'vegan', label: 'Vegan' }]} />
            </div>
            <Button type="submit" className="w-full" size="lg" loading={save.isPending}>{hasTargets(user) ? 'Recalculate targets' : 'Calculate my targets'}</Button>
          </form>
        </Card>

        <div className={cn('space-y-4', !hasTargets(user) && 'opacity-90')}>
          {hasTargets(user) ? (
            <TargetsPanel user={user} />
          ) : (
            <Card className="grid min-h-64 place-items-center text-center">
              <div>
                <Ring value={0} max={1} size={110} className="mx-auto"><Flame className="size-6 text-ink-500" /></Ring>
                <p className="mt-4 text-sm text-ink-300">Your targets appear here.</p>
              </div>
            </Card>
          )}
          <Card className="text-[13px] leading-relaxed text-ink-300">
            <p className="font-medium text-white">How we calculate</p>
            <p className="mt-1">Mifflin-St Jeor BMR × activity factor, adjusted −15% to lose or +10% to build. Protein 1.6–2.2 g/kg, fat at 25% of energy, carbs fill the rest. Estimates only — not medical advice.</p>
          </Card>
        </div>

        {hasTargets(user) && <MealPlanner user={user} />}
      </div>
    </div>
  );
}
