import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Search: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  List: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  Grid: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Folder: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  FolderOpen: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Image: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Back: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Upload: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
}

export default function Portfolio({ session, userClinic }) {
  const [loading, setLoading] = useState(true)
  const [folders, setFolders] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  const [showOnlyMine, setShowOnlyMine] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [folderForm, setFolderForm] = useState({ name: '', description: '' })
  const [currentFolder, setCurrentFolder] = useState(null)
  const [folderPhotos, setFolderPhotos] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchFolders()
  }, [showOnlyMine, userClinic])

  const fetchFolders = async () => {
    setLoading(true)
    
    let query = supabase
      .from('portfolio_folders')
      .select('*, portfolio_photos(count)')
      .eq('clinic_id', userClinic?.id)
      .order('created_at', { ascending: false })

    if (showOnlyMine) {
      query = query.eq('user_id', session.user.id)
    }

    const { data, error } = await query

    if (!error && data) {
      setFolders(data)
    }
    setLoading(false)
  }

  const fetchFolderPhotos = async (folderId) => {
    const { data } = await supabase
      .from('portfolio_photos')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false })

    setFolderPhotos(data || [])
  }

  const handleCreateFolder = async () => {
    if (!folderForm.name.trim()) return

    const { data, error } = await supabase
      .from('portfolio_folders')
      .insert([{
        clinic_id: userClinic?.id,
        user_id: session.user.id,
        name: folderForm.name.trim(),
        description: folderForm.description.trim()
      }])
      .select()
      .single()

    if (!error) {
      setFolders([data, ...folders])
      setShowCreateModal(false)
      setFolderForm({ name: '', description: '' })
    } else {
      alert('Erreur: ' + error.message)
    }
  }

  const handleEditFolder = async () => {
    if (!folderForm.name.trim() || !selectedFolder) return

    const { error } = await supabase
      .from('portfolio_folders')
      .update({
        name: folderForm.name.trim(),
        description: folderForm.description.trim()
      })
      .eq('id', selectedFolder.id)

    if (!error) {
      setFolders(folders.map(f => f.id === selectedFolder.id 
        ? { ...f, name: folderForm.name.trim(), description: folderForm.description.trim() }
        : f
      ))
      setShowEditModal(false)
      setSelectedFolder(null)
      setFolderForm({ name: '', description: '' })
    }
  }

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return

    const { error } = await supabase
      .from('portfolio_folders')
      .delete()
      .eq('id', selectedFolder.id)

    if (!error) {
      setFolders(folders.filter(f => f.id !== selectedFolder.id))
      setShowDeleteModal(false)
      setSelectedFolder(null)
    }
  }

  const openFolder = (folder) => {
    setCurrentFolder(folder)
    fetchFolderPhotos(folder.id)
  }

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length || !currentFolder) return

    setUploading(true)

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `portfolio/${currentFolder.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(fileName, file)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('patient-photos')
          .getPublicUrl(fileName)

        await supabase
          .from('portfolio_photos')
          .insert([{
            folder_id: currentFolder.id,
            photo_url: publicUrl,
            storage_path: fileName,
            file_name: file.name
          }])
      }
    }

    fetchFolderPhotos(currentFolder.id)
    setUploading(false)
  }

  const handleDeletePhoto = async (photo) => {
    if (!confirm('Supprimer cette photo?')) return

    await supabase.storage
      .from('patient-photos')
      .remove([photo.storage_path])

    await supabase
      .from('portfolio_photos')
      .delete()
      .eq('id', photo.id)

    setFolderPhotos(folderPhotos.filter(p => p.id !== photo.id))
  }

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const styles = {
    container: { padding: '1.5rem' },
    header: { marginBottom: '1.5rem' },
    title: { fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' },
    toolbar: { 
      display: 'flex', 
      flexWrap: 'wrap',
      gap: '1rem', 
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-card)',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem'
    },
    viewToggle: { display: 'flex', gap: '0.5rem' },
    viewBtn: {
      padding: '0.5rem 1rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.85rem'
    },
    viewBtnActive: {
      background: 'var(--primary)',
      color: 'white',
      borderColor: 'var(--primary)'
    },
    searchBox: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center'
    },
    searchInput: {
      padding: '0.5rem 1rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      color: 'var(--text-primary)',
      width: '250px'
    },
    createBtn: {
      padding: '0.5rem 1rem',
      background: 'var(--primary)',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '500'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'var(--text-secondary)',
      fontSize: '0.85rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem'
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: 'var(--bg-card)',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    folderCard: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '2px solid transparent'
    },
    folderIcon: {
      color: 'var(--primary)',
      marginBottom: '0.75rem'
    },
    folderName: {
      fontWeight: '500',
      color: 'var(--text-primary)',
      marginBottom: '0.25rem'
    },
    folderDesc: {
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      marginBottom: '0.5rem'
    },
    folderCount: {
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
      background: 'var(--bg-secondary)',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      display: 'inline-block'
    },
    folderActions: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'center',
      marginTop: '0.75rem'
    },
    actionBtn: {
      padding: '0.375rem',
      background: 'var(--bg-secondary)',
      border: 'none',
      borderRadius: '4px',
      color: 'var(--text-secondary)',
      cursor: 'pointer'
    },
    emptyState: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: 'var(--text-muted)'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '1.5rem',
      width: '90%',
      maxWidth: '450px'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'var(--text-primary)'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: 'var(--text-secondary)',
      fontSize: '0.85rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      color: 'var(--text-primary)',
      fontSize: '0.9rem'
    },
    textarea: {
      minHeight: '80px',
      resize: 'vertical'
    },
    modalFooter: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
      marginTop: '1.5rem'
    },
    btnSecondary: {
      padding: '0.625rem 1.25rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      color: 'var(--text-primary)',
      cursor: 'pointer'
    },
    btnPrimary: {
      padding: '0.625rem 1.25rem',
      background: 'var(--primary)',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      cursor: 'pointer',
      fontWeight: '500'
    },
    btnDanger: {
      padding: '0.625rem 1.25rem',
      background: 'var(--danger)',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      cursor: 'pointer'
    },
    // Folder detail view
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      marginBottom: '1rem'
    },
    uploadArea: {
      border: '2px dashed var(--border)',
      borderRadius: '8px',
      padding: '2rem',
      textAlign: 'center',
      marginBottom: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    photoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '1rem'
    },
    photoCard: {
      position: 'relative',
      aspectRatio: '1',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'var(--bg-secondary)'
    },
    photoImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    photoDelete: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      background: 'var(--danger)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }

  // Vue détaillée d'un dossier
  if (currentFolder) {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => { setCurrentFolder(null); setFolderPhotos([]) }}>
          <Icons.Back /> Retour aux dossiers
        </button>

        <h1 style={styles.title}>{currentFolder.name}</h1>
        {currentFolder.description && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{currentFolder.description}</p>
        )}

        <label style={styles.uploadArea}>
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
          <Icons.Upload />
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            {uploading ? 'Téléversement en cours...' : 'Cliquez ou glissez des photos ici'}
          </p>
        </label>

        {folderPhotos.length > 0 ? (
          <div style={styles.photoGrid}>
            {folderPhotos.map(photo => (
              <div key={photo.id} style={styles.photoCard}>
                <img src={photo.photo_url} alt="" style={styles.photoImg} />
                <button style={styles.photoDelete} onClick={() => handleDeletePhoto(photo)}>
                  <Icons.X />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <Icons.Image />
            <p>Aucune photo dans ce dossier</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Portfolio</h1>

      <div style={styles.toolbar}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div style={styles.viewToggle}>
            <button 
              style={{ ...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {}) }}
              onClick={() => setViewMode('list')}
            >
              <Icons.List /> Liste
            </button>
            <button 
              style={{ ...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {}) }}
              onClick={() => setViewMode('grid')}
            >
              <Icons.Grid /> Photos
            </button>
          </div>

          {/* Create Button */}
          <button style={styles.createBtn} onClick={() => setShowCreateModal(true)}>
            <Icons.Plus /> Créer un dossier
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Rechercher un dossier..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Show only mine */}
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={showOnlyMine}
              onChange={(e) => setShowOnlyMine(e.target.checked)}
            />
            Mes dossiers uniquement
          </label>
        </div>
      </div>

      {loading ? (
        <div style={styles.emptyState}>Chargement...</div>
      ) : filteredFolders.length === 0 ? (
        <div style={styles.emptyState}>
          <Icons.Folder />
          <h3>Aucun dossier</h3>
          <p>Créez votre premier dossier portfolio pour organiser vos photos.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div>
          {filteredFolders.map(folder => (
            <div 
              key={folder.id} 
              style={styles.listItem}
              onClick={() => openFolder(folder)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <div style={{ color: 'var(--primary)' }}><Icons.Folder /></div>
              <div style={{ flex: 1 }}>
                <div style={styles.folderName}>{folder.name}</div>
                {folder.description && <div style={styles.folderDesc}>{folder.description}</div>}
              </div>
              <span style={styles.folderCount}>
                {folder.portfolio_photos?.[0]?.count || 0} photos
              </span>
              <div style={styles.folderActions} onClick={(e) => e.stopPropagation()}>
                <button 
                  style={styles.actionBtn}
                  onClick={() => { setSelectedFolder(folder); setFolderForm({ name: folder.name, description: folder.description || '' }); setShowEditModal(true) }}
                >
                  <Icons.Edit />
                </button>
                <button 
                  style={{ ...styles.actionBtn, color: 'var(--danger)' }}
                  onClick={() => { setSelectedFolder(folder); setShowDeleteModal(true) }}
                >
                  <Icons.Trash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredFolders.map(folder => (
            <div 
              key={folder.id} 
              style={styles.folderCard}
              onClick={() => openFolder(folder)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={styles.folderIcon}><Icons.Folder /></div>
              <div style={styles.folderName}>{folder.name}</div>
              {folder.description && <div style={styles.folderDesc}>{folder.description}</div>}
              <span style={styles.folderCount}>
                {folder.portfolio_photos?.[0]?.count || 0} photos
              </span>
              <div style={styles.folderActions} onClick={(e) => e.stopPropagation()}>
                <button 
                  style={styles.actionBtn}
                  onClick={() => { setSelectedFolder(folder); setFolderForm({ name: folder.name, description: folder.description || '' }); setShowEditModal(true) }}
                >
                  <Icons.Edit />
                </button>
                <button 
                  style={{ ...styles.actionBtn, color: 'var(--danger)' }}
                  onClick={() => { setSelectedFolder(folder); setShowDeleteModal(true) }}
                >
                  <Icons.Trash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Créer un dossier</h2>
              <button style={styles.closeBtn} onClick={() => setShowCreateModal(false)}><Icons.X /></button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nom du dossier *</label>
              <input
                type="text"
                style={styles.input}
                value={folderForm.name}
                onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                placeholder="Ex: Avant/Après Botox"
                maxLength={40}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                value={folderForm.description}
                onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                placeholder="Description optionnelle..."
                maxLength={140}
              />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setShowCreateModal(false)}>Annuler</button>
              <button style={styles.btnPrimary} onClick={handleCreateFolder} disabled={!folderForm.name.trim()}>
                Créer le dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={styles.modal} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Modifier le dossier</h2>
              <button style={styles.closeBtn} onClick={() => setShowEditModal(false)}><Icons.X /></button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nom du dossier *</label>
              <input
                type="text"
                style={styles.input}
                value={folderForm.name}
                onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                maxLength={40}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                value={folderForm.description}
                onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                maxLength={140}
              />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setShowEditModal(false)}>Annuler</button>
              <button style={styles.btnPrimary} onClick={handleEditFolder} disabled={!folderForm.name.trim()}>
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={styles.modal} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Supprimer le dossier</h2>
              <button style={styles.closeBtn} onClick={() => setShowDeleteModal(false)}><Icons.X /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Êtes-vous sûr de vouloir supprimer le dossier "{selectedFolder?.name}"? 
              Cette action supprimera également toutes les photos qu'il contient.
            </p>
            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button style={styles.btnDanger} onClick={handleDeleteFolder}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
