import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  User: () => <svg fill="currentColor" viewBox="0 0 24 24" width="60" height="60"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  Warning: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Upload: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
}

const GENDER_OPTIONS = [
  { value: '', label: 'Choisir le genre' },
  { value: 'female', label: 'Femme' },
  { value: 'male', label: 'Homme' },
  { value: 'transgender_female', label: 'Femme transgenre' },
  { value: 'transgender_male', label: 'Homme transgenre' },
  { value: 'gender_queer', label: 'Non-binaire' },
  { value: 'other', label: 'Autre' },
]

const SEX_OPTIONS = [
  { value: '', label: 'Choisir le sexe' },
  { value: 'female', label: 'Femme' },
  { value: 'male', label: 'Homme' },
  { value: 'other', label: 'Autre' },
]

const ETHNICITY_OPTIONS = [
  { value: '', label: "Choisir l'ethnicité" },
  { value: 'Caucasian', label: 'Caucasien' },
  { value: 'African American/Black', label: 'Afro-américain/Noir' },
  { value: 'Hispanic/Latino', label: 'Hispanique/Latino' },
  { value: 'Asian', label: 'Asiatique' },
  { value: 'Middle Eastern', label: 'Moyen-Orient' },
  { value: 'Pacific Islander', label: 'Insulaire du Pacifique' },
  { value: 'Native American/Alaskan', label: 'Autochtone' },
  { value: 'Other', label: 'Autre' },
]

const COUNTRY_OPTIONS = [
  { value: '', label: 'Choisir le pays' },
  { value: 'CA', label: 'Canada' },
  { value: 'US', label: 'États-Unis' },
]

const PROVINCE_OPTIONS = {
  CA: [
    { value: '', label: 'Choisir la province' },
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'Colombie-Britannique' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'Nouveau-Brunswick' },
    { value: 'NL', label: 'Terre-Neuve-et-Labrador' },
    { value: 'NS', label: 'Nouvelle-Écosse' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Île-du-Prince-Édouard' },
    { value: 'QC', label: 'Québec' },
    { value: 'SK', label: 'Saskatchewan' },
  ],
  US: [
    { value: '', label: "Choisir l'état" },
    { value: 'CA', label: 'Californie' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    { value: 'FL', label: 'Floride' },
  ]
}

const MEDICAL_CONDITIONS = [
  'Acne', 'Allergies', 'ALS', 'Arthritis', 'Asthma', 'Autoimmune disorder',
  'Blood disorder', 'Cancer (or radiation therapy)', "Cow's milk protein allergy",
  'Diabetes (or diabetic neuropathy)', 'Epilepsy', 'Guillain barre syndrome',
  'Herpes (or cold sores)', 'Hirsutism', 'Hormonal imbalance',
  'Keloid scars (or other scars)', 'Kidney disease', 'Local anesthetic sensitivity',
  'Melanoma', 'Myasthenia gravis', 'Polycystic ovarian syndrome', 'Port wine stain',
  'Psoriasis', 'Severe allergic reactions', 'Steroids (or hormonal therapy)',
  'Shingles', 'Significant neurological disease', 'Skin pigmentation', 'Vitiligo', 'Other'
]

const REFERRAL_OPTIONS = [
  "Référence médicale", "Ami ou patient actuel", "Séminaire ou Salon",
  "Journal", "Site web ou Internet", "Promotion ou Coupon", "Pages Jaunes",
  "Magazine", "Passant", "Autre"
]

const INTEREST_OPTIONS = [
  "Traitement des rides et ridules", "Traitement de la perte de volume facial", "Traitement des sourires gingivaux",
  "Traitement de la position asymétrique des lèvres", "Traitement des migraines/maux de tête", "Traitement TMD/TMJ",
  "Traitement des taches de vieillesse", "Amélioration du teint", "Traitement de la graisse corporelle tenace",
  "Épilation", "Relooking du sourire"
]

export default function PatientEdit({ patient, onBack, onSave, session }) {
  const [registrationType, setRegistrationType] = useState('full')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', genderIdentity: '', sexAtBirth: '', birthday: '', ethnicity: '',
    email: '', cellPhone: '', homePhone: '', workPhone: '',
    country: '', province: '', address: '', city: '', postalCode: '',
    familyPhysician: '', weight: '', height: '', pastIllnesses: '', medications: '', conditions: '',
    medicalConditions: [], allergiesDetail: '', referrals: [], interests: [],
    skinProducts: '', skinSensitivities: false, vitaminA: false, accutane: false,
    chemicalPeel: false, laserTreatments: false, botoxDermal: false, waxDepilatory: false,
    sunExposure: '', tanning: false, sunscreen: false, sunscreenSPF: '',
    botoxConsent: '', fillerConsent: '', photoConsent: '',
  })

  // État pour la photo du patient
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoHovered, setPhotoHovered] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  useEffect(() => {
    if (patient) {
      const m = patient.metadata || {}
      setRegistrationType(m.registrationType || 'full')
      setProfilePhoto(m.profilePhoto || patient.profile_photo_url || null)
      setForm({
        firstName: m.firstName || patient.name?.split(' ')[0] || '',
        lastName: m.lastName || patient.name?.split(' ').slice(1).join(' ') || '',
        genderIdentity: m.genderIdentity || '', sexAtBirth: m.sexAtBirth || '',
        birthday: patient.birthdate || m.birthday || '', ethnicity: m.ethnicity || '',
        email: m.contact?.email || patient.email || '',
        cellPhone: m.contact?.cellPhone || patient.phone || '',
        homePhone: m.contact?.homePhone || '', workPhone: m.contact?.workPhone || '',
        country: m.address?.country || '', province: m.address?.province || '',
        address: m.address?.street || '', city: m.address?.city || '', postalCode: m.address?.postalCode || '',
        familyPhysician: m.medicalHistory?.physician || '', weight: m.medicalHistory?.weight || '',
        height: m.medicalHistory?.height || '', pastIllnesses: m.medicalHistory?.pastIllnesses || '',
        medications: m.medicalHistory?.medications || '', conditions: m.medicalHistory?.conditions || '',
        medicalConditions: m.medicalConditions || [], allergiesDetail: m.allergiesDetail || '',
        referrals: m.aboutVisit?.referrals || [], interests: m.aboutVisit?.interests || [],
        skinProducts: m.skinHistory?.products || '', skinSensitivities: m.skinHistory?.sensitivities || false,
        vitaminA: m.skinHistory?.vitaminA || false, accutane: m.skinHistory?.accutane || false,
        chemicalPeel: m.skinHistory?.chemicalPeel || false, laserTreatments: m.skinHistory?.laserTreatments || false,
        botoxDermal: m.skinHistory?.botoxDermal || false, waxDepilatory: m.skinHistory?.waxDepilatory || false,
        sunExposure: m.sunHistory?.exposure || '', tanning: m.sunHistory?.tanning || false,
        sunscreen: m.sunHistory?.sunscreen || false, sunscreenSPF: m.sunHistory?.spf || '',
        botoxConsent: m.consents?.botox || '', fillerConsent: m.consents?.filler || '', photoConsent: m.consents?.photo || '',
      })
    }
  }, [patient])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const handleCheckboxArray = (field, value, checked) => setForm(prev => ({
    ...prev, [field]: checked ? [...prev[field], value] : prev[field].filter(v => v !== value)
  }))

  // Gestion de la photo de profil
  const handlePhotoUpload = async (file) => {
    if (!file || !patient) return
    setUploadingPhoto(true)
    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${patient.id}/profile_${Date.now()}.${fileExt}`

      if (patient.metadata?.profilePhotoPath) {
        await supabase.storage.from('patient-photos').remove([patient.metadata.profilePhotoPath])
      }

      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('patient-photos')
        .getPublicUrl(fileName)

      setProfilePhoto(publicUrl)

      const updatedMetadata = { ...patient.metadata, profilePhoto: publicUrl, profilePhotoPath: fileName }
      await supabase.from('patients').update({ profile_photo_url: publicUrl, metadata: updatedMetadata }).eq('id', patient.id)

    } catch (error) {
      console.error('Erreur upload photo:', error)
      alert('Erreur lors du téléversement: ' + error.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) handlePhotoUpload(file)
    e.target.value = ''
  }

  const handleDeletePhoto = async () => {
    if (!profilePhoto || !patient) return
    if (!window.confirm('Voulez-vous supprimer la photo de profil?')) return
    try {
      if (patient.metadata?.profilePhotoPath) {
        await supabase.storage.from('patient-photos').remove([patient.metadata.profilePhotoPath])
      }
      const updatedMetadata = { ...patient.metadata, profilePhoto: null, profilePhotoPath: null }
      await supabase.from('patients').update({ profile_photo_url: null, metadata: updatedMetadata }).eq('id', patient.id)
      setProfilePhoto(null)
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const metadata = {
      registrationType, firstName: form.firstName, lastName: form.lastName,
      genderIdentity: form.genderIdentity, sexAtBirth: form.sexAtBirth,
      birthday: form.birthday, ethnicity: form.ethnicity,
      profilePhoto: profilePhoto,
      profilePhotoPath: patient.metadata?.profilePhotoPath || null,
      contact: { email: form.email, cellPhone: form.cellPhone, homePhone: form.homePhone, workPhone: form.workPhone },
      address: { country: form.country, province: form.province, street: form.address, city: form.city, postalCode: form.postalCode },
      medicalHistory: { physician: form.familyPhysician, weight: form.weight, height: form.height,
        pastIllnesses: form.pastIllnesses, medications: form.medications, conditions: form.conditions },
      medicalConditions: form.medicalConditions, allergiesDetail: form.allergiesDetail,
      aboutVisit: { referrals: form.referrals, interests: form.interests },
      skinHistory: { products: form.skinProducts, sensitivities: form.skinSensitivities, vitaminA: form.vitaminA,
        accutane: form.accutane, chemicalPeel: form.chemicalPeel, laserTreatments: form.laserTreatments,
        botoxDermal: form.botoxDermal, waxDepilatory: form.waxDepilatory },
      sunHistory: { exposure: form.sunExposure, tanning: form.tanning, sunscreen: form.sunscreen, spf: form.sunscreenSPF },
      consents: { botox: form.botoxConsent, filler: form.fillerConsent, photo: form.photoConsent },
    }
    const { error } = await supabase.from('patients').update({
      name: `${form.firstName} ${form.lastName}`, email: form.email, phone: form.cellPhone, birthdate: form.birthday, metadata,
      profile_photo_url: profilePhoto,
    }).eq('id', patient.id)
    setSaving(false)
    if (!error) { alert('Patient enregistré avec succès!'); onSave && onSave() }
    else { alert('Erreur: ' + error.message) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient?\n\nCette action est IRRÉVERSIBLE.')) return
    const confirmText = window.prompt("Tapez 'supprimer' pour confirmer:")
    if (confirmText?.toLowerCase() !== 'supprimer') return
    await supabase.from('patients').delete().eq('id', patient.id)
    onBack && onBack()
  }

  const handleInactivate = async () => {
    const newStatus = patient.is_active === false ? true : false
    await supabase.from('patients').update({ is_active: newStatus }).eq('id', patient.id)
    alert(newStatus ? 'Patient activé' : 'Patient désactivé')
    onSave && onSave()
  }

  const isProfileComplete = () => {
    if (registrationType === 'quick') return form.firstName && form.lastName && form.birthday
    return form.firstName && form.lastName && form.birthday && form.email && form.genderIdentity && form.sexAtBirth && form.ethnicity
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Patient'

  const styles = `
    .pe-container { background: var(--bg-main); min-height: 100%; padding: 1.5rem; color: var(--text-primary); }
    .pe-breadcrumb { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; }
    .pe-breadcrumb a { color: var(--text-muted); text-decoration: none; }
    .pe-breadcrumb a:hover { color: var(--primary); }
    .pe-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .pe-warning { background: var(--warning-bg); border: 1px solid var(--warning); border-radius: 10px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; }
    .pe-warning-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: var(--warning); }
    .pe-warning-title { font-weight: 600; }
    .pe-warning-text { font-size: 0.9rem; color: var(--warning); opacity: 0.9; }
    .pe-type-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border); }
    .pe-type-label { font-weight: 500; color: var(--text-secondary); }
    .pe-radio-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text-secondary); }
    .pe-radio-label input { accent-color: var(--primary); }
    .pe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .pe-card { background: var(--bg-card); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid var(--border); }
    .pe-card-title { font-size: 1rem; font-weight: 600; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); color: var(--text-primary); }
    .pe-profile-card { display: flex; gap: 1.5rem; }
    .pe-profile-left { display: flex; flex-direction: column; align-items: center; min-width: 200px; }
    
    /* Avatar éditable avec hover */
    .pe-avatar-container { position: relative; width: 120px; height: 120px; margin-bottom: 0.75rem; }
    .pe-avatar { width: 120px; height: 120px; border-radius: 50%; background: var(--bg-sidebar); display: flex; align-items: center; justify-content: center; color: var(--text-muted); border: 3px solid var(--border); overflow: hidden; transition: all 0.3s ease; }
    .pe-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .pe-avatar-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%; background: rgba(0, 0, 0, 0.75); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4rem; opacity: 0; transition: opacity 0.3s ease; cursor: pointer; }
    .pe-avatar-container:hover .pe-avatar-overlay { opacity: 1; }
    .pe-avatar-container:hover .pe-avatar { border-color: var(--primary); }
    .pe-avatar-btn { display: flex; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.35rem 0.7rem; border-radius: 20px; border: none; cursor: pointer; font-size: 0.7rem; font-weight: 500; transition: all 0.2s ease; min-width: 85px; }
    .pe-avatar-btn-primary { background: var(--primary); color: white; }
    .pe-avatar-btn-primary:hover { background: var(--primary-dark); transform: scale(1.05); }
    .pe-avatar-btn-secondary { background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.3); }
    .pe-avatar-btn-secondary:hover { background: rgba(255, 255, 255, 0.3); }
    .pe-avatar-btn-danger { background: var(--danger); color: white; }
    .pe-avatar-btn-danger:hover { background: #d32f2f; }
    .pe-avatar-btn svg { width: 14px; height: 14px; }
    .pe-avatar-uploading { position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; }
    .pe-spinner { width: 30px; height: 30px; border: 3px solid rgba(212, 165, 116, 0.3); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .pe-avatar-hint { font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-top: 0.25rem; }
    
    .pe-profile-name { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; text-align: center; }
    .pe-btn { width: 100%; padding: 0.6rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.5rem; transition: all 0.15s; }
    .pe-btn-danger { background: var(--danger); color: white; }
    .pe-btn-danger:hover { background: #d32f2f; }
    .pe-btn-primary { background: var(--primary); color: white; }
    .pe-btn-primary:hover { background: var(--primary-dark); }
    .pe-btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
    .pe-btn-outline:hover { border-color: var(--primary); color: var(--primary); }
    .pe-profile-right { flex: 1; }
    .pe-info-row { margin-bottom: 0.75rem; }
    .pe-info-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; }
    .pe-info-value { font-size: 0.9rem; color: var(--text-secondary); }
    .pe-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .pe-form-group { margin-bottom: 1rem; }
    .pe-label { display: block; font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.35rem; }
    .pe-required { color: var(--danger); margin-left: 2px; }
    .pe-input { width: 100%; padding: 0.6rem 0.85rem; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; background: var(--bg-input); color: var(--text-primary); transition: border-color 0.15s; }
    .pe-input:focus { outline: none; border-color: var(--primary); }
    .pe-input::placeholder { color: var(--text-muted); }
    .pe-select { width: 100%; padding: 0.6rem 0.85rem; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; background: var(--bg-input); color: var(--text-primary); cursor: pointer; }
    .pe-select:focus { outline: none; border-color: var(--primary); }
    .pe-textarea { width: 100%; padding: 0.6rem 0.85rem; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; background: var(--bg-input); color: var(--text-primary); min-height: 80px; resize: vertical; }
    .pe-textarea:focus { outline: none; border-color: var(--primary); }
    .pe-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }
    .pe-checkbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .pe-checkbox { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer; }
    .pe-checkbox input { accent-color: var(--primary); width: 16px; height: 16px; }
    .pe-consent-box { max-height: 150px; overflow-y: auto; padding: 0.75rem; background: var(--bg-sidebar); border-radius: 8px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; border: 1px solid var(--border); }
    .pe-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border); }
    .pe-required-note { font-size: 0.85rem; color: var(--danger); }
    .pe-save-btn { padding: 0.75rem 2rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: background 0.15s; }
    .pe-save-btn:hover { background: var(--primary-dark); }
    .pe-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    @media (max-width: 1024px) { .pe-grid { grid-template-columns: 1fr; } .pe-profile-card { flex-direction: column; } .pe-form-row { grid-template-columns: 1fr; } .pe-checkbox-grid { grid-template-columns: 1fr; } }
    @media (hover: none) and (pointer: coarse) { .pe-avatar-overlay { opacity: 1 !important; background: rgba(0, 0, 0, 0.5); } }
  `

  return (
    <div className="pe-container">
      <style>{styles}</style>

      {/* Inputs cachés pour téléversement */}
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />
      <input type="file" ref={cameraInputRef} style={{ display: 'none' }} accept="image/*" capture="user" onChange={handleFileSelect} />

      <div className="pe-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack() }}>Accueil</a>{' | '}
        <a href="#" onClick={(e) => { e.preventDefault(); onBack() }}>Patients</a>{' | '}
        <span style={{color: 'var(--text-secondary)'}}>{fullName}</span>
      </div>

      <h1 className="pe-title">MODIFIER LE PATIENT</h1>

      {!isProfileComplete() && (
        <div className="pe-warning">
          <div className="pe-warning-header"><Icons.Warning /><span className="pe-warning-title">Attention</span></div>
          <div className="pe-warning-text">Ce profil est incomplet. Veuillez mettre à jour les champs requis pour compléter l'inscription.</div>
        </div>
      )}

      <div className="pe-type-row">
        <span className="pe-type-label">Type:</span>
        <label className="pe-radio-label">
          <input type="radio" name="regType" checked={registrationType === 'full'} onChange={() => setRegistrationType('full')} />
          Inscription complète
        </label>
        <label className="pe-radio-label">
          <input type="radio" name="regType" checked={registrationType === 'quick'} onChange={() => setRegistrationType('quick')} />
          Inscription rapide
        </label>
      </div>

      <div className="pe-grid">
        <div>
          <div className="pe-card pe-profile-card">
            <div className="pe-profile-left">
              {/* Avatar éditable avec hover */}
              <div className="pe-avatar-container" onMouseEnter={() => setPhotoHovered(true)} onMouseLeave={() => setPhotoHovered(false)}>
                <div className="pe-avatar">
                  {profilePhoto ? <img src={profilePhoto} alt={fullName} /> : <Icons.User />}
                </div>
                
                {uploadingPhoto ? (
                  <div className="pe-avatar-uploading"><div className="pe-spinner"></div></div>
                ) : (
                  <div className="pe-avatar-overlay">
                    <button className="pe-avatar-btn pe-avatar-btn-primary" onClick={() => cameraInputRef.current?.click()} title="Prendre une photo">
                      <Icons.Camera /> Photo
                    </button>
                    <button className="pe-avatar-btn pe-avatar-btn-secondary" onClick={() => fileInputRef.current?.click()} title="Téléverser une image">
                      <Icons.Upload /> Galerie
                    </button>
                    {profilePhoto && (
                      <button className="pe-avatar-btn pe-avatar-btn-danger" onClick={handleDeletePhoto} title="Supprimer la photo">
                        <Icons.Trash /> Suppr.
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="pe-avatar-hint">{profilePhoto ? 'Survolez pour modifier' : 'Cliquez pour ajouter'}</div>
              
              <div className="pe-profile-name">{fullName}</div>
              <button className="pe-btn pe-btn-danger" onClick={handleDelete}>Supprimer le patient</button>
              <button className="pe-btn pe-btn-primary">Sélectionner consentements</button>
              <button className="pe-btn pe-btn-outline" onClick={handleInactivate}>
                {patient.is_active === false ? 'Activer le patient' : 'Désactiver le patient'}
              </button>
            </div>
            <div className="pe-profile-right">
              <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--gold)', marginBottom: '1rem' }}>Détails personnels du patient</h4>
              <div className="pe-info-row"><div className="pe-info-label">Nom complet</div><div className="pe-info-value">{fullName}</div></div>
              <div className="pe-info-row"><div className="pe-info-label">Identité de genre</div><div className="pe-info-value">{GENDER_OPTIONS.find(g => g.value === form.genderIdentity)?.label || '-'}</div></div>
              <div className="pe-info-row"><div className="pe-info-label">Sexe à la naissance</div><div className="pe-info-value">{SEX_OPTIONS.find(s => s.value === form.sexAtBirth)?.label || '-'}</div></div>
              <div className="pe-info-row"><div className="pe-info-label">Date de naissance</div><div className="pe-info-value">{form.birthday || '-'}</div></div>
            </div>
          </div>

          <div className="pe-card">
            <h3 className="pe-card-title">Détails personnels</h3>
            <div className="pe-form-row">
              <div className="pe-form-group">
                <label className="pe-label">Prénom <span className="pe-required">*</span></label>
                <input className="pe-input" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} placeholder="Prénom" />
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Nom <span className="pe-required">*</span></label>
                <input className="pe-input" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} placeholder="Nom" />
              </div>
            </div>
            <div className="pe-form-row">
              <div className="pe-form-group">
                <label className="pe-label">Identité de genre <span className="pe-required">*</span></label>
                <select className="pe-select" value={form.genderIdentity} onChange={e => handleChange('genderIdentity', e.target.value)}>
                  {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Sexe à la naissance <span className="pe-required">*</span></label>
                <select className="pe-select" value={form.sexAtBirth} onChange={e => handleChange('sexAtBirth', e.target.value)}>
                  {SEX_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            <div className="pe-form-row">
              <div className="pe-form-group">
                <label className="pe-label">Date de naissance <span className="pe-required">*</span></label>
                <input className="pe-input" type="date" value={form.birthday} onChange={e => handleChange('birthday', e.target.value)} />
                <div className="pe-hint">Format: AAAA-MM-JJ</div>
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Ethnicité <span className="pe-required">*</span></label>
                <select className="pe-select" value={form.ethnicity} onChange={e => handleChange('ethnicity', e.target.value)}>
                  {ETHNICITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="pe-card">
            <h3 className="pe-card-title">Coordonnées</h3>
            <div className="pe-form-group">
              <label className="pe-label">Courriel <span className="pe-required">*</span></label>
              <input className="pe-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@exemple.com" />
            </div>
            <div className="pe-form-row">
              <div className="pe-form-group">
                <label className="pe-label">Téléphone cellulaire</label>
                <input className="pe-input" value={form.cellPhone} onChange={e => handleChange('cellPhone', e.target.value)} placeholder="(514) 000-0000" />
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Téléphone maison</label>
                <input className="pe-input" value={form.homePhone} onChange={e => handleChange('homePhone', e.target.value)} placeholder="(514) 000-0000" />
              </div>
            </div>
            <div className="pe-form-group">
              <label className="pe-label">Téléphone travail</label>
              <input className="pe-input" value={form.workPhone} onChange={e => handleChange('workPhone', e.target.value)} placeholder="(514) 000-0000" />
            </div>
          </div>

          <div className="pe-card">
            <h3 className="pe-card-title">Adresse</h3>
            <div className="pe-form-row">
              <div className="pe-form-group">
                <label className="pe-label">Pays</label>
                <select className="pe-select" value={form.country} onChange={e => { handleChange('country', e.target.value); handleChange('province', ''); }}>
                  {COUNTRY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Province/État</label>
                <select className="pe-select" value={form.province} onChange={e => handleChange('province', e.target.value)} disabled={!form.country}>
                  {(PROVINCE_OPTIONS[form.country] || [{ value: '', label: 'Choisir le pays d\'abord' }]).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            <div className="pe-form-group">
              <label className="pe-label">Adresse</label>
              <input className="pe-input" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="123 Rue Exemple" />
            </div>
            <div className="pe-form-row">
              <div className="pe-form-group">
                <label className="pe-label">Ville</label>
                <input className="pe-input" value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="Montréal" />
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Code postal</label>
                <input className="pe-input" value={form.postalCode} onChange={e => handleChange('postalCode', e.target.value)} placeholder="H1A 1A1" />
              </div>
            </div>
          </div>

          {registrationType === 'full' && (
            <div className="pe-card">
              <h3 className="pe-card-title">Référence et intérêts</h3>
              <div className="pe-form-group">
                <label className="pe-label">Comment avez-vous entendu parler de nous?</label>
                <div className="pe-checkbox-grid">
                  {REFERRAL_OPTIONS.map(ref => (
                    <label key={ref} className="pe-checkbox">
                      <input type="checkbox" checked={form.referrals.includes(ref)} onChange={e => handleCheckboxArray('referrals', ref, e.target.checked)} />
                      {ref}
                    </label>
                  ))}
                </div>
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Quels traitements vous intéressent?</label>
                <div className="pe-checkbox-grid">
                  {INTEREST_OPTIONS.map(int => (
                    <label key={int} className="pe-checkbox">
                      <input type="checkbox" checked={form.interests.includes(int)} onChange={e => handleCheckboxArray('interests', int, e.target.checked)} />
                      {int}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {registrationType === 'full' && (
            <div className="pe-card">
              <h3 className="pe-card-title">Historique de la peau</h3>
              <div className="pe-form-group">
                <label className="pe-label">Quels produits de soins utilisez-vous actuellement?</label>
                <textarea className="pe-textarea" value={form.skinProducts} onChange={e => handleChange('skinProducts', e.target.value)} placeholder="Listez vos produits de soins..." />
              </div>
              <div className="pe-checkbox-grid">
                <label className="pe-checkbox"><input type="checkbox" checked={form.skinSensitivities} onChange={e => handleChange('skinSensitivities', e.target.checked)} />Avez-vous des sensibilités cutanées connues?</label>
                <label className="pe-checkbox"><input type="checkbox" checked={form.vitaminA} onChange={e => handleChange('vitaminA', e.target.checked)} />Utilisez-vous des produits à base de vitamine A?</label>
                <label className="pe-checkbox"><input type="checkbox" checked={form.accutane} onChange={e => handleChange('accutane', e.target.checked)} />Avez-vous pris Accutane/isotrétinoïne (12 derniers mois)?</label>
                <label className="pe-checkbox"><input type="checkbox" checked={form.chemicalPeel} onChange={e => handleChange('chemicalPeel', e.target.checked)} />Avez-vous eu un peeling chimique (6 derniers mois)?</label>
                <label className="pe-checkbox"><input type="checkbox" checked={form.laserTreatments} onChange={e => handleChange('laserTreatments', e.target.checked)} />Avez-vous eu des traitements laser (6 derniers mois)?</label>
                <label className="pe-checkbox"><input type="checkbox" checked={form.botoxDermal} onChange={e => handleChange('botoxDermal', e.target.checked)} />Avez-vous déjà eu du Botox ou des fillers?</label>
                <label className="pe-checkbox"><input type="checkbox" checked={form.waxDepilatory} onChange={e => handleChange('waxDepilatory', e.target.checked)} />Utilisez-vous de la cire ou un dépilatoire?</label>
              </div>
            </div>
          )}

          {registrationType === 'full' && (
            <div className="pe-card">
              <h3 className="pe-card-title">Historique solaire</h3>
              <div className="pe-form-group">
                <label className="pe-label">Comment votre peau réagit-elle au soleil?</label>
                <select className="pe-select" value={form.sunExposure} onChange={e => handleChange('sunExposure', e.target.value)}>
                  <option value="">Choisir une option</option>
                  <option value="always_burn">Brûle toujours, ne bronze jamais</option>
                  <option value="usually_burn">Brûle généralement, bronze difficilement</option>
                  <option value="sometimes_burn">Brûle parfois, bronze moyennement</option>
                  <option value="rarely_burn">Brûle rarement, bronze facilement</option>
                  <option value="never_burn">Ne brûle jamais, bronze toujours</option>
                </select>
              </div>
              <label className="pe-checkbox"><input type="checkbox" checked={form.tanning} onChange={e => handleChange('tanning', e.target.checked)} />Prenez-vous des bains de soleil, utilisez-vous des autobronzants ou des lits de bronzage?</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <label className="pe-checkbox"><input type="checkbox" checked={form.sunscreen} onChange={e => handleChange('sunscreen', e.target.checked)} />Utilisez-vous de la crème solaire?</label>
                {form.sunscreen && <input className="pe-input" style={{ width: '120px' }} value={form.sunscreenSPF} onChange={e => handleChange('sunscreenSPF', e.target.value)} placeholder="FPS" />}
              </div>
            </div>
          )}
        </div>

        <div>
          {registrationType === 'full' && (
            <div className="pe-card">
              <h3 className="pe-card-title">Conditions médicales</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Avez-vous l'une des conditions médicales suivantes?</p>
              <div className="pe-checkbox-grid">
                {MEDICAL_CONDITIONS.map(cond => (
                  <label key={cond} className="pe-checkbox">
                    <input type="checkbox" checked={form.medicalConditions.includes(cond)} onChange={e => handleCheckboxArray('medicalConditions', cond, e.target.checked)} />
                    {cond}
                  </label>
                ))}
              </div>
              {form.medicalConditions.includes('Allergies') && (
                <div style={{ marginTop: '1rem' }}>
                  <label className="pe-label">Veuillez lister vos allergies:</label>
                  <input className="pe-input" value={form.allergiesDetail} onChange={e => handleChange('allergiesDetail', e.target.value)} placeholder="Allergies" />
                </div>
              )}
            </div>
          )}

          {registrationType === 'full' && (
            <div className="pe-card">
              <h3 className="pe-card-title">Antécédents médicaux</h3>
              <div className="pe-form-row">
                <div className="pe-form-group">
                  <label className="pe-label">Médecin de famille</label>
                  <input className="pe-input" value={form.familyPhysician} onChange={e => handleChange('familyPhysician', e.target.value)} placeholder="Nom du médecin" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="pe-label">Poids</label>
                    <input className="pe-input" value={form.weight} onChange={e => handleChange('weight', e.target.value)} placeholder="kg" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="pe-label">Taille</label>
                    <input className="pe-input" value={form.height} onChange={e => handleChange('height', e.target.value)} placeholder="cm" />
                  </div>
                </div>
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Listez vos maladies passées et chirurgies:</label>
                <textarea className="pe-textarea" value={form.pastIllnesses} onChange={e => handleChange('pastIllnesses', e.target.value)} placeholder="Maladies et chirurgies passées..." />
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Listez vos médicaments actuels:</label>
                <textarea className="pe-textarea" value={form.medications} onChange={e => handleChange('medications', e.target.value)} placeholder="Médicaments actuels..." />
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Conditions actuellement traitées:</label>
                <textarea className="pe-textarea" value={form.conditions} onChange={e => handleChange('conditions', e.target.value)} placeholder="Conditions en traitement..." />
              </div>
            </div>
          )}

          {registrationType === 'full' && (
            <div className="pe-card">
              <h3 className="pe-card-title">Consentement Toxine Botulinique</h3>
              <div className="pe-consent-box">
                <p>1. Je suis conscient(e) que lorsque de petites quantités de toxine botulinique purifiée sont injectées dans un muscle, celui-ci est affaibli. Cet effet apparaît en 12 à 14 jours et dure généralement environ 3 à 4 mois.</p>
                <p style={{ marginTop: '0.5rem' }}>2. Je comprends que ce traitement réduira ou éliminera ma capacité à froncer les sourcils et/ou produire des pattes d'oie ou des rides du front...</p>
              </div>
              <select className="pe-select" value={form.botoxConsent} onChange={e => handleChange('botoxConsent', e.target.value)}>
                <option value="">Choisir une option</option>
                <option value="accept">Accepter</option>
                <option value="reject">Ne pas accepter</option>
              </select>
            </div>
          )}

          {registrationType === 'full' && (
            <div className="pe-card">
              <h3 className="pe-card-title">Consentement Filler Dermique</h3>
              <div className="pe-consent-box">
                <p>Je reconnais que ce traitement m'a été entièrement expliqué et que j'ai eu l'occasion de poser des questions auxquelles on a répondu à ma satisfaction...</p>
              </div>
              <select className="pe-select" value={form.fillerConsent} onChange={e => handleChange('fillerConsent', e.target.value)}>
                <option value="">Choisir une option</option>
                <option value="accept">Accepter</option>
                <option value="reject">Ne pas accepter</option>
              </select>
            </div>
          )}

          {registrationType === 'full' && (
            <div className="pe-card">
              <h3 className="pe-card-title">Consentement Photo</h3>
              <div className="pe-consent-box">
                <p>Consentez-vous à ce que vos photographies soient utilisées à des fins d'éducation des patients et de marketing?</p>
              </div>
              <select className="pe-select" value={form.photoConsent} onChange={e => handleChange('photoConsent', e.target.value)}>
                <option value="">Choisir une option</option>
                <option value="accept">Accepter</option>
                <option value="reject">Ne pas accepter</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="pe-footer">
        <span className="pe-required-note">* champ obligatoire</span>
        <button className="pe-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  )
}
