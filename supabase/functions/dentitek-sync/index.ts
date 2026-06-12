// ============================================================
// FaceHub — Synchronisation nocturne Dentitek (Edge Function)
// Phase 2 du pivot. Planifiée chaque nuit via pg_cron
// (job `dentitek-sync-nocturne`, voir sql/dentitek_sync_nocturne.sql).
//
// Pour chaque clinique liée (dentitek_clinic_map.is_active) :
//   syncRdv (aujourd'hui → +30 jours) → upsert dans le cache
//   `dentitek_appointments`, journalisation dans `dentitek_sync_log`.
//
// Le mode vient de `dentitek_config` :
//   - mock : données simulées (miroir de src/services/dentitek/mockData.js)
//   - live : POST https://{sub_domain}.dentitek.info/v1/syncRdv (x-api-key)
// ============================================================

import { createClient } from 'npm:@supabase/supabase-js@2'

const DAYS_AHEAD = 30

// ---------- Données simulées (mêmes RDV que mockData.js) ----------
function plusDays(n: number, h: number, m: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(h, m, 0, 0)
  return d.toISOString().slice(0, 19)
}

function mockRdv(): Record<string, unknown>[] {
  return [
    { idHorRdvPatDentitek: 99101, idPatientDentitek: 15332, patientName: 'Baggar Amine', idSpecialistDentitek: 1, idTypeTraitDentitek: 14, date_from: plusDays(3, 10, 0), date_to: plusDays(3, 11, 0), note: 'Chirurgie implant 25', statusConfirmation: 'CONFIRMED' },
    { idHorRdvPatDentitek: 99102, idPatientDentitek: 13881, patientName: 'Tremblay Marie', idSpecialistDentitek: 1, idTypeTraitDentitek: 9, date_from: plusDays(4, 14, 30), date_to: plusDays(4, 15, 0), note: 'Suivi post-op', statusConfirmation: 'PENDING' },
    { idHorRdvPatDentitek: 99103, idPatientDentitek: 16002, patientName: 'Landry Jean', idSpecialistDentitek: 2, idTypeTraitDentitek: 5, date_from: plusDays(7, 9, 0), date_to: plusDays(7, 9, 45), note: 'Consultation implantologie', statusConfirmation: 'PENDING' },
  ]
}

// ---------- Appel réel à l'API Group V2 ----------
async function fetchRdvLive(subDomain: string, apiKey: string, clinicUuid: string, dateFrom: string, dateTo: string) {
  const res = await fetch(`https://${subDomain}.dentitek.info/v1/syncRdv`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ clinic_uuid: clinicUuid, date_from: dateFrom, date_to: dateTo }),
  })
  if (res.status === 429) throw new Error('Dentitek 429: limite de débit atteinte')
  if (!res.ok) throw new Error(`Dentitek ${res.status}: ${await res.text()}`)
  return res.json()
}

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: cfg } = await supabase.from('dentitek_config').select('*').limit(1).maybeSingle()
  if (!cfg) {
    return Response.json({ ok: false, error: 'dentitek_config introuvable' }, { status: 500 })
  }
  if (cfg.mode === 'live' && (!cfg.sub_domain || !cfg.api_key)) {
    return Response.json({ ok: false, error: 'Mode live sans sub_domain/api_key' }, { status: 500 })
  }

  const { data: maps, error: mapErr } = await supabase
    .from('dentitek_clinic_map')
    .select('dentitek_clinic_uuid, dentitek_clinic_name')
    .eq('is_active', true)
  if (mapErr) {
    return Response.json({ ok: false, error: mapErr.message }, { status: 500 })
  }

  const from = new Date()
  const to = new Date()
  to.setDate(to.getDate() + DAYS_AHEAD)
  const isoDate = (d: Date) => d.toISOString().slice(0, 10)

  const results: Record<string, unknown>[] = []

  for (const m of maps ?? []) {
    const clinicUuid = m.dentitek_clinic_uuid
    const startedAt = new Date().toISOString()
    try {
      const raw = cfg.mode === 'mock'
        ? mockRdv()
        : await fetchRdvLive(cfg.sub_domain, cfg.api_key, clinicUuid, isoDate(from), isoDate(to))
      const list = Array.isArray(raw) ? raw : (raw?.appointments ?? [])

      const rows = list
        .filter((r: Record<string, unknown>) => r.idHorRdvPatDentitek)
        .map((r: Record<string, unknown>) => ({
          id_hor_rdv_pat_dentitek: r.idHorRdvPatDentitek,
          dentitek_clinic_uuid: clinicUuid,
          id_patient_dentitek: r.idPatientDentitek ?? null,
          patient_name: r.patientName ?? null,
          id_specialist_dentitek: r.idSpecialistDentitek ?? null,
          id_type_trait_dentitek: r.idTypeTraitDentitek ?? null,
          date_from: r.date_from ?? null,
          date_to: r.date_to ?? null,
          note: r.note ?? null,
          status_confirmation: r.statusConfirmation ?? null,
          raw: r,
          synced_at: new Date().toISOString(),
        }))

      if (rows.length > 0) {
        const { error } = await supabase
          .from('dentitek_appointments')
          .upsert(rows, { onConflict: 'id_hor_rdv_pat_dentitek' })
        if (error) throw new Error(error.message)
      }

      await supabase.from('dentitek_sync_log').insert({
        dentitek_clinic_uuid: clinicUuid,
        endpoint: 'syncRdv (auto)',
        items_fetched: list.length,
        items_upserted: rows.length,
        status: 'ok',
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      })
      results.push({ clinic: m.dentitek_clinic_name || clinicUuid, ok: true, upserted: rows.length })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      await supabase.from('dentitek_sync_log').insert({
        dentitek_clinic_uuid: clinicUuid,
        endpoint: 'syncRdv (auto)',
        status: 'error',
        error_message: message,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      })
      results.push({ clinic: m.dentitek_clinic_name || clinicUuid, ok: false, error: message })
    }
  }

  return Response.json({ ok: true, mode: cfg.mode, clinics: results.length, results })
})
