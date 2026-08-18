-- Kjør dette i Supabase SQL Editor.

-- 1) Ny categories-kolonne for flere kategorier per oppskrift (avløser category)
alter table recipes add column if not exists categories text[] not null default '{}';

-- 2) Flytt eksisterende enkelt-kategori over til den nye kolonnen
update recipes
set categories = array[category]
where category is not null and category <> '' and categories = '{}';

-- 3) Fjern den gamle enkeltverdi-kolonnen
alter table recipes drop column if exists category;
