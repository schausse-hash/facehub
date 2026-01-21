import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { sendAccessRequestEmail } from '../emailService'

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
  const [mode, setMode] = useState('login') // 'login', 'request', 'requested', 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    clinicName: ''
  })

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
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAccess = async (e) => {
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
      // Vérifier si l'email existe déjà
      const { data: existing } = await supabase
        .from('user_requests')
        .select('status')
        .eq('email', form.email.toLowerCase().trim())
        .single()

      if (existing) {
        if (existing.status === 'approved') {
          setError('Votre email est déjà approuvé. Utilisez "Créer mon compte".')
        } else if (existing.status === 'pending') {
          setError('Votre demande est déjà en attente d\'approbation.')
        } else {
          setError('Votre demande a été rejetée. Contactez l\'administrateur.')
        }
        setLoading(false)
        return
      }

      // Créer la demande
      const { error } = await supabase
        .from('user_requests')
        .insert([{
          email: form.email.toLowerCase().trim(),
          full_name: form.fullName,
          clinic_name: form.clinicName,
          status: 'pending'
        }])

      if (error) throw error

      // Envoyer l'email de notification aux admins
      await sendAccessRequestEmail({
        name: form.fullName,
        email: form.email.toLowerCase().trim(),
        message: form.clinicName ? `Clinique: ${form.clinicName}` : ''
      })

      setMode('requested')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            clinic_name: form.clinicName
          }
        }
      })
      
      if (error) {
        if (error.message.includes('not yet been approved') || error.message.includes('approuvée')) {
          setError('Votre demande d\'accès n\'a pas encore été approuvée. Veuillez patienter.')
        } else {
          throw error
        }
      } else {
        alert('Compte créé! Vérifiez votre courriel pour confirmer votre inscription.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Écran de confirmation de demande
  if (mode === 'requested') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>FaceHub</h1>
            <span>Gestion Esthétique</span>
          </div>

          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>
              Demande envoyée!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Votre demande d'accès a été envoyée à l'administrateur.
              Vous recevrez un courriel une fois votre compte approuvé.
            </p>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setMode('login')
                setForm({ email: '', password: '', fullName: '', clinicName: '' })
              }}
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

        <h2 className="auth-title">
          {mode === 'login' && 'Connexion'}
          {mode === 'request' && 'Demander l\'accès'}
          {mode === 'signup' && 'Créer mon compte'}
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
              <label className="form-label">Courriel</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
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

        {/* Formulaire de demande d'accès */}
        {mode === 'request' && (
          <form onSubmit={handleRequestAccess}>
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input
                type="text"
                className="form-input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
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
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nom de la clinique</label>
              <input
                type="text"
                className="form-input"
                value={form.clinicName}
                onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                placeholder="Optionnel"
              />
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
              {loading ? 'Envoi...' : 'Envoyer ma demande'}
            </button>
          </form>
        )}

        {/* Formulaire d'inscription (pour les emails approuvés) */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp}>
            <p style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-muted)', 
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'var(--bg-dark)',
              borderRadius: '8px'
            }}>
              ℹ️ Créez votre compte seulement si votre demande a été approuvée.
            </p>

            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                type="text"
                className="form-input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Courriel (approuvé)</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
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
                placeholder="Minimum 6 caractères"
              />
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
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        )}

        {/* Liens de navigation */}
        <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          {mode === 'login' && (
            <>
              <p style={{ marginBottom: '0.5rem' }}>
                Pas encore de compte?{' '}
                <a onClick={() => { setMode('request'); setError(null); setCaptcha(generateCaptcha()); setCaptchaInput(''); }}>
                  Demander l'accès
                </a>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Demande approuvée?{' '}
                <a onClick={() => { setMode('signup'); setError(null); setCaptcha(generateCaptcha()); setCaptchaInput(''); }}>
                  Créer mon compte
                </a>
              </p>
            </>
          )}

          {(mode === 'request' || mode === 'signup') && (
            <p>
              Déjà un compte?{' '}
              <a onClick={() => { setMode('login'); setError(null); }}>
                Se connecter
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
