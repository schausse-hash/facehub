import { useState } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Search: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Users: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
}

export default function PatientList({ patients, onRefresh, onSelectPatient, session, userClinic }) {
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    allergies: '',
    notes: '',
    follow_up_interval: 3
  })

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('patients')
      .insert([{
        ...form,
        user_id: session.user.id,
        clinic_id: userClinic?.id || null
      }])

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      setShowModal(false)
      setForm({
        name: '',
        email: '',
        phone: '',
        birthdate: '',
        allergies: '',
        notes: '',
        follow_up_interval: 3
      })
      onRefresh()
    }
    setLoading(false)
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{patients.length} patient(s) enregistré(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icons.Plus /> Nouveau patient
        </button>
      </div>

      <div className="search-box">
        <Icons.Search />
        <input 
          type="text" 
          placeholder="Rechercher par nom, téléphone ou courriel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPatients.length > 0 ? (
        <div className="patient-list">
          {filteredPatients.map(patient => (
            <div 
              key={patient.id} 
              className="patient-card"
              onClick={() => onSelectPatient(patient)}
            >
              <div className="patient-avatar">{getInitials(patient.name)}</div>
              <div className="patient-info">
                <div className="patient-name">{patient.name}</div>
                <div className="patient-meta">
                  {patient.phone && <span>{patient.phone} • </span>}
                  {patient.visits?.length || 0} visite(s) • Suivi aux {patient.follow_up_interval || 3} mois
                </div>
              </div>
              <span className="patient-status status-ok">À jour</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <Icons.Users />
            <h3>{searchTerm ? 'Aucun résultat' : 'Aucun patient'}</h3>
            <p>{searchTerm ? 'Modifiez votre recherche' : 'Ajoutez votre premier patient'}</p>
            {!searchTerm && (
              <button 
                className="btn btn-primary" 
                onClick={() => setShowModal(true)}
                style={{ marginTop: '1.5rem' }}
              >
                <Icons.Plus /> Ajouter un patient
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Nouveau Patient */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nouveau patient</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom complet *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input 
                      type="tel" 
                      className="form-input"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Courriel</label>
                    <input 
                      type="email" 
                      className="form-input"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date de naissance</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={form.birthdate}
                      onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Intervalle de suivi</label>
                    <select 
                      className="form-select"
                      value={form.follow_up_interval}
                      onChange={(e) => setForm({ ...form, follow_up_interval: parseInt(e.target.value) })}
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
                    value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                    placeholder="Ex: Lidocaïne, latex..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea 
                    className="form-input"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Notes additionnelles..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer le patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
