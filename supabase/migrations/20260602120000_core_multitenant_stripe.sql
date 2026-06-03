-- supastripe core schema: multitenant organizations + stripe billing + team invites
-- purpose: production-ready baseline for a subdomain/custom-domain multitenant saas starter

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- helper functions
-- ---------------------------------------------------------------------------

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.update_last_modified_by_column()
returns trigger as $$
begin
  new.last_modified_by = auth.uid();
  return new;
end;
$$ language plpgsql;

-- middleware tenant context (restricted parameters)
create or replace function public.set_config(parameter text, value text)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if parameter not in ('request.subdomain', 'request.custom_domain') then
    raise exception 'invalid config parameter: %', parameter;
  end if;
  perform pg_catalog.set_config(parameter, value, false);
end;
$$;

grant execute on function public.set_config(text, text) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_modified_by uuid references auth.users(id)
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger update_profile_timestamps
  before update on profiles
  for each row execute function update_updated_at_column();

create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Team members can view teammate profiles"
  on public.profiles for select to authenticated
  using (
    exists (
      select 1 from public.team_members tm1
      where tm1.user_id = (select auth.uid())
        and exists (
          select 1 from public.team_members tm2
          where tm2.user_id = profiles.id
            and tm1.organization_id = tm2.organization_id
        )
    )
  );

-- ---------------------------------------------------------------------------
-- organizations (tenant table — internal name; ui may say "workspace")
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subdomain text not null unique,
  logo_url text,
  owner_id uuid references auth.users(id),
  custom_domain text,
  custom_domain_verified boolean default false,
  subscription_status text default 'inactive',
  subscription_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_modified_by uuid references auth.users(id)
);

create index idx_organizations_subdomain on public.organizations(subdomain);
create index idx_organizations_custom_domain on public.organizations(custom_domain) where custom_domain is not null;

alter table public.organizations enable row level security;

create trigger update_organization_timestamps
  before update on organizations
  for each row execute function update_updated_at_column();

create trigger update_organization_last_modified
  before insert or update on organizations
  for each row execute function update_last_modified_by_column();

-- public tenant lookup view for middleware / anon routing
create or replace view public.organizations_public
with (security_invoker = on) as
select id, name, subdomain, custom_domain, custom_domain_verified, logo_url
from public.organizations;

-- ---------------------------------------------------------------------------
-- team members
-- ---------------------------------------------------------------------------

create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'staff')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_modified_by uuid references auth.users(id),
  unique (user_id, organization_id)
);

create index idx_team_members_user_id on public.team_members(user_id);
create index idx_team_members_organization_id on public.team_members(organization_id);

alter table public.team_members enable row level security;

create trigger update_team_member_timestamps
  before update on team_members
  for each row execute function update_updated_at_column();

-- ---------------------------------------------------------------------------
-- organization invites
-- ---------------------------------------------------------------------------

create table public.organization_invites (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'staff')),
  token text not null unique,
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_organization_invites_token on public.organization_invites(token);
create index idx_organization_invites_organization_id on public.organization_invites(organization_id);

alter table public.organization_invites enable row level security;

-- ---------------------------------------------------------------------------
-- stripe billing
-- ---------------------------------------------------------------------------

create table public.subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  stripe_product_id text not null,
  stripe_price_id text not null unique,
  name text not null,
  description text,
  price_cents integer not null,
  currency text not null default 'USD',
  billing_interval text not null check (billing_interval in ('month', 'year')),
  billing_interval_count integer not null default 1,
  trial_days integer default 0,
  sort_order integer default 0,
  is_active boolean not null default true,
  features jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  stripe_subscription_id text not null unique,
  stripe_invoice_id text,
  stripe_customer_id text not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  status text not null check (status in ('active', 'cancelled', 'expired', 'past_due', 'paused', 'unpaid', 'on_trial')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  trial_start timestamptz,
  trial_end timestamptz,
  cancelled_at timestamptz,
  price_cents integer not null,
  currency text not null default 'USD',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.subscription_events (
  id uuid primary key default uuid_generate_v4(),
  event_name text not null,
  stripe_subscription_id text,
  stripe_invoice_id text,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  webhook_data jsonb not null,
  processed boolean not null default false,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

create index idx_subscriptions_organization_id on public.subscriptions(organization_id);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);

alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_events enable row level security;

create trigger update_subscription_plans_updated_at
  before update on subscription_plans
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at_column();

create or replace view public.organization_subscriptions
with (security_invoker = on) as
select
  o.id as organization_id,
  o.name as organization_name,
  o.subdomain,
  s.id as subscription_id,
  s.status as subscription_status,
  s.current_period_start,
  s.current_period_end,
  s.trial_start,
  s.trial_end,
  sp.name as plan_name,
  sp.price_cents,
  sp.currency,
  sp.billing_interval
from public.organizations o
left join public.subscriptions s
  on o.id = s.organization_id
 and s.status = any (array['active', 'on_trial'])
left join public.subscription_plans sp on s.plan_id = sp.id;

-- billing rls
create policy "Public can view active subscription plans"
  on public.subscription_plans for select
  using (is_active = true);

create policy "Users can view own subscriptions"
  on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Service role manages subscriptions"
  on public.subscriptions for all
  using ((select auth.jwt()) ->> 'role' = 'service_role');

create policy "Service role manages subscription events"
  on public.subscription_events for all
  using ((select auth.jwt()) ->> 'role' = 'service_role');

create policy "Service role manages subscription plans"
  on public.subscription_plans for all
  using ((select auth.jwt()) ->> 'role' = 'service_role');

-- ---------------------------------------------------------------------------
-- organization rls (tenant-aware)
-- ---------------------------------------------------------------------------

create policy "Owners can view their organizations"
  on public.organizations for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Team members can view their organizations"
  on public.organizations for select to authenticated
  using (
    exists (
      select 1 from public.team_members tm
      where tm.organization_id = organizations.id
        and tm.user_id = (select auth.uid())
    )
  );

create policy "Anon can lookup tenant by subdomain context"
  on public.organizations for select to anon
  using (
    subdomain = coalesce(current_setting('request.subdomain', true), '')
    or custom_domain = coalesce(current_setting('request.custom_domain', true), '')
  );

create policy "Authenticated users can create organizations"
  on public.organizations for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Owners can update their organizations"
  on public.organizations for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- team member policies
create policy "Members can view team in their organization"
  on public.team_members for select to authenticated
  using (
    exists (
      select 1 from public.team_members tm
      where tm.organization_id = team_members.organization_id
        and tm.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.organizations o
      where o.id = team_members.organization_id
        and o.owner_id = (select auth.uid())
    )
  );

create policy "Owners and admins can manage team members"
  on public.team_members for insert to authenticated
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = team_members.organization_id
        and o.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.team_members tm
      where tm.organization_id = team_members.organization_id
        and tm.user_id = (select auth.uid())
        and tm.role = 'admin'
    )
  );

create policy "Owners and admins can update team members"
  on public.team_members for update to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.id = team_members.organization_id
        and o.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.team_members tm
      where tm.organization_id = team_members.organization_id
        and tm.user_id = (select auth.uid())
        and tm.role = 'admin'
    )
  );

create policy "Owners and admins can delete team members"
  on public.team_members for delete to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.id = team_members.organization_id
        and o.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.team_members tm
      where tm.organization_id = team_members.organization_id
        and tm.user_id = (select auth.uid())
        and tm.role = 'admin'
    )
  );

-- invite policies
create policy "Org owners and admins can view invites"
  on public.organization_invites for select to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_invites.organization_id
        and o.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.team_members tm
      where tm.organization_id = organization_invites.organization_id
        and tm.user_id = (select auth.uid())
        and tm.role = 'admin'
    )
    or organization_invites.email = (select email from auth.users where id = (select auth.uid()))
  );

create policy "Org owners and admins can create invites"
  on public.organization_invites for insert to authenticated
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_invites.organization_id
        and o.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.team_members tm
      where tm.organization_id = organization_invites.organization_id
        and tm.user_id = (select auth.uid())
        and tm.role = 'admin'
    )
  );

create policy "Org owners and admins can update invites"
  on public.organization_invites for update to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_invites.organization_id
        and o.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.team_members tm
      where tm.organization_id = organization_invites.organization_id
        and tm.user_id = (select auth.uid())
        and tm.role = 'admin'
    )
    or organization_invites.email = (select email from auth.users where id = (select auth.uid()))
  );

create policy "Org owners and admins can delete invites"
  on public.organization_invites for delete to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_invites.organization_id
        and o.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.team_members tm
      where tm.organization_id = organization_invites.organization_id
        and tm.user_id = (select auth.uid())
        and tm.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- rpc helpers
-- ---------------------------------------------------------------------------

create or replace function public.check_subdomain_exists(p_subdomain text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organizations where subdomain = p_subdomain
  );
$$;

grant execute on function public.check_subdomain_exists(text) to authenticated, anon;

-- seed placeholder plans (replace stripe ids in .env / seed step)
insert into public.subscription_plans (
  stripe_product_id,
  stripe_price_id,
  name,
  description,
  price_cents,
  billing_interval,
  trial_days,
  sort_order,
  is_active,
  features
) values
  (
    'prod_starter_placeholder',
    'price_starter_placeholder',
    'Starter',
    'Core multitenant features for small teams.',
    0,
    'month',
    14,
    0,
    true,
    '["1 workspace", "Subdomain hosting", "Team invites", "Basic support"]'::jsonb
  ),
  (
    'prod_pro_placeholder',
    'price_pro_placeholder',
    'Pro',
    'Advanced features for growing teams.',
    2900,
    'month',
    14,
    1,
    true,
    '["Custom domain", "Priority support", "Advanced analytics", "Higher limits"]'::jsonb
  );
