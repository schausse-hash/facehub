import { useState } from 'react'

const DEFAULT_ZONES = [
  { id: 'front', name: 'Front', nameFr: 'Front', defaultUnits: 20, enabled: true },
  { id: 'glabelle', name: 'Glabella', nameFr: 'Glabelle', defaultUnits: 20, enabled: true },
  { id: 'crow_left', name: "Crow's Feet Left", nameFr: "Pattes d'oie gauche", defaultUnits: 12, enabled: true },
  { id: 'crow_right', name: "Crow's Feet Right", nameFr: "Pattes d'oie droite", defaultUnits: 12, enabled: true },
  { id: 'bunny', name: 'Bunny Lines', nameFr: 'Bunny lines', defaultUnits: 8, enabled: true },
  { id: 'lip_flip', name: 'Lip Flip', nameFr: 'Lip flip', defaultUnits: 4, enabled: true },
  { id: 'dao', name: 'DAO', nameFr: 'DAO', defaultUnits: 8, enabled: true },
  { id: 'menton', name: 'Chin', nameFr: 'Menton', defaultUnits: 6, enabled: true },
  { id: 'masseter_left', name: 'Masseter Left', nameFr: 'Masséter gauche', defaultUnits: 25, enabled: true },
  { id: 'masseter_right', name: 'Masseter Right', nameFr: 'Masséter droit', defaultUnits: 25, enabled: true },
  { id: 'platysma', name: 'Platysma', nameFr: 'Platysma', defaultUnits: 30, enabled: true },
  { id: 'neck', name: 'Neck Bands', nameFr: 'Bandes du cou', defaultUnits: 20, enabled: false },
  { id: 'gummy', name: 'Gummy Smile', nameFr: 'Sourire gingival', defaultUnits: 4, enabled: false },
]

export default function InjectionTemplates({ onBack, session }) {
  const [zones, setZones] = useState(DEFAULT_ZONES)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleZone = (zoneId) => {
    setZones(zones.map(zone => 
      zone.id === zoneId ? { ...zone, enabled: !zone.enabled } : zone
    ))
    setSaved(false)
  }

  const updateUnits = (zoneId, units) => {
    setZones(zones.map(zone => 
      zone.id === zoneId ? { ...zone, defaultUnits: parseInt(units) || 0 } : zone
    ))
    setSaved(false)
  }

  const handleSave = () => {
    setSaving(true)
    // Simuler la sauvegarde
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
    description: {
      fontSize: '0.9rem',
      color: 'var(--text-muted)',
      marginBottom: '1.5rem'
    },
    zoneGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem'
    },
    zoneCard: {
      background: 'var(--bg-sidebar)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '1rem',
      transition: 'all 0.15s'
    },
    zoneCardEnabled: {
      borderColor: 'var(--primary)',
      background: 'rgba(90, 154, 156, 0.05)'
    },
    zoneHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.75rem'
    },
    zoneName: {
      fontWeight: '600',
      fontSize: '0.9rem',
      color: 'var(--text-primary)'
    },
    zoneNameDisabled: {
      color: 'var(--text-muted)'
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
    unitsInput: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      fontSize: '0.85rem',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)',
      textAlign: 'center'
    },
    unitsLabel: {
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
      marginTop: '0.25rem',
      textAlign: 'center'
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

  return (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Modèles d'injection</span>
      </div>

      <h1 className="page-title">MODÈLES D'INJECTION</h1>

      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h3 style={styles.sectionTitle}>Zones de traitement</h3>
          <p style={styles.description}>
            Configurez les zones de traitement par défaut et le nombre d'unités suggérées pour chaque zone.
            Activez ou désactivez les zones selon vos besoins.
          </p>

          <div style={styles.zoneGrid}>
            {zones.map(zone => (
              <div 
                key={zone.id}
                style={{
                  ...styles.zoneCard,
                  ...(zone.enabled ? styles.zoneCardEnabled : {})
                }}
              >
                <div style={styles.zoneHeader}>
                  <span style={{
                    ...styles.zoneName,
                    ...(!zone.enabled ? styles.zoneNameDisabled : {})
                  }}>
                    {zone.nameFr}
                  </span>
                  <div 
                    style={{
                      ...styles.switch,
                      ...(zone.enabled ? styles.switchEnabled : {})
                    }}
                    onClick={() => toggleZone(zone.id)}
                  >
                    <div style={{
                      ...styles.switchKnob,
                      ...(zone.enabled ? styles.switchKnobEnabled : {})
                    }} />
                  </div>
                </div>
                
                {zone.enabled && (
                  <div>
                    <input
                      type="number"
                      style={styles.unitsInput}
                      value={zone.defaultUnits}
                      onChange={(e) => updateUnits(zone.id, e.target.value)}
                      min="0"
                    />
                    <div style={styles.unitsLabel}>unités par défaut</div>
                  </div>
                )}
              </div>
            ))}
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
