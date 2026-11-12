import { cn } from '@/lib/utils';

/** Kinetiq mark: an upright stroke plus a chevron "in motion". */
export function Logo({ mark = false, className }) {
  const icon = (
    <svg viewBox="0 0 64 64" fill="none" className={cn(mark ? className : 'size-8')} aria-hidden>
      <rect width="64" height="64" rx="16" fill="var(--color-ink-800)" />
      <rect x=".5" y=".5" width="63" height="63" rx="15.5" stroke="white" strokeOpacity=".08" />
      <path d="M20 14v36" stroke="var(--color-volt)" strokeWidth="7" strokeLinecap="round" />
      <path d="M44 15 29.5 32 44 49" stroke="var(--color-volt)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="47" cy="32" r="3.5" fill="var(--color-volt)" opacity=".55" />
    </svg>
  );
  if (mark) return icon;
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {icon}
      <span className="text-[1.05rem] font-semibold tracking-[-0.03em] text-white">
        kinetiq<span className="text-volt">.</span>
      </span>
    </span>
  );
}
