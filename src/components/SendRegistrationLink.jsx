import { useState } from 'react'
import { supabase } from '../supabaseClient'

// Icônes
const Icons = {
  Link: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Copy: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Refresh: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  QrCode: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>,
  Info: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Settings: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
}

export default function SendRegistrationLink({ onBack, session, userClinic, onNavigateToConsentSettings }) {
  // États
  const [registrationType, setRegistrationType] = useState('full')
  const [selectedConsents, setSelectedConsents] = useState({
    botox: true,
    filler: true,
    photo: true
  })
  const [generating, setGenerating] = useState(false)
  const [linkGenerated, setLinkGenerated] = useState(false)
  const [registrationLink, setRegistrationLink] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)

  // Générer un token unique
  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }

  // Générer le lien
  const handleGenerateLink = async () => {
    setGenerating(true)
    
    try {
      const token = generateToken()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 14) // Expire dans 14 jours
      
      // Sauvegarder le lien dans la base de données
      const { error } = await supabase
        .from('registration_links')
        .insert([{
          token: token,
          clinic_id: userClinic?.id || null,
          created_by: session.user.id,
          registration_type: registrationType,
          consents: selectedConsents,
          expires_at: expiresAt.toISOString(),
          used: false
        }])
      
      if (error) {
        // Si la table n'existe pas, on continue quand même pour la démo
        console.warn('Could not save to database:', error.message)
      }
      
      // Générer l'URL (en production, ce serait votre domaine)
      const baseUrl = window.location.origin
      const link = `${baseUrl}/register/${token}`
      setRegistrationLink(link)
      
      // Générer le QR Code via une API gratuite
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`
      setQrCodeUrl(qrUrl)
      
      setLinkGenerated(true)
      
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating link: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  // Copier le lien
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback pour les navigateurs plus anciens
      const textarea = document.createElement('textarea')
      textarea.value = registrationLink
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Rafraîchir (générer un nouveau lien)
  const handleRefresh = () => {
    setLinkGenerated(false)
    setRegistrationLink('')
    setQrCodeUrl('')
    setCopied(false)
  }

  // Styles
  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden'
  }

  const cardBodyStyle = {
    padding: '1.5rem'
  }

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem'
  }

  const textareaStyle = {
    width: '100%',
    padding: '1rem',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    resize: 'none',
    minHeight: '80px',
    fontFamily: 'monospace'
  }

  // Vue formulaire (avant génération)
  const renderForm = () => (
    <div style={cardStyle}>
      <div style={cardBodyStyle}>
        {/* Registration Type */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: '600', marginBottom: '0.75rem', display: 'block', color: 'var(--text-primary)' }}>
            Type d'inscription :
          </label>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input
                type="radio"
                name="regType"
                checked={registrationType === 'full'}
                onChange={() => setRegistrationType('full')}
              />
              Inscription complète
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input
                type="radio"
                name="regType"
                checked={registrationType === 'quick'}
                onChange={() => setRegistrationType('quick')}
              />
              Inscription rapide
            </label>
          </div>
        </div>

        {/* Consent Forms */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: 'var(--text-primary)' }}>
            Formulaires de consentement :
          </label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Sélectionnez les formulaires de consentement à joindre à l'inscription du patient.
          </p>
          
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={selectedConsents.botox}
              onChange={(e) => setSelectedConsents(prev => ({ ...prev, botox: e.target.checked }))}
            />
            Consentement Toxine Botulique
          </label>
          
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={selectedConsents.filler}
              onChange={(e) => setSelectedConsents(prev => ({ ...prev, filler: e.target.checked }))}
            />
            Consentement Agents de Comblement
          </label>
          
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={selectedConsents.photo}
              onChange={(e) => setSelectedConsents(prev => ({ ...prev, photo: e.target.checked }))}
            />
            Consentement Photo
          </label>
        </div>

        {/* Instructions */}
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Once you've selected the necessary forms, click Submit to generate the registration link or QR code.
        </p>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary"
            onClick={handleGenerateLink}
            disabled={generating}
            style={{ minWidth: '120px' }}
          >
            {generating ? (
              <>
                <span className="spinner" style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px',
                  display: 'inline-block'
                }}></span>
                Génération...
              </>
            ) : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  )

  // Vue résultat (après génération)
  const renderResult = () => (
    <div style={cardStyle}>
      <div style={cardBodyStyle}>
        {/* Link Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Lien d'inscription patient généré
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Copiez et collez le lien ci-dessous dans un courriel à votre patient :
          </p>
          
          <textarea
            style={textareaStyle}
            readOnly
            value={registrationLink}
          />
          
          <button 
            className="btn btn-primary"
            onClick={handleCopyLink}
            style={{ marginTop: '1rem' }}
          >
            {copied ? (
              <>
                <Icons.Check /> Copié !
              </>
            ) : (
              <>
                <Icons.Copy /> Copier le lien
              </>
            )}
          </button>
        </div>

        {/* QR Code Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Pour utilisation en clinique :
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Scannez le code QR ci-dessous sur une tablette de bureau pour permettre au patient de compléter son inscription :
          </p>
          
          <div style={{ 
            display: 'inline-block',
            padding: '1rem',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="Code QR" 
                style={{ display: 'block', width: '200px', height: '200px' }}
              />
            ) : (
              <div style={{ 
                width: '200px', 
                height: '200px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <Icons.QrCode />
              </div>
            )}
          </div>
        </div>

        {/* Included Forms */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Les formulaires suivants sont inclus dans ce lien d'inscription :
          </p>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1.5rem', 
            color: 'var(--text-primary)',
            fontSize: '0.9rem'
          }}>
            <li>Inscription patient (Détails personnels et historique médical)</li>
            {selectedConsents.botox && <li>Consentement Toxine Botulique</li>}
            {selectedConsents.filler && <li>Consentement Agents de Comblement</li>}
            {selectedConsents.photo && <li>Consentement Photo</li>}
          </ul>
        </div>

        {/* Refresh Button */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            🔄 <strong>Besoin d'un nouveau lien ou code ?</strong> Cliquez sur Actualiser pour en générer un nouveau.
          </p>
          <button 
            className="btn btn-outline"
            onClick={handleRefresh}
          >
            <Icons.Refresh /> Actualiser
          </button>
        </div>

        {/* Important Info */}
        <div style={{
          background: 'rgba(90, 154, 156, 0.1)',
          border: '1px solid var(--primary)',
          borderRadius: '12px',
          padding: '1.25rem'
        }}>
          <h4 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '1rem', 
            fontWeight: '600', 
            color: 'var(--primary)',
            marginBottom: '1rem'
          }}>
            <Icons.Info /> Information importante :
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1.5rem', 
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: '1.7'
          }}>
            <li>Chaque patient doit recevoir un lien d'inscription unique. Ne partagez pas le même lien avec plusieurs patients.</li>
            <li>Une fois que le patient a complété son inscription, le lien expirera automatiquement.</li>
            <li>Les liens sont valides pendant 14 jours à partir de leur création. Après cela, ils ne seront plus accessibles.</li>
          </ul>
          <p style={{ 
            marginTop: '1rem', 
            marginBottom: 0, 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)' 
          }}>
            Merci de nous aider à maintenir la confidentialité des patients et la sécurité des données.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}> Patients</a> | 
        Inscription par courriel
      </div>
      <h1 className="page-title">AUTO-INSCRIPTION PATIENT</h1>

      {/* Description */}
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '1.5rem',
        maxWidth: '700px'
      }}>
        Créez un lien d'inscription unique et un code QR que vous pouvez envoyer aux patients par courriel 
        ou leur faire scanner en clinique à l'aide d'une tablette ou de leur téléphone.
      </p>

      {/* Manage Consent Settings Link */}
      {!linkGenerated && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault()
              if (onNavigateToConsentSettings) {
                onNavigateToConsentSettings()
              }
            }}
            style={{ 
              color: 'var(--primary)', 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Icons.Settings /> Gérer les paramètres de consentement
          </a>
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: '700px' }}>
        {linkGenerated ? renderResult() : renderForm()}
      </div>

      {/* Copyright */}
      <div className="copyright">
        Droits d'auteur © {new Date().getFullYear()} FaceHub
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
