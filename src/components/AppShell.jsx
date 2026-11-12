import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  Apple, Bot, Camera, Command, Dumbbell, Home, LayoutGrid, LogOut, MapPin, Plus, Search, Settings, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn, initials } from '@/lib/utils';
import { EXERCISES } from '@/lib/library';
import { Logo } from './ui/Logo';
import { Skeleton } from './ui/Spinner';

export const NAV = [
  { to: '/app', label: 'Today', icon: Home, end: true },
  { to: '/app/programs', label: 'Programs', icon: LayoutGrid },
  { to: '/app/library', label: 'Library', icon: Dumbbell },
  { to: '/app/fuel', label: 'Fuel', icon: Apple },
  { to: '/app/scan', label: 'Snap & Log', icon: Camera },
  { to: '/app/coach', label: 'Coach', icon: Bot, badge: 'AI' },
  { to: '/app/gyms', label: 'Gym Finder', icon: MapPin },
];

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors',
          isActive ? 'text-white' : 'text-ink-300 hover:text-white hover:bg-white/[0.04]',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-white/10"
              transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
            />
          )}
          <Icon className={cn('relative size-[18px]', isActive ? 'text-volt' : 'text-ink-400 group-hover:text-ink-200')} />
          <span className="relative">{item.label}</span>
          {item.badge && (
            <span className="relative ml-auto rounded-md bg-volt/15 px-1.5 py-px font-mono text-[10px] font-semibold text-volt">{item.badge}</span>
          )}
        </>
      )}
    </NavLink>
  );
}

function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo(() => {
    const actions = [
      ...NAV.map((n) => ({ id: n.to, label: n.label, hint: 'Go to', icon: n.icon, run: () => navigate(n.to) })),
      { id: 'new', label: 'Build a new program', hint: 'Action', icon: Plus, run: () => navigate('/app/builder') },
      { id: 'ask', label: 'Ask the coach anything', hint: 'Action', icon: Sparkles, run: () => navigate('/app/coach') },
      { id: 'settings', label: 'Settings', hint: 'Go to', icon: Settings, run: () => navigate('/app/settings') },
    ];
    const moves = EXERCISES.map((e) => ({
      id: e.id, label: e.name, hint: e.muscle, icon: Dumbbell, run: () => navigate(`/app/library?move=${e.id}`),
    }));
    const term = q.trim().toLowerCase();
    if (!term) return actions;
    return [...actions, ...moves].filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(term)).slice(0, 12);
  }, [q, navigate]);

  const run = (item) => {
    onClose();
    item?.run();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label="Command menu"
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
              <Search className="size-4 text-ink-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                  if (e.key === 'Enter') run(items[active]);
                  if (e.key === 'Escape') onClose();
                }}
                placeholder="Search pages, moves, actions…"
                className="h-13 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-ink-400"
              />
              <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-ink-400">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-400">No results for “{q}”</li>}
              {items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(item)}
                      className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm', i === active ? 'bg-white/[0.07] text-white' : 'text-ink-200')}
                    >
                      <Icon className={cn('size-4', i === active ? 'text-volt' : 'text-ink-400')} />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-xs text-ink-400">{item.hint}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const logout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-ink-950">
      {/* ambient glow */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-[480px] bg-[radial-gradient(60%_60%_at_70%_0%,rgba(212,255,58,0.07),transparent_70%)]" />

      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-white/[0.06] bg-ink-950/80 px-3 py-5 backdrop-blur-xl lg:flex">
        <NavLink to="/app" className="mb-6 px-2.5">
          <Logo />
        </NavLink>
        <button
          onClick={() => setPaletteOpen(true)}
          className="mb-5 flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 text-[13px] text-ink-400 transition hover:border-white/15 hover:text-ink-200"
        >
          <Search className="size-4" />
          Search
          <span className="ml-auto flex items-center gap-0.5 font-mono text-[10px]">
            <Command className="size-3" />K
          </span>
        </button>
        <nav className="flex flex-1 flex-col gap-0.5">
          <p className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">Workspace</p>
          {NAV.map((item) => <NavItem key={item.to} item={item} />)}
        </nav>
        <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2">
          <NavLink to="/app/settings" className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.04]">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-volt to-volt-deep text-[13px] font-bold text-ink-950">
              {initials(user?.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-white">{user?.name}</span>
              <span className="block truncate text-xs text-ink-400">{user?.email}</span>
            </span>
            <Settings className="size-4 text-ink-400" />
          </NavLink>
          <button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-ink-400 transition hover:bg-white/[0.04] hover:text-rose">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-x-0 border-t-0 px-4 lg:hidden">
        <NavLink to="/app"><Logo /></NavLink>
        <div className="flex items-center gap-1">
          <button onClick={() => setPaletteOpen(true)} aria-label="Search" className="grid size-9 place-items-center rounded-xl text-ink-200 hover:bg-white/5">
            <Search className="size-[18px]" />
          </button>
          <NavLink to="/app/settings" aria-label="Settings" className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-volt to-volt-deep text-xs font-bold text-ink-950">
            {initials(user?.name)}
          </NavLink>
        </div>
      </header>

      <main className="relative lg:pl-[248px]">
        <div className="mx-auto max-w-[1200px] px-4 pb-28 pt-6 sm:px-8 lg:pb-16 lg:pt-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense fallback={<PageFallback />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom tab bar (mobile) */}
      <nav className="glass fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-2xl px-1 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:hidden">
        {NAV.filter((n) => n.to !== '/app/gyms').map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn('flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition', isActive ? 'text-volt' : 'text-ink-400')}
            >
              <Icon className="size-5" />
              {item.label.split(' ')[0]}
            </NavLink>
          );
        })}
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
