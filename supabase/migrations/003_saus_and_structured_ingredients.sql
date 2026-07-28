-- Kjør dette i Supabase SQL Editor.

-- 1) Legg til "Saus" som gyldig type
alter table recipes drop constraint if exists recipes_type_check;
alter table recipes add constraint recipes_type_check
  check (type in ('Frokost', 'Lunsj', 'Middag', 'Dessert', 'Vegetar', 'Fisk', 'Saus', 'Tilbehør', 'Siderett', 'Bakevare'));

-- 2) Gjør ingredienser strukturerte: {amount, unit, name} i stedet for ren tekst.
-- Eksisterende ingredienstekst legges i "name", uten mengde/enhet.
alter table recipes add column if not exists ingredients_new jsonb;

update recipes set ingredients_new = (
  select coalesce(
    jsonb_agg(jsonb_build_object('amount', null, 'unit', null, 'name', ing)),
    '[]'::jsonb
  )
  from unnest(ingredients) as ing
);

alter table recipes drop column ingredients;
alter table recipes rename column ingredients_new to ingredients;
alter table recipes alter column ingredients set default '[]'::jsonb;
alter table recipes alter column ingredients set not null;
