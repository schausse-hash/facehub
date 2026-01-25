import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  User: () => <svg fill="currentColor" viewBox="0 0 24 24" width="80" height="80"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
}

// Options pour les selects
const GENDER_OPTIONS = [
  { value: '', label: 'Choose gender' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'transgender_female', label: 'Transgender Female' },
  { value: 'transgender_male', label: 'Transgender Male' },
  { value: 'gender_queer', label: 'Gender Queer' },
  { value: 'other', label: 'Other' },
]

const SEX_OPTIONS = [
  { value: '', label: 'Choose sex' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]

const ETHNICITY_OPTIONS = [
  { value: '', label: 'Choose ethnicity' },
  { value: 'Caucasian', label: 'Caucasian' },
  { value: 'African American/Black', label: 'African American/Black' },
  { value: 'Hispanic/Latino', label: 'Hispanic/Latino' },
  { value: 'Asian', label: 'Asian' },
  { value: 'Middle Eastern', label: 'Middle Eastern' },
  { value: 'Pacific Islander', label: 'Pacific Islander' },
  { value: 'Native American/Alaskan', label: 'Native American/Alaskan' },
  { value: 'Other', label: 'Other' },
]

const COUNTRY_OPTIONS = [
  { value: '', label: 'Choose country' },
  { value: 'CA', label: 'Canada' },
  { value: 'US', label: 'United States' },
]

const PROVINCE_OPTIONS = {
  CA: [
    { value: '', label: 'Choose province' },
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
  ],
  US: [
    { value: '', label: 'Choose state' },
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    { value: 'FL', label: 'Florida' },
    // Add more as needed
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
  "Doctor's referral", "Friend or current patient", "Seminar or Tradeshow",
  "Newspaper", "Website or Internet", "Promotion or Coupon", "Yellow Pages",
  "Magazine", "Walk by", "Other"
]

const INTEREST_OPTIONS = [
  "Treating fine lines & wrinkles", "Treating facial volume loss", "Treating gummy smiles",
  "Treating uneven lip position", "Treating migraine/headaches", "Treating TMD/TMJ",
  "Treatment of age spots", "Improving skin tone", "Treating stubborn body fat",
  "Hair removal", "Smile makeover"
]

export default function PatientEdit({ patient, onBack, onSave, session }) {
  const [registrationType, setRegistrationType] = useState('full')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    genderIdentity: '',
    sexAtBirth: '',
    birthday: '',
    ethnicity: '',
    // Contact Information
    email: '',
    cellPhone: '',
    homePhone: '',
    workPhone: '',
    // Mailing Address
    country: '',
    province: '',
    address: '',
    city: '',
    postalCode: '',
    // Medical History
    familyPhysician: '',
    weight: '',
    height: '',
    pastIllnesses: '',
    medications: '',
    conditions: '',
    // Medical Conditions (checkboxes)
    medicalConditions: [],
    allergiesDetail: '',
    // About Your Visit
    referrals: [],
    interests: [],
    // Skin History
    skinProducts: '',
    skinSensitivities: false,
    vitaminA: false,
    accutane: false,
    chemicalPeel: false,
    laserTreatments: false,
    botoxDermal: false,
    waxDepilatory: false,
    // Sun History
    sunExposure: '',
    tanning: false,
    sunscreen: false,
    sunscreenSPF: '',
    // Consents
    botoxConsent: '',
    fillerConsent: '',
    photoConsent: '',
  })

  useEffect(() => {
    if (patient) {
      const m = patient.metadata || {}
      setRegistrationType(m.registrationType || 'full')
      setForm({
        firstName: m.firstName || patient.name?.split(' ')[0] || '',
        lastName: m.lastName || patient.name?.split(' ').slice(1).join(' ') || '',
        genderIdentity: m.genderIdentity || '',
        sexAtBirth: m.sexAtBirth || '',
        birthday: patient.birthdate || m.birthday || '',
        ethnicity: m.ethnicity || '',
        email: m.contact?.email || patient.email || '',
        cellPhone: m.contact?.cellPhone || patient.phone || '',
        homePhone: m.contact?.homePhone || '',
        workPhone: m.contact?.workPhone || '',
        country: m.address?.country || '',
        province: m.address?.province || '',
        address: m.address?.street || '',
        city: m.address?.city || '',
        postalCode: m.address?.postalCode || '',
        familyPhysician: m.medicalHistory?.physician || '',
        weight: m.medicalHistory?.weight || '',
        height: m.medicalHistory?.height || '',
        pastIllnesses: m.medicalHistory?.pastIllnesses || '',
        medications: m.medicalHistory?.medications || '',
        conditions: m.medicalHistory?.conditions || '',
        medicalConditions: m.medicalConditions || [],
        allergiesDetail: m.allergiesDetail || '',
        referrals: m.aboutVisit?.referrals || [],
        interests: m.aboutVisit?.interests || [],
        skinProducts: m.skinHistory?.products || '',
        skinSensitivities: m.skinHistory?.sensitivities || false,
        vitaminA: m.skinHistory?.vitaminA || false,
        accutane: m.skinHistory?.accutane || false,
        chemicalPeel: m.skinHistory?.chemicalPeel || false,
        laserTreatments: m.skinHistory?.laserTreatments || false,
        botoxDermal: m.skinHistory?.botoxDermal || false,
        waxDepilatory: m.skinHistory?.waxDepilatory || false,
        sunExposure: m.sunHistory?.exposure || '',
        tanning: m.sunHistory?.tanning || false,
        sunscreen: m.sunHistory?.sunscreen || false,
        sunscreenSPF: m.sunHistory?.spf || '',
        botoxConsent: m.consents?.botox || '',
        fillerConsent: m.consents?.filler || '',
        photoConsent: m.consents?.photo || '',
      })
    }
  }, [patient])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxArray = (field, value, checked) => {
    setForm(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(v => v !== value)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    const metadata = {
      registrationType,
      firstName: form.firstName,
      lastName: form.lastName,
      genderIdentity: form.genderIdentity,
      sexAtBirth: form.sexAtBirth,
      birthday: form.birthday,
      ethnicity: form.ethnicity,
      contact: {
        email: form.email,
        cellPhone: form.cellPhone,
        homePhone: form.homePhone,
        workPhone: form.workPhone,
      },
      address: {
        country: form.country,
        province: form.province,
        street: form.address,
        city: form.city,
        postalCode: form.postalCode,
      },
      medicalHistory: {
        physician: form.familyPhysician,
        weight: form.weight,
        height: form.height,
        pastIllnesses: form.pastIllnesses,
        medications: form.medications,
        conditions: form.conditions,
      },
      medicalConditions: form.medicalConditions,
      allergiesDetail: form.allergiesDetail,
      aboutVisit: {
        referrals: form.referrals,
        interests: form.interests,
      },
      skinHistory: {
        products: form.skinProducts,
        sensitivities: form.skinSensitivities,
        vitaminA: form.vitaminA,
        accutane: form.accutane,
        chemicalPeel: form.chemicalPeel,
        laserTreatments: form.laserTreatments,
        botoxDermal: form.botoxDermal,
        waxDepilatory: form.waxDepilatory,
      },
      sunHistory: {
        exposure: form.sunExposure,
        tanning: form.tanning,
        sunscreen: form.sunscreen,
        spf: form.sunscreenSPF,
      },
      consents: {
        botox: form.botoxConsent,
        filler: form.fillerConsent,
        photo: form.photoConsent,
      },
    }

    const { error } = await supabase
      .from('patients')
      .update({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        phone: form.cellPhone,
        birthdate: form.birthday,
        metadata,
      })
      .eq('id', patient.id)

    setSaving(false)
    
    if (!error) {
      alert('Patient saved successfully!')
      onSave && onSave()
    } else {
      alert('Error saving patient: ' + error.message)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this patient?\n\nThis action CANNOT be undone.')) return
    const confirmText = window.prompt("Type 'delete' to confirm:")
    if (confirmText?.toLowerCase() !== 'delete') return

    await supabase.from('patients').delete().eq('id', patient.id)
    onBack && onBack()
  }

  const handleInactivate = async () => {
    const newStatus = patient.is_active === false ? true : false
    await supabase.from('patients').update({ is_active: newStatus }).eq('id', patient.id)
    alert(newStatus ? 'Patient activated' : 'Patient inactivated')
    onSave && onSave()
  }

  // Check if profile is complete
  const isProfileComplete = () => {
    if (registrationType === 'quick') {
      return form.firstName && form.lastName && form.birthday
    }
    return form.firstName && form.lastName && form.birthday && form.email && 
           form.genderIdentity && form.sexAtBirth && form.ethnicity
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Patient'

  // Styles
  const styles = {
    container: { background: '#f5f5f5', minHeight: '100vh', padding: '1.5rem' },
    breadcrumb: { fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' },
    pageTitle: { fontSize: '1.5rem', fontWeight: '600', color: '#333', marginBottom: '1rem', textTransform: 'uppercase' },
    warning: { background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' },
    warningTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#856404', marginBottom: '0.5rem' },
    warningText: { fontSize: '0.9rem', color: '#856404' },
    typeRow: { display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' },
    radio: { marginRight: '0.5rem' },
    twoColumns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e9ecef' },
    profileCard: { display: 'flex', gap: '1.5rem' },
    profileLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '200px' },
    avatar: { width: '100px', height: '100px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', marginBottom: '0.75rem' },
    profileName: { fontSize: '1.1rem', fontWeight: '600', color: '#333', marginBottom: '1rem', textAlign: 'center' },
    profileBtn: { width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' },
    btnDanger: { background: '#dc3545', color: 'white' },
    btnInfo: { background: '#5a9a9c', color: 'white' },
    btnOutline: { background: 'transparent', border: '1px solid #6c757d', color: '#6c757d' },
    profileRight: { flex: 1 },
    infoRow: { marginBottom: '0.75rem' },
    infoLabel: { fontSize: '0.8rem', fontWeight: '600', color: '#333' },
    infoValue: { fontSize: '0.9rem', color: '#666' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#333', marginBottom: '0.25rem' },
    required: { color: '#dc3545', marginLeft: '2px' },
    input: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' },
    select: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', background: 'white' },
    textarea: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', minHeight: '80px', resize: 'vertical' },
    hint: { fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' },
    checkboxGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' },
    checkbox: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#333' },
    consentBox: { maxHeight: '150px', overflowY: 'auto', padding: '0.75rem', background: '#f8f9fa', borderRadius: '6px', fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef' },
    requiredNote: { fontSize: '0.85rem', color: '#dc3545' },
    saveBtn: { padding: '0.75rem 2rem', background: '#5a9a9c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  }

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <a href="#" onClick={(e) => { e.preventDefault(); onBack() }} style={{ color: '#666' }}>Home</a>
        {' | '}
        <a href="#" onClick={(e) => { e.preventDefault(); onBack() }} style={{ color: '#666' }}>Patients</a>
        {' | '}
        <span>{fullName.toLowerCase()}</span>
      </div>

      {/* Page Title */}
      <h1 style={styles.pageTitle}>EDIT PATIENT</h1>

      {/* Warning if incomplete */}
      {!isProfileComplete() && (
        <div style={styles.warning}>
          <div style={styles.warningTitle}>Warning</div>
          <div style={styles.warningText}>
            This profile is missing newly required fields. Please update to complete the intake.
          </div>
        </div>
      )}

      {/* Registration Type */}
      <div style={styles.typeRow}>
        <span style={{ fontWeight: '500' }}>Type:</span>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="regType" 
            checked={registrationType === 'full'} 
            onChange={() => setRegistrationType('full')}
            style={styles.radio}
          />
          Full Register
        </label>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="regType" 
            checked={registrationType === 'quick'} 
            onChange={() => setRegistrationType('quick')}
            style={styles.radio}
          />
          Quick register
        </label>
      </div>

      {/* Two Columns Layout */}
      <div style={styles.twoColumns}>
        {/* LEFT COLUMN */}
        <div>
          {/* Profile Card */}
          <div style={styles.card}>
            <div style={styles.profileCard}>
              <div style={styles.profileLeft}>
                <div style={styles.avatar}><Icons.User /></div>
                <div style={styles.profileName}>{fullName}</div>
                <button style={{ ...styles.profileBtn, ...styles.btnDanger }} onClick={handleDelete}>
                  Delete Patient
                </button>
                <button style={{ ...styles.profileBtn, ...styles.btnInfo }}>
                  Select Consents
                </button>
                <button style={{ ...styles.profileBtn, ...styles.btnOutline }} onClick={handleInactivate}>
                  {patient?.is_active === false ? 'Activate Patient' : 'Inactivate Patient'}
                </button>
              </div>
              <div style={styles.profileRight}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem' }}>Patient's Personal Details</h4>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>Full Name</div>
                  <div style={styles.infoValue}>{fullName}</div>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>Gender Identity</div>
                  <div style={styles.infoValue}>{form.genderIdentity || '-'}</div>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>Sex Assigned at Birth</div>
                  <div style={styles.infoValue}>{form.sexAtBirth || '-'}</div>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>Birthday</div>
                  <div style={styles.infoValue}>{form.birthday || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Personal Details</h3>
            <div style={styles.formRow}>
              <div>
                <label style={styles.label}>First Name <span style={styles.required}>*</span></label>
                <input style={styles.input} value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} placeholder="Enter first name" />
              </div>
              <div>
                <label style={styles.label}>Last Name <span style={styles.required}>*</span></label>
                <input style={styles.input} value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} placeholder="Enter last name" />
              </div>
            </div>
            {registrationType === 'full' && (
              <>
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Gender Identity <span style={styles.required}>*</span></label>
                    <select style={styles.select} value={form.genderIdentity} onChange={e => handleChange('genderIdentity', e.target.value)}>
                      {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Sex Assigned at Birth <span style={styles.required}>*</span></label>
                    <select style={styles.select} value={form.sexAtBirth} onChange={e => handleChange('sexAtBirth', e.target.value)}>
                      {SEX_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}
            <div style={styles.formRow}>
              <div>
                <label style={styles.label}>Birthday <span style={styles.required}>*</span></label>
                <input style={styles.input} type="date" value={form.birthday} onChange={e => handleChange('birthday', e.target.value)} />
                <div style={styles.hint}>Date Format: (MM/DD/YYYY)</div>
              </div>
              {registrationType === 'full' && (
                <div>
                  <label style={styles.label}>Ethnicity <span style={styles.required}>*</span></label>
                  <select style={styles.select} value={form.ethnicity} onChange={e => handleChange('ethnicity', e.target.value)}>
                    {ETHNICITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Contact Information</h3>
              <div style={styles.formRow}>
                <div>
                  <label style={styles.label}>Email <span style={styles.required}>*</span></label>
                  <input style={styles.input} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="Enter e-mail" />
                </div>
                <div>
                  <label style={styles.label}>Cell phone number <span style={styles.required}>*</span></label>
                  <input style={styles.input} value={form.cellPhone} onChange={e => handleChange('cellPhone', e.target.value)} placeholder="(___) ___-____" />
                </div>
              </div>
              <div style={styles.formRow}>
                <div>
                  <label style={styles.label}>Home phone number</label>
                  <input style={styles.input} value={form.homePhone} onChange={e => handleChange('homePhone', e.target.value)} placeholder="(___) ___-____" />
                </div>
                <div>
                  <label style={styles.label}>Work phone number</label>
                  <input style={styles.input} value={form.workPhone} onChange={e => handleChange('workPhone', e.target.value)} placeholder="(___) ___-____" />
                </div>
              </div>
            </div>
          )}

          {/* Mailing Address */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Mailing Address</h3>
              <div style={styles.formRow}>
                <div>
                  <label style={styles.label}>Country <span style={styles.required}>*</span></label>
                  <select style={styles.select} value={form.country} onChange={e => handleChange('country', e.target.value)}>
                    {COUNTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>{form.country === 'US' ? 'State' : 'Province'} <span style={styles.required}>*</span></label>
                  <select style={styles.select} value={form.province} onChange={e => handleChange('province', e.target.value)}>
                    {(PROVINCE_OPTIONS[form.country] || PROVINCE_OPTIONS.CA).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Address <span style={styles.required}>*</span></label>
                <textarea style={styles.textarea} value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Enter mailing address" />
              </div>
              <div style={styles.formRow}>
                <div>
                  <label style={styles.label}>City <span style={styles.required}>*</span></label>
                  <input style={styles.input} value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="Enter town or city" />
                </div>
                <div>
                  <label style={styles.label}>{form.country === 'US' ? 'Zip Code' : 'Postal Code'} <span style={styles.required}>*</span></label>
                  <input style={styles.input} value={form.postalCode} onChange={e => handleChange('postalCode', e.target.value)} placeholder={form.country === 'US' ? 'Enter zip code' : 'Enter postal code'} />
                </div>
              </div>
            </div>
          )}

          {/* About Your Visit */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>About Your Visit</h3>
              <div style={styles.formRow}>
                <div>
                  <label style={styles.label}>How did you hear about us?</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {REFERRAL_OPTIONS.map(opt => (
                      <label key={opt} style={styles.checkbox}>
                        <input type="checkbox" checked={form.referrals.includes(opt)} onChange={e => handleCheckboxArray('referrals', opt, e.target.checked)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={styles.label}>What are you interested in?</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {INTEREST_OPTIONS.map(opt => (
                      <label key={opt} style={styles.checkbox}>
                        <input type="checkbox" checked={form.interests.includes(opt)} onChange={e => handleCheckboxArray('interests', opt, e.target.checked)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skin History */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Skin History</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>What products are you currently using on your skin:</label>
                <textarea style={styles.textarea} value={form.skinProducts} onChange={e => handleChange('skinProducts', e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={styles.checkbox}>
                  <input type="checkbox" checked={form.skinSensitivities} onChange={e => handleChange('skinSensitivities', e.target.checked)} />
                  Do you have any particular skin sensitivities?
                </label>
                <label style={styles.checkbox}>
                  <input type="checkbox" checked={form.vitaminA} onChange={e => handleChange('vitaminA', e.target.checked)} />
                  Have you ever used Vitamin A or glycolic acid?
                </label>
                <label style={styles.checkbox}>
                  <input type="checkbox" checked={form.accutane} onChange={e => handleChange('accutane', e.target.checked)} />
                  Have you ever used Accutane?
                </label>
                <label style={styles.checkbox}>
                  <input type="checkbox" checked={form.chemicalPeel} onChange={e => handleChange('chemicalPeel', e.target.checked)} />
                  Have you ever had a chemical peel?
                </label>
                <label style={styles.checkbox}>
                  <input type="checkbox" checked={form.laserTreatments} onChange={e => handleChange('laserTreatments', e.target.checked)} />
                  Have you had laser treatments in the past?
                </label>
                <label style={styles.checkbox}>
                  <input type="checkbox" checked={form.botoxDermal} onChange={e => handleChange('botoxDermal', e.target.checked)} />
                  Have you ever had botulinum toxin or dermal fillers?
                </label>
                <label style={styles.checkbox}>
                  <input type="checkbox" checked={form.waxDepilatory} onChange={e => handleChange('waxDepilatory', e.target.checked)} />
                  Have you waxed or used a depilatory?
                </label>
              </div>
            </div>
          )}

          {/* Sun History */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Sun History</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>With sun exposure, how does your skin respond?</label>
                <select style={styles.select} value={form.sunExposure} onChange={e => handleChange('sunExposure', e.target.value)}>
                  <option value="">Choose an option</option>
                  <option value="always_burn">Always burn, never tan</option>
                  <option value="usually_burn">Usually burn, tan with difficulty</option>
                  <option value="sometimes_burn">Sometimes burn, tan about average</option>
                  <option value="rarely_burn">Rarely burn, tan easily</option>
                  <option value="never_burn">Never burn, always tan</option>
                </select>
              </div>
              <label style={styles.checkbox}>
                <input type="checkbox" checked={form.tanning} onChange={e => handleChange('tanning', e.target.checked)} />
                Do you sunbathe, use self-tanning lotions, sprays or use tanning beds?
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={styles.checkbox}>
                  <input type="checkbox" checked={form.sunscreen} onChange={e => handleChange('sunscreen', e.target.checked)} />
                  Do you use sunscreen?
                </label>
                {form.sunscreen && (
                  <input style={{ ...styles.input, width: '120px' }} value={form.sunscreenSPF} onChange={e => handleChange('sunscreenSPF', e.target.value)} placeholder="SPF" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Medical Conditions */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Medical Conditions</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>Do you have any of the following medical conditions?</p>
              <div style={styles.checkboxGrid}>
                {MEDICAL_CONDITIONS.map(cond => (
                  <label key={cond} style={styles.checkbox}>
                    <input type="checkbox" checked={form.medicalConditions.includes(cond)} onChange={e => handleCheckboxArray('medicalConditions', cond, e.target.checked)} />
                    {cond}
                  </label>
                ))}
              </div>
              {form.medicalConditions.includes('Allergies') && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={styles.label}>Please list any allergies:</label>
                  <input style={styles.input} value={form.allergiesDetail} onChange={e => handleChange('allergiesDetail', e.target.value)} placeholder="Allergies" />
                </div>
              )}
            </div>
          )}

          {/* Medical History */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Medical History</h3>
              <div style={styles.formRow}>
                <div>
                  <label style={styles.label}>Family physician</label>
                  <input style={styles.input} value={form.familyPhysician} onChange={e => handleChange('familyPhysician', e.target.value)} placeholder="Enter family physician's name" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Weight</label>
                    <input style={styles.input} value={form.weight} onChange={e => handleChange('weight', e.target.value)} placeholder="Weight" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Height</label>
                    <input style={styles.input} value={form.height} onChange={e => handleChange('height', e.target.value)} placeholder="Height" />
                  </div>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Please list any past illnesses as well as all minor or major surgeries:</label>
                <textarea style={styles.textarea} value={form.pastIllnesses} onChange={e => handleChange('pastIllnesses', e.target.value)} placeholder="Specify any past illnesses or surgeries" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Please list all current medications:</label>
                <textarea style={styles.textarea} value={form.medications} onChange={e => handleChange('medications', e.target.value)} placeholder="Specify any medications" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>If you are currently being treated for any conditions, please specify:</label>
                <textarea style={styles.textarea} value={form.conditions} onChange={e => handleChange('conditions', e.target.value)} placeholder="Specify any conditions" />
              </div>
            </div>
          )}

          {/* Botulinum Toxin Consent */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Botulinum Toxin Consent</h3>
              <div style={styles.consentBox}>
                <p>1. I am aware that when small amounts of purified botulinum toxin are injected into a muscle, the muscle is weakened. This effect appears in 12 - 14 days and usually lasts approximately 3 - 4 months.</p>
                <p>2. I understand that this treatment will reduce or eliminate my ability to "frown" and/or produce "crow's feet" or forehead "worry lines"...</p>
              </div>
              <select style={styles.select} value={form.botoxConsent} onChange={e => handleChange('botoxConsent', e.target.value)}>
                <option value="">Choose an option</option>
                <option value="accept">Accept</option>
                <option value="reject">Do not accept</option>
              </select>
            </div>
          )}

          {/* Dermal Filler Consent */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Dermal Filler Consent</h3>
              <div style={styles.consentBox}>
                <p>I acknowledge that this treatment has been fully explained to me and that I have had the opportunity to ask questions that have been answered to my satisfaction...</p>
              </div>
              <select style={styles.select} value={form.fillerConsent} onChange={e => handleChange('fillerConsent', e.target.value)}>
                <option value="">Choose an option</option>
                <option value="accept">Accept</option>
                <option value="reject">Do not accept</option>
              </select>
            </div>
          )}

          {/* Photo Consent */}
          {registrationType === 'full' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Photo Consent</h3>
              <div style={styles.consentBox}>
                <p>Do you consent to having your photographs used for patient education and marketing purposes?</p>
              </div>
              <select style={styles.select} value={form.photoConsent} onChange={e => handleChange('photoConsent', e.target.value)}>
                <option value="">Choose an option</option>
                <option value="accept">Accept</option>
                <option value="reject">Do not accept</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.requiredNote}>* indicates required field</span>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
