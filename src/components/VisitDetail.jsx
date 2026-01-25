import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  User: () => <svg fill="currentColor" viewBox="0 0 24 24" width="60" height="60"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Upload: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Eye: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Dollar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
}

// Photo positions based on Facetec
const PHOTO_POSITIONS = [
  // Row 1 - Relaxed portraits
  { id: 1, orientation: 'portrait', label: '#1 Full Face Frontal', state: 'Relaxed' },
  { id: 2, orientation: 'portrait', label: '#2 Sagittal Right', state: 'Relaxed' },
  { id: 3, orientation: 'portrait', label: '#3 Sagittal Left', state: 'Relaxed' },
  { id: 4, orientation: 'portrait', label: '#4 45 Degrees Right', state: 'Relaxed' },
  { id: 5, orientation: 'portrait', label: '#5 45 Degrees Left', state: 'Relaxed' },
  // Row 2 - Active portraits
  { id: 6, orientation: 'portrait', label: '#6 Full Face Frontal', state: 'Active' },
  { id: 7, orientation: 'portrait', label: '#7 Sagittal Right', state: 'Active' },
  { id: 8, orientation: 'portrait', label: '#8 Sagittal Left', state: 'Active' },
  { id: 9, orientation: 'portrait', label: '#9 45 Degrees Right', state: 'Active' },
  { id: 10, orientation: 'portrait', label: '#10 45 Degrees Left', state: 'Active' },
  // Row 3 - Relaxed close-ups
  { id: 11, orientation: 'portrait', label: '#11 Close-up Face', state: 'Relaxed' },
  { id: 12, orientation: 'portrait', label: '#12 45 Degrees Right', state: 'Relaxed' },
  { id: 13, orientation: 'portrait', label: '#13 45 Degrees Left', state: 'Relaxed' },
  // Row 4 - Active close-ups
  { id: 14, orientation: 'portrait', label: '#14 Close-up Face', state: 'Active' },
  { id: 15, orientation: 'portrait', label: '#15 45 Degrees Right', state: 'Active' },
  { id: 16, orientation: 'portrait', label: '#16 45 Degrees Left', state: 'Active' },
  // Row 5 - Relaxed landscapes
  { id: 17, orientation: 'landscape', label: '#17 Upper Face (Frontalis)', state: 'Relaxed' },
  { id: 18, orientation: 'landscape', label: '#18 Upper Face (Glabella)', state: 'Relaxed' },
  { id: 19, orientation: 'landscape', label: '#19 Upper Face Right', state: 'Relaxed' },
  { id: 20, orientation: 'landscape', label: '#20 Upper Face Left', state: 'Relaxed' },
  // Row 6 - Active landscapes
  { id: 21, orientation: 'landscape', label: '#21 Upper Face (Frontalis)', state: 'Active' },
  { id: 22, orientation: 'landscape', label: '#22 Upper Face (Glabella)', state: 'Active' },
  { id: 23, orientation: 'landscape', label: '#23 Upper Face Right', state: 'Active' },
  { id: 24, orientation: 'landscape', label: '#24 Upper Face Left', state: 'Active' },
  // Row 7 - Mid/Lower face
  { id: 25, orientation: 'landscape', label: '#25 Mid Face Frontal', state: 'Relaxed' },
  { id: 26, orientation: 'landscape', label: '#26 Lower Face', state: 'Relaxed' },
  // Row 8 - Active mid/lower
  { id: 27, orientation: 'landscape', label: '#27 Mid Face Frontal', state: 'Active' },
  { id: 28, orientation: 'landscape', label: '#28 Lower Face Frontal', state: 'Active' },
  { id: 29, orientation: 'landscape', label: '#29 Upper & Lower Teeth Frontal', state: 'Active' },
]

// Treatment types
const TREATMENT_TYPES = [
  { id: 'botox_cosmetic', label: 'Botulinum Toxin Cosmetic', products: ['Botox', 'Botox Cosmetic', 'Dysport', 'Xeomin'] },
  { id: 'botox_therapeutic', label: 'Botulinum Toxin Therapeutic', products: ['Botox'] },
  { id: 'dermal_fillers', label: 'Dermal Fillers', products: ['Belotero', 'Emervel', 'Juvederm Ultra', 'Juvederm Ultra Plus', 'Perlane', 'Restylane', 'Revanesse', 'Sculptra', 'Teosal'] },
  { id: 'lasers', label: 'Lasers', products: [] },
  { id: 'microneedling', label: 'Microneedling/Facials', products: ['Generic'] },
  { id: 'peels', label: 'Peels', products: [] },
]

// Injection areas for Botox
const INJECTION_AREAS = [
  { id: 'frontalis', label: 'Frontalis', defaultUnits: 20 },
  { id: 'glabella', label: 'Glabella', defaultUnits: 20 },
  { id: 'crows_feet_left', label: "Crow's Feet Left", defaultUnits: 12 },
  { id: 'crows_feet_right', label: "Crow's Feet Right", defaultUnits: 12 },
  { id: 'bunny_lines', label: 'Bunny Lines', defaultUnits: 8 },
  { id: 'lip_flip', label: 'Lip Flip', defaultUnits: 4 },
  { id: 'dao', label: 'DAO', defaultUnits: 8 },
  { id: 'mentalis', label: 'Mentalis', defaultUnits: 6 },
  { id: 'masseter_left', label: 'Masseter Left', defaultUnits: 25 },
  { id: 'masseter_right', label: 'Masseter Right', defaultUnits: 25 },
  { id: 'platysma', label: 'Platysma', defaultUnits: 30 },
]

// Filler areas
const FILLER_AREAS = [
  { id: 'cheeks', label: 'Cheeks' },
  { id: 'lips', label: 'Lips' },
  { id: 'nasolabial', label: 'Nasolabial Folds' },
  { id: 'marionette', label: 'Marionette Lines' },
  { id: 'chin', label: 'Chin' },
  { id: 'nose', label: 'Nose' },
  { id: 'temples', label: 'Temples' },
  { id: 'jawline', label: 'Jawline' },
  { id: 'under_eyes', label: 'Under Eyes' },
  { id: 'other', label: 'Other' },
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
  
  // Form state
  const [form, setForm] = useState({
    visit_date: visit?.visit_date ? new Date(visit.visit_date).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
    visit_time: visit?.visit_date ? new Date(visit.visit_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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
  const markedPhotoInputRef = useRef(null)
  const documentInputRef = useRef(null)

  useEffect(() => {
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
    
    // Fetch treatments
    const { data: treatmentsData } = await supabase
      .from('treatments')
      .select('*')
      .eq('visit_id', visit.id)
    setTreatments(treatmentsData || [])

    // Fetch photos
    const { data: photosData } = await supabase
      .from('photos')
      .select('*')
      .eq('visit_id', visit.id)
    
    // Organize photos by position
    const photosByPosition = {}
    const marked = []
    photosData?.forEach(p => {
      if (p.position) {
        photosByPosition[p.position] = p
      } else if (p.is_marked) {
        marked.push(p)
      }
    })
    setPhotos(photosByPosition)
    setMarkedPhotos(marked)

    // Fetch documents
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
    
    // Parse date and time
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
      alert('Error saving: ' + error.message)
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
      alert('Error deleting: ' + error.message)
    }
  }

  const handlePhotoUpload = async (positionId, file) => {
    if (!file) return

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${visit.id}/${positionId}_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file)

    if (uploadError) {
      alert('Error uploading: ' + uploadError.message)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    // Save to database
    const { data, error } = await supabase
      .from('photos')
      .insert([{
        visit_id: visit.id,
        patient_id: patient.id,
        url: publicUrl,
        position: positionId,
        is_marked: false
      }])
      .select()
      .single()

    if (!error && data) {
      setPhotos(prev => ({ ...prev, [positionId]: data }))
    }
  }

  const handleMarkedPhotoUpload = async (file) => {
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${visit.id}/marked_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file)

    if (uploadError) {
      alert('Error uploading: ' + uploadError.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('photos')
      .insert([{
        visit_id: visit.id,
        patient_id: patient.id,
        url: publicUrl,
        is_marked: true
      }])
      .select()
      .single()

    if (!error && data) {
      setMarkedPhotos(prev => [...prev, data])
    }
  }

  const handleDocumentUpload = async (file) => {
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${visit.id}/doc_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      alert('Error uploading: ' + uploadError.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
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
      alert('Please select treatment type and product')
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
          ? `${newTreatment.expiry_month}/${newTreatment.expiry_year}` 
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
    } else {
      alert('Error adding treatment: ' + error?.message)
    }
  }

  const handleDeleteTreatment = async (treatmentId) => {
    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', treatmentId)

    if (!error) {
      setTreatments(prev => prev.filter(t => t.id !== treatmentId))
    }
  }

  const getTotalUnits = () => {
    return treatments.reduce((sum, t) => {
      if (t.areas) {
        return sum + Object.values(t.areas).reduce((aSum, a) => aSum + (parseFloat(a.units) || 0), 0)
      }
      return sum
    }, 0)
  }

  const getTotalCost = () => {
    // Simplified cost calculation
    return treatments.reduce((sum, t) => {
      const unitCost = t.treatment_type?.includes('botox') ? 12 : 850
      if (t.areas) {
        return sum + Object.values(t.areas).reduce((aSum, a) => aSum + ((parseFloat(a.units) || 0) * unitCost), 0)
      }
      return sum
    }, 0)
  }

  // Styles
  const styles = {
    container: {
      background: '#f5f5f5',
      minHeight: '100vh',
      padding: '0'
    },
    breadcrumb: {
      fontSize: '0.85rem',
      color: '#666',
      marginBottom: '0.5rem'
    },
    breadcrumbLink: {
      color: '#666',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#333',
      marginBottom: '1.5rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 2fr',
      gap: '1rem',
      marginBottom: '1rem'
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    cardBody: {
      padding: '1.5rem'
    },
    cardTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#333',
      marginBottom: '1rem'
    },
    profileCard: {
      textAlign: 'center'
    },
    avatar: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: '#e9ecef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      color: '#6c757d'
    },
    patientName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '0.25rem'
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
      background: '#5a9a9c',
      color: 'white'
    },
    btnDanger: {
      background: '#dc3545',
      color: 'white'
    },
    btnSecondary: {
      background: '#6c757d',
      color: 'white'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      fontSize: '0.85rem',
      fontWeight: '500',
      color: '#333',
      marginBottom: '0.25rem'
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '0.9rem'
    },
    select: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '0.9rem',
      background: 'white'
    },
    textarea: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '0.9rem',
      minHeight: '150px',
      resize: 'vertical'
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
      color: '#666',
      borderBottom: '2px solid #e9ecef',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '0.75rem',
      fontSize: '0.9rem',
      color: '#333',
      borderBottom: '1px solid #e9ecef'
    },
    emptyRow: {
      textAlign: 'center',
      padding: '2rem',
      color: '#999'
    },
    totalsBox: {
      background: '#f8f9fa',
      padding: '1rem',
      borderRadius: '6px',
      display: 'inline-block'
    },
    saveAllBtn: {
      float: 'right',
      padding: '0.6rem 1.5rem',
      background: '#5a9a9c',
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
      border: '2px dashed #ddd',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    photoBoxLandscape: {
      aspectRatio: '4/3'
    },
    photoLabel: {
      fontSize: '0.7rem',
      color: '#666',
      marginTop: '0.25rem'
    },
    photoState: {
      fontStyle: 'italic',
      display: 'block'
    },
    uploadArea: {
      border: '2px dashed #ddd',
      borderRadius: '8px',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      background: '#fafafa'
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'white',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #e9ecef'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0
    },
    modalClose: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem'
    },
    modalBody: {
      padding: '1.5rem'
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      padding: '1rem 1.5rem',
      borderTop: '1px solid #e9ecef'
    },
    copyright: {
      textAlign: 'right',
      fontSize: '0.75rem',
      color: '#999',
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
                  backgroundImage: photo ? `url(${photo.url})` : 'none',
                  border: photo ? 'none' : '2px dashed #ddd'
                }}
                onClick={() => photoInputRefs.current[pos.id]?.click()}
              >
                {!photo && <span style={{ color: '#ccc', fontSize: '2rem' }}>+</span>}
              </div>
              <input
                ref={el => photoInputRefs.current[pos.id] = el}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handlePhotoUpload(pos.id, e.target.files[0])}
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
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadcrumbLink} onClick={onBack}>Home</span>
        {' | '}
        <span style={styles.breadcrumbLink} onClick={onBack}>{getPatientName()}</span>
        {' | '}
        <span style={styles.breadcrumbLink} onClick={onBack}>Visits</span>
      </div>

      {/* Title */}
      <h1 style={styles.title}>Patient Visit</h1>

      {/* Top Row - Profile, Visit, Notes */}
      <div style={styles.grid}>
        {/* Profile Card */}
        <div style={styles.card}>
          <div style={{ ...styles.cardBody, ...styles.profileCard }}>
            <div style={styles.avatar}>
              <Icons.User />
            </div>
            <div style={styles.patientName}>{getPatientName()}</div>
            <p style={{ color: '#999', marginBottom: '1rem' }}>-</p>
            
            <button 
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={onBack}
            >
              Back to Patient
            </button>
            <button 
              style={{ ...styles.btn, ...styles.btnDanger }}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Visit
            </button>
            <button 
              style={{ ...styles.btn, ...styles.btnSecondary }}
              disabled
              title="The patient must have more than one visit in order to compare photos"
            >
              No Visit to Compare
            </button>
          </div>
        </div>

        {/* Visit Info */}
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Visit</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="text"
                style={styles.input}
                value={form.visit_date}
                onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
                placeholder="MM/DD/YYYY"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Time</label>
              <input
                type="text"
                style={styles.input}
                value={form.visit_time}
                onChange={(e) => setForm({ ...form, visit_time: e.target.value })}
                placeholder="HH:MM AM/PM"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Practitioner</label>
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
              placeholder="Enter visit notes..."
            />
          </div>
        </div>
      </div>

      {/* Treatment Record */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.treatmentHeader}>
            <h3 style={styles.cardTitle}>Treatment Record</h3>
            <div style={styles.treatmentBtnGroup}>
              <button 
                style={{ ...styles.btn, background: '#e9ecef', color: '#333', width: 'auto', padding: '0.5rem 1rem' }}
              >
                <Icons.Dollar /> Customize Pricing
              </button>
              <button 
                style={{ ...styles.btn, background: '#e9ecef', color: '#333', width: 'auto', padding: '0.5rem 1rem' }}
              >
                <Icons.Eye /> Preview
              </button>
            </div>
          </div>

          {/* Injectables Table */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>Injectables</h4>
              <button 
                style={{ ...styles.btn, ...styles.btnPrimary, width: 'auto', padding: '0.4rem 1rem', marginBottom: 0 }}
                onClick={() => setShowAddTreatmentModal(true)}
              >
                Add Treatment
              </button>
            </div>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Treatment Type</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Lot</th>
                  <th style={styles.th}>Expiry</th>
                  <th style={styles.th}>Areas / Units / Cost ($)</th>
                  <th style={styles.th}>Totals</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {treatments.filter(t => ['botox_cosmetic', 'botox_therapeutic', 'dermal_fillers'].includes(t.treatment_type)).length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyRow}>No treatments recorded.</td>
                  </tr>
                ) : (
                  treatments.filter(t => ['botox_cosmetic', 'botox_therapeutic', 'dermal_fillers'].includes(t.treatment_type)).map(t => (
                    <tr key={t.id}>
                      <td style={styles.td}>{TREATMENT_TYPES.find(tt => tt.id === t.treatment_type)?.label || t.treatment_type}</td>
                      <td style={styles.td}>{t.product}</td>
                      <td style={styles.td}>{t.lot || '-'}</td>
                      <td style={styles.td}>{t.expiry || '-'}</td>
                      <td style={styles.td}>
                        {t.areas && Object.entries(t.areas).map(([area, data]) => (
                          <div key={area}>{area}: {data.units} units</div>
                        ))}
                      </td>
                      <td style={styles.td}>
                        {t.areas && Object.values(t.areas).reduce((sum, a) => sum + (parseFloat(a.units) || 0), 0)} units
                      </td>
                      <td style={styles.td}>
                        <button 
                          onClick={() => setEditingTreatment(t)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffc107' }}
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          onClick={() => handleDeleteTreatment(t.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}
                        >
                          <Icons.Trash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Lasers, Microneedling, Peels Table */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>Lasers, Microneedling/Facials & Peels</h4>
              <button 
                style={{ ...styles.btn, ...styles.btnPrimary, width: 'auto', padding: '0.4rem 1rem', marginBottom: 0 }}
                onClick={() => setShowAddTreatmentModal(true)}
              >
                Add Treatment
              </button>
            </div>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Treatment Type</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Cost</th>
                  <th style={styles.th}>Treatment Details</th>
                  <th style={styles.th}>Totals</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {treatments.filter(t => ['lasers', 'microneedling', 'peels'].includes(t.treatment_type)).length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyRow}>No treatments recorded.</td>
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
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffc107' }}
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          onClick={() => handleDeleteTreatment(t.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}
                        >
                          <Icons.Trash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={styles.totalsBox}>
              <div><strong>Subtotal:</strong> ${getTotalCost().toFixed(2)}</div>
              <div><strong>Total:</strong> ${(getTotalCost() * 1.05).toFixed(2)}</div>
            </div>
            <button 
              style={styles.saveAllBtn}
              onClick={handleSaveAll}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>
      </div>

      {/* Photos Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', marginTop: '1rem' }}>
        {/* Upload Photos */}
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Upload Photos</h3>
            <div 
              style={styles.uploadArea}
              onClick={() => document.getElementById('bulkPhotoUpload')?.click()}
            >
              <Icons.Upload />
              <p style={{ marginTop: '0.5rem', color: '#999' }}>Click to upload</p>
            </div>
            <input
              id="bulkPhotoUpload"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                // Handle bulk upload - assign to first available positions
                Array.from(e.target.files).forEach((file, idx) => {
                  const emptyPosition = PHOTO_POSITIONS.find(p => !photos[p.id])
                  if (emptyPosition) {
                    handlePhotoUpload(emptyPosition.id, file)
                  }
                })
              }}
            />
          </div>
        </div>

        {/* Patient Photos */}
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Patient Photos</h3>
            {renderPhotoRows()}
          </div>
        </div>
      </div>

      {/* Marked Photos Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Upload Photos</h3>
            <div 
              style={styles.uploadArea}
              onClick={() => markedPhotoInputRef.current?.click()}
            >
              <Icons.Upload />
              <p style={{ marginTop: '0.5rem', color: '#999' }}>Click to upload</p>
            </div>
            <input
              ref={markedPhotoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleMarkedPhotoUpload(e.target.files[0])}
            />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Marked Photos (Max. 30 Photos)</h3>
            {markedPhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                <h4>No marked photos.</h4>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {markedPhotos.map(p => (
                  <div key={p.id} style={{ width: '120px' }}>
                    <img src={p.url} alt="" style={{ width: '100%', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>Upload Documents</h3>
            <div 
              style={styles.uploadArea}
              onClick={() => documentInputRef.current?.click()}
            >
              <Icons.Upload />
              <p style={{ marginTop: '0.5rem', color: '#999' }}>Click to upload</p>
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
            <h3 style={styles.cardTitle}>Other Documents, Reports, etc.</h3>
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                <h4>No documents</h4>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {documents.map(d => (
                  <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem 1rem', background: '#e9ecef', borderRadius: '4px', textDecoration: 'none', color: '#333' }}>
                    {d.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={styles.copyright}>
        Copyright © {new Date().getFullYear()} FaceHub
      </div>

      {/* Delete Visit Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete Visit</h3>
              <button style={styles.modalClose} onClick={() => setShowDeleteModal(false)}>
                <Icons.X />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>Are you sure you want to delete this visit?</p>
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', background: '#5a9a9c', color: 'white', cursor: 'pointer' }}
                onClick={handleDeleteVisit}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Treatment Modal */}
      {showAddTreatmentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddTreatmentModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Treatment</h3>
              <button style={styles.modalClose} onClick={() => setShowAddTreatmentModal(false)}>
                <Icons.X />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Treatment Type *</label>
                <select
                  style={styles.select}
                  value={newTreatment.treatment_type}
                  onChange={(e) => setNewTreatment({ ...newTreatment, treatment_type: e.target.value, product: '' })}
                >
                  <option value="">Select a treatment...</option>
                  {TREATMENT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Product *</label>
                <select
                  style={styles.select}
                  value={newTreatment.product}
                  onChange={(e) => setNewTreatment({ ...newTreatment, product: e.target.value })}
                  disabled={!newTreatment.treatment_type}
                >
                  <option value="">Select a product...</option>
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
                      <label style={styles.label}>Expiry</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                          style={{ ...styles.select, flex: 1 }}
                          value={newTreatment.expiry_month}
                          onChange={(e) => setNewTreatment({ ...newTreatment, expiry_month: e.target.value })}
                        >
                          <option value="">Month</option>
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          style={{ ...styles.select, flex: 1 }}
                          value={newTreatment.expiry_year}
                          onChange={(e) => setNewTreatment({ ...newTreatment, expiry_year: e.target.value })}
                        >
                          <option value="">Year</option>
                          {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Treatment Areas</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {INJECTION_AREAS.map(area => (
                        <label key={area.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  <label style={styles.label}>Treatment Areas</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {FILLER_AREAS.map(area => (
                      <label key={area.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  <label style={styles.label}>Treatment Details</label>
                  <textarea
                    style={{ ...styles.textarea, minHeight: '100px' }}
                    value={newTreatment.details}
                    onChange={(e) => setNewTreatment({ ...newTreatment, details: e.target.value })}
                    placeholder="ie: device & product(s) used, areas treated, products recommended, etc."
                  />
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                onClick={() => setShowAddTreatmentModal(false)}
              >
                Cancel
              </button>
              <button 
                style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', background: '#5a9a9c', color: 'white', cursor: 'pointer' }}
                onClick={handleAddTreatment}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
