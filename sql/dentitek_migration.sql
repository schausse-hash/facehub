-- ============================================================
-- FaceHub — Migration: intégration Dentitek (Group API V2)
-- Projet Supabase: Esthetic-clinic (pmgbwtngjjnjwhmjxeuc)
-- À exécuter dans SQL Editor
-- ============================================================

-- 1) Configuration de la connexion Dentitek (une ligne par groupe)
create table if not exists dentitek_config (
  id uuid primary key default gen_random_uuid(),
  mode text not null default 'mock' check (mode in ('mock', 'live')),
  sub_domain text not null default 'staging',
  api_key text,                          -- clé du portail partenaires
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Mapping cliniques FaceHub ↔ cliniques Dentitek
create table if not exists dentitek_clinic_map (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  dentitek_clinic_uuid text not null,
  dentitek_clinic_name text,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique (clinic_id),
  unique (dentitek_clinic_uuid)
);

-- 3) Mapping patients FaceHub ↔ patients Dentitek
--    (clé du flux anti-double-saisie)
create table if not exists dentitek_patient_map (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  id_patient_dentitek bigint not null,
  dentitek_clinic_uuid text not null,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  unique (patient_id),
  unique (id_patient_dentitek, dentitek_clinic_uuid)
);

-- 4) Journal de synchronisation (polling, en l'absence de webhooks)
create table if not exists dentitek_sync_log (
  id bigint generated always as identity primary key,
  dentitek_clinic_uuid text not null,
  endpoint text not null,                -- ex: 'patients', 'appointments'
  items_fetched int default 0,
  items_upserted int default 0,
  status text not null default 'ok' check (status in ('ok', 'error')),
  error_message text,
  started_at timestamptz default now(),
  finished_at timestamptz
);

-- 5) Cache des rendez-vous Dentitek (pour le tableau de bord multi-cliniques)
create table if not exists dentitek_appointments (
  id_hor_rdv_pat_dentitek bigint primary key,
  dentitek_clinic_uuid text not null,
  id_patient_dentitek bigint,
  patient_name text,
  id_specialist_dentitek int,
  id_type_trait_dentitek int,
  date_from timestamptz,
  date_to timestamptz,
  note text,
  status_confirmation text,
  raw jsonb,                             -- payload complet pour audit
  synced_at timestamptz default now()
);
create index if not exists idx_dtk_appt_clinic_date
  on dentitek_appointments (dentitek_clinic_uuid, date_from);

-- 6) Sécurité RLS — accès réservé aux utilisateurs authentifiés approuvés
alter table dentitek_config enable row level security;
alter table dentitek_clinic_map enable row level security;
alter table dentitek_patient_map enable row level security;
alter table dentitek_sync_log enable row level security;
alter table dentitek_appointments enable row level security;

-- Lecture pour tout utilisateur authentifié approuvé
do $$
declare t text;
begin
  foreach t in array array['dentitek_clinic_map','dentitek_patient_map','dentitek_sync_log','dentitek_appointments']
  loop
    execute format($f$
      create policy "read_%1$s" on %1$I for select
      to authenticated using (true);
    $f$, t);
  end loop;
end $$;

-- La config (avec la clé API) : réservée aux super_admin / owner
create policy "read_dentitek_config" on dentitek_config for select
  to authenticated
  using (exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('super_admin','owner')
  ));

create policy "write_dentitek_config" on dentitek_config for all
  to authenticated
  using (exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('super_admin','owner')
  ));

-- Écriture du cache et des mappings : authenticated (l'app contrôle les rôles)
do $$
declare t text;
begin
  foreach t in array array['dentitek_clinic_map','dentitek_patient_map','dentitek_sync_log','dentitek_appointments']
  loop
    execute format($f$
      create policy "write_%1$s" on %1$I for all
      to authenticated using (true) with check (true);
    $f$, t);
  end loop;
end $$;

-- Ligne de config initiale (mode simulation)
insert into dentitek_config (mode, sub_domain)
select 'mock', 'staging'
where not exists (select 1 from dentitek_config);
