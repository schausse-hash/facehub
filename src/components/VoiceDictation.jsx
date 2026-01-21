import { useState, useRef, useEffect } from 'react'

const Icons = {
  Mic: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  MicOff: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>,
  Sparkles: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Copy: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Refresh: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Settings: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
}

// Formats de note médicale disponibles
const NOTE_FORMATS = [
  { id: 'soap', label: 'SOAP', description: 'Subjective, Objective, Assessment, Plan' },
  { id: 'consultation', label: 'Consultation', description: 'Format consultation esthétique' },
  { id: 'treatment', label: 'Traitement', description: 'Note de traitement Botox/Filler' },
  { id: 'followup', label: 'Suivi', description: 'Note de suivi post-traitement' },
  { id: 'free', label: 'Libre', description: 'Correction grammaticale seulement' },
]

// Prompts système pour chaque format
const FORMAT_PROMPTS = {
  soap: `Tu es un assistant médical expert. Reformate le texte dicté suivant en note SOAP professionnelle:
- S (Subjectif): Plaintes et historique du patient
- O (Objectif): Observations cliniques, signes vitaux, examens
- A (Analyse): Diagnostic ou impression clinique
- P (Plan): Traitements, prescriptions, suivis recommandés

Corrige la grammaire et l'orthographe. Garde un ton professionnel et concis.`,

  consultation: `Tu es un assistant pour une clinique d'esthétique médicale. Reformate le texte dicté en note de consultation professionnelle:
- Motif de consultation
- Historique esthétique
- Examen et zones concernées
- Attentes du patient
- Plan de traitement proposé
- Consentement et informations données

Corrige la grammaire. Utilise la terminologie médicale appropriée.`,

  treatment: `Tu es un assistant pour une clinique d'esthétique. Reformate le texte dicté en note de traitement:
- Zones traitées
- Produit utilisé et quantités (unités Botox, ml de filler)
- Technique d'injection
- Réaction immédiate
- Instructions post-traitement données
- Prochain rendez-vous suggéré

Sois précis sur les dosages et les zones anatomiques.`,

  followup: `Tu es un assistant médical. Reformate le texte dicté en note de suivi:
- Date du traitement initial
- Évolution depuis le traitement
- Satisfaction du patient
- Observations cliniques
- Ajustements ou retouches nécessaires
- Recommandations

Garde un ton professionnel et note tout effet indésirable mentionné.`,

  free: `Tu es un correcteur de texte médical. Corrige la grammaire, l'orthographe et la ponctuation du texte suivant sans modifier sa structure. Améliore la clarté si nécessaire tout en gardant le sens original.`
}

export default function VoiceDictation({ 
  onInsertText, 
  onClose, 
  initialText = '',
  apiKey = null, // Clé API OpenAI ou Claude (optionnel)
  apiProvider = 'none' // 'openai', 'claude', ou 'none'
}) {
  const [isListening, setIsListening] = useState(false)
  const [rawText, setRawText] = useState(initialText)
  const [formattedText, setFormattedText] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('consultation')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const recognitionRef = useRef(null)
  const textareaRef = useRef(null)

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'fr-FR'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setRawText(prev => prev + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Erreur de reconnaissance: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Redémarrer automatiquement si toujours en mode écoute
          try {
            recognitionRef.current.start()
          } catch (e) {
            setIsListening(false)
          }
        }
      }
    } else {
      setError('La reconnaissance vocale n\'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      setError('')
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (e) {
        setError('Impossible de démarrer la reconnaissance vocale')
      }
    }
  }

  // Traitement local (sans API)
  const processTextLocally = (text) => {
    // Corrections basiques
    let processed = text
      .replace(/\s+/g, ' ')
      .replace(/\s+\./g, '.')
      .replace(/\s+,/g, ',')
      .replace(/\.\s+([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`)
      .trim()
    
    // Capitaliser la première lettre
    if (processed.length > 0) {
      processed = processed.charAt(0).toUpperCase() + processed.slice(1)
    }
    
    return processed
  }

  // Traitement avec API IA
  const processWithAI = async (text, format) => {
    if (!apiKey || apiProvider === 'none') {
      return processTextLocally(text)
    }

    const systemPrompt = FORMAT_PROMPTS[format]
    
    try {
      if (apiProvider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ],
            temperature: 0.3
          })
        })
        
        const data = await response.json()
        if (data.error) throw new Error(data.error.message)
        return data.choices[0].message.content
      } 
      else if (apiProvider === 'claude') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: 'user', content: text }]
          })
        })
        
        const data = await response.json()
        if (data.error) throw new Error(data.error.message)
        return data.content[0].text
      }
    } catch (err) {
      console.error('API Error:', err)
      throw err
    }
  }

  const handleFormat = async () => {
    if (!rawText.trim()) {
      setError('Aucun texte à formater')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const result = await processWithAI(rawText, selectedFormat)
      setFormattedText(result)
    } catch (err) {
      setError(`Erreur lors du formatage: ${err.message}`)
      // Fallback vers traitement local
      setFormattedText(processTextLocally(rawText))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Impossible de copier le texte')
    }
  }

  const handleInsert = () => {
    const textToInsert = formattedText || rawText
    if (onInsertText && textToInsert.trim()) {
      onInsertText(textToInsert)
      if (onClose) onClose()
    }
  }

  const handleClear = () => {
    setRawText('')
    setFormattedText('')
    setError('')
  }

  return (
    <div className="dictation-container">
      {/* Header */}
      <div className="dictation-header">
        <h3>
          <span style={{ width: 24, height: 24, display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
            <Icons.Mic />
          </span>
          Dictée vocale
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowSettings(!showSettings)}
            title="Paramètres"
          >
            <Icons.Settings />
          </button>
          {onClose && (
            <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="dictation-settings">
          <div className="form-group">
            <label className="form-label">Format de note</label>
            <select 
              className="form-select"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {NOTE_FORMATS.map(format => (
                <option key={format.id} value={format.id}>
                  {format.label} - {format.description}
                </option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            {apiProvider === 'none' 
              ? '⚠️ Mode hors-ligne: corrections grammaticales basiques seulement'
              : `✓ Connecté à ${apiProvider === 'openai' ? 'OpenAI' : 'Claude'} pour le formatage intelligent`
            }
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="dictation-error">
          {error}
        </div>
      )}

      {/* Recording Section */}
      <div className="dictation-record-section">
        <button 
          className={`dictation-mic-btn ${isListening ? 'recording' : ''}`}
          onClick={toggleListening}
        >
          <span style={{ width: 32, height: 32 }}>
            {isListening ? <Icons.MicOff /> : <Icons.Mic />}
          </span>
        </button>
        <div className="dictation-status">
          {isListening ? (
            <>
              <span className="recording-indicator"></span>
              Enregistrement en cours... Parlez maintenant
            </>
          ) : (
            'Cliquez pour commencer la dictée'
          )}
        </div>
      </div>

      {/* Raw Text */}
      <div className="dictation-section">
        <div className="dictation-section-header">
          <label className="form-label" style={{ margin: 0 }}>Texte dicté</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleCopy(rawText)}
              disabled={!rawText}
            >
              {copied ? <Icons.Check /> : <Icons.Copy />}
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleClear}
              disabled={!rawText && !formattedText}
            >
              <Icons.Trash />
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          className="form-input dictation-textarea"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Le texte dicté apparaîtra ici... Vous pouvez aussi taper directement."
          rows={6}
        />
      </div>

      {/* Format Button */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
        <button 
          className="btn btn-secondary"
          onClick={handleFormat}
          disabled={!rawText.trim() || isProcessing}
        >
          <Icons.Sparkles />
          {isProcessing ? 'Traitement...' : 'Corriger et formater'}
        </button>
      </div>

      {/* Formatted Text */}
      {formattedText && (
        <div className="dictation-section">
          <div className="dictation-section-header">
            <label className="form-label" style={{ margin: 0 }}>
              Texte formaté ({NOTE_FORMATS.find(f => f.id === selectedFormat)?.label})
            </label>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleCopy(formattedText)}
            >
              <Icons.Copy />
            </button>
          </div>
          <div className="dictation-formatted-text">
            {formattedText.split('\n').map((line, i) => (
              <p key={i} style={{ margin: line.trim() ? '0.5rem 0' : '0.25rem 0' }}>
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="dictation-actions">
        {onClose && (
          <button className="btn btn-outline" onClick={onClose}>
            Annuler
          </button>
        )}
        <button 
          className="btn btn-primary"
          onClick={handleInsert}
          disabled={!rawText.trim() && !formattedText.trim()}
        >
          <Icons.Check />
          Insérer dans la note
        </button>
      </div>

      <style>{`
        .dictation-container {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .dictation-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dictation-header h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
        }

        .dictation-settings {
          padding: 1rem 1.5rem;
          background: var(--bg-dark);
          border-bottom: 1px solid var(--border);
        }

        .dictation-error {
          margin: 1rem 1.5rem 0;
          padding: 0.75rem 1rem;
          background: var(--danger-bg);
          color: var(--danger);
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .dictation-record-section {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          background: var(--bg-dark);
        }

        .dictation-mic-btn {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid var(--border);
          background: var(--bg-card);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .dictation-mic-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          transform: scale(1.05);
        }

        .dictation-mic-btn.recording {
          border-color: var(--danger);
          color: var(--danger);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
        }

        .dictation-status {
          font-size: 0.9rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .recording-indicator {
          width: 10px;
          height: 10px;
          background: var(--danger);
          border-radius: 50%;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .dictation-section {
          padding: 1rem 1.5rem;
        }

        .dictation-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .dictation-textarea {
          min-height: 120px;
          resize: vertical;
          font-family: inherit;
        }

        .dictation-formatted-text {
          background: var(--bg-dark);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1rem;
          font-size: 0.95rem;
          line-height: 1.6;
          max-height: 300px;
          overflow-y: auto;
        }

        .dictation-actions {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
      `}</style>
    </div>
  )
}
