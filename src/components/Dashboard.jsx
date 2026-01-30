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
// Schedule components
import Schedule from './Schedule'
import ScheduleSettings from './ScheduleSettings'
// Portfolio
import Portfolio from './Portfolio'
// Case Search
import CaseSearch from './CaseSearch'

// Icônes SVG modernisées
const Icons = {
  Logo: () => (
    <svg viewBox="0 0 40 40" fill="none" style={{ width: 28, height: 28 }}>
      <path d="M12 8C12 8 12 32 12 32C12 34 14 36 16 36C18 36 20 34 20 32V24C20 22 22 20 24 20C26 20 28 22 28 24C28 26 26 28 24 28H20" 
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="14" r="5" fill="currentColor"/>
    </svg>
  ),
  Dashboard: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Schedule: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Patients: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  PatientList: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  UserPlus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  Link: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Portfolio: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Search: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Settings: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Building: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Help: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Logout: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  ChevronDown: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>,
  ChevronRight: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  UsersGroup: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  CalendarCheck: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Menu: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Bell: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
}

// Styles pour le nouveau layout moderne
const modernStyles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  // Mini Sidebar
  sidebar: {
    background: '#141414',
    borderRight: '1px solid #262626',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    transition: 'width 0.2s ease',
    position: 'fixed',
    height: '100vh',
    zIndex: 100,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  sidebarCollapsed: {
    width: '72px',
  },
  sidebarExpanded: {
    width: '240px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    marginBottom: '24px',
    minHeight: '48px',
  },
  logoIcon: {
    minWidth: '40px',
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #5a9a9c 0%, #4a8a8c 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #5a9a9c 0%, #6aacae 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    whiteSpace: 'nowrap',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    border: 'none',
    background: 'transparent',
    color: '#a1a1aa',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontSize: '14px',
    textAlign: 'left',
    minHeight: '44px',
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    background: '#262626',
    color: '#ffffff',
  },
  navItemHover: {
    background: '#1f1f1f',
    color: '#ffffff',
  },
  navIcon: {
    minWidth: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subItem: {
    paddingLeft: '44px',
    fontSize: '13px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#525252',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '16px 12px 8px',
    whiteSpace: 'nowrap',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 8px',
    marginTop: '16px',
    borderTop: '1px solid #262626',
  },
  userAvatar: {
    minWidth: '40px',
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #5a9a9c 0%, #4a8a8c 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  userInfo: {
    overflow: 'hidden',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '12px',
    color: '#71717a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  // Main Content Area
  main: {
    flex: 1,
    marginLeft: '72px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid #262626',
    background: '#141414',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#262626',
    borderRadius: '12px',
    padding: '10px 16px',
    width: '400px',
    maxWidth: '100%',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  searchKbd: {
    background: '#404040',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#a1a1aa',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerBtn: {
    padding: '10px 16px',
    background: '#262626',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.15s ease',
  },

  // Content Area
  content: {
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  welcome: {
    marginBottom: '32px',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#ffffff',
  },
  welcomeSubtitle: {
    color: '#71717a',
    fontSize: '15px',
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#141414',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #262626',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  statLabel: {
    color: '#71717a',
    fontSize: '14px',
  },
  statTrend: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#10b981',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  statBar: {
    height: '4px',
    borderRadius: '2px',
    overflow: 'hidden',
    background: 'rgba(90, 154, 156, 0.2)',
  },
  statBarFill: {
    height: '100%',
    borderRadius: '2px',
    background: '#5a9a9c',
  },

  // Two Column Layout
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  card: {
    background: '#141414',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #262626',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: '#ffffff',
  },
  cardAction: {
    background: 'transparent',
    border: 'none',
    color: '#5a9a9c',
    cursor: 'pointer',
    fontSize: '14px',
  },

  // List Items
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    background: '#1a1a1a',
    borderRadius: '12px',
    marginBottom: '8px',
  },
  itemAvatar: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #5a9a9c 0%, #4a8a8c 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
  itemSubtitle: {
    fontSize: '12px',
    color: '#71717a',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },

  // Quick Actions
  quickActions: {
    marginTop: '8px',
  },
  quickTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#71717a',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  quickBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 16px',
    background: '#141414',
    border: '1px solid #262626',
    borderRadius: '16px',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontSize: '13px',
  },
  quickIcon: {
    fontSize: '24px',
  },

  // Mobile Header
  mobileHeader: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: '#141414',
    borderBottom: '1px solid #262626',
    position: 'sticky',
    top: 0,
    zIndex: 60,
  },
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [recentPatients, setRecentPatients] = useState([])
  const [todayAppointments, setTodayAppointments] = useState([])
  
  // État pour vérifier si l'utilisateur est approuvé
  const [isApproved, setIsApproved] = useState(null)
  
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [patientForm, setPatientForm] = useState({
    name: '', email: '', phone: '', birthdate: '',
    allergies: '', notes: '', follow_up_interval: 3
  })
  const [savingPatient, setSavingPatient] = useState(false)

  // Vérifier si l'utilisateur est approuvé
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
    
    // Récupérer les 5 derniers patients pour l'affichage
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

  // Fetch today's appointments
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

  const navigateTo = (view, patient = null) => {
    setCurrentView(view)
    if (patient !== undefined) setSelectedPatient(patient)
    setMobileMenuOpen(false)
  }

  // Menu items for navigation
  const mainMenuItems = [
    { id: 'dashboard', icon: <Icons.Dashboard />, label: 'Accueil' },
    { id: 'schedule', icon: <Icons.Schedule />, label: 'Agenda' },
    { id: 'patients', icon: <Icons.Patients />, label: 'Patients', hasSubmenu: true, submenuKey: 'patients' },
    { id: 'portfolio', icon: <Icons.Portfolio />, label: 'Portfolio' },
    { id: 'case-search', icon: <Icons.Search />, label: 'Recherche' },
  ]

  const patientSubmenu = [
    { id: 'patients', icon: <Icons.PatientList />, label: 'Liste des patients' },
    { id: 'patient-registration', icon: <Icons.UserPlus />, label: 'Inscrire un patient' },
    { id: 'send-registration-link', icon: <Icons.Link />, label: 'Lien d\'inscription' },
  ]

  // Écran de chargement
  if (isApproved === null) {
    return (
      <div style={{
        ...modernStyles.container,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Vérification en cours...</p>
        </div>
      </div>
    )
  }

  // Écran d'attente d'approbation
  if (!isApproved) {
    return (
      <div style={{
        ...modernStyles.container,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: '#141414',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '500px',
          textAlign: 'center',
          border: '1px solid #262626'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🕐</div>
          <h1 style={{ 
            color: '#5a9a9c', 
            fontSize: '1.75rem', 
            marginBottom: '1rem'
          }}>
            Demande en attente
          </h1>
          <p style={{ 
            color: '#a1a1aa', 
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            Votre demande d'inscription a été reçue et est en cours d'examen.
          </p>
          <p style={{ 
            color: '#71717a', 
            fontSize: '0.9rem',
            marginBottom: '2rem'
          }}>
            Courriel: <strong style={{ color: '#fff' }}>{session.user.email}</strong>
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              background: 'transparent',
              border: '1px solid #262626',
              color: '#a1a1aa',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    )
  }

  // Dashboard Home View - Nouveau design
  const renderDashboardHome = () => (
    <div style={modernStyles.content}>
      {/* Welcome */}
      <div style={modernStyles.welcome}>
        <h1 style={modernStyles.welcomeTitle}>Bonjour {getUserName().split(' ')[0]} 👋</h1>
        <p style={modernStyles.welcomeSubtitle}>Voici un aperçu de votre journée</p>
      </div>

      {/* Stats Grid */}
      <div style={modernStyles.statsGrid}>
        <div style={modernStyles.statCard}>
          <div style={modernStyles.statHeader}>
            <span style={modernStyles.statLabel}>Patients inscrits</span>
            <span style={modernStyles.statTrend}>+{Math.floor(stats.patients * 0.05)}</span>
          </div>
          <div style={{ ...modernStyles.statValue, color: '#5a9a9c' }}>{stats.patients}</div>
          <div style={modernStyles.statBar}>
            <div style={{ ...modernStyles.statBarFill, width: '75%' }} />
          </div>
        </div>

        <div style={modernStyles.statCard}>
          <div style={modernStyles.statHeader}>
            <span style={modernStyles.statLabel}>Visites totales</span>
            <span style={modernStyles.statTrend}>+{Math.floor(stats.visits * 0.08)}</span>
          </div>
          <div style={{ ...modernStyles.statValue, color: '#8b5cf6' }}>{stats.visits}</div>
          <div style={{ ...modernStyles.statBar, background: 'rgba(139, 92, 246, 0.2)' }}>
            <div style={{ ...modernStyles.statBarFill, background: '#8b5cf6', width: '60%' }} />
          </div>
        </div>

        <div style={modernStyles.statCard}>
          <div style={modernStyles.statHeader}>
            <span style={modernStyles.statLabel}>RDV aujourd'hui</span>
          </div>
          <div style={{ ...modernStyles.statValue, color: '#10b981' }}>{todayAppointments.length}</div>
          <div style={{ ...modernStyles.statBar, background: 'rgba(16, 185, 129, 0.2)' }}>
            <div style={{ ...modernStyles.statBarFill, background: '#10b981', width: '40%' }} />
          </div>
        </div>

        <div style={modernStyles.statCard}>
          <div style={modernStyles.statHeader}>
            <span style={modernStyles.statLabel}>Ce mois</span>
            <span style={modernStyles.statTrend}>+12%</span>
          </div>
          <div style={{ ...modernStyles.statValue, color: '#f59e0b' }}>{Math.floor(stats.visits * 0.3)}</div>
          <div style={{ ...modernStyles.statBar, background: 'rgba(245, 158, 11, 0.2)' }}>
            <div style={{ ...modernStyles.statBarFill, background: '#f59e0b', width: '55%' }} />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={modernStyles.twoColumn}>
        {/* Today's Appointments */}
        <div style={modernStyles.card}>
          <div style={modernStyles.cardHeader}>
            <h2 style={modernStyles.cardTitle}>📅 Rendez-vous aujourd'hui</h2>
            <button style={modernStyles.cardAction} onClick={() => navigateTo('schedule')}>
              Voir tout →
            </button>
          </div>
          <div>
            {todayAppointments.length === 0 ? (
              <p style={{ color: '#71717a', textAlign: 'center', padding: '20px' }}>
                Aucun rendez-vous aujourd'hui
              </p>
            ) : (
              todayAppointments.map((apt, i) => (
                <div key={i} style={modernStyles.listItem}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#5a9a9c',
                    minWidth: '50px'
                  }}>
                    {new Date(apt.start_time).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={modernStyles.itemInfo}>
                    <div style={modernStyles.itemTitle}>{apt.patients?.name || 'Patient'}</div>
                    <div style={modernStyles.itemSubtitle}>{apt.service_type || 'Consultation'}</div>
                  </div>
                  <div style={{
                    ...modernStyles.badge,
                    background: apt.status === 'confirmed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: apt.status === 'confirmed' ? '#10b981' : '#f59e0b',
                  }}>
                    {apt.status === 'confirmed' ? '✓ Confirmé' : '⏳ En attente'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div style={modernStyles.card}>
          <div style={modernStyles.cardHeader}>
            <h2 style={modernStyles.cardTitle}>👥 Patients récents</h2>
            <button style={modernStyles.cardAction} onClick={() => navigateTo('patients')}>
              Voir tout →
            </button>
          </div>
          <div>
            {recentPatients.length === 0 ? (
              <p style={{ color: '#71717a', textAlign: 'center', padding: '20px' }}>
                Aucun patient enregistré
              </p>
            ) : (
              recentPatients.map((patient, i) => (
                <div 
                  key={i} 
                  style={{ ...modernStyles.listItem, cursor: 'pointer' }}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div style={modernStyles.itemAvatar}>
                    {patient.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div style={modernStyles.itemInfo}>
                    <div style={modernStyles.itemTitle}>{patient.name}</div>
                    <div style={modernStyles.itemSubtitle}>
                      {patient.visits?.length || 0} visite(s)
                    </div>
                  </div>
                  <button style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#5a9a9c', 
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    Voir →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={modernStyles.quickActions}>
        <h3 style={modernStyles.quickTitle}>Actions rapides</h3>
        <div style={modernStyles.quickGrid}>
          <button 
            style={modernStyles.quickBtn}
            onClick={() => setShowPatientModal(true)}
            onMouseEnter={(e) => e.target.style.background = '#1a1a1a'}
            onMouseLeave={(e) => e.target.style.background = '#141414'}
          >
            <span style={modernStyles.quickIcon}>📝</span>
            <span>Nouveau patient</span>
          </button>
          <button 
            style={modernStyles.quickBtn}
            onClick={() => navigateTo('schedule')}
            onMouseEnter={(e) => e.target.style.background = '#1a1a1a'}
            onMouseLeave={(e) => e.target.style.background = '#141414'}
          >
            <span style={modernStyles.quickIcon}>📅</span>
            <span>Prendre RDV</span>
          </button>
          <button 
            style={modernStyles.quickBtn}
            onClick={() => navigateTo('portfolio')}
            onMouseEnter={(e) => e.target.style.background = '#1a1a1a'}
            onMouseLeave={(e) => e.target.style.background = '#141414'}
          >
            <span style={modernStyles.quickIcon}>📸</span>
            <span>Portfolio</span>
          </button>
          <button 
            style={modernStyles.quickBtn}
            onClick={() => navigateTo('case-search')}
            onMouseEnter={(e) => e.target.style.background = '#1a1a1a'}
            onMouseLeave={(e) => e.target.style.background = '#141414'}
          >
            <span style={modernStyles.quickIcon}>🔍</span>
            <span>Recherche</span>
          </button>
        </div>
      </div>
    </div>
  )

  // Render nav item
  const renderNavItem = (item, isActive, onClick, isSubItem = false) => (
    <button
      key={item.id}
      onClick={onClick}
      style={{
        ...modernStyles.navItem,
        ...(isActive ? modernStyles.navItemActive : {}),
        ...(isSubItem ? modernStyles.subItem : {}),
      }}
      onMouseEnter={(e) => !isActive && (e.target.style.background = '#1f1f1f')}
      onMouseLeave={(e) => !isActive && (e.target.style.background = 'transparent')}
    >
      <span style={modernStyles.navIcon}>{item.icon}</span>
      {sidebarExpanded && <span style={modernStyles.navLabel}>{item.label}</span>}
      {item.hasSubmenu && sidebarExpanded && (
        <span style={{ marginLeft: 'auto' }}>
          {expandedMenus[item.submenuKey] ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
        </span>
      )}
      {item.badge && sidebarExpanded && (
        <span style={{
          marginLeft: 'auto',
          background: '#ef4444',
          color: '#fff',
          borderRadius: '10px',
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          {item.badge}
        </span>
      )}
    </button>
  )

  return (
    <div style={modernStyles.container}>
      {/* Mobile Header */}
      <div style={{
        ...modernStyles.mobileHeader,
        display: window.innerWidth <= 768 ? 'flex' : 'none'
      }}>
        <button 
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Icons.Menu />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={modernStyles.logoIcon}><Icons.Logo /></div>
          <span style={{ fontWeight: '600', color: '#5a9a9c' }}>FaceHub</span>
        </div>
        <div style={{ width: '24px' }} />
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 90
          }}
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        style={{
          ...modernStyles.sidebar,
          ...(sidebarExpanded ? modernStyles.sidebarExpanded : modernStyles.sidebarCollapsed),
          ...(mobileMenuOpen ? { transform: 'translateX(0)', width: '240px' } : {}),
          transform: mobileMenuOpen ? 'translateX(0)' : (window.innerWidth <= 768 ? 'translateX(-100%)' : 'translateX(0)'),
        }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo */}
        <div style={modernStyles.logo}>
          <div style={modernStyles.logoIcon}><Icons.Logo /></div>
          {sidebarExpanded && <span style={modernStyles.logoText}>FaceHub</span>}
        </div>

        {/* Main Menu */}
        <nav style={modernStyles.nav}>
          {/* Dashboard */}
          {renderNavItem(
            { id: 'dashboard', icon: <Icons.Dashboard />, label: 'Accueil' },
            currentView === 'dashboard',
            () => navigateTo('dashboard', null)
          )}

          {/* Schedule */}
          {renderNavItem(
            { id: 'schedule', icon: <Icons.Schedule />, label: 'Agenda' },
            currentView === 'schedule' || currentView === 'schedule-settings',
            () => navigateTo('schedule', null)
          )}

          {/* Patients */}
          {renderNavItem(
            { id: 'patients', icon: <Icons.Patients />, label: 'Patients', hasSubmenu: true, submenuKey: 'patients' },
            ['patients', 'patient-detail', 'patient-registration', 'send-registration-link'].includes(currentView),
            () => toggleMenu('patients')
          )}
          
          {expandedMenus.patients && sidebarExpanded && (
            <>
              {renderNavItem(
                { id: 'patients-list', icon: <Icons.PatientList />, label: 'Liste' },
                currentView === 'patients',
                () => navigateTo('patients', null),
                true
              )}
              {renderNavItem(
                { id: 'patient-registration', icon: <Icons.UserPlus />, label: 'Inscrire' },
                currentView === 'patient-registration',
                () => navigateTo('patient-registration', null),
                true
              )}
              {renderNavItem(
                { id: 'send-registration-link', icon: <Icons.Link />, label: 'Lien' },
                currentView === 'send-registration-link',
                () => navigateTo('send-registration-link', null),
                true
              )}
            </>
          )}

          {/* Portfolio */}
          {renderNavItem(
            { id: 'portfolio', icon: <Icons.Portfolio />, label: 'Portfolio' },
            currentView === 'portfolio',
            () => navigateTo('portfolio', null)
          )}

          {/* Case Search */}
          {renderNavItem(
            { id: 'case-search', icon: <Icons.Search />, label: 'Recherche' },
            currentView === 'case-search',
            () => navigateTo('case-search', null)
          )}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: '2rem' }} />

        {/* Settings Section */}
        {sidebarExpanded && <div style={modernStyles.sectionTitle}>Paramètres</div>}

        <nav style={modernStyles.nav}>
          {/* User Settings */}
          {renderNavItem(
            { id: 'user-settings', icon: <Icons.User />, label: 'Utilisateur', hasSubmenu: true, submenuKey: 'userSettings' },
            ['photo-settings', 'account-settings', 'billing-settings', 'injection-templates', 'schedule-settings'].includes(currentView),
            () => toggleMenu('userSettings')
          )}
          
          {expandedMenus.userSettings && sidebarExpanded && (
            <>
              {renderNavItem({ id: 'account-settings', icon: null, label: 'Compte' }, currentView === 'account-settings', () => navigateTo('account-settings'), true)}
              {renderNavItem({ id: 'photo-settings', icon: null, label: 'Photos' }, currentView === 'photo-settings', () => navigateTo('photo-settings'), true)}
              {renderNavItem({ id: 'billing-settings', icon: null, label: 'Facturation' }, currentView === 'billing-settings', () => navigateTo('billing-settings'), true)}
              {renderNavItem({ id: 'injection-templates', icon: null, label: 'Templates' }, currentView === 'injection-templates', () => navigateTo('injection-templates'), true)}
              {renderNavItem({ id: 'schedule-settings', icon: null, label: 'Disponibilités' }, currentView === 'schedule-settings', () => navigateTo('schedule-settings'), true)}
            </>
          )}

          {/* Clinic Settings */}
          {renderNavItem(
            { id: 'clinic-settings', icon: <Icons.Building />, label: 'Clinique', hasSubmenu: true, submenuKey: 'clinicSettings' },
            ['registration-settings', 'consent-settings'].includes(currentView),
            () => toggleMenu('clinicSettings')
          )}
          
          {expandedMenus.clinicSettings && sidebarExpanded && (
            <>
              {renderNavItem({ id: 'registration-settings', icon: null, label: 'Inscription' }, currentView === 'registration-settings', () => navigateTo('registration-settings'), true)}
              {renderNavItem({ id: 'consent-settings', icon: null, label: 'Consentement' }, currentView === 'consent-settings', () => navigateTo('consent-settings'), true)}
            </>
          )}

          {/* Admin */}
          {renderNavItem(
            { id: 'admin', icon: <Icons.Settings />, label: 'Admin', badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
            currentView === 'admin',
            () => navigateTo('admin', null)
          )}

          {/* Help */}
          {renderNavItem(
            { id: 'help', icon: <Icons.Help />, label: 'Aide' },
            currentView === 'help',
            () => navigateTo('help', null)
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              ...modernStyles.navItem,
              color: '#ef4444',
              marginTop: '8px'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <span style={modernStyles.navIcon}><Icons.Logout /></span>
            {sidebarExpanded && <span style={modernStyles.navLabel}>Déconnexion</span>}
          </button>
        </nav>

        {/* User */}
        <div style={modernStyles.userSection}>
          <div style={modernStyles.userAvatar}>{getUserInitials()}</div>
          {sidebarExpanded && (
            <div style={modernStyles.userInfo}>
              <div style={modernStyles.userName}>{getUserName()}</div>
              <div style={modernStyles.userRole}>{userClinic?.name || 'Praticien'}</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={modernStyles.main}>
        {/* Header */}
        <header style={modernStyles.header}>
          <div style={modernStyles.searchBar}>
            <Icons.Search />
            <input 
              type="text" 
              placeholder="Rechercher patients, rendez-vous..." 
              style={modernStyles.searchInput}
            />
            <kbd style={modernStyles.searchKbd}>⌘K</kbd>
          </div>
          <div style={modernStyles.headerRight}>
            <button style={modernStyles.headerBtn}>
              <Icons.Bell />
            </button>
            <button 
              style={{ ...modernStyles.headerBtn, background: '#5a9a9c' }}
              onClick={() => setShowPatientModal(true)}
            >
              <Icons.Plus /> Nouveau
            </button>
          </div>
        </header>

        {/* Content */}
        {loading && currentView === 'dashboard' ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '50vh',
            color: '#71717a'
          }}>
            Chargement...
          </div>
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
            {currentView === 'photo-settings' && (
              <PhotoSettings onBack={() => setCurrentView('dashboard')} session={session} />
            )}
            {currentView === 'account-settings' && (
              <AccountSettings onBack={() => setCurrentView('dashboard')} session={session} />
            )}
            {currentView === 'billing-settings' && (
              <BillingSettings onBack={() => setCurrentView('dashboard')} session={session} />
            )}
            {currentView === 'injection-templates' && (
              <InjectionTemplates onBack={() => setCurrentView('dashboard')} session={session} />
            )}
            {currentView === 'registration-settings' && (
              <RegistrationSettings onBack={() => setCurrentView('dashboard')} session={session} />
            )}
            {currentView === 'consent-settings' && (
              <ConsentSettings onBack={() => setCurrentView('dashboard')} session={session} />
            )}
            {currentView === 'schedule' && (
              <Schedule 
                session={session}
                userClinic={userClinic}
                onViewPatient={(patient) => { setSelectedPatient(patient); setCurrentView('patient-detail'); }}
              />
            )}
            {currentView === 'schedule-settings' && (
              <ScheduleSettings onBack={() => setCurrentView('schedule')} session={session} />
            )}
            {currentView === 'portfolio' && (
              <Portfolio session={session} userClinic={userClinic} />
            )}
            {currentView === 'case-search' && (
              <CaseSearch 
                session={session}
                userClinic={userClinic}
                onViewPatient={(patient) => { setSelectedPatient(patient); setCurrentView('patient-detail'); }}
              />
            )}
          </>
        )}
      </main>

      {/* Modal nouveau patient */}
      {showPatientModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem'
          }}
          onClick={() => setShowPatientModal(false)}
        >
          <div 
            style={{
              background: '#141414',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid #262626'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #262626'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Nouveau patient</h2>
              <button 
                style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
                onClick={() => setShowPatientModal(false)}
              >
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleCreatePatient}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#a1a1aa' }}>
                    Nom complet *
                  </label>
                  <input 
                    type="text" 
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0a',
                      border: '1px solid #262626',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    value={patientForm.name}
                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                    required
                    placeholder="Prénom et nom"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#a1a1aa' }}>
                      Courriel
                    </label>
                    <input 
                      type="email" 
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#0a0a0a',
                        border: '1px solid #262626',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      value={patientForm.email}
                      onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                      placeholder="courriel@exemple.com"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#a1a1aa' }}>
                      Téléphone
                    </label>
                    <input 
                      type="tel" 
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#0a0a0a',
                        border: '1px solid #262626',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      value={patientForm.phone}
                      onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                      placeholder="514-555-1234"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#a1a1aa' }}>
                      Date de naissance
                    </label>
                    <input 
                      type="date" 
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#0a0a0a',
                        border: '1px solid #262626',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      value={patientForm.birthdate}
                      onChange={(e) => setPatientForm({ ...patientForm, birthdate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#a1a1aa' }}>
                      Intervalle de suivi
                    </label>
                    <select 
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#0a0a0a',
                        border: '1px solid #262626',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      value={patientForm.follow_up_interval}
                      onChange={(e) => setPatientForm({ ...patientForm, follow_up_interval: parseInt(e.target.value) })}
                    >
                      <option value={3}>3 mois</option>
                      <option value={4}>4 mois</option>
                      <option value={6}>6 mois</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#a1a1aa' }}>
                    Allergies
                  </label>
                  <input 
                    type="text" 
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0a',
                      border: '1px solid #262626',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    value={patientForm.allergies}
                    onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                    placeholder="Ex: Lidocaïne, latex..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#a1a1aa' }}>
                    Notes
                  </label>
                  <textarea 
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0a',
                      border: '1px solid #262626',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    value={patientForm.notes}
                    onChange={(e) => setPatientForm({ ...patientForm, notes: e.target.value })}
                    placeholder="Notes additionnelles..."
                  />
                </div>
                {userClinic && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(90, 154, 156, 0.1)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#a1a1aa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Icons.Building /> Ce patient sera ajouté à: <strong style={{ color: '#5a9a9c' }}>{userClinic.name}</strong>
                  </div>
                )}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid #262626'
              }}>
                <button 
                  type="button" 
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    color: '#a1a1aa',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onClick={() => setShowPatientModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '10px 20px',
                    background: '#5a9a9c',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  disabled={savingPatient}
                >
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
