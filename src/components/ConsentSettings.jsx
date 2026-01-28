import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

// Types de traitement
const TREATMENT_TYPES = {
  treatment_botox: 'Toxine Botulique Cosmétique',
  treatment_filler: 'Agents de Comblement',
  treatment_lasers: 'Lasers',
  treatment_microneedling: 'Microneedling/Soins du visage',
  treatment_peels: 'Peelings',
  treatment_other: 'Autre'
}

// Formulaires de consentement par défaut
const DEFAULT_CONSENTS = [
  {
    id: 'botulinum_toxin_cosmetic_consent',
    treatmentType: 'treatment_botox',
    formName: 'Consentement Toxine Botulique',
    formNameEn: 'Botulinum Toxin Consent',
    sortOrder: 1,
    isDefault: true,
    consent: `<p>1. Je suis conscient(e) que lorsque de petites quantités de toxine botulique purifiée sont injectées dans un muscle, celui-ci est affaibli. Cet effet apparaît en 12 à 14 jours et dure généralement environ 3 à 4 mois.</p>
<p>2. Je comprends que ce traitement réduira ou éliminera ma capacité à "froncer les sourcils" et/ou produire des "pattes d'oie" ou des "rides du front" tant que l'injection est efficace, mais que cela s'inversera après une période de mois, moment auquel un nouveau traitement sera approprié.</p>
<p>3. Je comprends que je dois rester en position verticale et ne pas manipuler la zone d'injection ni participer à une activité intense pendant 4 heures après le traitement. Je comprends également que je dois exercer les muscles traités pendant 2 heures après le traitement.</p>
<p>4. J'accepte de revenir pour une visite de suivi 10 à 14 jours après mon traitement.</p>
<p>5. J'ai été informé(e) des méthodes alternatives de traitement.</p>
<p>6. À ma connaissance, je ne suis pas enceinte et je n'ai aucune maladie neurologique ou musculaire significative.</p>
<p>7. J'ai eu l'occasion de poser des questions et elles ont été répondues à ma satisfaction.</p>
<p>8. Je consens à ce que des photographies soient prises pour évaluer l'efficacité du traitement, à des fins d'éducation médicale, de formation, de publications professionnelles ou de vente.</p>`,
    createdAt: new Date().toISOString()
  },
  {
    id: 'dermal_filler_consent',
    treatmentType: 'treatment_filler',
    formName: 'Consentement Agents de Comblement',
    formNameEn: 'Dermal Filler Consent',
    sortOrder: 2,
    isDefault: true,
    consent: `<p>Je reconnais que ce traitement m'a été entièrement expliqué et que j'ai eu l'occasion de poser des questions auxquelles on a répondu à ma satisfaction.</p>
<p>J'ai été spécifiquement informé(e) de ce qui suit:</p>
<ul>
<li>Les agents de comblement dermique sont un gel transparent et bio-résorbable composé d'acide hyaluronique réticulé non animal pour injection dans la peau afin de corriger les rides et les plis du visage et pour l'augmentation des lèvres.</li>
<li>Après l'injection, certaines réactions courantes liées à l'injection peuvent survenir, telles que gonflement, rougeur, douleur, démangeaisons, décoloration et sensibilité au site d'injection. Elles disparaissent généralement dans les 1 à 2 jours suivant l'injection dans la peau et dans la semaine suivant les injections dans les lèvres.</li>
<li>Très rarement, des nodules, abcès et indurations - parfois associés à des rougeurs et des gonflements - ont été signalés après l'injection.</li>
</ul>
<p>J'ai été informé(e) que selon le site d'injection, le type de peau, la quantité injectée et la technique d'injection, les agents de comblement peuvent durer en moyenne de 6 à 9 mois (lèvres: jusqu'à 6 mois).</p>
<p>J'ai consenti à ce que des photographies soient prises. Je comprends qu'elles peuvent être utilisées pour la documentation et l'illustration de mon traitement.</p>`,
    createdAt: new Date().toISOString()
  },
  {
    id: 'photo_consent',
    treatmentType: 'treatment_other',
    formName: 'Consentement Photo',
    formNameEn: 'Photo Consent',
    sortOrder: 3,
    isDefault: true,
    consent: `<p>Consentez-vous à ce que vos photographies soient utilisées à des fins d'éducation des patients et de marketing?</p>
<p>Je comprends que:</p>
<ul>
<li>Mes photographies peuvent être utilisées dans des présentations éducatives</li>
<li>Mon identité sera protégée à moins que je ne donne un consentement écrit supplémentaire</li>
<li>Je peux retirer ce consentement à tout moment par écrit</li>
</ul>`,
    createdAt: new Date().toISOString()
  }
]

const Icons = {
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Eye: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  History: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Bold: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>,
  Italic: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 4h4m-2 0v16m-4 0h8" transform="skewX(-10)" /></svg>,
  List: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  ListOl: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>,
}

export default function ConsentSettings({ onBack, session }) {
  const [consents, setConsents] = useState([])
  const [consentHistory, setConsentHistory] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedConsent, setSelectedConsent] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConsents()
  }, [])

  const loadConsents = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', session.user.id)
      .eq('setting_type', 'consent_forms')
      .single()

    if (data?.settings?.consents) {
      setConsents(data.settings.consents)
      setConsentHistory(data.settings.history || {})
    } else {
      // Charger les consentements par défaut
      setConsents(DEFAULT_CONSENTS)
    }
  }

  const saveConsents = async (newConsents, newHistory = consentHistory) => {
    setSaving(true)
    
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        setting_type: 'consent_forms',
        settings: { consents: newConsents, history: newHistory },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,setting_type'
      })

    setSaving(false)
    return !error
  }

  const handleAddConsent = async (newConsent) => {
    const consent = {
      ...newConsent,
      id: `consent_${Date.now()}`,
      sortOrder: consents.length + 1,
      createdAt: new Date().toISOString()
    }
    
    const newConsents = [...consents, consent]
    const success = await saveConsents(newConsents)
    
    if (success) {
      setConsents(newConsents)
      setShowAddModal(false)
    }
  }

  const handleEditConsent = async (updatedConsent) => {
    // Sauvegarder l'ancienne version dans l'historique
    const oldConsent = consents.find(c => c.id === updatedConsent.id)
    const newHistory = { ...consentHistory }
    
    if (!newHistory[updatedConsent.id]) {
      newHistory[updatedConsent.id] = []
    }
    newHistory[updatedConsent.id].push({
      consent: oldConsent.consent,
      timestamp: new Date().toISOString()
    })

    const newConsents = consents.map(c => 
      c.id === updatedConsent.id 
        ? { ...c, ...updatedConsent, updatedAt: new Date().toISOString() }
        : c
    )
    
    const success = await saveConsents(newConsents, newHistory)
    
    if (success) {
      setConsents(newConsents)
      setConsentHistory(newHistory)
      setShowEditModal(false)
      setSelectedConsent(null)
    }
  }

  const handleDeleteConsent = async () => {
    if (!selectedConsent || selectedConsent.isDefault) return

    const newConsents = consents.filter(c => c.id !== selectedConsent.id)
    const success = await saveConsents(newConsents)
    
    if (success) {
      setConsents(newConsents)
      setShowDeleteModal(false)
      setSelectedConsent(null)
    }
  }

  const openViewModal = (consent) => {
    setSelectedConsent(consent)
    setShowViewModal(true)
  }

  const openEditModal = (consent) => {
    setSelectedConsent(consent)
    setShowEditModal(true)
  }

  const openHistoryModal = (consent) => {
    setSelectedConsent(consent)
    setShowHistoryModal(true)
  }

  const openDeleteModal = (consent) => {
    setSelectedConsent(consent)
    setShowDeleteModal(true)
  }

  const sortedConsents = [...consents].sort((a, b) => a.sortOrder - b.sortOrder)

  const styles = {
    card: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      marginBottom: '1.5rem'
    },
    cardBody: {
      padding: '1.5rem'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'var(--primary)',
      margin: 0
    },
    btn: {
      padding: '0.65rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btnPrimary: {
      background: 'var(--primary)',
      color: 'white'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem'
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem 1rem',
      background: 'var(--bg-sidebar)',
      color: 'var(--text-muted)',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      borderBottom: '1px solid var(--border)'
    },
    td: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid var(--border)',
      color: 'var(--text-primary)',
      verticalAlign: 'middle'
    },
    actionBtn: {
      padding: '0.4rem',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '0.25rem'
    },
    actionIcons: {
      display: 'flex',
      gap: '0.25rem'
    }
  }

  return (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Paramètres de consentement</span>
      </div>

      <h1 className="page-title">PARAMÈTRES DE CONSENTEMENT</h1>

      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.headerRow}>
            <h3 style={styles.sectionTitle}>Gérer vos formulaires de consentement</h3>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={() => setShowAddModal(true)}
            >
              <Icons.Plus /> Ajouter un formulaire
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '30%' }}>Type de traitement</th>
                  <th style={{ ...styles.th, width: '45%' }}>Nom du formulaire</th>
                  <th style={{ ...styles.th, width: '25%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedConsents.map(consent => (
                  <tr key={consent.id}>
                    <td style={styles.td}>
                      {TREATMENT_TYPES[consent.treatmentType] || consent.treatmentType}
                    </td>
                    <td style={styles.td}>{consent.formName}</td>
                    <td style={styles.td}>
                      <div style={styles.actionIcons}>
                        <button
                          style={{ ...styles.actionBtn, color: '#10b981' }}
                          onClick={() => openViewModal(consent)}
                          title="Voir"
                        >
                          <Icons.Eye />
                        </button>
                        <button
                          style={{ ...styles.actionBtn, color: '#f59e0b' }}
                          onClick={() => openEditModal(consent)}
                          title="Modifier"
                        >
                          <Icons.Edit />
                        </button>
                        <button
                          style={{ ...styles.actionBtn, color: '#3b82f6' }}
                          onClick={() => openHistoryModal(consent)}
                          title="Historique"
                        >
                          <Icons.History />
                        </button>
                        {!consent.isDefault && (
                          <button
                            style={{ ...styles.actionBtn, color: '#ef4444' }}
                            onClick={() => openDeleteModal(consent)}
                            title="Supprimer"
                          >
                            <Icons.Trash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedConsents.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ ...styles.td, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Aucun formulaire de consentement. Cliquez sur "Ajouter un formulaire" pour commencer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ConsentModal
          mode="add"
          onSave={handleAddConsent}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedConsent && (
        <ConsentModal
          mode="edit"
          consent={selectedConsent}
          onSave={handleEditConsent}
          onClose={() => { setShowEditModal(false); setSelectedConsent(null); }}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedConsent && (
        <ViewModal
          consent={selectedConsent}
          onClose={() => { setShowViewModal(false); setSelectedConsent(null); }}
        />
      )}

      {/* History Modal */}
      {showHistoryModal && selectedConsent && (
        <HistoryModal
          consent={selectedConsent}
          history={consentHistory[selectedConsent.id] || []}
          onClose={() => { setShowHistoryModal(false); setSelectedConsent(null); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedConsent && (
        <DeleteModal
          consent={selectedConsent}
          onConfirm={handleDeleteConsent}
          onClose={() => { setShowDeleteModal(false); setSelectedConsent(null); }}
        />
      )}

      <div className="copyright">
        DROITS D'AUTEUR © {new Date().getFullYear()} FACEHUB
      </div>
    </div>
  )
}

// Modal pour ajouter/modifier un consentement
function ConsentModal({ mode, consent, onSave, onClose }) {
  const [formData, setFormData] = useState({
    treatmentType: consent?.treatmentType || '',
    formName: consent?.formName || '',
    consent: consent?.consent || '',
    id: consent?.id
  })
  const editorRef = useRef(null)

  const handleSubmit = () => {
    if (!formData.treatmentType || !formData.formName || !formData.consent.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.')
      return
    }
    onSave(formData)
  }

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const styles = {
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '700px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    modalHeader: {
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    },
    modalBody: {
      padding: '1.5rem',
      overflowY: 'auto',
      flex: 1
    },
    formGroup: {
      marginBottom: '1.25rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--text-secondary)'
    },
    required: {
      color: '#ef4444',
      marginLeft: '0.25rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      fontSize: '0.9rem',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)'
    },
    select: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      fontSize: '0.9rem',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)'
    },
    editorToolbar: {
      display: 'flex',
      gap: '0.25rem',
      padding: '0.5rem',
      background: 'var(--bg-sidebar)',
      borderRadius: '8px 8px 0 0',
      border: '1px solid var(--border)',
      borderBottom: 'none'
    },
    toolbarBtn: {
      padding: '0.5rem',
      background: 'transparent',
      border: '1px solid transparent',
      borderRadius: '4px',
      cursor: 'pointer',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    editor: {
      minHeight: '200px',
      padding: '1rem',
      border: '1px solid var(--border)',
      borderRadius: '0 0 8px 8px',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)',
      outline: 'none',
      fontSize: '0.9rem',
      lineHeight: '1.6'
    },
    modalFooter: {
      padding: '1rem 1.5rem',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem'
    },
    btn: {
      padding: '0.65rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem'
    },
    btnPrimary: {
      background: 'var(--primary)',
      color: 'white'
    },
    btnSecondary: {
      background: 'var(--bg-sidebar)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)'
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {mode === 'add' ? 'Ajouter un nouveau consentement' : 'Modifier le formulaire de consentement'}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div style={styles.modalBody}>
          {mode === 'add' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Type de traitement<span style={styles.required}>*</span>
                </label>
                <select
                  style={styles.select}
                  value={formData.treatmentType}
                  onChange={(e) => setFormData({ ...formData, treatmentType: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {Object.entries(TREATMENT_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Nom du formulaire<span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.formName}
                  onChange={(e) => setFormData({ ...formData, formName: e.target.value })}
                  placeholder="Entrez le nom du formulaire"
                />
              </div>
            </>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Contenu du consentement<span style={styles.required}>*</span>
            </label>
            
            {/* Toolbar */}
            <div style={styles.editorToolbar}>
              <button
                style={styles.toolbarBtn}
                onClick={() => execCommand('bold')}
                title="Gras"
              >
                <Icons.Bold />
              </button>
              <button
                style={styles.toolbarBtn}
                onClick={() => execCommand('italic')}
                title="Italique"
              >
                <Icons.Italic />
              </button>
              <button
                style={styles.toolbarBtn}
                onClick={() => execCommand('insertUnorderedList')}
                title="Liste à puces"
              >
                <Icons.List />
              </button>
              <button
                style={styles.toolbarBtn}
                onClick={() => execCommand('insertOrderedList')}
                title="Liste numérotée"
              >
                <Icons.ListOl />
              </button>
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              style={styles.editor}
              dangerouslySetInnerHTML={{ __html: formData.consent }}
              onBlur={(e) => setFormData({ ...formData, consent: e.target.innerHTML })}
            />
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button
            style={{ ...styles.btn, ...styles.btnPrimary }}
            onClick={handleSubmit}
          >
            {mode === 'add' ? 'Soumettre' : 'Enregistrer'}
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal pour voir le consentement
function ViewModal({ consent, onClose }) {
  const styles = {
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    modalHeader: {
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    },
    modalBody: {
      padding: '1.5rem',
      overflowY: 'auto',
      flex: 1
    },
    content: {
      lineHeight: '1.7',
      color: 'var(--text-primary)'
    },
    modalFooter: {
      padding: '1rem 1.5rem',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'flex-end'
    },
    btn: {
      padding: '0.65rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      background: 'var(--bg-sidebar)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)'
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {consent.formName}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div 
            style={styles.content}
            dangerouslySetInnerHTML={{ __html: consent.consent }}
          />
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btn} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal pour l'historique
function HistoryModal({ consent, history, onClose }) {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const styles = {
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    modalHeader: {
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    },
    modalBody: {
      padding: '1.5rem',
      overflowY: 'auto',
      flex: 1
    },
    historyItem: {
      marginBottom: '1.5rem',
      borderBottom: '1px solid var(--border)',
      paddingBottom: '1.5rem'
    },
    historyTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: 'var(--primary)',
      marginBottom: '0.75rem'
    },
    historyContent: {
      background: 'var(--bg-sidebar)',
      borderRadius: '8px',
      padding: '1rem',
      lineHeight: '1.6',
      fontSize: '0.875rem',
      color: 'var(--text-primary)'
    },
    noData: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      padding: '2rem'
    },
    modalFooter: {
      padding: '1rem 1.5rem',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'flex-end'
    },
    btn: {
      padding: '0.65rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      background: 'var(--bg-sidebar)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)'
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            Historique - {consent.formName}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div style={styles.modalBody}>
          {sortedHistory.length === 0 ? (
            <div style={styles.noData}>
              Aucune donnée archivée.
            </div>
          ) : (
            sortedHistory.map((item, index) => (
              <div key={index} style={styles.historyItem}>
                <div style={styles.historyTitle}>
                  {formatDate(item.timestamp)}
                </div>
                <div 
                  style={styles.historyContent}
                  dangerouslySetInnerHTML={{ __html: item.consent }}
                />
              </div>
            ))
          )}
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btn} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal de confirmation de suppression
function DeleteModal({ consent, onConfirm, onClose }) {
  const styles = {
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '400px'
    },
    modalHeader: {
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    },
    modalBody: {
      padding: '1.5rem',
      color: 'var(--text-primary)'
    },
    modalFooter: {
      padding: '1rem 1.5rem',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem'
    },
    btn: {
      padding: '0.65rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem'
    },
    btnDanger: {
      background: '#ef4444',
      color: 'white'
    },
    btnSecondary: {
      background: 'var(--bg-sidebar)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)'
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Confirmation</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div style={styles.modalBody}>
          Êtes-vous sûr de vouloir supprimer ce consentement?
          <br /><br />
          <strong>{consent.formName}</strong>
        </div>

        <div style={styles.modalFooter}>
          <button
            style={{ ...styles.btn, ...styles.btnDanger }}
            onClick={onConfirm}
          >
            Oui, supprimer
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
