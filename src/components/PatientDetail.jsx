import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import PhotoGallery from './PhotoGallery'
import PatientEdit from './PatientEdit'

const Icons = {
  ArrowLeft: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Heart: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Document: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Upload: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Clipboard: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  CalendarEmpty: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  User: () => <svg fill="currentColor" viewBox="0 0 24 24" width="60" height="60"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Warning: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
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

export default function PatientDetail({ patient, onBack, onRefresh, session, onEditProfile, onViewVisits, defaultView = 'profile' }) {
  const [currentView, setCurrentView] = useState(defaultView)
  const [visits, setVisits] = useState([])
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [showPhotoGallery, setShowPhotoGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ visit_type: 'treatment', notes: '', total_units: 0 })
  const [treatments, setTreatments] = useState({})
  const [documents, setDocuments] = useState([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docType, setDocType] = useState('consent')
  const fileInputRef = useRef(null)

  useEffect(() => { fetchVisits(); fetchDocuments() }, [patient.id])

  const fetchVisits = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('visits').select(`*, treatments (*), photos (*)`).eq('patient_id', patient.id).order('visit_date', { ascending: false })
    if (!error && data) {
      const userIds = [...new Set(data.map(v => v.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase.from('user_profiles').select('user_id, full_name').in('user_id', userIds)
        const profilesMap = {}
        profilesData?.forEach(p => { profilesMap[p.user_id] = p.full_name })
        setVisits(data.map(visit => ({ ...visit, practitioner_name: profilesMap[visit.user_id] || 'Praticien non identifié' })))
      } else { setVisits(data) }
    } else { setVisits([]) }
    setLoading(false)
  }

  const fetchDocuments = async () => {
    const { data } = await supabase.from('patient_documents').select('*').eq('patient_id', patient.id).order('uploaded_at', { ascending: false })
    setDocuments(data || [])
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const isProfileComplete = () => {
    const m = patient.metadata
    if (!m || m.registrationType === 'quick') return false
    return !!(m.firstName && m.lastName && patient.birthdate && (m.contact?.email || patient.email))
  }

  const toggleTreatment = (zone) => {
    setTreatments(prev => {
      if (prev[zone.id]) { const { [zone.id]: _, ...rest } = prev; return rest }
      return { ...prev, [zone.id]: { zone_name: zone.label, units: zone.defaultUnits } }
    })
  }

  const handleAddVisit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const totalUnits = Object.values(treatments).reduce((sum, t) => sum + (t.units || 0), 0)
    const { data: visitData, error: visitError } = await supabase.from('visits').insert([{ patient_id: patient.id, user_id: session.user.id, visit_type: form.visit_type, visit_date: new Date().toISOString(), notes: form.notes, total_units: totalUnits }]).select().single()
    if (!visitError && visitData) {
      const treatmentInserts = Object.entries(treatments).map(([zoneId, data]) => ({ visit_id: visitData.id, zone_name: data.zone_name, units: data.units }))
      if (treatmentInserts.length > 0) await supabase.from('treatments').insert(treatmentInserts)
      setShowVisitModal(false); setForm({ visit_type: 'treatment', notes: '', total_units: 0 }); setTreatments({}); fetchVisits()
    }
    setLoading(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingDoc(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${patient.id}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('patient-documents').upload(fileName, file)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('patient-documents').getPublicUrl(fileName)
      await supabase.from('patient_documents').insert([{ patient_id: patient.id, document_type: docType, file_name: file.name, file_url: publicUrl, file_size: file.size }])
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

  const m = patient.metadata || {}
  const firstName = m.firstName || patient.name?.split(' ')[0] || '-'
  const lastName = m.lastName || patient.name?.split(' ').slice(1).join(' ') || '-'
  const fullName = `${firstName} ${lastName}`
  const getInitials = () => fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // ==================== PROFILE VIEW ====================
  if (currentView === 'profile') {
    return (
      <div className="patient-profile-container">
        <style>{`
          .patient-profile-container { background: var(--bg-main); min-height: 100%; padding: 1.5rem; color: var(--text-primary); }
          .pp-breadcrumb { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; }
          .pp-breadcrumb a { color: var(--text-muted); text-decoration: none; }
          .pp-breadcrumb a:hover { color: var(--primary); }
          .pp-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
          .pp-warning { background: var(--warning-bg); border: 1px solid var(--warning); border-radius: 10px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; }
          .pp-warning-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: var(--warning); }
          .pp-warning-title { font-weight: 600; }
          .pp-warning-text { font-size: 0.9rem; color: var(--warning); opacity: 0.9; }
          .pp-warning-link { text-decoration: underline; cursor: pointer; font-weight: 500; }
          .pp-top-grid { display: grid; grid-template-columns: 280px 1fr 320px; gap: 1.5rem; margin-bottom: 1.5rem; }
          .pp-card { background: var(--bg-card); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border); }
          .pp-profile-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
          .pp-avatar { width: 100px; height: 100px; border-radius: 50%; background: var(--bg-sidebar); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: var(--text-muted); border: 2px solid var(--border); }
          .pp-status { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.5px; }
          .pp-status-active { background: var(--success-bg); color: var(--success); }
          .pp-status-inactive { background: var(--danger-bg); color: var(--danger); }
          .pp-name { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem; }
          .pp-email { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }
          .pp-btn { width: 100%; max-width: 200px; padding: 0.75rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.15s; }
          .pp-btn-primary { background: var(--primary); color: white; }
          .pp-btn-primary:hover { background: var(--primary-dark); }
          .pp-btn-secondary { background: var(--bg-card-hover); color: var(--text-secondary); border: 1px solid var(--border); }
          .pp-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
          .pp-section-title { font-size: 1rem; font-weight: 600; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
          .pp-info-row { margin-bottom: 1rem; }
          .pp-info-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.3px; }
          .pp-info-value { font-size: 0.9rem; color: var(--text-secondary); }
          .pp-right-col { display: flex; flex-direction: column; gap: 1rem; }
          .pp-consent-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
          .pp-consent-dot { width: 8px; height: 8px; border-radius: 50%; }
          .pp-consent-label { font-size: 0.85rem; color: var(--text-secondary); }
          .pp-consent-status { font-size: 0.85rem; color: var(--primary); font-weight: 500; }
          .pp-update-link { display: block; margin-top: 1rem; font-size: 0.85rem; color: var(--primary); text-decoration: underline; cursor: pointer; }
          .pp-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .pp-tabs-row { display: flex; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
          .pp-tab { font-size: 0.85rem; color: var(--text-muted); cursor: pointer; padding-bottom: 0.5rem; }
          .pp-tab-active { font-size: 0.85rem; color: var(--primary); cursor: pointer; padding-bottom: 0.5rem; border-bottom: 2px solid var(--primary); font-weight: 500; margin-bottom: -1px; }
          .pp-bottom-content { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          @media (max-width: 1200px) { .pp-top-grid { grid-template-columns: 1fr 1fr; } .pp-profile-card { grid-column: span 2; flex-direction: row; gap: 2rem; text-align: left; } .pp-avatar { margin-bottom: 0; } }
          @media (max-width: 768px) { .pp-top-grid, .pp-bottom-grid { grid-template-columns: 1fr; } .pp-profile-card { flex-direction: column; text-align: center; } .pp-bottom-content { grid-template-columns: 1fr; } }
        `}</style>

        <div className="pp-breadcrumb">
          <a href="#" onClick={(e) => { e.preventDefault(); onBack() }}>Accueil</a> | <a href="#" onClick={(e) => { e.preventDefault(); onBack() }}>Patients</a> | <span style={{color: 'var(--text-secondary)'}}>{fullName}</span>
        </div>

        <h1 className="pp-title">PROFIL PATIENT</h1>

        {!isProfileComplete() && (
          <div className="pp-warning">
            <div className="pp-warning-header"><Icons.Warning /><span className="pp-warning-title">Attention</span></div>
            <div className="pp-warning-text">Le dossier du patient est incomplet. Pour créer une visite, le patient doit compléter son profil. <span className="pp-warning-link" onClick={() => setCurrentView('edit')}>Cliquez ici pour compléter.</span></div>
          </div>
        )}

        <div className="pp-top-grid">
          <div className="pp-card pp-profile-card">
            <div className="pp-avatar"><Icons.User /></div>
            <span className={`pp-status ${patient.is_active !== false ? 'pp-status-active' : 'pp-status-inactive'}`}>{patient.is_active !== false ? 'ACTIF' : 'INACTIF'}</span>
            <div className="pp-name">{fullName}</div>
            <div className="pp-email">{m.contact?.email || patient.email || '-'}</div>
            <button className="pp-btn pp-btn-primary" onClick={() => onViewVisits ? onViewVisits() : setCurrentView('visits')}><Icons.Clipboard /> Voir les visites</button>
            <button className="pp-btn pp-btn-secondary" onClick={() => setCurrentView('edit')}><Icons.Edit /> Modifier le profil</button>
          </div>

          <div className="pp-card">
            <h3 className="pp-section-title">Détails personnels</h3>
            <div className="pp-info-row"><div className="pp-info-label">Nom complet</div><div className="pp-info-value">{fullName}</div></div>
            <div className="pp-info-row"><div className="pp-info-label">Sexe à la naissance</div><div className="pp-info-value">{m.sexAtBirth || '-'}</div></div>
            <div className="pp-info-row"><div className="pp-info-label">Identité de genre</div><div className="pp-info-value">{m.genderIdentity || '-'}</div></div>
            <div className="pp-info-row"><div className="pp-info-label">Date de naissance</div><div className="pp-info-value">{formatDate(patient.birthdate || m.birthday)}</div></div>
            <div className="pp-info-row"><div className="pp-info-label">Ethnicité</div><div className="pp-info-value">{m.ethnicity || '-'}</div></div>
          </div>

          <div className="pp-right-col">
            <div className="pp-card">
              <h3 className="pp-section-title">Coordonnées</h3>
              <div className="pp-info-row"><div className="pp-info-label">Courriel</div><div className="pp-info-value">{m.contact?.email || patient.email || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Téléphone cellulaire</div><div className="pp-info-value">{m.contact?.cellPhone || patient.phone || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Téléphone maison</div><div className="pp-info-value">{m.contact?.homePhone || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Téléphone travail</div><div className="pp-info-value">{m.contact?.workPhone || '-'}</div></div>
            </div>

            <div className="pp-card">
              <h3 className="pp-section-title">Adresse</h3>
              <div className="pp-info-value">{m.contact?.address || '-'}</div>
              <div className="pp-info-value">{m.contact?.city || '-'}{m.contact?.province ? `, ${m.contact.province}` : ''}</div>
              <div className="pp-info-value">{m.contact?.postalCode || '-'}</div>
              <div className="pp-info-value">{m.contact?.country || 'Canada'}</div>
            </div>

            <div className="pp-card">
              <h3 className="pp-section-title">Consentements</h3>
              <div className="pp-consent-item">
                <span className="pp-consent-dot" style={{background: m.consents?.botox ? 'var(--success)' : 'var(--text-muted)'}}></span>
                <span className="pp-consent-label">Consentement Botox :</span>
                <span className="pp-consent-status">{m.consents?.botox ? 'Accepté' : 'En attente'}</span>
              </div>
              <div className="pp-consent-item">
                <span className="pp-consent-dot" style={{background: m.consents?.photo ? 'var(--success)' : 'var(--text-muted)'}}></span>
                <span className="pp-consent-label">Consentement Photo :</span>
                <span className="pp-consent-status">{m.consents?.photo ? 'Accepté' : 'En attente'}</span>
              </div>
              <span className="pp-update-link" onClick={() => setCurrentView('edit')}>Mettre à jour / Ajouter</span>
            </div>
          </div>
        </div>

        <div className="pp-bottom-grid">
          <div className="pp-card">
            <div className="pp-tabs-row">
              <span className="pp-tab-active">Historique médical</span>
              <span className="pp-tab">Conditions</span>
            </div>
            <div className="pp-bottom-content">
              <div className="pp-info-row"><div className="pp-info-label">Poids</div><div className="pp-info-value">{m.medicalHistory?.weight || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Taille</div><div className="pp-info-value">{m.medicalHistory?.height || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Médecin de famille</div><div className="pp-info-value">{m.medicalHistory?.familyDoctor || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Fumeur</div><div className="pp-info-value">{m.medicalHistory?.smoker || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Traitement spécialiste</div><div className="pp-info-value">{m.medicalHistory?.specialistTreatment || '-'}</div></div>
            </div>
          </div>

          <div className="pp-card">
            <div className="pp-tabs-row">
              <span className="pp-tab-active">Historique peau</span>
              <span className="pp-tab">Soleil</span>
              <span className="pp-tab">Intérêts</span>
            </div>
            <div className="pp-bottom-content">
              <div className="pp-info-row"><div className="pp-info-label">Produits de peau</div><div className="pp-info-value">{m.skinHistory?.products || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Sensibilités cutanées</div><div className="pp-info-value">{m.skinHistory?.sensitivities || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Utilisation Vitamine A</div><div className="pp-info-value">{m.skinHistory?.vitaminA || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Utilisation Accutane</div><div className="pp-info-value">{m.skinHistory?.accutane || '-'}</div></div>
              <div className="pp-info-row"><div className="pp-info-label">Peelings chimiques</div><div className="pp-info-value">{m.skinHistory?.chemicalPeels || '-'}</div></div>
            </div>
          </div>
        </div>

        {showPhotoGallery && <PhotoGallery visit={showPhotoGallery} patient={patient} allVisits={visits} onClose={() => { setShowPhotoGallery(null); fetchVisits() }} onRefresh={fetchVisits} />}
      </div>
    )
  }

  // ==================== VISITS VIEW ====================
  if (currentView === 'visits') {
    return (
      <div className="patient-profile-container">
        <style>{`
          .patient-profile-container { background: var(--bg-main); min-height: 100%; padding: 1.5rem; color: var(--text-primary); }
          .pv-back-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 0.9rem; margin-bottom: 1.5rem; }
          .pv-back-btn:hover { border-color: var(--primary); color: var(--primary); }
          .pv-header { background: var(--bg-card); border-radius: 12px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border); }
          .pv-header-left { display: flex; align-items: center; gap: 1.5rem; }
          .pv-avatar { width: 60px; height: 60px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 600; }
          .pv-header-name { font-size: 1.5rem; font-weight: 600; }
          .pv-header-meta { font-size: 0.9rem; color: var(--text-muted); }
          .pv-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
          .pv-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: transparent; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 0.9rem; color: var(--text-secondary); }
          .pv-tab:hover { border-color: var(--primary); color: var(--primary); }
          .pv-tab-active { background: var(--primary); color: white; border-color: var(--primary); }
          .pv-content { background: var(--bg-card); border-radius: 12px; padding: 1.5rem; min-height: 400px; border: 1px solid var(--border); }
          .pv-content-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
          .pv-visit-card { background: var(--bg-sidebar); border-radius: 10px; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border); }
          .pv-visit-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
          .pv-visit-date { font-size: 1rem; font-weight: 600; }
          .pv-visit-type { font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 20px; background: var(--primary-bg); color: var(--primary); font-weight: 500; }
          .pv-visit-info { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; }
          .pv-visit-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
          .pv-action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; }
          .pv-action-btn:hover { border-color: var(--primary); color: var(--primary); }
          .pv-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; text-align: center; }
          .pv-empty-icon { color: var(--text-muted); margin-bottom: 1rem; opacity: 0.5; }
          .pv-empty-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
          .pv-empty-subtitle { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; }
          .pv-btn-primary { padding: 0.75rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
          .pv-btn-primary:hover { background: var(--primary-dark); }
          .pv-docs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
          .pv-docs-actions { display: flex; gap: 0.75rem; align-items: center; }
          .pv-select { padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-primary); font-size: 0.9rem; }
          .pv-doc-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-sidebar); border-radius: 10px; margin-bottom: 0.5rem; border: 1px solid var(--border); }
          .pv-doc-info { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); }
          .pv-doc-name { font-weight: 500; color: var(--text-primary); }
          .pv-doc-meta { font-size: 0.8rem; color: var(--text-muted); }
          .pv-doc-actions { display: flex; gap: 0.5rem; }
          .pv-view-btn { padding: 0.4rem 0.75rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); text-decoration: none; }
          .pv-view-btn:hover { border-color: var(--primary); color: var(--primary); }
          .pv-delete-btn { padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--danger); cursor: pointer; display: flex; align-items: center; justify-content: center; }
          .pv-delete-btn:hover { background: var(--danger-bg); border-color: var(--danger); }
        `}</style>

        <button className="pv-back-btn" onClick={() => setCurrentView('profile')}><Icons.ArrowLeft /> Retour</button>

        <div className="pv-header">
          <div className="pv-header-left">
            <div className="pv-avatar">{getInitials()}</div>
            <div>
              <div className="pv-header-name">{fullName}</div>
              <div className="pv-header-meta">{visits.length} visite(s)</div>
            </div>
          </div>
          <button className="pv-btn-primary" onClick={() => setShowVisitModal(true)}><Icons.Plus /> Nouvelle visite</button>
        </div>

        <VisitsContent 
          visits={visits} loading={loading} documents={documents} m={m}
          formatDate={formatDate} setShowPhotoGallery={setShowPhotoGallery} setShowVisitModal={setShowVisitModal}
          docType={docType} setDocType={setDocType} fileInputRef={fileInputRef}
          uploadingDoc={uploadingDoc} handleFileUpload={handleFileUpload} handleDeleteDocument={handleDeleteDocument}
        />

        {showVisitModal && (
          <div className="modal-overlay" onClick={() => setShowVisitModal(false)}>
            <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Nouvelle visite</h2>
                <button className="modal-close" onClick={() => setShowVisitModal(false)}><Icons.X /></button>
              </div>
              <form onSubmit={handleAddVisit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Type de visite</label>
                    <select className="form-select" value={form.visit_type} onChange={(e) => setForm({ ...form, visit_type: e.target.value })}>
                      {VISIT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Zones traitées</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      {TREATMENT_ZONES.map(zone => (
                        <div key={zone.id} onClick={() => toggleTreatment(zone)} style={{ padding: '1rem', border: `1px solid ${treatments[zone.id] ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '10px', cursor: 'pointer', background: treatments[zone.id] ? 'var(--primary-bg)' : 'var(--bg-card)' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-primary)' }}>{zone.label}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{zone.defaultUnits} unités</div>
                          {treatments[zone.id] && <input type="number" style={{ marginTop: '0.5rem', width: '100%', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.85rem' }} value={treatments[zone.id].units} onChange={(e) => setTreatments(prev => ({ ...prev, [zone.id]: { ...prev[zone.id], units: parseInt(e.target.value) || 0 } }))} onClick={e => e.stopPropagation()} />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observations, recommandations..." />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowVisitModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPhotoGallery && <PhotoGallery visit={showPhotoGallery} patient={patient} allVisits={visits} onClose={() => { setShowPhotoGallery(null); fetchVisits() }} onRefresh={fetchVisits} />}
      </div>
    )
  }

  // ==================== EDIT VIEW ====================
  if (currentView === 'edit') {
    return <PatientEdit patient={patient} onBack={() => setCurrentView('profile')} onSave={() => { onRefresh && onRefresh(); setCurrentView('profile') }} session={session} />
  }

  return null
}

// Sub-component for visits content with tabs
function VisitsContent({ visits, loading, documents, m, formatDate, setShowPhotoGallery, setShowVisitModal, docType, setDocType, fileInputRef, uploadingDoc, handleFileUpload, handleDeleteDocument }) {
  const [activeTab, setActiveTab] = useState('visits')
  
  return (
    <>
      <div className="pv-tabs">
        <button className={`pv-tab ${activeTab === 'visits' ? 'pv-tab-active' : ''}`} onClick={() => setActiveTab('visits')}><Icons.Clipboard /> Visites</button>
        <button className={`pv-tab ${activeTab === 'medical' ? 'pv-tab-active' : ''}`} onClick={() => setActiveTab('medical')}><Icons.Heart /> Dossier médical</button>
        <button className={`pv-tab ${activeTab === 'documents' ? 'pv-tab-active' : ''}`} onClick={() => setActiveTab('documents')}><Icons.Document /> Documents ({documents.length})</button>
      </div>

      <div className="pv-content">
        {activeTab === 'visits' && (
          <div>
            <h3 className="pv-content-title">Historique des visites</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chargement...</div>
            ) : visits.length > 0 ? (
              visits.map(visit => (
                <div key={visit.id} className="pv-visit-card">
                  <div className="pv-visit-header">
                    <div className="pv-visit-date">{formatDate(visit.visit_date)}</div>
                    <span className="pv-visit-type">{VISIT_TYPES.find(t => t.id === visit.visit_type)?.label || visit.visit_type}</span>
                  </div>
                  <div className="pv-visit-info">Praticien: {visit.practitioner_name || 'Non spécifié'}</div>
                  {visit.total_units > 0 && <div className="pv-visit-info">Total: {visit.total_units} unités</div>}
                  {visit.notes && <div className="pv-visit-info" style={{ fontStyle: 'italic' }}>"{visit.notes}"</div>}
                  <div className="pv-visit-actions">
                    <button className="pv-action-btn" onClick={() => setShowPhotoGallery(visit)}><Icons.Camera /> Photos ({visit.photos?.length || 0})</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="pv-empty">
                <div className="pv-empty-icon"><Icons.CalendarEmpty /></div>
                <div className="pv-empty-title">Aucune visite</div>
                <div className="pv-empty-subtitle">Ajoutez la première consultation</div>
                <button className="pv-btn-primary" onClick={() => setShowVisitModal(true)}><Icons.Plus /> Ajouter une visite</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medical' && (
          <div>
            <h3 className="pv-content-title">Dossier médical</h3>
            <p style={{ color: 'var(--text-muted)' }}>Les informations médicales du patient sont stockées dans les métadonnées du profil.</p>
            {m.medicalConditions && m.medicalConditions.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Conditions médicales:</strong>
                <ul style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{m.medicalConditions.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="pv-docs-header">
              <h3 className="pv-content-title" style={{ margin: 0 }}>Documents</h3>
              <div className="pv-docs-actions">
                <select className="pv-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  {DOCUMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                <button className="pv-btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc}>
                  <Icons.Upload /> {uploadingDoc ? 'Upload...' : 'Ajouter'}
                </button>
              </div>
            </div>
            {documents.length > 0 ? (
              documents.map(doc => (
                <div key={doc.id} className="pv-doc-row">
                  <div className="pv-doc-info">
                    <Icons.Document />
                    <div>
                      <div className="pv-doc-name">{doc.file_name}</div>
                      <div className="pv-doc-meta">{DOCUMENT_TYPES.find(t => t.id === doc.document_type)?.label} • {formatDate(doc.uploaded_at)}</div>
                    </div>
                  </div>
                  <div className="pv-doc-actions">
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="pv-view-btn">Voir</a>
                    <button className="pv-delete-btn" onClick={() => handleDeleteDocument(doc)}><Icons.Trash /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="pv-empty">
                <div className="pv-empty-icon"><Icons.Document /></div>
                <div className="pv-empty-title">Aucun document</div>
                <div className="pv-empty-subtitle">Ajoutez des consentements, formulaires, etc.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
