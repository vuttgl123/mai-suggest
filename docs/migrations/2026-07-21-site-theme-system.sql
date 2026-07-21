begin;

create table if not exists public.site_theme_settings (
  id boolean primary key default true,
  manual_theme_key text,
  updated_by uuid
    references public.profiles(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_theme_settings_singleton_check check (id = true),
  constraint site_theme_settings_theme_key_check check (
    manual_theme_key is null
    or manual_theme_key in (
      'bordeaux',
      'valentine',
      'spring',
      'noel',
      'anniversary'
    )
  )
);

insert into public.site_theme_settings (id)
values (true)
on conflict (id) do nothing;

create table if not exists public.site_theme_schedules (
  id uuid primary key default gen_random_uuid(),
  theme_key text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  priority integer not null default 0,
  is_enabled boolean not null default true,
  created_by uuid
    references public.profiles(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_theme_schedules_theme_key_check check (
    theme_key in ('bordeaux', 'valentine', 'spring', 'noel', 'anniversary')
  ),
  constraint site_theme_schedules_window_check check (ends_at > starts_at),
  constraint site_theme_schedules_priority_check check (priority >= 0)
);

create index if not exists idx_site_theme_schedules_active_resolution
  on public.site_theme_schedules (priority desc, starts_at desc, id asc)
  where is_enabled = true;

drop trigger if exists set_site_theme_settings_updated_at
  on public.site_theme_settings;

create trigger set_site_theme_settings_updated_at
before update on public.site_theme_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_site_theme_schedules_updated_at
  on public.site_theme_schedules;

create trigger set_site_theme_schedules_updated_at
before update on public.site_theme_schedules
for each row execute function public.set_updated_at();

alter table public.site_theme_settings enable row level security;
alter table public.site_theme_schedules enable row level security;

drop policy if exists "site_theme_settings_public_select"
  on public.site_theme_settings;

create policy "site_theme_settings_public_select"
on public.site_theme_settings
for select
to anon, authenticated
using (true);

drop policy if exists "site_theme_settings_owner_update"
  on public.site_theme_settings;

create policy "site_theme_settings_owner_update"
on public.site_theme_settings
for update
to authenticated
using ((select private.is_owner()))
with check (
  (select private.is_owner())
  and updated_by = (select auth.uid())
);

drop policy if exists "site_theme_schedules_public_select"
  on public.site_theme_schedules;

create policy "site_theme_schedules_public_select"
on public.site_theme_schedules
for select
to anon, authenticated
using (true);

drop policy if exists "site_theme_schedules_owner_insert"
  on public.site_theme_schedules;

create policy "site_theme_schedules_owner_insert"
on public.site_theme_schedules
for insert
to authenticated
with check (
  (select private.is_owner())
  and created_by = (select auth.uid())
);

drop policy if exists "site_theme_schedules_owner_update"
  on public.site_theme_schedules;

create policy "site_theme_schedules_owner_update"
on public.site_theme_schedules
for update
to authenticated
using ((select private.is_owner()))
with check ((select private.is_owner()));

drop policy if exists "site_theme_schedules_owner_delete"
  on public.site_theme_schedules;

create policy "site_theme_schedules_owner_delete"
on public.site_theme_schedules
for delete
to authenticated
using ((select private.is_owner()));

revoke all on table public.site_theme_settings, public.site_theme_schedules
  from anon, authenticated;

grant select on table public.site_theme_settings, public.site_theme_schedules
  to anon, authenticated;

grant update on table public.site_theme_settings to authenticated;

grant insert, update, delete on table public.site_theme_schedules
  to authenticated;

grant all on table public.site_theme_settings, public.site_theme_schedules
  to service_role;

commit;
