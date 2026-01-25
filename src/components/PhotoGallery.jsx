import { useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Download: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Image: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
}

// Configuration des photos selon le protocole
const PHOTO_PROTOCOLS = {
  initial: {
    name: 'Consultation initiale',
    description: 'Protocole complet - 29 photos',
    sections: [
      {
        title: 'Corps complet - Relaxed (f-9, 1.5m)',
        photos: [
          { number: 1, label: 'Full Face Frontal', category: 'relaxed-full' },
          { number: 2, label: 'Sagittal Right', category: 'relaxed-full' },
          { number: 3, label: 'Sagittal Left', category: 'relaxed-full' },
          { number: 4, label: '45° Right', category: 'relaxed-full' },
          { number: 5, label: '45° Left', category: 'relaxed-full' },
        ]
      },
      {
        title: 'Corps complet - Active (f-9, 1.5m)',
        instruction: 'Contract neck muscles, clench teeth, draw lower lip',
        photos: [
          { number: 6, label: 'Full Face Frontal', category: 'active-full' },
          { number: 7, label: 'Sagittal Right', category: 'active-full' },
          { number: 8, label: 'Sagittal Left', category: 'active-full' },
          { number: 9, label: '45° Right', category: 'active-full' },
          { number: 10, label: '45° Left', category: 'active-full' },
        ]
      },
      {
        title: 'Visage rapproché - Relaxed (f-9, 1.4m)',
        photos: [
          { number: 11, label: 'Close Up Face', category: 'relaxed-closeup' },
          { number: 12, label: '45° Right', category: 'relaxed-closeup' },
          { number: 13, label: '45° Left', category: 'relaxed-closeup' },
        ]
      },
      {
        title: 'Visage rapproché - Active (f-9, 1.4m)',
        instruction: 'Smile with teeth showing',
        photos: [
          { number: 14, label: 'Close Up Face', category: 'active-closeup' },
          { number: 15, label: '45° Right', category: 'active-closeup' },
          { number: 16, label: '45° Left', category: 'active-closeup' },
        ]
      },
      {
        title: 'Haut du visage - Relaxed (f-16, 0.8m)',
        photos: [
          { number: 17, label: 'Upper Face (Frontalis)', category: 'relaxed-upper' },
          { number: 18, label: 'Upper Face (Glabella)', category: 'relaxed-upper' },
          { number: 19, label: 'Upper Face Right 45° (Crow\'s feet)', category: 'relaxed-upper' },
          { number: 20, label: 'Upper Face Left 45° (Crow\'s feet)', category: 'relaxed-upper' },
        ]
      },
      {
        title: 'Haut du visage - Active (f-16, 0.8m)',
        instruction: 'Lift eyebrows / Frown / Squint',
        photos: [
          { number: 21, label: 'Upper Face (Frontalis) - Lift eyebrows', category: 'active-upper' },
          { number: 22, label: 'Upper Face (Glabella) - Frown', category: 'active-upper' },
          { number: 23, label: 'Upper Face Right 45° - Squint', category: 'active-upper' },
          { number: 24, label: 'Upper Face Left 45° - Squint', category: 'active-upper' },
        ]
      },
      {
        title: 'Milieu/Bas du visage - Relaxed (f-16, 0.8m)',
        photos: [
          { number: 25, label: 'Mid Face Frontal', category: 'relaxed-mid' },
          { number: 26, label: 'Lower Face', category: 'relaxed-mid' },
        ]
      },
      {
        title: 'Milieu/Bas du visage - Active (f-16, 0.8m)',
        instruction: 'Scrunch nose / Smile & show teeth',
        photos: [
          { number: 27, label: 'Mid Face Frontal - Scrunch nose', category: 'active-mid' },
          { number: 28, label: 'Lower Face - Smile', category: 'active-mid' },
          { number: 29, label: 'Upper & Lower Teeth Frontal', category: 'active-mid' },
        ]
      },
    ]
  },
  botox: {
    name: 'Traitement Botox',
    description: '10 photos - 5 angles Relaxed + Active',
    sections: [
      {
        title: 'Relaxed (f-9, 1.5m)',
        photos: [
          { number: 1, label: 'Full Face Frontal', category: 'relaxed' },
          { number: 2, label: 'Sagittal Right', category: 'relaxed' },
          { number: 3, label: 'Sagittal Left', category: 'relaxed' },
          { number: 4, label: '45° Right', category: 'relaxed' },
          { number: 5, label: '45° Left', category: 'relaxed' },
        ]
      },
      {
        title: 'Active (f-9, 1.5m)',
        instruction: 'Contract neck muscles, clench teeth, draw lower lip',
        photos: [
          { number: 6, label: 'Full Face Frontal', category: 'active' },
          { number: 7, label: 'Sagittal Right', category: 'active' },
          { number: 8, label: 'Sagittal Left', category: 'active' },
          { number: 9, label: '45° Right', category: 'active' },
          { number: 10, label: '45° Left', category: 'active' },
        ]
      },
    ]
  }
}

export default function PhotoGallery({ visit, patient, allVisits = [], onClose, onRefresh }) {
  const [photos, setPhotos] = useState(visit.photos || [])
  const [uploading, setUploading] = useState(null)
  const [viewPhoto, setViewPhoto] = useState(null)
  const [showCompare, setShowCompare] = useState(false)
  const [compareVisit, setCompareVisit] = useState(null)
  const [exportingPDF, setExportingPDF] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [currentPhotoSlot, setCurrentPhotoSlot] = useState(null)

  // Déterminer le protocole selon le type de visite
  const protocol = visit.visit_type === 'initial' ? PHOTO_PROTOCOLS.initial : PHOTO_PROTOCOLS.botox

  // Autres visites pour comparaison
  const otherVisits = allVisits.filter(v => v.id !== visit.id && v.photos?.length > 0)

  const handlePhotoClick = (photo, mode = 'file') => {
    setCurrentPhotoSlot(photo)
    if (mode === 'camera') {
      cameraInputRef.current?.click()
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !currentPhotoSlot) return

    setUploading(currentPhotoSlot.number)

    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${patient.id}/${visit.id}/photo_${currentPhotoSlot.number}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('patient-photos')
        .getPublicUrl(fileName)

      const existingPhoto = photos.find(p => p.photo_number === currentPhotoSlot.number)
      if (existingPhoto) {
        await supabase.storage.from('patient-photos').remove([existingPhoto.storage_path])
        await supabase.from('photos').delete().eq('id', existingPhoto.id)
      }

      const { data: photoData, error: dbError } = await supabase
        .from('photos')
        .insert([{
          visit_id: visit.id,
          patient_id: patient.id,
          photo_number: currentPhotoSlot.number,
          photo_category: currentPhotoSlot.category,
          photo_label: currentPhotoSlot.label,
          photo_url: publicUrl,
          storage_path: fileName
        }])
        .select()
        .single()

      if (dbError) throw dbError

      setPhotos(prev => {
        const filtered = prev.filter(p => p.photo_number !== currentPhotoSlot.number)
        return [...filtered, photoData].sort((a, b) => a.photo_number - b.photo_number)
      })

    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setUploading(null)
      setCurrentPhotoSlot(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm('Supprimer cette photo?')) return
    try {
      await supabase.storage.from('patient-photos').remove([photo.storage_path])
      await supabase.from('photos').delete().eq('id', photo.id)
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  const getPhotoForSlot = (photoNumber) => photos.find(p => p.photo_number === photoNumber)

  const handleExportPDF = async () => {
    if (photos.length === 0) { alert('Aucune photo à exporter'); return }
    setExportingPDF(true)
    try {
      const printWindow = window.open('', '_blank')
      const visitDate = new Date(visit.visit_date).toLocaleDateString('fr-CA')
      
      let photosHtml = photos.map(photo => `
        <div style="break-inside: avoid; margin-bottom: 20px; text-align: center;">
          <img src="${photo.photo_url}" style="max-width: 100%; max-height: 350px; border-radius: 8px;" />
          <p style="margin-top: 8px; font-size: 12px; color: #666;">#${photo.photo_number} - ${photo.photo_label}</p>
        </div>
      `).join('')

      printWindow.document.write(`<!DOCTYPE html><html><head><title>Photos - ${patient.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #333; border-bottom: 2px solid #d4a574; padding-bottom: 10px; }
          .info { margin-bottom: 20px; color: #666; }
          .photos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        </style></head>
        <body>
          <h1>📸 FaceHub - Rapport Photos</h1>
          <div class="info">
            <p><strong>Patient:</strong> ${patient.name}</p>
            <p><strong>Date:</strong> ${visitDate}</p>
            <p><strong>Type:</strong> ${protocol.name}</p>
          </div>
          <div class="photos">${photosHtml}</div>
          <script>setTimeout(() => window.print(), 500)</script>
        </body></html>`)
      printWindow.document.close()
    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setExportingPDF(false)
    }
  }

  const completedCount = photos.length
  const totalCount = protocol.sections.reduce((sum, s) => sum + s.photos.length, 0)

  // Vue Comparaison
  if (showCompare && compareVisit) {
    const comparePhotos = compareVisit.photos || []
    return (
      <div className="modal-overlay" onClick={() => setShowCompare(false)}>
        <div className="modal" style={{ maxWidth: '1200px', maxHeight: '95vh', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2 className="modal-title">🔄 Comparaison Avant/Après</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {new Date(compareVisit.visit_date).toLocaleDateString('fr-CA')} → {new Date(visit.visit_date).toLocaleDateString('fr-CA')}
              </p>
            </div>
            <button className="modal-close" onClick={() => setShowCompare(false)}><Icons.X /></button>
          </div>
          <div className="modal-body" style={{ overflow: 'auto', maxHeight: 'calc(95vh - 140px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                <strong>AVANT</strong> - {new Date(compareVisit.visit_date).toLocaleDateString('fr-CA')}
              </div>
              <div style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--accent)', color: 'var(--primary)', borderRadius: '8px' }}>
                <strong>APRÈS</strong> - {new Date(visit.visit_date).toLocaleDateString('fr-CA')}
              </div>
            </div>
            {[1,2,3,4,5,6,7,8,9,10].map(num => {
              const before = comparePhotos.find(p => p.photo_number === num)
              const after = photos.find(p => p.photo_number === num)
              if (!before && !after) return null
              return (
                <div key={num} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>#{num} - {before?.photo_label || after?.photo_label}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ aspectRatio: '3/4', background: 'var(--bg-dark)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {before ? <img src={before.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </div>
                    <div style={{ aspectRatio: '3/4', background: 'var(--bg-dark)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {after ? <img src={after.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={() => setShowCompare(false)}>Retour</button>
            <button className="btn btn-primary" onClick={handleExportPDF}><Icons.Download /> Exporter PDF</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '1000px', maxHeight: '95vh', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">📸 Photos - {protocol.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{completedCount}/{totalCount} photos</p>
          </div>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>

        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {otherVisits.length > 0 && (
            <>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Comparer:</span>
              <select style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                onChange={(e) => { const v = otherVisits.find(x => x.id === e.target.value); if(v) { setCompareVisit(v); setShowCompare(true); }}} defaultValue="">
                <option value="" disabled>Sélectionner</option>
                {otherVisits.map(v => <option key={v.id} value={v.id}>{new Date(v.visit_date).toLocaleDateString('fr-CA')} ({v.photos?.length})</option>)}
              </select>
            </>
          )}
          <button className="btn btn-outline btn-sm" onClick={handleExportPDF} disabled={exportingPDF || photos.length === 0} style={{ marginLeft: 'auto' }}>
            <Icons.Download /> {exportingPDF ? 'Export...' : 'PDF'}
          </button>
        </div>

        <div className="modal-body" style={{ overflow: 'auto', maxHeight: 'calc(95vh - 220px)', paddingBottom: '1rem' }}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />
          <input type="file" ref={cameraInputRef} style={{ display: 'none' }} accept="image/*" capture="environment" onChange={handleFileSelect} />

          {protocol.sections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--accent)' }}>{section.title}</h3>
              {section.instruction && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontStyle: 'italic' }}>💡 {section.instruction}</p>}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {section.photos.map(photo => {
                  const existing = getPhotoForSlot(photo.number)
                  const isUploading = uploading === photo.number
                  return (
                    <div key={photo.number} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', border: existing ? '2px solid var(--accent)' : '2px dashed var(--border)', background: existing ? 'transparent' : 'var(--bg-dark)', cursor: 'pointer' }}
                      onClick={() => existing && setViewPhoto(existing)}>
                      {existing ? (
                        <>
                          <img src={existing.photo_url} alt={photo.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'var(--accent)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Check /></div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0.5rem', textAlign: 'center', gap: '0.5rem' }}>
                          {isUploading ? <div style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>...</div> : (
                            <>
                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={(e) => { e.stopPropagation(); handlePhotoClick(photo, 'camera'); }} style={{ width: '50px', height: '50px', borderRadius: '12px', border: '2px solid var(--accent)', background: 'rgba(212, 165, 116, 0.15)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }} title="Caméra">
                                  <Icons.Camera />
                                  <span style={{ fontSize: '0.5rem' }}>Photo</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handlePhotoClick(photo, 'file'); }} style={{ width: '50px', height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }} title="Galerie">
                                  <Icons.Image />
                                  <span style={{ fontSize: '0.5rem' }}>Galerie</span>
                                </button>
                              </div>
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>{photo.label}</span>
                            </>
                          )}
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: '0.4rem', left: '0.4rem', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600' }}>#{photo.number}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', bottom: 0 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{completedCount > 0 && `✅ ${completedCount} photo(s)`}</div>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '0.75rem 2rem' }}>Fermer</button>
        </div>
      </div>

      {viewPhoto && (
        <div className="modal-overlay" style={{ zIndex: 1001 }} onClick={() => setViewPhoto(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img src={viewPhoto.photo_url} alt={viewPhoto.photo_label} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px' }} />
            <div style={{ position: 'absolute', bottom: '-50px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => handlePhotoClick({ number: viewPhoto.photo_number, label: viewPhoto.photo_label, category: viewPhoto.photo_category }, 'camera')}><Icons.Camera /> Reprendre</button>
              <button className="btn btn-outline btn-sm" onClick={() => handlePhotoClick({ number: viewPhoto.photo_number, label: viewPhoto.photo_label, category: viewPhoto.photo_category }, 'file')}><Icons.Image /> Remplacer</button>
              <button className="btn btn-danger btn-sm" onClick={() => { handleDeletePhoto(viewPhoto); setViewPhoto(null); }}><Icons.Trash /></button>
              <button className="btn btn-primary btn-sm" onClick={() => setViewPhoto(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
