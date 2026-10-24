-- Troca a foto única (photo_path) por uma lista de até 5 fotos (photo_paths).
-- Pode rodar sempre: se a tabela já estiver com photo_paths, não faz nada.

do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'animals' and column_name = 'photo_path'
    ) then
        alter table public.animals add column if not exists photo_paths text[];

        update public.animals set photo_paths = array[photo_path] where photo_paths is null;

        alter table public.animals
            alter column photo_paths set not null,
            add constraint animals_photo_paths_check check (cardinality(photo_paths) between 1 and 5),
            drop column photo_path;
    end if;
end $$;
