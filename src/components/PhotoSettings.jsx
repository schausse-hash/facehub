import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Configuration des photos par section
const PHOTO_SECTIONS = [
  {
    title: 'Détendu',
    titleEn: 'Relaxed',
    photos: [
      { id: 1, label: 'Visage complet frontal', labelEn: 'Full Face Frontal', orientation: 'portrait' },
      { id: 2, label: 'Sagittal droit', labelEn: 'Sagittal Right', orientation: 'portrait' },
      { id: 3, label: 'Sagittal gauche', labelEn: 'Sagittal Left', orientation: 'portrait' },
      { id: 4, label: '45 degrés droit', labelEn: '45 Degrees Right', orientation: 'portrait' },
      { id: 5, label: '45 degrés gauche', labelEn: '45 Degrees Left', orientation: 'portrait' },
    ]
  },
  {
    title: 'Actif',
    titleEn: 'Active',
    photos: [
      { id: 6, label: 'Visage complet frontal', labelEn: 'Full Face Frontal', orientation: 'portrait' },
      { id: 7, label: 'Sagittal droit', labelEn: 'Sagittal Right', orientation: 'portrait' },
      { id: 8, label: 'Sagittal gauche', labelEn: 'Sagittal Left', orientation: 'portrait' },
      { id: 9, label: '45 degrés droit', labelEn: '45 Degrees Right', orientation: 'portrait' },
      { id: 10, label: '45 degrés gauche', labelEn: '45 Degrees Left', orientation: 'portrait' },
    ]
  },
  {
    title: 'Détendu',
    titleEn: 'Relaxed',
    photos: [
      { id: 11, label: 'Gros plan visage', labelEn: 'Close-up Face', orientation: 'portrait' },
      { id: 12, label: '45 degrés droit', labelEn: '45 Degrees Right', orientation: 'portrait' },
      { id: 13, label: '45 degrés gauche', labelEn: '45 Degrees Left', orientation: 'portrait' },
    ]
  },
  {
    title: 'Actif',
    titleEn: 'Active',
    photos: [
      { id: 14, label: 'Gros plan visage', labelEn: 'Close-up Face', orientation: 'portrait' },
      { id: 15, label: '45 degrés droit', labelEn: '45 Degrees Right', orientation: 'portrait' },
      { id: 16, label: '45 degrés gauche', labelEn: '45 Degrees Left', orientation: 'portrait' },
    ]
  },
  {
    title: 'Détendu',
    titleEn: 'Relaxed',
    photos: [
      { id: 17, label: 'Visage supérieur (Frontalis)', labelEn: 'Upper Face (Frontalis)', orientation: 'landscape' },
      { id: 18, label: 'Visage supérieur (Glabelle)', labelEn: 'Upper Face (Glabella)', orientation: 'landscape' },
      { id: 19, label: 'Visage supérieur droit', labelEn: 'Upper Face Right', orientation: 'landscape' },
      { id: 20, label: 'Visage supérieur gauche', labelEn: 'Upper Face Left', orientation: 'landscape' },
    ]
  },
  {
    title: 'Actif',
    titleEn: 'Active',
    photos: [
      { id: 21, label: 'Visage supérieur (Frontalis)', labelEn: 'Upper Face (Frontalis)', orientation: 'landscape' },
      { id: 22, label: 'Visage supérieur (Glabelle)', labelEn: 'Upper Face (Glabella)', orientation: 'landscape' },
      { id: 23, label: 'Visage supérieur droit', labelEn: 'Upper Face Right', orientation: 'landscape' },
      { id: 24, label: 'Visage supérieur gauche', labelEn: 'Upper Face Left', orientation: 'landscape' },
    ]
  },
  {
    title: 'Détendu',
    titleEn: 'Relaxed',
    photos: [
      { id: 25, label: 'Visage milieu frontal', labelEn: 'Mid Face Frontal', orientation: 'landscape' },
      { id: 26, label: 'Visage inférieur', labelEn: 'Lower Face', orientation: 'landscape' },
    ]
  },
  {
    title: 'Actif',
    titleEn: 'Active',
    photos: [
      { id: 27, label: 'Visage milieu frontal', labelEn: 'Mid Face Frontal', orientation: 'landscape' },
      { id: 28, label: 'Visage inférieur frontal', labelEn: 'Lower Face Frontal', orientation: 'landscape' },
    ]
  },
  {
    title: null,
    photos: [
      { id: 29, label: 'Dents supérieures et inférieures frontal', labelEn: 'Upper & Lower Teeth Frontal', orientation: 'landscape' },
    ]
  },
]

export default function PhotoSettings({ onBack, session }) {
  const [settings, setSettings] = useState({})
  const [exportSettings, setExportSettings] = useState({
    showBeforeAfter: true,
    showPractitionerName: true
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Initialiser tous les paramètres photo à true par défaut
  useEffect(() => {
    const initialSettings = {}
    PHOTO_SECTIONS.forEach(section => {
      section.photos.forEach(photo => {
        initialSettings[photo.id] = true
      })
    })
    setSettings(initialSettings)
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('setting_type', 'photo_settings')
      .single()

    if (data?.settings) {
      setSettings(prev => ({ ...prev, ...data.settings.photos }))
      if (data.settings.export) {
        setExportSettings(data.settings.export)
      }
    }
  }

  const togglePhoto = (photoId) => {
    setSettings(prev => ({
      ...prev,
      [photoId]: !prev[photoId]
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    
    const settingsData = {
      photos: settings,
      export: exportSettings
    }

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        setting_type: 'photo_settings',
        settings: settingsData,
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

  const styles = {
    container: {
      padding: '0'
    },
    card: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      overflow: 'hidden'
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
    subTitle: {
      fontSize: '0.95rem',
      fontWeight: '600',
      color: 'var(--text-secondary)',
      marginTop: '1.5rem',
      marginBottom: '0.75rem'
    },
    photoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    photoContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.85rem',
      color: 'var(--text-primary)'
    },
    photoNumber: {
      fontWeight: '700',
      color: 'var(--primary)'
    },
    photoLabel: {
      fontSize: '0.8rem',
      color: 'var(--text-secondary)',
      marginTop: '0.25rem'
    },
    photoPreview: {
      width: '100%',
      aspectRatio: '3/4',
      borderRadius: '8px',
      background: 'var(--bg-sidebar)',
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.75rem',
      overflow: 'hidden'
    },
    photoPreviewLandscape: {
      aspectRatio: '4/3'
    },
    photoPreviewDisabled: {
      opacity: 0.4,
      filter: 'grayscale(100%)'
    },
    exportSection: {
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--border)'
    },
    exportCheckbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: 'pointer',
      fontSize: '0.9rem',
      color: 'var(--text-primary)',
      marginBottom: '0.75rem'
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
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btnPrimary: {
      background: 'var(--primary)',
      color: 'white'
    },
    btnSuccess: {
      background: 'var(--success)',
      color: 'white'
    },
    description: {
      fontSize: '0.9rem',
      color: 'var(--text-muted)',
      marginBottom: '1.5rem'
    }
  }

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Paramètres photo</span>
      </div>

      <h1 className="page-title">PARAMÈTRES PHOTO</h1>

      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h3 style={styles.sectionTitle}>Arrangement des photos</h3>
          <p style={styles.description}>
            Désélectionnez les photos que vous ne souhaitez pas voir apparaître dans votre modèle de photographie.
          </p>

          <div className="photo-settings">
            {PHOTO_SECTIONS.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <h4 style={styles.subTitle}>{section.title}</h4>
                )}
                <div style={styles.photoGrid}>
                  {section.photos.map(photo => (
                    <div key={photo.id} style={styles.photoContainer}>
                      <label style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={settings[photo.id] ?? true}
                          onChange={() => togglePhoto(photo.id)}
                          style={{ marginTop: '2px' }}
                        />
                        <div>
                          <span style={styles.photoNumber}>#{photo.id}</span>
                          <div style={styles.photoLabel}>{photo.label}</div>
                        </div>
                      </label>
                      <div 
                        style={{
                          ...styles.photoPreview,
                          ...(photo.orientation === 'landscape' ? styles.photoPreviewLandscape : {}),
                          ...(!(settings[photo.id] ?? true) ? styles.photoPreviewDisabled : {})
                        }}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Export Settings */}
          <div style={styles.exportSection}>
            <h3 style={styles.sectionTitle}>Paramètres d'exportation</h3>
            
            <label style={styles.exportCheckbox}>
              <input
                type="checkbox"
                checked={exportSettings.showBeforeAfter}
                onChange={(e) => {
                  setExportSettings(prev => ({ ...prev, showBeforeAfter: e.target.checked }))
                  setSaved(false)
                }}
              />
              Afficher les étiquettes "Avant" et "Après"
            </label>

            <label style={styles.exportCheckbox}>
              <input
                type="checkbox"
                checked={exportSettings.showPractitionerName}
                onChange={(e) => {
                  setExportSettings(prev => ({ ...prev, showPractitionerName: e.target.checked }))
                  setSaved(false)
                }}
              />
              Afficher le nom du praticien
            </label>
          </div>

          {/* Save Button */}
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
