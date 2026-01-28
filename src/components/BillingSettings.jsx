import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Types de traitements disponibles
const TREATMENT_TYPES = [
  { value: 'botox_cosmetic', label: 'Toxine Botulique Cosmétique', labelEn: 'Botulinum Toxin Cosmetic' },
  { value: 'botox_therapeutic', label: 'Toxine Botulique Thérapeutique', labelEn: 'Botulinum Toxin Therapeutic' },
  { value: 'filler', label: 'Agents de Comblement', labelEn: 'Dermal Fillers' },
  { value: 'laser', label: 'Lasers', labelEn: 'Lasers' },
  { value: 'microneedling', label: 'Microneedling/Soins du visage', labelEn: 'Microneedling/Facials' },
  { value: 'peels', label: 'Peelings', labelEn: 'Peels' },
]

// Produits par défaut
const DEFAULT_PRODUCTS = [
  // Toxine Botulique Cosmétique
  { id: 1, type: 'botox_cosmetic', name: 'Botox', cost: 12.00, pst: 0, fst: 5, enabled: true },
  { id: 2, type: 'botox_cosmetic', name: 'Botox Cosmetic', cost: 12.00, pst: 0, fst: 5, enabled: true },
  { id: 3, type: 'botox_cosmetic', name: 'Dysport', cost: 12.00, pst: 0, fst: 5, enabled: true },
  { id: 4, type: 'botox_cosmetic', name: 'Xeomin', cost: 12.00, pst: 0, fst: 5, enabled: true },
  // Toxine Botulique Thérapeutique
  { id: 5, type: 'botox_therapeutic', name: 'Botox', cost: 12.00, pst: 0, fst: 0, enabled: true },
  // Agents de Comblement
  { id: 6, type: 'filler', name: 'Belotero', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 7, type: 'filler', name: 'Emervel', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 8, type: 'filler', name: 'Juvederm Ultra', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 9, type: 'filler', name: 'Juvederm Ultra Plus', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 10, type: 'filler', name: 'Perlane', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 11, type: 'filler', name: 'Restylane', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 12, type: 'filler', name: 'Revanesse', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 13, type: 'filler', name: 'Revanesse Contour', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 14, type: 'filler', name: 'Revanesse Kiss', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 15, type: 'filler', name: 'Revanesse Pure', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 16, type: 'filler', name: 'Revanesse Ultra', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 17, type: 'filler', name: 'Revanesse Outline', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 18, type: 'filler', name: 'Revanesse Shape', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 19, type: 'filler', name: 'Sculptra', cost: 850.00, pst: 0, fst: 5, enabled: true },
  { id: 20, type: 'filler', name: 'Teosyal', cost: 850.00, pst: 0, fst: 5, enabled: true },
  // Microneedling
  { id: 21, type: 'microneedling', name: 'Générique', cost: 850.00, pst: 0, fst: 5, enabled: true },
]

const Icons = {
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Info: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

export default function BillingSettings({ onBack, session }) {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [productForm, setProductForm] = useState({
    type: '',
    name: '',
    cost: '',
    pst: '0.00',
    fst: '5.00',
    enabled: true
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', session.user.id)
      .eq('setting_type', 'billing_products')
      .single()

    if (data?.settings?.products) {
      setProducts(data.settings.products)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        setting_type: 'billing_products',
        settings: { products },
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

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setProductForm({
      type: '',
      name: '',
      cost: '',
      pst: '0.00',
      fst: '5.00',
      enabled: true
    })
    setShowModal(true)
  }

  const handleOpenEditModal = (product) => {
    setEditingProduct(product)
    setProductForm({
      type: product.type,
      name: product.name,
      cost: product.cost.toFixed(2),
      pst: product.pst.toFixed(2),
      fst: product.fst.toFixed(2),
      enabled: product.enabled
    })
    setShowModal(true)
  }

  const handleSubmitProduct = (e) => {
    e.preventDefault()
    
    const newProduct = {
      id: editingProduct?.id || Date.now(),
      type: productForm.type,
      name: productForm.name,
      cost: parseFloat(productForm.cost) || 0,
      pst: parseFloat(productForm.pst) || 0,
      fst: parseFloat(productForm.fst) || 0,
      enabled: productForm.enabled
    }

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p))
    } else {
      setProducts([...products, newProduct])
    }

    setShowModal(false)
    setSaved(false)
  }

  const handleUpdateProductField = (productId, field, value) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        if (field === 'enabled') {
          return { ...p, [field]: value }
        }
        return { ...p, [field]: parseFloat(value) || 0 }
      }
      return p
    }))
    setSaved(false)
  }

  const getTypeName = (typeValue) => {
    const type = TREATMENT_TYPES.find(t => t.value === typeValue)
    return type ? type.label : typeValue
  }

  // Grouper les produits par type pour l'affichage
  const sortedProducts = [...products].sort((a, b) => {
    const typeOrder = TREATMENT_TYPES.map(t => t.value)
    return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
  })

  const styles = {
    card: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      overflow: 'hidden'
    },
    cardBody: {
      padding: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'var(--primary)',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid var(--primary)'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem'
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem 0.5rem',
      borderBottom: '2px solid var(--border)',
      color: 'var(--text-muted)',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '0.75rem 0.5rem',
      borderBottom: '1px solid var(--border)',
      color: 'var(--text-primary)',
      verticalAlign: 'middle'
    },
    input: {
      width: '100px',
      padding: '0.5rem',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      fontSize: '0.85rem',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)',
      textAlign: 'right'
    },
    inputFull: {
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
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    editBtn: {
      padding: '0.4rem',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#f59e0b',
      borderRadius: '4px'
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
    btnOutline: {
      background: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--text-secondary)'
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--border)'
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
    required: {
      color: 'var(--danger)',
      marginLeft: '2px'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.9rem'
    }
  }

  return (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Produits et facturation</span>
      </div>

      <h1 className="page-title">PRODUITS ET FACTURATION</h1>

      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.headerRow}>
            <h3 style={{ ...styles.sectionTitle, marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
              Tarification par défaut
            </h3>
            <button 
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={handleOpenAddModal}
            >
              <Icons.Plus /> Ajouter un traitement
            </button>
          </div>

          <div style={styles.infoAlert}>
            <Icons.Info />
            <div>
              <strong>Note :</strong> Ces paramètres de tarification s'appliqueront à toutes les nouvelles visites que vous créerez.
            </div>
          </div>

          {/* Products Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Type de traitement</th>
                  <th style={styles.th}>Produit/Marque</th>
                  <th style={styles.th}>Coût ($ par unité)</th>
                  <th style={styles.th}>TVP %</th>
                  <th style={styles.th}>TPS %</th>
                  <th style={styles.th}>Activé</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map(product => (
                  <tr key={product.id}>
                    <td style={styles.td}>{getTypeName(product.type)}</td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>{product.name}</td>
                    <td style={styles.td}>
                      <input
                        type="text"
                        style={styles.input}
                        value={product.cost.toFixed(2)}
                        onChange={(e) => handleUpdateProductField(product.id, 'cost', e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="text"
                        style={styles.input}
                        value={product.pst.toFixed(2)}
                        onChange={(e) => handleUpdateProductField(product.id, 'pst', e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="text"
                        style={styles.input}
                        value={product.fst.toFixed(2)}
                        onChange={(e) => handleUpdateProductField(product.id, 'fst', e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={product.enabled}
                        onChange={(e) => handleUpdateProductField(product.id, 'enabled', e.target.checked)}
                      />
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.editBtn}
                        onClick={() => handleOpenEditModal(product)}
                        title="Modifier"
                      >
                        <Icons.Edit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.footer}>
            <button
              style={{
                ...styles.btn,
                ...(saved ? styles.btnSuccess : styles.btnPrimary)
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Product */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProduct ? 'Modifier le traitement' : 'Ajouter un traitement'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleSubmitProduct}>
              <div className="modal-body">
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Type de traitement <span style={styles.required}>*</span>
                  </label>
                  <select
                    style={styles.select}
                    value={productForm.type}
                    onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                    required
                    disabled={!!editingProduct}
                  >
                    <option value="">Sélectionnez un type</option>
                    {TREATMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Produit/Marque <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    style={styles.inputFull}
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Entrez le nom du produit"
                    required
                    disabled={!!editingProduct}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Coût ($ par unité) <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    style={styles.inputFull}
                    value={productForm.cost}
                    onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Taxe de vente provinciale (TVP) %</label>
                  <input
                    type="text"
                    style={styles.inputFull}
                    value={productForm.pst}
                    onChange={(e) => setProductForm({ ...productForm, pst: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Taxe de vente fédérale (TPS) %</label>
                  <input
                    type="text"
                    style={styles.inputFull}
                    value={productForm.fst}
                    onChange={(e) => setProductForm({ ...productForm, fst: e.target.value })}
                    placeholder="5.00"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={productForm.enabled}
                      onChange={(e) => setProductForm({ ...productForm, enabled: e.target.checked })}
                    />
                    Activé
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Enregistrer' : 'Ajouter le traitement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="copyright">
        DROITS D'AUTEUR © {new Date().getFullYear()} FACEHUB
      </div>
    </div>
  )
}
