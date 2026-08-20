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

// Borne prudente sur la plage demandée à syncRdv : la limite exacte de ce
// endpoint n'est pas documentée, on s'aligne sur celle de /schedules
// (~3 mois depuis v2.0.21) plutôt que d'envoyer une plage arbitraire.
const MAX_DAYS_AHEAD = 92

// ============================================================
// 1) Synchroniser les rendez-vous d'une clinique
//    (par défaut : aujourd'hui → +30 jours)
// ============================================================
export async function syncAppointments(clinicUuid, { daysAhead = 30 } = {}) {
  return logSync(clinicUuid, 'syncRdv', async () => {
    const requested = daysAhead == null ? 30 : Number(daysAhead)
    const days = Math.min(
      Math.max(1, Number.isFinite(requested) ? requested : 30),
      MAX_DAYS_AHEAD,
    )
    if (days !== requested) {
      console.warn(
        `[dentitek] daysAhead=${daysAhead} ramené à ${days} jours (max ${MAX_DAYS_AHEAD})`,
      )
    }

    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + days)

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

  // user_id est NOT NULL sur `patients` : récupérer l'utilisateur courant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Aucune session active pour créer le patient')

  // Créer le patient FaceHub
  const fullName = [dtkPatient.firstName, dtkPatient.lastName].filter(Boolean).join(' ')
  const { data: created, error } = await supabase
    .from('patients')
    .insert({
      name: fullName || `Patient Dentitek ${idDtk}`,
      email: dtkPatient.email || null,
      phone: dtkPatient.mobile || dtkPatient.phone || null,
      birthdate: dtkPatient.birthDate || null,
      user_id: user.id,
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
// 3b) Liaison d'un patient FaceHub EXISTANT à un dossier Dentitek
//     (depuis la fiche patient — ne crée pas de doublon)
// ============================================================

/** Mapping Dentitek d'un patient FaceHub (null si non lié) */
export async function getPatientMapping(patientId) {
  const { data } = await supabase
    .from('dentitek_patient_map')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle()
  return data || null
}

export async function linkExistingPatient(clinicUuid, dtkPatient, patientId) {
  const idDtk = dtkPatient.idPatientDentitek
  if (!idDtk) throw new Error('Patient Dentitek sans idPatientDentitek')

  // Ce dossier Dentitek est-il déjà lié ?
  const { data: existing } = await supabase
    .from('dentitek_patient_map')
    .select('patient_id')
    .eq('id_patient_dentitek', idDtk)
    .eq('dentitek_clinic_uuid', clinicUuid)
    .maybeSingle()

  if (existing && existing.patient_id !== patientId) {
    throw new Error('Ce dossier Dentitek est déjà lié à un autre patient FaceHub')
  }
  if (existing) return { linked: false }

  const { error } = await supabase.from('dentitek_patient_map').insert({
    patient_id: patientId,
    id_patient_dentitek: idDtk,
    dentitek_clinic_uuid: clinicUuid,
    last_synced_at: new Date().toISOString(),
  })
  if (error) throw new Error('Liaison patient: ' + error.message)

  // Compléter les coordonnées manquantes du patient FaceHub
  const { data: p } = await supabase
    .from('patients')
    .select('email, phone, birthdate')
    .eq('id', patientId)
    .maybeSingle()
  const updates = {}
  if (p && !p.email && dtkPatient.email) updates.email = dtkPatient.email
  if (p && !p.phone && (dtkPatient.mobile || dtkPatient.phone)) updates.phone = dtkPatient.mobile || dtkPatient.phone
  if (p && !p.birthdate && dtkPatient.birthDate) updates.birthdate = dtkPatient.birthDate
  if (Object.keys(updates).length > 0) {
    await supabase.from('patients').update(updates).eq('id', patientId)
  }

  return { linked: true, updatedFields: Object.keys(updates) }
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
