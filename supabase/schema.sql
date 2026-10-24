-- Pet Friends: estrutura do banco no Supabase.
-- Rode este arquivo inteiro no SQL Editor do projeto (Dashboard > SQL Editor > New query).
-- Pode rodar de novo sem problema: o que já existe é mantido e as regras de acesso são recriadas.

-- ---------- anúncios ----------

create table if not exists public.animals (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    name text check (char_length(name) <= 40),
    species text not null check (species in ('cao', 'gato', 'outro')),
    sex text not null check (sex in ('femea', 'macho')),
    age text not null check (char_length(age) between 1 and 30),
    size text not null check (size in ('pequeno', 'medio', 'grande')),
    vaccinated boolean not null default false,
    neutered boolean not null default false,
    city text not null default 'Capão da Canoa' check (char_length(city) between 2 and 60),
    description text check (char_length(description) <= 600),
    -- até 5 fotos; a primeira é a capa do anúncio
    photo_paths text[] not null check (cardinality(photo_paths) between 1 and 5),
    status text not null default 'disponivel' check (status in ('disponivel', 'adotado')),
    created_at timestamptz not null default now()
);

create index if not exists animals_status_created_idx on public.animals (status, created_at desc);
create index if not exists animals_owner_idx on public.animals (owner_id);

alter table public.animals enable row level security;

-- qualquer pessoa (mesmo sem login) vê os anúncios disponíveis; o dono vê também os já adotados
drop policy if exists "anúncios disponíveis são públicos" on public.animals;
create policy "anúncios disponíveis são públicos"
    on public.animals for select
    using (status = 'disponivel' or owner_id = auth.uid());

drop policy if exists "usuário logado cria anúncio em seu nome" on public.animals;
create policy "usuário logado cria anúncio em seu nome"
    on public.animals for insert to authenticated
    with check (owner_id = auth.uid());

drop policy if exists "dono edita o próprio anúncio" on public.animals;
create policy "dono edita o próprio anúncio"
    on public.animals for update to authenticated
    using (owner_id = auth.uid())
    with check (owner_id = auth.uid());

drop policy if exists "dono exclui o próprio anúncio" on public.animals;
create policy "dono exclui o próprio anúncio"
    on public.animals for delete to authenticated
    using (owner_id = auth.uid());

-- ---------- contato do anunciante ----------
-- fica numa tabela separada para que o WhatsApp só seja entregue a quem está logado,
-- e não apenas escondido na interface

create table if not exists public.animal_contacts (
    animal_id uuid primary key references public.animals (id) on delete cascade,
    whatsapp text not null check (whatsapp ~ '^[0-9]{12,13}$')
);

alter table public.animal_contacts enable row level security;

drop policy if exists "só usuário logado vê o contato" on public.animal_contacts;
create policy "só usuário logado vê o contato"
    on public.animal_contacts for select to authenticated
    using (true);

drop policy if exists "dono cadastra o contato do próprio anúncio" on public.animal_contacts;
create policy "dono cadastra o contato do próprio anúncio"
    on public.animal_contacts for insert to authenticated
    with check (exists (
        select 1 from public.animals a where a.id = animal_id and a.owner_id = auth.uid()
    ));

drop policy if exists "dono edita o contato do próprio anúncio" on public.animal_contacts;
create policy "dono edita o contato do próprio anúncio"
    on public.animal_contacts for update to authenticated
    using (exists (
        select 1 from public.animals a where a.id = animal_id and a.owner_id = auth.uid()
    ));

-- ---------- fotos ----------
-- bucket público para leitura; cada usuário só envia e apaga arquivos dentro da pasta com o próprio id

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('animal-photos', 'animal-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "usuário logado envia foto na própria pasta" on storage.objects;
create policy "usuário logado envia foto na própria pasta"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'animal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "dono apaga as próprias fotos" on storage.objects;
create policy "dono apaga as próprias fotos"
    on storage.objects for delete to authenticated
    using (bucket_id = 'animal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
