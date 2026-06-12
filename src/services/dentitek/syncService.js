// ============================================================
// FaceHub — Service de synchronisation Dentitek → Supabase
// Phase 2 du pivot.
// En l'absence de webhooks chez Dentitek, on fait du polling :
//  - syncAppointments : syncRdv sur une plage de dates → cache
//    `dentitek_appointments` (tableau de bord multi-cliniques)
//  - importPatient    : patientInfo → création/liaison du patient
//    FaceHub + mapping `dentitek_patient_map` (anti-double-saisie)
// Chaque opération est journalisée dans `dentitek_sync_log`.
// ============================================================

import { supabase } from '../../supabaseClient'
import { dentitek } from './dentitekClient'

// ---------- utilitaires ----------
async function logSync(clinicUuid, endpoint, fn) {
  const startedAt = new Date().toISOString()
  try {
    const { fetched, upserted } = await fn()
    await supabase.from('dentitek_sync_log').insert({
      dentitek_clinic_uuid: clinicUuid,
      endpoint,
      items_fetched: fetched,
      items_upserted: upserted,
      status: 'ok',
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    })
    return { ok: true, fetched, upserted }
  } catch (e) {
    await supabase.from('dentitek_sync_log').insert({
      dentitek_clinic_uuid: clinicUuid,
      endpoint,
      status: 'error',
      error_message: String(e?.message || e),
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    })
    return { ok: false, error: String(e?.message || e) }
  }
}

const isoDate = (d) => d.toISOString().slice(0, 10)

// ============================================================
// 1) Synchroniser les rendez-vous d'une clinique
//    (par défaut : aujourd'hui → +30 jours)
// ============================================================
export async function syncAppointments(clinicUuid, { daysAhead = 30 } = {}) {
  return logSync(clinicUuid, 'syncRdv', async () => {
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + daysAhead)

    const rdvs = await dentitek.syncRdv(clinicUuid, isoDate(from), isoDate(to))
    const list = Array.isArray(rdvs) ? rdvs : (rdvs?.appointments || [])

    if (list.length === 0) return { fetched: 0, upserted: 0 }

    const rows = list
      .filter(r => r.idHorRdvPatDentitek)
      .map(r => ({
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

    const { error } = await supabase
      .from('dentitek_appointments')
      .upsert(rows, { onConflict: 'id_hor_rdv_pat_dentitek' })
    if (error) throw new Error(error.message)

    return { fetched: list.length, upserted: rows.length }
  })
}

/** Synchroniser toutes les cliniques liées (mapping actif) */
export async function syncAllClinics(options = {}) {
  const { data: maps, error } = await supabase
    .from('dentitek_clinic_map')
    .select('dentitek_clinic_uuid, dentitek_clinic_name')
    .eq('is_active', true)
  if (error) throw new Error(error.message)

  const results = []
  for (const m of maps || []) {
    const r = await syncAppointments(m.dentitek_clinic_uuid, options)
    results.push({ clinic: m.dentitek_clinic_name || m.dentitek_clinic_uuid, ...r })
  }
  return results
}

// ============================================================
// 2) Rechercher un patient dans Dentitek (par nom)
// ============================================================
export async function searchDentitekPatient(clinicUuid, patientName) {
  const res = await dentitek.patientInfo(clinicUuid, patientName)
  return Array.isArray(res) ? res : (res?.patients || [])
}

// ============================================================
// 3) Importer / lier un patient Dentitek dans FaceHub
//    - si un mapping existe déjà → retourne le patient lié
//    - sinon crée le patient FaceHub + le mapping
// ============================================================
export async function importPatient(clinicUuid, dtkPatient, facehubClinicId = null) {
  const idDtk = dtkPatient.idPatientDentitek
  if (!idDtk) throw new Error('Patient Dentitek sans idPatientDentitek')

  // Déjà lié ?
  const { data: existing } = await supabase
    .from('dentitek_patient_map')
    .select('patient_id')
    .eq('id_patient_dentitek', idDtk)
    .eq('dentitek_clinic_uuid', clinicUuid)
    .maybeSingle()

  if (existing?.patient_id) {
    return { patientId: existing.patient_id, created: false }
  }

  // Créer le patient FaceHub
  const fullName = [dtkPatient.firstName, dtkPatient.lastName].filter(Boolean).join(' ')
  const { data: created, error } = await supabase
    .from('patients')
    .insert({
      name: fullName || `Patient Dentitek ${idDtk}`,
      email: dtkPatient.email || null,
      phone: dtkPatient.mobile || dtkPatient.phone || null,
      birthdate: dtkPatient.birthDate || null,
      ...(facehubClinicId ? { clinic_id: facehubClinicId } : {}),
      notes: `Importé de Dentitek (id ${idDtk}) le ${new Date().toLocaleDateString('fr-CA')}`,
    })
    .select('id')
    .single()
  if (error) throw new Error('Création patient: ' + error.message)

  // Créer le mapping
  const { error: mapErr } = await supabase.from('dentitek_patient_map').insert({
    patient_id: created.id,
    id_patient_dentitek: idDtk,
    dentitek_clinic_uuid: clinicUuid,
    last_synced_at: new Date().toISOString(),
  })
  if (mapErr) throw new Error('Mapping patient: ' + mapErr.message)

  return { patientId: created.id, created: true }
}

// ============================================================
// 4) Lire le cache des rendez-vous (tableau de bord)
// ============================================================
export async function getCachedAppointments({ clinicUuid = null, from = null, to = null } = {}) {
  let q = supabase
    .from('dentitek_appointments')
    .select('*')
    .order('date_from', { ascending: true })

  if (clinicUuid) q = q.eq('dentitek_clinic_uuid', clinicUuid)
  if (from) q = q.gte('date_from', from)
  if (to) q = q.lte('date_from', to)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data || []
}

/** Derniers journaux de synchronisation */
export async function getSyncLogs(limit = 10) {
  const { data } = await supabase
    .from('dentitek_sync_log')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)
  return data || []
}
