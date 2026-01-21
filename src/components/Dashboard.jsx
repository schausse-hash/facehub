import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import PatientList from './PatientList'
import PatientDetail from './PatientDetail'
import Documents from './Documents'
import Admin from './Admin'
import Help from './Help'

// Compteur de demandes en attente (pour le badge)

// Icônes SVG
const Icons = {
  Home: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Users: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Document: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Logout: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  AlertCircle: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Shield: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Help: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

export default function Dashboard({ session }) {
  const [currentView, setCurrentView] = useState('dashboard')
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ patients: 0, visits: 0, photos: 0 })
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  useEffect(() => {
    fetchPatients()
    fetchPendingRequests()
    
    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(fetchPendingRequests, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingRequests = async () => {
    const { data, error } = await supabase
      .from('user_requests')
      .select('id')
      .eq('status', 'pending')
    
    if (!error) {
      setPendingRequestsCount(data?.length || 0)
    }
  }

  const fetchPatients = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        visits (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching patients:', error)
    } else {
      setPatients(data || [])
      
      // Calculer les stats
      const totalVisits = data?.reduce((sum, p) => sum + (p.visits?.length || 0), 0) || 0
      setStats({
        patients: data?.length || 0,
        visits: totalVisits,
        photos: 0
      })
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setCurrentView('patient-detail')
  }

  const renderDashboard = () => (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Bienvenue dans FaceHub</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold"><Icons.Users /></div>
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Icons.Calendar /></div>
          <div className="stat-value">{stats.visits}</div>
          <div className="stat-label">Visites</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icons.Camera /></div>
          <div className="stat-value">{stats.photos}</div>
          <div className="stat-label">Photos</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Patients récents</h3>
        </div>
        <div className="card-body">
          {patients.length > 0 ? (
            <div className="patient-list">
              {patients.slice(0, 5).map(patient => (
                <div 
                  key={patient.id} 
                  className="patient-card"
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="patient-avatar">
                    {patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="patient-info">
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-meta">
                      {patient.visits?.length || 0} visite(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icons.Users />
              <h3>Aucun patient</h3>
              <p>Ajoutez votre premier patient pour commencer</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1rem' }}
                onClick={() => setCurrentView('patients')}
              >
                Ajouter un patient
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <h1>FaceHub</h1>
          <span>Gestion esthétique</span>
        </div>

        <nav className="nav-menu">
          <div className="nav-section-title">Navigation</div>
          
          <div 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setCurrentView('dashboard'); setSelectedPatient(null); }}
          >
            <Icons.Home />
            <span>Tableau de bord</span>
          </div>

          <div 
            className={`nav-item ${currentView === 'patients' || currentView === 'patient-detail' ? 'active' : ''}`}
            onClick={() => { setCurrentView('patients'); setSelectedPatient(null); }}
          >
            <Icons.Users />
            <span>Patients</span>
          </div>

          <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>Formulaires</div>

          <div 
            className={`nav-item ${currentView === 'documents' ? 'active' : ''}`}
            onClick={() => { setCurrentView('documents'); setSelectedPatient(null); }}
          >
            <Icons.Document />
            <span>Documents</span>
          </div>

          <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>Compte</div>

          <div 
            className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => { setCurrentView('admin'); setSelectedPatient(null); fetchPendingRequests(); }}
          >
            <Icons.Shield />
            <span>Admin</span>
            {pendingRequestsCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '10px',
                padding: '0.1rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {pendingRequestsCount}
              </span>
            )}
          </div>

          <div 
            className={`nav-item ${currentView === 'help' ? 'active' : ''}`}
            onClick={() => { setCurrentView('help'); setSelectedPatient(null); }}
          >
            <Icons.Help />
            <span>Aide</span>
          </div>

          <div className="nav-item" onClick={handleLogout}>
            <Icons.Logout />
            <span>Déconnexion</span>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <>
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'patients' && (
              <PatientList 
                patients={patients} 
                onRefresh={fetchPatients}
                onSelectPatient={handleSelectPatient}
                session={session}
              />
            )}
            {currentView === 'patient-detail' && selectedPatient && (
              <PatientDetail 
                patient={selectedPatient}
                onBack={() => { setCurrentView('patients'); setSelectedPatient(null); }}
                onRefresh={fetchPatients}
                session={session}
              />
            )}
            {currentView === 'documents' && <Documents />}
            {currentView === 'admin' && <Admin session={session} />}
            {currentView === 'help' && <Help />}
          </>
        )}
      </main>
    </div>
  )
}
