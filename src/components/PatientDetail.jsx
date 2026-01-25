import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import PhotoGallery from './PhotoGallery'
import VoiceDictation from './VoiceDictation'

const Icons = {
  ArrowLeft: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Heart: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Document: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Upload: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Clipboard: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  CalendarEmpty: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
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

  // Voice dictation state
  const [showDictation, setShowDictation] = useState(false)
  const [dictationTarget, setDictationTarget] = useState('notes')

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

    if (!error && data) {
      const userIds = [...new Set(data.map(v => v.user_id).filter(Boolean))]
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('user_id, full_name')
          .in('user_id', userIds)

        const profilesMap = {}
        profilesData?.forEach(p => {
          profilesMap[p.user_id] = p.full_name
        })

        const visitsWithPractitioner = data.map(visit => ({
          ...visit,
          practitioner_name: profilesMap[visit.user_id] || 'Praticien non identifié'
        }))
        
        setVisits(visitsWithPractitioner)
      } else {
        setVisits(data)
      }
    } else {
      setVisits([])
    }
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

  // Helper functions
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getPatientName = () => {
    if (patient.metadata?.firstName && patient.metadata?.lastName) {
      return `${patient.metadata.firstName} ${patient.metadata.lastName}`
    }
    return patient.name || 'Patient'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-CA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const toggleTreatment = (zone) => {
    setTreatments(prev => {
      if (prev[zone.id]) {
        const { [zone.id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [zone.id]: { zone_name: zone.label, units: zone.defaultUnits } }
    })
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

    if (!visitError && visitData) {
      const treatmentInserts = Object.entries(treatments).map(([zoneId, data]) => ({
        visit_id: visitData.id,
        zone_name: data.zone_name,
        units: data.units
      }))

      if (treatmentInserts.length > 0) {
        await supabase.from('treatments').insert(treatmentInserts)
      }

      setShowVisitModal(false)
      setForm({ visit_type: 'treatment', notes: '', total_units: 0 })
      setTreatments({})
      fetchVisits()
    }
    setLoading(false)
  }

  const handleSaveMedical = async () => {
    setSavingMedical(true)

    if (medicalHistory) {
      await supabase
        .from('patient_medical_history')
        .update(medicalForm)
        .eq('id', medicalHistory.id)
    } else {
      await supabase
        .from('patient_medical_history')
        .insert([{ ...medicalForm, patient_id: patient.id }])
    }

    await fetchMedicalHistory()
    setSavingMedical(false)
    alert('Dossier médical sauvegardé!')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingDoc(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${patient.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('patient-documents')
      .upload(fileName, file)

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(fileName)

      await supabase.from('patient_documents').insert([{
        patient_id: patient.id,
        document_type: docType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size
      }])

      fetchDocuments()
    }

    setUploadingDoc(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteDocument = async (doc) => {
    if (!window.confirm('Supprimer ce document?')) return

    const fileName = doc.file_url.split('/').pop()
    await supabase.storage.from('patient-documents').remove([`${patient.id}/${fileName}`])
    await supabase.from('patient_documents').delete().eq('id', doc.id)
    fetchDocuments()
  }

  const handleDeletePatient = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient?\n\nCette action est IRRÉVERSIBLE et supprimera TOUTES les données du patient.')) return
    
    const confirmText = window.prompt("Tapez 'supprimer' pour confirmer:")
    if (confirmText?.toLowerCase() !== 'supprimer') {
      alert('Suppression annulée')
      return
    }

    await supabase.from('patients').delete().eq('id', patient.id)
    onBack()
    onRefresh()
  }

  // Styles
  const styles = {
    container: {
      padding: '0'
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: '#2d3436',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      marginBottom: '1.5rem'
    },
    headerCard: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '1.5rem 2rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    avatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'var(--primary)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: '600'
    },
    patientInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    patientName: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '0.25rem'
    },
    visitCount: {
      fontSize: '0.9rem',
      color: 'var(--text-muted)'
    },
    newVisitBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      background: 'var(--primary)',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    tabsContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    },
    tab: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      background: 'transparent',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      color: 'var(--text-secondary)',
      transition: 'all 0.2s'
    },
    tabActive: {
      background: 'var(--primary)',
      color: 'white',
      borderColor: 'var(--primary)'
    },
    contentCard: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '1.5rem',
      minHeight: '400px'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '1.5rem',
      paddingBottom: '0.75rem',
      borderBottom: '1px solid var(--border)'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center'
    },
    emptyIcon: {
      color: 'var(--text-muted)',
      marginBottom: '1rem'
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '0.5rem'
    },
    emptySubtitle: {
      fontSize: '0.9rem',
      color: 'var(--text-muted)',
      marginBottom: '1.5rem'
    },
    addVisitBtnLarge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      background: 'var(--primary)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500'
    },
    deletePatientBtn: {
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(220, 53, 69, 0.4)'
    },
    visitCard: {
      background: 'var(--bg-dark)',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      border: '1px solid var(--border)'
    },
    visitHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.75rem'
    },
    visitDate: {
      fontSize: '1rem',
      fontWeight: '600',
      color: 'var(--text-primary)'
    },
    visitType: {
      fontSize: '0.8rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      background: 'var(--primary)',
      color: 'white'
    },
    visitInfo: {
      fontSize: '0.85rem',
      color: 'var(--text-secondary)',
      marginBottom: '0.5rem'
    },
    visitActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.75rem'
    },
    visitActionBtn: {
      padding: '0.4rem 0.75rem',
      fontSize: '0.8rem',
      borderRadius: '4px',
      border: '1px solid var(--border)',
      background: 'transparent',
      color: 'var(--text-secondary)',
      cursor: 'pointer'
    }
  }

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={onBack}>
        <Icons.ArrowLeft /> Retour
      </button>

      {/* Header Card */}
      <div style={styles.headerCard}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            {getInitials(getPatientName())}
          </div>
          <div style={styles.patientInfo}>
            <div style={styles.patientName}>{getPatientName()}</div>
            <div style={styles.visitCount}>{visits.length} visite(s)</div>
          </div>
        </div>
        <button style={styles.newVisitBtn} onClick={() => setShowVisitModal(true)}>
          <Icons.Plus /> Nouvelle visite
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'visits' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('visits')}
        >
          <Icons.Clipboard /> Visites
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'medical' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('medical')}
        >
          <Icons.Heart /> Dossier médical
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'documents' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('documents')}
        >
          <Icons.Document /> Documents ({documents.length})
        </button>
      </div>

      {/* Content */}
      <div style={styles.contentCard}>
        {/* Visits Tab */}
        {activeTab === 'visits' && (
          <div>
            <h3 style={styles.sectionTitle}>Historique des visites</h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Chargement...
              </div>
            ) : visits.length > 0 ? (
              <div>
                {visits.map(visit => (
                  <div key={visit.id} style={styles.visitCard}>
                    <div style={styles.visitHeader}>
                      <div style={styles.visitDate}>{formatDate(visit.visit_date)}</div>
                      <span style={styles.visitType}>
                        {VISIT_TYPES.find(t => t.id === visit.visit_type)?.label || visit.visit_type}
                      </span>
                    </div>
                    <div style={styles.visitInfo}>
                      Praticien: {visit.practitioner_name || 'Non spécifié'}
                    </div>
                    {visit.total_units > 0 && (
                      <div style={styles.visitInfo}>
                        Total: {visit.total_units} unités
                      </div>
                    )}
                    {visit.notes && (
                      <div style={{ ...styles.visitInfo, fontStyle: 'italic' }}>
                        "{visit.notes}"
                      </div>
                    )}
                    <div style={styles.visitActions}>
                      <button 
                        style={styles.visitActionBtn}
                        onClick={() => setShowPhotoGallery(visit)}
                      >
                        <Icons.Camera /> Photos ({visit.photos?.length || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <Icons.CalendarEmpty />
                </div>
                <div style={styles.emptyTitle}>Aucune visite</div>
                <div style={styles.emptySubtitle}>Ajoutez la première consultation</div>
                <button style={styles.addVisitBtnLarge} onClick={() => setShowVisitModal(true)}>
                  <Icons.Plus /> Ajouter une visite
                </button>
              </div>
            )}
          </div>
        )}

        {/* Medical Tab */}
        {activeTab === 'medical' && (
          <div>
            <h3 style={styles.sectionTitle}>Dossier médical</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Conditions médicales</label>
                <textarea 
                  className="form-input"
                  value={medicalForm.medical_conditions}
                  onChange={(e) => setMedicalForm({ ...medicalForm, medical_conditions: e.target.value })}
                  placeholder="Diabète, hypertension, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Allergies</label>
                <textarea 
                  className="form-input"
                  value={medicalForm.allergies}
                  onChange={(e) => setMedicalForm({ ...medicalForm, allergies: e.target.value })}
                  placeholder="Médicaments, latex, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Médicaments actuels</label>
                <textarea 
                  className="form-input"
                  value={medicalForm.current_medications}
                  onChange={(e) => setMedicalForm({ ...medicalForm, current_medications: e.target.value })}
                  placeholder="Liste des médicaments"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Chirurgies antérieures</label>
                <textarea 
                  className="form-input"
                  value={medicalForm.previous_surgeries}
                  onChange={(e) => setMedicalForm({ ...medicalForm, previous_surgeries: e.target.value })}
                  placeholder="Interventions passées"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Conditions cutanées</label>
                <textarea 
                  className="form-input"
                  value={medicalForm.skin_conditions}
                  onChange={(e) => setMedicalForm({ ...medicalForm, skin_conditions: e.target.value })}
                  placeholder="Eczéma, psoriasis, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contre-indications</label>
                <textarea 
                  className="form-input"
                  value={medicalForm.contraindications}
                  onChange={(e) => setMedicalForm({ ...medicalForm, contraindications: e.target.value })}
                  placeholder="Grossesse, allaitement, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes supplémentaires</label>
                <textarea 
                  className="form-input"
                  value={medicalForm.notes}
                  onChange={(e) => setMedicalForm({ ...medicalForm, notes: e.target.value })}
                  placeholder="Autres informations pertinentes"
                />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button 
                className="btn btn-primary"
                onClick={handleSaveMedical}
                disabled={savingMedical}
              >
                {savingMedical ? 'Sauvegarde...' : 'Sauvegarder le dossier médical'}
              </button>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ ...styles.sectionTitle, marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                Documents
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingDoc}
                >
                  <Icons.Upload /> {uploadingDoc ? 'Upload...' : 'Ajouter'}
                </button>
              </div>
            </div>

            {documents.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {documents.map(doc => (
                  <div 
                    key={doc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--bg-dark)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Icons.Document />
                      <div>
                        <div style={{ fontWeight: '500' }}>{doc.file_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {DOCUMENT_TYPES.find(t => t.id === doc.document_type)?.label} • {formatDate(doc.uploaded_at)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a 
                        href={doc.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        Voir
                      </a>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDeleteDocument(doc)}
                        style={{ color: '#dc3545' }}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <Icons.Document />
                </div>
                <div style={styles.emptyTitle}>Aucun document</div>
                <div style={styles.emptySubtitle}>Ajoutez des consentements, formulaires, etc.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Patient Button */}
      <button style={styles.deletePatientBtn} onClick={handleDeletePatient}>
        <Icons.Trash /> Supprimer le patient
      </button>

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
                          border: `1px solid ${treatments[zone.id] ? 'var(--primary)' : 'var(--border)'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          background: treatments[zone.id] ? 'rgba(90, 154, 156, 0.1)' : 'var(--bg-dark)',
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
    </div>
  )
}
