-- Living Archive, decision D4 option A (approved 2026-09-29).
-- A sealed letter belongs to its author until it opens. The owner keeps
-- moderation rights over opened letters only.
--
-- Replaces the owner clauses added by 2026-07-24-owner-manage-future-letters.sql.
-- Not applied automatically: run it against the Supabase project deliberately.
-- The application already filters owner reads and deletes to opened letters,
-- so it stays correct before and after this migration.

begin;

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

drop policy if exists "future_letters_member_delete"
  on public.future_letters;

create policy "future_letters_member_delete"
on public.future_letters
for delete
to authenticated
using (
  (select private.is_active_member())
  and (
    (
      author_id = (select auth.uid())
      and opens_at > now()
    )
    or (
      (select private.is_owner())
      and opens_at <= now()
    )
  )
);

commit;
