begin;

create table if not exists public.future_letters (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null
    references public.profiles(id)
    on delete cascade,
  title text not null,
  content text not null,
  opens_at timestamptz not null,
  image_url text,
  image_alt_text text,
  music_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint future_letters_title_check
    check (char_length(trim(title)) between 1 and 160),
  constraint future_letters_content_check
    check (char_length(trim(content)) between 1 and 8000),
  constraint future_letters_image_alt_check
    check (
      image_url is null
      or char_length(trim(coalesce(image_alt_text, ''))) between 1 and 280
    ),
  constraint future_letters_opens_after_creation_check
    check (opens_at > created_at)
);

create index if not exists idx_future_letters_opened_at
  on public.future_letters(opens_at desc);

create index if not exists idx_future_letters_author_schedule
  on public.future_letters(author_id, opens_at);

drop trigger if exists set_future_letters_updated_at
  on public.future_letters;

create trigger set_future_letters_updated_at
before update on public.future_letters
for each row execute function public.set_updated_at();

alter table public.future_letters enable row level security;

drop policy if exists "future_letters_member_select"
  on public.future_letters;

create policy "future_letters_member_select"
on public.future_letters
for select
to authenticated
using (
  (select private.is_active_member())
  and (
    opens_at <= now()
    or author_id = (select auth.uid())
  )
);

drop policy if exists "future_letters_member_insert"
  on public.future_letters;

create policy "future_letters_member_insert"
on public.future_letters
for insert
to authenticated
with check (
  (select private.is_active_member())
  and author_id = (select auth.uid())
  and opens_at > now()
);

drop policy if exists "future_letters_member_update"
  on public.future_letters;

create policy "future_letters_member_update"
on public.future_letters
for update
to authenticated
using (
  (select private.is_active_member())
  and author_id = (select auth.uid())
  and opens_at > now()
)
with check (
  (select private.is_active_member())
  and author_id = (select auth.uid())
  and opens_at > now()
);

drop policy if exists "future_letters_member_delete"
  on public.future_letters;

create policy "future_letters_member_delete"
on public.future_letters
for delete
to authenticated
using (
  (select private.is_active_member())
  and author_id = (select auth.uid())
  and opens_at > now()
);

revoke all on table public.future_letters from anon;

grant select, insert, update, delete
on table public.future_letters
to authenticated;

grant all
on table public.future_letters
to service_role;

commit;
