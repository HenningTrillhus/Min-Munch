-- Kjør dette i Supabase SQL Editor for å oppdatere en allerede opprettet recipes-tabell.

alter table recipes add column if not exists price numeric;
alter table recipes add column if not exists difficulty smallint check (difficulty between 1 and 5);
