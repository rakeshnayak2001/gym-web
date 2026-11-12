import { useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, CalendarDays, Clock, LayoutGrid, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PROGRAMS } from '@/lib/library';
import { useDeleteProgram, usePrograms } from '@/lib/queries';
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';

function TemplateCard({ p, i }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      <Link to={`/app/programs/t/${p.slug}`} className="surface group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-white/15">
        <div aria-hidden className="absolute -right-16 -top-16 size-44 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40" style={{ background: p.accent }} />
        <div className="relative flex items-start justify-between">
          <Badge color={p.accent}>{p.level}</Badge>
          <ArrowUpRight className="size-4 text-ink-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
        </div>
        <h3 className="relative mt-5 text-xl font-semibold tracking-tight text-white">{p.name}</h3>
        <p className="relative mt-1.5 text-sm text-ink-300">{p.tagline}</p>
        {/* week dots */}
        <div className="relative mt-6 flex gap-1.5">
          {Array.from({ length: 7 }, (_, d) => (
            <span key={d} className="h-1.5 flex-1 rounded-full" style={{ background: d < p.perWeek ? p.accent : 'rgba(255,255,255,.07)' }} />
          ))}
        </div>
        <div className="relative mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{p.perWeek}× / week</span>
          <span className="flex items-center gap-1.5"><Clock className="size-3.5" />~{p.minutes} min</span>
          <span className="flex items-center gap-1.5"><Target className="size-3.5" />{p.goal}</span>
        </div>
      </Link>
    </motion.div>
  );
}

function MyPrograms() {
  const { data: programs, isPending, error } = usePrograms();
  const del = useDeleteProgram();
  const [confirm, setConfirm] = useState(null);

  if (isPending) return <div className="grid gap-3 md:grid-cols-2"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  if (error) return <EmptyState title="Couldn’t load programs" description={error.message} />;
  if (!programs.length)
    return (
      <EmptyState
        icon={LayoutGrid}
        title="No programs yet"
        description="Save a template to your account or build one from scratch."
        action={<Button to="/app/builder"><Plus className="size-4" />Build a program</Button>}
      />
    );

  return (
    <>
      <motion.div layout className="grid gap-3 md:grid-cols-2">
        <AnimatePresence>
          {programs.map((p) => {
            const moves = p.days.reduce((n, d) => n + d.exercises.length, 0);
            return (
              <motion.div layout key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
                <Card className="group flex h-full flex-col">
                  <Link to={`/app/programs/${p._id}`} className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-volt-soft">{p.name}</h3>
                    {p.description && <p className="mt-1 line-clamp-2 text-sm text-ink-300">{p.description}</p>}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.days.map((d) => <Badge key={d._id ?? d.name}>{d.name}</Badge>)}
                    </div>
                  </Link>
                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4">
                    <span className="font-mono text-xs text-ink-400">{p.days.length} days · {moves} movements</span>
                    <div className="flex gap-1">
                      <Button to={`/app/builder/${p._id}`} variant="ghost" size="icon" aria-label="Edit"><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label="Delete" className="hover:text-rose" onClick={() => setConfirm(p)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      <Modal open={Boolean(confirm)} onClose={() => setConfirm(null)} title="Delete program">
        <div className="p-7">
          <h3 className="text-lg font-semibold text-white">Delete “{confirm?.name}”?</h3>
          <p className="mt-2 text-sm text-ink-300">This removes the program from your account. It can’t be undone.</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                const p = confirm;
                setConfirm(null);
                del.mutate(p._id, { onSuccess: () => toast.success('Program deleted'), onError: (e) => toast.error(e.message) });
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function Programs() {
  const [tab, setTab] = useState('templates');
  return (
    <div>
      <PageHeader
        eyebrow="Programs"
        title="Train with a plan"
        description="Start from a proven template or build your own week, day by day."
        actions={<Button to="/app/builder"><Plus className="size-4" />New program</Button>}
      />
      <Segmented
        className="mb-6"
        layoutId="programs-tab"
        value={tab}
        onChange={setTab}
        options={[{ value: 'templates', label: 'Templates' }, { value: 'mine', label: 'My programs' }]}
      />
      {tab === 'templates' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PROGRAMS.map((p, i) => <TemplateCard key={p.slug} p={p} i={i} />)}
        </div>
      ) : (
        <MyPrograms />
      )}
    </div>
  );
}
