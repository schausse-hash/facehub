import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { sendAccessRequestEmail } from '../emailService'

// Icônes
const Icons = {
  ArrowLeft: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Eye: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  Mail: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Check: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  )
}

// Logo FaceHub stylisé
const FaceHubLogo = ({ size = 'large' }) => {
  const logoSize = size === 'large' ? 80 : 32
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: size === 'large' ? '1rem' : '0.75rem',
      flexDirection: 'row',
      justifyContent: 'center'
    }}>
      <svg width={logoSize} height={logoSize} viewBox="0 0 100 100" fill="none">
        {/* Forme abstraite représentant un visage stylisé */}
        <path 
          d="M30 20 C30 20, 30 80, 30 80 C30 85, 35 90, 40 90 L40 90 C45 90, 50 85, 50 80 L50 60 C50 55, 55 50, 60 50 L60 50 C65 50, 70 55, 70 60 L70 60 C70 65, 65 70, 60 70 L50 70"
          stroke="#5a9a9c"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="60" cy="35" r="12" fill="#5a9a9c" />
      </svg>
      <span style={{ 
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: size === 'large' ? '2rem' : '1.5rem',
        fontWeight: 600,
        color: '#5a9a9c'
      }}>
        FaceHub
      </span>
    </div>
  )
}

// Générer une question mathématique simple
const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  return {
    question: `${num1} + ${num2} = ?`,
    answer: num1 + num2
  }
}

// Types de professionnels
const PROFESSION_TYPES = [
  { value: 'dentiste', label: 'Dentiste' },
  { value: 'medecin', label: 'Médecin' },
  { value: 'infirmier', label: 'Infirmier(ère)' },
  { value: 'pharmacien', label: 'Pharmacien(ne)' },
  { value: 'naturopathe', label: 'Naturopathe' },
  { value: 'estheticien', label: 'Esthéticien(ne)' },
  { value: 'autre', label: 'Autre (spécifier)' }
]

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login', 'signup', 'forgot', 'reset-sent', 'success'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    profession: '',
    professionOther: ''
  })

  // Reset form et erreurs
  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      companyName: '',
      profession: '',
      professionOther: ''
    })
    setError(null)
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
    setShowPassword(false)
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
        setError('Courriel ou mot de passe incorrect')
      } else if (err.message.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre courriel avant de vous connecter.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Mot de passe oublié
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      setMode('reset-sent')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Inscription
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validations
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setLoading(false)
      return
    }

    if (parseInt(captchaInput) !== captcha.answer) {
      setError('Réponse incorrecte au calcul anti-robot')
      setCaptcha(generateCaptcha())
      setCaptchaInput('')
      setLoading(false)
      return
    }

    const fullName = `${form.firstName} ${form.lastName}`.trim()
    const profession = form.profession === 'autre' ? form.professionOther : form.profession

    try {
      // 1. Créer le compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        options: {
          data: {
            full_name: fullName,
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            company_name: form.companyName,
            profession: profession,
            is_primary_contact: true
          }
        }
      })

      if (authError) throw authError

      // 2. Créer une entrée dans user_requests pour que l'admin puisse gérer
      const { error: requestError } = await supabase
        .from('user_requests')
        .insert([{
          email: form.email.toLowerCase().trim(),
          full_name: fullName,
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          company_name: form.companyName,
          profession: profession,
          is_primary_contact: true,
          status: 'pending'
        }])

      if (requestError && !requestError.message.includes('duplicate')) {
        console.error('Request error:', requestError)
      }

      // 3. Envoyer l'email de notification aux admins
      await sendAccessRequestEmail({
        name: fullName,
        email: form.email.toLowerCase().trim(),
        message: `
Nouvelle demande d'inscription:
- Prénom: ${form.firstName}
- Nom: ${form.lastName}
- Téléphone: ${form.phone || 'Non fourni'}
- Compagnie/Clinique: ${form.companyName}
- Profession: ${PROFESSION_TYPES.find(p => p.value === form.profession)?.label || form.professionOther}
- Personne ressource: Oui (premier inscrit)`
      })

      // 4. Afficher le message de succès
      setMode('success')

    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('Ce courriel est déjà utilisé. Essayez de vous connecter.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Styles du thème sombre
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1e2428',
    padding: '2rem'
  }

  const cardStyle = {
    background: '#2a3238',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: mode === 'signup' ? '520px' : '420px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(90, 154, 156, 0.1)',
    border: '1px solid #3a444c',
    position: 'relative'
  }

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '1px solid #3a444c',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    background: '#1e2428',
    color: '#e8edef',
    transition: 'all 0.2s',
    outline: 'none'
  }

  const labelStyle = {
    display: 'block',
    fontWeight: 500,
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: '#a8b4ba'
  }

  const buttonPrimaryStyle = {
    padding: '0.875rem 2rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    background: '#5a9a9c',
    color: 'white',
    transition: 'all 0.2s',
    width: '100%'
  }

  const buttonSecondaryStyle = {
    padding: '0.875rem 2rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid #3a444c',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    background: '#323a42',
    color: '#a8b4ba',
    transition: 'all 0.2s',
    width: '100%'
  }

  // Écran de succès après inscription
  if (mode === 'success') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(76, 175, 80, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#4caf50'
          }}>
            <Icons.Check />
          </div>
          
          <h2 style={{ 
            fontSize: '1.75rem', 
            marginBottom: '1rem', 
            color: '#e8edef',
            fontFamily: "'Cormorant Garamond', serif",
            textAlign: 'center'
          }}>
            Compte créé avec succès!
          </h2>
          
          <p style={{ color: '#a8b4ba', marginBottom: '1.5rem', textAlign: 'center' }}>
            Votre demande a été envoyée à l'administrateur.
          </p>
          
          <div style={{
            background: '#1e2428',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '2rem',
            textAlign: 'left',
            border: '1px solid #3a444c'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#e8edef' }}>
              Prochaines étapes:
            </p>
            <ol style={{ 
              margin: 0, 
              paddingLeft: '1.25rem', 
              color: '#a8b4ba', 
              fontSize: '0.9rem',
              lineHeight: 1.8
            }}>
              <li>Vérifiez votre courriel et cliquez sur le lien de confirmation</li>
              <li>Attendez que l'administrateur active votre compte</li>
              <li>Vous recevrez un courriel une fois votre accès approuvé</li>
            </ol>
          </div>
          
          <button 
            onClick={() => switchMode('login')}
            style={buttonPrimaryStyle}
          >
            Retour à la connexion
          </button>
          
          {/* Copyright */}
          <div style={{ 
            marginTop: '2rem', 
            textAlign: 'center', 
            color: '#6e7a82',
            fontSize: '0.75rem'
          }}>
            COPYRIGHT © 2026 FACEHUB
          </div>
        </div>
      </div>
    )
  }

  // Écran de confirmation mot de passe envoyé
  if (mode === 'reset-sent') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(90, 154, 156, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#5a9a9c'
          }}>
            <Icons.Mail />
          </div>
          
          <h2 style={{ 
            fontSize: '1.75rem', 
            marginBottom: '1rem', 
            color: '#e8edef',
            fontFamily: "'Cormorant Garamond', serif",
            textAlign: 'center'
          }}>
            Courriel envoyé!
          </h2>
          
          <p style={{ 
            color: '#a8b4ba', 
            marginBottom: '1.5rem', 
            textAlign: 'center',
            fontSize: '0.95rem'
          }}>
            Vérifiez votre boîte de réception pour le lien de réinitialisation.
          </p>
          
          <button 
            onClick={() => switchMode('login')}
            style={buttonPrimaryStyle}
          >
            Retour à la connexion
          </button>
          
          {/* Copyright */}
          <div style={{ 
            marginTop: '2rem', 
            textAlign: 'center', 
            color: '#6e7a82',
            fontSize: '0.75rem'
          }}>
            COPYRIGHT © 2026 FACEHUB
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Logo en haut */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <FaceHubLogo size="small" />
        </div>

        {/* Bouton retour */}
        {(mode === 'signup' || mode === 'forgot') && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: '#a8b4ba',
              cursor: 'pointer',
              padding: '0.5rem 0',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            <Icons.ArrowLeft /> Retour à la connexion
          </button>
        )}

        {/* Titre */}
        <h2 style={{ 
          fontSize: '1.75rem', 
          marginBottom: '0.5rem', 
          color: '#e8edef',
          fontFamily: "'Cormorant Garamond', serif",
          textAlign: 'center'
        }}>
          {mode === 'login' && 'Connexion'}
          {mode === 'signup' && 'Créer un compte'}
          {mode === 'forgot' && 'Mot de passe oublié'}
        </h2>

        {mode === 'signup' && (
          <p style={{ 
            textAlign: 'center', 
            color: '#a8b4ba', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            Vous devenez la personne ressource de votre clinique
          </p>
        )}

        {mode === 'forgot' && (
          <p style={{ 
            textAlign: 'center', 
            color: '#a8b4ba', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            Entrez votre courriel ci-dessous. Le mot de passe doit contenir au moins 8 caractères.
          </p>
        )}

        {/* Message d'erreur */}
        {error && (
          <div style={{
            background: 'rgba(239, 83, 80, 0.15)',
            border: '1px solid rgba(239, 83, 80, 0.3)',
            borderRadius: '8px',
            padding: '0.875rem 1rem',
            marginBottom: '1rem',
            color: '#ef5350',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* FORMULAIRE DE CONNEXION */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Adresse courriel</label>
              <input
                type="email"
                style={inputStyle}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="votre@courriel.com"
                required
                autoComplete="email"
                onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                onBlur={(e) => e.target.style.borderColor = '#3a444c'}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={{ ...inputStyle, paddingRight: '3rem' }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                  onBlur={(e) => e.target.style.borderColor = '#3a444c'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6e7a82',
                    padding: '0.25rem'
                  }}
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                style={buttonPrimaryStyle}
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
              <button 
                type="button"
                onClick={() => switchMode('forgot')}
                style={buttonSecondaryStyle}
              >
                Mot de passe oublié
              </button>
            </div>
          </form>
        )}

        {/* FORMULAIRE MOT DE PASSE OUBLIÉ */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Adresse courriel</label>
              <input
                type="email"
                style={inputStyle}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="votre@courriel.com"
                required
                autoComplete="email"
                onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                onBlur={(e) => e.target.style.borderColor = '#3a444c'}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                style={buttonPrimaryStyle}
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
              <button 
                type="button"
                onClick={() => switchMode('login')}
                style={buttonSecondaryStyle}
              >
                Retour
              </button>
            </div>
          </form>
        )}

        {/* FORMULAIRE D'INSCRIPTION */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp}>
            {/* Prénom et Nom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Prénom *</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Jean"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                  onBlur={(e) => e.target.style.borderColor = '#3a444c'}
                />
              </div>
              <div>
                <label style={labelStyle}>Nom *</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Tremblay"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                  onBlur={(e) => e.target.style.borderColor = '#3a444c'}
                />
              </div>
            </div>

            {/* Courriel */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Adresse courriel *</label>
              <input
                type="email"
                style={inputStyle}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="votre@courriel.com"
                required
                autoComplete="email"
                onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                onBlur={(e) => e.target.style.borderColor = '#3a444c'}
              />
            </div>

            {/* Téléphone */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Téléphone</label>
              <input
                type="tel"
                style={inputStyle}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="514-555-1234"
                onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                onBlur={(e) => e.target.style.borderColor = '#3a444c'}
              />
            </div>

            {/* Nom de la compagnie/clinique */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Nom de votre compagnie ou clinique *</label>
              <input
                type="text"
                style={inputStyle}
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Ex: Clinique Esthétique Montréal"
                required
                onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                onBlur={(e) => e.target.style.borderColor = '#3a444c'}
              />
            </div>

            {/* Type de professionnel */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Type de professionnel *</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.profession}
                onChange={(e) => setForm({ ...form, profession: e.target.value })}
                required
                onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                onBlur={(e) => e.target.style.borderColor = '#3a444c'}
              >
                <option value="">Sélectionnez votre profession</option>
                {PROFESSION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Champ "Autre" si sélectionné */}
            {form.profession === 'autre' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Précisez votre profession *</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={form.professionOther}
                  onChange={(e) => setForm({ ...form, professionOther: e.target.value })}
                  placeholder="Votre profession"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                  onBlur={(e) => e.target.style.borderColor = '#3a444c'}
                />
              </div>
            )}

            {/* Mots de passe */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Mot de passe *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: '3rem' }}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 caractères"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                    onBlur={(e) => e.target.style.borderColor = '#3a444c'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6e7a82',
                      padding: '0.25rem'
                    }}
                  >
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirmer *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={inputStyle}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                  onBlur={(e) => e.target.style.borderColor = '#3a444c'}
                />
              </div>
            </div>

            {/* Captcha anti-robot */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>
                🤖 Anti-robot: <strong style={{ color: '#5a9a9c' }}>{captcha.question}</strong>
              </label>
              <input
                type="number"
                style={inputStyle}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Votre réponse"
                required
                onFocus={(e) => e.target.style.borderColor = '#5a9a9c'}
                onBlur={(e) => e.target.style.borderColor = '#3a444c'}
              />
            </div>

            <button 
              type="submit" 
              style={buttonPrimaryStyle}
              disabled={loading}
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>
        )}

        {/* Lien inscription */}
        {mode === 'login' && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#a8b4ba', fontSize: '0.9rem' }}>
              Pas encore de compte?{' '}
              <a 
                onClick={() => switchMode('signup')} 
                style={{ 
                  color: '#5a9a9c', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                S'inscrire
              </a>
            </p>
          </div>
        )}

        {/* Copyright */}
        <div style={{ 
          marginTop: '2rem', 
          textAlign: 'center', 
          color: '#6e7a82',
          fontSize: '0.75rem'
        }}>
          COPYRIGHT © 2026 FACEHUB
        </div>
      </div>
    </div>
  )
}
