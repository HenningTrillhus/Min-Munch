-- Kjør dette i Supabase SQL Editor for å oppdatere en allerede opprettet recipes-tabell.

alter table recipes add column if not exists love_rating smallint check (love_rating between 1 and 5);
alter table recipes add column if not exists notes text;
