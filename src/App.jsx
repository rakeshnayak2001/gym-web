import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { GuestOnly, RequireAuth } from '@/lib/auth';
import { FullScreenLoader } from '@/components/ui/Spinner';
import AppShell from '@/components/AppShell';

const Landing = lazy(() => import('@/pages/Landing'));
const Auth = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Today = lazy(() => import('@/pages/app/Today'));
const Library = lazy(() => import('@/pages/app/Library'));
const Programs = lazy(() => import('@/pages/app/Programs'));
const ProgramView = lazy(() => import('@/pages/app/ProgramView'));
const Builder = lazy(() => import('@/pages/app/Builder'));
const Fuel = lazy(() => import('@/pages/app/Fuel'));
const Scan = lazy(() => import('@/pages/app/Scan'));
const Gyms = lazy(() => import('@/pages/app/Gyms'));
const Coach = lazy(() => import('@/pages/app/Coach'));
const Settings = lazy(() => import('@/pages/app/Settings'));

function ScrollReset() {
  const { pathname } = useLocation();
  // Braces matter: newer browsers return a Promise from scrollTo, which React would treat as a cleanup.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <ScrollReset />
      <Routes>
        <Route index element={<Landing />} />
        <Route path="login" element={<GuestOnly><Auth mode="login" /></GuestOnly>} />
        <Route path="signup" element={<GuestOnly><Auth mode="signup" /></GuestOnly>} />
        <Route path="app" element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route index element={<Today />} />
          <Route path="library" element={<Library />} />
          <Route path="programs" element={<Programs />} />
          <Route path="programs/t/:slug" element={<ProgramView />} />
          <Route path="programs/:id" element={<ProgramView />} />
          <Route path="builder" element={<Builder />} />
          <Route path="builder/:id" element={<Builder />} />
          <Route path="fuel" element={<Fuel />} />
          <Route path="scan" element={<Scan />} />
          <Route path="gyms" element={<Gyms />} />
          <Route path="coach" element={<Coach />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
