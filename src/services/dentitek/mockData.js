// ============================================================
// FaceHub — Données simulées Dentitek (mode "mock")
// Permet de développer et démontrer toute l'intégration
// AVANT d'avoir la clé du portail partenaires.
// Structures basées sur la collection Postman V2.0.17.
// ============================================================

const CLINICS = [
  { clinic_uuid: 'mock-uuid-chausse', name: 'Cabinet Dr Chaussé', city: 'Montréal' },
  { clinic_uuid: 'mock-uuid-stluc', name: 'Centre Dentaire Saint-Luc', city: 'Saint-Jean-sur-Richelieu' },
  { clinic_uuid: 'mock-uuid-rosemont', name: 'Cité Rosemont', city: 'Montréal' },
]

const PROVIDERS = [
  { specialist_id: 1, idSpecialistDentitek: 1, firstName: 'Serge', lastName: 'Chaussé', role: 'Dentiste' },
  { specialist_id: 2, idSpecialistDentitek: 2, firstName: 'Rami', lastName: 'Youssef', role: 'Dentiste' },
  { specialist_id: 3, idSpecialistDentitek: 3, firstName: 'Reda', lastName: 'Alaoui', role: 'Dentiste' },
]

const PATIENTS = [
  { idPatientDentitek: 15332, firstName: 'Amine', lastName: 'Baggar', birthDate: '1985-03-14', mobile: '5145550101', email: 'a.baggar@exemple.ca', created_Date_dentitek: '2026-05-02' },
  { idPatientDentitek: 14210, firstName: 'Gabriel', lastName: 'Auger', birthDate: '1972-11-30', mobile: '5145550102', email: 'g.auger@exemple.ca', created_Date_dentitek: '2024-09-18' },
  { idPatientDentitek: 13881, firstName: 'Marie', lastName: 'Tremblay', birthDate: '1990-06-21', mobile: '4505550103', email: 'm.tremblay@exemple.ca', created_Date_dentitek: '2023-04-11' },
  { idPatientDentitek: 16002, firstName: 'Jean', lastName: 'Landry', birthDate: '1968-01-09', mobile: '5145550104', email: 'j.landry@exemple.ca', created_Date_dentitek: '2026-06-01' },
]

const today = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const plusDays = (n, h = 9, m = 0) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  d.setHours(h, m, 0, 0)
  return d.toISOString().slice(0, 19)
}

const APPOINTMENTS = [
  { idHorRdvPatDentitek: 99101, idPatientDentitek: 15332, patientName: 'Baggar Amine', idSpecialistDentitek: 1, idTypeTraitDentitek: 14, date_from: plusDays(3, 10, 0), date_to: plusDays(3, 11, 0), note: 'Chirurgie implant 25', statusConfirmation: 'CONFIRMED' },
  { idHorRdvPatDentitek: 99102, idPatientDentitek: 13881, patientName: 'Tremblay Marie', idSpecialistDentitek: 1, idTypeTraitDentitek: 9, date_from: plusDays(4, 14, 30), date_to: plusDays(4, 15, 0), note: 'Suivi post-op', statusConfirmation: 'PENDING' },
  { idHorRdvPatDentitek: 99103, idPatientDentitek: 16002, patientName: 'Landry Jean', idSpecialistDentitek: 2, idTypeTraitDentitek: 5, date_from: plusDays(7, 9, 0), date_to: plusDays(7, 9, 45), note: 'Consultation implantologie', statusConfirmation: 'PENDING' },
]

const TREATMENT_PLANS = [
  { id: 501, idPatientDentitek: 15332, title: 'Implant unitaire — dent 25', status: 'ACCEPTED', amount: 4350.00, created: '2026-05-20' },
  { id: 502, idPatientDentitek: 14210, title: 'Remplacement implant 21', status: 'PROPOSED', amount: 5120.00, created: '2026-04-02' },
]

const TRANSACTIONS = [
  { id: 9001, idPatientDentitek: 15332, type: 'TRT', code: '79606', description: 'Pose implant', amount: 1850.00, date: iso(today), record_status: 'C' },
  { id: 9002, idPatientDentitek: 13881, type: 'PAY', code: 'PAIE', description: 'Paiement carte', amount: -450.00, date: iso(today), record_status: 'C' },
]

const AVAILABILITIES = [
  { date_from: plusDays(5, 8, 30), date_to: plusDays(5, 9, 30), idOptCol: 7, poste: 'Op. 1' },
  { date_from: plusDays(5, 13, 0), date_to: plusDays(5, 14, 0), idOptCol: 7, poste: 'Op. 1' },
  { date_from: plusDays(6, 10, 0), date_to: plusDays(6, 11, 0), idOptCol: 8, poste: 'Op. 2' },
  { date_from: plusDays(8, 9, 0), date_to: plusDays(8, 10, 0), idOptCol: 7, poste: 'Op. 1' },
]

let mockRdvCounter = 99200

// ------------------------------------------------------------
// Routeur des réponses simulées
// ------------------------------------------------------------
export function mockResponses(path, method, body) {
  // --- Practices ---
  if (path === '/version') return { version: '2.2.06-mock', mode: 'simulation' }
  if (path === '/practices') return CLINICS
  if (path.startsWith('/providers/')) return PROVIDERS
  if (path.startsWith('/patientInfo/')) return PATIENTS.filter(p =>
    !body?.patientName || true) // la recherche réelle filtre côté serveur
  if (path.startsWith('/patients/')) return PATIENTS
  if (path.startsWith('/transactions/')) return TRANSACTIONS
  if (path.startsWith('/payments/')) return TRANSACTIONS.filter(t => t.type === 'PAY')
  if (path.startsWith('/claims/')) return []
  if (path.startsWith('/carriers/')) return [{ id: 1, name: 'SunLife' }, { id: 2, name: 'Canada Vie' }]
  if (path.startsWith('/guarantors/')) return []
  if (path.startsWith('/referrals/')) return [{ id: 1, name: 'Dr Reda Alaoui', refpat: false }]
  if (path.startsWith('/appointments/')) return APPOINTMENTS

  // --- Appointments (écriture) ---
  if (path === '/appointment' && method === 'POST') {
    const rdv = { idHorRdvPatDentitek: ++mockRdvCounter, statusConfirmation: 'PENDING', ...body }
    APPOINTMENTS.push(rdv)
    return { success: true, idHorRdvPatDentitek: rdv.idHorRdvPatDentitek }
  }
  if (path === '/appointment' && method === 'PUT') return { success: true, ...body }
  if (path === '/appointmentConfirmation') {
    const rdv = APPOINTMENTS.find(r => r.idHorRdvPatDentitek === body?.idHorRdvPatDentitek)
    if (rdv) rdv.statusConfirmation = 'CONFIRMED'
    return { success: true, idConfirmation: 222 }
  }
  if (path === '/appointmentCancel') return { success: true }
  if (path === '/appointmentStatus') return body?.idConfirmation?.map(id => ({ idConfirmation: id, status: 'CONFIRMED' })) || []
  if (path === '/getAvailabilities') return AVAILABILITIES
  if (path === '/syncRdv') return APPOINTMENTS
  if (path === '/syncStatus') return { status: 'OK', last_sync: new Date().toISOString() }
  if (path === '/syncConfig') return { idUserDentitek: 1, config: 'mock' }
  if (path.startsWith('/schedules/')) return APPOINTMENTS
  if (path.startsWith('/postes/')) return [{ idOptCol: 7, name: 'Opératoire 1' }, { idOptCol: 8, name: 'Opératoire 2' }]

  // --- Familles ---
  if (path.startsWith('/persons/')) return PATIENTS
  if (path.startsWith('/families/')) return []
  if (path.startsWith('/duedates/')) return [{ idPatientDentitek: 13881, due: '2026-09-01', type: 'rappel' }]

  // --- KPI ---
  if (path.startsWith('/kpi_patient_appointment/')) return { month: path.split('/').pop(), new_patients: 18, appointments: 312, confirmed: 271 }
  if (path.startsWith('/receivables_aging/')) return { '0-30': 12450.00, '31-60': 3210.00, '61-90': 980.00, '90+': 1540.00 }

  // --- Nouveaux endpoints v2.1+ ---
  if (path.startsWith('/treatment_plan/')) return TREATMENT_PLANS
  if (path.startsWith('/getOccupancyRate/')) return { rate: 0.82, period: 'mois courant' }
  if (path.startsWith('/getPriorityAppointments/')) return APPOINTMENTS.slice(0, 1)

  return undefined
}
