import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import PublicRegistration from './components/PublicRegistration'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [registrationToken, setRegistrationToken] = useState(null)

  useEffect(() => {
    // Vérifier si on est sur une page d'inscription publique
    const path = window.location.pathname
    setCurrentPath(path)
    
    // Extraire le token si on est sur /register/:token
    const registerMatch = path.match(/^\/register\/([a-zA-Z0-9]+)$/)
    if (registerMatch) {
      setRegistrationToken(registerMatch[1])
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
      
      const match = newPath.match(/^\/register\/([a-zA-Z0-9]+)$/)
      if (match) {
        setRegistrationToken(match[1])
      } else {
        setRegistrationToken(null)
      }
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

  // Pages authentifiées
  return session ? <Dashboard session={session} /> : <Auth />
}

export default App
