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
    or (select private.is_owner())
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
    (select private.is_owner())
    or (
      author_id = (select auth.uid())
      and opens_at > now()
    )
  )
);

commit;
