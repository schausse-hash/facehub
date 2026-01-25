import { useState } from 'react'

// Icônes
const Icons = {
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  ArrowLeft: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  ArrowRight: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Zap: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  FileText: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Syringe: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
}

export default function PatientRegistration({ onBack, onComplete, session, userClinic }) {
  // États
  const [showTypeModal, setShowTypeModal] = useState(true)
  const [registrationType, setRegistrationType] = useState(null) // 'quick' ou 'full'
  const [currentStep, setCurrentStep] = useState(0)
  
  // Consentements
  const [consents, setConsents] = useState({
    botox: {
      agreed: false,
      signature: '',
      date: new Date().toISOString().split('T')[0]
    },
    filler: {
      agreed: false,
      signature: '',
      date: new Date().toISOString().split('T')[0]
    },
    photo: {
      agreed: false,
      signature: '',
      date: new Date().toISOString().split('T')[0]
    }
  })

  // Données patient (pour plus tard)
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthdate: '',
    address: '',
    city: '',
    postalCode: '',
    allergies: '',
    medicalHistory: '',
    medications: ''
  })

  const steps = [
    { id: 'botox', title: 'Botox Consent', icon: Icons.Syringe },
    { id: 'filler', title: 'Filler Consent', icon: Icons.Syringe },
    { id: 'photo', title: 'Photo Consent', icon: Icons.Camera },
    { id: 'registration', title: 'Patient Registration', icon: Icons.User }
  ]

  const handleSelectType = (type) => {
    setRegistrationType(type)
    setShowTypeModal(false)
  }

  const handleConsentChange = (type, field, value) => {
    setConsents(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  const canProceed = () => {
    const currentStepId = steps[currentStep].id
    if (currentStepId === 'botox') {
      return consents.botox.agreed && consents.botox.signature.length > 0
    }
    if (currentStepId === 'filler') {
      return consents.filler.agreed && consents.filler.signature.length > 0
    }
    if (currentStepId === 'photo') {
      return consents.photo.agreed && consents.photo.signature.length > 0
    }
    return true
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Modal choix du type d'inscription
  const renderTypeModal = () => (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Registration Type</h2>
          <button className="modal-close" onClick={onBack}><Icons.X /></button>
        </div>
        <div className="modal-body" style={{ padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
            Please select the registration type for this patient
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Quick Register */}
            <div 
              onClick={() => handleSelectType('quick')}
              style={{
                border: '2px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                background: 'var(--bg-card-hover)'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--primary)'
              }}>
                <Icons.Zap />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Quick Register
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Basic information only. Consent forms and full details can be completed later.
              </p>
            </div>

            {/* Full Register */}
            <div 
              onClick={() => handleSelectType('full')}
              style={{
                border: '2px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                background: 'var(--bg-card-hover)'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--primary)'
              }}>
                <Icons.FileText />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Full Register
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Complete registration with all consent forms and detailed patient information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Formulaire de consentement Botox
  const renderBotoxConsent = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icons.Syringe /> Botox Consent Form
        </h2>
      </div>
      <div className="card-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div style={{ 
          background: 'var(--bg-input)', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          lineHeight: '1.7',
          color: 'var(--text-secondary)'
        }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>BOTULINUM TOXIN (BOTOX®, DYSPORT®, XEOMIN®) INFORMED CONSENT</h3>
          
          <p><strong>INTRODUCTION:</strong></p>
          <p style={{ marginBottom: '1rem' }}>
            Botulinum Toxin is a protein complex produced by the bacterium Clostridium botulinum. 
            It is used to temporarily improve the appearance of moderate to severe lines and wrinkles.
          </p>

          <p><strong>TREATMENT AREAS MAY INCLUDE:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Forehead lines</li>
            <li>Frown lines (between the eyebrows)</li>
            <li>Crow's feet (lines around the eyes)</li>
            <li>Bunny lines (on the nose)</li>
            <li>Lip lines and lip flip</li>
            <li>Chin dimpling</li>
            <li>Neck bands</li>
            <li>Masseter (jaw) reduction</li>
            <li>Hyperhidrosis (excessive sweating)</li>
          </ul>

          <p><strong>RISKS AND COMPLICATIONS:</strong></p>
          <p style={{ marginBottom: '1rem' }}>
            As with any medical procedure, there are potential risks and side effects. These may include:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Pain, bruising, swelling, or redness at injection sites</li>
            <li>Headache or flu-like symptoms</li>
            <li>Temporary drooping of the eyelid or eyebrow</li>
            <li>Asymmetry or uneven results</li>
            <li>Allergic reactions (rare)</li>
            <li>Spread of toxin effects (rare)</li>
          </ul>

          <p><strong>CONTRAINDICATIONS:</strong></p>
          <p style={{ marginBottom: '1rem' }}>
            Treatment is not recommended if you:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Are pregnant or breastfeeding</li>
            <li>Have a neuromuscular disease (e.g., ALS, myasthenia gravis)</li>
            <li>Have an infection at the injection site</li>
            <li>Are allergic to any botulinum toxin product</li>
            <li>Are taking certain medications (aminoglycosides, blood thinners)</li>
          </ul>

          <p><strong>POST-TREATMENT INSTRUCTIONS:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Do not rub or massage treated areas for 24 hours</li>
            <li>Remain upright for 4 hours after treatment</li>
            <li>Avoid strenuous exercise for 24 hours</li>
            <li>Results typically appear within 3-7 days</li>
            <li>Full effects may take up to 14 days</li>
            <li>Results typically last 3-4 months</li>
          </ul>

          <p><strong>ACKNOWLEDGEMENT:</strong></p>
          <p>
            I have read and understand the above information. I have had the opportunity to ask questions 
            and all my questions have been answered to my satisfaction. I understand the risks, benefits, 
            and alternatives to this treatment. I consent to the administration of Botulinum Toxin injections.
          </p>
        </div>

        {/* Checkbox d'accord */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '1rem',
            background: consents.botox.agreed ? 'var(--success-bg)' : 'var(--bg-card-hover)',
            borderRadius: '8px',
            border: `1px solid ${consents.botox.agreed ? 'var(--success)' : 'var(--border)'}`
          }}>
            <input
              type="checkbox"
              checked={consents.botox.agreed}
              onChange={(e) => handleConsentChange('botox', 'agreed', e.target.checked)}
              style={{ width: '20px', height: '20px', marginTop: '2px' }}
            />
            <span style={{ color: 'var(--text-primary)' }}>
              I have read, understood, and agree to the terms outlined in this Botox consent form. 
              I acknowledge that I have been given the opportunity to ask questions and that all 
              my questions have been answered satisfactorily.
            </span>
          </label>
        </div>

        {/* Signature */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Patient Signature (Type Full Name) *</label>
            <input
              type="text"
              className="form-input"
              value={consents.botox.signature}
              onChange={(e) => handleConsentChange('botox', 'signature', e.target.value)}
              placeholder="Type your full legal name"
              style={{ fontFamily: "'Brush Script MT', cursive", fontSize: '1.2rem' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={consents.botox.date}
              onChange={(e) => handleConsentChange('botox', 'date', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )

  // Formulaire de consentement Filler
  const renderFillerConsent = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icons.Syringe /> Dermal Filler Consent Form
        </h2>
      </div>
      <div className="card-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div style={{ 
          background: 'var(--bg-input)', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          lineHeight: '1.7',
          color: 'var(--text-secondary)'
        }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>DERMAL FILLER INFORMED CONSENT</h3>
          
          <p><strong>INTRODUCTION:</strong></p>
          <p style={{ marginBottom: '1rem' }}>
            Dermal fillers are injectable gels used to restore volume, smooth lines, soften creases, 
            and enhance facial contours. Common fillers include Hyaluronic Acid (Juvederm®, Restylane®, 
            Belotero®), Calcium Hydroxylapatite (Radiesse®), and Poly-L-lactic Acid (Sculptra®).
          </p>

          <p><strong>TREATMENT AREAS MAY INCLUDE:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Nasolabial folds (smile lines)</li>
            <li>Marionette lines</li>
            <li>Lips (volume and definition)</li>
            <li>Cheeks and midface</li>
            <li>Under-eye hollows (tear troughs)</li>
            <li>Jawline and chin</li>
            <li>Temples</li>
            <li>Nose (non-surgical rhinoplasty)</li>
            <li>Hands</li>
          </ul>

          <p><strong>RISKS AND COMPLICATIONS:</strong></p>
          <p style={{ marginBottom: '1rem' }}>
            As with any medical procedure, there are potential risks and side effects:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Pain, bruising, swelling, redness at injection sites</li>
            <li>Lumps, bumps, or irregularities</li>
            <li>Asymmetry</li>
            <li>Infection</li>
            <li>Allergic reaction</li>
            <li>Migration of filler material</li>
            <li>Nodules or granulomas</li>
            <li>Skin necrosis (tissue death) - rare but serious</li>
            <li>Vascular occlusion (blocked blood vessel) - rare but serious</li>
            <li>Blindness (extremely rare)</li>
          </ul>

          <p><strong>CONTRAINDICATIONS:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Pregnancy or breastfeeding</li>
            <li>Active skin infection or inflammation in treatment area</li>
            <li>History of severe allergies or anaphylaxis</li>
            <li>Autoimmune diseases</li>
            <li>Bleeding disorders or use of blood thinners</li>
            <li>Previous adverse reaction to fillers</li>
          </ul>

          <p><strong>POST-TREATMENT INSTRUCTIONS:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Apply ice to reduce swelling</li>
            <li>Avoid touching or massaging the area for 24-48 hours</li>
            <li>Avoid strenuous exercise for 24-48 hours</li>
            <li>Avoid extreme heat (sauna, hot tub) for 2 weeks</li>
            <li>Avoid dental procedures for 2 weeks</li>
            <li>Results are immediate but may take 2 weeks to fully settle</li>
            <li>Duration varies by product (6 months to 2 years)</li>
          </ul>

          <p><strong>EMERGENCY PROTOCOL:</strong></p>
          <p style={{ marginBottom: '1rem' }}>
            If you experience severe pain, blanching (whitening) of the skin, or changes in vision 
            after treatment, contact our clinic immediately or go to the emergency room. These could 
            be signs of vascular compromise requiring immediate treatment.
          </p>

          <p><strong>ACKNOWLEDGEMENT:</strong></p>
          <p>
            I have read and understand the above information regarding dermal filler treatment. 
            I have had the opportunity to ask questions and all my questions have been answered. 
            I understand the risks, benefits, and alternatives. I consent to dermal filler treatment.
          </p>
        </div>

        {/* Checkbox d'accord */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '1rem',
            background: consents.filler.agreed ? 'var(--success-bg)' : 'var(--bg-card-hover)',
            borderRadius: '8px',
            border: `1px solid ${consents.filler.agreed ? 'var(--success)' : 'var(--border)'}`
          }}>
            <input
              type="checkbox"
              checked={consents.filler.agreed}
              onChange={(e) => handleConsentChange('filler', 'agreed', e.target.checked)}
              style={{ width: '20px', height: '20px', marginTop: '2px' }}
            />
            <span style={{ color: 'var(--text-primary)' }}>
              I have read, understood, and agree to the terms outlined in this Dermal Filler consent form. 
              I acknowledge that I have been informed of the risks including vascular occlusion and 
              understand the emergency protocol.
            </span>
          </label>
        </div>

        {/* Signature */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Patient Signature (Type Full Name) *</label>
            <input
              type="text"
              className="form-input"
              value={consents.filler.signature}
              onChange={(e) => handleConsentChange('filler', 'signature', e.target.value)}
              placeholder="Type your full legal name"
              style={{ fontFamily: "'Brush Script MT', cursive", fontSize: '1.2rem' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={consents.filler.date}
              onChange={(e) => handleConsentChange('filler', 'date', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )

  // Formulaire de consentement Photo
  const renderPhotoConsent = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icons.Camera /> Photo Consent Form
        </h2>
      </div>
      <div className="card-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div style={{ 
          background: 'var(--bg-input)', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          lineHeight: '1.7',
          color: 'var(--text-secondary)'
        }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>PHOTOGRAPH AND VIDEO CONSENT FORM</h3>
          
          <p><strong>PURPOSE:</strong></p>
          <p style={{ marginBottom: '1rem' }}>
            Photographs and/or videos are taken as part of your medical record to document your condition 
            before, during, and after treatment. These images help us track your progress and provide 
            the best possible care.
          </p>

          <p><strong>USE OF PHOTOGRAPHS/VIDEOS:</strong></p>
          <p style={{ marginBottom: '1rem' }}>
            Your photographs and/or videos may be used for the following purposes:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Medical Records:</strong> Documentation of your treatment progress (required)</li>
            <li><strong>Educational Purposes:</strong> Training of medical staff and students</li>
            <li><strong>Marketing/Promotional:</strong> Website, social media, brochures, presentations</li>
            <li><strong>Scientific Publications:</strong> Medical journals, conferences, research</li>
          </ul>

          <p><strong>CONFIDENTIALITY:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Your photographs will be stored securely in compliance with privacy regulations</li>
            <li>For medical records: Your identity is protected and images are part of your confidential file</li>
            <li>For marketing/educational use: Your identity may or may not be recognizable</li>
            <li>No photographs will be used without your explicit consent for each use category</li>
          </ul>

          <p><strong>YOUR RIGHTS:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>You have the right to refuse photography (except for medical documentation)</li>
            <li>You may withdraw consent for marketing/educational use at any time</li>
            <li>Withdrawal of consent does not affect your treatment or care</li>
            <li>You may request copies of your photographs for your own records</li>
          </ul>

          <p><strong>ACKNOWLEDGEMENT:</strong></p>
          <p>
            I understand that photographs and/or videos will be taken as part of my medical record. 
            I consent to the use of my images as indicated by my selections below.
          </p>
        </div>

        {/* Options de consentement */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            I consent to the use of my photographs/videos for:
          </p>
          
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.75rem 1rem',
            background: 'var(--bg-card-hover)',
            borderRadius: '8px',
            marginBottom: '0.5rem',
            border: '1px solid var(--border)'
          }}>
            <input type="checkbox" checked disabled style={{ width: '18px', height: '18px' }} />
            <span style={{ color: 'var(--text-primary)' }}>
              <strong>Medical Records</strong> (Required for treatment)
            </span>
          </label>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.75rem 1rem',
            background: 'var(--bg-card-hover)',
            borderRadius: '8px',
            marginBottom: '0.5rem',
            border: '1px solid var(--border)'
          }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            <span style={{ color: 'var(--text-primary)' }}>
              <strong>Educational Purposes</strong> (Training, presentations)
            </span>
          </label>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.75rem 1rem',
            background: 'var(--bg-card-hover)',
            borderRadius: '8px',
            marginBottom: '0.5rem',
            border: '1px solid var(--border)'
          }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            <span style={{ color: 'var(--text-primary)' }}>
              <strong>Marketing/Promotional</strong> (Website, social media, brochures)
            </span>
          </label>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.75rem 1rem',
            background: 'var(--bg-card-hover)',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            <span style={{ color: 'var(--text-primary)' }}>
              <strong>Scientific Publications</strong> (Medical journals, research)
            </span>
          </label>
        </div>

        {/* Checkbox principal */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '1rem',
            background: consents.photo.agreed ? 'var(--success-bg)' : 'var(--bg-card-hover)',
            borderRadius: '8px',
            border: `1px solid ${consents.photo.agreed ? 'var(--success)' : 'var(--border)'}`
          }}>
            <input
              type="checkbox"
              checked={consents.photo.agreed}
              onChange={(e) => handleConsentChange('photo', 'agreed', e.target.checked)}
              style={{ width: '20px', height: '20px', marginTop: '2px' }}
            />
            <span style={{ color: 'var(--text-primary)' }}>
              I have read and understand this photo consent form. I agree to have photographs and/or 
              videos taken for the purposes indicated above. I understand I may withdraw consent for 
              non-medical uses at any time.
            </span>
          </label>
        </div>

        {/* Signature */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Patient Signature (Type Full Name) *</label>
            <input
              type="text"
              className="form-input"
              value={consents.photo.signature}
              onChange={(e) => handleConsentChange('photo', 'signature', e.target.value)}
              placeholder="Type your full legal name"
              style={{ fontFamily: "'Brush Script MT', cursive", fontSize: '1.2rem' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={consents.photo.date}
              onChange={(e) => handleConsentChange('photo', 'date', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )

  // Placeholder pour le formulaire d'inscription (à développer)
  const renderRegistrationForm = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icons.User /> Patient Registration
        </h2>
      </div>
      <div className="card-body">
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
          Le formulaire d'inscription complet sera ajouté ici.
        </p>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (steps[currentStep].id) {
      case 'botox': return renderBotoxConsent()
      case 'filler': return renderFillerConsent()
      case 'photo': return renderPhotoConsent()
      case 'registration': return renderRegistrationForm()
      default: return null
    }
  }

  // Si modal de type est affiché
  if (showTypeModal) {
    return renderTypeModal()
  }

  return (
    <div>
      {/* Header */}
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Home</a> | 
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}> Patients</a> | 
        Register Patient Internally
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">REGISTER PATIENT INTERNALLY</h1>
          <p className="page-subtitle">
            {registrationType === 'quick' ? 'Quick Registration' : 'Full Registration'} - 
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        overflowX: 'auto'
      }}>
        {steps.map((step, index) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              onClick={() => index <= currentStep && setCurrentStep(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: index <= currentStep ? 'pointer' : 'default',
                background: index === currentStep ? 'var(--primary)' : 
                           index < currentStep ? 'var(--success-bg)' : 'var(--bg-card-hover)',
                color: index === currentStep ? 'white' : 
                       index < currentStep ? 'var(--success)' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              {index < currentStep ? (
                <Icons.Check />
              ) : (
                <step.icon />
              )}
              <span style={{ fontSize: '0.85rem', fontWeight: '500', whiteSpace: 'nowrap' }}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div style={{
                width: '30px',
                height: '2px',
                background: index < currentStep ? 'var(--success)' : 'var(--border)',
                margin: '0 0.5rem'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Current Form */}
      {renderCurrentStep()}

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border)'
      }}>
        <button 
          className="btn btn-outline"
          onClick={currentStep === 0 ? onBack : handlePrevious}
        >
          <Icons.ArrowLeft />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceed()}
          style={{ opacity: canProceed() ? 1 : 0.5 }}
        >
          {currentStep === steps.length - 1 ? 'Complete Registration' : 'Next'}
          <Icons.ArrowRight />
        </button>
      </div>
    </div>
  )
}
