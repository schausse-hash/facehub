import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

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
  'Caucasian', 'African American/Black', 'Hispanic/Latino', 'Asian',
  'Middle Eastern', 'Pacific Islander', 'Native American/Alaskan', 'Other'
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
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' },
  ]},
  { group: 'States', options: [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
  ]},
]

const REFERRAL_OPTIONS = [
  "Doctor's referral", "Friend or current patient", "Seminar or Tradeshow",
  "Newspaper", "Website or Internet", "Promotion or Coupon",
  "Yellow Pages", "Magazine", "Walk by"
]

const INTEREST_OPTIONS = [
  "Treating fine lines & wrinkles", "Treating facial volume loss",
  "Treating gummy smiles", "Treating uneven lip position",
  "Treating migraine/headaches", "Treating TMD/TMJ",
  "Treatment of age spots", "Improving skin tone",
  "Treating stubborn body fat", "Hair removal", "Smile makeover"
]

const MEDICAL_CONDITIONS_LEFT = [
  "Acne", "Allergies", "ALS", "Arthritis", "Asthma", "Autoimmune disorder",
  "Blood disorder", "Cancer (or radiation therapy)", "Cow's milk protein allergy",
  "Diabetes (or diabetic neuropathy)", "Epilepsy", "Guillain barre syndrome",
  "Herpes (or cold sores)", "Hirsutism", "Hormonal imbalance"
]

const MEDICAL_CONDITIONS_RIGHT = [
  "Keloid scars (or other scars)", "Kidney disease", "Local anesthetic sensitivity",
  "Melanoma", "Myasthenia gravis", "Polycystic ovarian syndrome",
  "Port wine stain", "Psoriasis", "Severe allergic reactions",
  "Steroids (or hormonal therapy)", "Shingles", "Significant neurological disease",
  "Skin pigmentation", "Vitiligo"
]

const SUN_EXPOSURE_OPTIONS = [
  "Always burn, never tan", "Usually burn, tan with difficulty",
  "Almost never burn, tan very easily", "Sometimes burn, tan about average",
  "Rarely burn, tan easily", "Never burn, always tan"
]

// Textes des consentements
const CONSENT_TEXTS = {
  botox: `<p>1. I am aware that when small amounts of purified botulinum toxin are injected into a muscle, the muscle is weakened. This effect appears in 12 - 14 days and usually lasts approximately 3 - 4 months.</p>
<p>2. I understand that this treatment will reduce or eliminate my ability to "frown" and/or produce "crow's feet" or forehead "worry lines" while the injection is effective, but that this will reverse itself after a period of months at which time re-treatment is appropriate.</p>
<p>3. I understand that I must stay in the erect position and may not manipulate the area of injection or participate in strenuous activity for 4 hours after treatment. I also understand that I must exercise the treated muscles for 2 hours after treatment.</p>
<p>4. I agree to return for a follow up visit 10 to 14 days from my treatment.</p>
<p>5. I have been made aware of alternative methods of treatment.</p>
<p>6. To my knowledge, I am not pregnant and do not have any significant neuralgic or muscular disease.</p>
<p>7. I have had the opportunity to ask questions, and they have been answered to my satisfaction.</p>
<p>8. I consent to photographs being taken to evaluate treatment effectiveness, for medical education, training, professional publications, or sales purposes. No photographs revealing my identity will be used without my written consent. If my identity is not revealed, these photographs may be used without my permission.</p>
<p>9. I agree to being governed by the laws and statutes of British Columbia, Canada.</p>`,
  
  filler: `<p>I acknowledge that this treatment has been fully explained to me and that I have had the opportunity to ask questions that have been answered to my satisfaction.</p>
<p>I have been specifically informed of the following:</p>
<ul>
<li>Dermal Filler is a transparent, bio-resorbable gel consisting of non-animal cross-linked hyaluronic acid for injection into the skin to correct wrinkles and folds on the face and for lip enhancement.</li>
<li>After the injection, some common injection-related reactions might occur, such as swelling, redness, pain, itching, discoloration, and tenderness at the injection site. They typically resolve within 1 to 2 days after injection into the skin and within a week after the injections into the lips.</li>
<li>Very rarely, lumps, abscesses and indurations - sometimes associated with redness and swelling - have been reported after injection. Such reactions may develop days or weeks after injection. In all cases, these side effects disappear with treatment although, in some patients, they may last longer for a few months.</li>
</ul>
<p>I have been informed that depending on the site of injection, skin type, the amount injected and the injection technique, dermal fillers can last for an average of 6 to 9 months (lips: up to 6 months). In some cases the duration of the effect can be shorter or even longer.</p>
<p>I agree to being governed by the laws and statutes of British Columbia.</p>
<p>I understand the procedure and accept the risks and request that this procedure be performed on me.</p>`,
  
  photo: `<p>Do you consent to having your photographs used for patient education and marketing purposes?</p>`
}

export default function PublicRegistration({ token }) {
  // États
  const [loading, setLoading] = useState(true)
  const [linkData, setLinkData] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState([])
  const [clinicInfo, setClinicInfo] = useState(null)
  const [quickRegister, setQuickRegister] = useState(false)

  // Données du formulaire
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', genderIdentity: '', genderOther: '',
    sexAtBirth: '', sexOther: '', birthday: '', ethnicity: '',
    email: '', cellPhone: '', homePhone: '', workPhone: '',
    country: 'CA', province: '', address: '', city: '', postalCode: '',
    referrals: [], referralOther: '', showReferralOther: false,
    interests: [],
    skinProducts: '',
    skinSensitivities: false, skinSensitivitiesText: '',
    vitaminA: false, vitaminAText: '',
    accutane: false, accutaneText: '',
    chemicalPeel: false, chemicalPeelText: '',
    laserTreatments: false, laserTreatmentsText: '',
    botoxDermal: false, botoxDermalText: '',
    waxDepilatory: false, waxDepilatoryText: '',
    familyPhysician: '', weight: '', height: '',
    pastIllnessSurgery: '', medications: '', currentConditions: '',
    specialistTreatment: false, specialistTreatmentText: '',
    pregnant: false, pregnantText: '',
    smoker: false, cigarettesPerDay: '',
    medicalConditions: [],
    allergiesDetail: '', severeAllergicDetail: '', neurologicalDetail: '',
    otherMedical: false, otherMedicalText: '',
    sunExposure: '',
    tanning: false, tanningText: '',
    sunscreen: false, sunscreenSPF: '',
    botoxConsent: '', fillerConsent: '', photoConsent: '',
  })

  // Vérifier le token au chargement
  useEffect(() => {
    validateToken()
  }, [token])

  const validateToken = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('registration_links')
        .select('*, clinics(*)')
        .eq('token', token)
        .single()

      if (error || !data) {
        setError('invalid')
        setLoading(false)
        return
      }

      if (data.used) {
        setError('used')
        setLoading(false)
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('expired')
        setLoading(false)
        return
      }

      setLinkData(data)
      setClinicInfo(data.clinics)
      setQuickRegister(data.registration_type === 'quick')
      setLoading(false)

    } catch (err) {
      console.error('Error validating token:', err)
      setError('invalid')
      setLoading(false)
    }
  }

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

  const validateForm = () => {
    const errs = []
    
    if (!formData.firstName.trim()) errs.push('First name is required')
    if (!formData.lastName.trim()) errs.push('Last name is required')
    if (!formData.birthday) errs.push('Birthday is required')
    
    if (!quickRegister) {
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
      
      if (linkData?.consents?.botox && !formData.botoxConsent) 
        errs.push('Please accept or decline Botulinum Toxin Consent')
      if (linkData?.consents?.filler && !formData.fillerConsent) 
        errs.push('Please accept or decline Dermal Filler Consent')
      if (linkData?.consents?.photo && !formData.photoConsent) 
        errs.push('Please accept or decline Photo Consent')
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
      const patientData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email || null,
        phone: formData.cellPhone || null,
        birthdate: formData.birthday || null,
        clinic_id: linkData?.clinic_id || null,
        user_id: linkData?.created_by || null,  // Utilise le créateur du lien comme user_id
        metadata: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          genderIdentity: formData.genderIdentity,
          sexAtBirth: formData.sexAtBirth,
          ethnicity: formData.ethnicity,
          contact: {
            email: formData.email,
            cellPhone: formData.cellPhone,
            homePhone: formData.homePhone,
            workPhone: formData.workPhone,
          },
          address: {
            country: formData.country,
            province: formData.province,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
          },
          aboutVisit: {
            referrals: formData.referrals,
            referralOther: formData.referralOther,
            interests: formData.interests,
          },
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
            smoker: formData.smoker,
            cigarettesPerDay: formData.cigarettesPerDay,
          },
          medicalConditions: formData.medicalConditions,
          allergiesDetail: formData.allergiesDetail,
          severeAllergicDetail: formData.severeAllergicDetail,
          neurologicalDetail: formData.neurologicalDetail,
          otherMedical: formData.otherMedical ? formData.otherMedicalText : null,
          sunHistory: {
            exposure: formData.sunExposure,
            tanning: formData.tanning ? formData.tanningText : null,
            sunscreen: formData.sunscreen,
            sunscreenSPF: formData.sunscreenSPF,
          },
          consents: {
            botox: formData.botoxConsent === 'accept',
            filler: formData.fillerConsent === 'accept',
            photo: formData.photoConsent === 'accept',
            timestamp: new Date().toISOString(),
          },
          registrationType: quickRegister ? 'quick' : 'full',
          registeredViaLink: true,
          registrationToken: token,
        }
      }
      
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single()
      
      if (patientError) throw patientError
      
      await supabase
        .from('registration_links')
        .update({ 
          used: true, 
          used_at: new Date().toISOString(),
          patient_id: patient.id 
        })
        .eq('token', token)
      
      setSuccess(true)
      
    } catch (error) {
      console.error('Error:', error)
      setErrors([error.message])
    } finally {
      setSaving(false)
    }
  }

  // ===================== STYLES =====================
  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f5f5f5',
      paddingBottom: '2rem'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    header: {
      padding: '2rem 0',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#333',
      margin: 0
    },
    typeSelector: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      marginBottom: '1rem'
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      color: '#333'
    },
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    card: {
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '1rem',
      overflow: 'hidden'
    },
    cardBody: {
      padding: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#333',
      marginBottom: '1.5rem',
      paddingBottom: '0.75rem',
      borderBottom: '2px solid #5a9a9c'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#555'
    },
    required: {
      color: '#dc3545',
      marginLeft: '4px'
    },
    input: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '0.875rem',
      background: '#fff',
      color: '#333',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '0.875rem',
      background: '#fff',
      color: '#333',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '0.875rem',
      background: '#fff',
      color: '#333',
      resize: 'vertical',
      minHeight: '80px',
      boxSizing: 'border-box'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
      color: '#333'
    },
    checkboxInput: {
      marginTop: '3px',
      cursor: 'pointer'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    consentBox: {
      maxHeight: '180px',
      overflowY: 'auto',
      padding: '1rem',
      background: '#f9f9f9',
      border: '1px solid #eee',
      borderRadius: '4px',
      marginBottom: '1rem',
      fontSize: '0.85rem',
      lineHeight: '1.6',
      color: '#555'
    },
    errorBox: {
      background: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      padding: '1rem',
      marginBottom: '1rem',
      color: '#721c24'
    },
    submitBtn: {
      background: '#5a9a9c',
      color: '#fff',
      border: 'none',
      padding: '0.75rem 2rem',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    successBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem'
    },
    successIcon: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: '#d4edda',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      fontSize: '2.5rem',
      color: '#28a745'
    },
    logoCard: {
      background: '#1e2428',
      padding: '2rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    logoTitle: {
      color: '#fff',
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem'
    },
    logoImg: {
      maxWidth: '200px'
    }
  }

  // ===================== RENDER HELPERS =====================
  
  const renderInput = (name, label, required = false, type = 'text', placeholder = '') => (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      <input
        type={type}
        style={styles.input}
        value={formData[name]}
        onChange={(e) => updateField(name, e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      />
    </div>
  )

  const renderSelect = (name, label, options, required = false) => (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      <select
        style={styles.select}
        value={formData[name]}
        onChange={(e) => updateField(name, e.target.value)}
      >
        <option value="">Select...</option>
        {Array.isArray(options) && options[0]?.group ? (
          options.map(group => (
            <optgroup key={group.group} label={group.group}>
              {group.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </optgroup>
          ))
        ) : (
          options.map(opt => (
            typeof opt === 'string' 
              ? <option key={opt} value={opt}>{opt}</option>
              : <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))
        )}
      </select>
    </div>
  )

  const renderCheckboxWithText = (name, label, textName) => (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={styles.checkbox}>
        <input
          type="checkbox"
          style={styles.checkboxInput}
          checked={formData[name]}
          onChange={(e) => updateField(name, e.target.checked)}
        />
        <span>{label}</span>
      </label>
      {formData[name] && (
        <textarea
          style={{ ...styles.textarea, minHeight: '60px', marginTop: '0.5rem' }}
          value={formData[textName]}
          onChange={(e) => updateField(textName, e.target.value)}
          placeholder="Please specify further"
        />
      )}
    </div>
  )

  // ===================== LOADING STATE =====================
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.successBox, minHeight: '100vh' }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTopColor: '#5a9a9c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '1rem', color: '#666' }}>Chargement du formulaire d'inscription...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // ===================== ERROR STATES =====================
  if (error) {
    const errorMessages = {
      invalid: { title: 'Lien invalide', message: 'Ce lien d\'inscription est invalide ou n\'existe pas.' },
      used: { title: 'Lien déjà utilisé', message: 'Ce lien d\'inscription a déjà été utilisé. Chaque lien ne peut être utilisé qu\'une seule fois.' },
      expired: { title: 'Lien expiré', message: 'Ce lien d\'inscription a expiré. Veuillez contacter la clinique pour obtenir un nouveau lien.' }
    }
    const { title, message } = errorMessages[error] || errorMessages.invalid

    return (
      <div style={styles.page}>
        <div style={styles.successBox}>
          <div style={{ ...styles.successIcon, background: '#f8d7da', color: '#dc3545' }}>✕</div>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>{title}</h2>
          <p style={{ color: '#666', maxWidth: '400px' }}>{message}</p>
        </div>
      </div>
    )
  }

  // ===================== SUCCESS STATE =====================
  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>Inscription réussie</h2>
          <p style={{ color: '#666', maxWidth: '500px', marginBottom: '0.5rem' }}>
            Merci d'avoir pris le temps de vous inscrire. Nous avons reçu vos informations et les examinerons sous peu.
          </p>
          <p style={{ color: '#666', maxWidth: '500px' }}>
            Si des informations supplémentaires sont nécessaires, un membre de notre équipe vous contactera. Nous sommes heureux de vous compter parmi nous !
          </p>
        </div>
      </div>
    )
  }

  // ===================== MAIN FORM =====================
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Patient Registration</h1>
        </div>

        {/* Type Selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginRight: '1rem', fontWeight: '500', color: '#333' }}>Type:</label>
          <div style={styles.typeSelector}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="regType"
                checked={!quickRegister}
                onChange={() => setQuickRegister(false)}
              />
              Full Register
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="regType"
                checked={quickRegister}
                onChange={() => setQuickRegister(true)}
              />
              Quick Register
            </label>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div style={styles.errorBox}>
            <strong>Please correct the following errors:</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Two Column Layout */}
        <div style={styles.twoColumn}>
          {/* ============ LEFT COLUMN ============ */}
          <div>
            {/* Logo Card */}
            <div style={styles.logoCard}>
              <div style={styles.logoTitle}>{clinicInfo?.name || 'FaceHub'}</div>
              <div style={{ color: '#5a9a9c', fontSize: '2rem', fontWeight: '700' }}>FaceHub</div>
            </div>

            {/* Personal Details */}
            <div style={styles.card}>
              <div style={styles.cardBody}>
                <h3 style={styles.sectionTitle}>Personal Details</h3>
                <div style={styles.row}>
                  {renderInput('firstName', 'First Name', true)}
                  {renderInput('lastName', 'Last Name', true)}
                </div>
                {!quickRegister && (
                  <>
                    <div style={styles.row}>
                      {renderSelect('genderIdentity', 'Gender Identity', GENDER_OPTIONS, true)}
                      {renderSelect('sexAtBirth', 'Sex Assigned at Birth', SEX_OPTIONS, true)}
                    </div>
                  </>
                )}
                <div style={styles.row}>
                  {renderInput('birthday', 'Birthday', true, 'date')}
                  {!quickRegister && renderSelect('ethnicity', 'Ethnicity', ETHNICITY_OPTIONS, true)}
                </div>
                <small style={{ color: '#999' }}>Date Format: (MM/DD/YYYY)</small>
              </div>
            </div>

            {/* Contact Information - Full Only */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Contact Information</h3>
                  <div style={styles.row}>
                    {renderInput('email', 'Email', true, 'email')}
                    {renderInput('cellPhone', 'Cell Phone Number', true, 'tel')}
                  </div>
                  <div style={styles.row}>
                    {renderInput('homePhone', 'Home Phone Number', false, 'tel')}
                    {renderInput('workPhone', 'Work Phone Number', false, 'tel')}
                  </div>
                </div>
              </div>
            )}

            {/* Mailing Address - Full Only */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Mailing Address</h3>
                  <div style={styles.row}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Country<span style={styles.required}>*</span></label>
                      <select
                        style={styles.select}
                        value={formData.country}
                        onChange={(e) => updateField('country', e.target.value)}
                      >
                        <option value="CA">Canada</option>
                        <option value="US">United States</option>
                      </select>
                    </div>
                    {renderSelect('province', formData.country === 'US' ? 'State' : 'Province', PROVINCE_OPTIONS, true)}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Address<span style={styles.required}>*</span></label>
                    <textarea
                      style={styles.textarea}
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Enter mailing address"
                      rows="3"
                    />
                  </div>
                  <div style={styles.row}>
                    {renderInput('city', 'City', true)}
                    {renderInput('postalCode', formData.country === 'US' ? 'Zip Code' : 'Postal Code', true)}
                  </div>
                </div>
              </div>
            )}

            {/* About Your Visit - Full Only */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>About Your Visit</h3>
                  <div style={styles.row}>
                    <div>
                      <label style={{ ...styles.label, marginBottom: '1rem' }}>How did you hear about us?</label>
                      {REFERRAL_OPTIONS.map(opt => (
                        <label key={opt} style={styles.checkbox}>
                          <input
                            type="checkbox"
                            style={styles.checkboxInput}
                            checked={formData.referrals.includes(opt)}
                            onChange={() => toggleArrayField('referrals', opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                      <label style={styles.checkbox}>
                        <input
                          type="checkbox"
                          style={styles.checkboxInput}
                          checked={formData.showReferralOther}
                          onChange={(e) => updateField('showReferralOther', e.target.checked)}
                        />
                        <span>Other</span>
                      </label>
                      {formData.showReferralOther && (
                        <input
                          type="text"
                          style={{ ...styles.input, marginTop: '0.5rem' }}
                          value={formData.referralOther}
                          onChange={(e) => updateField('referralOther', e.target.value)}
                          placeholder="Please specify"
                        />
                      )}
                    </div>
                    <div>
                      <label style={{ ...styles.label, marginBottom: '1rem' }}>What are you interested in?</label>
                      {INTEREST_OPTIONS.map(opt => (
                        <label key={opt} style={styles.checkbox}>
                          <input
                            type="checkbox"
                            style={styles.checkboxInput}
                            checked={formData.interests.includes(opt)}
                            onChange={() => toggleArrayField('interests', opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skin History - Full Only */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Skin History</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>What products are you currently using on your skin:</label>
                    <textarea
                      style={styles.textarea}
                      value={formData.skinProducts}
                      onChange={(e) => updateField('skinProducts', e.target.value)}
                      rows="3"
                    />
                  </div>
                  {renderCheckboxWithText('skinSensitivities', 'Do you have any particular skin sensitivities?', 'skinSensitivitiesText')}
                  {renderCheckboxWithText('vitaminA', 'Have you ever used (or are currently using) Vitamin A or glycolic acid?', 'vitaminAText')}
                  {renderCheckboxWithText('accutane', 'Have you ever used (or are currently using) Accutane?', 'accutaneText')}
                  {renderCheckboxWithText('chemicalPeel', 'Have you ever had a chemical peel?', 'chemicalPeelText')}
                  {renderCheckboxWithText('laserTreatments', 'Have you had laser treatments in the past?', 'laserTreatmentsText')}
                  {renderCheckboxWithText('botoxDermal', 'Have you ever had botulinum toxin or dermal fillers?', 'botoxDermalText')}
                  {renderCheckboxWithText('waxDepilatory', 'Have you waxed or used a depilatory? If yes, specify treated areas.', 'waxDepilatoryText')}
                </div>
              </div>
            )}

            {/* Sun History - Full Only */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Sun History</h3>
                  {renderSelect('sunExposure', 'With sun exposure, how does your skin respond?', SUN_EXPOSURE_OPTIONS)}
                  {renderCheckboxWithText('tanning', 'Do you sunbathe, use self-tanning lotions, sprays or use tanning beds?', 'tanningText')}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        style={styles.checkboxInput}
                        checked={formData.sunscreen}
                        onChange={(e) => updateField('sunscreen', e.target.checked)}
                      />
                      <span>Do you use sunscreen?</span>
                    </label>
                    {formData.sunscreen && (
                      <input
                        type="text"
                        style={{ ...styles.input, width: '150px' }}
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

          {/* ============ RIGHT COLUMN ============ */}
          <div>
            {/* Medical Conditions - Full Only */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Medical Conditions</h3>
                  <label style={styles.label}>Do you have any of the following medical conditions?</label>
                  <div style={styles.row}>
                    <div>
                      {MEDICAL_CONDITIONS_LEFT.map(condition => {
                        if (condition === 'Allergies') {
                          return (
                            <div key={condition}>
                              <label style={styles.checkbox}>
                                <input
                                  type="checkbox"
                                  style={styles.checkboxInput}
                                  checked={formData.medicalConditions.includes(condition)}
                                  onChange={() => toggleArrayField('medicalConditions', condition)}
                                />
                                <span>{condition}</span>
                              </label>
                              {formData.medicalConditions.includes('Allergies') && (
                                <input
                                  type="text"
                                  style={{ ...styles.input, marginBottom: '0.5rem' }}
                                  value={formData.allergiesDetail}
                                  onChange={(e) => updateField('allergiesDetail', e.target.value)}
                                  placeholder="Please list any allergies"
                                />
                              )}
                            </div>
                          )
                        }
                        return (
                          <label key={condition} style={styles.checkbox}>
                            <input
                              type="checkbox"
                              style={styles.checkboxInput}
                              checked={formData.medicalConditions.includes(condition)}
                              onChange={() => toggleArrayField('medicalConditions', condition)}
                            />
                            <span>{condition}</span>
                          </label>
                        )
                      })}
                    </div>
                    <div>
                      {MEDICAL_CONDITIONS_RIGHT.map(condition => {
                        if (condition === 'Severe allergic reactions') {
                          return (
                            <div key={condition}>
                              <label style={styles.checkbox}>
                                <input
                                  type="checkbox"
                                  style={styles.checkboxInput}
                                  checked={formData.medicalConditions.includes(condition)}
                                  onChange={() => toggleArrayField('medicalConditions', condition)}
                                />
                                <span>{condition}</span>
                              </label>
                              {formData.medicalConditions.includes('Severe allergic reactions') && (
                                <input
                                  type="text"
                                  style={{ ...styles.input, marginBottom: '0.5rem' }}
                                  value={formData.severeAllergicDetail}
                                  onChange={(e) => updateField('severeAllergicDetail', e.target.value)}
                                  placeholder="Please specify"
                                />
                              )}
                            </div>
                          )
                        }
                        if (condition === 'Significant neurological disease') {
                          return (
                            <div key={condition}>
                              <label style={styles.checkbox}>
                                <input
                                  type="checkbox"
                                  style={styles.checkboxInput}
                                  checked={formData.medicalConditions.includes(condition)}
                                  onChange={() => toggleArrayField('medicalConditions', condition)}
                                />
                                <span>{condition}</span>
                              </label>
                              {formData.medicalConditions.includes('Significant neurological disease') && (
                                <input
                                  type="text"
                                  style={{ ...styles.input, marginBottom: '0.5rem' }}
                                  value={formData.neurologicalDetail}
                                  onChange={(e) => updateField('neurologicalDetail', e.target.value)}
                                  placeholder="Please specify"
                                />
                              )}
                            </div>
                          )
                        }
                        return (
                          <label key={condition} style={styles.checkbox}>
                            <input
                              type="checkbox"
                              style={styles.checkboxInput}
                              checked={formData.medicalConditions.includes(condition)}
                              onChange={() => toggleArrayField('medicalConditions', condition)}
                            />
                            <span>{condition}</span>
                          </label>
                        )
                      })}
                      <label style={styles.checkbox}>
                        <input
                          type="checkbox"
                          style={styles.checkboxInput}
                          checked={formData.otherMedical}
                          onChange={(e) => updateField('otherMedical', e.target.checked)}
                        />
                        <span>Other</span>
                      </label>
                      {formData.otherMedical && (
                        <input
                          type="text"
                          style={styles.input}
                          value={formData.otherMedicalText}
                          onChange={(e) => updateField('otherMedicalText', e.target.value)}
                          placeholder="Please specify"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Medical History - Full Only */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Medical History</h3>
                  <div style={styles.row}>
                    {renderInput('familyPhysician', 'Family Physician')}
                    <div style={styles.row}>
                      {renderInput('weight', 'Weight')}
                      {renderInput('height', 'Height')}
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Please list any past illnesses as well as all minor or major surgeries:</label>
                    <textarea
                      style={styles.textarea}
                      value={formData.pastIllnessSurgery}
                      onChange={(e) => updateField('pastIllnessSurgery', e.target.value)}
                      placeholder="Specify any past illnesses or surgeries"
                      rows="3"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Please list all current medications:</label>
                    <textarea
                      style={styles.textarea}
                      value={formData.medications}
                      onChange={(e) => updateField('medications', e.target.value)}
                      placeholder="Specify any medications you are currently taking"
                      rows="3"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>If you are currently being treated for any conditions, please specify:</label>
                    <textarea
                      style={styles.textarea}
                      value={formData.currentConditions}
                      onChange={(e) => updateField('currentConditions', e.target.value)}
                      placeholder="Specify any conditions you are being treated for"
                      rows="3"
                    />
                  </div>
                  {renderCheckboxWithText('specialistTreatment', 'Are you currently or have you ever received treatment from an endocrinologist, dermatologist or plastic surgeon?', 'specialistTreatmentText')}
                  {renderCheckboxWithText('pregnant', 'Are you currently pregnant, breastfeeding or do you plan to become pregnant in the next year?', 'pregnantText')}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        style={styles.checkboxInput}
                        checked={formData.smoker}
                        onChange={(e) => updateField('smoker', e.target.checked)}
                      />
                      <span>Do you smoke?</span>
                    </label>
                    {formData.smoker && (
                      <input
                        type="text"
                        style={{ ...styles.input, width: '200px' }}
                        value={formData.cigarettesPerDay}
                        onChange={(e) => updateField('cigarettesPerDay', e.target.value)}
                        placeholder="Cigarettes per day"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Consent Forms - Full Only */}
            {!quickRegister && linkData?.consents?.botox && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Botulinum Toxin Consent</h3>
                  <div style={styles.consentBox} dangerouslySetInnerHTML={{ __html: CONSENT_TEXTS.botox }} />
                  <div style={{ maxWidth: '200px' }}>
                    <select
                      style={styles.select}
                      value={formData.botoxConsent}
                      onChange={(e) => updateField('botoxConsent', e.target.value)}
                    >
                      <option value="">Choose an option</option>
                      <option value="accept">Accept</option>
                      <option value="decline">Do not accept</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {!quickRegister && linkData?.consents?.filler && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Dermal Filler Consent</h3>
                  <div style={styles.consentBox} dangerouslySetInnerHTML={{ __html: CONSENT_TEXTS.filler }} />
                  <div style={{ maxWidth: '200px' }}>
                    <select
                      style={styles.select}
                      value={formData.fillerConsent}
                      onChange={(e) => updateField('fillerConsent', e.target.value)}
                    >
                      <option value="">Choose an option</option>
                      <option value="accept">Accept</option>
                      <option value="decline">Do not accept</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {!quickRegister && linkData?.consents?.photo && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Photo Consent</h3>
                  <div style={styles.consentBox} dangerouslySetInnerHTML={{ __html: CONSENT_TEXTS.photo }} />
                  <div style={{ maxWidth: '200px' }}>
                    <select
                      style={styles.select}
                      value={formData.photoConsent}
                      onChange={(e) => updateField('photoConsent', e.target.value)}
                    >
                      <option value="">Choose an option</option>
                      <option value="accept">Accept</option>
                      <option value="decline">Do not accept</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Required Field Notice */}
        <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ color: '#dc3545' }}>*</span> indicates required field
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            style={styles.submitBtn}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block'
                }} />
                Registering...
              </>
            ) : 'Register'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .two-column { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
