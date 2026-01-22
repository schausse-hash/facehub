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
              <label className="form-labe
