import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { sendAccessRequestEmail } from '../emailService'

// Icône de retour
const IconArrowLeft = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

// Générer une question mathématique simple
const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  return {
    question: `${num1} + ${num2} = ?`,
    answer: num1 + num2
  }
}

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login', 'signup', 'success'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    birthdate: '',
    clinicName: ''
  })

  // Reset form et erreurs
  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      birthdate: '',
      clinicName: ''
    })
    setError(null)
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
  }

  // Changer de mode avec reset
  const switchMode = (newMode) => {
    resetForm()
    setMode(newMode)
  }

  // Connexion
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
    } catch (err) {
      if (err.message.includes('Invalid login')) {
        setError('Email ou mot de passe incorrect')
      } else if (err.message.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Inscription (créer le compte + demande d'activation)
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Vérifier le captcha
    if (parseInt(captchaInput) !== captcha.answer) {
      setError('Réponse incorrecte au calcul anti-robot')
      setCaptcha(generateCaptcha())
      setCaptchaInput('')
      setLoading(false)
      return
    }

    try {
      // 1. Créer le compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            birthdate: form.birthdate,
            clinic_name: form.clinicName
          }
        }
      })

      if (authError) throw authError

      // 2. Créer une entrée dans user_requests pour que l'admin puisse gérer
      const { error: requestError } = await supabase
        .from('user_requests')
        .insert([{
          email: form.email.toLowerCase().trim(),
          full_name: form.fullName,
          phone: form.phone,
          birthdate: form.birthdate || null,
          clinic_name: form.clinicName,
          status: 'pending'
        }])

      // Ignorer l'erreur si la demande existe déjà
      if (requestError && !requestError.message.includes('duplicate')) {
        console.error('Request error:', requestError)
      }

      // 3. Envoyer l'email de notification aux admins
      await sendAccessRequestEmail({
        name: form.fullName,
        email: form.email.toLowerCase().trim(),
        message: `Téléphone: ${form.phone || 'Non fourni'}\nDate de naissance: ${form.birthdate || 'Non fournie'}\nClinique souhaitée: ${form.clinicName || 'Non spécifiée'}`
      })

      // 4. Afficher le message de succès
      setMode('success')

    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('Cet email est déjà utilisé. Essayez de vous connecter.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Écran de succès après inscription
  if (mode === 'success') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>FaceHub</h1>
            <span>Gestion Esthétique</span>
          </div>

          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>
              Compte créé!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Votre compte a été créé avec succès.
            </p>
            <div style={{
              background: 'var(--bg-dark)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: '600' }}>Prochaines étapes:</p>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Vérifiez votre courriel et cliquez sur le lien de confirmation</li>
                <li style={{ marginBottom: '0.5rem' }}>Attendez que l'administrateur active votre compte</li>
                <li>Vous recevrez un courriel une fois votre accès approuvé</li>
              </ol>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => switchMode('login')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>FaceHub</h1>
          <span>Gestion Esthétique</span>
        </div>

        {/* Bouton retour pour inscription */}
        {mode === 'signup' && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.5rem 0',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            <IconArrowLeft /> Retour à la connexion
          </button>
        )}

        <h2 className="auth-title">
          {mode === 'login' && 'Connexion'}
          {mode === 'signup' && 'Créer un compte'}
        </h2>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#ef4444',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Formulaire de connexion */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Courriel ou nom d'utilisateur</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        )}

        {/* Formulaire d'inscription */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input
                type="text"
                className="form-input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Prénom Nom"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Courriel *</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe *</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Téléphone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="514-555-1234"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date de naissance</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.birthdate}
                  onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nom de votre clinique *</label>
              <input
                type="text"
                className="form-input"
                value={form.clinicName}
                onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                placeholder="Ex: Clinique Esthétique Montréal"
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                L'administrateur créera ou assignera votre clinique
              </small>
            </div>

            {/* Captcha anti-robot */}
            <div className="form-group">
              <label className="form-label">
                🤖 Anti-robot: <strong style={{ color: 'var(--accent)' }}>{captcha.question}</strong>
              </label>
              <input
                type="number"
                className="form-input"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Votre réponse"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>
        )}

        {/* Liens de navigation */}
        <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          {mode === 'login' && (
            <p>
              Pas encore de compte?{' '}
              <a onClick={() => switchMode('signup')} style={{ cursor: 'pointer' }}>
                S'inscrire
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
