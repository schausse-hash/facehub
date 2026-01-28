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
// Settings components
import PhotoSettings from './PhotoSettings'
import AccountSettings from './AccountSettings'
import BillingSettings from './BillingSettings'
import InjectionTemplates from './InjectionTemplates'
import RegistrationSettings from './RegistrationSettings'
import ConsentSettings from './ConsentSettings'

// Icônes SVG style FaceTec
const Icons = {
  Logo: () => (
    <svg viewBox="0 0 40 40" fill="none" style={{ width: 32, height: 32 }}>
      <path d="M12 8C12 8 12 32 12 32C12 34 14 36 16 36C18 36 20 34 20 32V24C20 22 22 20 24 20C26 20 28 22 28 24C28 26 26 28 24 28H20" 
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="14" r="5" fill="currentColor"/>
    </svg>
  ),
  Dashboard: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Schedule: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Patients: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  PatientList: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  UserPlus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  Link: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Portfolio: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Search: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Marketing: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  Document: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Settings: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Building: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Help: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Logout: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  ChevronDown: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>,
  ChevronRight: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  UsersGroup: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  CalendarCheck: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Menu: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
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
  
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [patientForm, setPatientForm] = useState({
    name: '', email: '', phone: '', birthdate: '',
    allergies: '', notes: '', follow_up_interval: 3
  })
  const [savingPatient, setSavingPatient] = useState(false)

  useEffect(() => {
    fetchUserClinic()
    fetchPendingRequests()
    const interval = setInterval(fetchPendingRequests, 30000)
    return () => clearInterval(interval)
  }, [])

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
    
    const totalVisits = data?.reduce((sum, p) => sum + (p.visits?.length || 0), 0) || 0
    setStats({
      patients: data?.length || 0,
      visits: totalVisits,
      appointments: 0,
      upcoming: 0
    })
    setLoading(false)
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

  const formatDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date().toLocaleDateString('fr-CA', options).toUpperCase()
  }

  const getUserName = () => {
    if (userProfile?.full_name) return userProfile.full_name
    if (userProfile?.first_name) return `${userProfile.first_name} ${userProfile.last_name || ''}`
    return session.user.email?.split('@')[0] || 'Utilisateur'
  }

  const getUserTitle = () => {
    if (userProfile?.profession) {
      const titles = { 'dentiste': 'Dr', 'medecin': 'Dr', 'infirmier': 'Inf.', 'pharmacien': 'Pharm.' }
      return titles[userProfile.profession] || ''
    }
    return ''
  }

  // Navigation helper that closes mobile menu
  const navigateTo = (view, patient = null) => {
    setCurrentView(view)
    if (patient !== undefined) setSelectedPatient(patient)
    setMobileMenuOpen(false)
  }

  // Dashboard Home View
  const renderDashboardHome = () => (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}>Accueil</a> | Tableau de bord
      </div>
      <h1 className="page-title">TABLEAU DE BORD</h1>

      <div className="dashboard-stats-grid">
        {/* Welcome Card */}
        <div className="welcome-card">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Bon retour !</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>{getUserName()} | {getUserTitle()} {getUserName()}</p>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{formatDate()}</div>
        </div>

        {/* Total Registered Patients */}
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Patients inscrits</div>
            <div className="stat-value">{stats.patients}</div>
          </div>
          <div className="stat-icon"><Icons.UsersGroup /></div>
        </div>

        {/* Total Visits */}
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Visites totales</div>
            <div className="stat-value">{stats.visits}</div>
          </div>
          <div className="stat-icon"><Icons.Calendar /></div>
        </div>
      </div>

      <div className="dashboard-stats-grid" style={{ marginTop: '1rem' }}>
        <div></div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Rendez-vous planifiés</div>
            <div className="stat-value">{stats.appointments}</div>
          </div>
          <div className="stat-icon"><Icons.CalendarCheck /></div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Rendez-vous à venir</div>
            <div className="stat-value">{stats.upcoming}</div>
          </div>
          <div className="stat-icon"><Icons.Clock /></div>
        </div>
      </div>

      <div className="copyright">COPYRIGHT © {new Date().getFullYear()} FACEHUB</div>
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
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="logo">
          <div style={{ color: 'var(--primary)' }}><Icons.Logo /></div>
          <div><h1>FaceHub</h1></div>
        </div>

        <nav className="nav-menu">
          {/* Dashboard */}
          <div 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigateTo('dashboard', null)}
          >
            <Icons.Dashboard />
            <span>Tableau de bord</span>
          </div>

          {/* Schedule */}
          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <Icons.Schedule />
            <span>Agenda</span>
          </div>

          {/* Patients with submenu */}
          <div 
            className={`nav-item ${currentView === 'patients' || currentView === 'patient-detail' ? 'active' : ''}`}
            onClick={() => toggleMenu('patients')}
          >
            <Icons.Patients />
            <span>Patients</span>
            <span style={{ marginLeft: 'auto' }}>
              {expandedMenus.patients ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
            </span>
          </div>
          
          {expandedMenus.patients && (
            <>
              <div 
                className={`nav-item sub-item ${currentView === 'patients' ? 'active' : ''}`}
                onClick={() => navigateTo('patients', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <Icons.PatientList />
                <span>Liste des patients</span>
              </div>
              <div 
                className={`nav-item sub-item ${currentView === 'patient-registration' ? 'active' : ''}`}
                onClick={() => navigateTo('patient-registration', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <Icons.UserPlus />
                <span>Inscrire un patient</span>
              </div>
              <div 
                className={`nav-item sub-item ${currentView === 'send-registration-link' ? 'active' : ''}`}
                onClick={() => navigateTo('send-registration-link', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <Icons.Link />
                <span>Envoyer lien d'inscription</span>
              </div>
            </>
          )}

          {/* Portfolio */}
          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <Icons.Portfolio />
            <span>Portfolio</span>
          </div>

          {/* Case Search */}
          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <Icons.Search />
            <span>Recherche de cas</span>
          </div>

          {/* Marketing Resources */}
          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <Icons.Marketing />
            <span>Ressources marketing</span>
          </div>

          {/* Settings Section */}
          <div className="nav-section-title">PARAMÈTRES</div>

          {/* User Settings with submenu */}
          <div 
            className={`nav-item ${['photo-settings', 'account-settings', 'billing-settings', 'injection-templates'].includes(currentView) ? 'active' : ''}`}
            onClick={() => toggleMenu('userSettings')}
          >
            <Icons.User />
            <span>Paramètres utilisateur</span>
            <span style={{ marginLeft: 'auto' }}>
              {expandedMenus.userSettings ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
            </span>
          </div>
          
          {expandedMenus.userSettings && (
            <>
              <div 
                className={`nav-item sub-item ${currentView === 'photo-settings' ? 'active' : ''}`}
                onClick={() => navigateTo('photo-settings', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <span>Arrangement photo</span>
              </div>
              <div 
                className={`nav-item sub-item ${currentView === 'account-settings' ? 'active' : ''}`}
                onClick={() => navigateTo('account-settings', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <span>Paramètres du compte</span>
              </div>
              <div 
                className={`nav-item sub-item ${currentView === 'billing-settings' ? 'active' : ''}`}
                onClick={() => navigateTo('billing-settings', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <span>Produits et facturation</span>
              </div>
              <div 
                className={`nav-item sub-item ${currentView === 'injection-templates' ? 'active' : ''}`}
                onClick={() => navigateTo('injection-templates', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <span>Modèles d'injection</span>
              </div>
            </>
          )}

          {/* Clinic Settings with submenu */}
          <div 
            className={`nav-item ${['registration-settings', 'consent-settings'].includes(currentView) ? 'active' : ''}`}
            onClick={() => toggleMenu('clinicSettings')}
          >
            <Icons.Building />
            <span>Paramètres clinique</span>
            <span style={{ marginLeft: 'auto' }}>
              {expandedMenus.clinicSettings ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
            </span>
          </div>
          
          {expandedMenus.clinicSettings && (
            <>
              <div 
                className={`nav-item sub-item ${currentView === 'registration-settings' ? 'active' : ''}`}
                onClick={() => navigateTo('registration-settings', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <span>Paramètres d'inscription</span>
              </div>
              <div 
                className={`nav-item sub-item ${currentView === 'consent-settings' ? 'active' : ''}`}
                onClick={() => navigateTo('consent-settings', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <span>Paramètres de consentement</span>
              </div>
            </>
          )}

          {/* Admin Section (Super Admin Only) */}
          <div 
            className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => toggleMenu('admin')}
          >
            <Icons.Settings />
            <span>Admin</span>
            {pendingRequestsCount > 0 && (
              <span style={{
                marginLeft: '0.5rem',
                background: 'var(--danger)',
                color: '#fff',
                borderRadius: '10px',
                padding: '0.1rem 0.5rem',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}>
                {pendingRequestsCount}
              </span>
            )}
            <span style={{ marginLeft: 'auto' }}>
              {expandedMenus.admin ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
            </span>
          </div>
          
          {expandedMenus.admin && (
            <>
              <div 
                className={`nav-item sub-item ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => navigateTo('admin', null)}
                style={{ paddingLeft: '3rem', fontSize: '0.85rem' }}
              >
                <Icons.UsersGroup />
                <span>Gestion des utilisateurs</span>
                {pendingRequestsCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'var(--danger)',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '0.1rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    {pendingRequestsCount}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Help Center */}
          <div 
            className={`nav-item ${currentView === 'help' ? 'active' : ''}`}
            onClick={() => navigateTo('help', null)}
          >
            <Icons.Help />
            <span>Centre d'aide</span>
          </div>

          {/* Logout - Ajouté dans le menu */}
          <div 
            className="nav-item"
            onClick={handleLogout}
            style={{ marginTop: '0.5rem', color: 'var(--danger)' }}
          >
            <Icons.Logout />
            <span>Déconnexion</span>
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {getUserName().charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{getUserName()}</div>
            <div className="sidebar-user-email">{session.user.email}</div>
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
                  // Refresh the selected patient data
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
            {/* Settings Views */}
            {currentView === 'photo-settings' && (
              <PhotoSettings 
                onBack={() => setCurrentView('dashboard')}
                session={session}
              />
            )}
            {currentView === 'account-settings' && (
              <AccountSettings 
                onBack={() => setCurrentView('dashboard')}
                session={session}
              />
            )}
            {currentView === 'billing-settings' && (
              <BillingSettings 
                onBack={() => setCurrentView('dashboard')}
                session={session}
              />
            )}
            {currentView === 'injection-templates' && (
              <InjectionTemplates 
                onBack={() => setCurrentView('dashboard')}
                session={session}
              />
            )}
            {currentView === 'registration-settings' && (
              <RegistrationSettings 
                onBack={() => setCurrentView('dashboard')}
                session={session}
              />
            )}
            {currentView === 'consent-settings' && (
              <ConsentSettings 
                onBack={() => setCurrentView('dashboard')}
                session={session}
              />
            )}
          </>
        )}
      </main>

      {/* Modal nouveau patient */}
      {showPatientModal && (
        <div className="modal-overlay" onClick={() => setShowPatientModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nouveau patient</h2>
              <button className="modal-close" onClick={() => setShowPatientModal(false)}><Icons.X /></button>
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
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--primary-bg)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Icons.Building /> Ce patient sera ajouté à: <strong style={{ color: 'var(--primary)' }}>{userClinic.name}</strong>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowPatientModal(false)}>Annuler</button>
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
