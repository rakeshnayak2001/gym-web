import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Check, Lightbulb, PenLine, ScanLine, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useLogMeal } from '@/lib/queries';
import { isoDay, round } from '@/lib/utils';
import { Badge, Card, PageHeader } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Field, Segmented } from '@/components/ui/Field';
import { PhotoInput } from '@/components/PhotoInput';

const MEAL_TIMES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const guessMealTime = () => {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
};

const EMPTY = { foodName: '', calories: '', protein: '', carbs: '', fats: '' };

export default function Scan() {
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [meal, setMeal] = useState(EMPTY);
  const [mealTime, setMealTime] = useState(guessMealTime);
  const log = useLogMeal();

  const analyze = async () => {
    if (!photo) return;
    setScanning(true);
    setResult(null);
    try {
      const r = await api.post('/api/ai/food-scan', { image: { data: photo.data, mimeType: photo.mimeType }, note: note || undefined });
      setResult(r);
      if (r.isFood) setMeal({ foodName: r.foodName, calories: round(r.calories), protein: round(r.protein), carbs: round(r.carbs), fats: round(r.fats) });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setScanning(false);
    }
  };

  const set = (k) => (e) => setMeal((m) => ({ ...m, [k]: e.target.value }));
  const canLog = meal.foodName.trim() && meal.calories !== '';

  const submit = () => {
    const payload = {
      foodName: meal.foodName.trim(),
      calories: Number(meal.calories) || 0,
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fats: Number(meal.fats) || 0,
      mealTime,
    };
    log.mutate(
      { date: isoDay(), meal: payload },
      {
        onSuccess: () => {
          toast.success(`Logged ${payload.foodName}`, { description: `${payload.calories} kcal added to ${mealTime}` });
          setPhoto(null);
          setResult(null);
          setMeal(EMPTY);
          setNote('');
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div>
      <PageHeader eyebrow="Snap & Log" title="Photo in, macros out" description="Snap your plate and Kinetiq estimates the food, portion and macros. Review, tweak and log in one tap." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative">
            <PhotoInput value={photo} onChange={(p) => { setPhoto(p); setResult(null); }} className="aspect-[4/3]" label="Drop a meal photo, upload one, or open your camera" />
            <AnimatePresence>
              {scanning && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-ink-950/30" />
                  <motion.div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-volt/35 to-transparent" animate={{ top: ['-20%', '100%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur">
                    <ScanLine className="size-3.5 text-volt" />Analyzing your plate…
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {photo && !result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Add context (optional) — e.g. “cooked in olive oil”" className="h-12 min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-ink-900 px-4 text-sm text-white outline-none placeholder:text-ink-400 focus:border-volt/50" />
              <Button size="lg" onClick={analyze} loading={scanning}><Sparkles className="size-4" />Analyze</Button>
            </motion.div>
          )}
        </div>

        <Card>
          <AnimatePresence mode="wait">
            {result && !result.isFood ? (
              <motion.div key="nf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 rounded-2xl border border-ember/30 bg-ember/[0.06] p-4">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-ember" />
                <p className="text-sm text-ink-100">That doesn’t look like food. Try another photo, or enter the meal manually below.</p>
              </motion.div>
            ) : result ? (
              <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color="var(--color-volt)"><Check className="size-3" />Detected</Badge>
                  <Badge color={result.confidence === 'high' ? 'var(--color-volt)' : result.confidence === 'medium' ? 'var(--color-sky)' : 'var(--color-ember)'}>{result.confidence} confidence</Badge>
                  {result.portion && <Badge>{result.portion}</Badge>}
                </div>
                {result.items?.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {result.items.map((it, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex justify-between text-sm">
                        <span className="text-ink-200">{it.name}</span>
                        <span className="font-mono text-ink-400">{round(it.calories)} kcal</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
                {result.tip && (
                  <p className="mt-4 flex gap-2 rounded-xl bg-white/[0.03] p-3 text-[13px] text-ink-300"><Lightbulb className="size-4 shrink-0 text-volt" />{result.tip}</p>
                )}
              </motion.div>
            ) : (
              <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-ink-300">
                <PenLine className="size-4 text-ink-400" />Analyze a photo — or type the meal in yourself.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 space-y-4 border-t border-white/[0.06] pt-6">
            <Field label="Food" placeholder="e.g. Chicken burrito bowl" value={meal.foodName} onChange={set('foodName')} maxLength={120} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Calories" type="number" min="0" inputMode="numeric" suffix="kcal" value={meal.calories} onChange={set('calories')} />
              <Field label="Protein" type="number" min="0" inputMode="numeric" suffix="g" value={meal.protein} onChange={set('protein')} />
              <Field label="Carbs" type="number" min="0" inputMode="numeric" suffix="g" value={meal.carbs} onChange={set('carbs')} />
              <Field label="Fat" type="number" min="0" inputMode="numeric" suffix="g" value={meal.fats} onChange={set('fats')} />
            </div>
            <Segmented className="flex w-full" layoutId="mealtime" value={mealTime} onChange={setMealTime} options={MEAL_TIMES} />
            <Button size="lg" className="w-full" disabled={!canLog} loading={log.isPending} onClick={submit}>
              <Check className="size-4" />Log to today
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
