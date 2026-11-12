# Kinetiq — web

The AI training OS: programs, macro targets, photo food logging, an AI coach and a gym finder.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · Motion · TanStack Query · React Router · Lenis · Sonner

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173 — /api is proxied to http://localhost:8000
```

Start the API (`kinetiq-api`) first. Set `VITE_DEV_API` to proxy to a different backend.

## Environment

| Variable       | When        | Purpose                                                   |
| -------------- | ----------- | --------------------------------------------------------- |
| `VITE_API_URL` | production  | Absolute URL of the API, e.g. `https://api.example.com`   |

No API keys live in the frontend anymore — all AI and map calls go through the backend.

## Structure

```
src/
  pages/Landing.jsx        marketing site (bento, pricing, FAQ, scroll animations)
  pages/Auth.jsx           sign in / sign up
  pages/app/*              Today · Programs · Library · Builder · Fuel · Snap & Log · Coach · Gym Finder · Settings
  components/AppShell.jsx  sidebar, mobile tab bar, ⌘K command palette
  components/ui/*          design-system primitives
  lib/                     api client, auth, queries, exercise library + program templates
```

## Deploy (Vercel)

`vercel.json` rewrites all routes to `index.html` for client-side routing and caches `/assets` immutably. Set `VITE_API_URL`.
