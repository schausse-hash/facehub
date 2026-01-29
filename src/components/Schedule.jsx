import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

// Icônes SVG
const Icons = {
  ChevronLeft: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Search: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Phone: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Mail: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Link: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Copy: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
}

// Types de rendez-vous
const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation', color: '#3b82f6', duration: 30 },
  { value: 'botox', label: 'Toxine Botulique', color: '#8b5cf6', duration: 45 },
  { value: 'filler', label: 'Injection Filler', color: '#ec4899', duration: 60 },
  { value: 'microneedling', label: 'Microneedling', color: '#f59e0b', duration: 60 },
  { value: 'followup', label: 'Suivi', color: '#10b981', duration: 15 },
  { value: 'other', label: 'Autre', color: '#6b7280', duration: 30 },
]

// Statuts des rendez-vous
const APPOINTMENT_STATUS = [
  { value: 'scheduled', label: 'Planifié', color: '#3b82f6' },
  { value: 'confirmed', label: 'Confirmé', color: '#10b981' },
  { value: 'arrived', label: 'Arrivé', color: '#8b5cf6' },
  { value: 'in_progress', label: 'En cours', color: '#f59e0b' },
  { value: 'completed', label: 'Terminé', color: '#6b7280' },
  { value: 'cancelled', label: 'Annulé', color: '#ef4444' },
  { value: 'no_show', label: 'Absent', color: '#dc2626' },
]

// Heures de travail par défaut
const DEFAULT_HOURS = { start: 8, end: 18 }

// Noms des jours en français
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAYS_SHORT_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function Schedule({ session, userClinic, onViewPatient }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // 'day', 'week', 'month'
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [practitioners, setPractitioners] = useState([])
  const [selectedPractitioner, setSelectedPractitioner] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [filteredPatients, setFilteredPatients] = useState([])
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [showBookingLink, setShowBookingLink] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '',
    patient_name: '',
    appointment_type: 'consultation',
    practitioner_id: '',
    date: '',
    start_time: '09:00',
    end_time: '09:30',
    operatory: '1',
    notes: '',
    status: 'scheduled',
  })

  const patientSearchRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [userClinic])

  useEffect(() => {
    fetchAppointments()
  }, [currentDate, viewMode, selectedPractitioner, userClinic])

  const fetchData = async () => {
    if (!userClinic?.id) return
    setLoading(true)

    // Récupérer les patients
    const { data: patientsData } = await supabase
      .from('patients')
      .select('id, name, email, phone')
      .eq('clinic_id', userClinic.id)
      .eq('is_active', true)
      .order('name')

    setPatients(patientsData || [])

    // Récupérer les praticiens (users avec rôle praticien ou admin)
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('clinic_id', userClinic.id)
      .in('role', ['practitioner', 'admin', 'super_admin'])

    if (rolesData?.length) {
      const userIds = rolesData.map(r => r.user_id)
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds)

      setPractitioners(profilesData?.map(p => ({
        id: p.user_id,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Praticien'
      })) || [])
    }

    setLoading(false)
  }

  const fetchAppointments = async () => {
    if (!userClinic?.id) return

    // Calculer la plage de dates selon la vue
    let startDate, endDate
    const d = new Date(currentDate)

    if (viewMode === 'day') {
      startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    } else if (viewMode === 'week') {
      const dayOfWeek = d.getDay()
      startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek)
      endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (7 - dayOfWeek))
    } else {
      startDate = new Date(d.getFullYear(), d.getMonth(), 1)
      endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    }

    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients (id, name, email, phone)
      `)
      .eq('clinic_id', userClinic.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date')
      .order('start_time')

    if (selectedPractitioner !== 'all') {
      query = query.eq('practitioner_id', selectedPractitioner)
    }

    const { data } = await query
    setAppointments(data || [])
  }

  const handlePatientSearch = (value) => {
    setPatientSearch(value)
    if (value.length >= 2) {
      const filtered = patients.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.email?.toLowerCase().includes(value.toLowerCase()) ||
        p.phone?.includes(value)
      )
      setFilteredPatients(filtered.slice(0, 10))
      setShowPatientDropdown(true)
    } else {
      setFilteredPatients([])
      setShowPatientDropdown(false)
    }
  }

  const selectPatient = (patient) => {
    setAppointmentForm(prev => ({
      ...prev,
      patient_id: patient.id,
      patient_name: patient.name
    }))
    setPatientSearch(patient.name)
    setShowPatientDropdown(false)
  }

  const openNewAppointment = (date, time) => {
    const formattedDate = date instanceof Date 
      ? date.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    
    const startTime = time || '09:00'
    const [hours, minutes] = startTime.split(':').map(Number)
    const endTime = `${String(hours).padStart(2, '0')}:${String(minutes + 30).padStart(2, '0')}`

    setAppointmentForm({
      patient_id: '',
      patient_name: '',
      appointment_type: 'consultation',
      practitioner_id: session.user.id,
      date: formattedDate,
      start_time: startTime,
      end_time: endTime,
      operatory: '1',
      notes: '',
      status: 'scheduled',
    })
    setPatientSearch('')
    setEditingAppointment(null)
    setShowModal(true)
  }

  const openEditAppointment = (appointment) => {
    setAppointmentForm({
      patient_id: appointment.patient_id || '',
      patient_name: appointment.patients?.name || appointment.patient_name || '',
      appointment_type: appointment.appointment_type || 'consultation',
      practitioner_id: appointment.practitioner_id || session.user.id,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      operatory: appointment.operatory || '1',
      notes: appointment.notes || '',
      status: appointment.status || 'scheduled',
    })
    setPatientSearch(appointment.patients?.name || appointment.patient_name || '')
    setEditingAppointment(appointment)
    setShowModal(true)
  }

  const handleSaveAppointment = async (e) => {
    e.preventDefault()
    
    const appointmentData = {
      clinic_id: userClinic.id,
      patient_id: appointmentForm.patient_id || null,
      patient_name: appointmentForm.patient_name || patientSearch,
      appointment_type: appointmentForm.appointment_type,
      practitioner_id: appointmentForm.practitioner_id,
      date: appointmentForm.date,
      start_time: appointmentForm.start_time,
      end_time: appointmentForm.end_time,
      operatory: appointmentForm.operatory,
      notes: appointmentForm.notes,
      status: appointmentForm.status,
    }

    if (editingAppointment) {
      await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', editingAppointment.id)
    } else {
      await supabase
        .from('appointments')
        .insert([appointmentData])
    }

    setShowModal(false)
    fetchAppointments()
  }

  const handleDeleteAppointment = async () => {
    if (!editingAppointment) return
    if (!window.confirm('Voulez-vous vraiment supprimer ce rendez-vous?')) return

    await supabase
      .from('appointments')
      .delete()
      .eq('id', editingAppointment.id)

    setShowModal(false)
    fetchAppointments()
  }

  const updateAppointmentStatus = async (appointmentId, status) => {
    await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
    fetchAppointments()
  }

  // Navigation
  const navigatePrev = () => {
    const d = new Date(currentDate)
    if (viewMode === 'day') d.setDate(d.getDate() - 1)
    else if (viewMode === 'week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
  }

  const navigateNext = () => {
    const d = new Date(currentDate)
    if (viewMode === 'day') d.setDate(d.getDate() + 1)
    else if (viewMode === 'week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
  }

  const goToToday = () => setCurrentDate(new Date())

  // Obtenir le titre de la période
  const getPeriodTitle = () => {
    const d = currentDate
    if (viewMode === 'day') {
      return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(d)
      startOfWeek.setDate(d.getDate() - d.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${MONTHS_FR[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`
    } else {
      return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
    }
  }

  // Générer les heures pour la vue jour/semaine
  const generateTimeSlots = () => {
    const slots = []
    for (let h = DEFAULT_HOURS.start; h < DEFAULT_HOURS.end; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`)
      slots.push(`${String(h).padStart(2, '0')}:30`)
    }
    return slots
  }

  // Générer les jours de la semaine
  const getWeekDays = () => {
    const days = []
    const d = new Date(currentDate)
    d.setDate(d.getDate() - d.getDay())
    for (let i = 0; i < 7; i++) {
      days.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return days
  }

  // Générer la grille du mois
  const getMonthGrid = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const grid = []

    // Jours du mois précédent
    const prevMonth = new Date(year, month, 0)
    for (let i = startPadding - 1; i >= 0; i--) {
      grid.push({ date: new Date(year, month - 1, prevMonth.getDate() - i), isCurrentMonth: false })
    }

    // Jours du mois courant
    for (let d = 1; d <= lastDay.getDate(); d++) {
      grid.push({ date: new Date(year, month, d), isCurrentMonth: true })
    }

    // Jours du mois suivant
    const remaining = 42 - grid.length
    for (let d = 1; d <= remaining; d++) {
      grid.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
    }

    return grid
  }

  // Obtenir les RDV d'un jour
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(a => a.date === dateStr)
  }

  // Obtenir la couleur du type de RDV
  const getTypeColor = (type) => {
    return APPOINTMENT_TYPES.find(t => t.value === type)?.color || '#6b7280'
  }

  // Calculer la position et hauteur d'un RDV
  const getAppointmentStyle = (appointment) => {
    const [startHour, startMin] = appointment.start_time.split(':').map(Number)
    const [endHour, endMin] = appointment.end_time.split(':').map(Number)
    
    const startOffset = (startHour - DEFAULT_HOURS.start) * 60 + startMin
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
    
    const top = (startOffset / 30) * 40 // 40px par demi-heure
    const height = Math.max((duration / 30) * 40 - 2, 20)
    
    return { top: `${top}px`, height: `${height}px` }
  }

  // Lien de réservation public
  const getBookingLink = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/booking/${userClinic?.id}`
  }

  const copyBookingLink = () => {
    navigator.clipboard.writeText(getBookingLink())
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const styles = `
    .schedule-container { background: var(--bg-main); min-height: 100%; }
    
    .schedule-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 1rem 1.5rem;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .schedule-title { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); }
    
    .schedule-nav { display: flex; align-items: center; gap: 0.5rem; }
    
    .nav-btn {
      padding: 0.5rem;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .nav-btn:hover { background: var(--bg-hover); }
    
    .today-btn {
      padding: 0.5rem 1rem;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.875rem;
    }
    .today-btn:hover { background: var(--bg-hover); }
    
    .period-title { 
      font-size: 1.1rem; 
      font-weight: 500; 
      color: var(--text-primary);
      min-width: 250px;
      text-align: center;
    }
    
    .schedule-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    
    .view-toggle { display: flex; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
    .view-btn {
      padding: 0.5rem 1rem;
      background: var(--bg-input);
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .view-btn:not(:last-child) { border-right: 1px solid var(--border); }
    .view-btn.active { background: var(--primary); color: white; }
    .view-btn:hover:not(.active) { background: var(--bg-hover); }
    
    .practitioner-select {
      padding: 0.5rem 1rem;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.875rem;
      min-width: 150px;
    }
    
    .new-appointment-btn {
      padding: 0.5rem 1rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }
    .new-appointment-btn:hover { background: var(--primary-dark); }
    
    .booking-link-btn {
      padding: 0.5rem 1rem;
      background: var(--bg-input);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    .booking-link-btn:hover { background: var(--bg-hover); }
    
    /* Grille calendrier */
    .schedule-grid { display: flex; flex: 1; overflow: hidden; }
    
    .time-column {
      width: 60px;
      flex-shrink: 0;
      border-right: 1px solid var(--border);
      background: var(--bg-card);
    }
    
    .time-slot {
      height: 40px;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 0 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }
    
    .days-container { flex: 1; display: flex; overflow-x: auto; }
    
    .day-column {
      flex: 1;
      min-width: 120px;
      border-right: 1px solid var(--border);
      position: relative;
    }
    .day-column:last-child { border-right: none; }
    
    .day-header {
      padding: 0.75rem 0.5rem;
      text-align: center;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .day-header.today { background: var(--primary); color: white; }
    .day-name { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
    .day-header.today .day-name { color: rgba(255,255,255,0.8); }
    .day-number { font-size: 1.25rem; font-weight: 600; }
    
    .day-slots { position: relative; }
    
    .slot-row {
      height: 40px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background 0.2s;
    }
    .slot-row:hover { background: var(--bg-hover); }
    .slot-row.half-hour { border-bottom-style: dashed; border-color: var(--border-light, #e5e5e5); }
    
    /* Rendez-vous */
    .appointment {
      position: absolute;
      left: 4px;
      right: 4px;
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      cursor: pointer;
      overflow: hidden;
      z-index: 5;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .appointment:hover { transform: scale(1.02); box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 6; }
    .appointment-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .appointment-time { font-size: 0.65rem; opacity: 0.9; }
    .appointment-type { font-size: 0.65rem; opacity: 0.8; margin-top: 2px; }
    
    /* Vue mois */
    .month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: var(--border);
      flex: 1;
    }
    
    .month-header {
      padding: 0.75rem;
      text-align: center;
      background: var(--bg-card);
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
    }
    
    .month-day {
      background: var(--bg-card);
      min-height: 100px;
      padding: 0.5rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .month-day:hover { background: var(--bg-hover); }
    .month-day.other-month { background: var(--bg-main); }
    .month-day.other-month .month-day-number { color: var(--text-muted); }
    .month-day.today { background: rgba(212, 175, 55, 0.1); }
    
    .month-day-number {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    .month-day.today .month-day-number { 
      color: var(--primary);
      font-weight: 700;
    }
    
    .month-appointment {
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 0.7rem;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }
    
    .month-more {
      font-size: 0.7rem;
      color: var(--text-muted);
      padding: 2px 4px;
    }
    
    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    
    .modal {
      background: var(--bg-card);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    
    .modal-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
    
    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      display: flex;
    }
    .modal-close:hover { background: var(--bg-hover); color: var(--text-primary); }
    
    .modal-body { padding: 1.5rem; }
    
    .form-group { margin-bottom: 1rem; }
    .form-label { 
      display: block; 
      font-size: 0.875rem; 
      font-weight: 500; 
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.75rem;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    .form-textarea { resize: vertical; min-height: 80px; }
    
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    
    .patient-search-container { position: relative; }
    
    .patient-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .patient-option {
      padding: 0.75rem;
      cursor: pointer;
      border-bottom: 1px solid var(--border);
    }
    .patient-option:last-child { border-bottom: none; }
    .patient-option:hover { background: var(--bg-hover); }
    .patient-option-name { font-weight: 500; color: var(--text-primary); }
    .patient-option-info { font-size: 0.75rem; color: var(--text-muted); }
    
    .status-selector { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .status-option {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
    }
    .status-option.selected { border-color: currentColor; }
    
    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      gap: 1rem;
    }
    
    .btn-delete {
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    .btn-delete:hover { background: rgba(239, 68, 68, 0.2); }
    
    .modal-actions { display: flex; gap: 0.75rem; }
    
    .btn-cancel {
      padding: 0.75rem 1.5rem;
      background: var(--bg-input);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    .btn-save {
      padding: 0.75rem 1.5rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .btn-save:hover { background: var(--primary-dark); }
    
    /* Booking Link Modal */
    .booking-link-modal { max-width: 450px; }
    
    .booking-link-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem;
      margin-top: 0.5rem;
    }
    
    .booking-link-url {
      flex: 1;
      font-size: 0.8rem;
      color: var(--text-primary);
      word-break: break-all;
    }
    
    .copy-btn {
      padding: 0.5rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
    }
    .copy-btn.copied { background: #10b981; }
    
    .booking-info {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--bg-main);
      border-radius: 6px;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .schedule-header { flex-direction: column; align-items: stretch; }
      .schedule-actions { justify-content: center; }
      .form-row { grid-template-columns: 1fr; }
      .day-column { min-width: 80px; }
      .period-title { min-width: auto; }
    }
  `

  if (loading) {
    return (
      <div className="schedule-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Chargement de l'agenda...</p>
      </div>
    )
  }

  return (
    <div className="schedule-container">
      <style>{styles}</style>

      {/* Header */}
      <div className="schedule-header">
        <h1 className="schedule-title">Agenda</h1>
        
        <div className="schedule-nav">
          <button className="nav-btn" onClick={navigatePrev}><Icons.ChevronLeft /></button>
          <button className="today-btn" onClick={goToToday}>Aujourd'hui</button>
          <button className="nav-btn" onClick={navigateNext}><Icons.ChevronRight /></button>
          <span className="period-title">{getPeriodTitle()}</span>
        </div>

        <div className="schedule-actions">
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Jour</button>
            <button className={`view-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Semaine</button>
            <button className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Mois</button>
          </div>

          {practitioners.length > 0 && (
            <select 
              className="practitioner-select"
              value={selectedPractitioner}
              onChange={(e) => setSelectedPractitioner(e.target.value)}
            >
              <option value="all">Tous les praticiens</option>
              {practitioners.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          <button className="booking-link-btn" onClick={() => setShowBookingLink(true)}>
            <Icons.Link />
            Lien de réservation
          </button>

          <button className="new-appointment-btn" onClick={() => openNewAppointment(currentDate)}>
            <Icons.Plus />
            Nouveau RDV
          </button>
        </div>
      </div>

      {/* Vue Jour/Semaine */}
      {(viewMode === 'day' || viewMode === 'week') && (
        <div className="schedule-grid" style={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
          <div className="time-column">
            <div style={{ height: '53px', borderBottom: '1px solid var(--border)' }}></div>
            {generateTimeSlots().map((time, i) => (
              <div key={time} className="time-slot">
                {i % 2 === 0 ? time : ''}
              </div>
            ))}
          </div>

          <div className="days-container">
            {(viewMode === 'day' ? [currentDate] : getWeekDays()).map((day, dayIndex) => (
              <div key={dayIndex} className="day-column">
                <div className={`day-header ${isToday(day) ? 'today' : ''}`}>
                  <div className="day-name">{DAYS_SHORT_FR[day.getDay()]}</div>
                  <div className="day-number">{day.getDate()}</div>
                </div>
                <div className="day-slots">
                  {generateTimeSlots().map((time, i) => (
                    <div 
                      key={time} 
                      className={`slot-row ${i % 2 === 1 ? 'half-hour' : ''}`}
                      onClick={() => openNewAppointment(day, time)}
                    />
                  ))}
                  
                  {/* Rendez-vous */}
                  {getAppointmentsForDate(day).map(apt => (
                    <div
                      key={apt.id}
                      className="appointment"
                      style={{
                        ...getAppointmentStyle(apt),
                        background: getTypeColor(apt.appointment_type),
                        color: 'white',
                      }}
                      onClick={(e) => { e.stopPropagation(); openEditAppointment(apt); }}
                    >
                      <div className="appointment-title">{apt.patients?.name || apt.patient_name || 'Patient'}</div>
                      <div className="appointment-time">{apt.start_time} - {apt.end_time}</div>
                      <div className="appointment-type">
                        {APPOINTMENT_TYPES.find(t => t.value === apt.appointment_type)?.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue Mois */}
      {viewMode === 'month' && (
        <div className="month-grid" style={{ height: 'calc(100vh - 180px)' }}>
          {DAYS_SHORT_FR.map(day => (
            <div key={day} className="month-header">{day}</div>
          ))}
          {getMonthGrid().map((item, i) => {
            const dayAppointments = getAppointmentsForDate(item.date)
            return (
              <div 
                key={i} 
                className={`month-day ${!item.isCurrentMonth ? 'other-month' : ''} ${isToday(item.date) ? 'today' : ''}`}
                onClick={() => { setCurrentDate(item.date); setViewMode('day'); }}
              >
                <div className="month-day-number">{item.date.getDate()}</div>
                {dayAppointments.slice(0, 3).map(apt => (
                  <div
                    key={apt.id}
                    className="month-appointment"
                    style={{ background: getTypeColor(apt.appointment_type), color: 'white' }}
                    onClick={(e) => { e.stopPropagation(); openEditAppointment(apt); }}
                  >
                    {apt.start_time} {apt.patients?.name || apt.patient_name}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="month-more">+{dayAppointments.length - 3} autres</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Rendez-vous */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <Icons.X />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment}>
              <div className="modal-body">
                {/* Patient */}
                <div className="form-group">
                  <label className="form-label">Patient</label>
                  <div className="patient-search-container">
                    <input
                      ref={patientSearchRef}
                      type="text"
                      className="form-input"
                      value={patientSearch}
                      onChange={(e) => handlePatientSearch(e.target.value)}
                      onFocus={() => patientSearch.length >= 2 && setShowPatientDropdown(true)}
                      placeholder="Rechercher ou entrer le nom du patient..."
                    />
                    {showPatientDropdown && filteredPatients.length > 0 && (
                      <div className="patient-dropdown">
                        {filteredPatients.map(p => (
                          <div key={p.id} className="patient-option" onClick={() => selectPatient(p)}>
                            <div className="patient-option-name">{p.name}</div>
                            <div className="patient-option-info">
                              {p.email && <span>{p.email}</span>}
                              {p.phone && <span> • {p.phone}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Type de RDV */}
                <div className="form-group">
                  <label className="form-label">Type de rendez-vous</label>
                  <select
                    className="form-select"
                    value={appointmentForm.appointment_type}
                    onChange={(e) => {
                      const type = APPOINTMENT_TYPES.find(t => t.value === e.target.value)
                      const [h, m] = appointmentForm.start_time.split(':').map(Number)
                      const endMinutes = h * 60 + m + (type?.duration || 30)
                      const endH = Math.floor(endMinutes / 60)
                      const endM = endMinutes % 60
                      setAppointmentForm(prev => ({
                        ...prev,
                        appointment_type: e.target.value,
                        end_time: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
                      }))
                    }}
                  >
                    {APPOINTMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label} ({type.duration} min)</option>
                    ))}
                  </select>
                </div>

                {/* Date et heure */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={appointmentForm.date}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Salle</label>
                    <select
                      className="form-select"
                      value={appointmentForm.operatory}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, operatory: e.target.value }))}
                    >
                      <option value="1">Salle 1</option>
                      <option value="2">Salle 2</option>
                      <option value="3">Salle 3</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Début</label>
                    <input
                      type="time"
                      className="form-input"
                      value={appointmentForm.start_time}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, start_time: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fin</label>
                    <input
                      type="time"
                      className="form-input"
                      value={appointmentForm.end_time}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, end_time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Praticien */}
                {practitioners.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Praticien</label>
                    <select
                      className="form-select"
                      value={appointmentForm.practitioner_id}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, practitioner_id: e.target.value }))}
                    >
                      <option value="">Sélectionner un praticien</option>
                      {practitioners.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Statut (uniquement en édition) */}
                {editingAppointment && (
                  <div className="form-group">
                    <label className="form-label">Statut</label>
                    <div className="status-selector">
                      {APPOINTMENT_STATUS.map(status => (
                        <div
                          key={status.value}
                          className={`status-option ${appointmentForm.status === status.value ? 'selected' : ''}`}
                          style={{ 
                            background: `${status.color}20`, 
                            color: status.color,
                          }}
                          onClick={() => setAppointmentForm(prev => ({ ...prev, status: status.value }))}
                        >
                          {status.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    value={appointmentForm.notes}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes sur le rendez-vous..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <div>
                  {editingAppointment && (
                    <button type="button" className="btn-delete" onClick={handleDeleteAppointment}>
                      <Icons.Trash />
                      Supprimer
                    </button>
                  )}
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-save">
                    {editingAppointment ? 'Enregistrer' : 'Créer le RDV'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lien de réservation */}
      {showBookingLink && (
        <div className="modal-overlay" onClick={() => setShowBookingLink(false)}>
          <div className="modal booking-link-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Lien de réservation en ligne</h2>
              <button className="modal-close" onClick={() => setShowBookingLink(false)}>
                <Icons.X />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Partagez ce lien avec vos patients pour qu'ils puissent prendre rendez-vous en ligne.
              </p>

              <div className="booking-link-box">
                <span className="booking-link-url">{getBookingLink()}</span>
                <button className={`copy-btn ${copiedLink ? 'copied' : ''}`} onClick={copyBookingLink}>
                  {copiedLink ? <><Icons.Check /> Copié!</> : <><Icons.Copy /> Copier</>}
                </button>
              </div>

              <div className="booking-info">
                <strong>Comment ça marche ?</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                  <li>Les patients accèdent au lien depuis leur navigateur</li>
                  <li>Ils choisissent un praticien, un type de service et un créneau</li>
                  <li>Le rendez-vous apparaît automatiquement dans votre agenda</li>
                  <li>Configurez vos disponibilités dans "Paramètres de l'agenda"</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button className="btn-cancel" onClick={() => setShowBookingLink(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
