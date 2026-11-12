import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Animated progress ring. value/max may exceed 1 — overflow is shown as a second lap. */
export function Ring({ value = 0, max = 1, size = 120, stroke = 10, color = 'var(--color-volt)', track = 'rgba(255,255,255,.06)', className, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <div className={cn('relative grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px color-mix(in oklab, ${color} 45%, transparent))` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** Horizontal macro bar */
export function MacroBar({ label, value, target, color, unit = 'g' }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="flex items-center gap-2 text-ink-200">
          <span className="size-2 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="font-mono tabular text-ink-300">
          <span className="text-white">{Math.round(value)}</span>
          {target ? ` / ${Math.round(target)}${unit}` : unit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
