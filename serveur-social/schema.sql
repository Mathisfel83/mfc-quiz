-- =====================================================================
-- MFC Quiz : classements, amis, duels et plateau en direct
-- À coller UNE fois dans Supabase : SQL Editor > New query > Run.
-- Le script peut être relancé sans risque (il remplace les fonctions).
-- =====================================================================

-- ---------- Tables ----------
create table if not exists public.mfc_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  pseudo      text not null check (char_length(pseudo) between 2 and 20),
  face        text check (face is null or char_length(face) < 60000),
  xp          integer not null default 0 check (xp >= 0),
  goal        text,
  code        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.mfc_weeks (
  user_id  uuid not null references public.mfc_profiles(id) on delete cascade,
  week     date not null,
  xp       integer not null default 0,
  primary key (user_id, week)
);
create index if not exists mfc_weeks_week_xp on public.mfc_weeks (week, xp desc);
create index if not exists mfc_profiles_xp on public.mfc_profiles (xp desc);

create table if not exists public.mfc_friends (
  a  uuid not null references public.mfc_profiles(id) on delete cascade,
  b  uuid not null references public.mfc_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a <> b)
);

create table if not exists public.mfc_duels (
  id          uuid primary key default gen_random_uuid(),
  a           uuid not null references public.mfc_profiles(id) on delete cascade,
  b           uuid not null references public.mfc_profiles(id) on delete cascade,
  theme       text not null,
  qs          jsonb not null,
  a_score     integer, a_ms integer,
  b_score     integer, b_ms integer,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '24 hours'
);
create index if not exists mfc_duels_a on public.mfc_duels (a, created_at desc);
create index if not exists mfc_duels_b on public.mfc_duels (b, created_at desc);

create table if not exists public.mfc_rooms (
  code        text primary key,
  host        uuid not null references public.mfc_profiles(id) on delete cascade,
  state       jsonb not null,
  version     integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Aucun accès direct aux tables : tout passe par les fonctions ci-dessous.
alter table public.mfc_profiles enable row level security;
alter table public.mfc_weeks    enable row level security;
alter table public.mfc_friends  enable row level security;
alter table public.mfc_duels    enable row level security;
alter table public.mfc_rooms    enable row level security;
revoke all on public.mfc_profiles, public.mfc_weeks, public.mfc_friends, public.mfc_duels, public.mfc_rooms from anon, authenticated;

-- ---------- Semaine de jeu : du dimanche 20 h au dimanche 20 h (heure de Paris) ----------
-- Une semaine est désignée par la date du lundi qu'elle contient.
create or replace function public.mfc_week(t timestamptz default now())
returns date language sql stable set search_path = public as $$
  select (date_trunc('week', (t at time zone 'Europe/Paris') + interval '4 hours'))::date
$$;

create or replace function public.mfc_uid()
returns uuid language plpgsql stable set search_path = public as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'Connexion requise'; end if;
  return u;
end $$;

create or replace function public.mfc_card(p public.mfc_profiles, wxp integer)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object('id', p.id, 'pseudo', p.pseudo, 'face', p.face, 'xp', p.xp, 'wxp', coalesce(wxp, 0))
$$;

-- ---------- Profil + synchronisation des XP ----------
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
  p_xp := greatest(0, coalesce(p_xp, 0));
  select * into me from mfc_profiles where id = u for update;
  if not found then
    loop
      c := (select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '') from generate_series(1, 6));
      exit when not exists (select 1 from mfc_profiles where code = c);
    end loop;
    insert into mfc_profiles (id, pseudo, face, xp, goal, code)
    values (u, p_pseudo, p_face, p_xp, p_goal, c) returning * into me;
  else
    -- On ne compte que les XP gagnés depuis la dernière synchro (plafonnés par sécurité).
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

-- ---------- Classements ----------
-- p_kind : 'week' (semaine en cours), 'last' (podium figé de la semaine passée), 'all' (général)
-- p_friends : true = seulement mes amis et moi
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
       where not p_friends or p.id = u or exists (select 1 from mfc_friends f where f.a = u and f.b = p.id))
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
       where w.week = wk and w.xp > 0
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

-- ---------- Amis ----------
create or replace function public.mfc_add_friend(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid(); o mfc_profiles;
begin
  select * into o from mfc_profiles where code = upper(btrim(p_code));
  if not found then raise exception 'Aucun joueur avec ce code'; end if;
  if o.id = u then raise exception 'C''est ton propre code 😉'; end if;
  if not exists (select 1 from mfc_profiles where id = u) then raise exception 'Profil introuvable'; end if;
  if (select count(*) from mfc_friends where a = u) >= 200 then raise exception 'Tu as déjà 200 amis'; end if;
  insert into mfc_friends (a, b) values (u, o.id), (o.id, u) on conflict do nothing;
  return jsonb_build_object('id', o.id, 'pseudo', o.pseudo);
end $$;

create or replace function public.mfc_remove_friend(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid();
begin
  delete from mfc_friends where (a = u and b = p_id) or (a = p_id and b = u);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.mfc_friends()
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid();
begin
  return (select coalesce(jsonb_agg(mfc_card(p, w.xp) order by p.pseudo), '[]'::jsonb)
            from mfc_friends f join mfc_profiles p on p.id = f.b
            left join mfc_weeks w on w.user_id = p.id and w.week = mfc_week()
           where f.a = u);
end $$;

-- ---------- Duels à 2 (chacun joue quand il veut, 24 h pour répondre) ----------
create or replace function public.mfc_duel_create(p_friend uuid, p_theme text, p_qs jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid(); d uuid;
begin
  if not exists (select 1 from mfc_friends where a = u and b = p_friend) then raise exception 'Ajoute d''abord ce joueur en ami'; end if;
  if jsonb_typeof(p_qs) <> 'array' or jsonb_array_length(p_qs) <> 5 then raise exception 'Duel invalide'; end if;
  if (select count(*) from mfc_duels where a = u and b_score is null and expires_at > now()) >= 15 then
    raise exception 'Tu as déjà 15 duels en attente'; end if;
  insert into mfc_duels (a, b, theme, qs) values (u, p_friend, left(p_theme, 20), p_qs) returning id into d;
  return jsonb_build_object('id', d);
end $$;

create or replace function public.mfc_duel_play(p_id uuid, p_score integer, p_ms integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid(); r mfc_duels;
begin
  select * into r from mfc_duels where id = p_id for update;
  if not found or (r.a <> u and r.b <> u) then raise exception 'Duel introuvable'; end if;
  if r.expires_at < now() and not (r.a = u and r.a_score is null) then raise exception 'Ce duel a expiré'; end if;
  p_score := least(greatest(coalesce(p_score, 0), 0), 5); p_ms := greatest(coalesce(p_ms, 0), 0);
  if r.a = u and r.a_score is null then update mfc_duels set a_score = p_score, a_ms = p_ms where id = p_id;
  elsif r.b = u and r.b_score is null then update mfc_duels set b_score = p_score, b_ms = p_ms where id = p_id;
  else raise exception 'Tu as déjà joué ce duel'; end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.mfc_duels()
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid();
begin
  return (select coalesce(jsonb_agg(j order by created_at desc), '[]'::jsonb) from (
    select d.created_at, jsonb_build_object(
      'id', d.id, 'theme', d.theme, 'qs', d.qs, 'created', d.created_at, 'expires', d.expires_at,
      'expired', d.expires_at < now(), 'mine', d.a = u,
      'op', jsonb_build_object('id', o.id, 'pseudo', o.pseudo, 'face', o.face),
      'my', case when d.a = u then d.a_score else d.b_score end,
      'my_ms', case when d.a = u then d.a_ms else d.b_ms end,
      -- le score adverse n'est révélé qu'une fois que j'ai joué
      'his', case when (case when d.a = u then d.a_score else d.b_score end) is null then null
                  else case when d.a = u then d.b_score else d.a_score end end,
      'his_ms', case when (case when d.a = u then d.a_score else d.b_score end) is null then null
                  else case when d.a = u then d.b_ms else d.a_ms end end,
      'his_done', (case when d.a = u then d.b_score else d.a_score end) is not null) j
    from mfc_duels d join mfc_profiles o on o.id = case when d.a = u then d.b else d.a end
    where (d.a = u or d.b = u) and d.created_at > now() - interval '14 days'
    order by d.created_at desc limit 40) x);
end $$;

-- ---------- Plateau en direct (2 à 6 joueurs) ----------
-- L'état de la partie est un objet JSON géré par l'app ; le serveur garantit l'ordre des coups (version).
create or replace function public.mfc_room_create(p_state jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid(); c text; p mfc_profiles;
begin
  delete from mfc_rooms where updated_at < now() - interval '1 day';
  select * into p from mfc_profiles where id = u;
  if not found then raise exception 'Profil introuvable'; end if;
  p_state := jsonb_set(coalesce(p_state, '{}'::jsonb), '{players}',
             jsonb_build_array(jsonb_build_object('id', u, 'pseudo', p.pseudo, 'face', p.face, 'pos', 0)));
  loop
    c := (select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '') from generate_series(1, 4));
    exit when not exists (select 1 from mfc_rooms where code = c);
  end loop;
  insert into mfc_rooms (code, host, state) values (c, u, p_state);
  return jsonb_build_object('code', c, 'host', u, 'version', 1, 'state', p_state, 'me', u);
end $$;

create or replace function public.mfc_room_get(p_code text, p_version integer default 0)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r mfc_rooms; u uuid := mfc_uid();
begin
  select * into r from mfc_rooms where code = upper(btrim(p_code));
  if not found then raise exception 'Salon introuvable'; end if;
  if r.version <= coalesce(p_version, 0) then return jsonb_build_object('version', r.version, 'same', true); end if;
  return jsonb_build_object('code', r.code, 'host', r.host, 'version', r.version, 'state', r.state, 'me', u);
end $$;

create or replace function public.mfc_room_join(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid(); r mfc_rooms; p mfc_profiles; pl jsonb;
begin
  select * into r from mfc_rooms where code = upper(btrim(p_code)) for update;
  if not found then raise exception 'Salon introuvable, vérifie le code'; end if;
  select * into p from mfc_profiles where id = u;
  if not found then raise exception 'Profil introuvable'; end if;
  pl := coalesce(r.state->'players', '[]'::jsonb);
  if exists (select 1 from jsonb_array_elements(pl) e where e->>'id' = u::text) then
    return jsonb_build_object('code', r.code, 'host', r.host, 'version', r.version, 'state', r.state, 'me', u);
  end if;
  if r.state->>'status' <> 'lobby' then raise exception 'La partie a déjà commencé'; end if;
  if jsonb_array_length(pl) >= 6 then raise exception 'Le salon est complet (6 joueurs)'; end if;
  pl := pl || jsonb_build_array(jsonb_build_object('id', u, 'pseudo', p.pseudo, 'face', p.face, 'pos', 0));
  update mfc_rooms set state = jsonb_set(state, '{players}', pl), version = version + 1, updated_at = now()
   where code = r.code returning * into r;
  return jsonb_build_object('code', r.code, 'host', r.host, 'version', r.version, 'state', r.state, 'me', u);
end $$;

create or replace function public.mfc_room_act(p_code text, p_version integer, p_state jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid(); r mfc_rooms;
begin
  select * into r from mfc_rooms where code = upper(btrim(p_code)) for update;
  if not found then raise exception 'Salon introuvable'; end if;
  if not exists (select 1 from jsonb_array_elements(r.state->'players') e where e->>'id' = u::text) then
    raise exception 'Tu ne fais pas partie de ce salon'; end if;
  if r.version <> p_version then
    return jsonb_build_object('conflict', true, 'code', r.code, 'host', r.host, 'version', r.version, 'state', r.state, 'me', u);
  end if;
  update mfc_rooms set state = p_state, version = version + 1, updated_at = now() where code = r.code returning * into r;
  return jsonb_build_object('code', r.code, 'host', r.host, 'version', r.version, 'state', r.state, 'me', u);
end $$;

-- ---------- Droits : seules les personnes connectées peuvent appeler les fonctions ----------
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.mfc_me(text, integer, text, text),
  public.mfc_board(text, boolean, integer),
  public.mfc_add_friend(text),
  public.mfc_remove_friend(uuid),
  public.mfc_friends(),
  public.mfc_duel_create(uuid, text, jsonb),
  public.mfc_duel_play(uuid, integer, integer),
  public.mfc_duels(),
  public.mfc_room_create(jsonb),
  public.mfc_room_get(text, integer),
  public.mfc_room_join(text),
  public.mfc_room_act(text, integer, jsonb)
to authenticated;
