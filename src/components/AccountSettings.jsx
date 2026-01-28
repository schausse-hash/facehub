import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AccountSettings({ onBack, session }) {
  // Password change state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailForSelfRegistered: true
  })
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [notificationsSaved, setNotificationsSaved] = useState(false)

  useEffect(() => {
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', session.user.id)
      .eq('setting_type', 'notifications')
      .single()

    if (data?.settings) {
      setNotifications(data.settings)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    // Validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordError('Veuillez remplir tous les champs.')
      return
    }

    if (passwords.new.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.')
      return
    }

    setSavingPassword(true)

    // Update password via Supabase
    const { error } = await supabase.auth.updateUser({
      password: passwords.new
    })

    if (error) {
      setPasswordError(error.message || 'Erreur lors de la mise à jour du mot de passe.')
    } else {
      setPasswordSuccess(true)
      setPasswords({ current: '', new: '', confirm: '' })
      setTimeout(() => setPasswordSuccess(false), 5000)
    }

    setSavingPassword(false)
  }

  const handleNotificationSave = async () => {
    setSavingNotifications(true)

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        setting_type: 'notifications',
        settings: notifications,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,setting_type'
      })

    if (!error) {
      setNotificationsSaved(true)
      setTimeout(() => setNotificationsSaved(false), 3000)
    }

    setSavingNotifications(false)
  }

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      maxWidth: '1000px'
    },
    card: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      overflow: 'hidden'
    },
    cardInner: {
      background: 'var(--bg-sidebar)',
      borderRadius: '10px',
      padding: '1.25rem',
      marginTop: '0.5rem'
    },
    cardBody: {
      padding: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: 'var(--primary)',
      marginBottom: '0.75rem'
    },
    formGroup: {
      marginBottom: '1rem'
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
    checkboxRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    checkboxLabel: {
      fontSize: '0.9rem',
      color: 'var(--text-primary)',
      lineHeight: '1.4'
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '1rem'
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
    alert: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    },
    alertError: {
      background: 'rgba(220, 53, 69, 0.1)',
      border: '1px solid var(--danger)',
      color: 'var(--danger)'
    },
    alertSuccess: {
      background: 'rgba(40, 167, 69, 0.1)',
      border: '1px solid var(--success)',
      color: 'var(--success)'
    }
  }

  return (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Paramètres du compte</span>
      </div>

      <h1 className="page-title">PARAMÈTRES DU COMPTE</h1>

      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.container}>
            {/* Change Password Section */}
            <div>
              <h3 style={styles.sectionTitle}>Changer le mot de passe</h3>
              <div style={styles.cardInner}>
                {passwordError && (
                  <div style={{ ...styles.alert, ...styles.alertError }}>
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div style={{ ...styles.alert, ...styles.alertSuccess }}>
                    Mot de passe mis à jour avec succès !
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Mot de passe actuel</label>
                  <input
                    type="password"
                    style={styles.input}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nouveau mot de passe</label>
                  <input
                    type="password"
                    style={styles.input}
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    style={styles.input}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div style={styles.footer}>
                  <button
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={handlePasswordChange}
                    disabled={savingPassword}
                  >
                    {savingPassword ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings Section */}
            <div>
              <h3 style={styles.sectionTitle}>Paramètres de notification</h3>
              <div style={styles.cardInner}>
                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="emailNotif"
                    checked={notifications.emailForSelfRegistered}
                    onChange={(e) => setNotifications({ 
                      ...notifications, 
                      emailForSelfRegistered: e.target.checked 
                    })}
                    style={{ marginTop: '3px' }}
                  />
                  <label htmlFor="emailNotif" style={styles.checkboxLabel}>
                    Recevoir un courriel de confirmation pour les patients auto-inscrits
                  </label>
                </div>

                <div style={styles.footer}>
                  <button
                    style={{
                      ...styles.btn,
                      ...(notificationsSaved ? styles.btnSuccess : styles.btnPrimary)
                    }}
                    onClick={handleNotificationSave}
                    disabled={savingNotifications}
                  >
                    {savingNotifications ? 'Enregistrement...' : notificationsSaved ? '✓ Enregistré' : 'Enregistrer'}
                  </button>
                </div>
              </div>
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
