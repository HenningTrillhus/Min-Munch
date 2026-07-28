-- Kjør dette i Supabase SQL Editor for å sette opp bildeopplasting.

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- Personlig oppskriftsbok uten innlogging: tillat alle operasjoner via anon-nøkkelen,
-- samme mønster som recipes-tabellen.
create policy "Public read access to recipe images"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Allow uploads to recipe images"
  on storage.objects for insert
  with check (bucket_id = 'recipe-images');

create policy "Allow deletes from recipe images"
  on storage.objects for delete
  using (bucket_id = 'recipe-images');
