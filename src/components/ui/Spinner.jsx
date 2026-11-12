import { cn } from '@/lib/utils';
import { Logo } from './Logo';

export function Spinner({ className }) {
  return (
    <svg className={cn('size-4 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-ink-950" role="status" aria-label="Loading">
      <div className="relative grid place-items-center">
        <span className="absolute size-14 rounded-2xl bg-volt/30 animate-pulse-ring" />
        <Logo mark className="size-12" />
      </div>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('shimmer rounded-xl', className)} />;
}
