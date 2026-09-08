# Hopayola — Phase 1

Custom-built homepage and account foundation, meant to sit alongside the
existing WordPress/WooCommerce shop (recommended at shop.hopayola.com).

## What's in here

- Homepage, About, Lifestyle placeholder
- Fashion pathways: Hire a Talent, Create a Team, Design My Outfit
  (each captures interest via a waitlist form for now, per Phase 1 scope)
- Real, working sign-up / sign-in via Supabase
- A minimal account page (profile info, saved measurements placeholder,
  order history placeholder) — the full KPI-style dashboard is Phase 2/3
- Database schema with three roles built in from day one: client,
  coordinator, admin

## Setup

### 1. Install dependencies

```
npm install
```

### 2. Create a Supabase project

Go to supabase.com, create a free project, and grab your project URL and
anon key from Project Settings → API.

### 3. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase values:

```
cp .env.local.example .env.local
```

### 4. Set up the database

In the Supabase dashboard, go to the SQL Editor, paste in the contents of
`supabase/schema.sql`, and run it. This creates:

- The `profiles` table with a `role` field (client / coordinator / admin)
- Automatic profile creation when someone signs up
- Row-level security so users only see their own data (with admins able
  to see everyone, ready for the future admin dashboard)
- A `waitlist_signups` table for the "coming soon" fashion pathway pages

### 5. Run it locally

```
npm run dev
```

Visit http://localhost:3000

## Notes on the setup

- **The Shop link in the nav points to shop.hopayola.com.** That doesn't
  exist yet — it's a placeholder for wherever the WooCommerce site ends up
  living. Update the URL in `components/Navbar.tsx` and
  `components/Footer.tsx` once that's decided.
- **Coordinator and admin roles** exist in the database but there's no UI
  for them yet — that's intentional, it's Phase 2/3 work. Right now every
  new sign-up defaults to `client`. To manually make someone a coordinator
  or admin for testing, update their role directly in the Supabase table
  editor.
- **Images are currently placeholder Unsplash photos.** Swap these for
  real Hopayola photography before launch — see `next.config.js` to add
  any new image domains you use.

## Design tokens

- Colors: near-black `#0A0A0A`, warm off-white `#FAFAF8`, royal purple
  `#5B2A86`, deep purple `#3D1D5C`, warm stone `#E8E5DE`
- Type: Fraunces (headlines), Inter (body)

## Not built yet (by design)

Per the project spec, these are Phase 2/3 and intentionally not in this
codebase, though the database and account structure are built to support
them without a rewrite:

- Client / Coordinator / Admin dashboards
- Artisan marketplace and matching
- AI styling engine, AI body/fabric analysis
- Milestone/escrow payments
- Mobile app
