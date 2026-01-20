import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Users: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Shield: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
}

export default function Admin({ session }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [filter, setFilter] = useState('pending')
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchRequests()
    }
  }, [isAdmin, filter])

  const checkAdmin = async () => {
    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    setLoading(true)
    let query = supabase
      .from('user_requests')
      .select('*')
      .order('requested_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error:', error)
    } else {
      setRequests(data || [])
    }
    setLoading(false)
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

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      fetchRequests()
    }
  }

  const handleDelete = async (request) => {
    if (!window.confirm(`Supprimer définitivement ${request.email}?`)) return

    const { error } = await supabase
      .from('user_requests')
      .delete()
      .eq('id', request.id)

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      fetchRequests()
    }
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

  if (!isAdmin) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <Icons.Shield />
            <h3>Accès refusé</h3>
            <p>Vous n'avez pas les droits administrateur.</p>
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
          <p className="page-subtitle">Gérer les demandes d'accès</p>
        </div>
      </div>

      {/* Ajouter un email manuellement */}
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
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('pending')}
        >
          <Icons.Clock /> En attente {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button 
          className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('approved')}
        >
          <Icons.Check /> Approuvés
        </button>
        <button 
          className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('rejected')}
        >
          <Icons.X /> Rejetés
        </button>
        <button 
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          <Icons.Users /> Tous
        </button>
      </div>

      {/* Liste des demandes */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {filter === 'pending' && 'Demandes en attente'}
            {filter === 'approved' && 'Utilisateurs approuvés'}
            {filter === 'rejected' && 'Demandes rejetées'}
            {filter === 'all' && 'Toutes les demandes'}
          </h3>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Chargement...</p>
          ) : requests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map(request => (
                <div 
                  key={request.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-dark)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {request.email}
                    </div>
                    {request.full_name && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {request.full_name} {request.clinic_name && `• ${request.clinic_name}`}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Demandé le {new Date(request.requested_at).toLocaleDateString('fr-CA')}
                      {request.approved_at && ` • Approuvé le ${new Date(request.approved_at).toLocaleDateString('fr-CA')}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* Badge de statut */}
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: request.status === 'approved' ? 'rgba(34, 197, 94, 0.2)' : 
                                  request.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 
                                  'rgba(234, 179, 8, 0.2)',
                      color: request.status === 'approved' ? '#22c55e' : 
                             request.status === 'rejected' ? '#ef4444' : 
                             '#eab308'
                    }}>
                      {request.status === 'approved' && '✓ Approuvé'}
                      {request.status === 'rejected' && '✗ Rejeté'}
                      {request.status === 'pending' && '⏳ En attente'}
                    </span>

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-sm"
                          style={{ background: '#22c55e', color: '#fff' }}
                          onClick={() => handleApprove(request)}
                          title="Approuver"
                        >
                          <Icons.Check />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReject(request)}
                          title="Rejeter"
                        >
                          <Icons.X />
                        </button>
                      </>
                    )}

                    {request.status === 'rejected' && (
                      <button 
                        className="btn btn-sm"
                        style={{ background: '#22c55e', color: '#fff' }}
                        onClick={() => handleApprove(request)}
                        title="Approuver quand même"
                      >
                        <Icons.Check />
                      </button>
                    )}

                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDelete(request)}
                      title="Supprimer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icons.Users />
              <h3>Aucune demande</h3>
              <p>
                {filter === 'pending' && 'Pas de demande en attente'}
                {filter === 'approved' && 'Aucun utilisateur approuvé'}
                {filter === 'rejected' && 'Aucune demande rejetée'}
                {filter === 'all' && 'Aucune demande pour le moment'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
