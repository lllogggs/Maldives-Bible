begin;

create table if not exists public.resort_likes (
  profile_id text,
  resort_id integer,
  created_at timestamptz not null default now()
);

alter table public.resort_likes
  add column if not exists profile_id text,
  add column if not exists resort_id integer,
  add column if not exists created_at timestamptz not null default now();

delete from public.resort_likes
where profile_id is null
   or btrim(profile_id) = ''
   or resort_id is null
   or resort_id <= 0;

delete from public.resort_likes as duplicate
using public.resort_likes as keeper
where duplicate.ctid < keeper.ctid
  and duplicate.profile_id = keeper.profile_id
  and duplicate.resort_id = keeper.resort_id;

alter table public.resort_likes
  alter column profile_id set not null,
  alter column resort_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.resort_likes'::regclass
      and conname = 'resort_likes_resort_id_positive'
  ) then
    alter table public.resort_likes
      add constraint resort_likes_resort_id_positive check (resort_id > 0);
  end if;
end
$$;

create unique index if not exists resort_likes_profile_resort_uidx
  on public.resort_likes (profile_id, resort_id);

create index if not exists resort_likes_resort_id_idx
  on public.resort_likes (resort_id);

alter table public.resort_likes enable row level security;

revoke all on table public.resort_likes from anon, authenticated;
grant select, insert, delete on table public.resort_likes to service_role;

create or replace function public.get_resort_like_counts()
returns table (resort_id integer, likes_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select likes.resort_id, count(*)::bigint as likes_count
  from public.resort_likes as likes
  group by likes.resort_id
  order by likes.resort_id;
$$;

revoke all on function public.get_resort_like_counts() from public, anon, authenticated;
grant execute on function public.get_resort_like_counts() to service_role;

commit;
