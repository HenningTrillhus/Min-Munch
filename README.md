# Min Munch

Your digital recipe book: collect your favourite dishes, search them and cook from your phone.

**Live:** [min-munch.vercel.app](https://min-munch.vercel.app)

The interface is in Norwegian. Min Munch also works as the recipe source for [Duolist](https://github.com/HenningTrillhus/duolist), the shared shopping list and dinner planner.

## Features

- **Recipe grid** with search and filters for food type, category and tags (vegetarian, fish)
- **Food types:** breakfast, lunch, dinner, dessert, sauce, accompaniment, side dish, baked goods and drinks
- **Several categories per recipe**, with autocomplete
- **Structured ingredients** with an amount and a unit (`stk`, `ss`, `ts`, `g`, `kg`, `ml`, `dl`, `l`) and unit scaling
- **Details per recipe:** preparation time, servings, price, difficulty (1 to 5), a heart rating for how much you love it, and free-form notes
- **Photos** uploaded straight from your phone's camera roll
- **Fullscreen recipe view** with editing
- **Recipe stack:** open several recipes and swipe between them, and pick up where you left off with the continue cooking session
- **Safe deleting** with your own confirmation dialog
- **Light and dark theme**, and a layout made for phones (two recipes per row)

## Tech

- **React 19** built with **Vite**
- **Supabase**: Postgres for recipes and Storage for photos
- **Oxlint** for linting
- Deployed on **Vercel**

## Getting started

You need Node.js and a free [Supabase](https://supabase.com) project.

```bash
npm install
cp .env.example .env
npm run dev
```

Fill in `.env` with your Supabase project details:

| Variable | What it is |
| --- | --- |
| `VITE_SUPABASE_URL` | The URL of your Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Its public anon key |

The dev server runs on port 5174 and is reachable from other devices on your network, so you can test on your phone.

### Set up the database

1. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates the `recipes` table and its policies.
2. Run [`supabase/migrations/005_recipe_images_storage.sql`](supabase/migrations/005_recipe_images_storage.sql) to create the storage bucket for photos.

The other files in [`supabase/migrations`](supabase/migrations) only upgrade a database created with an older version of the schema, so you don't need them for a fresh setup.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with Oxlint |

## Project structure

```
src/App.jsx                    App state, search and filters, and the main screens
src/components/                Recipe list, cards, detail view, form, stack and dialogs
src/constants.js               Food types, tags and ingredient units
src/lib/supabaseClient.js      Supabase client
src/lib/recipeImages.js        Photo upload helpers
supabase/schema.sql            Database schema
supabase/migrations/           Upgrade scripts for older databases
```

## Good to know

**There is no login.** This is a personal recipe book, so the row-level security policies allow anyone with the public anon key to read and write. Replace them with policies tied to `auth.uid()` before sharing it more widely.

---

## På norsk

Min Munch er min digitale oppskriftsbok: samle, søk og lag dine favorittretter. Appen er laget for mobil og bruker Supabase til oppskrifter og bilder. Se over for oppsett og teknologi.
