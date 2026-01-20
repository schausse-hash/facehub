import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Users: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Shield: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Star: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
}

const ROLES = {
  user: { label: 'Utilisateur', color: '#6b7280', description: 'Voir ses patients, ajouter photos' },
  collaborator: { label: 'Collaborateur', color: '#3b82f6', description: 'Tout + approuver demandes' },
  super_admin: { label: 'Super Admin', color: '#eab308', description: 'Tout + gérer les rôles' }
}

export default function Admin({ session }) {
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [activeTab, setActiveTab] = useState('requests')
  const [filter, setFilter] = useState('pending')
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    checkUserRole()
  }, [])

  useEffect(() => {
    if (userRole && (userRole === 'collaborator' || userRole === 'super_admin')) {
      fetchRequests()
      if (userRole === 'super_admin') {
        fetchUsers()
      }
    }
  }, [userRole, filter])

  const checkUserRole = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      setUserRole(data.role)
    } else {
      setUserRole(null)
    }
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

    const { data, error } = await query
    if (!error) setRequests(data || [])
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setUsers(data || [])
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

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
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
    if (userRole !== 'super_admin') {
      alert('Seul le Super Admin peut supprimer')
      return
    }
    if (!window.confirm(`Supprimer définitivement ${request.email}?`)) return

    const { error } = await supabase
      .from('user_requests')
      .delete()
      .eq('id', request.id)

    if (!error) fetchRequests()
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

    if (error) {
      if (error.code === '23505') {
        alert('Cet email existe déjà')
      } else {
        alert('Erreur: ' + error.message)
      }
    } else {
      setNewEmail('')
      fetchRequests()
    }
    setAdding(false)
  }

  const handleChangeRole = async (userId, newRole) => {
    if (userRole !== 'super_admin') {
      alert('Seul le Super Admin peut changer les rôles')
      return
    }

    if (userId === session.user.id && newRole !== 'super_admin') {
      alert('Vous ne pouvez pas réduire votre propre rôle!')
      return
    }

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole, updated_by: session.user.id })
      .eq('user_id', userId)

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      fetchUsers()
    }
  }

  const handleDeleteUser = async (user) => {
    if (userRole !== 'super_admin') {
      alert('Seul le Super Admin peut supprimer')
      return
    }
    if (user.user_id === session.user.id) {
      alert('Vous ne pouvez pas vous supprimer vous-même!')
      return
    }
    if (!window.confirm(`Supprimer ${user.email} de l'équipe?`)) return

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', user.user_id)

    if (!error) fetchUsers()
  }

  const handleAddUserRole = async (email, role) => {
    // Trouver l'utilisateur par email
    const { data: userData } = await supabase
      .from('user_requests')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'approved')
      .single()

    if (!userData) {
      alert('Cet email doit d\'abord être approuvé dans les demandes')
      return
    }

    // L'utilisateur doit s'être inscrit pour avoir un user_id
    alert('L\'utilisateur doit d\'abord créer son compte. Une fois connecté, vous pourrez modifier son rôle.')
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
            Connecté en tant que <strong style={{ color: ROLES[userRole].color }}>{ROLES[userRole].label}</strong>
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('requests')}
        >
          <Icons.Clock /> Demandes {pendingCount > 0 && <span style={{ marginLeft: '0.5rem', background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{pendingCount}</span>}
        </button>
        {userRole === 'super_admin' && (
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('users')}
          >
            <Icons.Users /> Équipe
          </button>
        )}
      </div>

      {/* TAB: Demandes d'accès */}
      {activeTab === 'requests' && (
        <>
          {/* Ajouter un email */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title">Ajouter un utilisateur autorisé</h3>
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
                  {adding ? 'Ajout...' : 'Ajouter'}
                </button>
              </form>
            </div>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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

          {/* Liste des demandes */}
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
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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
                                      request.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 
                                      'rgba(234, 179, 8, 0.2)',
                          color: request.status === 'approved' ? '#22c55e' : 
                                 request.status === 'rejected' ? '#ef4444' : '#eab308'
                        }}>
                          {request.status === 'approved' && '✓ Approuvé'}
                          {request.status === 'rejected' && '✗ Rejeté'}
                          {request.status === 'pending' && '⏳ En attente'}
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
                          <button className="btn btn-outline btn-sm" onClick={() => handleDeleteRequest(request)} style={{ color: 'var(--text-muted)' }}><Icons.Trash /></button>
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

      {/* TAB: Gestion de l'équipe (Super Admin seulement) */}
      {activeTab === 'users' && userRole === 'super_admin' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Équipe & Rôles</h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-dark)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.5rem' }}><strong>Rôles disponibles :</strong></div>
              {Object.entries(ROLES).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: val.color }}></span>
                  <strong>{val.label}</strong> - {val.description}
                </div>
              ))}
            </div>

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
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user.email}
                        {user.user_id === session.user.id && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>(vous)</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Ajouté le {new Date(user.created_at).toLocaleDateString('fr-CA')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.user_id, e.target.value)}
                        disabled={user.user_id === session.user.id}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-card)',
                          color: ROLES[user.role].color,
                          fontWeight: '600',
                          cursor: user.user_id === session.user.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <option value="user">👤 Utilisateur</option>
                        <option value="collaborator">👥 Collaborateur</option>
                        <option value="super_admin">⭐ Super Admin</option>
                      </select>

                      {user.user_id !== session.user.id && (
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
                <h3>Aucun utilisateur</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
