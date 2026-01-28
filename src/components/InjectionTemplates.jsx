import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Catégories de modèles
const TEMPLATE_CATEGORIES = [
  { value: 'Cosmetic', label: 'Cosmétique', labelEn: 'Cosmetic' },
  { value: 'Therapeutic', label: 'Thérapeutique', labelEn: 'Therapeutic' },
]

// Modèles par défaut (basés sur Facetec)
const DEFAULT_TEMPLATES = {
  Cosmetic: [
    { id: 'dc1', name: 'Brow lift', nameEn: 'Brow lift', nameFr: 'Lifting sourcils', defaultDosage: 8, isHidden: false, imgKey: 'Front', points: 4 },
    { id: 'dc2', name: "Crow's feet", nameEn: "Crow's feet", nameFr: 'Pattes d\'oie', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 10 },
    { id: 'dc3', name: 'Frontalis', nameEn: 'Frontalis', nameFr: 'Frontalis', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 9 },
    { id: 'dc4', name: 'Glabella', nameEn: 'Glabella', nameFr: 'Glabelle', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 7 },
    { id: 'dc5', name: 'Lower face', nameEn: 'Lower face', nameFr: 'Bas du visage', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 20 },
    { id: 'dc6', name: 'Masseter Cosmetic', nameEn: 'Masseter Cosmetic', nameFr: 'Masséter cosmétique', defaultDosage: 7, isHidden: false, imgKey: 'Right', points: 15 },
    { id: 'dc7', name: 'Mid face', nameEn: 'Mid face', nameFr: 'Milieu du visage', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 14 },
    { id: 'dc8', name: 'Occipital', nameEn: 'Occipital', nameFr: 'Occipital', defaultDosage: 7, isHidden: false, imgKey: 'Back', points: 16 },
    { id: 'dc9', name: 'Platysma', nameEn: 'Platysma', nameFr: 'Platysma', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 28 },
  ],
  Therapeutic: [
    { id: 'dt1', name: 'Brow lift', nameEn: 'Brow lift', nameFr: 'Lifting sourcils', defaultDosage: 8, isHidden: false, imgKey: 'Front', points: 4 },
    { id: 'dt2', name: "Crow's feet", nameEn: "Crow's feet", nameFr: 'Pattes d\'oie', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 10 },
    { id: 'dt3', name: 'Frontalis', nameEn: 'Frontalis', nameFr: 'Frontalis', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 9 },
    { id: 'dt4', name: 'Glabella', nameEn: 'Glabella', nameFr: 'Glabelle', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 7 },
    { id: 'dt5', name: 'TMD (Left)', nameEn: 'TMD (Left)', nameFr: 'ATM (Gauche)', defaultDosage: 7, isHidden: false, imgKey: 'Left', points: 15 },
    { id: 'dt6', name: 'TMD (Right)', nameEn: 'TMD (Right)', nameFr: 'ATM (Droite)', defaultDosage: 7, isHidden: false, imgKey: 'Right', points: 15 },
    { id: 'dt7', name: 'Occipital', nameEn: 'Occipital', nameFr: 'Occipital', defaultDosage: 7, isHidden: false, imgKey: 'Back', points: 16 },
    { id: 'dt8', name: 'Platysma', nameEn: 'Platysma', nameFr: 'Platysma', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 28 },
    { id: 'dt9', name: 'EMG Analytics', nameEn: 'EMG Analytics', nameFr: 'Analyse EMG', defaultDosage: 7, isHidden: false, imgKey: 'Front', points: 0, price: 350 },
  ]
}

const Icons = {
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Copy: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Info: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ChevronLeft: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
}

export default function InjectionTemplates({ onBack, session }) {
  const [selectedCategory, setSelectedCategory] = useState('Cosmetic')
  const [defaultTemplates, setDefaultTemplates] = useState(DEFAULT_TEMPLATES)
  const [customTemplates, setCustomTemplates] = useState({ Cosmetic: [], Therapeutic: [] })
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [isNewTemplate, setIsNewTemplate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', session.user.id)
      .eq('setting_type', 'injection_templates')
      .single()

    if (data?.settings) {
      if (data.settings.defaultTemplates) {
        setDefaultTemplates(data.settings.defaultTemplates)
      }
      if (data.settings.customTemplates) {
        setCustomTemplates(data.settings.customTemplates)
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        setting_type: 'injection_templates',
        settings: { defaultTemplates, customTemplates },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,setting_type'
      })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  const handleToggleActive = (templateId, isDefault) => {
    if (isDefault) {
      setDefaultTemplates(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory].map(t =>
          t.id === templateId ? { ...t, isHidden: !t.isHidden } : t
        )
      }))
    } else {
      setCustomTemplates(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory].map(t =>
          t.id === templateId ? { ...t, isHidden: !t.isHidden } : t
        )
      }))
    }
    setSaved(false)
  }

  const handleEditTemplate = (template, isDefault = false) => {
    setEditingTemplate({ ...template, isDefault })
    setIsNewTemplate(false)
    setShowEditor(true)
  }

  const handleDuplicateTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      name: `${template.name} (copie)`,
      nameFr: `${template.nameFr || template.name} (copie)`,
      isDefault: false
    }
    
    setCustomTemplates(prev => ({
      ...prev,
      [selectedCategory]: [...prev[selectedCategory], newTemplate]
    }))
    setSaved(false)
  }

  const handleCreateNewTemplate = () => {
    setEditingTemplate({
      id: `custom_${Date.now()}`,
      name: '',
      nameFr: '',
      defaultDosage: 5,
      isHidden: false,
      imgKey: 'Front',
      points: 0,
      category: selectedCategory,
      isDefault: false
    })
    setIsNewTemplate(true)
    setShowEditor(true)
  }

  const handleDeleteTemplate = (templateId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce modèle?')) return

    setCustomTemplates(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].filter(t => t.id !== templateId)
    }))
    setSaved(false)
  }

  const handleSaveTemplate = (updatedTemplate) => {
    if (updatedTemplate.isDefault) {
      // Mise à jour d'un modèle par défaut
      setDefaultTemplates(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory].map(t =>
          t.id === updatedTemplate.id ? { ...updatedTemplate, isDefault: undefined } : t
        )
      }))
    } else if (isNewTemplate) {
      // Nouveau modèle personnalisé
      setCustomTemplates(prev => ({
        ...prev,
        [selectedCategory]: [...prev[selectedCategory], { ...updatedTemplate, isDefault: undefined }]
      }))
    } else {
      // Mise à jour d'un modèle personnalisé existant
      setCustomTemplates(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory].map(t =>
          t.id === updatedTemplate.id ? { ...updatedTemplate, isDefault: undefined } : t
        )
      }))
    }
    
    setShowEditor(false)
    setEditingTemplate(null)
    setSaved(false)
  }

  const currentDefaultTemplates = defaultTemplates[selectedCategory] || []
  const currentCustomTemplates = customTemplates[selectedCategory] || []

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
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'var(--primary)',
      marginBottom: '1rem'
    },
    infoAlert: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '1rem',
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      color: '#3b82f6',
      fontSize: '0.9rem'
    },
    filterRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    select: {
      padding: '0.5rem 1rem',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      fontSize: '0.9rem',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)',
      minWidth: '200px'
    },
    table: {
      width: '100%',
      maxWidth: '900px',
      borderCollapse: 'collapse',
      fontSize: '0.875rem',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden'
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
    thCenter: {
      textAlign: 'center'
    },
    td: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid var(--border)',
      color: 'var(--text-primary)',
      verticalAlign: 'middle'
    },
    tdCenter: {
      textAlign: 'center'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
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
      justifyContent: 'center'
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
    btnSuccess: {
      background: 'var(--success)',
      color: 'white'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--border)'
    }
  }

  return (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Modèles d'injection</span>
      </div>

      <h1 className="page-title">MODÈLES D'INJECTION</h1>

      {/* Info Alert */}
      <div style={styles.card}>
        <div style={{ padding: '1rem' }}>
          <div style={styles.infoAlert}>
            <Icons.Info />
            <div>
              <strong>Note :</strong> Les modifications apportées à un <strong>modèle existant</strong> n'affecteront pas son apparence dans une visite existante.
            </div>
          </div>
        </div>
      </div>

      {/* Default Templates */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h3 style={styles.sectionTitle}>Modèles par défaut</h3>

          {/* Category Filter */}
          <div style={styles.filterRow}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Catégorie de modèle
            </label>
            <select
              style={styles.select}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {TEMPLATE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Default Templates Table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '40%' }}>Zone de traitement</th>
                <th style={{ ...styles.th, ...styles.thCenter, width: '15%' }}>Actif</th>
                <th style={{ ...styles.th, ...styles.thCenter, width: '25%' }}>Dosage par défaut</th>
                <th style={{ ...styles.th, ...styles.thCenter, width: '20%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDefaultTemplates.filter(t => t.points > 0).map(template => (
                <tr key={template.id}>
                  <td style={styles.td}>{template.nameFr || template.name}</td>
                  <td style={{ ...styles.td, ...styles.tdCenter }}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={!template.isHidden}
                      onChange={() => handleToggleActive(template.id, true)}
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.tdCenter }}>
                    {template.defaultDosage} unités
                  </td>
                  <td style={{ ...styles.td, ...styles.tdCenter }}>
                    <button
                      style={{ ...styles.actionBtn, color: '#f59e0b' }}
                      onClick={() => handleEditTemplate(template, true)}
                      title="Modifier"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      style={{ ...styles.actionBtn, color: '#10b981' }}
                      onClick={() => handleDuplicateTemplate(template)}
                      title="Dupliquer"
                    >
                      <Icons.Copy />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Templates */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.headerRow}>
            <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Modèles personnalisés</h3>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={handleCreateNewTemplate}
            >
              <Icons.Plus /> Créer un nouveau modèle
            </button>
          </div>

          {/* Custom Templates Table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '35%' }}>Zone de traitement</th>
                <th style={{ ...styles.th, ...styles.thCenter, width: '15%' }}>Actif</th>
                <th style={{ ...styles.th, ...styles.thCenter, width: '20%' }}>Dosage par défaut</th>
                <th style={{ ...styles.th, ...styles.thCenter, width: '30%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomTemplates.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...styles.td, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucun modèle personnalisé. Cliquez sur "Créer un nouveau modèle" pour en ajouter un.
                  </td>
                </tr>
              ) : (
                currentCustomTemplates.map(template => (
                  <tr key={template.id}>
                    <td style={styles.td}>{template.nameFr || template.name}</td>
                    <td style={{ ...styles.td, ...styles.tdCenter }}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={!template.isHidden}
                        onChange={() => handleToggleActive(template.id, false)}
                      />
                    </td>
                    <td style={{ ...styles.td, ...styles.tdCenter }}>
                      {template.defaultDosage} unités
                    </td>
                    <td style={{ ...styles.td, ...styles.tdCenter }}>
                      <button
                        style={{ ...styles.actionBtn, color: '#f59e0b' }}
                        onClick={() => handleEditTemplate(template, false)}
                        title="Modifier"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        style={{ ...styles.actionBtn, color: '#10b981' }}
                        onClick={() => handleDuplicateTemplate(template)}
                        title="Dupliquer"
                      >
                        <Icons.Copy />
                      </button>
                      <button
                        style={{ ...styles.actionBtn, color: '#ef4444' }}
                        onClick={() => handleDeleteTemplate(template.id)}
                        title="Supprimer"
                      >
                        <Icons.Trash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={styles.footer}>
            <button
              style={{
                ...styles.btn,
                ...(saved ? styles.btnSuccess : styles.btnPrimary)
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </div>

      {/* Template Editor Modal */}
      {showEditor && editingTemplate && (
        <TemplateEditorModal
          template={editingTemplate}
          isNew={isNewTemplate}
          category={selectedCategory}
          onSave={handleSaveTemplate}
          onClose={() => { setShowEditor(false); setEditingTemplate(null); }}
        />
      )}

      <div className="copyright">
        DROITS D'AUTEUR © {new Date().getFullYear()} FACEHUB
      </div>
    </div>
  )
}

// Composant Modal Éditeur de Modèle
function TemplateEditorModal({ template, isNew, category, onSave, onClose }) {
  const [formData, setFormData] = useState({
    ...template,
    name: template.name || '',
    nameFr: template.nameFr || template.name || '',
    defaultDosage: template.defaultDosage || 5,
    category: category
  })
  const [imgIndex, setImgIndex] = useState(0)
  
  const imageViews = ['Front', 'Right', 'Left', 'Back']
  const imageLabels = { Front: 'Face', Right: 'Droite', Left: 'Gauche', Back: 'Arrière' }

  const handlePrevImage = () => {
    setImgIndex(prev => (prev === 0 ? imageViews.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setImgIndex(prev => (prev === imageViews.length - 1 ? 0 : prev + 1))
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Le nom du modèle est requis.')
      return
    }
    onSave({
      ...formData,
      imgKey: imageViews[imgIndex]
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
      overflow: 'auto'
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
    modalBody: {
      padding: '1.5rem',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem'
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    },
    imageSection: {
      textAlign: 'center'
    },
    imageNav: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem'
    },
    navBtn: {
      padding: '0.5rem 1rem',
      background: 'var(--bg-sidebar)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      cursor: 'pointer',
      color: 'var(--text-primary)'
    },
    imagePlaceholder: {
      width: '100%',
      maxWidth: '300px',
      height: '400px',
      background: 'var(--bg-sidebar)',
      border: '2px dashed var(--border)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      margin: '0 auto'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--text-secondary)'
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
    inputNumber: {
      width: '120px',
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
    btnDanger: {
      background: '#ef4444',
      color: 'white'
    },
    btnOutline: {
      background: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--text-secondary)'
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {isNew ? 'Créer un nouveau modèle' : 'Modifier le modèle'}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div style={styles.modalBody}>
          {/* Left side - Image */}
          <div style={styles.imageSection}>
            <div style={styles.imageNav}>
              <button style={styles.navBtn} onClick={handlePrevImage}>
                <Icons.ChevronLeft /> Préc.
              </button>
              <span style={{ minWidth: '80px', fontWeight: '500' }}>
                {imageLabels[imageViews[imgIndex]]}
              </span>
              <button style={styles.navBtn} onClick={handleNextImage}>
                Suiv. <Icons.ChevronRight />
              </button>
            </div>
            
            <div style={styles.imagePlaceholder}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
                <div>Vue: {imageLabels[imageViews[imgIndex]]}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Cliquez pour ajouter des points d'injection
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={styles.label}>Valeur d'injection par défaut</label>
              <input
                type="number"
                min="1"
                max="99"
                style={styles.inputNumber}
                value={formData.defaultDosage}
                onChange={(e) => setFormData({ ...formData, defaultDosage: parseInt(e.target.value) || 1 })}
              />
              <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>unités</span>
            </div>
          </div>

          {/* Right side - Form */}
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Catégorie</label>
              {template.isDefault ? (
                <div style={{ padding: '0.75rem 0', color: 'var(--text-primary)' }}>
                  {category === 'Cosmetic' ? 'Cosmétique' : 'Thérapeutique'}
                </div>
              ) : (
                <select
                  style={styles.select}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Cosmetic">Cosmétique</option>
                  <option value="Therapeutic">Thérapeutique</option>
                </select>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nom du modèle</label>
              {template.isDefault ? (
                <div style={{ padding: '0.75rem 0', color: 'var(--text-primary)' }}>
                  {formData.nameFr || formData.name}
                </div>
              ) : (
                <input
                  type="text"
                  style={styles.input}
                  value={formData.nameFr || formData.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    name: e.target.value,
                    nameFr: e.target.value 
                  })}
                  placeholder="Entrez le nom du modèle"
                />
              )}
            </div>

            {template.isDefault && (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button 
                  style={{ ...styles.btn, ...styles.btnOutline }}
                  onClick={() => {
                    // Revert to original default values
                    const original = DEFAULT_TEMPLATES[category].find(t => t.id === template.id)
                    if (original) {
                      setFormData({ ...original, isDefault: true })
                    }
                  }}
                >
                  Revenir à l'original
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button 
            style={{ ...styles.btn, ...styles.btnPrimary }}
            onClick={handleSubmit}
          >
            Enregistrer
          </button>
          <button 
            style={{ ...styles.btn, ...styles.btnDanger }}
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
