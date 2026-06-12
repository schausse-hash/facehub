// ============================================================
// FaceHub — Client API Dentitek (Group API V2)
// Basé sur la collection Postman V2.0.17 + changelog v2.2.06
// ------------------------------------------------------------
// Auth   : en-tête x-api-key
// Base   : https://{subDomain}.dentitek.info/v1
// Limites: 50 req/s, 4 requêtes simultanées max
// Mode   : "mock" (simulation) tant que la clé du portail
//          partenaires n'est pas disponible, puis "live".
// ============================================================

import { mockResponses } from './mockData'

// ---------- Configuration ----------
// La config vient de la table Supabase `dentitek_config`
// (voir sql/dentitek_migration.sql) et est chargée au démarrage.
let config = {
  mode: 'mock',          // 'mock' | 'live'
  subDomain: 'staging',  // ex: 'staging' ou le sous-domaine du groupe
  apiKey: '',            // clé du portail partenaires
}

export function configureDentitek({ mode, subDomain, apiKey }) {
  if (mode) config.mode = mode
  if (subDomain) config.subDomain = subDomain
  if (apiKey !== undefined) config.apiKey = apiKey
}

export function getDentitekConfig() {
  return { ...config, apiKey: config.apiKey ? '••••' + config.apiKey.slice(-4) : '' }
}

const baseUrl = () => `https://${config.subDomain}.dentitek.info/v1`

// ---------- File d'attente : max 4 requêtes simultanées ----------
const MAX_CONCURRENT = 4
let activeCount = 0
const queue = []

function runNext() {
  if (activeCount >= MAX_CONCURRENT || queue.length === 0) return
  const { fn, resolve, reject } = queue.shift()
  activeCount++
  fn()
    .then(resolve, reject)
    .finally(() => {
      activeCount--
      runNext()
    })
}

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject })
    runNext()
  })
}

// ---------- Appel HTTP de base ----------
async function call(method, path, { body, params } = {}) {
  // Mode simulation : aucune requête réseau
  if (config.mode === 'mock') {
    await new Promise(r => setTimeout(r, 150)) // latence simulée
    const mock = mockResponses(path, method, body, params)
    if (mock === undefined) {
      throw new DentitekError(404, `Aucune donnée simulée pour ${method} ${path}`)
    }
    return mock
  }

  const url = new URL(baseUrl() + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }

  return enqueue(async () => {
    const res = await fetch(url.toString(), {
      method,
      headers: {
        'x-api-key': config.apiKey,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (res.status === 429) throw new DentitekError(429, 'Limite de débit atteinte (50 req/s) — réessayer dans un instant')
    if (!res.ok) {
      let detail = ''
      try { detail = await res.text() } catch { /* ignore */ }
      throw new DentitekError(res.status, `Dentitek ${res.status}: ${detail || res.statusText}`)
    }
    return res.json()
  })
}

export class DentitekError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'DentitekError'
    this.status = status
  }
}

// ============================================================
// FAMILLE 1 — PRACTICES (lecture)
// ============================================================

export const dentitek = {

  /** Version de l'API */
  version: () => call('GET', '/version'),

  /** Liste des cliniques du groupe (→ contient les clinic_uuid) */
  practices: () => call('GET', '/practices'),

  /** Spécialistes / fournisseurs d'une clinique */
  providers: (clinicUuid) => call('GET', `/providers/${clinicUuid}`),

  /** Patients d'une clinique.
   *  options: { modified: N (jours, <30), with_deleted, limit, offset } */
  patients: (clinicUuid, options = {}) =>
    call('GET', `/patients/${clinicUuid}`, { params: options }),

  /** Recherche d'un patient par nom */
  patientInfo: (clinicUuid, patientName) =>
    call('GET', `/patientInfo/${clinicUuid}`, { params: { patientName } }),

  /** Transactions par année OU récemment modifiées.
   *  usage: transactions(uuid, { year: 2026 }) ou { date_modified: 5 } */
  transactions: (clinicUuid, { year, ...params } = {}) =>
    call('GET', `/transactions/${clinicUuid}${year ? '/' + year : ''}`, { params }),

  /** Paiements par année OU plage de dates { date_from, date_to } */
  payments: (clinicUuid, { year, ...params } = {}) =>
    call('GET', `/payments/${clinicUuid}${year ? '/' + year : ''}`, { params }),

  /** Réclamations d'assurance */
  claims: (clinicUuid, { year, ...params } = {}) =>
    call('GET', `/claims/${clinicUuid}${year ? '/' + year : ''}`, { params }),

  /** Assureurs */
  carriers: (clinicUuid, params = {}) =>
    call('GET', `/carriers/${clinicUuid}`, { params }),

  /** Garants */
  guarantors: (clinicUuid, params = {}) =>
    call('GET', `/guarantors/${clinicUuid}`, { params }),

  /** Références (refpat / isPatient inclus depuis v1.0.9) */
  referrals: (clinicUuid, params = {}) =>
    call('GET', `/referrals/${clinicUuid}`, { params }),

  /** Rendez-vous par année OU récemment modifiés { date_modified: N } */
  appointments: (clinicUuid, { year, ...params } = {}) =>
    call('GET', `/appointments/${clinicUuid}${year ? '/' + year : ''}`, { params }),

  // ============================================================
  // FAMILLE 2 — APPOINTMENTS (lecture + écriture)
  // ============================================================

  /** Créer un rendez-vous pour un patient EXISTANT (vrai rendez-vous).
   *  rdv = { idTypeTraitDentitek, idSpecialistDentitek, idOptColDentitek,
   *          date_from, date_to, note, idPatientDentitek } */
  makeAppointmentById: (clinicUuid, rdv) =>
    call('POST', '/appointment', { body: { clinic_uuid: clinicUuid, ...rdv } }),

  /** Créer un rendez-vous pour un NOUVEAU patient (note de rendez-vous).
   *  rdv = { idTypeTraitDentitek, idSpecialistDentitek, idOptColDentitek,
   *          date_from, date_to, firstName, lastName, email, mobile,
   *          province, country, birthDate } */
  makeAppointmentByName: (clinicUuid, rdv) =>
    call('POST', '/appointment', { body: { clinic_uuid: clinicUuid, ...rdv } }),

  /** Modifier un rendez-vous existant */
  updateAppointment: (clinicUuid, rdv) =>
    call('PUT', '/appointment', { body: { clinic_uuid: clinicUuid, status: 'MODIFIED', ...rdv } }),

  /** Confirmer un rendez-vous */
  confirmAppointment: (clinicUuid, idHorRdvPatDentitek) =>
    call('POST', '/appointmentConfirmation', { body: { clinic_uuid: clinicUuid, idHorRdvPatDentitek } }),

  /** Annuler un rendez-vous */
  cancelAppointment: (clinicUuid, idHorRdvPatDentitek) =>
    call('POST', '/appointmentCancel', { body: { clinic_uuid: clinicUuid, idHorRdvPatDentitek } }),

  /** Vérifier le statut de confirmations (idConfirmation: number[]) */
  appointmentStatus: (clinicUuid, idConfirmation) =>
    call('POST', '/appointmentStatus', { body: { clinic_uuid: clinicUuid, idConfirmation } }),

  /** Disponibilités pour un type de traitement + spécialiste.
   *  opts = { idTreatmentType, idSpecialist, idOptCol, date_from, date_to, includeComments } */
  getAvailabilities: (clinicUuid, opts) =>
    call('POST', '/getAvailabilities', { body: { clinic_uuid: clinicUuid, ...opts } }),

  /** Synchroniser l'horaire (rendez-vous d'une plage de dates,
   *  inclut statusConfirmation: "CONFIRMED" depuis v2.0.10) */
  syncRdv: (clinicUuid, date_from, date_to) =>
    call('POST', '/syncRdv', { body: { clinic_uuid: clinicUuid, date_from, date_to } }),

  /** Statut de synchronisation */
  syncStatus: (clinicUuid) =>
    call('POST', '/syncStatus', { body: { clinic_uuid: clinicUuid } }),

  /** Configuration de synchronisation (inclut idUserDentitek depuis v2.0.13) */
  syncConfig: (clinicUuid) =>
    call('POST', '/syncConfig', { body: { clinic_uuid: clinicUuid } }),

  /** Horaires d'une plage de dates (max ~3 mois depuis v2.0.21) */
  schedules: (clinicUuid, date_from, date_to) =>
    call('GET', `/schedules/${clinicUuid}`, { params: { date_from, date_to } }),

  /** Postes / opératoires de la clinique */
  postes: (clinicUuid) => call('GET', `/postes/${clinicUuid}`),

  // ============================================================
  // FAMILLE 3 — FAMILLES / PERSONNES
  // ============================================================

  persons: (clinicUuid) => call('GET', `/persons/${clinicUuid}`),
  families: (clinicUuid) => call('GET', `/families/${clinicUuid}`),
  dueDates: (clinicUuid) => call('GET', `/duedates/${clinicUuid}`),

  // ============================================================
  // FAMILLE 4 — KPI
  // ============================================================

  /** KPI rendez-vous patients pour un mois (format 'YYYY-MM') */
  kpiPatientAppointment: (yearMonth) =>
    call('GET', `/kpi_patient_appointment/${yearMonth}`),

  /** Âge des comptes recevables */
  receivablesAging: (clinicUuid) =>
    call('GET', `/receivables_aging/${clinicUuid}`),

  // ============================================================
  // NOUVEAUX ENDPOINTS (changelog v2.1+ / v2.2) — signatures
  // provisoires, à valider quand la collection à jour sera fournie
  // ============================================================

  /** Plans de traitement (nouveau depuis v2.0.21, colonnes ajoutées v2.1.03) */
  treatmentPlans: (clinicUuid, params = {}) =>
    call('GET', `/treatment_plan/${clinicUuid}`, { params }),

  /** Taux d'occupation (v2.2.06) */
  getOccupancyRate: (clinicUuid, params = {}) =>
    call('GET', `/getOccupancyRate/${clinicUuid}`, { params }),

  /** Rendez-vous prioritaires (v2.2.06) */
  getPriorityAppointments: (clinicUuid, params = {}) =>
    call('GET', `/getPriorityAppointments/${clinicUuid}`, { params }),
}

export default dentitek
