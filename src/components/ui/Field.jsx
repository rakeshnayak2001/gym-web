import { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const control =
  'w-full rounded-xl bg-ink-900/80 border border-white/[0.08] px-3.5 text-[14px] text-white placeholder:text-ink-400 ' +
  'transition-colors outline-none hover:border-white/15 focus:border-volt/60 focus:bg-ink-900 focus:ring-4 focus:ring-volt/10';

export function Field({ label, hint, error, suffix, className, as = 'input', children, ...props }) {
  const id = useId();
  const Comp = as;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-medium text-ink-200">
          {label}
          {hint && <span className="text-xs font-normal text-ink-400">{hint}</span>}
        </label>
      )}
      <div className="relative">
        {children ?? (
          <Comp
            id={id}
            aria-invalid={Boolean(error)}
            className={cn(control, as === 'textarea' ? 'min-h-24 py-3 resize-y' : 'h-11', suffix && 'pr-12', error && 'border-rose/50')}
            {...props}
          />
        )}
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3.5 grid place-items-center font-mono text-xs text-ink-400">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-rose">{error}</p>}
    </div>
  );
}

export function Select({ label, options, className, ...props }) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label htmlFor={id} className="text-[13px] font-medium text-ink-200">{label}</label>}
      <select id={id} className={cn(control, 'h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%238a92a0%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9')} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-900">{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/** Pill-style segmented control with a sliding indicator. */
export function Segmented({ value, onChange, options, className, layoutId = 'seg', size = 'md' }) {
  return (
    <div role="radiogroup" className={cn('inline-flex rounded-xl bg-ink-900 p-1 border border-white/[0.06]', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative flex-1 rounded-lg font-medium transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-[13px]',
              active ? 'text-ink-950' : 'text-ink-300 hover:text-white',
            )}
          >
            {active && (
              <motion.span layoutId={layoutId} className="absolute inset-0 rounded-lg bg-volt" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
