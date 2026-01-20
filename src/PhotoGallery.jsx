import { useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  ZoomIn: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>,
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

export default function PhotoGallery({ visit, patient, onClose, onRefresh }) {
  const [photos, setPhotos] = useState(visit.photos || [])
  const [uploading, setUploading] = useState(null)
  const [viewPhoto, setViewPhoto] = useState(null)
  const fileInputRef = useRef(null)
  const [currentPhotoSlot, setCurrentPhotoSlot] = useState(null)

  // Déterminer le protocole selon le type de visite
  const protocol = visit.visit_type === 'initial' ? PHOTO_PROTOCOLS.initial : PHOTO_PROTOCOLS.botox

  const handlePhotoClick = (photo) => {
    setCurrentPhotoSlot(photo)
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !currentPhotoSlot) return

    setUploading(currentPhotoSlot.number)

    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${patient.id}/${visit.id}/photo_${currentPhotoSlot.number}_${Date.now()}.${fileExt}`

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('patient-photos')
        .getPublicUrl(fileName)

      // Supprimer l'ancienne photo si elle existe
      const existingPhoto = photos.find(p => p.photo_number === currentPhotoSlot.number)
      if (existingPhoto) {
        await supabase.storage
          .from('patient-photos')
          .remove([existingPhoto.storage_path])
        
        await supabase
          .from('photos')
          .delete()
          .eq('id', existingPhoto.id)
      }

      // Sauvegarder les métadonnées dans la base
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

      // Mettre à jour l'état local
      setPhotos(prev => {
        const filtered = prev.filter(p => p.photo_number !== currentPhotoSlot.number)
        return [...filtered, photoData].sort((a, b) => a.photo_number - b.photo_number)
      })

    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Erreur lors du téléchargement: ' + error.message)
    } finally {
      setUploading(null)
      setCurrentPhotoSlot(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm('Supprimer cette photo?')) return

    try {
      // Supprimer du storage
      await supabase.storage
        .from('patient-photos')
        .remove([photo.storage_path])

      // Supprimer de la base
      await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)

      setPhotos(prev => prev.filter(p => p.id !== photo.id))
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  const getPhotoForSlot = (photoNumber) => {
    return photos.find(p => p.photo_number === photoNumber)
  }

  const completedCount = photos.length
  const totalCount = protocol.sections.reduce((sum, s) => sum + s.photos.length, 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        style={{ maxWidth: '1000px', maxHeight: '95vh', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">📸 Photos - {protocol.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {completedCount}/{totalCount} photos • {protocol.description}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div className="modal-body" style={{ overflow: 'auto', maxHeight: 'calc(95vh - 140px)' }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileSelect}
          />

          {protocol.sections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: 'var(--accent)'
              }}>
                {section.title}
              </h3>
              {section.instruction && (
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)', 
                  marginBottom: '0.75rem',
                  fontStyle: 'italic'
                }}>
                  💡 {section.instruction}
                </p>
              )}
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {section.photos.map(photo => {
                  const existingPhoto = getPhotoForSlot(photo.number)
                  const isUploading = uploading === photo.number

                  return (
                    <div
                      key={photo.number}
                      style={{
                        position: 'relative',
                        aspectRatio: '3/4',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: existingPhoto ? '2px solid var(--accent)' : '2px dashed var(--border)',
                        background: existingPhoto ? 'transparent' : 'var(--bg-dark)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => existingPhoto ? setViewPhoto(existingPhoto) : handlePhotoClick(photo)}
                    >
                      {existingPhoto ? (
                        <>
                          <img
                            src={existingPhoto.photo_url}
                            alt={photo.label}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: 'var(--accent)',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icons.Check />
                          </div>
                        </>
                      ) : (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          padding: '1rem',
                          textAlign: 'center'
                        }}>
                          {isUploading ? (
                            <div style={{ color: 'var(--accent)' }}>Chargement...</div>
                          ) : (
                            <>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem'
                              }}>
                                <Icons.Camera />
                              </div>
                              <span style={{ 
                                fontSize: '0.7rem', 
                                color: 'var(--text-muted)',
                                lineHeight: '1.3'
                              }}>
                                {photo.label}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Numéro de photo */}
                      <div style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        left: '0.5rem',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        #{photo.number}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {completedCount > 0 && `✅ ${completedCount} photo(s) enregistrée(s)`}
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>

      {/* Modal de visualisation plein écran */}
      {viewPhoto && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 1001 }}
          onClick={() => setViewPhoto(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={viewPhoto.photo_url}
              alt={viewPhoto.photo_label}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: '12px'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-50px',
              left: '0',
              right: '0',
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem'
            }}>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => handlePhotoClick({ 
                  number: viewPhoto.photo_number, 
                  label: viewPhoto.photo_label,
                  category: viewPhoto.photo_category 
                })}
              >
                <Icons.Camera /> Remplacer
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => {
                  handleDeletePhoto(viewPhoto)
                  setViewPhoto(null)
                }}
              >
                <Icons.Trash /> Supprimer
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setViewPhoto(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
