import { useState, useRef } from 'react'

const Icons = {
  Mic: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  MicOff: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>,
  Sparkles: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Copy: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Settings: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
}

const NOTE_FORMATS = [
  { id: 'soap', label: 'SOAP', description: 'Subjective, Objective, Assessment, Plan' },
  { id: 'consultation', label: 'Consultation', description: 'Format consultation esthétique' },
  { id: 'treatment', label: 'Traitement', description: 'Note de traitement Botox/Filler' },
  { id: 'followup', label: 'Suivi', description: 'Note de suivi post-traitement' },
  { id: 'free', label: 'Libre', description: 'Correction grammaticale seulement' },
]

const FORMAT_PROMPTS = {
  soap: `Tu es un assistant médical expert. Reformate le texte dicté suivant en note SOAP professionnelle. Corrige la grammaire et l'orthographe. Garde un ton professionnel et concis.`,
  consultation: `Tu es un assistant pour une clinique d'esthétique médicale. Reformate le texte dicté en note de consultation professionnelle. Corrige la grammaire. Utilise la terminologie médicale appropriée.`,
  treatment: `Tu es un assistant pour une clinique d'esthétique. Reformate le texte dicté en note de traitement. Sois précis sur les dosages et les zones anatomiques.`,
  followup: `Tu es un assistant médical. Reformate le texte dicté en note de suivi. Garde un ton professionnel.`,
  free: `Tu es un correcteur de texte médical. Corrige la grammaire, l'orthographe et la ponctuation du texte suivant sans modifier sa structure.`
}

export default function VoiceDictation({ 
  onInsertText, 
  onClose, 
  initialText = '',
  apiKey = null,
  apiProvider = 'none'
}) {
  const [isListening, setIsListening] = useState(false)
  const [rawText, setRawText] = useState(initialText)
  const [formattedText, setFormattedText] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('consultation')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  const [interimText, setInterimText] = useState('')
  
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('La reconnaissance vocale n\'est pas supportée. Utilisez Chrome.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'fr-FR'

    recognition.onstart = () => {
      console.log('Recognition started')
      setIsListening(true)
      isListeningRef.current = true
      setError('')
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript + ' '
        } else {
          interim += transcript
        }
      }

      if (final) {
        setRawText(prev => prev + final)
        setInterimText('')
      } else {
        setInterimText(interim)
      }
    }

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error)
      if (event.error !== 'no-speech') {
        setError(`Erreur: ${event.error}`)
      }
    }

    recognition.onend = () => {
      console.log('Recognition ended, isListening:', isListeningRef.current)
      if (isListeningRef.current) {
        try {
          recognition.start()
        } catch (e) {
          console.log('Could not restart:', e)
          setIsListening(false)
          isListeningRef.current = false
        }
      }
    }

    recognitionRef.current = recognition
    
    try {
      recognition.start()
    } catch (e) {
      setError('Impossible de démarrer la reconnaissance vocale')
    }
  }

  const stopListening = () => {
    isListeningRef.current = false
    setIsListening(false)
    setInterimText('')
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const processTextLocally = (te
