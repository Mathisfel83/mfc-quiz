-- MFC Quiz : mise à jour n°2 (blocage, signalement, suppression de compte). À coller après schema.sql.
alter table public.mfc_profiles add column if not exists banned boolean not null default false;

create table if not exists public.mfc_blocks (
  a  uuid not null references public.mfc_profiles(id) on delete cascade,
  b  uuid not null references public.mfc_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (a, b)
);

create table if not exists public.mfc_reports (
  id          bigint generated always as identity primary key,
  reporter    uuid references public.mfc_profiles(id) on delete set null,
  target      uuid references public.mfc_profiles(id) on delete cascade,
  pseudo      text,
  reason      text,
  created_at  timestamptz not null default now()
);
alter table public.mfc_blocks  enable row level security;
alter table public.mfc_reports enable row level security;
revoke all on public.mfc_blocks, public.mfc_reports from anon, authenticated;

create or replace function public.mfc_me(p_pseudo text, p_xp integer, p_face text default null, p_goal text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  u uuid := mfc_uid();
  me mfc_profiles;
  d integer;
  c text;
  wk date := mfc_week();
  wxp integer;
begin
  p_pseudo := left(btrim(coalesce(p_pseudo, '')), 20);
  if char_length(p_pseudo) < 2 then raise exception 'Choisis un pseudo de 2 caractères minimum'; end if;
  if lower(p_pseudo) ~ '(pute|salope|connard|connass|encul|nique ta|ntm|batard|bâtard|fdp|negr|nègre|nazi|hitler|bite|chatte|couille|merde|fuck|shit|bitch|nigg|pédé|pede)' then
    raise exception 'Ce pseudo n''est pas autorisé, choisis-en un autre'; end if;
  p_xp := greatest(0, coalesce(p_xp, 0));
  select * into me from mfc_profiles where id = u for update;
  if found and me.banned then raise exception 'Ton compte de joueur a été suspendu'; end if;
  if not found then
    loop
      c := (select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '') from generate_series(1, 6));
      exit when not exists (select 1 from mfc_profiles where code = c);
    end loop;
    insert into mfc_profiles (id, pseudo, face, xp, goal, code)
    values (u, p_pseudo, p_face, p_xp, p_goal, c) returning * into me;
  else
    d := least(greatest(p_xp - me.xp, 0), 3000);
    update mfc_profiles set pseudo = p_pseudo, face = coalesce(p_face, face), goal = coalesce(p_goal, goal),
           xp = xp + d, updated_at = now()
     where id = u returning * into me;
    if d > 0 then
      insert into mfc_weeks (user_id, week, xp) values (u, wk, d)
      on conflict (user_id, week) do update set xp = mfc_weeks.xp + excluded.xp;
    end if;
  end if;
  select xp into wxp from mfc_weeks where user_id = u and week = wk;
  return mfc_card(me, wxp) || jsonb_build_object(
    'code', me.code,
    'week', wk,
    'rank', (select count(*) + 1 from mfc_profiles where xp > me.xp),
    'total', (select count(*) from mfc_profiles));
end $$;

create or replace function public.mfc_board(p_kind text default 'week', p_friends boolean default false, p_limit integer default 10)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  u uuid := mfc_uid();
  wk date := case when p_kind = 'last' then mfc_week() - 7 else mfc_week() end;
  lim integer := least(greatest(coalesce(p_limit, 10), 1), 100);
  rows jsonb; mine integer; pos integer; tot integer;
begin
  if p_kind = 'all' then
    with pool as (
      select p.* from mfc_profiles p
       where not p.banned and not exists (select 1 from mfc_blocks k where k.a = u and k.b = p.id)
         and (not p_friends or p.id = u or exists (select 1 from mfc_friends f where f.a = u and f.b = p.id)))
    select coalesce(jsonb_agg(x.j order by x.xp desc, x.created_at), '[]'::jsonb) into rows from (
      select mfc_card(pool, w.xp) j, pool.xp, pool.created_at from pool
        left join mfc_weeks w on w.user_id = pool.id and w.week = mfc_week()
       order by pool.xp desc, pool.created_at limit lim) x;
    select xp into mine from mfc_profiles where id = u;
    select count(*) + 1 into pos from mfc_profiles p where p.xp > coalesce(mine, 0)
       and (not p_friends or exists (select 1 from mfc_friends f where f.a = u and f.b = p.id));
    select count(*) into tot from mfc_profiles p
     where not p_friends or p.id = u or exists (select 1 from mfc_friends f where f.a = u and f.b = p.id);
  else
    with pool as (
      select p.*, w.xp as wxp from mfc_weeks w join mfc_profiles p on p.id = w.user_id
       where w.week = wk and w.xp > 0 and not p.banned
         and not exists (select 1 from mfc_blocks k where k.a = u and k.b = p.id)
         and (not p_friends or p.id = u or exists (select 1 from mfc_friends f where f.a = u and f.b = p.id)))
    select coalesce(jsonb_agg(x.j order by x.wxp desc, x.created_at), '[]'::jsonb) into rows from (
      select jsonb_build_object('id', id, 'pseudo', pseudo, 'face', face, 'xp', xp, 'wxp', wxp) j, wxp, created_at
        from pool order by wxp desc, created_at limit lim) x;
    select xp into mine from mfc_weeks where user_id = u and week = wk;
    mine := coalesce(mine, 0);
    select count(*) + 1 into pos from mfc_weeks w where w.week = wk and w.xp > mine
       and (not p_friends or exists (select 1 from mfc_friends f where f.a = u and f.b = w.user_id));
    select count(*) into tot from mfc_weeks w where w.week = wk and w.xp > 0
       and (not p_friends or w.user_id = u or exists (select 1 from mfc_friends f where f.a = u and f.b = w.user_id));
  end if;
  return jsonb_build_object('kind', p_kind, 'week', wk, 'rows', rows, 'me', coalesce(mine, 0),
                            'pos', case when coalesce(mine, 0) > 0 or p_kind = 'all' then pos else null end, 'total', tot);
end $$;

create or replace function public.mfc_add_friend(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid(); o mfc_profiles;
begin
  select * into o from mfc_profiles where code = upper(btrim(p_code));
  if not found then raise exception 'Aucun joueur avec ce code'; end if;
  if o.id = u then raise exception 'C''est ton propre code'; end if;
  if o.banned or exists (select 1 from mfc_blocks k where (k.a = u and k.b = o.id) or (k.a = o.id and k.b = u)) then
    raise exception 'Impossible d''ajouter ce joueur'; end if;
  if not exists (select 1 from mfc_profiles where id = u) then raise exception 'Profil introuvable'; end if;
  if (select count(*) from mfc_friends where a = u) >= 200 then raise exception 'Tu as déjà 200 amis'; end if;
  insert into mfc_friends (a, b) values (u, o.id), (o.id, u) on conflict do nothing;
  return jsonb_build_object('id', o.id, 'pseudo', o.pseudo);
end $$;

create or replace function public.mfc_block(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid();
begin
  if p_id = u then raise exception 'Tu ne peux pas te bloquer toi-même'; end if;
  insert into mfc_blocks (a, b) values (u, p_id) on conflict do nothing;
  delete from mfc_friends where (a = u and b = p_id) or (a = p_id and b = u);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.mfc_unblock(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid();
begin
  delete from mfc_blocks where a = u and b = p_id;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.mfc_blocked()
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid();
begin
  return (select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'pseudo', p.pseudo) order by p.pseudo), '[]'::jsonb)
            from mfc_blocks k join mfc_profiles p on p.id = k.b where k.a = u);
end $$;

create or replace function public.mfc_report(p_id uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid();
begin
  if (select count(*) from mfc_reports where reporter = u and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Trop de signalements aujourd''hui'; end if;
  insert into mfc_reports (reporter, target, pseudo, reason)
  values (u, p_id, (select pseudo from mfc_profiles where id = p_id), left(coalesce(p_reason, ''), 200));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.mfc_delete_me()
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid();
begin
  delete from mfc_rooms where host = u;
  delete from mfc_profiles where id = u;
  begin
    delete from auth.users where id = u;
  exception when others then null;
  end;
  return jsonb_build_object('ok', true);
end $$;

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
