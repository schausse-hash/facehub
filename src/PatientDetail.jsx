import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import PhotoGallery from './PhotoGallery'

const Icons = {
  ArrowLeft: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
}

const VISIT_TYPES = [
  { id: 'initial', label: 'Consultation initiale' },
  { id: 'treatment', label: 'Traitement' },
  { id: 'recare-2w', label: 'RECARE - 2 semaines' },
  { id: 'recare-3m', label: 'RECARE - 3 mois' },
  { id: 'followup', label: 'Suivi régulier' },
]

const TREATMENT_ZONES = [
  { id: 'front', label: 'Front', defaultUnits: 20 },
  { id: 'glabelle', label: 'Glabelle', defaultUnits: 20 },
  { id: 'pattes-oie-g', label: 'Pattes d\'oie G', defaultUnits: 12 },
  { id: 'pattes-oie-d', label: 'Pattes d\'oie D', defaultUnits: 12 },
  { id: 'bunny-lines', label: 'Bunny lines', defaultUnits: 8 },
  { id: 'lip-flip', label: 'Lip flip', defaultUnits: 4 },
  { id: 'dao', label: 'DAO', defaultUnits: 8 },
  { id: 'menton', label: 'Menton', defaultUnits: 6 },
  { id: 'masseter-g', label: 'Masséter G', defaultUnits: 25 },
  { id: 'masseter-d', label: 'Masséter D', defaultUnits: 25 },
  { id: 'platysma', label: 'Platysma', defaultUnits: 30 },
]

export default function PatientDetail({ patient, onBack, onRefresh, session }) {
  const [visits, setVisits] = useState([])
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [showPhotoGallery, setShowPhotoGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    visit_type: 'treatment',
    notes: '',
    total_units: 0
  })
  const [treatments, setTreatments] = useState({})

  useEffect(() => {
    fetchVisits()
  }, [patient.id])

  const fetchVisits = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        treatments (*),
        photos (*)
      `)
      .eq('patient_id', patient.id)
      .order('visit_date', { ascending: false })

    if (error) {
      console.error('Error:', error)
    } else {
      setVisits(data || [])
    }
    setLoading(false)
  }

  const handleAddVisit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Calculer le total des unités
    const totalUnits = Object.values(treatments)
      .filter(t => t)
      .reduce((sum, t) => sum + (t.units || 0), 0)

    // Créer la visite
    const { data: visitData, error: visitError } = await supabase
      .from('visits')
      .insert([{
        patient_id: patient.id,
        user_id: session.user.id,
        visit_type: form.visit_type,
        notes: form.notes,
        total_units: totalUnits
      }])
      .select()
      .single()

    if (visitError) {
      alert('Erreur: ' + visitError.message)
      setLoading(false)
      return
    }

    // Ajouter les traitements
    const treatmentsList = Object.entries(treatments)
      .filter(([_, t]) => t && t.units > 0)
      .map(([zoneId, t]) => ({
        visit_id: visitData.id,
        zone_id: zoneId,
        zone_name: t.name,
        units: t.units
      }))

    if (treatmentsList.length > 0) {
      const { error: treatError } = await supabase
        .from('treatments')
        .insert(treatmentsList)

      if (treatError) {
        console.error('Error adding treatments:', treatError)
      }
    }

    setShowVisitModal(false)
    setForm({ visit_type: 'treatment', notes: '', total_units: 0 })
    setTreatments({})
    fetchVisits()
    onRefresh()
    setLoading(false)
  }

  const handleDeletePatient = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient et toutes ses données?')) {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patient.id)

      if (error) {
        alert('Erreur: ' + error.message)
      } else {
        onRefresh()
        onBack()
      }
    }
  }

  const toggleTreatment = (zone) => {
    setTreatments(prev => ({
      ...prev,
      [zone.id]: prev[zone.id] ? undefined : { name: zone.label, units: zone.defaultUnits }
    }))
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div>
      <div 
        className="back-btn" 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)', marginBottom: '1.5rem' }}
      >
        <Icons.ArrowLeft /> Retour aux patients
      </div>

      {/* Header Patient */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.5rem',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--gradient-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          fontWeight: '600',
          fontSize: '1.75rem'
        }}>
          {getInitials(patient.name)}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            {patient.name}
          </h1>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {patient.phone && <span>{patient.phone}</span>}
            {patient.phone && patient.email && <span> • </span>}
            {patient.email && <span>{patient.email}</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              padding: '0.375rem 0.875rem',
              background: 'var(--bg-dark)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              fontSize: '0.8rem'
            }}>
              {visits.length} visite(s)
            </span>
            {patient.allergies && (
              <span style={{
                padding: '0.375rem 0.875rem',
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning)',
                borderRadius: '20px',
                fontSize: '0.8rem',
                color: 'var(--warning)'
              }}>
                ⚠ {patient.allergies}
              </span>
            )}
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowVisitModal(true)}>
          <Icons.Plus /> Nouvelle visite
        </button>
      </div>

      {/* Liste des visites */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Historique des visites</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Chargement...</p>
          ) : visits.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {visits.map(visit => {
                const typeInfo = VISIT_TYPES.find(t => t.id === visit.visit_type) || VISIT_TYPES[0]
                const photoCount = visit.photos?.length || 0
                return (
                  <div key={visit.id} style={{
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{formatDate(visit.visit_date)}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{typeInfo.label}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        {visit.total_units > 0 && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: 'var(--accent)',
                            color: 'var(--primary)',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {visit.total_units} unités
                          </span>
                        )}
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setShowPhotoGallery(visit)}
                          style={{ 
                            padding: '0.25rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Icons.Camera /> 
                          <span>{photoCount > 0 ? `${photoCount} 📷` : 'Photos'}</span>
                        </button>
                      </div>
                    </div>
                    
                    {visit.treatments?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {visit.treatments.map((t, i) => (
                          <span key={i} style={{
                            padding: '0.25rem 0.75rem',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            fontSize: '0.75rem'
                          }}>
                            {t.zone_name} ({t.units}u)
                          </span>
                        ))}
                      </div>
                    )}

                    {visit.notes && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {visit.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Icons.Calendar />
              <h3>Aucune visite</h3>
              <p>Ajoutez la première consultation</p>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowVisitModal(true)}
                style={{ marginTop: '1.5rem' }}
              >
                <Icons.Plus /> Ajouter une visite
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bouton supprimer */}
      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button className="btn btn-danger btn-sm" onClick={handleDeletePatient}>
          <Icons.Trash /> Supprimer le patient
        </button>
      </div>

      {/* Modal Nouvelle Visite */}
      {showVisitModal && (
        <div className="modal-overlay" onClick={() => setShowVisitModal(false)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nouvelle visite</h2>
              <button className="modal-close" onClick={() => setShowVisitModal(false)}>
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleAddVisit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Type de visite</label>
                  <select 
                    className="form-select"
                    value={form.visit_type}
                    onChange={(e) => setForm({ ...form, visit_type: e.target.value })}
                  >
                    {VISIT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Zones traitées</label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                    gap: '0.75rem' 
                  }}>
                    {TREATMENT_ZONES.map(zone => (
                      <div 
                        key={zone.id}
                        onClick={() => toggleTreatment(zone)}
                        style={{
                          padding: '1rem',
                          border: `1px solid ${treatments[zone.id] ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          background: treatments[zone.id] ? 'rgba(212, 165, 116, 0.1)' : 'var(--bg-dark)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{zone.label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{zone.defaultUnits} unités</div>
                        {treatments[zone.id] && (
                          <input
                            type="number"
                            style={{
                              marginTop: '0.5rem',
                              width: '100%',
                              padding: '0.4rem',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              background: 'var(--bg-dark)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                            value={treatments[zone.id].units}
                            onChange={(e) => setTreatments(prev => ({
                              ...prev,
                              [zone.id]: { ...prev[zone.id], units: parseInt(e.target.value) || 0 }
                            }))}
                            onClick={e => e.stopPropagation()}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea 
                    className="form-input"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Observations, recommandations..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowVisitModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {showPhotoGallery && (
        <PhotoGallery
          visit={showPhotoGallery}
          patient={patient}
          onClose={() => {
            setShowPhotoGallery(null)
            fetchVisits()
          }}
          onRefresh={fetchVisits}
        />
      )}
    </div>
  )
}
