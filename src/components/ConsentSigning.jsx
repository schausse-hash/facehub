import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

// Page publique de signature d'un consentement (par token).
// Lecture sécurisée via get_consent_request ; enregistrement via sign_consent.
// Signature tracée : tactile au doigt (tablette) ou à la souris (à distance).
export default function ConsentSigning({ token }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [signerName, setSignerName] = useState('')
  const [hasSignature, setHasSignature] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  useEffect(() => { load() }, [token])

  const load = async () => {
    setLoading(true)
    try {
      const { data: res, error: err } = await supabase.rpc('get_consent_request', { p_token: token })
      if (err || !res || res.error) {
        setError(res?.error || 'invalid')
      } else {
        setData(res)
      }
    } catch (e) {
      setError('invalid')
    } finally {
      setLoading(false)
    }
  }

  // ---------- Pavé de signature ----------
  const getPos = (e) => {
    const c = canvasRef.current
    const r = c.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const startDraw = (e) => {
    e.preventDefault()
    drawing.current = true
    last.current = getPos(e)
  }
  const moveDraw = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const p = getPos(e)
    ctx.strokeStyle = '#1e2428'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!hasSignature) setHasSignature(true)
  }
  const endDraw = () => { drawing.current = false }
  const clearSignature = () => {
    const c = canvasRef.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
    setHasSignature(false)
  }

  const handleSubmit = async () => {
    setSubmitError('')
    if (!acknowledged) { setSubmitError('Veuillez confirmer que vous avez lu et compris le consentement.'); return }
    if (!signerName.trim()) { setSubmitError('Veuillez inscrire votre nom.'); return }
    if (!hasSignature) { setSubmitError('Veuillez signer dans le cadre.'); return }
    setSaving(true)
    try {
      const signature = canvasRef.current.toDataURL('image/png')
      const { data: res, error: err } = await supabase.rpc('sign_consent', {
        p_token: token,
        p_signature: signature,
        p_signer_name: signerName.trim(),
        p_checked: { acknowledged: true },
        p_filled: {},
      })
      if (err) throw err
      if (res?.error) {
        const m = {
          invalid: 'Ce lien de consentement est invalide.',
          signed: 'Ce consentement a déjà été signé.',
          expired: 'Ce lien a expiré.',
          no_signature: 'Signature manquante.',
        }
        throw new Error(m[res.error] || "L'enregistrement a échoué.")
      }
      setSuccess(true)
    } catch (e) {
      setSubmitError(e.message || "L'enregistrement a échoué.")
    } finally {
      setSaving(false)
    }
  }

  // ---------- Styles ----------
  const S = {
    page: { minHeight: '100vh', background: '#f5f5f5', padding: '1.5rem' },
    wrap: { maxWidth: '760px', margin: '0 auto' },
    card: { background: '#fff', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1rem' },
    title: { fontSize: '1.3rem', fontWeight: 700, color: '#1e2428', margin: '0 0 0.25rem' },
    version: { fontSize: '0.8rem', color: '#888', marginBottom: '1rem' },
    body: { whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6, color: '#333', maxHeight: '46vh', overflowY: 'auto', padding: '1rem', background: '#fafafa', border: '1px solid #eee', borderRadius: '6px' },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#555', margin: '0 0 0.4rem' },
    input: { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box', color: '#333', background: '#fff' },
    check: { display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: '#333', cursor: 'pointer', marginBottom: '1rem' },
    canvas: { width: '100%', height: '180px', border: '2px dashed #bbb', borderRadius: '8px', touchAction: 'none', background: '#fff', display: 'block', cursor: 'crosshair' },
    btn: { background: '#0f766e', color: '#fff', border: 'none', padding: '0.8rem 1.6rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
    btnGhost: { background: 'transparent', color: '#0f766e', border: '1px solid #0f766e', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
    errBox: { background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '6px', padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' },
    center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' },
    icon: { width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.3rem', marginBottom: '1.2rem' },
  }

  if (loading) {
    return <div style={S.page}><div style={S.center}><p style={{ color: '#666' }}>Chargement du consentement…</p></div></div>
  }

  if (error) {
    const msgs = {
      invalid: { t: 'Lien invalide', m: "Ce lien de consentement est invalide ou n'existe pas." },
      signed: { t: 'Déjà signé', m: 'Ce consentement a déjà été signé. Merci.' },
      expired: { t: 'Lien expiré', m: 'Ce lien de consentement a expiré. Veuillez contacter la clinique.' },
    }
    const { t, m } = msgs[error] || msgs.invalid
    return (
      <div style={S.page}><div style={S.center}>
        <div style={{ ...S.icon, background: '#f8d7da', color: '#dc3545' }}>✕</div>
        <h2 style={{ color: '#333', marginBottom: '0.6rem' }}>{t}</h2>
        <p style={{ color: '#666', maxWidth: 380 }}>{m}</p>
      </div></div>
    )
  }

  if (success) {
    return (
      <div style={S.page}><div style={S.center}>
        <div style={{ ...S.icon, background: '#d4edda', color: '#28a745' }}>✓</div>
        <h2 style={{ color: '#333', marginBottom: '0.6rem' }}>Consentement signé</h2>
        <p style={{ color: '#666', maxWidth: 460 }}>
          Merci. Votre consentement a été enregistré de façon sécurisée. Une copie est conservée à votre dossier.
        </p>
      </div></div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.card}>
          <h1 style={S.title}>{data.title}</h1>
          <div style={S.version}>Version du document : {data.version}</div>
          <div style={S.body}>{data.body}</div>
        </div>

        <div style={S.card}>
          {submitError && <div style={S.errBox}>{submitError}</div>}

          <label style={S.check}>
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} style={{ marginTop: 3 }} />
            <span>J'ai lu et je comprends ce consentement. J'ai eu l'occasion de poser mes questions et j'y consens librement.</span>
          </label>

          <div style={{ marginBottom: '1rem' }}>
            <label style={S.label}>Nom du signataire (patient ou tuteur)</label>
            <input style={S.input} value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Prénom et nom" />
          </div>

          <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={S.label}>Signature</label>
            <button type="button" style={S.btnGhost} onClick={clearSignature}>Effacer</button>
          </div>
          <canvas
            ref={canvasRef}
            width={700}
            height={180}
            style={S.canvas}
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
          />
          <p style={{ fontSize: '0.78rem', color: '#999', margin: '0.4rem 0 1.2rem' }}>
            Signez ci-dessus avec votre doigt (tablette) ou la souris.
          </p>

          <button style={{ ...S.btn, opacity: saving ? 0.7 : 1 }} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Signer le consentement'}
          </button>

          <p style={{ fontSize: '0.78rem', color: '#999', marginTop: '1rem' }}>
            ⚠️ Mécanisme en validation. La version signée (texte exact, version, signature et horodatage) est conservée à votre dossier.
          </p>
        </div>
      </div>
    </div>
  )
}
