import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router';
import { api, onUnauthorized, tokenStore } from './api';
import { FullScreenLoader } from '@/components/ui/Spinner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const qc = useQueryClient();
  // Token lives in React state (mirrored to localStorage) so sign-in/out always re-renders the tree.
  const [token, setToken] = useState(() => tokenStore.get());
  const hasToken = Boolean(token);

  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/api/auth/me').then((r) => r.user),
    enabled: hasToken,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const signOut = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem('kinetiq.coach');
    setToken(null);
    qc.removeQueries();
  }, [qc]);

  useEffect(() => onUnauthorized(signOut), [signOut]);

  const acceptSession = useCallback(
    ({ token: next, user }) => {
      tokenStore.set(next);
      setToken(next);
      qc.setQueryData(['me'], user);
    },
    [qc],
  );

  const value = useMemo(
    () => ({
      user: hasToken ? (me.data ?? null) : null,
      loading: hasToken && me.isPending,
      acceptSession,
      signOut,
      setUser: (user) => qc.setQueryData(['me'], user),
    }),
    [hasToken, me.data, me.isPending, acceptSession, signOut, qc],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export const useAuth = () => use(AuthContext);

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  // Only bounce users who arrived already signed in; a fresh sign-in navigates itself.
  const [arrivedAsGuest] = useState(() => !tokenStore.get());
  if (loading) return <FullScreenLoader />;
  if (user && !arrivedAsGuest) return <Navigate to="/app" replace />;
  return children;
}
