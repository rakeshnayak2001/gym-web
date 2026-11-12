import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { initials } from '@/lib/utils';
import { Card, PageHeader } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

function Section({ icon: Icon, title, description, children }) {
  return (
    <Card className="grid gap-6 md:grid-cols-[240px_1fr]">
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-white"><Icon className="size-4 text-volt" />{title}</h3>
        <p className="mt-1 text-sm text-ink-400">{description}</p>
      </div>
      <div>{children}</div>
    </Card>
  );
}

export default function Settings() {
  const { user, acceptSession, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user.name, email: user.email });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(null);
  const [errors, setErrors] = useState({});

  const update = async (kind, body) => {
    setSaving(kind);
    setErrors({});
    try {
      const session = await api.patch('/api/auth/account', body);
      acceptSession(session);
      toast.success(kind === 'profile' ? 'Profile saved' : 'Password changed');
      if (kind === 'password') setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      if (e.fields) setErrors(e.fields);
      toast.error(e.message);
    } finally {
      setSaving(null);
    }
  };

  const changed = profile.name !== user.name || profile.email !== user.email;

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Account" />
      <div className="space-y-4">
        <Card className="flex items-center gap-5">
          <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-volt to-volt-deep text-xl font-bold text-ink-950">{initials(user.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-white">{user.name}</p>
            <p className="truncate text-sm text-ink-400">{user.email}</p>
          </div>
          <Button variant="secondary" onClick={() => { signOut(); navigate('/', { replace: true }); }}><LogOut className="size-4" />Sign out</Button>
        </Card>

        <Section icon={User} title="Profile" description="How you appear across Kinetiq.">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              update('profile', { name: profile.name.trim(), email: profile.email.trim() });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} error={errors.name} autoComplete="name" />
              <Field label="Email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} error={errors.email} autoComplete="email" />
            </div>
            <Button type="submit" disabled={!changed} loading={saving === 'profile'}>Save profile</Button>
          </form>
        </Section>

        <Section icon={ShieldCheck} title="Password" description="Use at least 8 characters. You’ll stay signed in on this device.">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (pw.newPassword !== pw.confirm) return setErrors({ confirm: 'Passwords don’t match' });
              update('password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
            }}
          >
            <Field label="Current password" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} error={errors.currentPassword} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} error={errors.newPassword} />
              <Field label="Confirm new password" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} error={errors.confirm} />
            </div>
            <Button type="submit" disabled={!pw.currentPassword || !pw.newPassword} loading={saving === 'password'}>Change password</Button>
          </form>
        </Section>
      </div>
    </div>
  );
}
