-- ============================================================
-- FaceHub — Planification de la synchro nocturne Dentitek
-- Appliqué le 12 juin 2026 (migration `dentitek_sync_nocturne_pg_cron`)
--
-- pg_cron appelle l'Edge Function `dentitek-sync`
-- (supabase/functions/dentitek-sync/index.ts) chaque nuit à 07:00 UTC
-- = 3h00 à Montréal en heure d'été, 2h00 en heure d'hiver.
--
-- La fonction synchronise les RDV (aujourd'hui → +30 jours) de toutes
-- les cliniques liées (dentitek_clinic_map.is_active) vers le cache
-- `dentitek_appointments` et journalise dans `dentitek_sync_log`
-- (endpoint « syncRdv (auto) »).
--
-- Le jeton Bearer ci-dessous est la clé ANON du projet : elle est
-- publique par conception (déjà exposée dans le bundle du navigateur).
-- La fonction utilise la service_role en interne. La clé API Dentitek,
-- elle, reste en base (dentitek_config.api_key) — jamais ici.
-- ============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Re-planification idempotente
do $do$
begin
  perform cron.unschedule('dentitek-sync-nocturne');
exception when others then
  null; -- le job n'existait pas encore
end
$do$;

select cron.schedule(
  'dentitek-sync-nocturne',
  '0 7 * * *',
  $cmd$
  select net.http_post(
    url := 'https://pmgbwtngjjnjwhmjxeuc.supabase.co/functions/v1/dentitek-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZ2J3dG5nampuandobWp4ZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mjk4NjgsImV4cCI6MjA4NDMwNTg2OH0.yO0KR3nK8bINo2WXLfRipohFSXZHdAtrir0nUGAqYss'
    ),
    body := '{"source":"pg_cron"}'::jsonb
  );
  $cmd$
);
