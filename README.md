# Min Munch 🍲

Digital oppskriftsbok bygget med React + Vite og Supabase.

## Kom i gang

### 1. Sett opp Supabase

1. Opprett et gratis prosjekt på [supabase.com](https://supabase.com).
2. Gå til **SQL Editor** i Supabase-dashbordet og kjør innholdet i [`supabase/schema.sql`](supabase/schema.sql).
3. Gå til **Project Settings → API** og kopier `Project URL` og `anon public` key.

### 2. Konfigurer miljøvariabler

Kopier `.env.example` til `.env` og fyll inn verdiene fra Supabase:

```bash
cp .env.example .env
```

### 3. Installer og kjør

```bash
npm install
npm run dev
```

Appen kjører da på `http://localhost:5173`.

## Funksjoner

- Legg til oppskrifter med tittel, kategori, tid, porsjoner, ingredienser, fremgangsmåte og bilde
- Søk i oppskriftene
- Slett oppskrifter
- Data lagres i Supabase (Postgres) og er tilgjengelig fra alle enheter

## Teknisk

- **Frontend:** React + Vite
- **Backend/database:** Supabase (Postgres)

## Mulige neste steg

- Innlogging (Supabase Auth) slik at flere brukere kan ha hver sin oppskriftsbok
- Bildeopplasting via Supabase Storage i stedet for URL
- Kategori-filter og favoritter
