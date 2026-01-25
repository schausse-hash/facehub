// Service d'envoi d'emails avec Resend
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY
const ADMIN_EMAILS = ['schausse@gmail.com', 'schausse@dentiste.com']

export async function sendAccessRequestEmail(requestData) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY non configurée - email non envoyé')
    return { success: false, error: 'API key missing' }
  }

  const { name, email, message } = requestData
  const date = new Date().toLocaleString('fr-CA', { 
    dateStyle: 'long', 
    timeStyle: 'short' 
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #d4a574 0%, #e8c9a8 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { color: #0f1419; margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #d4a574; }
        .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; color: #333; margin-top: 5px; }
        .button { display: inline-block; background: #d4a574; color: #0f1419; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Nouvelle demande d'accès</h1>
        </div>
        <div class="content">
          <p>Une nouvelle personne souhaite accéder à FaceHub :</p>
          
          <div class="info-box">
            <div class="label">Nom complet</div>
            <div class="value">${name}</div>
          </div>
          
          <div class="info-box">
            <div class="label">Adresse email</div>
            <div class="value">${email}</div>
          </div>
          
          ${message ? `
          <div class="info-box">
            <div class="label">Message</div>
            <div class="value">${message}</div>
          </div>
          ` : ''}
          
          <div class="info-box">
            <div class="label">Date de la demande</div>
            <div class="value">${date}</div>
          </div>
          
          <center>
            <a href="https://facehub.ca" class="button">Gérer les demandes</a>
          </center>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par FaceHub.</p>
          <p>Connectez-vous à la section Admin pour approuver ou rejeter cette demande.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'FaceHub <onboarding@resend.dev>',
        to: ADMIN_EMAILS,
        subject: `🔔 Nouvelle demande d'accès - ${name}`,
        html: htmlContent
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('Email envoyé avec succès:', data)
      return { success: true, data }
    } else {
      console.error('Erreur Resend:', data)
      return { success: false, error: data }
    }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error: error.message }
  }
}

export async function sendAccessApprovedEmail(userEmail, userName) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY non configurée - email non envoyé')
    return { success: false, error: 'API key missing' }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #d4a574 0%, #e8c9a8 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { color: #0f1419; margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; text-align: center; }
        .success-icon { font-size: 60px; margin-bottom: 20px; }
        .button { display: inline-block; background: #d4a574; color: #0f1419; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Accès approuvé !</h1>
        </div>
        <div class="content">
          <div class="success-icon">🎉</div>
          <h2>Bienvenue ${userName} !</h2>
          <p>Votre demande d'accès à FaceHub a été approuvée.</p>
          <p>Vous pouvez maintenant vous connecter avec votre adresse email et votre mot de passe.</p>
          <a href="https://facehub.ca" class="button">Se connecter à FaceHub</a>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par FaceHub.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'FaceHub <onboarding@resend.dev>',
        to: [userEmail],
        subject: '✅ Votre accès à FaceHub a été approuvé',
        html: htmlContent
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('Email d\'approbation envoyé:', data)
      return { success: true, data }
    } else {
      console.error('Erreur Resend:', data)
      return { success: false, error: data }
    }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error: error.message }
  }
}
