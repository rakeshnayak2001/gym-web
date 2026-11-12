import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import Lenis from 'lenis';
import {
  AnimatePresence, motion, useInView, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform, animate,
} from 'motion/react';
import {
  ArrowRight, ArrowUpRight, Bot, Camera, Check, ChevronDown, Dumbbell, LayoutGrid, MapPin, Menu, ScanLine, Sparkles, X, Zap,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Ring } from '@/components/ui/Ring';
import { HeroPreview } from '@/components/marketing/HeroPreview';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1];

function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 } });
    let id;
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);
}

/* ───────────────────────────── Nav ───────────────────────────── */

const LINKS = [
  ['Features', '#features'],
  ['How it works', '#how'],
  ['Pricing', '#pricing'],
  ['FAQ', '#faq'],
];

function Nav() {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => scrollY.on('change', (y) => setScrolled(y > 24)), [scrollY]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        className={cn(
          'flex w-full max-w-5xl items-center justify-between rounded-2xl px-3 py-2 transition-all duration-500',
          scrolled ? 'glass shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)]' : 'border border-transparent',
        )}
      >
        <Link to="/" className="px-2"><Logo /></Link>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="rounded-lg px-3 py-1.5 text-[13.5px] text-ink-300 transition hover:bg-white/5 hover:text-white">{label}</a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button to="/app" size="sm">Open app <ArrowRight className="size-3.5" /></Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">Sign in</Button>
              <Button to="/signup" size="sm">Start free</Button>
            </>
          )}
        </div>
        <button className="grid size-9 place-items-center rounded-xl text-white md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass absolute inset-x-4 top-[72px] rounded-2xl p-3 md:hidden"
          >
            {LINKS.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-ink-200 hover:bg-white/5">{label}</a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button to="/login" variant="secondary">Sign in</Button>
              <Button to="/signup">Start free</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

const WORDS = ['intent', 'precision', 'momentum'];

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setW((n) => (n + 1) % WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);

  // spotlight that follows the cursor
  const mx = useMotionValue(50);
  const my = useMotionValue(20);
  const bg = useMotionTemplate`radial-gradient(600px circle at ${mx}% ${my}%, rgba(212,255,58,0.10), transparent 60%)`;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden pt-36 sm:pt-44"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]" />
      <motion.div aria-hidden className="absolute inset-0" style={{ background: bg }} />
      <div aria-hidden className="absolute left-1/2 top-24 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-volt/[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-5 text-center">
        <motion.a
          href="#features"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="group mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 text-[12.5px] text-ink-200 backdrop-blur transition hover:border-volt/40"
        >
          <span className="rounded-full bg-volt px-2 py-0.5 text-[11px] font-semibold text-ink-950">New</span>
          Coach now sees your equipment and your plate
          <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </motion.a>

        <motion.h1
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease, delay: 0.15 }}
          className="mx-auto mt-7 max-w-4xl text-balance text-[44px] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-[76px]"
        >
          Train with{' '}
          <span className="relative inline-grid">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={WORDS[w]}
                initial={{ y: '60%', opacity: 0, filter: 'blur(6px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: '-60%', opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.55, ease }}
                className="text-gradient col-start-1 row-start-1"
              >
                {WORDS[w]}.
              </motion.span>
            </AnimatePresence>
          </span>
          <br />
          <span className="text-ink-300">Progress on autopilot.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl text-balance text-[17px] leading-relaxed text-ink-300"
        >
          Kinetiq is the training OS that builds your program, sets your macros, logs meals from a photo and
          coaches every rep — in one fast, focused app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.42 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button to="/signup" size="lg" className="w-full sm:w-auto">
            Start training free <ArrowRight className="size-4" />
          </Button>
          <Button href="#how" variant="secondary" size="lg" className="w-full sm:w-auto">See how it works</Button>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-4 text-xs text-ink-400">
          Free forever plan · No card required
        </motion.p>
      </div>

      <motion.div style={{ rotateX, scale, y, transformPerspective: 1400 }} className="relative mx-auto mt-16 max-w-5xl origin-top px-4 sm:mt-20">
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease, delay: 0.45 }}>
          <HeroPreview />
        </motion.div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-1 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </motion.div>
    </section>
  );
}

/* ───────────────────────────── Marquee ───────────────────────────── */

const DISCIPLINES = ['Powerlifting', 'Hypertrophy', 'Hybrid training', 'Calisthenics', 'Running', 'Mobility', 'Cutting', 'Bulking', 'Recomp', 'Home gym', 'CrossTraining', 'Climbing'];

function Marquee() {
  return (
    <section className="border-y border-white/[0.05] py-7">
      <p className="mb-5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">Built for every way you train</p>
      <div className="mask-fade-x flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee gap-3 pr-3 hover:[animation-play-state:paused]">
          {[...DISCIPLINES, ...DISCIPLINES].map((d, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap rounded-full border border-white/[0.07] px-4 py-2 text-sm text-ink-300">
              <Zap className="size-3.5 text-volt/70" />{d}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Bento features ───────────────────────────── */

function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-volt/80">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-[34px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-balance text-[16px] text-ink-300">{sub}</p>}
    </Reveal>
  );
}

function Tile({ className, icon: Icon, title, body, children, delay }) {
  const ref = useRef(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const glow = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, rgba(212,255,58,0.08), transparent 70%)`;
  return (
    <Reveal delay={delay} className={className}>
      <div
        ref={ref}
        onPointerMove={(e) => {
          const r = ref.current.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onPointerLeave={() => { mx.set(-200); my.set(-200); }}
        className="surface group relative flex h-full flex-col overflow-hidden rounded-[28px] p-6 sm:p-7"
      >
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glow }} />
        <div className="relative flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-volt/10 text-volt ring-1 ring-volt/20"><Icon className="size-4" /></span>
          <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        </div>
        <p className="relative mt-3 max-w-md text-[14px] leading-relaxed text-ink-300">{body}</p>
        <div className="relative mt-6 flex-1">{children}</div>
      </div>
    </Reveal>
  );
}

function ScanDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-100px' });
  return (
    <div ref={ref} className="relative flex h-full min-h-48 items-center gap-4">
      <div className="relative aspect-square w-36 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_40%_40%,#3a2a1a,#15110d)]">
        <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f5d9a8,#d18b47_45%,#7a4a22)] shadow-[inset_-8px_-10px_20px_rgba(0,0,0,.35)]" />
        <div className="absolute left-[38%] top-[34%] size-7 rounded-full bg-[radial-gradient(circle,#7fbf5a,#3f7a2a)]" />
        <div className="absolute left-[55%] top-[52%] size-6 rounded-full bg-[radial-gradient(circle,#f4f1e6,#cfc7b0)]" />
        {inView && (
          <motion.div
            className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-volt/40 to-transparent"
            initial={{ top: '-20%' }}
            animate={{ top: ['-20%', '100%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <ScanLine className="absolute right-2 top-2 size-4 text-volt" />
      </div>
      <div className="flex-1 space-y-2">
        {[['Chicken rice bowl', ''], ['612 kcal', 'text-volt font-mono'], ['P 42 · C 68 · F 18', 'font-mono text-ink-300 text-xs']].map(([t, c], i) => (
          <motion.p
            key={t}
            initial={{ opacity: 0, x: 10 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
            transition={{ delay: 0.5 + i * 0.25, duration: 0.5, ease }}
            className={cn('text-sm text-white', c)}
          >
            {t}
          </motion.p>
        ))}
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ delay: 1.4 }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-volt px-2.5 py-1 text-xs font-semibold text-ink-950"
        >
          <Check className="size-3" /> Logged to lunch
        </motion.span>
      </div>
    </div>
  );
}

function CoachDemo() {
  const lines = ['How do I fix knee cave on squats?', '**Cue “spread the floor.”** Push knees out over the pinky toe, brace before you descend, and add 2 × 15 banded lateral walks to your warm-up.'];
  return (
    <div className="space-y-2.5">
      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-white/[0.07] px-3.5 py-2 text-[13px] text-white">{lines[0]}</div>
      <div className="flex gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-volt text-ink-950"><Bot className="size-3.5" /></span>
        <div className="rounded-2xl rounded-tl-md border border-white/[0.06] bg-ink-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-200">
          <strong className="text-white">Cue “spread the floor.”</strong> Push knees out over the pinky toe, brace before you descend, and add 2 × 15 banded lateral walks to your warm-up.
        </div>
      </div>
    </div>
  );
}

function FuelDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-center justify-center gap-3 pt-2">
      {[
        ['Protein', 138, 160, 'var(--color-volt)'],
        ['Carbs', 210, 260, 'var(--color-sky)'],
        ['Fat', 52, 70, 'var(--color-ember)'],
      ].map(([l, v, m, c]) => (
        <div key={l} className="flex flex-col items-center gap-2">
          <Ring value={inView ? v : 0} max={m} size={74} stroke={7} color={c}>
            <span className="font-mono text-xs text-white">{Math.round((v / m) * 100)}%</span>
          </Ring>
          <span className="text-[11px] text-ink-400">{l}</span>
        </div>
      ))}
    </div>
  );
}

function ProgramsDemo() {
  const days = ['Upper · Heavy', 'Lower · Heavy', 'Rest', 'Upper · Volume', 'Lower · Volume', 'Rest', 'Rest'];
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.5, ease }}
          className={cn('flex h-24 flex-col justify-between rounded-xl border p-2', d === 'Rest' ? 'border-white/[0.05] text-ink-500' : 'border-volt/25 bg-volt/[0.06] text-white')}
        >
          <span className="font-mono text-[9px] uppercase text-ink-400">{'MTWTFSS'[i]}</span>
          <span className="text-[10px] leading-tight">{d}</span>
        </motion.div>
      ))}
    </div>
  );
}

function MapDemo() {
  const pins = [[22, 30], [64, 22], [48, 58], [78, 66], [30, 72]];
  return (
    <div className="relative h-36 overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-900 bg-grid [background-size:22px_22px]">
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <path d="M0 60 Q30 40 50 55 T100 40" stroke="rgba(255,255,255,.08)" strokeWidth="5" fill="none" />
        <path d="M40 0 Q45 50 60 100" stroke="rgba(255,255,255,.06)" strokeWidth="4" fill="none" />
      </svg>
      <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky ring-4 ring-sky/25" />
      {pins.map(([x, y], i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ scale: 0, y: -10 }}
          whileInView={{ scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.12, type: 'spring', bounce: 0.5 }}
        >
          <MapPin className="size-5 -translate-x-1/2 -translate-y-full fill-volt/20 text-volt" />
        </motion.span>
      ))}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-5 py-28 sm:py-36">
      <SectionTitle
        eyebrow="Everything in one place"
        title={<>One app. Every lever<br className="hidden sm:block" /> that moves your progress.</>}
        sub="Stop juggling a spreadsheet, a calorie app and a group chat. Kinetiq connects training, food and coaching so each one makes the others smarter."
      />
      <div className="grid auto-rows-[minmax(0,auto)] gap-4 md:grid-cols-6">
        <Tile className="md:col-span-4" icon={Camera} title="Snap & Log" body="Point your camera at a plate. Kinetiq identifies the food, estimates portions and macros, and logs it in one tap.">
          <ScanDemo />
        </Tile>
        <Tile className="md:col-span-2" icon={Sparkles} title="Fuel targets" body="Calories and macros calculated from your body, activity and goal — then tracked live." delay={0.08}>
          <FuelDemo />
        </Tile>
        <Tile className="md:col-span-3" icon={Bot} title="Coach, on call" body="Ask anything about form, programming, recovery or nutrition. Snap a machine and get a setup walkthrough." delay={0.04}>
          <CoachDemo />
        </Tile>
        <Tile className="md:col-span-3" icon={LayoutGrid} title="Programs that fit your week" body="Start from six expert templates or build your own, day by day, with sets and reps that save to the cloud." delay={0.1}>
          <ProgramsDemo />
        </Tile>
        <Tile className="md:col-span-2" icon={Dumbbell} title="Movement library" body="55 guided movements across six regions, with demos and step-by-step cues." delay={0.04}>
          <div className="flex flex-wrap gap-1.5">
            {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map((r) => (
              <span key={r} className="rounded-lg border border-white/[0.07] px-2.5 py-1 text-xs text-ink-300">{r}</span>
            ))}
          </div>
        </Tile>
        <Tile className="md:col-span-4" icon={MapPin} title="Gym finder" body="Traveling? See gyms around you on open map data with hours, distance and one-tap directions." delay={0.1}>
          <MapDemo />
        </Tile>
      </div>
    </section>
  );
}

/* ───────────────────────────── How it works ───────────────────────────── */

const STEPS = [
  ['Tell us about you', 'Height, weight, activity and goal. Thirty seconds, once.'],
  ['Get your plan', 'Kinetiq sets calorie + macro targets and suggests a program for your week.'],
  ['Train, snap, ask', 'Follow sessions, photo-log meals and ask the coach whenever you are stuck.'],
];

function How() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const line = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 120, damping: 30 });
  return (
    <section id="how" className="mx-auto max-w-5xl px-5 py-28">
      <SectionTitle eyebrow="How it works" title="From sign-up to first session in under two minutes." />
      <div ref={ref} className="relative grid gap-10 md:grid-cols-3 md:gap-6">
        <div aria-hidden className="absolute left-[16.6%] right-[16.6%] top-6 hidden h-px bg-white/[0.08] md:block">
          <motion.div className="h-full origin-left bg-gradient-to-r from-volt to-volt-soft" style={{ scaleX: line }} />
        </div>
        {STEPS.map(([title, body], i) => (
          <Reveal key={title} delay={i * 0.12} className="relative text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-volt/30 bg-ink-900 font-mono text-sm font-semibold text-volt shadow-[0_0_30px_-6px_rgba(212,255,58,.4)]">
              0{i + 1}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-300">{body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Numbers ───────────────────────────── */

function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease, onUpdate: (n) => setV(Math.round(n)) });
    return () => controls.stop();
  }, [inView, to]);
  return <span ref={ref} className="tabular">{v}{suffix}</span>;
}

function Numbers() {
  const items = [
    [55, '', 'guided movements'],
    [6, '', 'expert programs'],
    [6, '', 'body regions'],
    [24, '/7', 'AI coach access'],
  ];
  return (
    <section className="mx-auto max-w-6xl px-5">
      <div className="surface grid grid-cols-2 divide-white/[0.06] overflow-hidden rounded-[28px] md:grid-cols-4 md:divide-x">
        {items.map(([n, s, l]) => (
          <div key={l} className="p-8 text-center">
            <p className="font-mono text-4xl font-semibold tracking-tight text-white sm:text-5xl"><Counter to={n} suffix={s} /></p>
            <p className="mt-2 text-sm text-ink-400">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Pricing ───────────────────────────── */

const PLANS = [
  {
    name: 'Starter',
    price: [0, 0],
    blurb: 'Everything you need to train consistently.',
    features: ['All 6 programs + builder', 'Full movement library', 'Macro targets & food log', '10 coach messages / day', 'Gym finder'],
    cta: 'Start free',
  },
  {
    name: 'Pro',
    price: [12, 9],
    blurb: 'For lifters who want the full AI edge.',
    features: ['Everything in Starter', 'Unlimited coach + vision', 'Unlimited Snap & Log', 'AI meal plans', 'Priority new features'],
    cta: 'Go Pro',
    featured: true,
  },
  {
    name: 'Coach',
    price: [39, 29],
    blurb: 'Run your clients from one dashboard.',
    features: ['Everything in Pro', 'Up to 25 clients', 'Shared programs', 'Client check-ins', 'Email support'],
    cta: 'Join waitlist',
  },
];

function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-28 sm:py-36">
      <SectionTitle eyebrow="Pricing" title="Start free. Upgrade when it clicks." sub="Simple plans, no lock-in. Paid plans are coming soon — everything is free while Kinetiq is in early access." />
      <Reveal className="mb-10 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-ink-900 p-1 text-sm">
          {[['Monthly', false], ['Yearly', true]].map(([l, v]) => (
            <button key={l} onClick={() => setYearly(v)} className={cn('relative rounded-full px-4 py-1.5 transition', yearly === v ? 'text-ink-950' : 'text-ink-300')}>
              {yearly === v && <motion.span layoutId="billing" className="absolute inset-0 rounded-full bg-volt" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
              <span className="relative">{l}{v && <span className="ml-1.5 text-[11px] opacity-70">−25%</span>}</span>
            </button>
          ))}
        </div>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08}>
            <div
              className={cn(
                'relative flex h-full flex-col rounded-[28px] p-7',
                p.featured
                  ? 'border border-volt/40 bg-[linear-gradient(180deg,rgba(212,255,58,.09),rgba(212,255,58,.01))] shadow-[0_0_80px_-30px_rgba(212,255,58,.5)]'
                  : 'surface',
              )}
            >
              {p.featured && <span className="absolute -top-3 left-7 rounded-full bg-volt px-2.5 py-0.5 text-[11px] font-semibold text-ink-950">Most popular</span>}
              <h3 className="text-base font-semibold text-white">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-400">{p.blurb}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-tight text-white">$</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={p.price[yearly ? 1 : 0]}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    className="font-mono text-5xl font-semibold tracking-tight text-white"
                  >
                    {p.price[yearly ? 1 : 0]}
                  </motion.span>
                </AnimatePresence>
                <span className="ml-1 text-sm text-ink-400">/ month</span>
              </div>
              <ul className="mt-7 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-ink-200">
                    <span className={cn('grid size-5 place-items-center rounded-full', p.featured ? 'bg-volt text-ink-950' : 'bg-white/[0.07] text-volt')}><Check className="size-3" /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button to="/signup" variant={p.featured ? 'primary' : 'secondary'} className="mt-8 w-full">{p.cta}</Button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── FAQ ───────────────────────────── */

const FAQS = [
  ['Is Kinetiq really free?', 'Yes. The Starter plan is free forever and includes programs, the library, macro tracking and the gym finder. During early access, every feature is unlocked.'],
  ['How accurate is Snap & Log?', 'Photo estimates are typically within 10–20% for common meals — great for staying consistent. You can edit any value before logging.'],
  ['Is the coach a replacement for a doctor or physio?', 'No. The coach is great for technique, programming and nutrition questions, but it will always point you to a professional for pain, injury or medical concerns.'],
  ['Can I build my own program?', 'Absolutely. Use the Program Builder to create up to 7 days, pick movements from the library and set sets and reps. Your programs sync to your account.'],
  ['What happens to my photos?', 'Photos are sent securely to our AI provider for analysis and are never saved to your account or our database.'],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 pb-28">
      <SectionTitle eyebrow="FAQ" title="Questions, answered." />
      <div className="divide-y divide-white/[0.06] rounded-[28px] border border-white/[0.07]">
        {FAQS.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-[15px] font-medium text-white" aria-expanded={open === i}>
              {q}
              <ChevronDown className={cn('size-4 shrink-0 text-ink-400 transition-transform duration-300', open === i && 'rotate-180 text-volt')} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-ink-300">{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── CTA + Footer ───────────────────────────── */

function FinalCta() {
  return (
    <section className="px-5 pb-24">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-volt/20 bg-ink-900 px-6 py-20 text-center sm:py-24">
        <div aria-hidden className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,black,transparent)]" />
        <div aria-hidden className="absolute -bottom-40 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-volt/20 blur-[100px]" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl">Your next PR starts with one tap.</h2>
          <p className="mx-auto mt-5 max-w-md text-ink-300">Join Kinetiq free and get your program, targets and coach in under two minutes.</p>
          <Button to="/signup" size="lg" className="mt-9">Create free account <ArrowUpRight className="size-4" /></Button>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-400">The AI training OS. Built for people who take progress seriously.</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-400">
          {LINKS.map(([l, h]) => <a key={h} href={h} className="hover:text-white">{l}</a>)}
          <Link to="/login" className="hover:text-white">Sign in</Link>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-ink-500">© {new Date().getFullYear()} Kinetiq. Not medical advice — consult a professional before starting a new program.</p>
    </footer>
  );
}

export default function Landing() {
  useLenis();
  return (
    <div className="min-h-dvh overflow-x-clip bg-ink-950">
      <Nav />
      <Hero />
      <Marquee />
      <Features />
      <Numbers />
      <How />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}
