import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Clock, Globe, LocateFixed, MapPin, Navigation, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Badge, EmptyState, PageHeader } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Spinner';

const RADII = [
  { value: 1500, label: '1.5 km' },
  { value: 3000, label: '3 km' },
  { value: 6000, label: '6 km' },
  { value: 12000, label: '12 km' },
];

/** Tiny relative-position plot of results around the user — no map tiles needed. */
function Radar({ gyms, center, radius, hover, onHover }) {
  const kmPerDegLat = 111;
  const kmPerDegLng = 111 * Math.cos((center.lat * Math.PI) / 180);
  const rKm = radius / 1000;
  return (
    <div className="surface relative aspect-square overflow-hidden rounded-3xl">
      <div aria-hidden className="absolute inset-0 bg-grid [background-size:32px_32px]" />
      {[1, 0.66, 0.33].map((s) => (
        <span key={s} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" style={{ width: `${s * 92}%`, height: `${s * 92}%` }} />
      ))}
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[46%] w-px origin-bottom -translate-x-1/2 -translate-y-full bg-gradient-to-t from-volt/60 to-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky ring-4 ring-sky/25" />
      {gyms.map((g, i) => {
        const x = ((g.lng - center.lng) * kmPerDegLng) / rKm;
        const y = ((g.lat - center.lat) * kmPerDegLat) / rKm;
        if (Math.hypot(x, y) > 1.05) return null;
        return (
          <motion.button
            key={g.id}
            onMouseEnter={() => onHover(g.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => document.getElementById(`gym-${g.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            aria-label={g.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${50 + x * 46}%`, top: `${50 - y * 46}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: hover === g.id ? 1.5 : 1 }}
            transition={{ delay: hover ? 0 : 0.1 + i * 0.03, type: 'spring', bounce: 0.5 }}
          >
            <span className={cn('block size-2.5 rounded-full ring-4 transition-colors', hover === g.id ? 'bg-white ring-white/30' : 'bg-volt ring-volt/20')} />
          </motion.button>
        );
      })}
      <span className="absolute bottom-3 right-4 font-mono text-[10px] text-ink-500">r = {radius / 1000} km</span>
    </div>
  );
}

export default function Gyms() {
  const [center, setCenter] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [radius, setRadius] = useState(3000);
  const [hover, setHover] = useState(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ['gyms', center?.lat.toFixed(3), center?.lng.toFixed(3), radius],
    queryFn: () => api.get(`/api/gyms/nearby?lat=${center.lat}&lng=${center.lng}&radius=${radius}`),
    enabled: Boolean(center),
    staleTime: 5 * 60_000,
  });

  const locate = () => {
    if (!navigator.geolocation) return setGeoError('Location isn’t supported in this browser.');
    setLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => { setGeoError('We couldn’t get your location. Allow location access and try again.'); setLocating(false); },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300_000 },
    );
  };

  const gyms = data?.gyms ?? [];

  return (
    <div>
      <PageHeader eyebrow="Gym Finder" title="Train anywhere" description="Gyms and fitness centres around you, from OpenStreetMap." actions={center && <Segmented size="sm" layoutId="radius" value={radius} onChange={setRadius} options={RADII} />} />

      {!center ? (
        <EmptyState
          icon={LocateFixed}
          title="Find gyms near you"
          description={geoError || 'Kinetiq uses your location once to search nearby. It isn’t stored.'}
          action={<Button onClick={locate} loading={locating}><LocateFixed className="size-4" />Use my location</Button>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Radar gyms={gyms} center={center} radius={radius} hover={hover} onHover={setHover} />
            <p className="mt-3 text-center text-xs text-ink-400">{isFetching ? 'Scanning…' : `${gyms.length} places found`}</p>
          </div>
          <div className="space-y-2.5">
            {isFetching && !gyms.length ? (
              Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24" />)
            ) : error ? (
              <EmptyState title="Map data unavailable" description={error.message} action={<Button variant="secondary" onClick={locate}>Retry</Button>} />
            ) : gyms.length === 0 ? (
              <EmptyState icon={MapPin} title="No gyms in range" description="Try a larger radius." />
            ) : (
              gyms.map((g, i) => (
                <motion.div
                  id={`gym-${g.id}`}
                  key={g.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  onMouseEnter={() => setHover(g.id)}
                  onMouseLeave={() => setHover(null)}
                  className={cn('surface rounded-2xl p-4 transition', hover === g.id && 'border-volt/40')}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white">{g.name}</h3>
                      {g.address && <p className="mt-0.5 truncate text-sm text-ink-400">{g.address}</p>}
                    </div>
                    <span className="shrink-0 rounded-lg bg-white/[0.05] px-2 py-1 font-mono text-xs text-ink-200">{g.distanceKm < 1 ? `${Math.round(g.distanceKm * 1000)} m` : `${g.distanceKm.toFixed(1)} km`}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {g.openingHours && <Badge><Clock className="size-3" />{g.openingHours.length > 28 ? `${g.openingHours.slice(0, 28)}…` : g.openingHours}</Badge>}
                    {g.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                    <div className="ml-auto flex gap-1">
                      {g.phone && <Button href={`tel:${g.phone}`} variant="ghost" size="icon" aria-label="Call"><Phone className="size-4" /></Button>}
                      {g.website && <Button href={g.website} target="_blank" rel="noreferrer" variant="ghost" size="icon" aria-label="Website"><Globe className="size-4" /></Button>}
                      <Button href={`https://www.google.com/maps/dir/?api=1&destination=${g.lat},${g.lng}`} target="_blank" rel="noreferrer" variant="secondary" size="sm"><Navigation className="size-3.5" />Directions</Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
