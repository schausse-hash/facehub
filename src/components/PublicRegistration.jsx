import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Options pour les listes déroulantes
const GENDER_OPTIONS = [
  { value: 'female', label: 'Femme' },
  { value: 'male', label: 'Homme' },
  { value: 'transgender_female', label: 'Femme transgenre' },
  { value: 'transgender_male', label: 'Homme transgenre' },
  { value: 'gender_queer', label: 'Non binaire' },
  { value: 'other', label: 'Autre' },
]

const SEX_OPTIONS = [
  { value: 'female', label: 'Féminin' },
  { value: 'male', label: 'Masculin' },
  { value: 'other', label: 'Autre' },
]

const ETHNICITY_OPTIONS = [
  'Caucasien', 'Afro-descendant / Noir', 'Hispanique / Latino', 'Asiatique',
  'Moyen-Oriental', 'Insulaire du Pacifique', 'Autochtone', 'Autre'
]

const PROVINCE_OPTIONS = [
  { group: 'Provinces', options: [
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
    { value: 'NT', label: 'Territoires du Nord-Ouest' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' },
  ]},
  { group: 'États-Unis', options: [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'Californie' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Floride' }, { value: 'GA', label: 'Géorgie' },
    { value: 'HI', label: 'Hawaï' }, { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiane' },
    { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'Nouveau-Mexique' }, { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'Caroline du Nord' }, { value: 'ND', label: 'Dakota du Nord' },
    { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvanie' },
    { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'Caroline du Sud' },
    { value: 'SD', label: 'Dakota du Sud' }, { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginie' },
    { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'Virginie-Occidentale' },
    { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
  ]},
]

const REFERRAL_OPTIONS = [
  "Référence d'un professionnel", "Ami ou patient actuel", "Séminaire ou salon",
  "Journal", "Site web ou Internet", "Promotion ou coupon",
  "Pages Jaunes", "Magazine", "En passant devant la clinique"
]

const INTEREST_OPTIONS = [
  "Examen et nettoyage", "Obturations (plombages)", "Couronnes ou ponts",
  "Traitement de canal", "Extraction", "Implants dentaires",
  "Prothèses dentaires", "Orthodontie / Invisalign", "Blanchiment",
  "Urgence dentaire", "Esthétique du sourire"
]

const MEDICAL_CONDITIONS_LEFT = [
  "Allergies", "Arthrite", "Asthme", "Maladie auto-immune",
  "Trouble sanguin (saignements)", "Cancer (ou radiothérapie)",
  "Diabète", "Épilepsie", "Maladie cardiaque", "Hypertension artérielle",
  "Hépatite", "Herpès (ou feux sauvages)", "VIH / SIDA", "Déséquilibre hormonal"
]

const MEDICAL_CONDITIONS_RIGHT = [
  "Maladie rénale", "Sensibilité aux anesthésiques locaux",
  "Prothèse articulaire ou valvulaire", "Ostéoporose (ou bisphosphonates)",
  "Réactions allergiques sévères", "Stéroïdes (ou hormonothérapie)",
  "Zona", "Maladie neurologique importante", "Trouble de la thyroïde",
  "Grincement / serrement des dents (bruxisme)", "ATM / douleur à la mâchoire",
  "Vertiges / évanouissements"
]

const SUN_EXPOSURE_OPTIONS = [
  "Toujours, je brûle, je ne bronze jamais", "Habituellement, je brûle, je bronze difficilement",
  "Presque jamais, je bronze très facilement", "Parfois, je brûle, je bronze modérément",
  "Rarement, je bronze facilement", "Jamais, je bronze toujours"
]

// Textes des consentements (esthétiques — à valider/adapter par un professionnel)
const CONSENT_TEXTS = {
  botox: `<p>1. Je comprends que lorsqu'une petite quantité de toxine botulinique purifiée est injectée dans un muscle, ce muscle est affaibli. Cet effet apparaît en 12 à 14 jours et dure généralement de 3 à 4 mois.</p>
<p>2. Je comprends que ce traitement réduira ou éliminera ma capacité à « froncer les sourcils » pendant que l'injection est active, mais que cela s'inversera après quelques mois, moment où un nouveau traitement sera approprié.</p>
<p>3. Je comprends que je dois rester en position droite et ne pas manipuler la zone d'injection ni faire d'activité intense durant les 4 heures suivant le traitement.</p>
<p>4. J'accepte de revenir pour une visite de suivi 10 à 14 jours après mon traitement.</p>
<p>5. J'ai été informé(e) des autres méthodes de traitement possibles.</p>
<p>6. À ma connaissance, je ne suis pas enceinte et je n'ai aucune maladie neurologique ou musculaire importante.</p>
<p>7. J'ai eu l'occasion de poser des questions et on y a répondu à ma satisfaction.</p>
<p>8. Je consens à ce que des photographies soient prises pour évaluer l'efficacité du traitement.</p>`,

  filler: `<p>Je reconnais que ce traitement m'a été pleinement expliqué et que j'ai eu l'occasion de poser des questions auxquelles on a répondu à ma satisfaction.</p>
<p>J'ai été informé(e) de ce qui suit :</p>
<ul>
<li>L'agent de comblement dermique est un gel transparent et résorbable à base d'acide hyaluronique, injecté dans la peau pour corriger les rides et les plis.</li>
<li>Après l'injection, des réactions courantes peuvent survenir : gonflement, rougeur, douleur, démangeaison, décoloration et sensibilité au site d'injection. Elles disparaissent généralement en 1 à 2 jours.</li>
<li>Très rarement, des nodules, abcès ou indurations ont été rapportés après l'injection, parfois associés à des rougeurs et un gonflement.</li>
</ul>
<p>Je comprends que la durée de l'effet varie en moyenne de 6 à 9 mois selon le site, le type de peau, la quantité et la technique d'injection.</p>
<p>Je comprends la procédure, j'en accepte les risques et je demande qu'elle soit réalisée sur moi.</p>`,

  photo: `<p>Consentez-vous à ce que vos photographies soient utilisées à des fins d'éducation des patients et de marketing ?</p>`
}

// Version des textes de consentement ci-dessus. À incrémenter quand le texte change
// (le contenu légal sera validé par un professionnel ; ce mécanisme capture la
// version exacte montrée au patient au moment de son inscription).
const CONSENT_VERSION = '2026-06-17'

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
      // Lecture sécurisée par token : une fonction dédiée renvoie uniquement
      // les champs nécessaires à l'inscription, sans exposer la table.
      const { data, error } = await supabase
        .rpc('get_registration_link', { p_token: token })

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

    if (!formData.firstName.trim()) errs.push('Le prénom est requis')
    if (!formData.lastName.trim()) errs.push('Le nom de famille est requis')
    if (!formData.birthday) errs.push('La date de naissance est requise')

    if (!quickRegister) {
      if (!formData.genderIdentity) errs.push("L'identité de genre est requise")
      if (!formData.sexAtBirth) errs.push('Le sexe à la naissance est requis')
      if (!formData.ethnicity) errs.push("L'origine ethnique est requise")
      if (!formData.email.trim()) errs.push('Le courriel est requis')
      if (!formData.cellPhone.trim()) errs.push('Le téléphone cellulaire est requis')
      if (!formData.country) errs.push('Le pays est requis')
      if (!formData.province) errs.push('La province ou l\'état est requis')
      if (!formData.address.trim()) errs.push("L'adresse est requise")
      if (!formData.city.trim()) errs.push('La ville est requise')
      if (!formData.postalCode.trim()) errs.push('Le code postal est requis')

      if (linkData?.consents?.botox && !formData.botoxConsent)
        errs.push('Veuillez accepter ou refuser le consentement de toxine botulique')
      if (linkData?.consents?.filler && !formData.fillerConsent)
        errs.push('Veuillez accepter ou refuser le consentement des agents de comblement')
      if (linkData?.consents?.photo && !formData.photoConsent)
        errs.push('Veuillez accepter ou refuser le consentement photo')
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

      // Liste des consentements RÉELLEMENT montrés au patient (texte exact + version).
      // Ils ne sont affichés qu'en inscription complète : en inscription rapide,
      // on n'enregistre aucun consentement (puisqu'aucun n'a été présenté).
      const consentsShown = []
      if (!quickRegister) {
        if (linkData?.consents?.botox)
          consentsShown.push({ type: 'botox', version: CONSENT_VERSION, text: CONSENT_TEXTS.botox, accepted: formData.botoxConsent === 'accept' })
        if (linkData?.consents?.filler)
          consentsShown.push({ type: 'filler', version: CONSENT_VERSION, text: CONSENT_TEXTS.filler, accepted: formData.fillerConsent === 'accept' })
        if (linkData?.consents?.photo)
          consentsShown.push({ type: 'photo', version: CONSENT_VERSION, text: CONSENT_TEXTS.photo, accepted: formData.photoConsent === 'accept' })
      }

      // Enregistrement sécurisé côté serveur : crée le patient + les consentements
      // + marque le lien utilisé, sans exposer les tables aux visiteurs anonymes.
      const { data: result, error: rpcError } = await supabase
        .rpc('submit_registration', {
          p_token: token,
          p_patient: patientData,
          p_consents: consentsShown,
        })

      if (rpcError) throw rpcError
      if (result?.error) {
        const messages = {
          invalid: "Ce lien d'inscription est invalide.",
          used: "Ce lien d'inscription a déjà été utilisé.",
          expired: "Ce lien d'inscription a expiré.",
        }
        throw new Error(messages[result.error] || "L'inscription a échoué.")
      }

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
        placeholder={placeholder || `Saisir ${label.toLowerCase()}`}
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
        <option value="">Sélectionner...</option>
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
          placeholder="Veuillez préciser"
        />
      )}
    </div>
  )

  // ===================== ÉTAT DE CHARGEMENT =====================
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

  // ===================== ÉTATS D'ERREUR =====================
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

  // ===================== ÉTAT DE SUCCÈS =====================
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
            Si des informations supplémentaires sont nécessaires, un membre de notre équipe vous contactera. Au plaisir de vous accueillir !
          </p>
        </div>
      </div>
    )
  }

  // ===================== FORMULAIRE PRINCIPAL =====================
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* En-tête */}
        <div style={styles.header}>
          <h1 style={styles.title}>Inscription du patient</h1>
        </div>

        {/* Sélecteur de type */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginRight: '1rem', fontWeight: '500', color: '#333' }}>Type :</label>
          <div style={styles.typeSelector}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="regType"
                checked={!quickRegister}
                onChange={() => setQuickRegister(false)}
              />
              Inscription complète
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="regType"
                checked={quickRegister}
                onChange={() => setQuickRegister(true)}
              />
              Inscription rapide
            </label>
          </div>
        </div>

        {/* Messages d'erreur */}
        {errors.length > 0 && (
          <div style={styles.errorBox}>
            <strong>Veuillez corriger les erreurs suivantes :</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Disposition en deux colonnes */}
        <div style={styles.twoColumn}>
          {/* ============ COLONNE GAUCHE ============ */}
          <div>
            {/* Carte logo */}
            <div style={styles.logoCard}>
              <div style={styles.logoTitle}>{clinicInfo?.name || 'FaceHub'}</div>
              <div style={{ color: '#5a9a9c', fontSize: '2rem', fontWeight: '700' }}>FaceHub</div>
            </div>

            {/* Renseignements personnels */}
            <div style={styles.card}>
              <div style={styles.cardBody}>
                <h3 style={styles.sectionTitle}>Renseignements personnels</h3>
                <div style={styles.row}>
                  {renderInput('firstName', 'Prénom', true)}
                  {renderInput('lastName', 'Nom de famille', true)}
                </div>
                {!quickRegister && (
                  <>
                    <div style={styles.row}>
                      {renderSelect('genderIdentity', 'Identité de genre', GENDER_OPTIONS, true)}
                      {renderSelect('sexAtBirth', 'Sexe à la naissance', SEX_OPTIONS, true)}
                    </div>
                  </>
                )}
                <div style={styles.row}>
                  {renderInput('birthday', 'Date de naissance', true, 'date')}
                  {!quickRegister && renderSelect('ethnicity', 'Origine ethnique', ETHNICITY_OPTIONS, true)}
                </div>
                <small style={{ color: '#999' }}>Format de date : (JJ/MM/AAAA)</small>
              </div>
            </div>

            {/* Coordonnées - complète seulement */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Coordonnées</h3>
                  <div style={styles.row}>
                    {renderInput('email', 'Courriel', true, 'email')}
                    {renderInput('cellPhone', 'Téléphone cellulaire', true, 'tel')}
                  </div>
                  <div style={styles.row}>
                    {renderInput('homePhone', 'Téléphone résidentiel', false, 'tel')}
                    {renderInput('workPhone', 'Téléphone au travail', false, 'tel')}
                  </div>
                </div>
              </div>
            )}

            {/* Adresse postale - complète seulement */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Adresse postale</h3>
                  <div style={styles.row}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Pays<span style={styles.required}>*</span></label>
                      <select
                        style={styles.select}
                        value={formData.country}
                        onChange={(e) => updateField('country', e.target.value)}
                      >
                        <option value="CA">Canada</option>
                        <option value="US">États-Unis</option>
                      </select>
                    </div>
                    {renderSelect('province', formData.country === 'US' ? 'État' : 'Province', PROVINCE_OPTIONS, true)}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Adresse<span style={styles.required}>*</span></label>
                    <textarea
                      style={styles.textarea}
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Saisir l'adresse postale"
                      rows="3"
                    />
                  </div>
                  <div style={styles.row}>
                    {renderInput('city', 'Ville', true)}
                    {renderInput('postalCode', formData.country === 'US' ? 'Code ZIP' : 'Code postal', true)}
                  </div>
                </div>
              </div>
            )}

            {/* À propos de votre visite - complète seulement */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>À propos de votre visite</h3>
                  <div style={styles.row}>
                    <div>
                      <label style={{ ...styles.label, marginBottom: '1rem' }}>Comment avez-vous entendu parler de nous ?</label>
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
                        <span>Autre</span>
                      </label>
                      {formData.showReferralOther && (
                        <input
                          type="text"
                          style={{ ...styles.input, marginTop: '0.5rem' }}
                          value={formData.referralOther}
                          onChange={(e) => updateField('referralOther', e.target.value)}
                          placeholder="Veuillez préciser"
                        />
                      )}
                    </div>
                    <div>
                      <label style={{ ...styles.label, marginBottom: '1rem' }}>Qu'est-ce qui vous intéresse ?</label>
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

            {/* Habitudes de vie - complète seulement */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Habitudes de vie</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        style={styles.checkboxInput}
                        checked={formData.smoker}
                        onChange={(e) => updateField('smoker', e.target.checked)}
                      />
                      <span>Fumez-vous ?</span>
                    </label>
                    {formData.smoker && (
                      <input
                        type="text"
                        style={{ ...styles.input, width: '200px' }}
                        value={formData.cigarettesPerDay}
                        onChange={(e) => updateField('cigarettesPerDay', e.target.value)}
                        placeholder="Cigarettes par jour"
                      />
                    )}
                  </div>
                  {renderCheckboxWithText('pregnant', 'Êtes-vous enceinte ou allaitez-vous présentement ?', 'pregnantText')}
                </div>
              </div>
            )}
          </div>

          {/* ============ COLONNE DROITE ============ */}
          <div>
            {/* Conditions médicales - complète seulement */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Conditions médicales</h3>
                  <label style={styles.label}>Avez-vous l'une des conditions médicales suivantes ?</label>
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
                                  placeholder="Veuillez préciser vos allergies"
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
                        if (condition === 'Réactions allergiques sévères') {
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
                              {formData.medicalConditions.includes('Réactions allergiques sévères') && (
                                <input
                                  type="text"
                                  style={{ ...styles.input, marginBottom: '0.5rem' }}
                                  value={formData.severeAllergicDetail}
                                  onChange={(e) => updateField('severeAllergicDetail', e.target.value)}
                                  placeholder="Veuillez préciser"
                                />
                              )}
                            </div>
                          )
                        }
                        if (condition === 'Maladie neurologique importante') {
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
                              {formData.medicalConditions.includes('Maladie neurologique importante') && (
                                <input
                                  type="text"
                                  style={{ ...styles.input, marginBottom: '0.5rem' }}
                                  value={formData.neurologicalDetail}
                                  onChange={(e) => updateField('neurologicalDetail', e.target.value)}
                                  placeholder="Veuillez préciser"
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
                        <span>Autre</span>
                      </label>
                      {formData.otherMedical && (
                        <input
                          type="text"
                          style={styles.input}
                          value={formData.otherMedicalText}
                          onChange={(e) => updateField('otherMedicalText', e.target.value)}
                          placeholder="Veuillez préciser"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Antécédents médicaux - complète seulement */}
            {!quickRegister && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Antécédents médicaux</h3>
                  <div style={styles.row}>
                    {renderInput('familyPhysician', 'Médecin de famille')}
                    <div style={styles.row}>
                      {renderInput('weight', 'Poids')}
                      {renderInput('height', 'Taille')}
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Veuillez indiquer vos maladies passées ainsi que toute chirurgie mineure ou majeure :</label>
                    <textarea
                      style={styles.textarea}
                      value={formData.pastIllnessSurgery}
                      onChange={(e) => updateField('pastIllnessSurgery', e.target.value)}
                      placeholder="Précisez vos maladies ou chirurgies passées"
                      rows="3"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Veuillez indiquer tous vos médicaments actuels :</label>
                    <textarea
                      style={styles.textarea}
                      value={formData.medications}
                      onChange={(e) => updateField('medications', e.target.value)}
                      placeholder="Précisez les médicaments que vous prenez actuellement"
                      rows="3"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Si vous êtes présentement traité(e) pour une condition, veuillez préciser :</label>
                    <textarea
                      style={styles.textarea}
                      value={formData.currentConditions}
                      onChange={(e) => updateField('currentConditions', e.target.value)}
                      placeholder="Précisez les conditions pour lesquelles vous êtes traité(e)"
                      rows="3"
                    />
                  </div>
                  {renderCheckboxWithText('specialistTreatment', 'Êtes-vous suivi(e), ou avez-vous déjà été suivi(e), par un spécialiste (cardiologue, endocrinologue, etc.) ?', 'specialistTreatmentText')}
                </div>
              </div>
            )}

            {/* Consentement toxine botulique - complète seulement */}
            {!quickRegister && linkData?.consents?.botox && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Consentement — Toxine botulique</h3>
                  <div style={styles.consentBox} dangerouslySetInnerHTML={{ __html: CONSENT_TEXTS.botox }} />
                  <div style={{ maxWidth: '220px' }}>
                    <select
                      style={styles.select}
                      value={formData.botoxConsent}
                      onChange={(e) => updateField('botoxConsent', e.target.value)}
                    >
                      <option value="">Choisir une option</option>
                      <option value="accept">J'accepte</option>
                      <option value="decline">Je refuse</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {!quickRegister && linkData?.consents?.filler && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Consentement — Agents de comblement</h3>
                  <div style={styles.consentBox} dangerouslySetInnerHTML={{ __html: CONSENT_TEXTS.filler }} />
                  <div style={{ maxWidth: '220px' }}>
                    <select
                      style={styles.select}
                      value={formData.fillerConsent}
                      onChange={(e) => updateField('fillerConsent', e.target.value)}
                    >
                      <option value="">Choisir une option</option>
                      <option value="accept">J'accepte</option>
                      <option value="decline">Je refuse</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {!quickRegister && linkData?.consents?.photo && (
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Consentement — Photos</h3>
                  <div style={styles.consentBox} dangerouslySetInnerHTML={{ __html: CONSENT_TEXTS.photo }} />
                  <div style={{ maxWidth: '220px' }}>
                    <select
                      style={styles.select}
                      value={formData.photoConsent}
                      onChange={(e) => updateField('photoConsent', e.target.value)}
                    >
                      <option value="">Choisir une option</option>
                      <option value="accept">J'accepte</option>
                      <option value="decline">Je refuse</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mention champs requis */}
        <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ color: '#dc3545' }}>*</span> indique un champ obligatoire
        </div>

        {/* Bouton d'envoi */}
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
                Inscription en cours...
              </>
            ) : "S'inscrire"}
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
