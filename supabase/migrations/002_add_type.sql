-- Kjør dette i Supabase SQL Editor for å oppdatere en allerede opprettet recipes-tabell.

alter table recipes add column if not exists type text
  check (type in ('Frokost', 'Lunsj', 'Middag', 'Dessert', 'Vegetar', 'Fisk', 'Tilbehør', 'Siderett', 'Bakevare'));
