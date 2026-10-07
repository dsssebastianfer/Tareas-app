-- Semanas: esquema de base de datos para Supabase.
-- Se ejecuta una vez en el panel de Supabase: SQL Editor → New query → pegar todo → Run.
-- Es seguro volver a ejecutarlo (usa "if not exists" / "or replace").

-- ─────────────────────────────────────────────────────────────
-- Tablas. Cada fila pertenece a un usuario (user_id), que se completa solo con auth.uid().
-- ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  -- Ajustes de la app: nombre, tema, fondo, transparencias, orden, sonido…
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  emoji text not null default '📌',
  keywords text[] not null default '{}',
  "order" double precision not null default 0
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  -- Lunes de la semana en que se anotó: define el color de la tarea para siempre.
  week_key date not null,
  due_date date,
  -- Sin llave foránea a propósito: si se borra la categoría, la tarea queda «sin categoría»
  -- y deshacer el borrado la vuelve a asociar.
  category_id uuid,
  completed_at timestamptz,
  "order" double precision not null default 0
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  date date not null,
  time text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists categories_user_idx on public.categories (user_id);
create index if not exists tasks_user_idx on public.tasks (user_id);
create index if not exists reminders_user_idx on public.reminders (user_id);

-- ─────────────────────────────────────────────────────────────
-- Seguridad: cada persona solo puede ver y modificar sus propias filas.
-- ─────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.reminders enable row level security;

drop policy if exists "perfil propio" on public.profiles;
create policy "perfil propio" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "categorías propias" on public.categories;
create policy "categorías propias" on public.categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "tareas propias" on public.tasks;
create policy "tareas propias" on public.tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "recordatorios propios" on public.reminders;
create policy "recordatorios propios" on public.reminders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Cuenta nueva: crear su perfil (con el nombre que puso al registrarse)
-- y sus categorías iniciales.
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, settings)
  values (new.id, jsonb_build_object('name', coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1))))
  on conflict (id) do nothing;

  insert into public.categories (user_id, name, emoji, keywords, "order") values
    (new.id, 'CPHS', '🛡️', array['comité paritario', 'paritario'], 0),
    (new.id, 'Reuniones', '👥', array['reunión', 'junta', 'meet'], 1),
    (new.id, 'Procedimientos', '📋', array['procedimiento', 'protocolo', 'instructivo'], 2);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Fondos propios: carpeta privada por usuario en Storage ("backgrounds/<id del usuario>/…").
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('backgrounds', 'backgrounds', false)
on conflict (id) do nothing;

drop policy if exists "fondo propio: leer" on storage.objects;
create policy "fondo propio: leer" on storage.objects
  for select using (bucket_id = 'backgrounds' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "fondo propio: subir" on storage.objects;
create policy "fondo propio: subir" on storage.objects
  for insert with check (bucket_id = 'backgrounds' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "fondo propio: reemplazar" on storage.objects;
create policy "fondo propio: reemplazar" on storage.objects
  for update using (bucket_id = 'backgrounds' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "fondo propio: borrar" on storage.objects;
create policy "fondo propio: borrar" on storage.objects
  for delete using (bucket_id = 'backgrounds' and (storage.foldername(name))[1] = auth.uid()::text);
