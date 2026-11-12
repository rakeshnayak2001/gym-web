import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

const variants = {
  primary:
    'bg-volt text-ink-950 hover:bg-volt-soft shadow-[0_0_0_1px_rgba(212,255,58,.4),0_8px_30px_-8px_rgba(212,255,58,.55)] hover:shadow-[0_0_0_1px_rgba(212,255,58,.6),0_10px_40px_-6px_rgba(212,255,58,.7)]',
  secondary: 'surface text-white hover:bg-white/[0.07]',
  ghost: 'text-ink-200 hover:text-white hover:bg-white/[0.06]',
  danger: 'bg-rose/10 text-rose border border-rose/25 hover:bg-rose/20',
};

const sizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-2xl',
  icon: 'size-9 rounded-xl justify-center',
};

export function Button({ variant = 'primary', size = 'md', loading = false, to, href, className, children, disabled, ...props }) {
  const classes = cn(
    'relative inline-flex items-center justify-center font-medium whitespace-nowrap select-none',
    'transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  );
  const content = (
    <>
      {loading && <Spinner className="absolute" />}
      <span className={cn('inline-flex items-center gap-[inherit]', loading && 'invisible')}>{children}</span>
    </>
  );
  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...props}>{content}</a>;
  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
