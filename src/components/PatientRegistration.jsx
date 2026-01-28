import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Icônes
const Icons = {
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Zap: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  FileText: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  ChevronDown: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>,
}

// Options pour les selects
const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'transgender_female', label: 'Transgender Female' },
  { value: 'transgender_male', label: 'Transgender Male' },
  { value: 'gender_queer', label: 'Gender Queer' },
  { value: 'other', label: 'Other' },
]

const SEX_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]

const ETHNICITY_OPTIONS = [
  { value: 'caucasian', label: 'Caucasian' },
  { value: 'african_american', label: 'African American/Black' },
  { value: 'hispanic', label: 'Hispanic/Latino' },
  { value: 'asian', label: 'Asian' },
  { value: 'middle_eastern', label: 'Middle Eastern' },
  { value: 'pacific_islander', label: 'Pacific Islander' },
  { value: 'native_american', label: 'Native American/Alaskan' },
  { value: 'other', label: 'Other' },
]

const COUNTRY_OPTIONS = [
  { value: 'CA', label: 'Canada' },
  { value: 'US', label: 'United States' },
]

const PROVINCE_OPTIONS = [
  { group: 'Provinces', options: [
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
  ]},
  { group: 'Territories', options: [
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' },
  ]},
]

const REFERRAL_OPTIONS = [
  "Doctor's referral",
  "Friend or current patient",
  "Seminar or Tradeshow",
  "Newspaper",
  "Website or Internet",
  "Promotion or Coupon",
  "Yellow Pages",
  "Magazine",
  "Walk by",
]

const INTEREST_OPTIONS = [
  "Treating fine lines & wrinkles",
  "Treating facial volume loss",
  "Treating gummy smiles",
  "Treating uneven lip position",
  "Treating migraine/headaches",
  "Treating TMD/TMJ",
  "Treatment of age spots",
  "Improving skin tone",
  "Treating stubborn body fat",
  "Hair removal",
  "Smile makeover",
]

const MEDICAL_CONDITIONS = [
  "Acne", "Allergies", "ALS", "Arthritis", "Asthma", "Autoimmune disorder",
  "Blood disorder", "Cancer (or radiation therapy)", "Cow's milk protein allergy",
  "Diabetes (or diabetic neuropathy)", "Epilepsy", "Guillain barre syndrome",
  "Herpes (or cold sores)", "Hirsutism", "Hormonal imbalance",
  "Keloid scars (or other scars)", "Kidney disease", "Local anesthetic sensitivity",
  "Melanoma", "Myasthenia gravis", "Polycystic ovarian syndrome", "Port wine stain",
  "Psoriasis", "Severe allergic reactions", "Steroids (or hormonal therapy)",
  "Shingles", "Significant neurological disease", "Skin pigmentation", "Vitiligo"
]

const SUN_EXPOSURE_OPTIONS = [
  "Always burn, never tan",
  "Usually burn, tan with difficulty",
  "Almost never burn, tan very easily",
  "Sometimes burn, tan about average",
  "Rarely burn, tan easily",
  "Never burn, always tan",
]

// Configuration des champs selon le type d'inscription
const QUICK_REG_SECTIONS = ['personal-details']
const FULL_REG_SECTIONS = [
  'personal-details', 'contact-information', 'mailing-address',
  'about-visit', 'skin-history', 'medical-history', 'medical-conditions', 'sun-history'
]

export default function PatientRegistration({ onBack, onComplete, session, userClinic }) {
  // États
  const [showTypeModal, setShowTypeModal] = useState(true)
  const [registrationType, setRegistrationType] = useState('full') // 'quick' ou 'full'
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])
  
  // Consentements sélectionnés
  const [selectedConsents, setSelectedConsents] = useState({
    botox: true,
    filler: true,
    photo: true
  })

  // Données du formulaire
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    genderIdentity: '',
    genderOther: '',
    sexAtBirth: '',
    sexOther: '',
    birthday: '',
    ethnicity: '',
    
    // Contact Information
    email: '',
    cellPhone: '',
    homePhone: '',
    workPhone: '',
    
    // Mailing Address
    country: 'CA',
    province: 'QC',
    address: '',
    city: '',
    postalCode: '',
    
    // About Your Visit
    referrals: [],
    referralOther: '',
    interests: [],
    
    // Skin History
    skinProducts: '',
    skinSensitivities: false,
    skinSensitivitiesText: '',
    vitaminA: false,
    vitaminAText: '',
    accutane: false,
    accutaneText: '',
    chemicalPeel: false,
    chemicalPeelText: '',
    laserTreatments: false,
    laserTreatmentsText: '',
    botoxDermal: false,
    botoxDermalText: '',
    waxDepilatory: false,
    waxDepilatoryText: '',
    
    // Medical History
    familyPhysician: '',
    weight: '',
    height: '',
    pastIllnessSurgery: '',
    medications: '',
    currentConditions: '',
    specialistTreatment: false,
    specialistTreatmentText: '',
    pregnant: false,
    pregnantText: '',
    smoker: false,
    cigarettesPerDay: '',
    
    // Medical Conditions
    medicalConditions: [],
    allergiesDetail: '',
    severeAllergicDetail: '',
    neurologicalDetail: '',
    otherMedical: false,
    otherMedicalText: '',
    
    // Sun History
    sunExposure: '',
    tanning: false,
    tanningText: '',
    sunscreen: false,
    sunscreenSPF: '',
    
    // Consents
    botoxConsent: '',
    fillerConsent: '',
    photoConsent: '',
  })

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field, value) => {
    setFormData(prev => {
      const arr = prev[field] || []
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) }
      } else {
        return { ...prev, [field]: [...arr, value] }
      }
    })
  }

  const handleContinue = () => {
    setShowTypeModal(false)
  }

  const validateForm = () => {
    const errs = []
    
    // Required fields for both types
    if (!formData.firstName.trim()) errs.push('First name is required')
    if (!formData.lastName.trim()) errs.push('Last name is required')
    if (!formData.birthday) errs.push('Birthday is required')
    
    // Additional required fields for full registration
    if (registrationType === 'full') {
      if (!formData.genderIdentity) errs.push('Gender identity is required')
      if (!formData.sexAtBirth) errs.push('Sex assigned at birth is required')
      if (!formData.ethnicity) errs.push('Ethnicity is required')
      if (!formData.email.trim()) errs.push('Email is required')
      if (!formData.cellPhone.trim()) errs.push('Cell phone is required')
      if (!formData.country) errs.push('Country is required')
      if (!formData.province) errs.push('Province/State is required')
      if (!formData.address.trim()) errs.push('Address is required')
      if (!formData.city.trim()) errs.push('City is required')
      if (!formData.postalCode.trim()) errs.push('Postal code is required')
      
      // Consent validation
      if (selectedConsents.botox && !formData.botoxConsent) errs.push('Please accept or decline Botox consent')
      if (selectedConsents.filler && !formData.fillerConsent) errs.push('Please accept or decline Filler consent')
      if (selectedConsents.photo && !formData.photoConsent) errs.push('Please accept or decline Photo consent')
    }
    
    setErrors(errs)
    return errs.length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    setSaving(true)
    
    try {
      // Préparer les données patient
      const patientData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email || null,
        phone: formData.cellPhone || null,
        birthdate: formData.birthday || null,
        user_id: session.user.id,
        clinic_id: userClinic?.id || null,
        // Stocker les données additionnelles en JSON
        metadata: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          genderIdentity: formData.genderIdentity,
          sexAtBirth: formData.sexAtBirth,
          ethnicity: formData.ethnicity,
          homePhone: formData.homePhone,
          workPhone: formData.workPhone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          country: formData.country,
          postalCode: formData.postalCode,
          referrals: formData.referrals,
          interests: formData.interests,
          skinHistory: {
            products: formData.skinProducts,
            sensitivities: formData.skinSensitivities ? formData.skinSensitivitiesText : null,
            vitaminA: formData.vitaminA ? formData.vitaminAText : null,
            accutane: formData.accutane ? formData.accutaneText : null,
            chemicalPeel: formData.chemicalPeel ? formData.chemicalPeelText : null,
            laser: formData.laserTreatments ? formData.laserTreatmentsText : null,
            botoxDermal: formData.botoxDermal ? formData.botoxDermalText : null,
            waxDepilatory: formData.waxDepilatory ? formData.waxDepilatoryText : null,
          },
          medicalHistory: {
            physician: formData.familyPhysician,
            weight: formData.weight,
            height: formData.height,
            pastIllness: formData.pastIllnessSurgery,
            medications: formData.medications,
            conditions: formData.currentConditions,
            specialistTreatment: formData.specialistTreatment ? formData.specialistTreatmentText : null,
            pregnant: formData.pregnant ? formData.pregnantText : null,
            smoker: formData.smoker ? formData.cigarettesPerDay : null,
          },
          medicalConditions: formData.medicalConditions,
          sunHistory: {
            exposure: formData.sunExposure,
            tanning: formData.tanning ? formData.tanningText : null,
            sunscreen: formData.sunscreen ? formData.sunscreenSPF : null,
          },
          consents: {
            botox: formData.botoxConsent === 'accept',
            filler: formData.fillerConsent === 'accept',
            photo: formData.photoConsent === 'accept',
            timestamp: new Date().toISOString(),
          },
          registrationType: registrationType,
        }
      }
      
      const { error } = await supabase
        .from('patients')
        .insert([patientData])
      
      if (error) throw error
      
      alert('Patient inscrit avec succès !')
      onComplete()
      
    } catch (error) {
      console.error('Error:', error)
      setErrors([error.message])
    } finally {
      setSaving(false)
    }
  }

  // Styles communs
  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    marginBottom: '1rem',
    overflow: 'hidden'
  }
  
  const cardHeaderStyle = {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-sidebar)'
  }
  
  const cardBodyStyle = {
    padding: '1.25rem'
  }
  
  const sectionTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
  }

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)'
  }

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-secondary)'
  }

  const requiredStyle = {
    color: 'var(--danger)',
    marginLeft: '4px'
  }

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem'
  }

  const isFullReg = registrationType === 'full'
  const showSection = (section) => {
    if (registrationType === 'quick') {
      return QUICK_REG_SECTIONS.includes(section)
    }
    return FULL_REG_SECTIONS.includes(section)
  }

  // Modal de sélection du type
  const renderTypeModal = () => (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Inscription patient</h2>
        </div>
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* Registration Type */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', marginBottom: '0.75rem', display: 'block' }}>
              Type d'inscription :
            </label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="regType"
                  checked={registrationType === 'full'}
                  onChange={() => setRegistrationType('full')}
                />
                Inscription complète
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="regType"
                  checked={registrationType === 'quick'}
                  onChange={() => setRegistrationType('quick')}
                />
                Inscription rapide
              </label>
            </div>
          </div>

          {/* Consent Forms Selection */}
          <div>
            <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Formulaires de consentement :
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Sélectionnez les formulaires de consentement à joindre à l'inscription du patient.
            </p>
            
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={selectedConsents.botox}
                onChange={(e) => setSelectedConsents(prev => ({ ...prev, botox: e.target.checked }))}
              />
              Consentement Toxine Botulique
            </label>
            
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={selectedConsents.filler}
                onChange={(e) => setSelectedConsents(prev => ({ ...prev, filler: e.target.checked }))}
              />
              Consentement Agents de Comblement
            </label>
            
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={selectedConsents.photo}
                onChange={(e) => setSelectedConsents(prev => ({ ...prev, photo: e.target.checked }))}
              />
              Consentement Photo
            </label>
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-outline" onClick={onBack}>Annuler</button>
          <button className="btn btn-primary" onClick={handleContinue}>Continuer</button>
        </div>
      </div>
    </div>
  )

  if (showTypeModal) {
    return renderTypeModal()
  }

  return (
    <div>
      {/* Header */}
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}> Patients</a> | 
        Inscription
      </div>
      <h1 className="page-title">INSCRIPTION PATIENT</h1>

      {/* Type Toggle */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        padding: '0.75rem 1rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}>
        <span style={{ fontWeight: '500' }}>Type :</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name="regTypeInline"
            checked={registrationType === 'full'}
            onChange={() => setRegistrationType('full')}
          />
          Inscription complète
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name="regTypeInline"
            checked={registrationType === 'quick'}
            onChange={() => setRegistrationType('quick')}
          />
          Inscription rapide
        </label>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--danger)' }}>
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        
        {/* LEFT COLUMN */}
        <div>
          {/* Logo/Clinic Card */}
          <div style={cardStyle}>
            <div style={{ ...cardBodyStyle, textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '600', 
                color: 'var(--primary)',
                marginBottom: '0.5rem'
              }}>
                FaceHub
              </div>
              {userClinic && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {userClinic.name}
                </div>
              )}
            </div>
          </div>

          {/* Personal Details */}
          {showSection('personal-details') && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Personal Details</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>
                      First Name <span style={requiredStyle}>*</span>
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Last Name <span style={requiredStyle}>*</span>
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                  
                  {isFullReg && (
                    <>
                      <div>
                        <label style={labelStyle}>
                          Gender Identity <span style={requiredStyle}>*</span>
                        </label>
                        <select
                          style={selectStyle}
                          value={formData.genderIdentity}
                          onChange={(e) => updateField('genderIdentity', e.target.value)}
                        >
                          <option value="">Select...</option>
                          {GENDER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>
                          Sex Assigned at Birth <span style={requiredStyle}>*</span>
                        </label>
                        <select
                          style={selectStyle}
                          value={formData.sexAtBirth}
                          onChange={(e) => updateField('sexAtBirth', e.target.value)}
                        >
                          <option value="">Select...</option>
                          {SEX_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label style={labelStyle}>
                      Birthday <span style={requiredStyle}>*</span>
                    </label>
                    <input
                      type="date"
                      style={inputStyle}
                      value={formData.birthday}
                      onChange={(e) => updateField('birthday', e.target.value)}
                    />
                  </div>
                  
                  {isFullReg && (
                    <div>
                      <label style={labelStyle}>
                        Ethnicity <span style={requiredStyle}>*</span>
                      </label>
                      <select
                        style={selectStyle}
                        value={formData.ethnicity}
                        onChange={(e) => updateField('ethnicity', e.target.value)}
                      >
                        <option value="">Select...</option>
                        {ETHNICITY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {showSection('contact-information') && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Contact Information</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>
                      Email <span style={requiredStyle}>*</span>
                    </label>
                    <input
                      type="email"
                      style={inputStyle}
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Cell Phone <span style={requiredStyle}>*</span>
                    </label>
                    <input
                      type="tel"
                      style={inputStyle}
                      value={formData.cellPhone}
                      onChange={(e) => updateField('cellPhone', e.target.value)}
                      placeholder="(000) 000-0000"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Home Phone</label>
                    <input
                      type="tel"
                      style={inputStyle}
                      value={formData.homePhone}
                      onChange={(e) => updateField('homePhone', e.target.value)}
                      placeholder="(000) 000-0000"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Work Phone</label>
                    <input
                      type="tel"
                      style={inputStyle}
                      value={formData.workPhone}
                      onChange={(e) => updateField('workPhone', e.target.value)}
                      placeholder="(000) 000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mailing Address */}
          {showSection('mailing-address') && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Mailing Address</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>
                      Country <span style={requiredStyle}>*</span>
                    </label>
                    <select
                      style={selectStyle}
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                    >
                      {COUNTRY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>
                      {formData.country === 'US' ? 'State' : 'Province'} <span style={requiredStyle}>*</span>
                    </label>
                    <select
                      style={selectStyle}
                      value={formData.province}
                      onChange={(e) => updateField('province', e.target.value)}
                    >
                      <option value="">Select...</option>
                      {PROVINCE_OPTIONS.map(group => (
                        <optgroup key={group.group} label={group.group}>
                          {group.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>
                      Address <span style={requiredStyle}>*</span>
                    </label>
                    <textarea
                      style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Enter mailing address"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      City <span style={requiredStyle}>*</span>
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      {formData.country === 'US' ? 'Zip Code' : 'Postal Code'} <span style={requiredStyle}>*</span>
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      placeholder={formData.country === 'US' ? 'Enter zip code' : 'Enter postal code'}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Your Visit */}
          {showSection('about-visit') && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>About Your Visit</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '1rem' }}>How did you hear about us?</label>
                    {REFERRAL_OPTIONS.map(opt => (
                      <label key={opt} style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          checked={formData.referrals.includes(opt)}
                          onChange={() => toggleArrayField('referrals', opt)}
                        />
                        {opt}
                      </label>
                    ))}
                    <label style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.referrals.includes('Other')}
                        onChange={() => toggleArrayField('referrals', 'Other')}
                      />
                      Other
                    </label>
                    {formData.referrals.includes('Other') && (
                      <input
                        type="text"
                        style={{ ...inputStyle, marginTop: '0.5rem' }}
                        value={formData.referralOther}
                        onChange={(e) => updateField('referralOther', e.target.value)}
                        placeholder="Please specify"
                      />
                    )}
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '1rem' }}>What are you interested in?</label>
                    {INTEREST_OPTIONS.map(opt => (
                      <label key={opt} style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(opt)}
                          onChange={() => toggleArrayField('interests', opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skin History */}
          {showSection('skin-history') && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Skin History</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>What products are you currently using on your skin:</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    value={formData.skinProducts}
                    onChange={(e) => updateField('skinProducts', e.target.value)}
                  />
                </div>
                
                {[
                  { field: 'skinSensitivities', textField: 'skinSensitivitiesText', label: 'Do you have any particular skin sensitivities?' },
                  { field: 'vitaminA', textField: 'vitaminAText', label: 'Have you ever used (or are currently using) Vitamin A or glycolic acid?' },
                  { field: 'accutane', textField: 'accutaneText', label: 'Have you ever used (or are currently using) Accutane?' },
                  { field: 'chemicalPeel', textField: 'chemicalPeelText', label: 'Have you ever had a chemical peel?' },
                  { field: 'laserTreatments', textField: 'laserTreatmentsText', label: 'Have you had laser treatments in the past?' },
                  { field: 'botoxDermal', textField: 'botoxDermalText', label: 'Have you ever had botulinum toxin or dermal fillers?' },
                  { field: 'waxDepilatory', textField: 'waxDepilatoryText', label: 'Have you waxed or used a depilatory?' },
                ].map(item => (
                  <div key={item.field} style={{ marginBottom: '0.75rem' }}>
                    <label style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData[item.field]}
                        onChange={(e) => updateField(item.field, e.target.checked)}
                      />
                      {item.label}
                    </label>
                    {formData[item.field] && (
                      <textarea
                        style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', marginTop: '0.5rem' }}
                        value={formData[item.textField]}
                        onChange={(e) => updateField(item.textField, e.target.value)}
                        placeholder="Please specify further"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sun History */}
          {showSection('sun-history') && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Sun History</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>With sun exposure, how does your skin respond?</label>
                  <select
                    style={selectStyle}
                    value={formData.sunExposure}
                    onChange={(e) => updateField('sunExposure', e.target.value)}
                  >
                    <option value="">Select...</option>
                    {SUN_EXPOSURE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={formData.tanning}
                      onChange={(e) => updateField('tanning', e.target.checked)}
                    />
                    Do you sunbathe, use self-tanning lotions, sprays or use tanning beds?
                  </label>
                  {formData.tanning && (
                    <textarea
                      style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', marginTop: '0.5rem' }}
                      value={formData.tanningText}
                      onChange={(e) => updateField('tanningText', e.target.value)}
                      placeholder="Please specify further"
                    />
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ ...checkboxLabelStyle, marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.sunscreen}
                      onChange={(e) => updateField('sunscreen', e.target.checked)}
                    />
                    Do you use sunscreen?
                  </label>
                  {formData.sunscreen && (
                    <input
                      type="text"
                      style={{ ...inputStyle, width: '150px' }}
                      value={formData.sunscreenSPF}
                      onChange={(e) => updateField('sunscreenSPF', e.target.value)}
                      placeholder="What SPF?"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Medical Conditions */}
          {showSection('medical-conditions') && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Medical Conditions</h3>
              </div>
              <div style={cardBodyStyle}>
                <label style={{ ...labelStyle, marginBottom: '1rem' }}>
                  Do you have any of the following medical conditions?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
                  {MEDICAL_CONDITIONS.map(condition => (
                    <label key={condition} style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.medicalConditions.includes(condition)}
                        onChange={() => toggleArrayField('medicalConditions', condition)}
                      />
                      {condition}
                    </label>
                  ))}
                </div>
                
                {formData.medicalConditions.includes('Allergies') && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={labelStyle}>Please list any allergies:</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.allergiesDetail}
                      onChange={(e) => updateField('allergiesDetail', e.target.value)}
                      placeholder="List allergies"
                    />
                  </div>
                )}
                
                <div style={{ marginTop: '1rem' }}>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={formData.otherMedical}
                      onChange={(e) => updateField('otherMedical', e.target.checked)}
                    />
                    Other
                  </label>
                  {formData.otherMedical && (
                    <input
                      type="text"
                      style={{ ...inputStyle, marginTop: '0.5rem' }}
                      value={formData.otherMedicalText}
                      onChange={(e) => updateField('otherMedicalText', e.target.value)}
                      placeholder="Please specify"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Medical History */}
          {showSection('medical-history') && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Medical History</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Family Physician</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.familyPhysician}
                      onChange={(e) => updateField('familyPhysician', e.target.value)}
                      placeholder="Physician's name"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Weight</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.weight}
                      onChange={(e) => updateField('weight', e.target.value)}
                      placeholder="Weight"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Height</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={formData.height}
                      onChange={(e) => updateField('height', e.target.value)}
                      placeholder="Height"
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Please list any past illnesses as well as all minor or major surgeries:</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    value={formData.pastIllnessSurgery}
                    onChange={(e) => updateField('pastIllnessSurgery', e.target.value)}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Please list all current medications:</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    value={formData.medications}
                    onChange={(e) => updateField('medications', e.target.value)}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>If you are currently being treated for any conditions, please specify:</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    value={formData.currentConditions}
                    onChange={(e) => updateField('currentConditions', e.target.value)}
                  />
                </div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={formData.specialistTreatment}
                      onChange={(e) => updateField('specialistTreatment', e.target.checked)}
                    />
                    Are you currently or have you ever received treatment from an endocrinologist, dermatologist or plastic surgeon?
                  </label>
                  {formData.specialistTreatment && (
                    <textarea
                      style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', marginTop: '0.5rem' }}
                      value={formData.specialistTreatmentText}
                      onChange={(e) => updateField('specialistTreatmentText', e.target.value)}
                      placeholder="Please specify"
                    />
                  )}
                </div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={formData.pregnant}
                      onChange={(e) => updateField('pregnant', e.target.checked)}
                    />
                    Are you currently pregnant, breastfeeding or do you plan to become pregnant in the next year?
                  </label>
                  {formData.pregnant && (
                    <textarea
                      style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', marginTop: '0.5rem' }}
                      value={formData.pregnantText}
                      onChange={(e) => updateField('pregnantText', e.target.value)}
                      placeholder="Please specify"
                    />
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ ...checkboxLabelStyle, marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.smoker}
                      onChange={(e) => updateField('smoker', e.target.checked)}
                    />
                    Do you smoke?
                  </label>
                  {formData.smoker && (
                    <input
                      type="text"
                      style={{ ...inputStyle, width: '180px' }}
                      value={formData.cigarettesPerDay}
                      onChange={(e) => updateField('cigarettesPerDay', e.target.value)}
                      placeholder="Cigarettes per day"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Consent Forms */}
          {isFullReg && selectedConsents.botox && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Botulinum Toxin Consent</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ 
                  maxHeight: '180px', 
                  overflowY: 'auto', 
                  padding: '1rem',
                  background: 'var(--bg-input)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  <p>1. I am aware that when small amounts of purified botulinum toxin are injected into a muscle, the muscle is weakened. This effect appears in 12 - 14 days and usually lasts approximately 3 - 4 months.</p>
                  <p>2. I understand that this treatment will reduce or eliminate my ability to "frown" and/or produce "crow's feet" or forehead "worry lines" while the injection is effective, but that this will reverse itself after a period of months at which time re-treatment is appropriate.</p>
                  <p>3. I understand that I must stay in the erect position and may not manipulate the area of injection or participate in strenuous activity for 4 hours after treatment.</p>
                  <p>4. I agree to return for a follow up visit 10 to 14 days from my treatment.</p>
                  <p>5. I have been made aware of alternative methods of treatment.</p>
                  <p>6. To my knowledge, I am not pregnant and do not have any significant neurologic or muscular disease.</p>
                </div>
                <select
                  style={selectStyle}
                  value={formData.botoxConsent}
                  onChange={(e) => updateField('botoxConsent', e.target.value)}
                >
                  <option value="">Choose an option</option>
                  <option value="accept">Accept</option>
                  <option value="decline">Do not accept</option>
                </select>
              </div>
            </div>
          )}

          {isFullReg && selectedConsents.filler && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Dermal Filler Consent</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ 
                  maxHeight: '180px', 
                  overflowY: 'auto', 
                  padding: '1rem',
                  background: 'var(--bg-input)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  <p>I acknowledge that this treatment has been fully explained to me and that I have had the opportunity to ask questions that have been answered to my satisfaction.</p>
                  <p>I have been specifically informed of the following:</p>
                  <ul>
                    <li>Dermal Filler is a transparent, bio-resorbable gel for injection into the skin to correct wrinkles and folds on the face and for lip enhancement.</li>
                    <li>After the injection, some common injection-related reactions might occur, such as swelling, redness, pain, itching, discoloration, and tenderness at the injection site.</li>
                    <li>Very rarely, lumps, abscesses and indurations have been reported after injection.</li>
                  </ul>
                  <p>I understand the procedure and accept the risks and request that this procedure be performed on me.</p>
                </div>
                <select
                  style={selectStyle}
                  value={formData.fillerConsent}
                  onChange={(e) => updateField('fillerConsent', e.target.value)}
                >
                  <option value="">Choose an option</option>
                  <option value="accept">Accept</option>
                  <option value="decline">Do not accept</option>
                </select>
              </div>
            </div>
          )}

          {isFullReg && selectedConsents.photo && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={sectionTitleStyle}>Photo Consent</h3>
              </div>
              <div style={cardBodyStyle}>
                <div style={{ 
                  maxHeight: '180px', 
                  overflowY: 'auto', 
                  padding: '1rem',
                  background: 'var(--bg-input)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  <p>Do you consent to having your photographs used for patient education and marketing purposes?</p>
                  <p>I consent to photographs being taken to evaluate treatment effectiveness, for medical education, training, professional publications, or sales purposes. No photographs revealing my identity will be used without my written consent.</p>
                </div>
                <select
                  style={selectStyle}
                  value={formData.photoConsent}
                  onChange={(e) => updateField('photoConsent', e.target.value)}
                >
                  <option value="">Choose an option</option>
                  <option value="accept">Accept</option>
                  <option value="decline">Do not accept</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Required field note */}
      <div style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
        * indicates required field
      </div>

      {/* Submit Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border)'
      }}>
        <button 
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saving}
          style={{ minWidth: '150px' }}
        >
          {saving ? 'Registering...' : 'Register'}
        </button>
      </div>

      {/* Copyright */}
      <div className="copyright">
        Copyright © {new Date().getFullYear()} FaceHub
      </div>
    </div>
  )
}
