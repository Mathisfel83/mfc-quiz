create table if not exists public.mfc_interest (
  id          bigint generated always as identity primary key,
  user_id     uuid,
  plan        text,
  created_at  timestamptz not null default now()
);
alter table public.mfc_interest enable row level security;
revoke all on public.mfc_interest from anon, authenticated;

create or replace function public.mfc_interest(p_plan text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := mfc_uid();
begin
  delete from mfc_interest where user_id = u;
  insert into mfc_interest (user_id, plan) values (u, left(coalesce(p_plan, ''), 20));
  return jsonb_build_object('ok', true);
end $$;

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
