import { useState } from 'react'

export default function RegistrationSettings({ onBack, session }) {
  const [settings, setSettings] = useState({
    requireEmail: true,
    requirePhone: true,
    requireBirthdate: true,
    requireAddress: false,
    requireMedicalHistory: true,
    requireSkinHistory: true,
    requireEmergencyContact: false,
    defaultRegistrationType: 'full',
    allowQuickRegistration: true,
    sendWelcomeEmail: true,
    autoAssignToClinic: true
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
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
    settingRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 0',
      borderBottom: '1px solid var(--border)'
    },
    settingInfo: {
      flex: 1
    },
    settingLabel: {
      fontSize: '0.95rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
      marginBottom: '0.25rem'
    },
    settingDesc: {
      fontSize: '0.8rem',
      color: 'var(--text-muted)'
    },
    switch: {
      position: 'relative',
      width: '44px',
      height: '24px',
      background: 'var(--border)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      flexShrink: 0,
      marginLeft: '1rem'
    },
    switchEnabled: {
      background: 'var(--primary)'
    },
    switchKnob: {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: '20px',
      height: '20px',
      background: 'white',
      borderRadius: '50%',
      transition: 'transform 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    },
    switchKnobEnabled: {
      transform: 'translateX(20px)'
    },
    formGroup: {
      marginBottom: '1.25rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--text-secondary)'
    },
    select: {
      width: '100%',
      maxWidth: '300px',
      padding: '0.75rem 1rem',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      fontSize: '0.9rem',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)',
      cursor: 'pointer'
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
        <span style={{ color: 'var(--text-secondary)' }}> Paramètres d'inscription patient</span>
      </div>

      <h1 className="page-title">PARAMÈTRES D'INSCRIPTION PATIENT</h1>

      {/* Required Fields */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h3 style={styles.sectionTitle}>Champs obligatoires</h3>
          <p style={styles.description}>
            Configurez les champs requis lors de l'inscription d'un nouveau patient.
          </p>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Adresse courriel</div>
              <div style={styles.settingDesc}>Exiger une adresse courriel valide</div>
            </div>
            <ToggleSwitch enabled={settings.requireEmail} onToggle={() => handleToggle('requireEmail')} />
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Numéro de téléphone</div>
              <div style={styles.settingDesc}>Exiger un numéro de téléphone</div>
            </div>
            <ToggleSwitch enabled={settings.requirePhone} onToggle={() => handleToggle('requirePhone')} />
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Date de naissance</div>
              <div style={styles.settingDesc}>Exiger la date de naissance du patient</div>
            </div>
            <ToggleSwitch enabled={settings.requireBirthdate} onToggle={() => handleToggle('requireBirthdate')} />
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Adresse postale</div>
              <div style={styles.settingDesc}>Exiger l'adresse complète du patient</div>
            </div>
            <ToggleSwitch enabled={settings.requireAddress} onToggle={() => handleToggle('requireAddress')} />
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Historique médical</div>
              <div style={styles.settingDesc}>Exiger les informations médicales</div>
            </div>
            <ToggleSwitch enabled={settings.requireMedicalHistory} onToggle={() => handleToggle('requireMedicalHistory')} />
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Historique de la peau</div>
              <div style={styles.settingDesc}>Exiger les informations sur la peau</div>
            </div>
            <ToggleSwitch enabled={settings.requireSkinHistory} onToggle={() => handleToggle('requireSkinHistory')} />
          </div>

          <div style={{ ...styles.settingRow, borderBottom: 'none' }}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Contact d'urgence</div>
              <div style={styles.settingDesc}>Exiger un contact d'urgence</div>
            </div>
            <ToggleSwitch enabled={settings.requireEmergencyContact} onToggle={() => handleToggle('requireEmergencyContact')} />
          </div>
        </div>
      </div>

      {/* Registration Options */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h3 style={styles.sectionTitle}>Options d'inscription</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Type d'inscription par défaut</label>
            <select 
              style={styles.select}
              value={settings.defaultRegistrationType}
              onChange={(e) => {
                setSettings(prev => ({ ...prev, defaultRegistrationType: e.target.value }))
                setSaved(false)
              }}
            >
              <option value="full">Inscription complète</option>
              <option value="quick">Inscription rapide</option>
            </select>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Permettre l'inscription rapide</div>
              <div style={styles.settingDesc}>Autoriser les patients à s'inscrire avec le minimum d'informations</div>
            </div>
            <ToggleSwitch enabled={settings.allowQuickRegistration} onToggle={() => handleToggle('allowQuickRegistration')} />
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Envoyer un courriel de bienvenue</div>
              <div style={styles.settingDesc}>Envoyer automatiquement un courriel aux nouveaux patients</div>
            </div>
            <ToggleSwitch enabled={settings.sendWelcomeEmail} onToggle={() => handleToggle('sendWelcomeEmail')} />
          </div>

          <div style={{ ...styles.settingRow, borderBottom: 'none' }}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Assigner automatiquement à la clinique</div>
              <div style={styles.settingDesc}>Assigner les nouveaux patients à votre clinique par défaut</div>
            </div>
            <ToggleSwitch enabled={settings.autoAssignToClinic} onToggle={() => handleToggle('autoAssignToClinic')} />
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
