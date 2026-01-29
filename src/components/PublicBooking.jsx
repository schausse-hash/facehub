import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  ChevronLeft: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
  Building: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
}

const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation', description: 'Première visite ou évaluation', duration: 30 },
  { value: 'botox', label: 'Toxine Botulique', description: 'Traitement anti-rides', duration: 45 },
  { value: 'filler', label: 'Injection Filler', description: 'Comblement et volumisation', duration: 60 },
  { value: 'microneedling', label: 'Microneedling', description: 'Traitement de la peau', duration: 60 },
  { value: 'followup', label: 'Suivi', description: 'Rendez-vous de contrôle', duration: 15 },
]

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function PublicBooking({ clinicId }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [clinic, setClinic] = useState(null)
  const [practitioners, setPractitioners] = useState([])
  const [selectedPractitioner, setSelectedPractitioner] = useState(null)
  const [practitionerSettings, setPractitionerSettings] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [existingAppointments, setExistingAppointments] = useState([])
  const [bookingComplete, setBookingComplete] = useState(false)
  const [error, setError] = useState(null)
  
  const [patientForm, setPatientForm] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '' })

  useEffect(() => { fetchClinicData() }, [clinicId])
  useEffect(() => { if (selectedPractitioner) fetchPractitionerSettings() }, [selectedPractitioner])
  useEffect(() => { if (selectedDate && practitionerSettings) generateAvailableSlots() }, [selectedDate, practitionerSettings, existingAppointments])

  const fetchClinicData = async () => {
    setLoading(true)
    const { data: clinicData, error: clinicError } = await supabase.from('clinics').select('*').eq('id', clinicId).single()
    if (clinicError || !clinicData) { setError('Clinique introuvable'); setLoading(false); return }
    setClinic(clinicData)

    const { data: rolesData } = await supabase.from('user_roles').select('user_id, role').eq('clinic_id', clinicId).in('role', ['practitioner', 'admin', 'super_admin'])
    if (rolesData?.length) {
      const userIds = rolesData.map(r => r.user_id)
      const { data: profilesData } = await supabase.from('user_profiles').select('user_id, first_name, last_name').in('user_id', userIds)
      const { data: settingsData } = await supabase.from('schedule_settings').select('user_id, booking_settings').in('user_id', userIds)
      const list = profilesData?.map(p => {
        const settings = settingsData?.find(s => s.user_id === p.user_id)
        return { id: p.user_id, name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Praticien', bookingEnabled: settings?.booking_settings?.enabled !== false }
      }).filter(p => p.bookingEnabled) || []
      setPractitioners(list)
    }
    setLoading(false)
  }

  const fetchPractitionerSettings = async () => {
    const { data } = await supabase.from('schedule_settings').select('*').eq('user_id', selectedPractitioner.id).single()
    const defaultSettings = {
      availability: { monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] }, tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] }, wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] }, thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] }, friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] }, saturday: { enabled: false, slots: [] }, sunday: { enabled: false, slots: [] } },
      booking_settings: { minNoticeHours: 24, maxAdvanceDays: 60, slotDuration: 30, bufferTime: 0 },
      blocked_dates: []
    }
    setPractitionerSettings(data || defaultSettings)
    
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 60)
    const { data: appts } = await supabase.from('appointments').select('date, start_time, end_time').eq('practitioner_id', selectedPractitioner.id).eq('clinic_id', clinicId).gte('date', startDate.toISOString().split('T')[0]).lte('date', endDate.toISOString().split('T')[0]).neq('status', 'cancelled')
    setExistingAppointments(appts || [])
  }

  const generateAvailableSlots = () => {
    if (!selectedDate || !practitionerSettings) return
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()]
    const dayAvailability = practitionerSettings.availability?.[dayKey]
    if (!dayAvailability?.enabled) { setAvailableSlots([]); return }

    const dateStr = selectedDate.toISOString().split('T')[0]
    const bookedSlots = existingAppointments.filter(a => a.date === dateStr).map(a => ({ start: a.start_time, end: a.end_time }))
    const slotDuration = practitionerSettings.booking_settings?.slotDuration || 30
    const minNoticeHours = practitionerSettings.booking_settings?.minNoticeHours || 24
    const typeDuration = selectedType?.duration || slotDuration
    const now = new Date()
    const minBookingTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000)
    const slots = []

    dayAvailability.slots.forEach(slot => {
      const [startH, startM] = slot.start.split(':').map(Number)
      const [endH, endM] = slot.end.split(':').map(Number)
      for (let m = startH * 60 + startM; m + typeDuration <= endH * 60 + endM; m += slotDuration) {
        const slotStart = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
        const slotEndMin = m + typeDuration
        const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, '0')}:${String(slotEndMin % 60).padStart(2, '0')}`
        const slotDateTime = new Date(selectedDate)
        slotDateTime.setHours(Math.floor(m / 60), m % 60, 0, 0)
        if (slotDateTime <= minBookingTime) continue
        const hasConflict = bookedSlots.some(booked => slotStart < booked.end && slotEnd > booked.start)
        if (!hasConflict) slots.push({ start: slotStart, end: slotEnd })
      }
    })
    setAvailableSlots(slots)
  }

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear(), month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0)
    const days = []
    const prevMonth = new Date(year, month, 0)
    for (let i = firstDay.getDay() - 1; i >= 0; i--) days.push({ date: new Date(year, month - 1, prevMonth.getDate() - i), isCurrentMonth: false })
    for (let d = 1; d <= lastDay.getDate(); d++) days.push({ date: new Date(year, month, d), isCurrentMonth: true })
    while (days.length < 42) { const d = days.length - (firstDay.getDay() + lastDay.getDate()) + 1; days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false }) }
    return days
  }

  const isDayAvailable = (date) => {
    if (!practitionerSettings) return false
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (date < today) return false
    const maxDays = practitionerSettings.booking_settings?.maxAdvanceDays || 60
    const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + maxDays)
    if (date > maxDate) return false
    if (practitionerSettings.blocked_dates?.includes(date.toISOString().split('T')[0])) return false
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
    return practitionerSettings.availability?.[dayKey]?.enabled || false
  }

  const handleSubmit = async () => {
    if (!selectedPractitioner || !selectedType || !selectedDate || !selectedTime) return
    if (!patientForm.firstName || !patientForm.lastName) { alert('Veuillez entrer votre nom complet.'); return }
    if (practitionerSettings?.booking_settings?.requireEmail && !patientForm.email) { alert('Veuillez entrer votre courriel.'); return }
    if (practitionerSettings?.booking_settings?.requirePhone && !patientForm.phone) { alert('Veuillez entrer votre téléphone.'); return }
    
    setSubmitting(true)
    const { error } = await supabase.from('appointments').insert([{
      clinic_id: clinicId, practitioner_id: selectedPractitioner.id,
      patient_name: `${patientForm.firstName} ${patientForm.lastName}`,
      appointment_type: selectedType.value, date: selectedDate.toISOString().split('T')[0],
      start_time: selectedTime.start, end_time: selectedTime.end,
      notes: `Réservation en ligne\nCourriel: ${patientForm.email}\nTéléphone: ${patientForm.phone}\n${patientForm.notes}`,
      status: 'scheduled', booked_online: true,
    }])
    setSubmitting(false)
    if (error) { alert('Une erreur est survenue.'); return }
    setBookingComplete(true)
  }

  const styles = `
    .pb-container { min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 2rem 1rem; }
    .pb-card { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
    .pb-header { padding: 1.5rem; background: rgba(212,175,55,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center; }
    .pb-logo { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .pb-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #d4af37, #b8860b); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
    .pb-clinic-name { font-size: 1.5rem; font-weight: 600; color: white; }
    .pb-subtitle { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
    .pb-steps { display: flex; justify-content: center; gap: 0.5rem; padding: 1rem; background: rgba(0,0,0,0.2); }
    .pb-step { width: 40px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.2); transition: all 0.3s; }
    .pb-step.active { background: #d4af37; width: 60px; }
    .pb-step.completed { background: #10b981; }
    .pb-body { padding: 1.5rem; }
    .pb-section-title { font-size: 1.1rem; font-weight: 600; color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .pb-practitioners, .pb-types { display: flex; flex-direction: column; gap: 0.75rem; }
    .pb-practitioner, .pb-type { padding: 1rem; background: rgba(255,255,255,0.05); border: 2px solid transparent; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .pb-practitioner:hover, .pb-type:hover { background: rgba(255,255,255,0.1); }
    .pb-practitioner.selected, .pb-type.selected { border-color: #d4af37; background: rgba(212,175,55,0.15); }
    .pb-practitioner { display: flex; align-items: center; gap: 1rem; }
    .pb-practitioner-avatar { width: 50px; height: 50px; background: linear-gradient(135deg, #d4af37, #b8860b); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }
    .pb-practitioner-name { font-weight: 500; color: white; }
    .pb-type-header { display: flex; justify-content: space-between; align-items: center; }
    .pb-type-name { font-weight: 500; color: white; }
    .pb-type-duration { font-size: 0.8rem; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 0.25rem; }
    .pb-type-desc { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 0.25rem; }
    .pb-calendar-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .pb-nav-btn { padding: 0.5rem; background: rgba(255,255,255,0.1); border: none; border-radius: 8px; color: white; cursor: pointer; display: flex; }
    .pb-nav-btn:hover { background: rgba(255,255,255,0.2); }
    .pb-month-title { font-weight: 500; color: white; }
    .pb-calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .pb-day-header { padding: 0.5rem; text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.5); font-weight: 500; }
    .pb-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; color: white; }
    .pb-day.other-month { color: rgba(255,255,255,0.3); }
    .pb-day.unavailable { color: rgba(255,255,255,0.2); cursor: not-allowed; }
    .pb-day.available:hover { background: rgba(212,175,55,0.3); }
    .pb-day.selected { background: #d4af37; color: #1a1a2e; font-weight: 600; }
    .pb-day.today { border: 2px solid #d4af37; }
    .pb-slots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; max-height: 250px; overflow-y: auto; }
    .pb-slot { padding: 0.75rem; background: rgba(255,255,255,0.05); border: 2px solid transparent; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s; color: white; font-size: 0.9rem; }
    .pb-slot:hover { background: rgba(255,255,255,0.1); }
    .pb-slot.selected { border-color: #d4af37; background: rgba(212,175,55,0.2); }
    .pb-no-slots { text-align: center; padding: 2rem; color: rgba(255,255,255,0.5); }
    .pb-form-group { margin-bottom: 1rem; }
    .pb-label { display: block; font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; }
    .pb-input { width: 100%; padding: 0.75rem 1rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; font-size: 0.9rem; }
    .pb-input::placeholder { color: rgba(255,255,255,0.4); }
    .pb-input:focus { outline: none; border-color: #d4af37; }
    .pb-textarea { min-height: 80px; resize: vertical; }
    .pb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .pb-summary { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
    .pb-summary-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .pb-summary-row:last-child { border-bottom: none; }
    .pb-summary-label { color: rgba(255,255,255,0.6); font-size: 0.85rem; }
    .pb-summary-value { color: white; font-weight: 500; }
    .pb-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
    .pb-btn-back { padding: 0.875rem 1.5rem; background: rgba(255,255,255,0.1); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
    .pb-btn-back:hover { background: rgba(255,255,255,0.2); }
    .pb-btn-next { flex: 1; padding: 0.875rem 1.5rem; background: linear-gradient(135deg, #d4af37, #b8860b); border: none; border-radius: 8px; color: #1a1a2e; cursor: pointer; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: transform 0.2s, box-shadow 0.2s; }
    .pb-btn-next:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(212,175,55,0.4); }
    .pb-btn-next:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .pb-success { text-align: center; padding: 3rem 1.5rem; }
    .pb-success-icon { width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; }
    .pb-success-title { font-size: 1.5rem; font-weight: 600; color: white; margin-bottom: 0.5rem; }
    .pb-success-message { color: rgba(255,255,255,0.7); margin-bottom: 2rem; }
    .pb-error { text-align: center; padding: 3rem 1.5rem; }
    .pb-error-title { font-size: 1.25rem; font-weight: 600; color: #ef4444; margin-bottom: 0.5rem; }
    .pb-error-message { color: rgba(255,255,255,0.7); }
    .pb-loading { text-align: center; padding: 3rem; color: rgba(255,255,255,0.7); }
    @media (max-width: 480px) { .pb-form-row { grid-template-columns: 1fr; } .pb-slots { grid-template-columns: repeat(2, 1fr); } }
  `

  if (loading) return <div className="pb-container"><style>{styles}</style><div className="pb-card"><div className="pb-loading">Chargement...</div></div></div>
  if (error) return <div className="pb-container"><style>{styles}</style><div className="pb-card"><div className="pb-error"><h2 className="pb-error-title">Erreur</h2><p className="pb-error-message">{error}</p></div></div></div>

  if (bookingComplete) {
    return (
      <div className="pb-container"><style>{styles}</style>
        <div className="pb-card">
          <div className="pb-header"><div className="pb-logo"><div className="pb-logo-icon"><Icons.Building /></div><span className="pb-clinic-name">{clinic?.name}</span></div></div>
          <div className="pb-success">
            <div className="pb-success-icon"><Icons.Check /></div>
            <h2 className="pb-success-title">Rendez-vous confirmé!</h2>
            <p className="pb-success-message">{practitionerSettings?.booking_settings?.confirmationMessage || 'Votre rendez-vous a été enregistré.'}</p>
            <div className="pb-summary">
              <div className="pb-summary-row"><span className="pb-summary-label">Date</span><span className="pb-summary-value">{selectedDate?.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
              <div className="pb-summary-row"><span className="pb-summary-label">Heure</span><span className="pb-summary-value">{selectedTime?.start}</span></div>
              <div className="pb-summary-row"><span className="pb-summary-label">Type</span><span className="pb-summary-value">{selectedType?.label}</span></div>
              <div className="pb-summary-row"><span className="pb-summary-label">Praticien</span><span className="pb-summary-value">{selectedPractitioner?.name}</span></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const allowedTypes = APPOINTMENT_TYPES.filter(t => !practitionerSettings?.booking_settings?.allowedTypes || practitionerSettings.booking_settings.allowedTypes.includes(t.value))

  return (
    <div className="pb-container"><style>{styles}</style>
      <div className="pb-card">
        <div className="pb-header">
          <div className="pb-logo"><div className="pb-logo-icon"><Icons.Building /></div><span className="pb-clinic-name">{clinic?.name}</span></div>
          <p className="pb-subtitle">Réservation en ligne</p>
        </div>
        <div className="pb-steps">
          <div className={`pb-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} />
          <div className={`pb-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} />
          <div className={`pb-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`} />
          <div className={`pb-step ${step >= 4 ? 'active' : ''}`} />
        </div>
        <div className="pb-body">
          {step === 1 && (<>
            <h3 className="pb-section-title"><Icons.User /> Choisissez votre praticien</h3>
            <div className="pb-practitioners">
              {practitioners.map(p => (<div key={p.id} className={`pb-practitioner ${selectedPractitioner?.id === p.id ? 'selected' : ''}`} onClick={() => setSelectedPractitioner(p)}>
                <div className="pb-practitioner-avatar"><Icons.User /></div><span className="pb-practitioner-name">{p.name}</span>
              </div>))}
            </div>
            {selectedPractitioner && (<>
              <h3 className="pb-section-title" style={{ marginTop: '1.5rem' }}><Icons.Calendar /> Type de rendez-vous</h3>
              <div className="pb-types">
                {allowedTypes.map(type => (<div key={type.value} className={`pb-type ${selectedType?.value === type.value ? 'selected' : ''}`} onClick={() => setSelectedType(type)}>
                  <div className="pb-type-header"><span className="pb-type-name">{type.label}</span><span className="pb-type-duration"><Icons.Clock /> {type.duration} min</span></div>
                  <p className="pb-type-desc">{type.description}</p>
                </div>))}
              </div>
            </>)}
            <div className="pb-actions"><button className="pb-btn-next" onClick={() => setStep(2)} disabled={!selectedPractitioner || !selectedType}>Continuer</button></div>
          </>)}
          {step === 2 && (<>
            <h3 className="pb-section-title"><Icons.Calendar /> Choisissez une date</h3>
            <div className="pb-calendar-nav">
              <button className="pb-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}><Icons.ChevronLeft /></button>
              <span className="pb-month-title">{MONTHS_FR[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button className="pb-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}><Icons.ChevronRight /></button>
            </div>
            <div className="pb-calendar">
              {DAYS_FR.map(d => <div key={d} className="pb-day-header">{d}</div>)}
              {getCalendarDays().map((item, i) => {
                const available = item.isCurrentMonth && isDayAvailable(item.date)
                const isSelected = selectedDate?.toDateString() === item.date.toDateString()
                const isToday = item.date.toDateString() === new Date().toDateString()
                return <div key={i} className={`pb-day ${!item.isCurrentMonth ? 'other-month' : ''} ${available ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`} onClick={() => available && setSelectedDate(item.date)}>{item.date.getDate()}</div>
              })}
            </div>
            <div className="pb-actions"><button className="pb-btn-back" onClick={() => setStep(1)}><Icons.ChevronLeft /> Retour</button><button className="pb-btn-next" onClick={() => setStep(3)} disabled={!selectedDate}>Continuer</button></div>
          </>)}
          {step === 3 && (<>
            <h3 className="pb-section-title"><Icons.Clock /> Choisissez une heure</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>{selectedDate?.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            {availableSlots.length > 0 ? (<div className="pb-slots">{availableSlots.map((slot, i) => (<div key={i} className={`pb-slot ${selectedTime?.start === slot.start ? 'selected' : ''}`} onClick={() => setSelectedTime(slot)}>{slot.start}</div>))}</div>) : (<div className="pb-no-slots">Aucun créneau disponible pour cette date.</div>)}
            <div className="pb-actions"><button className="pb-btn-back" onClick={() => setStep(2)}><Icons.ChevronLeft /> Retour</button><button className="pb-btn-next" onClick={() => setStep(4)} disabled={!selectedTime}>Continuer</button></div>
          </>)}
          {step === 4 && (<>
            <h3 className="pb-section-title"><Icons.User /> Vos informations</h3>
            <div className="pb-summary">
              <div className="pb-summary-row"><span className="pb-summary-label">Date</span><span className="pb-summary-value">{selectedDate?.toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
              <div className="pb-summary-row"><span className="pb-summary-label">Heure</span><span className="pb-summary-value">{selectedTime?.start}</span></div>
              <div className="pb-summary-row"><span className="pb-summary-label">Service</span><span className="pb-summary-value">{selectedType?.label}</span></div>
            </div>
            <div className="pb-form-row">
              <div className="pb-form-group"><label className="pb-label">Prénom *</label><input type="text" className="pb-input" value={patientForm.firstName} onChange={(e) => setPatientForm(prev => ({ ...prev, firstName: e.target.value }))} placeholder="Votre prénom" /></div>
              <div className="pb-form-group"><label className="pb-label">Nom *</label><input type="text" className="pb-input" value={patientForm.lastName} onChange={(e) => setPatientForm(prev => ({ ...prev, lastName: e.target.value }))} placeholder="Votre nom" /></div>
            </div>
            <div className="pb-form-group"><label className="pb-label">Courriel {practitionerSettings?.booking_settings?.requireEmail ? '*' : ''}</label><input type="email" className="pb-input" value={patientForm.email} onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))} placeholder="votre@courriel.com" /></div>
            <div className="pb-form-group"><label className="pb-label">Téléphone {practitionerSettings?.booking_settings?.requirePhone ? '*' : ''}</label><input type="tel" className="pb-input" value={patientForm.phone} onChange={(e) => setPatientForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="514-555-1234" /></div>
            <div className="pb-form-group"><label className="pb-label">Notes (optionnel)</label><textarea className="pb-input pb-textarea" value={patientForm.notes} onChange={(e) => setPatientForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Informations supplémentaires..." /></div>
            <div className="pb-actions"><button className="pb-btn-back" onClick={() => setStep(3)}><Icons.ChevronLeft /> Retour</button><button className="pb-btn-next" onClick={handleSubmit} disabled={submitting || !patientForm.firstName || !patientForm.lastName}>{submitting ? 'Réservation...' : 'Confirmer le rendez-vous'}</button></div>
          </>)}
        </div>
      </div>
    </div>
  )
}
