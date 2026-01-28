import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Configuration des champs par section
const REGISTRATION_SECTIONS = {
  personalDetails: {
    title: 'Informations personnelles',
    titleEn: 'Personal Details',
    fields: [
      { name: 'firstName', label: 'Prénom', labelEn: 'First Name', locked: true, lockedRequired: true },
      { name: 'lastName', label: 'Nom', labelEn: 'Last Name', locked: true, lockedRequired: true },
      { name: 'genderIdentity', label: 'Identité de genre', labelEn: 'Gender Identity' },
      { name: 'sexAtBirth', label: 'Sexe assigné à la naissance', labelEn: 'Sex Assigned at Birth' },
      { name: 'birthday', label: 'Date de naissance', labelEn: 'Birthday', locked: true, lockedRequired: true },
      { name: 'ethnicity', label: 'Ethnicité', labelEn: 'Ethnicity' },
    ]
  },
  contactInfo: {
    title: 'Coordonnées',
    titleEn: 'Contact Information',
    fields: [
      { name: 'email', label: 'Courriel', labelEn: 'Email' },
      { name: 'cellPhone', label: 'Téléphone cellulaire', labelEn: 'Cell phone number' },
      { name: 'homePhone', label: 'Téléphone domicile', labelEn: 'Home phone number' },
      { name: 'workPhone', label: 'Téléphone travail', labelEn: 'Work phone number' },
    ]
  },
  mailingAddress: {
    title: 'Adresse postale',
    titleEn: 'Mailing Address',
    fields: [
      { name: 'country', label: 'Pays', labelEn: 'Country' },
      { name: 'province', label: 'Province', labelEn: 'Province' },
      { name: 'address', label: 'Adresse', labelEn: 'Address' },
      { name: 'city', label: 'Ville', labelEn: 'City' },
      { name: 'postalCode', label: 'Code postal', labelEn: 'Postal Code' },
    ]
  },
  aboutVisit: {
    title: 'À propos de votre visite',
    titleEn: 'About Your Visit',
    noRequired: true,
    fields: [
      { name: 'howDidYouHear', label: 'Demander la découvrabilité', labelEn: 'Ask about discoverability', tooltip: 'Comment avez-vous entendu parler de nous?' },
      { name: 'patientInterest', label: 'Demander les intérêts', labelEn: 'Ask about interests', tooltip: 'Qu\'est-ce qui vous intéresse?', hasSubOptions: true },
    ],
    subOptions: [
      { name: 'optionLinesWrinkles', label: 'Traitement des ridules et rides', labelEn: 'Treating fine lines & wrinkles' },
      { name: 'optionFacialVolume', label: 'Traitement perte de volume facial', labelEn: 'Treating facial volume loss' },
      { name: 'optionGummySmiles', label: 'Traitement sourires gingivaux', labelEn: 'Treating gummy smiles' },
      { name: 'optionUnevenLips', label: 'Traitement position lèvres inégale', labelEn: 'Treating uneven lip position' },
      { name: 'optionMigraines', label: 'Traitement migraines/maux de tête', labelEn: 'Treating migraine / headaches' },
      { name: 'optionTMD', label: 'Traitement ATM/TMD', labelEn: 'Treating TMD/TMJ' },
      { name: 'optionAgeSpots', label: 'Traitement taches de vieillesse', labelEn: 'Treatment of age spots' },
      { name: 'optionSkinTone', label: 'Amélioration teint de peau', labelEn: 'Improving skin tone' },
      { name: 'optionBodyFat', label: 'Traitement graisse corporelle', labelEn: 'Treating stubborn body fat' },
      { name: 'optionHairRemoval', label: 'Épilation', labelEn: 'Hair removal' },
      { name: 'optionSmile', label: 'Transformation du sourire', labelEn: 'Smile makeover' },
    ]
  },
  skinHistory: {
    title: 'Historique cutané',
    titleEn: 'Skin History',
    fields: [
      { name: 'skinProducts', label: 'Demander produits pour la peau', labelEn: 'Ask about skin products', tooltip: 'Quels produits utilisez-vous actuellement sur votre peau?', hasRequired: true },
      { name: 'skinSensitivity', label: 'Demander sensibilité cutanée', labelEn: 'Ask about skin sensitivity', tooltip: 'Avez-vous des sensibilités cutanées particulières?' },
      { name: 'vitaminA', label: 'Demander Vitamine A/Acide glycolique', labelEn: 'Ask about Vitamin A / Glycolic acid', tooltip: 'Avez-vous déjà utilisé de la Vitamine A ou de l\'acide glycolique?' },
      { name: 'accutane', label: 'Demander Accutane', labelEn: 'Ask about Accutane', tooltip: 'Avez-vous déjà utilisé Accutane?' },
      { name: 'chemicalPeel', label: 'Demander peeling chimique', labelEn: 'Ask about chemical peel', tooltip: 'Avez-vous déjà eu un peeling chimique?' },
      { name: 'laserTreatments', label: 'Demander traitements laser passés', labelEn: 'Ask about past laser treatments', tooltip: 'Avez-vous eu des traitements laser par le passé?' },
      { name: 'botoxDermal', label: 'Demander botox ou agents de comblement', labelEn: 'Ask about botox or dermal fillers', tooltip: 'Avez-vous déjà eu de la toxine botulique ou des agents de comblement?' },
      { name: 'waxDepilatory', label: 'Demander épilation cire/dépilatoire', labelEn: 'Ask about waxing or using a depilatory', tooltip: 'Avez-vous épilé ou utilisé un dépilatoire?' },
    ]
  },
  medicalHistory: {
    title: 'Antécédents médicaux',
    titleEn: 'Medical History',
    fields: [
      { name: 'physician', label: 'Médecin de famille', labelEn: 'Family physician', hasRequired: true },
      { name: 'weight', label: 'Poids', labelEn: 'Weight', hasRequired: true },
      { name: 'height', label: 'Taille', labelEn: 'Height', hasRequired: true },
      { name: 'illnessSurgeries', label: 'Demander maladies/chirurgies passées', labelEn: 'Ask about past illness or surgeries', tooltip: 'Veuillez lister toutes les maladies passées ainsi que les chirurgies', hasRequired: true },
      { name: 'medications', label: 'Demander médicaments actuels', labelEn: 'Ask about current medications', tooltip: 'Veuillez lister tous les médicaments actuels', hasRequired: true },
      { name: 'conditions', label: 'Demander conditions actuelles', labelEn: 'Ask about current conditions', tooltip: 'Si vous êtes actuellement traité pour des conditions, veuillez préciser', hasRequired: true },
      { name: 'treatmentReceived', label: 'Demander traitements reçus', labelEn: 'Ask about treatment received', tooltip: 'Avez-vous reçu un traitement d\'un endocrinologue, dermatologue ou chirurgien plastique?' },
      { name: 'pregnancy', label: 'Demander grossesse', labelEn: 'Ask about pregnancy', tooltip: 'Êtes-vous enceinte, allaitez-vous ou prévoyez-vous une grossesse?' },
      { name: 'smoking', label: 'Demander tabagisme', labelEn: 'Ask about smoking', tooltip: 'Fumez-vous?' },
    ]
  },
  medicalConditions: {
    title: 'Conditions médicales',
    titleEn: 'Medical Conditions',
    noRequired: true,
    fields: [
      { name: 'medicalConditions', label: 'Demander conditions médicales', labelEn: 'Ask about medical conditions', tooltip: 'Avez-vous l\'une des conditions médicales suivantes?' },
    ]
  },
  sunHistory: {
    title: 'Historique solaire',
    titleEn: 'Sun History',
    fields: [
      { name: 'sunExposure', label: 'Demander exposition au soleil', labelEn: 'Ask about sun exposure', tooltip: 'Avec l\'exposition au soleil, comment réagit votre peau?', hasRequired: true },
      { name: 'tanning', label: 'Demander bronzage', labelEn: 'Ask about tanning', tooltip: 'Utilisez-vous des lits de bronzage ou des lotions auto-bronzantes?' },
      { name: 'sunscreen', label: 'Demander utilisation écran solaire', labelEn: 'Ask about sunscreen use', tooltip: 'Utilisez-vous un écran solaire?' },
    ]
  }
}

// Valeurs par défaut
const getDefaultSettings = () => {
  const settings = { full: {}, quick: {} }
  
  Object.entries(REGISTRATION_SECTIONS).forEach(([sectionKey, section]) => {
    section.fields.forEach(field => {
      settings.full[field.name] = { enabled: true, required: field.locked ? true : true }
      settings.quick[field.name] = { 
        enabled: field.locked ? true : false, 
        required: field.lockedRequired ? true : false 
      }
    })
    if (section.subOptions) {
      section.subOptions.forEach(opt => {
        settings.full[opt.name] = { enabled: true }
        settings.quick[opt.name] = { enabled: false }
      })
    }
  })
  
  return settings
}

const Icons = {
  Info: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ChevronDown: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>,
  ChevronRight: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
  Warning: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
}

export default function RegistrationSettings({ onBack, session }) {
  const [activeTab, setActiveTab] = useState('full')
  const [settings, setSettings] = useState(getDefaultSettings())
  const [expandedSections, setExpandedSections] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', session.user.id)
      .eq('setting_type', 'registration_settings')
      .single()

    if (data?.settings) {
      setSettings(prev => ({ ...prev, ...data.settings }))
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        setting_type: 'registration_settings',
        settings: settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,setting_type'
      })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  const handleToggle = (fieldName, property) => {
    const regType = activeTab
    setSettings(prev => ({
      ...prev,
      [regType]: {
        ...prev[regType],
        [fieldName]: {
          ...prev[regType][fieldName],
          [property]: !prev[regType][fieldName]?.[property]
        }
      }
    }))
    setSaved(false)
  }

  const handleEnableAll = (sectionKey, value) => {
    const section = REGISTRATION_SECTIONS[sectionKey]
    const regType = activeTab
    
    const updates = {}
    section.fields.forEach(field => {
      if (!field.locked) {
        updates[field.name] = { 
          ...settings[regType][field.name], 
          enabled: value 
        }
      }
    })
    
    setSettings(prev => ({
      ...prev,
      [regType]: { ...prev[regType], ...updates }
    }))
    setSaved(false)
  }

  const handleRequireAll = (sectionKey, value) => {
    const section = REGISTRATION_SECTIONS[sectionKey]
    const regType = activeTab
    
    const updates = {}
    section.fields.forEach(field => {
      if (!field.lockedRequired && (field.hasRequired !== false || section.noRequired !== true)) {
        updates[field.name] = { 
          ...settings[regType][field.name], 
          required: value 
        }
      }
    })
    
    setSettings(prev => ({
      ...prev,
      [regType]: { ...prev[regType], ...updates }
    }))
    setSaved(false)
  }

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const currentSettings = settings[activeTab] || {}

  const styles = {
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    },
    tab: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px 8px 0 0',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'all 0.2s'
    },
    tabActive: {
      background: 'var(--primary)',
      color: 'white'
    },
    tabInactive: {
      background: 'var(--bg-sidebar)',
      color: 'var(--text-secondary)'
    },
    card: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      marginBottom: '1.5rem'
    },
    cardBody: {
      padding: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'var(--primary)',
      marginBottom: '1rem'
    },
    warningAlert: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '1rem',
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      color: '#f59e0b',
      fontSize: '0.9rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem'
    },
    sectionCard: {
      background: 'var(--bg-sidebar)',
      borderRadius: '8px',
      padding: '1rem'
    },
    sectionHeader: {
      fontSize: '0.95rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid var(--border)'
    },
    fieldRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px 80px',
      alignItems: 'center',
      padding: '0.5rem 0',
      fontSize: '0.875rem',
      gap: '0.5rem'
    },
    fieldRowNoRequired: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px',
      alignItems: 'center',
      padding: '0.5rem 0',
      fontSize: '0.875rem',
      gap: '0.5rem'
    },
    headerRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px 80px',
      alignItems: 'center',
      padding: '0.5rem 0',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      gap: '0.5rem'
    },
    headerRowNoRequired: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px',
      alignItems: 'center',
      padding: '0.5rem 0',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      gap: '0.5rem'
    },
    fieldLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'var(--text-primary)'
    },
    tooltip: {
      color: 'var(--text-muted)',
      cursor: 'help'
    },
    expandBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      padding: '0.25rem'
    },
    toggle: {
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    toggleOn: {
      background: 'var(--primary)'
    },
    toggleOff: {
      background: 'var(--border)'
    },
    toggleDisabled: {
      background: '#9ca3af',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    toggleKnob: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'white',
      position: 'absolute',
      top: '2px',
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    center: {
      display: 'flex',
      justifyContent: 'center'
    },
    footerRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px 80px',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderTop: '1px solid var(--border)',
      marginTop: '0.5rem',
      gap: '0.5rem'
    },
    footerRowNoRequired: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderTop: '1px solid var(--border)',
      marginTop: '0.5rem',
      gap: '0.5rem'
    },
    footerCheckbox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
      color: 'var(--text-muted)'
    },
    subOptions: {
      marginLeft: '1.5rem',
      paddingLeft: '1rem',
      borderLeft: '2px solid var(--border)'
    },
    btn: {
      padding: '0.65rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem'
    },
    btnPrimary: {
      background: 'var(--primary)',
      color: 'white'
    },
    btnSuccess: {
      background: 'var(--success)',
      color: 'white'
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '1.5rem'
    }
  }

  const Toggle = ({ checked, onChange, disabled }) => (
    <div 
      style={{
        ...styles.toggle,
        ...(disabled ? styles.toggleDisabled : (checked ? styles.toggleOn : styles.toggleOff))
      }}
      onClick={() => !disabled && onChange()}
    >
      <div style={{
        ...styles.toggleKnob,
        left: checked ? '22px' : '2px'
      }} />
    </div>
  )

  const renderSection = (sectionKey, section) => {
    const isNoRequired = section.noRequired
    const headerStyle = isNoRequired ? styles.headerRowNoRequired : styles.headerRow
    const rowStyle = isNoRequired ? styles.fieldRowNoRequired : styles.fieldRow
    const footerStyle = isNoRequired ? styles.footerRowNoRequired : styles.footerRow

    return (
      <div key={sectionKey} style={styles.sectionCard}>
        <h4 style={styles.sectionHeader}>{section.title}</h4>
        
        <div style={headerStyle}>
          <div></div>
          <div style={styles.center}>Activé</div>
          {!isNoRequired && <div style={styles.center}>Requis</div>}
        </div>

        {section.fields.map(field => (
          <div key={field.name}>
            <div style={rowStyle}>
              <div style={styles.fieldLabel}>
                <span>{field.label}</span>
                {field.tooltip && (
                  <span style={styles.tooltip} title={field.tooltip}>
                    <Icons.Info />
                  </span>
                )}
                {field.hasSubOptions && (
                  <button 
                    style={styles.expandBtn}
                    onClick={() => toggleSection(field.name)}
                  >
                    {expandedSections[field.name] ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                  </button>
                )}
              </div>
              <div style={styles.center}>
                <Toggle
                  checked={currentSettings[field.name]?.enabled}
                  onChange={() => handleToggle(field.name, 'enabled')}
                  disabled={field.locked}
                />
              </div>
              {!isNoRequired && (field.hasRequired !== false) && (
                <div style={styles.center}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={currentSettings[field.name]?.required || false}
                    onChange={() => handleToggle(field.name, 'required')}
                    disabled={field.lockedRequired || (activeTab === 'quick' && !field.locked)}
                  />
                </div>
              )}
              {!isNoRequired && field.hasRequired === false && <div></div>}
            </div>

            {/* Sub-options for expandable fields */}
            {field.hasSubOptions && expandedSections[field.name] && section.subOptions && (
              <div style={styles.subOptions}>
                {section.subOptions.map(opt => (
                  <div key={opt.name} style={{ ...rowStyle, padding: '0.4rem 0' }}>
                    <div style={styles.fieldLabel}>
                      <span style={{ fontSize: '0.8rem' }}>{opt.label}</span>
                    </div>
                    <div style={styles.center}>
                      <Toggle
                        checked={currentSettings[opt.name]?.enabled}
                        onChange={() => handleToggle(opt.name, 'enabled')}
                        disabled={false}
                      />
                    </div>
                    {!isNoRequired && <div></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={footerStyle}>
          <div></div>
          <div style={styles.footerCheckbox}>
            <input 
              type="checkbox" 
              onChange={(e) => handleEnableAll(sectionKey, e.target.checked)}
            />
            <span>Tout activer</span>
          </div>
          {!isNoRequired && (
            <div style={styles.footerCheckbox}>
              <input 
                type="checkbox" 
                onChange={(e) => handleRequireAll(sectionKey, e.target.checked)}
              />
              <span>Tout requis</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Paramètres d'inscription patient</span>
      </div>

      <h1 className="page-title">PARAMÈTRES D'INSCRIPTION PATIENT</h1>

      <div style={styles.card}>
        <div style={styles.cardBody}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'full' ? styles.tabActive : styles.tabInactive)
              }}
              onClick={() => setActiveTab('full')}
            >
              Inscription complète
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'quick' ? styles.tabActive : styles.tabInactive)
              }}
              onClick={() => setActiveTab('quick')}
            >
              Inscription rapide
            </button>
          </div>

          {/* Content */}
          <h3 style={styles.sectionTitle}>
            {activeTab === 'full' ? 'Inscription complète' : 'Inscription rapide'}
          </h3>

          {activeTab === 'quick' && (
            <div style={styles.warningAlert}>
              <Icons.Warning />
              <div>
                <strong>Attention :</strong> Les champs activés dans les paramètres d'inscription rapide ne s'afficheront pas si le même champ est désactivé dans l'inscription complète.
              </div>
            </div>
          )}

          {/* Sections Grid */}
          <div style={styles.grid}>
            {activeTab === 'full' ? (
              <>
                {renderSection('personalDetails', REGISTRATION_SECTIONS.personalDetails)}
                {renderSection('contactInfo', REGISTRATION_SECTIONS.contactInfo)}
                {renderSection('mailingAddress', REGISTRATION_SECTIONS.mailingAddress)}
                {renderSection('aboutVisit', REGISTRATION_SECTIONS.aboutVisit)}
                {renderSection('skinHistory', REGISTRATION_SECTIONS.skinHistory)}
                {renderSection('medicalHistory', REGISTRATION_SECTIONS.medicalHistory)}
                {renderSection('medicalConditions', REGISTRATION_SECTIONS.medicalConditions)}
                {renderSection('sunHistory', REGISTRATION_SECTIONS.sunHistory)}
              </>
            ) : (
              <>
                {renderSection('personalDetails', REGISTRATION_SECTIONS.personalDetails)}
                {renderSection('contactInfo', REGISTRATION_SECTIONS.contactInfo)}
                {renderSection('mailingAddress', REGISTRATION_SECTIONS.mailingAddress)}
              </>
            )}
          </div>

          <div style={styles.footer}>
            <button
              style={{
                ...styles.btn,
                ...(saved ? styles.btnSuccess : styles.btnPrimary)
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>

      <div className="copyright">
        DROITS D'AUTEUR © {new Date().getFullYear()} FACEHUB
      </div>
    </div>
  )
}
