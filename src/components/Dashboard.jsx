import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import PatientList from './PatientList'
import PatientDetail from './PatientDetail'
import PatientEdit from './PatientEdit'
import PatientRegistration from './PatientRegistration'
import SendRegistrationLink from './SendRegistrationLink'
import Documents from './Documents'
import Admin from './Admin'
import Help from './Help'
import VisitsList from './VisitsList'
import VisitDetail from './VisitDetail'
import PhotoSettings from './PhotoSettings'
import AccountSettings from './AccountSettings'
import BillingSettings from './BillingSettings'
import InjectionTemplates from './InjectionTemplates'
import RegistrationSettings from './RegistrationSettings'
import ConsentSettings from './ConsentSettings'
import Schedule from './Schedule'
import ScheduleSettings from './ScheduleSettings'
import Portfolio from './Portfolio'
import CaseSearch from './CaseSearch'

// Icônes SVG Premium
const Icons = {
  Logo: () => (
    <svg viewBox="0 0 40 40" fill="none" style={{ width: 32, height: 32 }}>
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a87c" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path d="M12 8C12 8 12 32 12 32C12 34 14 36 16 36C18 36 20 34 20 32V24C20 22 22 20 24 20C26 20 28 22 28 24C28 26 26 28 24 28H20" 
        stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="14" r="5" fill="url(#logoGrad)"/>
    </svg>
  ),
  Dashboard: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="2" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="2" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="2" strokeWidth="2"/></svg>,
  Schedule: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/><path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Patients: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" strokeWidth="2"/><path strokeWidth="2" d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><circle cx="19" cy="7" r="3" strokeWidth="2"/><path strokeWidth="2" d="M21 21v-2a3 3 0 00-2-2.83"/></svg>,
  Portfolio: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path strokeWidth="2" d="M21 15l-5-5L5 21"/></svg>,
  Search: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>,
  Settings: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth="2"/><path strokeWidth="2" d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5" strokeWidth="2"/><path strokeWidth="2" d="M3 21v-2a7 7 0 0114 0v2"/></svg>,
  Building: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 13v.01M9 17v.01"/></svg>,
  Help: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeWidth="2" d="M9 9a3 3 0 115.83 1c0 2-3 3-3 3M12 17v.01"/></svg>,
  Logout: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  ChevronDown: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M6 9l6 6 6-6"/></svg>,
  ChevronRight: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M9 18l6-6-6-6"/></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/></svg>,
  Bell: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Menu: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>,
  Star: () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Activity: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  TrendingUp: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M23 6l-9.5 9.5-5-5L1 18"/><path strokeWidth="2" d="M17 6h6v6"/></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/><path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeWidth="2" d="M12 6v6l4 2"/></svg>,
  UserPlus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" strokeWidth="2"/><path strokeWidth="2" d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M19 8v6M16 11h6"/></svg>,
  Link: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  PatientList: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  Sparkles: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l1.5 4.5L19 9l-4.5 1.5L13 15l-1.5-4.5L7 9l4.5-1.5L13 3z"/></svg>,
}

export default function Dashboard({ session }) {
  const [currentView, setCurrentView] = useState('dashboard')
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ patients: 0, visits: 0, appointments: 0, upcoming: 0 })
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
  const [userClinic, setUserClinic] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [expandedMenus, setExpandedMenus] = useState({ patients: false, userSettings: false, clinicSettings: false, admin: false })
  const [selectedVisit, setSelectedVisit] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [recentPatients, setRecentPatients] = useState([])
  const [todayAppointments, setTodayAppointments] = useState([])
  const [isApproved, setIsApproved] = useState(null)
  
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [patientForm, setPatientForm] = useState({
    name: '', email: '', phone: '', birthdate: '',
    allergies: '', notes: '', follow_up_interval: 3
  })
  const [savingPatient, setSavingPatient] = useState(false)

  // Check user approval
  useEffect(() => {
    checkUserApproval()
  }, [session])

  const checkUserApproval = async () => {
    const { data, error } = await supabase
      .from('user_requests')
      .select('status')
      .eq('email', session.user.email)
      .single()

    if (error || !data) {
      setIsApproved(true)
    } else if (data.status === 'approved') {
      setIsApproved(true)
    } else {
      setIsApproved(false)
    }
  }

  useEffect(() => {
    if (isApproved) {
      fetchUserClinic()
      fetchPendingRequests()
      const interval = setInterval(fetchPendingRequests, 30000)
      return () => clearInterval(interval)
    }
  }, [isApproved])

  useEffect(() => {
    fetchPatients()
  }, [userClinic])

  const fetchUserClinic = async () => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('clinic_id')
      .eq('user_id', session.user.id)
      .single()

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (profileData) setUserProfile(profileData)

    if (roleData?.clinic_id) {
      const { data: clinicData } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', roleData.clinic_id)
        .single()
      setUserClinic(clinicData || { id: roleData.clinic_id })
    } else {
      setUserClinic(null)
    }
  }

  const fetchPendingRequests = async () => {
    const { data } = await supabase
      .from('user_requests')
      .select('id')
      .eq('status', 'pending')
    setPendingRequestsCount(data?.length || 0)
  }

  const fetchPatients = async () => {
    setLoading(true)
    let query = supabase
      .from('patients')
      .select(`*, visits (*)`)
      .order('created_at', { ascending: false })

    if (userClinic?.id) {
      query = query.eq('clinic_id', userClinic.id)
    }

    const { data } = await query
    setPatients(data || [])
    setRecentPatients((data || []).slice(0, 5))
    
    const totalVisits = data?.reduce((sum, p) => sum + (p.visits?.length || 0), 0) || 0
    setStats({
      patients: data?.length || 0,
      visits: totalVisits,
      appointments: 0,
      upcoming: 0
    })
    setLoading(false)
  }

  useEffect(() => {
    if (userClinic?.id) {
      fetchTodayAppointments()
    }
  }, [userClinic])

  const fetchTodayAppointments = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('appointments')
      .select(`*, patients (name)`)
      .eq('clinic_id', userClinic?.id)
      .gte('start_time', `${today}T00:00:00`)
      .lte('start_time', `${today}T23:59:59`)
      .order('start_time', { ascending: true })
      .limit(5)
    
    setTodayAppointments(data || [])
  }

  const handleCreatePatient = async (e) => {
    e.preventDefault()
    setSavingPatient(true)

    const { error } = await supabase
      .from('patients')
      .insert([{
        ...patientForm,
        user_id: session.user.id,
        clinic_id: userClinic?.id || null
      }])

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      setShowPatientModal(false)
      setPatientForm({
        name: '', email: '', phone: '', birthdate: '',
        allergies: '', notes: '', follow_up_interval: 3
      })
      fetchPatients()
    }
    setSavingPatient(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setCurrentView('patient-detail')
  }

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }))
  }

  const getUserName = () => {
    if (userProfile?.full_name) return userProfile.full_name
    if (userProfile?.first_name) return `${userProfile.first_name} ${userProfile.last_name || ''}`
    return session.user.email?.split('@')[0] || 'Utilisateur'
  }

  const getUserInitials = () => {
    const name = getUserName()
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const navigateTo = (view, patient = null) => {
    setCurrentView(view)
    if (patient !== undefined) setSelectedPatient(patient)
    setMobileMenuOpen(false)
  }

  // Loading screen
  if (isApproved === null) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading">Vérification en cours...</div>
      </div>
    )
  }

  // Pending approval screen
  if (!isApproved) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div className="card-body" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✨</div>
            <h1 style={{ 
              background: 'var(--gradient-premium)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.75rem', 
              marginBottom: '1rem'
            }}>
              Demande en attente
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Votre demande d'inscription a été reçue et est en cours d'examen.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Courriel: <strong style={{ color: 'var(--primary)' }}>{session.user.email}</strong>
            </p>
            <button className="btn btn-secondary" onClick={() => supabase.auth.signOut()}>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard Home View - Premium Design
  const renderDashboardHome = () => (
    <div>
      {/* Hero Welcome Section */}
      <div className="welcome-card" style={{ marginBottom: '2rem' }}>
        <div>
          <p style={{ opacity: 0.9, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{getGreeting()}</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>{getUserName()} ✨</h2>
        </div>
        <p style={{ marginTop: '1rem' }}>
          {new Date().toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Icons.Patients />
          </div>
          <div className="stat-content">
            <div className="stat-label">Patients inscrits</div>
            <div className="stat-value">{stats.patients}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent)' }}>
            <Icons.Activity />
          </div>
          <div className="stat-content">
            <div className="stat-label">Visites totales</div>
            <div className="stat-value">{stats.visits}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--success)' }}>
            <Icons.Calendar />
          </div>
          <div className="stat-content">
            <div className="stat-label">RDV aujourd'hui</div>
            <div className="stat-value">{todayAppointments.length}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--info)' }}>
            <Icons.TrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-label">Ce mois</div>
            <div className="stat-value">{Math.floor(stats.visits * 0.3)}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Today's Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Icons.Clock style={{ width: 18, height: 18 }} />
              Rendez-vous aujourd'hui
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigateTo('schedule')}>
              Voir tout →
            </button>
          </div>
          <div className="card-body">
            {todayAppointments.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Icons.Calendar style={{ width: 48, height: 48, opacity: 0.3 }} />
                <p style={{ marginTop: '1rem' }}>Aucun rendez-vous aujourd'hui</p>
              </div>
            ) : (
              <div className="patient-list">
                {todayAppointments.map((apt, i) => (
                  <div key={i} className="patient-card" style={{ cursor: 'default' }}>
                    <div className="patient-avatar" style={{ 
                      background: 'var(--accent)',
                      width: '44px', 
                      height: '44px',
                      fontSize: '0.85rem'
                    }}>
                      {new Date(apt.start_time).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="patient-info">
                      <div className="patient-name">{apt.patients?.name || 'Patient'}</div>
                      <div className="patient-meta">{apt.service_type || 'Consultation'}</div>
                    </div>
                    <span className={`badge ${apt.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                      {apt.status === 'confirmed' ? '✓ Confirmé' : 'En attente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Icons.Star style={{ width: 18, height: 18, color: 'var(--primary)' }} />
              Patients récents
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigateTo('patients')}>
              Voir tout →
            </button>
          </div>
          <div className="card-body">
            {recentPatients.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Icons.Patients style={{ width: 48, height: 48, opacity: 0.3 }} />
                <p style={{ marginTop: '1rem' }}>Aucun patient enregistré</p>
              </div>
            ) : (
              <div className="patient-list">
                {recentPatients.map((patient, i) => (
                  <div 
                    key={i} 
                    className="patient-card"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="patient-avatar">
                      {patient.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="patient-info">
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-meta">{patient.visits?.length || 0} visite(s)</div>
                    </div>
                    <Icons.ChevronRight style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Icons.Sparkles style={{ width: 18, height: 18 }} />
            Actions rapides
          </h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <button 
              className="btn btn-secondary"
              style={{ flexDirection: 'column', padding: '1.5rem', height: 'auto', gap: '0.75rem' }}
              onClick={() => setShowPatientModal(true)}
            >
              <Icons.UserPlus style={{ width: 24, height: 24 }} />
              <span>Nouveau patient</span>
            </button>
            <button 
              className="btn btn-secondary"
              style={{ flexDirection: 'column', padding: '1.5rem', height: 'auto', gap: '0.75rem' }}
              onClick={() => navigateTo('schedule')}
            >
              <Icons.Calendar style={{ width: 24, height: 24 }} />
              <span>Prendre RDV</span>
            </button>
            <button 
              className="btn btn-secondary"
              style={{ flexDirection: 'column', padding: '1.5rem', height: 'auto', gap: '0.75rem' }}
              onClick={() => navigateTo('portfolio')}
            >
              <Icons.Portfolio style={{ width: 24, height: 24 }} />
              <span>Portfolio</span>
            </button>
            <button 
              className="btn btn-secondary"
              style={{ flexDirection: 'column', padding: '1.5rem', height: 'auto', gap: '0.75rem' }}
              onClick={() => navigateTo('case-search')}
            >
              <Icons.Search style={{ width: 24, height: 24 }} />
              <span>Recherche</span>
            </button>
          </div>
        </div>
      </div>

      <div className="copyright">© {new Date().getFullYear()} FACEHUB — Premium Aesthetic Management</div>
    </div>
  )

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Icons.Menu />
        </button>
        <div className="mobile-logo">
          <Icons.Logo />
          <span>FaceHub</span>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowPatientModal(true)}>
          <Icons.Plus />
        </button>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" style={{ opacity: 1, visibility: 'visible' }} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="logo">
          <Icons.Logo />
          <div>
            <h1>FaceHub</h1>
            <span>Aesthetic Pro</span>
          </div>
        </div>

        <nav className="nav-menu">
          {/* Main Navigation */}
          <div className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>
            <Icons.Dashboard style={{ width: 18, height: 18 }} />
            <span>Tableau de bord</span>
          </div>

          <div className={`nav-item ${currentView === 'schedule' ? 'active' : ''}`} onClick={() => navigateTo('schedule')}>
            <Icons.Schedule style={{ width: 18, height: 18 }} />
            <span>Agenda</span>
          </div>

          <div className={`nav-item ${['patients', 'patient-detail'].includes(currentView) ? 'active' : ''}`} onClick={() => toggleMenu('patients')}>
            <Icons.Patients style={{ width: 18, height: 18 }} />
            <span>Patients</span>
            <span style={{ marginLeft: 'auto' }}>
              {expandedMenus.patients ? <Icons.ChevronDown style={{ width: 16, height: 16 }} /> : <Icons.ChevronRight style={{ width: 16, height: 16 }} />}
            </span>
          </div>
          
          {expandedMenus.patients && (
            <>
              <div className={`nav-item sub-item ${currentView === 'patients' ? 'active' : ''}`} onClick={() => navigateTo('patients')}>
                <Icons.PatientList style={{ width: 16, height: 16 }} />
                <span>Liste</span>
              </div>
              <div className={`nav-item sub-item ${currentView === 'patient-registration' ? 'active' : ''}`} onClick={() => navigateTo('patient-registration')}>
                <Icons.UserPlus style={{ width: 16, height: 16 }} />
                <span>Inscrire</span>
              </div>
              <div className={`nav-item sub-item ${currentView === 'send-registration-link' ? 'active' : ''}`} onClick={() => navigateTo('send-registration-link')}>
                <Icons.Link style={{ width: 16, height: 16 }} />
                <span>Lien d'inscription</span>
              </div>
            </>
          )}

          <div className={`nav-item ${currentView === 'portfolio' ? 'active' : ''}`} onClick={() => navigateTo('portfolio')}>
            <Icons.Portfolio style={{ width: 18, height: 18 }} />
            <span>Portfolio</span>
          </div>

          <div className={`nav-item ${currentView === 'case-search' ? 'active' : ''}`} onClick={() => navigateTo('case-search')}>
            <Icons.Search style={{ width: 18, height: 18 }} />
            <span>Recherche de cas</span>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1, minHeight: '2rem' }} />

          {/* Settings */}
          <div className="nav-section-title">Paramètres</div>

          <div className={`nav-item ${['photo-settings', 'account-settings', 'billing-settings'].includes(currentView) ? 'active' : ''}`} onClick={() => toggleMenu('userSettings')}>
            <Icons.User style={{ width: 18, height: 18 }} />
            <span>Utilisateur</span>
            <span style={{ marginLeft: 'auto' }}>
              {expandedMenus.userSettings ? <Icons.ChevronDown style={{ width: 16, height: 16 }} /> : <Icons.ChevronRight style={{ width: 16, height: 16 }} />}
            </span>
          </div>
          
          {expandedMenus.userSettings && (
            <>
              <div className={`nav-item sub-item ${currentView === 'account-settings' ? 'active' : ''}`} onClick={() => navigateTo('account-settings')}>Compte</div>
              <div className={`nav-item sub-item ${currentView === 'photo-settings' ? 'active' : ''}`} onClick={() => navigateTo('photo-settings')}>Photos</div>
              <div className={`nav-item sub-item ${currentView === 'billing-settings' ? 'active' : ''}`} onClick={() => navigateTo('billing-settings')}>Facturation</div>
              <div className={`nav-item sub-item ${currentView === 'injection-templates' ? 'active' : ''}`} onClick={() => navigateTo('injection-templates')}>Templates</div>
              <div className={`nav-item sub-item ${currentView === 'schedule-settings' ? 'active' : ''}`} onClick={() => navigateTo('schedule-settings')}>Disponibilités</div>
            </>
          )}

          <div className={`nav-item ${['registration-settings', 'consent-settings'].includes(currentView) ? 'active' : ''}`} onClick={() => toggleMenu('clinicSettings')}>
            <Icons.Building style={{ width: 18, height: 18 }} />
            <span>Clinique</span>
            <span style={{ marginLeft: 'auto' }}>
              {expandedMenus.clinicSettings ? <Icons.ChevronDown style={{ width: 16, height: 16 }} /> : <Icons.ChevronRight style={{ width: 16, height: 16 }} />}
            </span>
          </div>
          
          {expandedMenus.clinicSettings && (
            <>
              <div className={`nav-item sub-item ${currentView === 'registration-settings' ? 'active' : ''}`} onClick={() => navigateTo('registration-settings')}>Inscription</div>
              <div className={`nav-item sub-item ${currentView === 'consent-settings' ? 'active' : ''}`} onClick={() => navigateTo('consent-settings')}>Consentement</div>
            </>
          )}

          <div className={`nav-item ${currentView === 'admin' ? 'active' : ''}`} onClick={() => navigateTo('admin')}>
            <Icons.Settings style={{ width: 18, height: 18 }} />
            <span>Admin</span>
            {pendingRequestsCount > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>{pendingRequestsCount}</span>
            )}
          </div>

          <div className={`nav-item ${currentView === 'help' ? 'active' : ''}`} onClick={() => navigateTo('help')}>
            <Icons.Help style={{ width: 18, height: 18 }} />
            <span>Aide</span>
          </div>

          <div className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <Icons.Logout style={{ width: 18, height: 18 }} />
            <span>Déconnexion</span>
          </div>
        </nav>

        {/* User Section */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{getUserInitials()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{getUserName()}</div>
            <div className="sidebar-user-email">{userClinic?.name || session.user.email}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {loading && currentView === 'dashboard' ? (
          <div className="loading">Chargement...</div>
        ) : (
          <>
            {currentView === 'dashboard' && renderDashboardHome()}
            {currentView === 'patients' && (
              <PatientList 
                patients={patients} 
                onSelectPatient={handleSelectPatient}
                onEditPatient={(patient) => { setSelectedPatient(patient); setCurrentView('patient-edit'); }}
                onViewVisits={(patient) => { setSelectedPatient(patient); setCurrentView('visits'); }}
                onRefresh={fetchPatients}
                onNewPatient={() => setShowPatientModal(true)}
                onRegisterInOffice={() => setCurrentView('patient-registration')}
                onRegisterByEmail={() => setCurrentView('send-registration-link')}
              />
            )}
            {currentView === 'patient-detail' && selectedPatient && (
              <PatientDetail 
                patient={selectedPatient} 
                onBack={() => { setCurrentView('patients'); setSelectedPatient(null); }}
                onRefresh={fetchPatients}
                onSelectVisit={(visit) => { setSelectedVisit(visit); setCurrentView('visit-detail'); }}
                session={session}
              />
            )}
            {currentView === 'patient-edit' && selectedPatient && (
              <PatientEdit 
                patient={selectedPatient} 
                onBack={() => setCurrentView('patient-detail')}
                onSave={() => { fetchPatients(); setCurrentView('patient-detail'); }}
              />
            )}
            {currentView === 'visit-detail' && selectedVisit && selectedPatient && (
              <VisitDetail 
                visit={selectedVisit}
                patient={selectedPatient}
                onBack={() => setCurrentView('patient-detail')}
                onRefresh={() => {
                  fetchPatients()
                  if (selectedPatient) {
                    supabase
                      .from('patients')
                      .select('*, visits (*)')
                      .eq('id', selectedPatient.id)
                      .single()
                      .then(({ data }) => {
                        if (data) setSelectedPatient(data)
                      })
                  }
                }}
                session={session}
              />
            )}
            {currentView === 'visits' && selectedPatient && (
              <VisitsList 
                patient={selectedPatient}
                onBack={() => setCurrentView('patient-detail')}
                onCreateVisit={(visit) => { setSelectedVisit(visit); setCurrentView('visit-detail'); }}
                onViewVisit={(visit) => { setSelectedVisit(visit); setCurrentView('visit-detail'); }}
                session={session}
              />
            )}
            {currentView === 'documents' && <Documents session={session} userClinic={userClinic} />}
            {currentView === 'patient-registration' && (
              <PatientRegistration 
                onBack={() => setCurrentView('patients')}
                onSuccess={() => { fetchPatients(); setCurrentView('patients'); }}
                session={session}
                userClinic={userClinic}
              />
            )}
            {currentView === 'send-registration-link' && (
              <SendRegistrationLink 
                onBack={() => setCurrentView('patients')}
                session={session}
                userClinic={userClinic}
                onNavigateToConsentSettings={() => setCurrentView('consent-settings')}
              />
            )}
            {currentView === 'admin' && <Admin session={session} userClinic={userClinic} />}
            {currentView === 'help' && <Help />}
            {currentView === 'photo-settings' && <PhotoSettings onBack={() => setCurrentView('dashboard')} session={session} />}
            {currentView === 'account-settings' && <AccountSettings onBack={() => setCurrentView('dashboard')} session={session} />}
            {currentView === 'billing-settings' && <BillingSettings onBack={() => setCurrentView('dashboard')} session={session} />}
            {currentView === 'injection-templates' && <InjectionTemplates onBack={() => setCurrentView('dashboard')} session={session} />}
            {currentView === 'registration-settings' && <RegistrationSettings onBack={() => setCurrentView('dashboard')} session={session} />}
            {currentView === 'consent-settings' && <ConsentSettings onBack={() => setCurrentView('dashboard')} session={session} />}
            {currentView === 'schedule' && <Schedule session={session} userClinic={userClinic} onViewPatient={(patient) => { setSelectedPatient(patient); setCurrentView('patient-detail'); }} />}
            {currentView === 'schedule-settings' && <ScheduleSettings onBack={() => setCurrentView('schedule')} session={session} />}
            {currentView === 'portfolio' && <Portfolio session={session} userClinic={userClinic} />}
            {currentView === 'case-search' && <CaseSearch session={session} userClinic={userClinic} onViewPatient={(patient) => { setSelectedPatient(patient); setCurrentView('patient-detail'); }} />}
          </>
        )}
      </main>

      {/* New Patient Modal */}
      {showPatientModal && (
        <div className="modal-overlay" onClick={() => setShowPatientModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nouveau patient</h2>
              <button className="modal-close" onClick={() => setShowPatientModal(false)}>
                <Icons.X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form onSubmit={handleCreatePatient}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom complet *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={patientForm.name}
                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                    required
                    placeholder="Prénom et nom"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Courriel</label>
                    <input 
                      type="email" 
                      className="form-input"
                      value={patientForm.email}
                      onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                      placeholder="courriel@exemple.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input 
                      type="tel" 
                      className="form-input"
                      value={patientForm.phone}
                      onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                      placeholder="514-555-1234"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date de naissance</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={patientForm.birthdate}
                      onChange={(e) => setPatientForm({ ...patientForm, birthdate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Intervalle de suivi</label>
                    <select 
                      className="form-input"
                      value={patientForm.follow_up_interval}
                      onChange={(e) => setPatientForm({ ...patientForm, follow_up_interval: parseInt(e.target.value) })}
                    >
                      <option value={3}>3 mois</option>
                      <option value={4}>4 mois</option>
                      <option value={6}>6 mois</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={patientForm.allergies}
                    onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                    placeholder="Ex: Lidocaïne, latex..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea 
                    className="form-input"
                    value={patientForm.notes}
                    onChange={(e) => setPatientForm({ ...patientForm, notes: e.target.value })}
                    placeholder="Notes additionnelles..."
                  />
                </div>
                {userClinic && (
                  <div className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', width: '100%', justifyContent: 'center' }}>
                    <Icons.Building style={{ width: 16, height: 16 }} />
                    Sera ajouté à: {userClinic.name}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPatientModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingPatient}>
                  {savingPatient ? 'Création...' : 'Créer le patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
