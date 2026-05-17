create table if not exists public.villages (
  id text primary key,
  name text not null,
  district text not null,
  population integer not null default 0,
  households integer not null default 0,
  health_centers integer not null default 0,
  schools integer not null default 0,
  public_facilities text[] not null default '{}',
  msmes text[] not null default '{}',
  potentials text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.villages enable row level security;

create policy "Village data is public readable"
on public.villages for select
using (true);

create policy "Authenticated admins can insert village data"
on public.villages for insert
to authenticated
with check (true);

create policy "Authenticated admins can update village data"
on public.villages for update
to authenticated
using (true)
with check (true);

create policy "Authenticated admins can delete village data"
on public.villages for delete
to authenticated
using (true);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_villages_updated_at on public.villages;

create trigger set_villages_updated_at
before update on public.villages
for each row execute function public.set_updated_at();
