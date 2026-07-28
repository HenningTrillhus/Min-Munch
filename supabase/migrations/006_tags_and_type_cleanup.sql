-- Kjør dette i Supabase SQL Editor.

-- 1) Ny tags-kolonne for Vegetar/Fisk (nå avkrysningsbokser, ikke type mat)
alter table recipes add column if not exists tags text[] not null default '{}'
  check (tags <@ array['Vegetar', 'Fisk']::text[]);

-- 2) Flytt eksisterende "type = Vegetar/Fisk" over til tags, og nullstill type for de radene
update recipes
set tags = array_append(tags, type)
where type in ('Vegetar', 'Fisk') and not (type = any(tags));

update recipes set type = null where type in ('Vegetar', 'Fisk');

-- 3) Oppdater gyldige type-verdier: fjern Vegetar/Fisk, legg til Drikke
alter table recipes drop constraint if exists recipes_type_check;
alter table recipes add constraint recipes_type_check
  check (type in ('Frokost', 'Lunsj', 'Middag', 'Dessert', 'Saus', 'Tilbehør', 'Siderett', 'Bakevare', 'Drikke'));
