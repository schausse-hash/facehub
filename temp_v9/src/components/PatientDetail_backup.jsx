import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import PhotoGallery from './PhotoGallery'

const Icons = {
  ArrowLeft: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Heart: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Document: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Upload: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Download: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Save: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
}

const TREATMENT_ZONES = [
  { id: 'front', label: 'Front', defaultUnits: 20 },
  { id: 'glabelle', label: 'Glabelle', defaultUnits: 20 },
  { id: 'crow_left', label: "Pattes d'oie G", defaultUnits: 12 },
  { id: 'crow_right', label: "Pattes d'oie D", defaultUnits: 12 },
  { id: 'bunny', label: 'Bunny lines', defaultUnits: 8 },
  { id: 'lip_flip', label: 'Lip flip', defaultUnits: 4 },
  { id: 'dao', label: 'DAO', defaultUnits: 8 },
  { id: 'menton', label: 'Menton', defaultUnits: 6 },
  { id: 'masseter_left', label: 'Masséter G', defaultUnits: 25 },
  { id: 'masseter_right', label: 'Masséter D', defaultUnits: 25 },
  { id: 'platysma', label: 'Platysma', defaultUnits: 30 },
]

const VISIT_TYPES = [
  { id: 'initial', label: 'Consultation initiale' },
  { id: 'treatment', label: 'Traitement' },
  { id: 'followup', label: 'Suivi' },
  { id: 'touch_up', label: 'Retouche' },
]

const DOCUMENT_TYPES = [
  { id: 'consent', label: 'Consentement' },
  { id: 'medical_form', label: 'Formulaire médical' },
  { id: 'photo_consent', label: 'Consentement photos' },
  { id: 'treatment_plan', label: 'Plan de traitement' },
  { id: 'prescription', label: 'Prescription' },
  { id: 'invoice', label: 'Facture' },
  { id: 'other', label: 'Autre' },
]

export default function PatientDetail({ patient, onBack, onRefresh, session }) {
  const [activeTab, setActiveTab] = useState('visits')
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

  // Medical history state
  const [medicalHistory, setMedicalHistory] = useState(null)
  const [medicalForm, setMedicalForm] = useState({
    medical_conditions: '',
    allergies: '',
    current_medications: '',
    previous_surgeries: '',
    skin_conditions: '',
    contraindications: '',
    blood_type: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: ''
  })
  const [savingMedical, setSavingMedical] = useState(false)

  // Documents state
  const [documents, setDocuments] = useState([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docType, setDocType] = useState('consent')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchVisits()
    fetchMedicalHistory()
    fetchDocuments()
  }, [patient.id])

  const fetchVisits = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('visits')
      .select(`*, treatments (*), photos (*)`)
      .eq('patient_id', patient.id)
      .order('visit_date', { ascending: false })

    if (!error) setVisits(data || [])
    setLoading(false)
  }

  const fetchMedicalHistory = async () => {
    const { data } = await supabase
      .from('patient_medical_history')
      .select('*')
      .eq('patient_id', patient.id)
      .single()

    if (data) {
      setMedicalHistory(data)
      setMedicalForm({
        medical_conditions: data.medical_conditions || '',
        allergies: data.allergies || '',
        current_medications: data.current_medications || '',
        previous_surgeries: data.previous_surgeries || '',
        skin_conditions: data.skin_conditions || '',
        contraindications: data.contraindications || '',
        blood_type: data.blood_type || '',
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        notes: data.notes || ''
      })
    }
  }

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patient.id)
      .order('uploaded_at', { ascending: false })

    setDocuments(data || [])
  }

  const handleAddVisit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const totalUnits = Object.values(treatments).reduce((sum, t) => sum + (t.units || 0), 0)

    const { data: visitData, error: visitError } = await supabase
      .from('visits')
      .insert([{
        patient_id: patient.id,
        user_id: session.user.id,
        visit_type: form.visit_type,
        visit_date: new Date().toISOString(),
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

    const treatmentInserts = Object.entries(treatments).map(([zoneId, data]) => ({
      visit_id: visitData.id,
      zone_id: zoneId,
      zone_label: data.label,
      units: data.units
    }))

    if (treatmentInserts.length > 0) {
      await supabase.from('treatments').insert(treatmentInserts)
    }

    setShowVisitModal(false)
    setForm({ visit_type: 'treatment', notes: '', total_units: 0 })
    setTreatments({})
    fetchVisits()
    onRefresh()
  }

  const toggleTreatment = (zone) => {
    setTreatments(prev => {
      if (prev[zone.id]) {
        const { [zone.id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [zone.id]: { label: zone.label, units: zone.defaultUnits } }
    })
  }

  const handleSaveMedicalHistory = async () => {
    setSavingMedical(true)

    const dataToSave = {
      patient_id: patient.id,
      ...medicalForm,
      last_updated: new Date().toISOString(),
      updated_by: session.user.id
    }

    const { error } = await supabase
      .from('patient_medical_history')
      .upsert(dataToSave, { onConflict: 'patient_id' })

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      fetchMedicalHistory()
    }
    setSavingMedical(false)
  }

  const handleUploadDocument = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingDoc(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${patient.id}/docs/${Date.now()}_${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('patient-photos')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('patient_documents')
        .insert([{
          patient_id: patient.id,
          document_name: file.name,
          document_type: docType,
          document_url: publicUrl,
          storage_path: fileName,
          uploaded_by: session.user.id
        }])

      if (dbError) throw dbError

      fetchDocuments()
    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setUploadingDoc(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteDocument = async (doc) => {
    if (!window.confirm('Supprimer ce document?')) return

    await supabase.storage.from('patient-photos').remove([doc.storage_path])
    await supabase.from('patient_documents').delete().eq('id', doc.id)
    fetchDocuments()
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-CA', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <button className="btn btn-outline" onClick={onBack}>
          <Icons.ArrowLeft /> Retour
        </button>
      </div>

      {/* Patient Info Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'var(--accent)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: '600'
          }}>
            {getInitials(patient.name)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>{patient.name}</h2>
            <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {patient.phone} • {patient.email}
            </p>
            <span className="badge">{visits.length} visite(s)</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowVisitModal(true)}>
            <Icons.Plus /> Nouvelle visite
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button className={`btn ${activeTab === 'visits' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('visits')}>
          <Icons.Calendar /> Visites
        </button>
        <button className={`btn ${activeTab === 'medical' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('medical')}>
          <Icons.Heart /> Dossier médical
        </button>
        <button className={`btn ${activeTab === 'documents' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('documents')}>
          <Icons.Document /> Documents ({documents.length})
        </button>
      </div>

      {/* TAB: Visits */}
      {activeTab === 'visits' && (
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                            style={{ padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Icons.Camera /> 
                            <span>{photoCount > 0 ? `${photoCount} 📷` : 'Photos'}</span>
                          </button>
                        </div>
                      </div>

                      {visit.treatments?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {visit.treatments.map(t => (
                            <span key={t.id} style={{
                              padding: '0.25rem 0.5rem',
                              background: 'var(--bg-card)',
                              borderRadius: '6px',
                              fontSize: '0.75rem'
                            }}>
                              {t.zone_label}: {t.units}u
                            </span>
                          ))}
                        </div>
                      )}

                      {visit.notes && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                          {visit.notes}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Calendar /></div>
                <h3>Aucune visite</h3>
                <p>Ajoutez la première consultation</p>
                <button className="btn btn-primary" onClick={() => setShowVisitModal(true)}>
                  <Icons.Plus /> Ajouter une visite
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Medical History */}
      {activeTab === 'medical' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Dossier médical</h3>
            <button className="btn btn-primary btn-sm" onClick={handleSaveMedicalHistory} disabled={savingMedical}>
              <Icons.Save /> {savingMedical ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Conditions médicales</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={medicalForm.medical_conditions}
                  onChange={(e) => setMedicalForm({ ...medicalForm, medical_conditions: e.target.value })}
                  placeholder="Diabète, hypertension, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Allergies</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={medicalForm.allergies}
                  onChange={(e) => setMedicalForm({ ...medicalForm, allergies: e.target.value })}
                  placeholder="Médicaments, latex, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Médicaments actuels</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={medicalForm.current_medications}
                  onChange={(e) => setMedicalForm({ ...medicalForm, current_medications: e.target.value })}
                  placeholder="Liste des médicaments"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chirurgies antérieures</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={medicalForm.previous_surgeries}
                  onChange={(e) => setMedicalForm({ ...medicalForm, previous_surgeries: e.target.value })}
                  placeholder="Chirurgies esthétiques ou autres"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Conditions cutanées</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={medicalForm.skin_conditions}
                  onChange={(e) => setMedicalForm({ ...medicalForm, skin_conditions: e.target.value })}
                  placeholder="Eczéma, psoriasis, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contre-indications</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={medicalForm.contraindications}
                  onChange={(e) => setMedicalForm({ ...medicalForm, contraindications: e.target.value })}
                  placeholder="Grossesse, allaitement, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Groupe sanguin</label>
                <select
                  className="form-select"
                  value={medicalForm.blood_type}
                  onChange={(e) => setMedicalForm({ ...medicalForm, blood_type: e.target.value })}
                >
                  <option value="">Non spécifié</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Contact d'urgence - Nom</label>
                <input
                  type="text"
                  className="form-input"
                  value={medicalForm.emergency_contact_name}
                  onChange={(e) => setMedicalForm({ ...medicalForm, emergency_contact_name: e.target.value })}
                  placeholder="Nom du contact"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact d'urgence - Téléphone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={medicalForm.emergency_contact_phone}
                  onChange={(e) => setMedicalForm({ ...medicalForm, emergency_contact_phone: e.target.value })}
                  placeholder="514-555-1234"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Notes additionnelles</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={medicalForm.notes}
                  onChange={(e) => setMedicalForm({ ...medicalForm, notes: e.target.value })}
                  placeholder="Autres informations importantes..."
                />
              </div>
            </div>

            {medicalHistory?.last_updated && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                Dernière mise à jour: {formatDate(medicalHistory.last_updated)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB: Documents */}
      {activeTab === 'documents' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Documents</h3>
          </div>
          <div className="card-body">
            {/* Upload section */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1.5rem', 
              padding: '1rem',
              background: 'var(--bg-dark)',
              borderRadius: '12px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <select
                className="form-select"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                style={{ width: 'auto' }}
              >
                {DOCUMENT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadDocument}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <button 
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDoc}
              >
                <Icons.Upload /> {uploadingDoc ? 'Upload...' : 'Ajouter un document'}
              </button>
            </div>

            {/* Documents list */}
            {documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {documents.map(doc => {
                  const typeInfo = DOCUMENT_TYPES.find(t => t.id === doc.document_type) || { label: doc.document_type }
                  return (
                    <div key={doc.id} style={{
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        <div style={{ width: 40, height: 40, color: 'var(--accent)' }}>
                          <Icons.Document />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{doc.document_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {typeInfo.label} • {formatDate(doc.uploaded_at)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a 
                          href={doc.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          <Icons.Download /> Voir
                        </a>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDeleteDocument(doc)}
                          style={{ color: '#ef4444' }}
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Document /></div>
                <h3>Aucun document</h3>
                <p>Ajoutez des consentements, formulaires, etc.</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
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
                <button type="button" className="btn btn-outline" onClick={() => setShowVisitModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
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
          allVisits={visits}
          onClose={() => {
            setShowPhotoGallery(null)
            fetchVisits()
          }}
          onRefresh={fetchVisits}
        />
      )}

      {/* Delete Patient Button */}
      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button 
          className="btn btn-danger"
          onClick={async () => {
            if (window.confirm('Supprimer ce patient et toutes ses données?')) {
              await supabase.from('patients').delete().eq('id', patient.id)
              onBack()
              onRefresh()
            }
          }}
        >
          <Icons.Trash /> Supprimer le patient
        </button>
      </div>
    </div>
  )
}
