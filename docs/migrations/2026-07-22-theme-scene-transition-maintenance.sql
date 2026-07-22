begin;

alter table public.site_theme_settings
  add column if not exists transition_state text not null default 'idle',
  add column if not exists transition_target_theme_key text,
  add column if not exists transition_started_at timestamptz;

alter table public.site_theme_settings
  drop constraint if exists site_theme_settings_transition_check;

alter table public.site_theme_settings
  add constraint site_theme_settings_transition_check check (
    (
      transition_state = 'idle'
      and transition_target_theme_key is null
      and transition_started_at is null
    )
    or
    (
      transition_state = 'transitioning'
      and transition_target_theme_key in (
        'bordeaux',
        'valentine',
        'spring',
        'noel',
        'anniversary'
      )
      and transition_started_at is not null
    )
  );

commit;
