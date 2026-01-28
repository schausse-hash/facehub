import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AccountSettings({ onBack, session }) {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    title: '',
    license_number: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        email: session.user.email || '',
        phone: data.phone || '',
        title: data.title || '',
        license_number: data.license_number || ''
      })
    } else {
      setProfile(prev => ({ ...prev, email: session.user.email || '' }))
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: session.user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        title: profile.title,
        license_number: profile.license_number,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
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
      marginBottom: '1.5rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid var(--primary)'
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
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      fontSize: '0.9rem',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)'
    },
    inputDisabled: {
      background: 'var(--bg-sidebar)',
      color: 'var(--text-muted)',
      cursor: 'not-allowed'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
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

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>
  }

  return (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Paramètres du compte</span>
      </div>

      <h1 className="page-title">PARAMÈTRES DU COMPTE</h1>

      <div style={{ maxWidth: '700px' }}>
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={styles.sectionTitle}>Informations personnelles</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nom complet</label>
              <input
                type="text"
                style={styles.input}
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Votre nom complet"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Adresse courriel</label>
              <input
                type="email"
                style={{ ...styles.input, ...styles.inputDisabled }}
                value={profile.email}
                disabled
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Le courriel ne peut pas être modifié ici.
              </small>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Téléphone</label>
                <input
                  type="tel"
                  style={styles.input}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="514-555-1234"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Titre professionnel</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  placeholder="Ex: Infirmière, Médecin..."
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Numéro de licence</label>
              <input
                type="text"
                style={styles.input}
                value={profile.license_number}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                placeholder="Votre numéro de licence professionnelle"
              />
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
      </div>

      <div className="copyright">
        DROITS D'AUTEUR © {new Date().getFullYear()} FACEHUB
      </div>
    </div>
  )
}
