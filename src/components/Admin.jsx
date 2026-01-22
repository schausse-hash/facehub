import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { sendAccessApprovedEmail } from '../emailService'

const Icons = {
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Users: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Shield: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Phone: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Mail: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Building: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
}

const ROLES = {
  user: { label: 'Utilisateur', color: '#6b7280', description: 'Accès basique' },
  collaborator: { label: 'Collaborateur', color: '#3b82f6', description: 'Peut approuver' },
  super_admin: { label: 'Super Admin', color: '#eab308', description: 'Accès total' }
}

export default function Admin({ session, userClinic }) {
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [activeTab, setActiveTab] = useState('requests')
  const [filter, setFilter] = useState('pending')
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showClinicModal, setShowClinicModal] = useState(false)
  const [clinicForm, setClinicForm] = useState({ name: '', address: '', phone: '', email: '' })
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    birthdate: '',
    clinic_name: '',
    clinic_id: '',
    address: '',
    notes: ''
  })

  useEffect(() => {
    checkUserRole()
  }, [])

  useEffect(() => {
    if (userRole && (userRole === 'collaborator' || userRole === 'super_admin')) {
      fetchRequests()
      fetchUsers()
      fetchClinics()
    }
  }, [userRole, filter])

  const checkUserRole = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    setUserRole(data?.role || null)
    setLoading(false)
  }

  const fetchRequests = async () => {
    let query = supabase
      .from('user_requests')
      .select('*')
      .order('requested_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setRequests(data || [])
  }

  const fetchUsers = async () => {
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: profilesData } = await supabase
      .from('user_profiles')
      .select('*')

    const { data: clinicsData } = await supabase
      .from('clinics')
      .select('id, name')

    const clinicsMap = {}
    clinicsData?.forEach(c => { clinicsMap[c.id] = c.name })

    const combined = (rolesData || []).map(role => {
      const profile = (profilesData || []).find(p => p.user_id === role.user_id)
      return { 
        ...role, 
        profile,
        clinic_name: clinicsMap[role.clinic_id] || null
      }
    })

    setUsers(combined)
  }

  const fetchClinics = async () => {
    const { data } = await supabase
      .from('clinics')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    
    setClinics(data || [])
  }

  const handleCreateClinic = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('clinics')
      .insert([{
        ...clinicForm,
        created_by: session.user.id
      }])

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      setShowClinicModal(false)
      setClinicForm({ name: '', address: '', phone: '', email: '' })
      fetchClinics()
    }
  }

  const handleAssignClinic = async (userId, clinicId) => {
    // Mettre à jour user_roles
    await supabase
      .from('user_roles')
      .update({ clinic_id: clinicId || null })
      .eq('user_id', userId)

    // Mettre à jour user_profiles aussi
    await supabase
      .from('user_profiles')
      .update({ clinic_id: clinicId || null })
      .eq('user_id', userId)

    fetchUsers()
  }

  const handleApprove = async (request) => {
    const { error } = await supabase
      .from('user_requests')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: session.user.id
      })
      .eq('id', request.id)

    if (!error) {
      // Envoyer un email de confirmation à l'utilisateur
      await sendAccessApprovedEmail(request.email, request.full_name || 'Utilisateur')
      fetchRequests()
    }
  }

  const handleReject = async (request) => {
    if (!window.confirm(`Rejeter la demande de ${request.email}?`)) return

    const { error } = await supabase
      .from('user_requests')
      .update({ status: 'rejected' })
      .eq('id', request.id)

    if (!error) fetchRequests()
  }

  const handleDeleteRequest = async (request) => {
    if (userRole !== 'super_admin') return
    if (!window.confirm(`Supprimer définitivement ${request.email}?`)) return

    await supabase.from('user_requests').delete().eq('id', request.id)
    fetchRequests()
  }

  const handleAddEmail = async (e) => {
    e.preventDefault()
    if (!newEmail) return

    setAdding(true)
    const { error } = await supabase
      .from('user_requests')
      .insert([{
        email: newEmail.toLowerCase().trim(),
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: session.user.id
      }])

    if (error?.code === '23505') {
      alert('Cet email existe déjà')
    } else if (!error) {
      setNewEmail('')
      fetchRequests()
    }
    setAdding(false)
  }

  const handleChangeRole = async (userId, newRole) => {
    if (userRole !== 'super_admin') return
    if (userId === session.user.id && newRole !== 'super_admin') {
      alert('Vous ne pouvez pas réduire votre propre rôle!')
      return
    }

    await supabase
      .from('user_roles')
      .update({ role: newRole, updated_by: session.user.id })
      .eq('user_id', userId)

    fetchUsers()
  }

  const handleDeleteUser = async (user) => {
    if (userRole !== 'super_admin') return
    if (user.user_id === session.user.id) {
      alert('Vous ne pouvez pas vous supprimer!')
      return
    }
    if (!window.confirm(`Supprimer ${user.email}?`)) return

    await supabase.from('user_roles').delete().eq('user_id', user.user_id)
    await supabase.from('user_profiles').delete().eq('user_id', user.user_id)
    fetchUsers()
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setUserForm({
      full_name: user.profile?.full_name || '',
      email: user.email || '',
      phone: user.profile?.phone || '',
      birthdate: user.profile?.birthdate || '',
      clinic_name: user.profile?.clinic_name || '',
      address: user.profile?.address || '',
      notes: user.profile?.notes || ''
    })
    setShowUserModal(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    
    const profileData = {
      user_id: editingUser.user_id,
      email: editingUser.email,
      full_name: userForm.full_name,
      phone: userForm.phone,
      birthdate: userForm.birthdate || null,
      clinic_name: userForm.clinic_name,
      address: userForm.address,
      notes: userForm.notes,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' })

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      setShowUserModal(false)
      setEditingUser(null)
      fetchUsers()
    }
  }

  // Non autorisé
  if (loading) {
    return <div className="card"><div className="card-body"><p>Chargement...</p></div></div>
  }

  if (!userRole || userRole === 'user') {
    return (
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Shield /></div>
            <h3>Accès refusé</h3>
            <p>Vous n'avez pas les droits pour accéder à cette section.</p>
          </div>
        </div>
      </div>
    )
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Administration</h1>
          <p className="page-subtitle">
            <span style={{ color: ROLES[userRole].color, fontWeight: '600' }}>{ROLES[userRole].label}</span>
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('requests')}
        >
          <Icons.Clock /> Demandes {pendingCount > 0 && <span style={{ marginLeft: '0.5rem', background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{pendingCount}</span>}
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('users')}
        >
          <Icons.Users /> Équipe ({users.length})
        </button>
        {userRole === 'super_admin' && (
          <button 
            className={`btn ${activeTab === 'clinics' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('clinics')}
          >
            <Icons.Building /> Cliniques ({clinics.length})
          </button>
        )}
      </div>

      {/* TAB: Demandes */}
      {activeTab === 'requests' && (
        <>
          {/* Ajouter un email */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title">Ajouter un email autorisé</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddEmail} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@exemple.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ flex: 1, minWidth: '250px' }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? '...' : 'Ajouter'}
                </button>
              </form>
            </div>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button 
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'pending' && '⏳ En attente'}
                {f === 'approved' && '✓ Approuvés'}
                {f === 'rejected' && '✗ Rejetés'}
                {f === 'all' && '📋 Tous'}
              </button>
            ))}
          </div>

          {/* Liste */}
          <div className="card">
            <div className="card-body">
              {requests.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {requests.map(request => (
                    <div key={request.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'var(--bg-dark)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontWeight: '600' }}>{request.email}</div>
                        {request.full_name && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {request.full_name} {request.clinic_name && `• ${request.clinic_name}`}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(request.requested_at).toLocaleDateString('fr-CA')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          background: request.status === 'approved' ? 'rgba(34, 197, 94, 0.2)' : 
                                      request.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                          color: request.status === 'approved' ? '#22c55e' : 
                                 request.status === 'rejected' ? '#ef4444' : '#eab308'
                        }}>
                          {request.status === 'approved' && '✓'}
                          {request.status === 'rejected' && '✗'}
                          {request.status === 'pending' && '⏳'}
                        </span>

                        {request.status === 'pending' && (
                          <>
                            <button className="btn btn-sm" style={{ background: '#22c55e', color: '#fff' }} onClick={() => handleApprove(request)}><Icons.Check /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(request)}><Icons.X /></button>
                          </>
                        )}

                        {request.status === 'rejected' && (
                          <button className="btn btn-sm" style={{ background: '#22c55e', color: '#fff' }} onClick={() => handleApprove(request)}><Icons.Check /></button>
                        )}

                        {userRole === 'super_admin' && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleDeleteRequest(request)}><Icons.Trash /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Users /></div>
                  <h3>Aucune demande</h3>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TAB: Équipe */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Membres de l'équipe</h3>
          </div>
          <div className="card-body">
            {users.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {users.map(user => (
                  <div key={user.user_id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-dark)',
                    borderRadius: '12px',
                    border: user.user_id === session.user.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {user.profile?.full_name || user.email}
                        {user.user_id === session.user.id && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>(vous)</span>}
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginRight: '1rem' }}>
                          <Icons.Mail /> {user.email}
                        </span>
                        {user.profile?.phone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Icons.Phone /> {user.profile.phone}
                          </span>
                        )}
                      </div>

                      {user.profile?.birthdate && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          📅 {new Date(user.profile.birthdate).toLocaleDateString('fr-CA')}
                        </div>
                      )}

                      {/* Affichage de la clinique assignée */}
                      {user.clinic_name && (
                        <div style={{ 
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(212, 175, 55, 0.15)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: 'var(--accent)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Icons.Building /> {user.clinic_name}
                        </div>
                      )}
                      {!user.clinic_name && !user.clinic_id && (
                        <div style={{ 
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: '#ef4444'
                        }}>
                          ⚠️ Aucune clinique
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {userRole === 'super_admin' ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.user_id, e.target.value)}
                          disabled={user.user_id === session.user.id}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            color: ROLES[user.role].color,
                            fontWeight: '600',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="user">👤 Utilisateur</option>
                          <option value="collaborator">👥 Collaborateur</option>
                          <option value="super_admin">⭐ Super Admin</option>
                        </select>
                      ) : (
                        <span style={{ color: ROLES[user.role].color, fontWeight: '600', fontSize: '0.85rem' }}>
                          {ROLES[user.role].label}
                        </span>
                      )}

                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleEditUser(user)}
                        title="Modifier le profil"
                      >
                        <Icons.Edit />
                      </button>

                      {userRole === 'super_admin' && user.user_id !== session.user.id && (
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={() => handleDeleteUser(user)}
                          style={{ color: '#ef4444' }}
                        >
                          <Icons.Trash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Users /></div>
                <h3>Aucun membre</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal édition utilisateur */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Modifier le profil</h2>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editingUser?.email || ''}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                    placeholder="Prénom Nom"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="514-555-1234"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date de naissance</label>
                  <input
                    type="date"
                    className="form-input"
                    value={userForm.birthdate}
                    onChange={(e) => setUserForm({ ...userForm, birthdate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinique</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.clinic_name}
                    onChange={(e) => setUserForm({ ...userForm, clinic_name: e.target.value })}
                    placeholder="Nom de la clinique"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.address}
                    onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                    placeholder="Adresse complète"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-input"
                    value={userForm.notes}
                    onChange={(e) => setUserForm({ ...userForm, notes: e.target.value })}
                    placeholder="Notes additionnelles..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowUserModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: Cliniques */}
      {activeTab === 'clinics' && userRole === 'super_admin' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gestion des cliniques</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowClinicModal(true)}>
              <Icons.Plus /> Nouvelle clinique
            </button>
          </div>
          <div className="card-body">
            {clinics.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {clinics.map(clinic => {
                  const clinicUsers = users.filter(u => u.clinic_id === clinic.id)
                  return (
                    <div key={clinic.id} style={{
                      padding: '1rem',
                      background: 'var(--bg-dark)',
                      borderRadius: '10px',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icons.Building />
                            {clinic.name}
                          </div>
                          {clinic.address && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              📍 {clinic.address}
                            </div>
                          )}
                          {(clinic.phone || clinic.email) && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              {clinic.phone && <span>📞 {clinic.phone}</span>}
                              {clinic.phone && clinic.email && <span> • </span>}
                              {clinic.email && <span>✉️ {clinic.email}</span>}
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          borderRadius: '12px',
                          fontSize: '0.8rem'
                        }}>
                          {clinicUsers.length} membre(s)
                        </div>
                      </div>
                      
                      {clinicUsers.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Membres:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {clinicUsers.map(u => (
                              <span key={u.user_id} style={{
                                padding: '0.25rem 0.5rem',
                                background: 'var(--bg-card)',
                                borderRadius: '6px',
                                fontSize: '0.8rem'
                              }}>
                                {u.profile?.full_name || u.email}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Building /></div>
                <h3>Aucune clinique</h3>
                <p>Créez votre première clinique</p>
                <button className="btn btn-primary" onClick={() => setShowClinicModal(true)} style={{ marginTop: '1rem' }}>
                  <Icons.Plus /> Créer une clinique
                </button>
              </div>
            )}

            {/* Section: Assigner les utilisateurs */}
            {clinics.length > 0 && users.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Assigner les membres aux cliniques</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {users.map(user => (
                    <div key={user.user_id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--bg-dark)',
                      borderRadius: '8px',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <div style={{ fontWeight: '500' }}>{user.profile?.full_name || user.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      <select
                        value={user.clinic_id || ''}
                        onChange={(e) => handleAssignClinic(user.user_id, e.target.value || null)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-card)',
                          color: 'var(--text)',
                          minWidth: '200px'
                        }}
                      >
                        <option value="">-- Aucune clinique --</option>
                        {clinics.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal création clinique */}
      {showClinicModal && (
        <div className="modal-overlay" onClick={() => setShowClinicModal(false)}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nouvelle clinique</h2>
              <button className="modal-close" onClick={() => setShowClinicModal(false)}>
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleCreateClinic}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom de la clinique *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                    placeholder="Ex: Clinique Esthétique Montréal"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input
                    type="text"
                    className="form-input"
                    value={clinicForm.address}
                    onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                    placeholder="123 rue Principale, Montréal"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={clinicForm.phone}
                    onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                    placeholder="514-555-1234"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={clinicForm.email}
                    onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                    placeholder="contact@clinique.com"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowClinicModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer la clinique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
