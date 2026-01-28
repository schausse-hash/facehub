import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Eye: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
}

export default function VisitsList({ patient, onBack, onCreateVisit, onViewVisit, session }) {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState('visit_date')
  const [sortDirection, setSortDirection] = useState('desc')

  useEffect(() => {
    fetchVisits()
  }, [patient.id])

  const fetchVisits = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('visits')
      .select(`*, treatments (*), photos (*)`)
      .eq('patient_id', patient.id)
      .order('visit_date', { ascending: false })

    if (!error && data) {
      // Fetch practitioner names
      const userIds = [...new Set(data.map(v => v.user_id).filter(Boolean))]
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('user_id, full_name')
          .in('user_id', userIds)

        const profilesMap = {}
        profilesData?.forEach(p => {
          profilesMap[p.user_id] = p.full_name
        })

        const visitsWithPractitioner = data.map(visit => ({
          ...visit,
          practitioner_name: profilesMap[visit.user_id] || 'Inconnu'
        }))
        setVisits(visitsWithPractitioner)
      } else {
        setVisits(data)
      }
    }
    setLoading(false)
  }

  const handleCreateVisit = async () => {
    setShowCreateModal(false)
    
    // Create new visit
    const { data, error } = await supabase
      .from('visits')
      .insert([{
        patient_id: patient.id,
        user_id: session.user.id,
        visit_date: new Date().toISOString(),
        visit_type: 'treatment',
        notes: ''
      }])
      .select()
      .single()

    if (!error && data) {
      // Navigate to visit detail
      onCreateVisit(data)
    } else {
      alert('Erreur lors de la création de la visite: ' + error?.message)
    }
  }

  const handleDeleteVisit = async (visitId) => {
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitId)

    if (!error) {
      setShowDeleteModal(null)
      fetchVisits()
    } else {
      alert('Erreur lors de la suppression de la visite: ' + error.message)
    }
  }

  // Get patient full name
  const getPatientName = () => {
    if (patient.metadata?.firstName && patient.metadata?.lastName) {
      return `${patient.metadata.firstName} ${patient.metadata.lastName}`.toLowerCase()
    }
    return patient.name?.toLowerCase() || 'Patient'
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-CA', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  }

  // Get treatment summary
  const getTreatmentSummary = (visit) => {
    if (!visit.treatments || visit.treatments.length === 0) return '-'
    const types = [...new Set(visit.treatments.map(t => t.treatment_type))]
    return types.join(', ')
  }

  // Get treatment type
  const getTreatmentType = (visit) => {
    if (!visit.treatments || visit.treatments.length === 0) return '-'
    const products = [...new Set(visit.treatments.map(t => t.product))]
    return products.join(', ')
  }

  // Get photo count
  const getPhotoCount = (visit) => {
    return visit.photos?.length || 0
  }

  // Filter and sort visits
  const filteredVisits = visits.filter(v => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      formatDate(v.visit_date).includes(search) ||
      getTreatmentSummary(v).toLowerCase().includes(search) ||
      getTreatmentType(v).toLowerCase().includes(search)
    )
  })

  const sortedVisits = [...filteredVisits].sort((a, b) => {
    let aVal, bVal
    switch (sortField) {
      case 'visit_date':
        aVal = a.visit_date || ''
        bVal = b.visit_date || ''
        break
      case 'treatment':
        aVal = getTreatmentSummary(a)
        bVal = getTreatmentSummary(b)
        break
      case 'photos':
        aVal = getPhotoCount(a)
        bVal = getPhotoCount(b)
        break
      default:
        aVal = a.visit_date || ''
        bVal = b.visit_date || ''
    }
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedVisits.length / entriesPerPage) || 1
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedVisits = sortedVisits.slice(startIndex, endIndex)

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Styles
  const styles = {
    container: {
      padding: '0'
    },
    breadcrumb: {
      fontSize: '0.85rem',
      color: 'var(--text-muted)',
      marginBottom: '0.5rem'
    },
    breadcrumbLink: {
      color: 'var(--text-muted)',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '1.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    card: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      overflow: 'hidden'
    },
    cardBody: {
      padding: '1.5rem'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    patientBadge: {
      background: '#1e2428',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    createBtn: {
      background: '#5a9a9c',
      color: 'white',
      border: 'none',
      padding: '0.6rem 1.2rem',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    tableControls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    entriesSelect: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)'
    },
    select: {
      padding: '0.5rem',
      borderRadius: '6px',
      border: '1px solid var(--border)',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)',
      fontSize: '0.85rem'
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    searchInput: {
      padding: '0.5rem 0.75rem',
      borderRadius: '6px',
      border: '1px solid var(--border)',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)',
      fontSize: '0.85rem',
      width: '200px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'var(--text-secondary)',
      borderBottom: '2px solid var(--border)',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '0.75rem 1rem',
      fontSize: '0.9rem',
      color: 'var(--text-primary)',
      borderBottom: '1px solid var(--border)'
    },
    emptyRow: {
      textAlign: 'center',
      padding: '3rem',
      color: 'var(--text-muted)'
    },
    actionBtn: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '0.25rem',
      transition: 'all 0.2s'
    },
    actionBtnView: {
      background: '#d4edda',
      color: '#155724'
    },
    actionBtnEdit: {
      background: '#fff3cd',
      color: '#856404'
    },
    actionBtnDelete: {
      background: '#f8d7da',
      color: '#721c24'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    pageInfo: {
      fontSize: '0.85rem',
      color: 'var(--text-secondary)'
    },
    pageControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    pageBtn: {
      width: '32px',
      height: '32px',
      borderRadius: '4px',
      border: '1px solid var(--border)',
      background: 'var(--bg-card)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)',
      fontSize: '0.85rem'
    },
    pageBtnActive: {
      background: 'var(--primary)',
      color: 'white',
      borderColor: 'var(--primary)'
    },
    pageBtnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    copyright: {
      textAlign: 'right',
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
      marginTop: '2rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'white',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #e9ecef'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0,
      color: '#333'
    },
    modalClose: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      color: '#666'
    },
    modalBody: {
      padding: '1.5rem'
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      padding: '1rem 1.5rem',
      borderTop: '1px solid #e9ecef'
    },
    btnCancel: {
      padding: '0.5rem 1.25rem',
      borderRadius: '6px',
      border: '1px solid #ddd',
      background: 'white',
      color: '#333',
      fontSize: '0.9rem',
      cursor: 'pointer'
    },
    btnConfirm: {
      padding: '0.5rem 1.25rem',
      borderRadius: '6px',
      border: 'none',
      background: '#5a9a9c',
      color: 'white',
      fontSize: '0.9rem',
      cursor: 'pointer'
    },
    btnDanger: {
      padding: '0.5rem 1.25rem',
      borderRadius: '6px',
      border: 'none',
      background: '#dc3545',
      color: 'white',
      fontSize: '0.9rem',
      cursor: 'pointer'
    }
  }

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadcrumbLink} onClick={onBack}>Accueil</span>
        {' | '}
        <span style={styles.breadcrumbLink} onClick={onBack}>{getPatientName()}</span>
        {' | '}
        <span>Visites</span>
      </div>

      {/* Title */}
      <h1 style={styles.title}>VISITES</h1>

      {/* Card */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          
          {/* Header Row */}
          <div style={styles.headerRow}>
            <div style={styles.patientBadge}>
              Patient: {getPatientName()}
            </div>
            <button 
              style={styles.createBtn}
              onClick={() => setShowCreateModal(true)}
            >
              Créer une visite
            </button>
          </div>

          {/* Table Controls */}
          <div style={styles.tableControls}>
            <div style={styles.entriesSelect}>
              <select 
                style={styles.select}
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(parseInt(e.target.value))
                  setCurrentPage(1)
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entrées par page</span>
            </div>
            
            <div style={styles.searchBox}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rechercher :</span>
              <input 
                type="text"
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th} onClick={() => handleSort('visit_date')}>
                    Date {sortField === 'visit_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={styles.th} onClick={() => handleSort('treatment')}>
                    Traitement {sortField === 'treatment' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={styles.th}>Type de traitement</th>
                  <th style={styles.th} onClick={() => handleSort('photos')}>
                    Photos {sortField === 'photos' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={styles.emptyRow}>Chargement...</td>
                  </tr>
                ) : paginatedVisits.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.emptyRow}>Aucune visite pour ce patient</td>
                  </tr>
                ) : (
                  paginatedVisits.map(visit => (
                    <tr key={visit.id}>
                      <td style={styles.td}>{formatDate(visit.visit_date)}</td>
                      <td style={styles.td}>{getTreatmentSummary(visit)}</td>
                      <td style={styles.td}>{getTreatmentType(visit)}</td>
                      <td style={styles.td}>
                        {getPhotoCount(visit) > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Icons.Camera /> {getPhotoCount(visit)}
                          </span>
                        )}
                        {getPhotoCount(visit) === 0 && '-'}
                      </td>
                      <td style={styles.td}>
                        <button 
                          style={{ ...styles.actionBtn, ...styles.actionBtnView }}
                          onClick={() => onViewVisit(visit)}
                          title="Voir la visite"
                        >
                          <Icons.Eye />
                        </button>
                        <button 
                          style={{ ...styles.actionBtn, ...styles.actionBtnEdit }}
                          onClick={() => onViewVisit(visit)}
                          title="Modifier la visite"
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          style={{ ...styles.actionBtn, ...styles.actionBtnDelete }}
                          onClick={() => setShowDeleteModal(visit)}
                          title="Supprimer la visite"
                        >
                          <Icons.Trash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.pagination}>
            <div style={styles.pageInfo}>
              Affichage de {sortedVisits.length === 0 ? 0 : startIndex + 1} à {Math.min(endIndex, sortedVisits.length)} sur {sortedVisits.length} entrées
            </div>
            
            <div style={styles.pageControls}>
              <button 
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === 1 ? styles.pageBtnDisabled : {})
                }}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button 
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === 1 ? styles.pageBtnDisabled : {})
                }}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button 
                    key={pageNum}
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage === pageNum ? styles.pageBtnActive : {})
                    }}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button 
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === totalPages ? styles.pageBtnDisabled : {})
                }}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
              <button 
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === totalPages ? styles.pageBtnDisabled : {})
                }}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div style={styles.copyright}>
        COPYRIGHT © {new Date().getFullYear()} FACEHUB
      </div>

      {/* Create Visit Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Créer une visite</h3>
              <button style={styles.modalClose} onClick={() => setShowCreateModal(false)}>
                <Icons.X />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>Êtes-vous sûr de vouloir créer une nouvelle visite pour ce patient?</p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setShowCreateModal(false)}>
                Annuler
              </button>
              <button style={styles.btnConfirm} onClick={handleCreateVisit}>
                Oui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Visit Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Supprimer la visite</h3>
              <button style={styles.modalClose} onClick={() => setShowDeleteModal(null)}>
                <Icons.X />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>Êtes-vous sûr de vouloir supprimer cette visite? Cette action est irréversible.</p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setShowDeleteModal(null)}>
                Annuler
              </button>
              <button style={styles.btnDanger} onClick={() => handleDeleteVisit(showDeleteModal.id)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
