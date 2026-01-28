import { useState } from 'react'

const DEFAULT_CONSENTS = [
  {
    id: 'botox',
    name: 'Consentement Toxine Botulique',
    nameEn: 'Botulinum Toxin Consent',
    enabled: true,
    required: true,
    description: 'Formulaire de consentement pour les traitements à la toxine botulique (Botox, Dysport, Xeomin)'
  },
  {
    id: 'filler',
    name: 'Consentement Agents de Comblement',
    nameEn: 'Dermal Filler Consent',
    enabled: true,
    required: true,
    description: 'Formulaire de consentement pour les injections d\'agents de comblement (Juvederm, Restylane)'
  },
  {
    id: 'photo',
    name: 'Consentement Photo',
    nameEn: 'Photo Consent',
    enabled: true,
    required: false,
    description: 'Autorisation d\'utiliser les photos du patient à des fins éducatives et marketing'
  },
  {
    id: 'medical',
    name: 'Consentement Formulaire Médical',
    nameEn: 'Medical Form Consent',
    enabled: true,
    required: true,
    description: 'Consentement pour la collecte et le stockage des informations médicales'
  },
  {
    id: 'treatment',
    name: 'Consentement Plan de Traitement',
    nameEn: 'Treatment Plan Consent',
    enabled: false,
    required: false,
    description: 'Acceptation du plan de traitement proposé par le praticien'
  }
]

export default function ConsentSettings({ onBack, session }) {
  const [consents, setConsents] = useState(DEFAULT_CONSENTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingConsent, setEditingConsent] = useState(null)

  const toggleConsent = (consentId, field) => {
    setConsents(consents.map(consent => 
      consent.id === consentId ? { ...consent, [field]: !consent[field] } : consent
    ))
    setSaved(false)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 500)
  }

  const styles = {
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
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid var(--primary)'
    },
    description: {
      fontSize: '0.9rem',
      color: 'var(--text-muted)',
      marginBottom: '1.5rem'
    },
    consentCard: {
      background: 'var(--bg-sidebar)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '1.25rem',
      marginBottom: '1rem'
    },
    consentCardEnabled: {
      borderColor: 'var(--primary)',
      background: 'rgba(90, 154, 156, 0.05)'
    },
    consentHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: '0.75rem'
    },
    consentName: {
      fontWeight: '600',
      fontSize: '1rem',
      color: 'var(--text-primary)',
      marginBottom: '0.25rem'
    },
    consentDesc: {
      fontSize: '0.85rem',
      color: 'var(--text-muted)',
      lineHeight: '1.5'
    },
    consentActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '1rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid var(--border)'
    },
    actionLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)',
      cursor: 'pointer'
    },
    switch: {
      position: 'relative',
      width: '40px',
      height: '22px',
      background: 'var(--border)',
      borderRadius: '11px',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    switchEnabled: {
      background: 'var(--primary)'
    },
    switchKnob: {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: '18px',
      height: '18px',
      background: 'white',
      borderRadius: '50%',
      transition: 'transform 0.2s'
    },
    switchKnobEnabled: {
      transform: 'translateX(18px)'
    },
    badge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    badgeRequired: {
      background: 'var(--warning-bg)',
      color: 'var(--warning)'
    },
    badgeOptional: {
      background: 'var(--bg-card)',
      color: 'var(--text-muted)'
    },
    editBtn: {
      padding: '0.4rem 0.75rem',
      fontSize: '0.8rem',
      borderRadius: '6px',
      border: '1px solid var(--border)',
      background: 'transparent',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      marginLeft: 'auto'
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--border)'
    },
    btn: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.9rem'
    },
    btnPrimary: {
      background: 'var(--primary)',
      color: 'white'
    },
    btnSuccess: {
      background: 'var(--success)',
      color: 'white'
    },
    btnOutline: {
      background: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--text-secondary)'
    }
  }

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <div 
      style={{ ...styles.switch, ...(enabled ? styles.switchEnabled : {}) }}
      onClick={onToggle}
    >
      <div style={{ ...styles.switchKnob, ...(enabled ? styles.switchKnobEnabled : {}) }} />
    </div>
  )

  return (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Paramètres de consentement</span>
      </div>

      <h1 className="page-title">PARAMÈTRES DE CONSENTEMENT</h1>

      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h3 style={styles.sectionTitle}>Formulaires de consentement</h3>
          <p style={styles.description}>
            Gérez les formulaires de consentement requis lors de l'inscription des patients. 
            Activez ou désactivez les formulaires et définissez lesquels sont obligatoires.
          </p>

          {consents.map(consent => (
            <div 
              key={consent.id}
              style={{
                ...styles.consentCard,
                ...(consent.enabled ? styles.consentCardEnabled : {})
              }}
            >
              <div style={styles.consentHeader}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      ...styles.consentName,
                      color: consent.enabled ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}>
                      {consent.name}
                    </span>
                    <span style={{
                      ...styles.badge,
                      ...(consent.required ? styles.badgeRequired : styles.badgeOptional)
                    }}>
                      {consent.required ? 'Obligatoire' : 'Optionnel'}
                    </span>
                  </div>
                  <p style={styles.consentDesc}>{consent.description}</p>
                </div>
                <ToggleSwitch 
                  enabled={consent.enabled} 
                  onToggle={() => toggleConsent(consent.id, 'enabled')} 
                />
              </div>

              {consent.enabled && (
                <div style={styles.consentActions}>
                  <label style={styles.actionLabel}>
                    <input
                      type="checkbox"
                      checked={consent.required}
                      onChange={() => toggleConsent(consent.id, 'required')}
                    />
                    Obligatoire
                  </label>
                  <button 
                    style={styles.editBtn}
                    onClick={() => setEditingConsent(consent.id)}
                  >
                    Modifier le texte
                  </button>
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: '1.5rem' }}>
            <button style={{ ...styles.btn, ...styles.btnOutline }}>
              + Ajouter un formulaire de consentement
            </button>
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
