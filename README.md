# My Profyle

A multi-user portfolio builder. Each user signs up, edits their portfolio from
a dashboard, and gets a shareable public page at `/p/their-slug` — no code
editing required. Built with React + Vite on the frontend and Supabase
(Postgres, Auth, Storage) on the backend.

## Features

- **Accounts & auth** — email/password sign-up, login, and password reset via Supabase Auth.
- **Dashboard editor** — a sidebar with four tabs: Portfolio Content, Appearance, Share & Publish, and Account.
- **Autosave** — edits save automatically ~1 second after you stop typing; a status indicator shows Unsaved / Saving / Saved / Save failed, with a manual "Save now" fallback.
- **Appearance customization** — accent color, font, image shape, button/card style, layout, and header style, applied live to the public page without touching CSS.
- **Public portfolio pages** — each user gets `/p/:slug`; content includes a hero section, achievements/stats, an experience timeline, a hobbies carousel, and an about/contact section with an EmailJS-powered contact form.
- **Image uploads** — profile photo, background image, and hobby images stored in Supabase Storage.
- **AI resume import** — parses PDF/DOCX resumes, extracts structured profile data with OpenAI, and provides an editable confidence-highlighted preview before applying it.
- **QR code + share link** — generated per portfolio for easy sharing.
- **Light/dark theme** for the dashboard, persisted per user.

## Tech stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [React Router](https://reactrouter.com/)
- [Supabase](https://supabase.com/) — Postgres database, Auth, and Storage
- [EmailJS](https://www.emailjs.com/) — contact form delivery (configured per user)
- [react-slick](https://react-slick.neostack.com/), [react-countup](https://github.com/glennreyes/react-countup), [react-intersection-observer](https://github.com/thebuilder/react-intersection-observer), [lucide-react](https://lucide.dev/), [react-qr-code](https://github.com/rosskhanas/react-qr-code)

## Getting started

### 1. Clone and install

```shell
git clone <this-repo-url>
cd Complete_Portfolio
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run the entire contents of [`supabase/schema.sql`](supabase/schema.sql) — this creates the `profiles` and `portfolios` tables, row-level security policies, and storage buckets.
3. Copy `.env.example` to `.env` and fill in your project's values:

   ```shell
   cp .env.example .env
   ```

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_URL=https://template-portfolio-product.vercel.app
   VITE_GOOGLE_MAPS_API_KEY=your-google-places-api-key   # optional — enables city autocomplete
   ```

   Without `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` set, the app shows a setup warning instead of the dashboard/login pages. `VITE_GOOGLE_MAPS_API_KEY` is optional; the Location field falls back to a plain text input without it.

4. In **Supabase Dashboard → Authentication → URL Configuration**, set:

   - Site URL: `https://template-portfolio-product.vercel.app`
   - Redirect URLs: `https://template-portfolio-product.vercel.app/reset-password` and `http://localhost:5173/reset-password`

   Supabase falls back to the Site URL when a requested auth redirect is not allow-listed, so the production reset-password URL must appear here exactly.

### 3. Run the dev server

```shell
npm run dev
```

Visit `http://localhost:5173`.

### Resume import setup

The OpenAI key is used only by the authenticated `import-resume` Edge Function; never add it to a `VITE_` environment variable.

```shell
supabase db push
supabase secrets set OPENAI_API_KEY=your-openai-api-key
supabase functions deploy import-resume
```

The function defaults to the current `gpt-5.6` alias. To pin a different extraction model without changing code, set `OPENAI_RESUME_MODEL` as another Supabase secret. For local Edge Function development, put server-only secrets in `supabase/.env.local` and keep that file out of source control.

### 4. Try it out

- Sign up at `/login`, then land on `/dashboard` — a starter portfolio is created automatically.
- Fill in the Portfolio Content tab; changes autosave as you type.
- Set your slug in Share & Publish, then visit `/p/your-slug` to see the public page.
- Each portfolio owner configures their own EmailJS `serviceID`/`templateID`/`publicKey` in the dashboard for their contact form to send real emails — see [emailjs.com](https://www.emailjs.com/) to set one up.

## Project structure

```
src/
  pages/            Route-level pages (Landing, Login, Dashboard, Portfolio, Reset Password)
  components/
    1. Header Components/   Hero, Navbar, Typewriter (public portfolio page)
    2. Content Components/  Achievement, Projects (hobbies), Timeline
    3. Footer Components/   AboutMe, ContactMe
    4. Utility Components/  Spinner, ScrollToTopButton
    dashboard/       Dashboard editor sections and panels
  hooks/             useAuth, usePortfolio
  context/           AuthContext, ThemeContext
  services/          Supabase read/write calls
  utils/             Data mapping + appearance customization helpers
  styles/            Theme and portfolio-customization stylesheets
supabase/
  schema.sql         Full database schema — run this in the Supabase SQL Editor
```

## Building for production

```shell
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

This project deploys to [Vercel](https://vercel.com) (see `vercel.json`) — pushing to `main` triggers an automatic deploy when connected to a Vercel project.

## License

Proprietary — see [`Licence.txt`](Licence.txt). This project incorporates open-source third-party packages, which remain under their own licenses.
