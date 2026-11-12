import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-volt/80">{eyebrow}</p>}
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.035em] text-white sm:text-[34px]">{title}</h1>
        {description && <p className="max-w-2xl text-[15px] text-ink-300">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, interactive = false, ...props }) {
  return (
    <div
      className={cn(
        'surface rounded-3xl p-5 sm:p-6',
        interactive && 'transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ children, className, color }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11.5px] font-medium text-ink-200', className)}
      style={color ? { color, borderColor: `color-mix(in oklab, ${color} 30%, transparent)`, background: `color-mix(in oklab, ${color} 8%, transparent)` } : undefined}
    >
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-volt/10 text-volt">
          <Icon className="size-5" />
        </div>
      )}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-300">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Fade-up children with a stagger; used for page entrance. */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
export const rise = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function Stagger({ className, children, as = 'div' }) {
  const M = motion[as];
  return (
    <M className={className} variants={stagger} initial="hidden" animate="show">
      {children}
    </M>
  );
}

export function Rise({ className, children, as = 'div', ...props }) {
  const M = motion[as];
  return (
    <M className={className} variants={rise} {...props}>
      {children}
    </M>
  );
}
