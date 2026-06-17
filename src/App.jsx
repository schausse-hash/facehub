import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import PublicRegistration from './components/PublicRegistration'
import PublicBooking from './components/PublicBooking'
import ConsentSigning from './components/ConsentSigning'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [registrationToken, setRegistrationToken] = useState(null)
  const [bookingClinicId, setBookingClinicId] = useState(null)
  const [consentToken, setConsentToken] = useState(null)

  useEffect(() => {
    // Vérifier si on est sur une page publique
    const path = window.location.pathname
    setCurrentPath(path)
    
    // Extraire le token si on est sur /register/:token
    const registerMatch = path.match(/^\/register\/([a-zA-Z0-9]+)$/)
    if (registerMatch) {
      setRegistrationToken(registerMatch[1])
      setLoading(false)
      return // Ne pas charger la session pour les pages publiques
    }

    // Extraire le clinicId si on est sur /booking/:clinicId
    const bookingMatch = path.match(/^\/booking\/([a-zA-Z0-9-]+)$/)
    if (bookingMatch) {
      setBookingClinicId(bookingMatch[1])
      setLoading(false)
      return // Ne pas charger la session pour les pages publiques
    }

    // Extraire le token si on est sur /consent/:token (signature de consentement)
    const consentMatch = path.match(/^\/consent\/([a-zA-Z0-9]+)$/)
    if (consentMatch) {
      setConsentToken(consentMatch[1])
      setLoading(false)
      return // Ne pas charger la session pour les pages publiques
    }

    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    // Écouter les changements d'URL (pour navigation sans rechargement)
    const handlePopState = () => {
      const newPath = window.location.pathname
      setCurrentPath(newPath)
      
      const regMatch = newPath.match(/^\/register\/([a-zA-Z0-9]+)$/)
      if (regMatch) {
        setRegistrationToken(regMatch[1])
        setBookingClinicId(null)
      } else {
        setRegistrationToken(null)
      }

      const bookMatch = newPath.match(/^\/booking\/([a-zA-Z0-9-]+)$/)
      if (bookMatch) {
        setBookingClinicId(bookMatch[1])
        setRegistrationToken(null)
      } else {
        setBookingClinicId(null)
      }

      const consentM = newPath.match(/^\/consent\/([a-zA-Z0-9]+)$/)
      setConsentToken(consentM ? consentM[1] : null)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  // Page d'inscription publique (pas besoin d'être connecté)
  if (registrationToken) {
    return <PublicRegistration token={registrationToken} />
  }

  // Page de réservation publique (pas besoin d'être connecté)
  if (bookingClinicId) {
    return <PublicBooking clinicId={bookingClinicId} />
  }

  // Page de signature de consentement (par token, pas besoin d'être connecté)
  if (consentToken) {
    return <ConsentSigning token={consentToken} />
  }

  // Pages authentifiées
  return session ? <Dashboard session={session} /> : <Auth />
}

export default App
