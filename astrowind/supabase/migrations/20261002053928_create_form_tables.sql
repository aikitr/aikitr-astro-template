-- Form data is written only by the Cloudflare Worker using a Supabase secret key.
-- No public or authenticated browser role can read or write either table.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (
    char_length(email) between 3 and 254 and email = lower(email)
  ),
  consent_source text not null check (consent_source = 'website_form'),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

revoke all on public.contact_messages from public, anon, authenticated;
revoke all on public.newsletter_subscribers from public, anon, authenticated;
grant insert on public.contact_messages to service_role;
grant insert on public.newsletter_subscribers to service_role;

comment on table public.newsletter_subscribers is
  'Consent is recorded for storage and later contact; this starter does not send mail.';
