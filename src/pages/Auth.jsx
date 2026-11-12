import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Ring } from '@/components/ui/Ring';

const ease = [0.22, 1, 0.36, 1];

function Showcase({ mode }) {
  return (
    <div className="relative hidden overflow-hidden border-l border-white/[0.06] bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div aria-hidden className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_80%_60%_at_60%_40%,black,transparent)]" />
      <div aria-hidden className="absolute -right-24 top-1/4 size-[420px] rounded-full bg-volt/[0.12] blur-[110px]" />

      <div className="relative" />
      <div className="relative mx-auto w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: -3 }} transition={{ duration: 1, ease, delay: 0.2 }} className="surface rounded-3xl p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-volt/80">Today’s fuel</p>
              <p className="mt-1 text-lg font-semibold text-white">On track</p>
            </div>
            <Ring value={1840} max={2400} size={84} stroke={8}>
              <span className="font-mono text-sm text-white">77%</span>
            </Ring>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30, rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 2 }} transition={{ duration: 1, ease, delay: 0.4 }} className="surface -mt-3 ml-10 rounded-3xl p-5 backdrop-blur">
          <p className="text-sm text-white">Push · Chest & shoulders</p>
          <div className="mt-3 space-y-2">
            {['Bench Press · 4 × 8', 'Overhead Press · 3 × 10', 'Cable Fly · 3 × 12'].map((l, i) => (
              <motion.div key={l} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.15 }} className="flex items-center gap-2.5 text-[13px] text-ink-200">
                <span className="grid size-5 place-items-center rounded-md bg-volt/15 text-volt"><Check className="size-3" /></span>
                {l}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="relative">
        <p className="max-w-sm text-balance text-2xl font-semibold leading-tight tracking-[-0.03em] text-white">
          {mode === 'signup' ? 'Two minutes from now you’ll have a plan.' : 'Welcome back. Your streak missed you.'}
        </p>
        <p className="mt-3 text-sm text-ink-400">Programs · Fuel · Snap & Log · Coach</p>
      </div>
    </div>
  );
}

export default function Auth({ mode }) {
  const isSignup = mode === 'signup';
  const { acceptSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const body = isSignup ? form : { email: form.email, password: form.password };
      const session = await api.post(isSignup ? '/api/auth/register' : '/api/auth/login', body);
      acceptSession(session);
      navigate(isSignup ? '/app/fuel?onboard=1' : location.state?.from || '/app', { replace: true });
      toast.success(isSignup ? `Welcome to Kinetiq, ${session.user.name.split(' ')[0]}!` : 'Signed in');
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = Math.min(4, [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(form.password)).length);

  return (
    <div className="grid min-h-dvh bg-ink-950 lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="w-fit"><Logo /></Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="m-auto w-full max-w-sm py-12">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">{isSignup ? 'Create your account' : 'Sign in to Kinetiq'}</h1>
          <p className="mt-2 text-sm text-ink-300">
            {isSignup ? 'Free forever. No card required.' : 'Pick up right where you left off.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            {isSignup && (
              <Field label="Name" autoComplete="name" placeholder="Alex Rivera" value={form.name} onChange={set('name')} error={errors.name} required />
            )}
            <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} required />
            <div className="space-y-2">
              <div className="relative">
                <Field
                  label="Password"
                  type={show ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
                  value={form.password}
                  onChange={set('password')}
                  error={errors.password}
                  required
                />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-[34px] grid size-7 place-items-center rounded-md text-ink-400 hover:text-white">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {isSignup && form.password && (
                <div className="flex gap-1" aria-hidden>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? (strength < 2 ? 'bg-rose' : strength < 4 ? 'bg-ember' : 'bg-volt') : 'bg-white/[0.07]'}`} />
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>
              {isSignup ? 'Create account' : 'Sign in'} <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-400">
            {isSignup ? 'Already have an account? ' : 'New to Kinetiq? '}
            <Link to={isSignup ? '/login' : '/signup'} className="font-medium text-volt hover:underline">
              {isSignup ? 'Sign in' : 'Create one free'}
            </Link>
          </p>
        </motion.div>
      </div>
      <Showcase mode={mode} />
    </div>
  );
}
