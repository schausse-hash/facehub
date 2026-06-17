import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

// ============================================================
// FaceHub — Timeline dentaire de la fiche patient (Phase 2.5)
// Remplace les visites esthétiques quand le module esthétique
// est inactif. Trois blocs :
//  1. Timeline chronologique : RDV Dentitek synchronisés
//     (via dentitek_patient_map → dentitek_appointments)
//     + cas d'implants (implant_cases)
//  2. Documents et consentements (patient_documents) — structure
//     prête pour le consentement éclairé signé en ligne (à venir)
// ============================================================

const STATUT_LABELS = {
  consultation_initiale: 'Consultation initiale',
  plan_traitement: 'Plan de traitement',
  en_attente_reponse: 'En attente de réponse',
  chirurgie_programmee: 'Chirurgie programmée',
  post_operatoire: 'Post-opératoire',
  fabrication_labo: 'Fabrication labo',
  prothese_finale: 'Prothèse finale',
  termine: 'Terminé',
  annule: 'Annulé',
}

const DOC_TYPES_DENTAIRES = [
  { id: 'consentement_implant', label: 'Consentement chirurgie implantaire' },
  { id: 'consentement_sedation', label: 'Consentement sédation' },
  { id: 'consentement_greffe', label: 'Consentement greffe osseuse' },
  { id: 'photo_consent', label: 'Consentement photo' },
  { id: 'treatment_plan', label: 'Plan de traitement' },
  { id: 'radiographie', label: 'Radiographie / imagerie' },
  { id: 'reference', label: 'Lettre de référence' },
  { id: 'prescription', label: 'Prescription' },
  { id: 'other', label: 'Autre' },
]

// Types de documents qui ont un modèle de consentement signable EN LIGNE.
// (Pilote : seul l'implant pour l'instant ; on ajoutera les autres ensuite.)
const TEMPLATE_BY_DOCTYPE = {
  consentement_implant: 'implant',
}

export default function DentalTimeline({ patient }) {
  const [events, setEvents] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [docType, setDocType] = useState('consentement_implant')
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [generatingSign, setGeneratingSign] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { load() }, [patient.id])

  const load = async () => {
    setLoading(true)

    // RDV Dentitek du patient (via le mapping)
    const { data: mapping } = await supabase
      .from('dentitek_patient_map')
      .select('id_patient_dentitek')
      .eq('patient_id', patient.id)
      .maybeSingle()

    let rdvs = []
    if (mapping?.id_patient_dentitek) {
      const { data: maps } = await supabase.from('dentitek_clinic_map').select('*')
      const clinicName = (uuid) => maps?.find(m => m.dentitek_clinic_uuid === uuid)?.dentitek_clinic_name || ''
      const { data } = await supabase
        .from('dentitek_appointments')
        .select('*')
        .eq('id_patient_dentitek', mapping.id_patient_dentitek)
      rdvs = (data || []).map(a => ({
        kind: 'rdv',
        date: a.date_from,
        title: a.note || 'Rendez-vous',
        subtitle: clinicName(a.dentitek_clinic_uuid),
        status: a.status_confirmation,
        key: `rdv-${a.id_hor_rdv_pat_dentitek}`,
      }))
    }

    // Cas d'implants
    const { data: cases } = await supabase
      .from('implant_cases')
      .select('*')
      .eq('patient_id', patient.id)
    const caseEvents = (cases || []).map(c => ({
      kind: 'implant',
      date: c.date_rdv || c.date_consultation || c.created_at,
      title: `Cas d'implant — ${c.type_traitement || 'implantologie'}`,
      subtitle: (c.dents?.length ? `Dents ${c.dents.join(', ')} · ` : '') + (STATUT_LABELS[c.statut] || c.statut || ''),
      status: c.statut,
      key: `cas-${c.id}`,
    }))

    setEvents(
      [...rdvs, ...caseEvents].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    )

    const { data: docs } = await supabase
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patient.id)
      .order('uploaded_at', { ascending: false })
    setDocuments(docs || [])

    setLoading(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingDoc(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${patient.id}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('patient-documents').upload(fileName, file)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('patient-documents').getPublicUrl(fileName)
      await supabase.from('patient_documents').insert([{ patient_id: patient.id, document_type: docType, file_name: file.name, file_url: publicUrl, file_size: file.size }])
      await load()
    }
    setUploadingDoc(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Génère une demande de consentement pour ce patient et ouvre la page de
  // signature (sur la tablette). Le personnel est connecté ; le patient signe.
  const handleFaireSigner = async () => {
    const templateKey = TEMPLATE_BY_DOCTYPE[docType]
    if (!templateKey) {
      alert("Aucun modèle de consentement en ligne pour ce type pour l'instant.")
      return
    }
    setGeneratingSign(true)
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let token = ''
      for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length))
      const { data: { user } } = await supabase.auth.getUser()
      const expires = new Date()
      expires.setDate(expires.getDate() + 14)
      const { error } = await supabase.from('consent_requests').insert([{
        token,
        patient_id: patient.id,
        template_key: templateKey,
        clinic_id: patient.clinic_id || null,
        created_by: user?.id || null,
        expires_at: expires.toISOString(),
      }])
      if (error) throw error
      // Ouvre la page de signature (nouvel onglet → à présenter sur la tablette).
      window.open(`/consent/${token}`, '_blank')
    } catch (e) {
      alert('Impossible de générer le consentement : ' + e.message)
    } finally {
      setGeneratingSign(false)
    }
  }

  const handleDeleteDocument = async (doc) => {
    if (!window.confirm('Supprimer ce document?')) return
    const fileName = doc.file_url.split('/').pop()
    await supabase.storage.from('patient-documents').remove([`${patient.id}/${fileName}`])
    await supabase.from('patient_documents').delete().eq('id', doc.id)
    await load()
  }

  const fmtDate = (d) => {
    if (!d) return '—'
    const date = /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + 'T00:00:00') : new Date(d)
    return date.toLocaleString('fr-CA', { dateStyle: 'medium', ...(String(d).length > 10 ? { timeStyle: 'short' } : {}) })
  }

  const isFuture = (d) => d && new Date(d) > new Date()

  return (
    <div>
      <style>{`
        .dt-card { background: var(--bg-card); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border); margin-bottom: 1.5rem; }
        .dt-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
        .dt-timeline { position: relative; padding-left: 1.5rem; }
        .dt-timeline::before { content: ''; position: absolute; left: 5px; top: 6px; bottom: 6px; width: 2px; background: var(--border); }
        .dt-event { position: relative; padding-bottom: 1.25rem; }
        .dt-dot { position: absolute; left: -1.5rem; top: 5px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--bg-card); }
        .dt-dot-rdv { background: #60a5fa; }
        .dt-dot-implant { background: var(--primary); }
        .dt-event-date { font-size: 0.8rem; color: var(--text-muted); }
        .dt-event-title { font-size: 0.95rem; font-weight: 600; margin: 0.15rem 0; }
        .dt-event-sub { font-size: 0.85rem; color: var(--text-muted); }
        .dt-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .dt-badge-futur { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
        .dt-badge-confirme { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
        .dt-empty { color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0; }
        .dt-docs-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
        .dt-select { padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem; }
        .dt-btn { padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 500; }
        .dt-doc-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--bg-sidebar); border-radius: 10px; margin-bottom: 0.5rem; border: 1px solid var(--border); }
        .dt-doc-name { font-weight: 500; font-size: 0.9rem; }
        .dt-doc-meta { font-size: 0.78rem; color: var(--text-muted); }
        .dt-doc-actions { display: flex; gap: 0.5rem; }
        .dt-link-btn { padding: 0.35rem 0.7rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); text-decoration: none; cursor: pointer; }
        .dt-link-btn:hover { border-color: var(--primary); color: var(--primary); }
        .dt-note { font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin-top: 0.75rem; }
      `}</style>

      {/* --- Timeline RDV + cas d'implants --- */}
      <div className="dt-card">
        <h3 className="dt-title">🦷 Parcours dentaire</h3>
        {loading && <div className="dt-empty">Chargement…</div>}
        {!loading && events.length === 0 && (
          <div className="dt-empty">
            Aucun événement — lie le patient à Dentitek (carte Dentitek du profil)
            ou crée un cas d'implant pour alimenter la timeline.
          </div>
        )}
        {!loading && events.length > 0 && (
          <div className="dt-timeline">
            {events.map(ev => (
              <div key={ev.key} className="dt-event">
                <span className={`dt-dot ${ev.kind === 'rdv' ? 'dt-dot-rdv' : 'dt-dot-implant'}`}></span>
                <div className="dt-event-date">
                  {fmtDate(ev.date)}
                  {ev.kind === 'rdv' && isFuture(ev.date) && <span className="dt-badge dt-badge-futur">À venir</span>}
                  {ev.kind === 'rdv' && ev.status === 'CONFIRMED' && <span className="dt-badge dt-badge-confirme">Confirmé</span>}
                </div>
                <div className="dt-event-title">{ev.kind === 'rdv' ? '⚡ ' : '🦷 '}{ev.title}</div>
                {ev.subtitle && <div className="dt-event-sub">{ev.subtitle}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Documents et consentements --- */}
      <div className="dt-card">
        <div className="dt-docs-header">
          <h3 className="dt-title" style={{ margin: 0, padding: 0, border: 'none' }}>📄 Documents et consentements</h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select className="dt-select" value={docType} onChange={e => setDocType(e.target.value)}>
              {DOC_TYPES_DENTAIRES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <button className="dt-btn" onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc}>
              {uploadingDoc ? 'Téléversement…' : '+ Téléverser'}
            </button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
            <button
              className="dt-btn"
              onClick={handleFaireSigner}
              disabled={generatingSign || !TEMPLATE_BY_DOCTYPE[docType]}
              title={TEMPLATE_BY_DOCTYPE[docType]
                ? 'Ouvrir la page de signature (tablette)'
                : 'Aucun modèle de signature en ligne pour ce type'}
            >
              {generatingSign ? 'Génération…' : '✍️ Faire signer en ligne'}
            </button>
          </div>
        </div>

        {documents.length === 0 && <div className="dt-empty">Aucun document.</div>}
        {documents.map(doc => (
          <div key={doc.id} className="dt-doc-row">
            <div>
              <div className="dt-doc-name">{doc.file_name}</div>
              <div className="dt-doc-meta">
                {DOC_TYPES_DENTAIRES.find(t => t.id === doc.document_type)?.label || doc.document_type} · {fmtDate(doc.uploaded_at)}
              </div>
            </div>
            <div className="dt-doc-actions">
              <a className="dt-link-btn" href={doc.file_url} target="_blank" rel="noreferrer">Voir</a>
              <button className="dt-link-btn" onClick={() => handleDeleteDocument(doc)}>Supprimer</button>
            </div>
          </div>
        ))}

        <div className="dt-note">
          ✍️ Signature en ligne disponible pour le <strong>consentement d'implant</strong> (pilote) :
          choisissez « Consentement chirurgie implantaire » puis cliquez « Faire signer en ligne »
          pour ouvrir la page de signature sur la tablette. Mécanisme à valider juridiquement avant usage réel.
        </div>
      </div>
    </div>
  )
}
