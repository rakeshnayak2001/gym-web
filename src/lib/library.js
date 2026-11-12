import data from '@/data/exercises.json';

export const REGIONS = [
  { id: 'chest', label: 'Chest', hue: 'var(--color-volt)' },
  { id: 'back', label: 'Back', hue: 'var(--color-sky)' },
  { id: 'legs', label: 'Legs', hue: 'var(--color-ember)' },
  { id: 'shoulders', label: 'Shoulders', hue: 'var(--color-iris)' },
  { id: 'arms', label: 'Arms', hue: 'var(--color-rose)' },
  { id: 'core', label: 'Core', hue: 'var(--color-volt-soft)' },
];

const byRegion = data.exercises;

export const EXERCISES = Object.entries(byRegion).flatMap(([region, list]) =>
  list.map((e) => ({ ...e, region })),
);

export const findExercise = (id) => EXERCISES.find((e) => e.id === id);

const pick = (region, ...idx) => idx.map((i) => byRegion[region][i]).filter(Boolean);
const withVolume = (list, sets, reps) => list.map((e) => ({ ...e, sets, reps }));

const day = (name, focus, blocks) => ({ name, focus, exercises: blocks.flat() });

/** Curated starter programs. Slugs are stable so they can be linked to. */
export const PROGRAMS = [
  {
    slug: 'foundation-3',
    name: 'Foundation 3',
    tagline: 'Full-body basics, three days a week.',
    level: 'Beginner',
    perWeek: 3,
    minutes: 45,
    goal: 'General strength',
    accent: 'var(--color-volt)',
    days: [
      day('Session A', 'Full body', [withVolume([...pick('chest', 0), ...pick('back', 0), ...pick('legs', 0), ...pick('shoulders', 0), ...pick('core', 0)], 3, 10)]),
      day('Session B', 'Full body', [withVolume([...pick('chest', 2), ...pick('back', 1), ...pick('legs', 1), ...pick('arms', 0), ...pick('core', 1)], 3, 12)]),
      day('Session C', 'Full body', [withVolume([...pick('chest', 1), ...pick('back', 2), ...pick('legs', 2), ...pick('shoulders', 1), ...pick('arms', 5)], 3, 10)]),
    ],
  },
  {
    slug: 'upper-lower-4',
    name: 'Upper · Lower',
    tagline: 'Balanced four-day split for steady progress.',
    level: 'Intermediate',
    perWeek: 4,
    minutes: 60,
    goal: 'Strength + size',
    accent: 'var(--color-sky)',
    days: [
      day('Upper · Heavy', 'Upper body', [withVolume([...pick('chest', 0, 1), ...pick('back', 0, 3), ...pick('shoulders', 0)], 4, 6)]),
      day('Lower · Heavy', 'Lower body', [withVolume([...pick('legs', 0, 1, 2, 5)], 4, 6), withVolume(pick('core', 0), 3, 15)]),
      day('Upper · Volume', 'Upper body', [withVolume([...pick('chest', 2, 3), ...pick('back', 1, 2), ...pick('arms', 0, 5)], 3, 12)]),
      day('Lower · Volume', 'Lower body', [withVolume([...pick('legs', 3, 4, 6, 7)], 3, 12), withVolume(pick('core', 2), 3, 15)]),
    ],
  },
  {
    slug: 'ppl-6',
    name: 'Push · Pull · Legs',
    tagline: 'High-frequency hypertrophy for experienced lifters.',
    level: 'Advanced',
    perWeek: 6,
    minutes: 70,
    goal: 'Muscle growth',
    accent: 'var(--color-ember)',
    days: [
      day('Push', 'Chest · shoulders · triceps', [withVolume([...pick('chest', 0, 1, 3), ...pick('shoulders', 0, 2), ...pick('arms', 5, 6)], 4, 10)]),
      day('Pull', 'Back · biceps', [withVolume([...pick('back', 0, 1, 2, 3), ...pick('arms', 0, 1)], 4, 10)]),
      day('Legs', 'Quads · hams · glutes', [withVolume([...pick('legs', 0, 1, 2, 3, 4)], 4, 10)]),
      day('Push II', 'Chest · shoulders · triceps', [withVolume([...pick('chest', 2, 4), ...pick('shoulders', 1, 3), ...pick('arms', 7)], 3, 12)]),
      day('Pull II', 'Back · biceps', [withVolume([...pick('back', 4, 5, 6), ...pick('shoulders', 4), ...pick('arms', 2)], 3, 12)]),
      day('Legs II', 'Quads · hams · core', [withVolume([...pick('legs', 5, 6, 7, 8)], 3, 12), withVolume(pick('core', 0, 3), 3, 15)]),
    ],
  },
  {
    slug: 'strength-block-5',
    name: 'Strength Block',
    tagline: 'Low reps, heavy compounds, progressive overload.',
    level: 'Advanced',
    perWeek: 5,
    minutes: 65,
    goal: 'Max strength',
    accent: 'var(--color-iris)',
    days: [
      day('Press', 'Bench focus', [withVolume([...pick('chest', 0, 1), ...pick('arms', 5)], 5, 5)]),
      day('Hinge', 'Deadlift focus', [withVolume([...pick('back', 0, 3), ...pick('legs', 2)], 5, 5)]),
      day('Squat', 'Squat focus', [withVolume([...pick('legs', 0, 1, 3)], 5, 5)]),
      day('Overhead', 'Shoulders', [withVolume([...pick('shoulders', 0, 1, 2)], 5, 5), withVolume(pick('core', 0, 1), 3, 12)]),
      day('Accessory', 'Weak points', [withVolume([...pick('arms', 0, 6), ...pick('back', 2), ...pick('core', 4)], 3, 10)]),
    ],
  },
  {
    slug: 'sculpt-5',
    name: 'Sculpt 5',
    tagline: 'One muscle group per day, maximum focus.',
    level: 'Intermediate',
    perWeek: 5,
    minutes: 55,
    goal: 'Aesthetics',
    accent: 'var(--color-rose)',
    days: [
      day('Chest', 'Chest', [withVolume(pick('chest', 0, 1, 2, 3, 4), 4, 10)]),
      day('Back', 'Back', [withVolume(pick('back', 0, 1, 2, 3, 4), 4, 10)]),
      day('Legs', 'Legs', [withVolume(pick('legs', 0, 1, 2, 3, 4, 5), 4, 10)]),
      day('Shoulders', 'Shoulders + core', [withVolume(pick('shoulders', 0, 1, 2, 3), 4, 12), withVolume(pick('core', 0, 1), 3, 15)]),
      day('Arms', 'Biceps · triceps', [withVolume(pick('arms', 0, 1, 2, 5, 6, 7), 3, 12)]),
    ],
  },
  {
    slug: 'engine-4',
    name: 'Engine',
    tagline: 'Circuits that build stamina and muscular endurance.',
    level: 'All levels',
    perWeek: 4,
    minutes: 40,
    goal: 'Conditioning',
    accent: 'var(--color-volt-soft)',
    days: [
      day('Circuit 1', 'Push + core', [withVolume([...pick('chest', 2, 0), ...pick('back', 1), ...pick('core', 0, 1)], 3, 15)]),
      day('Circuit 2', 'Legs + core', [withVolume([...pick('legs', 0, 3, 4, 9), ...pick('core', 2)], 3, 20)]),
      day('Circuit 3', 'Upper', [withVolume([...pick('shoulders', 0, 1), ...pick('arms', 0, 5), ...pick('core', 3)], 3, 15)]),
      day('Circuit 4', 'Full body', [withVolume([...pick('chest', 1), ...pick('back', 0), ...pick('legs', 1), ...pick('core', 4)], 3, 15)]),
    ],
  },
];

export const findProgram = (slug) => PROGRAMS.find((p) => p.slug === slug);

/** Convert a template or saved plan into the API's program shape. */
export const toProgramPayload = ({ name, description, days }) => ({
  name,
  description: description || undefined,
  days: days.map((d) => ({
    name: d.name,
    exercises: d.exercises.map(({ id, name, muscle, gif_url, description1, description2, sets, reps }) => ({
      id, name, muscle, gif_url: gif_url ?? '', description1: description1 ?? '', description2: description2 ?? '',
      sets: Number(sets) || 3, reps: Number(reps) || 10,
    })),
  })),
});
