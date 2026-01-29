import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  User: () => <svg fill="currentColor" viewBox="0 0 24 24" width="60" height="60"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Upload: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Eye: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Dollar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
}

// Photo positions based on Facetec - FRANÇAIS
const PHOTO_POSITIONS = [
  // Rangée 1 - Portraits détendus
  { id: 1, orientation: 'portrait', label: '#1 Visage frontal', state: 'Détendu' },
  { id: 2, orientation: 'portrait', label: '#2 Profil droit', state: 'Détendu' },
  { id: 3, orientation: 'portrait', label: '#3 Profil gauche', state: 'Détendu' },
  { id: 4, orientation: 'portrait', label: '#4 45 degrés droite', state: 'Détendu' },
  { id: 5, orientation: 'portrait', label: '#5 45 degrés gauche', state: 'Détendu' },
  // Rangée 2 - Portraits actifs
  { id: 6, orientation: 'portrait', label: '#6 Visage frontal', state: 'Actif' },
  { id: 7, orientation: 'portrait', label: '#7 Profil droit', state: 'Actif' },
  { id: 8, orientation: 'portrait', label: '#8 Profil gauche', state: 'Actif' },
  { id: 9, orientation: 'portrait', label: '#9 45 degrés droite', state: 'Actif' },
  { id: 10, orientation: 'portrait', label: '#10 45 degrés gauche', state: 'Actif' },
  // Rangée 3 - Gros plans détendus
  { id: 11, orientation: 'portrait', label: '#11 Gros plan visage', state: 'Détendu' },
  { id: 12, orientation: 'portrait', label: '#12 45 degrés droite', state: 'Détendu' },
  { id: 13, orientation: 'portrait', label: '#13 45 degrés gauche', state: 'Détendu' },
  // Rangée 4 - Gros plans actifs
  { id: 14, orientation: 'portrait', label: '#14 Gros plan visage', state: 'Actif' },
  { id: 15, orientation: 'portrait', label: '#15 45 degrés droite', state: 'Actif' },
  { id: 16, orientation: 'portrait', label: '#16 45 degrés gauche', state: 'Actif' },
  // Rangée 5 - Paysages détendus
  { id: 17, orientation: 'landscape', label: '#17 Haut du visage (Frontalis)', state: 'Détendu' },
  { id: 18, orientation: 'landscape', label: '#18 Haut du visage (Glabelle)', state: 'Détendu' },
  { id: 19, orientation: 'landscape', label: '#19 Haut du visage droite', state: 'Détendu' },
  { id: 20, orientation: 'landscape', label: '#20 Haut du visage gauche', state: 'Détendu' },
  // Rangée 6 - Paysages actifs
  { id: 21, orientation: 'landscape', label: '#21 Haut du visage (Frontalis)', state: 'Actif' },
  { id: 22, orientation: 'landscape', label: '#22 Haut du visage (Glabelle)', state: 'Actif' },
  { id: 23, orientation: 'landscape', label: '#23 Haut du visage droite', state: 'Actif' },
  { id: 24, orientation: 'landscape', label: '#24 Haut du visage gauche', state: 'Actif' },
  // Rangée 7 - Milieu/Bas du visage
  { id: 25, orientation: 'landscape', label: '#25 Milieu du visage frontal', state: 'Détendu' },
  { id: 26, orientation: 'landscape', label: '#26 Bas du visage', state: 'Détendu' },
  // Rangée 8 - Milieu/Bas actif
  { id: 27, orientation: 'landscape', label: '#27 Milieu du visage frontal', state: 'Actif' },
  { id: 28, orientation: 'landscape', label: '#28 Bas du visage frontal', state: 'Actif' },
  { id: 29, orientation: 'landscape', label: '#29 Dents haut et bas frontal', state: 'Actif' },
]

// Types de traitements - FRANÇAIS
const TREATMENT_TYPES = [
  { id: 'botox_cosmetic', label: 'Toxine botulique cosmétique', products: ['Botox', 'Botox Cosmetic', 'Dysport', 'Xeomin'] },
  { id: 'botox_therapeutic', label: 'Toxine botulique thérapeutique', products: ['Botox'] },
  { id: 'dermal_fillers', label: 'Agents de comblement', products: ['Belotero', 'Emervel', 'Juvederm Ultra', 'Juvederm Ultra Plus', 'Perlane', 'Restylane', 'Revanesse', 'Sculptra', 'Teosal'] },
  { id: 'lasers', label: 'Lasers', products: [] },
  { id: 'microneedling', label: 'Microneedling/Soins', products: ['Générique'] },
  { id: 'peels', label: 'Peelings', products: [] },
]

// Zones d'injection pour Botox - FRANÇAIS
const INJECTION_AREAS = [
  { id: 'frontalis', label: 'Frontalis', defaultUnits: 20 },
  { id: 'glabella', label: 'Glabelle', defaultUnits: 20 },
  { id: 'crows_feet_left', label: 'Pattes d\'oie gauche', defaultUnits: 12 },
  { id: 'crows_feet_right', label: 'Pattes d\'oie droite', defaultUnits: 12 },
  { id: 'bunny_lines', label: 'Rides du lapin', defaultUnits: 8 },
  { id: 'lip_flip', label: 'Lip flip', defaultUnits: 4 },
  { id: 'dao', label: 'DAO', defaultUnits: 8 },
  { id: 'mentalis', label: 'Mentalis', defaultUnits: 6 },
  { id: 'masseter_left', label: 'Masséter gauche', defaultUnits: 25 },
  { id: 'masseter_right', label: 'Masséter droit', defaultUnits: 25 },
  { id: 'platysma', label: 'Platysma', defaultUnits: 30 },
]

// Zones pour agents de comblement - FRANÇAIS
const FILLER_AREAS = [
  { id: 'cheeks', label: 'Joues' },
  { id: 'lips', label: 'Lèvres' },
  { id: 'nasolabial', label: 'Sillons nasogéniens' },
  { id: 'marionette', label: 'Plis d\'amertume' },
  { id: 'chin', label: 'Menton' },
  { id: 'nose', label: 'Nez' },
  { id: 'temples', label: 'Tempes' },
  { id: 'jawline', label: 'Ligne de la mâchoire' },
  { id: 'under_eyes', label: 'Cernes' },
  { id: 'other', label: 'Autre' },
]

export default function VisitDetail({ patient, visit, onBack, onRefresh, session }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [practitioners, setPractitioners] = useState([])
  const [photos, setPhotos] = useState({})
  const [markedPhotos, setMarkedPhotos] = useState([])
  const [documents, setDocuments] = useState([])
  const [treatments, setTreatments] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Form state
  const [form, setForm] = useState({
    visit_date: visit?.visit_date ? new Date(visit.visit_date).toLocaleDateString('fr-CA') : new Date().toLocaleDateString('fr-CA'),
    visit_time: visit?.visit_date ? new Date(visit.visit_date).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
    practitioner_id: visit?.user_id || session.user.id,
    notes: visit?.notes || ''
  })

  // New treatment form
  const [newTreatment, setNewTreatment] = useState({
    treatment_type: '',
    product: '',
    lot: '',
    expiry_month: '',
    expiry_year: '',
    areas: {},
    details: ''
  })

  const photoInputRefs = useRef({})
  const cameraInputRefs = useRef({})
  const markedPhotoInputRef = useRef(null)
  const markedCameraInputRef = useRef(null)
  const documentInputRef = useRef(null)

  useEffect(() => {
    // Détecter si on est sur mobile
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
    
    fetchPractitioners()
    if (visit?.id) {
      fetchVisitData()
    }
  }, [visit?.id])

  const fetchPractitioners = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
    setPractitioners(data || [])
  }

  const fetchVisitData = async () => {
    setLoading(true)
    
    // Récupérer les traitements
    const { data: treatmentsData } = await supabase
      .from('treatments')
      .select('*')
      .eq('visit_id', visit.id)
    setTreatments(treatmentsData || [])

    // Récupérer les photos
    const { data: photosData } = await supabase
      .from('photos')
      .select('*')
      .eq('visit_id', visit.id)
    
    // Organiser les photos par position
    const photosByPosition = {}
    const marked = []
    photosData?.forEach(p => {
      if (p.photo_category === 'marked') {
        marked.push(p)
      } else if (p.photo_number) {
        photosByPosition[p.photo_number] = p
      }
    })
    setPhotos(photosByPosition)
    setMarkedPhotos(marked)

    // Récupérer les documents
    const { data: docsData } = await supabase
      .from('documents')
      .select('*')
      .eq('visit_id', visit.id)
    setDocuments(docsData || [])

    setLoading(false)
  }

  const getPatientName = () => {
    if (patient.metadata?.firstName && patient.metadata?.lastName) {
      return `${patient.metadata.firstName} ${patient.metadata.lastName}`.toLowerCase()
    }
    return patient.name?.toLowerCase() || 'Patient'
  }

  const handleSaveAll = async () => {
    setSaving(true)
    
    // Parser la date et l'heure
    const dateTime = new Date(`${form.visit_date} ${form.visit_time}`)
    
    const { error } = await supabase
      .from('visits')
      .update({
        visit_date: dateTime.toISOString(),
        user_id: form.practitioner_id,
        notes: form.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', visit.id)

    if (error) {
      alert('Erreur lors de la sauvegarde: ' + error.message)
    } else {
      onRefresh && onRefresh()
    }
    
    setSaving(false)
  }

  const handleDeleteVisit = async () => {
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visit.id)

    if (!error) {
      onBack()
    } else {
      alert('Erreur lors de la suppression: ' + error.message)
    }
  }

  const handlePhotoUpload = async (positionId, file) => {
    if (!file) return
    
    setUploadError(null)

    // Téléverser vers Supabase Storage (bucket: patient-photos)
    const fileExt = file.name.split('.').pop()
    const fileName = `${visit.id}/${positionId}_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('patient-photos')
      .upload(fileName, file)

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
        setUploadError('Le bucket "patient-photos" n\'existe pas dans Supabase Storage.')
        alert('Erreur: Bucket non trouvé.')
      } else {
        alert('Erreur lors du téléversement: ' + uploadError.message)
      }
      return
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('patient-photos')
      .getPublicUrl(fileName)

    // Sauvegarder dans la base de données
    const { data, error } = await supabase
      .from('photos')
      .insert([{
        visit_id: visit.id,
        patient_id: patient.id,
        photo_url: publicUrl,
        storage_path: fileName,
        photo_number: positionId,
        photo_category: PHOTO_POSITIONS.find(p => p.id === positionId)?.state || 'Détendu',
        photo_label: PHOTO_POSITIONS.find(p => p.id === positionId)?.label || ''
      }])
      .select()
      .single()

    if (!error && data) {
      setPhotos(prev => ({ ...prev, [positionId]: data }))
    } else if (error) {
      console.error('Erreur insertion photo:', error)
      alert('Erreur lors de l\'enregistrement: ' + error.message)
    }
  }

  const handleMarkedPhotoUpload = async (file) => {
    if (!file) return

    setUploadError(null)

    const fileExt = file.name.split('.').pop()
    const fileName = `${visit.id}/marked_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('patient-photos')
      .upload(fileName, file)

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
        alert('Erreur: Bucket non trouvé.')
      } else {
        alert('Erreur lors du téléversement: ' + uploadError.message)
      }
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('patient-photos')
      .getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('photos')
      .insert([{
        visit_id: visit.id,
        patient_id: patient.id,
        photo_url: publicUrl,
        storage_path: fileName,
        photo_number: 0,
        photo_category: 'marked',
        photo_label: 'Photo marquée'
      }])
      .select()
      .single()

    if (!error && data) {
      setMarkedPhotos(prev => [...prev, data])
    } else if (error) {
      console.error('Erreur insertion photo marquée:', error)
      alert('Erreur lors de l\'enregistrement: ' + error.message)
    }
  }

  const handleDocumentUpload = async (file) => {
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${visit.id}/doc_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('patient-photos')
      .upload(fileName, file)

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
        alert('Erreur: Bucket non trouvé.')
      } else {
        alert('Erreur lors du téléversement: ' + uploadError.message)
      }
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('patient-photos')
      .getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('documents')
      .insert([{
        visit_id: visit.id,
        patient_id: patient.id,
        name: file.name,
        url: publicUrl,
        type: fileExt
      }])
      .select()
      .single()

    if (!error && data) {
      setDocuments(prev => [...prev, data])
    }
  }

  const handleAddTreatment = async () => {
    if (!newTreatment.treatment_type || !newTreatment.product) {
      alert('Veuillez sélectionner un type de traitement et un produit')
      return
    }

    const { data, error } = await supabase
      .from('treatments')
      .insert([{
        visit_id: visit.id,
        patient_id: patient.id,
        treatment_type: newTreatment.treatment_type,
        product: newTreatment.product,
        lot: newTreatment.lot,
        expiry: newTreatment.expiry_month && newTreatment.expiry_year 
          ? `${newTreatment.expiry_month} ${newTreatment.expiry_year}` 
          : null,
        areas: newTreatment.areas,
        details: newTreatment.details
      }])
      .select()
      .single()

    if (!error && data) {
      setTreatments(prev => [...prev, data])
      setShowAddTreatmentModal(false)
      setNewTreatment({
        treatment_type: '',
        product: '',
        lot: '',
        expiry_month: '',
        expiry_year: '',
        areas: {},
        details: ''
      })
    } else if (error) {
      alert('Erreur lors de l\'ajout: ' + error.message)
    }
  }

  const handleDeleteTreatment = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce traitement?')) return
    
    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', id)

    if (!error) {
      setTreatments(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleDeletePhoto = async (photoId, position) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo?')) return
    
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)

    if (!error) {
      if (position) {
        setPhotos(prev => {
          const newPhotos = { ...prev }
          delete newPhotos[position]
          return newPhotos
        })
      } else {
        setMarkedPhotos(prev => prev.filter(p => p.id !== photoId))
      }
    }
  }

  const getTotalCost = () => {
    return treatments.reduce((sum, t) => {
      const unitCost = t.treatment_type?.includes('botox') ? 12 : 850
      if (t.areas) {
        return sum + Object.values(t.areas).reduce((aSum, a) => aSum + ((parseFloat(a.units) || 0) * unitCost), 0)
      }
      return sum
    }, 0)
  }

  // Styles - THÈME SOMBRE
  const styles = {
    container: {
      background: 'var(--bg-main)',
      minHeight: '100vh',
      padding: '0',
      color: 'var(--text-primary)'
    },
    breadcrumb: {
      fontSize: '0.85rem',
      color: 'var(--text-muted)',
      marginBottom: '0.5rem'
    },
    breadcrumbLink: {
      color: 'var(--text-secondary)',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '1.5rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 2fr',
      gap: '1rem',
      marginBottom: '1rem'
    },
    card: {
      background: 'var(--bg-card)',
      borderRadius: '8px',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)'
    },
    cardBody: {
      padding: '1.5rem'
    },
    cardTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '1rem'
    },
    profileCard: {
      textAlign: 'center'
    },
    avatar: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'var(--bg-input)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      color: 'var(--text-muted)',
      border: '1px solid var(--border)'
    },
    patientName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '0.25rem',
      color: 'var(--text-primary)'
    },
    btn: {
      display: 'block',
      width: '100%',
      padding: '0.6rem 1rem',
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      marginBottom: '0.5rem',
      textAlign: 'center'
    },
    btnPrimary: {
      background: 'var(--primary)',
      color: 'white'
    },
    btnDanger: {
      background: 'var(--danger)',
      color: 'white'
    },
    btnSecondary: {
      background: 'var(--border)',
      color: 'var(--text-secondary)'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      fontSize: '0.85rem',
      fontWeight: '500',
      color: 'var(--text-secondary)',
      marginBottom: '0.25rem'
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid var(--border)',
      fontSize: '0.9rem',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)'
    },
    select: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid var(--border)',
      fontSize: '0.9rem',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)'
    },
    textarea: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid var(--border)',
      fontSize: '0.9rem',
      minHeight: '150px',
      resize: 'vertical',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)'
    },
    // Treatment Record
    treatmentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    treatmentBtnGroup: {
      display: 'flex',
      gap: '0.5rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '1rem'
    },
    th: {
      padding: '0.75rem',
      textAlign: 'left',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'var(--text-secondary)',
      borderBottom: '2px solid var(--border)',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '0.75rem',
      fontSize: '0.9rem',
      color: 'var(--text-primary)',
      borderBottom: '1px solid var(--border)'
    },
    emptyRow: {
      textAlign: 'center',
      padding: '2rem',
      color: 'var(--text-muted)'
    },
    totalsBox: {
      background: 'var(--bg-input)',
      padding: '1rem',
      borderRadius: '6px',
      display: 'inline-block',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)'
    },
    saveAllBtn: {
      float: 'right',
      padding: '0.6rem 1.5rem',
      background: 'var(--primary)',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer'
    },
    // Photo Grid
    photoSection: {
      marginTop: '1rem'
    },
    photoRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1rem'
    },
    photoSlot: {
      width: '120px',
      textAlign: 'center'
    },
    photoSlotLandscape: {
      width: '160px'
    },
    photoBox: {
      width: '100%',
      aspectRatio: '3/4',
      border: '2px dashed var(--border)',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-input)'
    },
    photoBoxLandscape: {
      aspectRatio: '4/3'
    },
    photoLabel: {
      fontSize: '0.7rem',
      color: 'var(--text-secondary)',
      marginTop: '0.25rem'
    },
    photoState: {
      fontStyle: 'italic',
      display: 'block',
      color: 'var(--primary)'
    },
    uploadArea: {
      border: '2px dashed var(--border)',
      borderRadius: '8px',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      background: 'var(--bg-input)',
      marginBottom: '1rem'
    },
    uploadButtons: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      justifyContent: 'center'
    },
    uploadBtn: {
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: '1px solid var(--border)',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.85rem'
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'var(--bg-card)',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      border: '1px solid var(--border)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid var(--border)'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0,
      color: 'var(--text-primary)'
    },
    modalClose: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      color: 'var(--text-secondary)'
    },
    modalBody: {
      padding: '1.5rem'
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      padding: '1rem 1.5rem',
      borderTop: '1px solid var(--border)'
    },
    errorMessage: {
      background: 'var(--danger-bg)',
      color: 'var(--danger)',
      padding: '1rem',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontSize: '0.9rem'
    },
    copyright: {
      textAlign: 'right',
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
      marginTop: '2rem',
      padding: '1rem 0'
    }
  }

  // Render photo rows
  const renderPhotoRows = () => {
    const rows = []
    let currentRow = []
    let currentRowId = 0
    
    PHOTO_POSITIONS.forEach((pos, idx) => {
      // Break into rows based on position IDs
      if ([6, 11, 14, 17, 21, 25, 27].includes(pos.id)) {
        if (currentRow.length > 0) {
          rows.push({ id: currentRowId++, photos: currentRow })
        }
        currentRow = []
      }
      currentRow.push(pos)
    })
    if (currentRow.length > 0) {
      rows.push({ id: currentRowId++, photos: currentRow })
    }

    return rows.map(row => (
      <div key={row.id} style={styles.photoRow}>
        {row.photos.map(pos => {
          const photo = photos[pos.id]
          const isLandscape = pos.orientation === 'landscape'
          
          return (
            <div 
              key={pos.id} 
              style={{ 
                ...styles.photoSlot, 
                ...(isLandscape ? styles.photoSlotLandscape : {}) 
              }}
            >
              <div 
                style={{ 
                  ...styles.photoBox, 
                  ...(isLandscape ? styles.photoBoxLandscape : {}),
                  backgroundImage: photo ? `url(${photo.photo_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  border: photo ? 'none' : '2px dashed var(--border)',
                  position: 'relative'
                }}
              >
                {!photo && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    height: '100%'
                  }}>
                    {/* Bouton Caméra */}
                    <button
                      onClick={() => cameraInputRefs.current[pos.id]?.click()}
                      style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Photo
                    </button>
                    {/* Bouton Galerie */}
                    <button
                      onClick={() => photoInputRefs.current[pos.id]?.click()}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem'
                      }}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Galerie
                    </button>
                  </div>
                )}
                {photo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePhoto(photo.id, pos.id)
                    }}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icons.X />
                  </button>
                )}
              </div>
              {/* Input pour fichier (galerie) */}
              <input
                ref={el => photoInputRefs.current[pos.id] = el}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => { handlePhotoUpload(pos.id, e.target.files[0]); e.target.value = ''; }}
              />
              {/* Input pour caméra iPhone/mobile */}
              <input
                ref={el => cameraInputRefs.current[pos.id] = el}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => { handlePhotoUpload(pos.id, e.target.files[0]); e.target.value = ''; }}
              />
              <div style={styles.photoLabel}>
                <span style={styles.photoState}>{pos.state}</span>
                <strong>{pos.label.split(' ')[0]}</strong> {pos.label.split(' ').slice(1).join(' ')}
              </div>
            </div>
          )
        })}
      </div>
    ))
  }

  return (
    <div style={styles.container}>
      {/* Fil d'Ariane */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadcrumbLink} onClick={onBack}>Accueil</span>
        {' | '}
        <span style={styles.breadcrumbLink} onClick={onBack}>{getPatientName()}</span>
        {' | '}
        <span style={styles.breadcrumbLink} onClick={onBack}>Visites</span>
      </div>

      {/* Titre */}
      <h1 style={styles.title}>Visite du patient</h1>

      {/* Message d'erreur */}
      {uploadError && (
        <div style={styles.errorMessage}>
          <strong>Erreur de configuration:</strong> {uploadError}
        </div>
      )}

      {/* Rangée supérieure - Profil, Visite, Notes */}
      <div style={styles.grid}>
        {/* Carte Profil */}
        <div style={styles.card}>
          <div style={{ ...styles.cardBody, ...styles.profileCard }}>
            <div style={styles.avatar}>
              <Icons.User />
            </div>
            <div style={styles.patientName}>{getPatientName()}</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>-</p>
            
            <button 
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={onBack}
            >
              Retour au patient
            </button>
            <button 
              style={{ ...styles.btn, ...styles.btnDanger }}
              onClick={() => setShowDeleteModal(true)}
            >
              Supprimer la visite
            </button>
            <button 
              style={{ ...styles.btn, ...styles.btnSecondary }}
              disabled
              title="Le patient doit avoir plus d'une visite pour comparer les photos"
            >
              Aucune visite à comparer
            </button>
          </div>
        </div>

        {/* Infos Visite */}
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Visite</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                style={styles.input}
                value={form.visit_date}
                onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Heure</label>
              <input
                type="time"
                style={styles.input}
                value={form.visit_time}
                onChange={(e) => setForm({ ...form, visit_time: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Praticien</label>
              <select
                style={styles.select}
                value={form.practitioner_id}
                onChange={(e) => setForm({ ...form, practitioner_id: e.target.value })}
              >
                {practitioners.map(p => (
                  <option key={p.user_id} value={p.user_id}>{p.full_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Notes</h3>
            <textarea
              style={styles.textarea}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ajouter des notes pour cette visite..."
            />
          </div>
        </div>
      </div>

      {/* Section Traitements */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.treatmentHeader}>
            <h3 style={styles.cardTitle}>Dossier de traitement</h3>
            <div style={styles.treatmentBtnGroup}>
              <button 
                style={{ ...styles.btn, ...styles.btnPrimary, width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={() => setShowAddTreatmentModal(true)}
              >
                <Icons.Plus /> Ajouter un traitement
              </button>
            </div>
          </div>

          {/* Tableau Botox */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Toxine botulique
          </h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Produit</th>
                <th style={styles.th}>Lot</th>
                <th style={styles.th}>Expiration</th>
                <th style={styles.th}>Zones</th>
                <th style={styles.th}>Unités</th>
                <th style={styles.th}>Coût</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {treatments.filter(t => t.treatment_type?.includes('botox')).length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.emptyRow}>Aucun traitement enregistré.</td>
                </tr>
              ) : (
                treatments.filter(t => t.treatment_type?.includes('botox')).map(t => {
                  const totalUnits = t.areas ? Object.values(t.areas).reduce((sum, a) => sum + (parseFloat(a.units) || 0), 0) : 0
                  return (
                    <tr key={t.id}>
                      <td style={styles.td}>{TREATMENT_TYPES.find(tt => tt.id === t.treatment_type)?.label || t.treatment_type}</td>
                      <td style={styles.td}>{t.product}</td>
                      <td style={styles.td}>{t.lot || '-'}</td>
                      <td style={styles.td}>{t.expiry || '-'}</td>
                      <td style={styles.td}>
                        {t.areas ? Object.keys(t.areas).map(a => INJECTION_AREAS.find(ia => ia.id === a)?.label || a).join(', ') : '-'}
                      </td>
                      <td style={styles.td}>{totalUnits}</td>
                      <td style={styles.td}>${(totalUnits * 12).toFixed(2)}</td>
                      <td style={styles.td}>
                        <button 
                          onClick={() => setEditingTreatment(t)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)' }}
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          onClick={() => handleDeleteTreatment(t.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                        >
                          <Icons.Trash />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Tableau Agents de comblement */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: '1.5rem 0 0.5rem', color: 'var(--text-primary)' }}>
            Agents de comblement
          </h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Produit</th>
                <th style={styles.th}>Zones</th>
                <th style={styles.th}>Seringues</th>
                <th style={styles.th}>Coût</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {treatments.filter(t => t.treatment_type === 'dermal_fillers').length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.emptyRow}>Aucun traitement enregistré.</td>
                </tr>
              ) : (
                treatments.filter(t => t.treatment_type === 'dermal_fillers').map(t => {
                  const totalSyringes = t.areas ? Object.values(t.areas).reduce((sum, a) => sum + (parseFloat(a.units) || 0), 0) : 0
                  return (
                    <tr key={t.id}>
                      <td style={styles.td}>{TREATMENT_TYPES.find(tt => tt.id === t.treatment_type)?.label}</td>
                      <td style={styles.td}>{t.product}</td>
                      <td style={styles.td}>
                        {t.areas ? Object.keys(t.areas).map(a => FILLER_AREAS.find(fa => fa.id === a)?.label || a).join(', ') : '-'}
                      </td>
                      <td style={styles.td}>{totalSyringes}</td>
                      <td style={styles.td}>${(totalSyringes * 850).toFixed(2)}</td>
                      <td style={styles.td}>
                        <button 
                          onClick={() => setEditingTreatment(t)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)' }}
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          onClick={() => handleDeleteTreatment(t.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                        >
                          <Icons.Trash />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Tableau Autres traitements */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: '1.5rem 0 0.5rem', color: 'var(--text-primary)' }}>
            Autres traitements
          </h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Produit</th>
                <th style={styles.th}>Coût</th>
                <th style={styles.th}>Détails</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {treatments.filter(t => ['lasers', 'microneedling', 'peels'].includes(t.treatment_type)).length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.emptyRow}>Aucun traitement enregistré.</td>
                </tr>
              ) : (
                treatments.filter(t => ['lasers', 'microneedling', 'peels'].includes(t.treatment_type)).map(t => (
                  <tr key={t.id}>
                    <td style={styles.td}>{TREATMENT_TYPES.find(tt => tt.id === t.treatment_type)?.label || t.treatment_type}</td>
                    <td style={styles.td}>{t.product}</td>
                    <td style={styles.td}>$850.00</td>
                    <td style={styles.td}>{t.details || '-'}</td>
                    <td style={styles.td}>$850.00</td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => setEditingTreatment(t)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)' }}
                      >
                        <Icons.Edit />
                      </button>
                      <button 
                        onClick={() => handleDeleteTreatment(t.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                      >
                        <Icons.Trash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totaux */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={styles.totalsBox}>
              <div><strong>Sous-total:</strong> ${getTotalCost().toFixed(2)}</div>
              <div><strong>Total:</strong> ${(getTotalCost() * 1.05).toFixed(2)}</div>
            </div>
            <button 
              style={styles.saveAllBtn}
              onClick={handleSaveAll}
              disabled={saving}
            >
              {saving ? 'Sauvegarde...' : 'Tout sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      {/* Section Photos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', marginTop: '1rem' }}>
        {/* Téléverser Photos */}
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Téléverser des photos</h3>
            <div style={styles.uploadArea}>
              <Icons.Upload />
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                {isMobile ? 'Cliquez pour choisir ou prendre une photo' : 'Cliquez pour téléverser'}
              </p>
              <div style={styles.uploadButtons}>
                <button 
                  style={styles.uploadBtn}
                  onClick={() => document.getElementById('bulkPhotoUpload')?.click()}
                >
                  📁 Fichier
                </button>
                {isMobile && (
                  <button 
                    style={styles.uploadBtn}
                    onClick={() => document.getElementById('bulkCameraUpload')?.click()}
                  >
                    📷 Caméra
                  </button>
                )}
              </div>
            </div>
            <input
              id="bulkPhotoUpload"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                Array.from(e.target.files).forEach((file, idx) => {
                  const emptyPosition = PHOTO_POSITIONS.find(p => !photos[p.id])
                  if (emptyPosition) {
                    handlePhotoUpload(emptyPosition.id, file)
                  }
                })
              }}
            />
            <input
              id="bulkCameraUpload"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  const emptyPosition = PHOTO_POSITIONS.find(p => !photos[p.id])
                  if (emptyPosition) {
                    handlePhotoUpload(emptyPosition.id, file)
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Photos du patient */}
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Photos du patient</h3>
            {renderPhotoRows()}
          </div>
        </div>
      </div>

      {/* Section Photos marquées */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Téléverser des photos</h3>
            <div style={styles.uploadArea}>
              <Icons.Upload />
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                {isMobile ? 'Cliquez pour choisir ou prendre une photo' : 'Cliquez pour téléverser'}
              </p>
              <div style={styles.uploadButtons}>
                <button 
                  style={styles.uploadBtn}
                  onClick={() => markedPhotoInputRef.current?.click()}
                >
                  📁 Fichier
                </button>
                {isMobile && (
                  <button 
                    style={styles.uploadBtn}
                    onClick={() => markedCameraInputRef.current?.click()}
                  >
                    📷 Caméra
                  </button>
                )}
              </div>
            </div>
            <input
              ref={markedPhotoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleMarkedPhotoUpload(e.target.files[0])}
            />
            <input
              ref={markedCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => handleMarkedPhotoUpload(e.target.files[0])}
            />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Photos marquées (Max. 30 photos)</h3>
            {markedPhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <h4>Aucune photo marquée.</h4>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {markedPhotos.map(p => (
                  <div key={p.id} style={{ width: '120px', position: 'relative' }}>
                    <img src={p.photo_url} alt="" style={{ width: '100%', borderRadius: '4px' }} />
                    <button
                      onClick={() => handleDeletePhoto(p.id, null)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icons.X />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Documents */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Téléverser des documents</h3>
            <div 
              style={styles.uploadArea}
              onClick={() => documentInputRef.current?.click()}
            >
              <Icons.Upload />
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Cliquez pour téléverser</p>
            </div>
            <input
              ref={documentInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => handleDocumentUpload(e.target.files[0])}
            />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Documents</h3>
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <h4>Aucun document.</h4>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {documents.map(d => (
                  <a 
                    key={d.id} 
                    href={d.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: 'var(--bg-input)', 
                      borderRadius: '4px',
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      border: '1px solid var(--border)'
                    }}
                  >
                    📄 {d.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Supprimer */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Confirmer la suppression</h2>
              <button style={styles.modalClose} onClick={() => setShowDeleteModal(false)}><Icons.X /></button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ color: 'var(--text-primary)' }}>Êtes-vous sûr de vouloir supprimer cette visite? Cette action est irréversible.</p>
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-input)', cursor: 'pointer', color: 'var(--text-primary)' }}
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', background: 'var(--danger)', color: 'white', cursor: 'pointer' }}
                onClick={handleDeleteVisit}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter Traitement */}
      {showAddTreatmentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddTreatmentModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Ajouter un traitement</h2>
              <button style={styles.modalClose} onClick={() => setShowAddTreatmentModal(false)}><Icons.X /></button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Type de traitement *</label>
                <select
                  style={styles.select}
                  value={newTreatment.treatment_type}
                  onChange={(e) => setNewTreatment({ ...newTreatment, treatment_type: e.target.value, product: '', areas: {} })}
                >
                  <option value="">Sélectionnez un traitement...</option>
                  {TREATMENT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Produit *</label>
                <select
                  style={styles.select}
                  value={newTreatment.product}
                  onChange={(e) => setNewTreatment({ ...newTreatment, product: e.target.value })}
                  disabled={!newTreatment.treatment_type}
                >
                  <option value="">Sélectionnez un produit...</option>
                  {TREATMENT_TYPES.find(t => t.id === newTreatment.treatment_type)?.products.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {['botox_cosmetic', 'botox_therapeutic'].includes(newTreatment.treatment_type) && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Lot</label>
                      <input
                        type="text"
                        style={styles.input}
                        value={newTreatment.lot}
                        onChange={(e) => setNewTreatment({ ...newTreatment, lot: e.target.value })}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Expiration</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                          style={{ ...styles.select, flex: 1 }}
                          value={newTreatment.expiry_month}
                          onChange={(e) => setNewTreatment({ ...newTreatment, expiry_month: e.target.value })}
                        >
                          <option value="">Mois</option>
                          {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          style={{ ...styles.select, flex: 1 }}
                          value={newTreatment.expiry_year}
                          onChange={(e) => setNewTreatment({ ...newTreatment, expiry_year: e.target.value })}
                        >
                          <option value="">Année</option>
                          {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Zones de traitement</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {INJECTION_AREAS.map(area => (
                        <label key={area.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                          <input
                            type="checkbox"
                            checked={!!newTreatment.areas[area.id]}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewTreatment({
                                  ...newTreatment,
                                  areas: { ...newTreatment.areas, [area.id]: { units: area.defaultUnits } }
                                })
                              } else {
                                const { [area.id]: removed, ...rest } = newTreatment.areas
                                setNewTreatment({ ...newTreatment, areas: rest })
                              }
                            }}
                          />
                          {area.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {newTreatment.treatment_type === 'dermal_fillers' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Zones de traitement</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {FILLER_AREAS.map(area => (
                      <label key={area.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        <input
                          type="checkbox"
                          checked={!!newTreatment.areas[area.id]}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTreatment({
                                ...newTreatment,
                                areas: { ...newTreatment.areas, [area.id]: { units: 1 } }
                              })
                            } else {
                              const { [area.id]: removed, ...rest } = newTreatment.areas
                              setNewTreatment({ ...newTreatment, areas: rest })
                            }
                          }}
                        />
                        {area.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {['lasers', 'microneedling', 'peels'].includes(newTreatment.treatment_type) && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Détails du traitement</label>
                  <textarea
                    style={{ ...styles.textarea, minHeight: '100px' }}
                    value={newTreatment.details}
                    onChange={(e) => setNewTreatment({ ...newTreatment, details: e.target.value })}
                    placeholder="ex: appareil et produit(s) utilisés, zones traitées, produits recommandés, etc."
                  />
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-input)', cursor: 'pointer', color: 'var(--text-primary)' }}
                onClick={() => setShowAddTreatmentModal(false)}
              >
                Annuler
              </button>
              <button 
                style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', background: 'var(--primary)', color: 'white', cursor: 'pointer' }}
                onClick={handleAddTreatment}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
