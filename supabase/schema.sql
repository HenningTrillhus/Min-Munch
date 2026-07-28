-- Kjør dette i Supabase SQL Editor (Project -> SQL Editor -> New query)

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  type text check (type in ('Frokost', 'Lunsj', 'Middag', 'Dessert', 'Vegetar', 'Fisk', 'Saus', 'Tilbehør', 'Siderett', 'Bakevare')),
  prep_time_minutes int,
  servings int,
  price numeric,
  difficulty smallint check (difficulty between 1 and 5),
  love_rating smallint check (love_rating between 1 and 5),
  notes text,
  ingredients jsonb not null default '[]'::jsonb,
  instructions text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;

-- Personlig oppskriftsbok uten innlogging: tillat alle operasjoner via anon-nøkkelen.
-- Bytt ut med policies knyttet til auth.uid() hvis du legger til innlogging senere.
create policy "Allow all access to recipes"
  on recipes
  for all
  using (true)
  with check (true);

-- Bildeopplasting (kamerarull osv.) lagres i Supabase Storage, se
-- supabase/migrations/005_recipe_images_storage.sql for oppsett av bucket + policies.
