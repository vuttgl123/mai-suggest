begin;

create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  date_label text not null,
  occurred_on date,
  title text not null,
  story text not null,
  lesson text,
  image_url text,
  image_alt_text text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_by uuid
    references public.profiles(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timeline_entries_date_label_check
    check (char_length(trim(date_label)) between 1 and 80),
  constraint timeline_entries_title_check
    check (char_length(trim(title)) between 1 and 160),
  constraint timeline_entries_story_check
    check (char_length(trim(story)) between 1 and 8000),
  constraint timeline_entries_lesson_check
    check (
      lesson is null
      or char_length(trim(lesson)) between 1 and 1000
    ),
  constraint timeline_entries_image_alt_check
    check (
      image_url is null
      or char_length(trim(coalesce(image_alt_text, ''))) between 1 and 280
    ),
  constraint timeline_entries_sort_order_check
    check (sort_order >= 0)
);

create table if not exists public.timeline_responses (
  id uuid primary key default gen_random_uuid(),
  timeline_entry_id uuid not null
    references public.timeline_entries(id)
    on delete cascade,
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timeline_responses_content_check
    check (char_length(trim(content)) between 1 and 2000)
);

create index if not exists idx_timeline_entries_visible_order
  on public.timeline_entries(is_published, sort_order, occurred_on);

create index if not exists idx_timeline_responses_entry_created
  on public.timeline_responses(timeline_entry_id, created_at);

create index if not exists idx_timeline_responses_user
  on public.timeline_responses(user_id);

drop trigger if exists set_timeline_entries_updated_at
  on public.timeline_entries;

create trigger set_timeline_entries_updated_at
before update on public.timeline_entries
for each row execute function public.set_updated_at();

drop trigger if exists set_timeline_responses_updated_at
  on public.timeline_responses;

create trigger set_timeline_responses_updated_at
before update on public.timeline_responses
for each row execute function public.set_updated_at();

alter table public.timeline_entries enable row level security;
alter table public.timeline_responses enable row level security;

drop policy if exists "timeline_entries_member_select"
  on public.timeline_entries;

create policy "timeline_entries_member_select"
on public.timeline_entries
for select
to authenticated
using (
  (select private.is_active_member())
  and (
    is_published = true
    or (select private.is_owner())
  )
);

drop policy if exists "timeline_entries_owner_manage"
  on public.timeline_entries;

create policy "timeline_entries_owner_manage"
on public.timeline_entries
for all
to authenticated
using ((select private.is_owner()))
with check ((select private.is_owner()));

drop policy if exists "timeline_responses_member_select"
  on public.timeline_responses;

create policy "timeline_responses_member_select"
on public.timeline_responses
for select
to authenticated
using (
  (select private.is_active_member())
  and exists (
    select 1
    from public.timeline_entries
    where timeline_entries.id = timeline_responses.timeline_entry_id
      and (
        timeline_entries.is_published = true
        or (select private.is_owner())
      )
  )
);

drop policy if exists "timeline_responses_member_insert"
  on public.timeline_responses;

create policy "timeline_responses_member_insert"
on public.timeline_responses
for insert
to authenticated
with check (
  (select private.is_active_member())
  and user_id = (select auth.uid())
  and exists (
    select 1
    from public.timeline_entries
    where timeline_entries.id = timeline_responses.timeline_entry_id
      and timeline_entries.is_published = true
  )
);

drop policy if exists "timeline_responses_member_update"
  on public.timeline_responses;

create policy "timeline_responses_member_update"
on public.timeline_responses
for update
to authenticated
using (
  (select private.is_active_member())
  and user_id = (select auth.uid())
  and exists (
    select 1
    from public.timeline_entries
    where timeline_entries.id = timeline_responses.timeline_entry_id
      and timeline_entries.is_published = true
  )
)
with check (
  (select private.is_active_member())
  and user_id = (select auth.uid())
  and exists (
    select 1
    from public.timeline_entries
    where timeline_entries.id = timeline_responses.timeline_entry_id
      and timeline_entries.is_published = true
  )
);

drop policy if exists "timeline_responses_member_delete"
  on public.timeline_responses;

create policy "timeline_responses_member_delete"
on public.timeline_responses
for delete
to authenticated
using (
  (select private.is_active_member())
  and (
    user_id = (select auth.uid())
    or (select private.is_owner())
  )
);

revoke all on table public.timeline_entries from anon;
revoke all on table public.timeline_responses from anon;

grant select, insert, update, delete
on table public.timeline_entries, public.timeline_responses
to authenticated;

grant all
on table public.timeline_entries, public.timeline_responses
to service_role;

commit;
