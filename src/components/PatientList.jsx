import { useState } from 'react'

const Icons = {
  Search: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Eye: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Clipboard: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Question: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Users: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
}

export default function PatientList({ patients, onRefresh, onSelectPatient, onEditPatient, onViewVisits, onRegisterInOffice, onRegisterByEmail }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')

  // Filtrer les patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = !searchTerm || 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.metadata?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.metadata?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'active' ? p.is_active !== false : p.is_active === false
    
    return matchesSearch && matchesStatus
  })

  // Trier les patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let aVal, bVal
    
    switch (sortField) {
      case 'firstName':
        aVal = a.metadata?.firstName || a.name?.split(' ')[0] || ''
        bVal = b.metadata?.firstName || b.name?.split(' ')[0] || ''
        break
      case 'lastName':
        aVal = a.metadata?.lastName || a.name?.split(' ').slice(1).join(' ') || ''
        bVal = b.metadata?.lastName || b.name?.split(' ').slice(1).join(' ') || ''
        break
      case 'phone':
        aVal = a.phone || ''
        bVal = b.phone || ''
        break
      case 'city':
        aVal = a.metadata?.address?.city || a.metadata?.city || ''
        bVal = b.metadata?.address?.city || b.metadata?.city || ''
        break
      case 'province':
        aVal = a.metadata?.address?.province || a.metadata?.province || ''
        bVal = b.metadata?.address?.province || b.metadata?.province || ''
        break
      case 'birthday':
        aVal = a.birthdate || ''
        bVal = b.birthdate || ''
        break
      case 'status':
        aVal = isRegistrationComplete(a) ? 1 : 0
        bVal = isRegistrationComplete(b) ? 1 : 0
        break
      case 'created_at':
      default:
        aVal = a.created_at || ''
        bVal = b.created_at || ''
        break
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedPatients.length / entriesPerPage) || 1
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedPatients = sortedPatients.slice(startIndex, endIndex)

  // Vérifier si l'inscription est complète (Full = Complete, Quick = Incomplete)
  function isRegistrationComplete(patient) {
    // Si registrationType est 'quick', c'est toujours Incomplete
    if (patient.metadata?.registrationType === 'quick') return false
    
    // Pour Full registration, vérifier les champs essentiels
    const m = patient.metadata
    if (!m) return false
    
    // Vérifier les consentements si présents
    const hasConsents = m.consents && (
      m.consents.botox !== undefined || 
      m.consents.filler !== undefined || 
      m.consents.photo !== undefined
    )
    
    return !!(m.firstName && m.lastName && patient.birthdate && 
              (m.contact?.email || patient.email) && hasConsents)
  }

  // Formater la date
  function formatDate(dateString) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-CA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Extraire prénom/nom
  function getFirstName(patient) {
    if (patient.metadata?.firstName) return patient.metadata.firstName
    if (patient.name) return patient.name.split(' ')[0]
    return '-'
  }

  function getLastName(patient) {
    if (patient.metadata?.lastName) return patient.metadata.lastName
    if (patient.name) {
      const parts = patient.name.split(' ')
      return parts.length > 1 ? parts.slice(1).join(' ') : '-'
    }
    return '-'
  }

  // Extraire téléphone
  function getPhone(patient) {
    return patient.phone || 
           patient.metadata?.contact?.cellPhone || 
           patient.metadata?.cellPhone || 
           '-'
  }

  // Extraire ville
  function getCity(patient) {
    return patient.metadata?.address?.city || 
           patient.metadata?.city || 
           '-'
  }

  // Extraire province
  function getProvince(patient) {
    return patient.metadata?.address?.province || 
           patient.metadata?.province || 
           '-'
  }

  // Extraire date de naissance
  function getBirthday(patient) {
    return patient.birthdate || patient.metadata?.birthday || null
  }

  // Gérer le tri
  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Styles
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
    filterRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap'
    },
    filterLabel: {
      fontSize: '0.9rem',
      color: 'var(--text-secondary)',
      whiteSpace: 'nowrap'
    },
    select: {
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: '1px solid var(--border)',
      background: 'var(--bg-input)',
      color: 'var(--text-primary)',
      fontSize: '0.9rem',
      cursor: 'pointer',
      minWidth: '120px'
    },
    btn: {
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: 'none',
      background: 'var(--primary)',
      color: 'white',
      fontSize: '0.9rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
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
    link: {
      color: 'var(--primary)',
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-block'
    },
    badgeComplete: {
      background: 'rgba(76, 175, 80, 0.2)',
      color: '#4caf50'
    },
    badgeIncomplete: {
      background: 'rgba(255, 167, 38, 0.2)',
      color: '#ffa726'
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
      background: 'rgba(76, 175, 80, 0.2)',
      color: '#4caf50'
    },
    actionBtnEdit: {
      background: 'rgba(255, 167, 38, 0.2)',
      color: '#ffa726'
    },
    actionBtnVisits: {
      background: 'rgba(90, 154, 156, 0.2)',
      color: 'var(--primary)'
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
    emptyState: {
      textAlign: 'center',
      padding: '3rem 2rem',
      color: 'var(--text-muted)'
    },
    helpIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      marginLeft: '0.25rem',
      color: 'var(--text-muted)',
      cursor: 'help'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-breadcrumb">
        <a href="#">Accueil</a> | Patients
      </div>
      <h1 className="page-title">PATIENTS</h1>

      {/* Card Container */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          
          {/* Filter Row */}
          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Statut du patient</span>
            <select 
              style={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            
            <button style={styles.btn} onClick={onRegisterInOffice}>
              Inscrire au bureau
            </button>
            <button style={styles.btn} onClick={onRegisterByEmail}>
              Inscrire par courriel
            </button>
          </div>

          {/* Table Controls */}
          <div style={styles.tableControls}>
            <div style={styles.entriesSelect}>
              <select 
                style={{ ...styles.select, minWidth: '60px' }}
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
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rechercher:</span>
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
          {paginatedPatients.length > 0 ? (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th} onClick={() => handleSort('firstName')}>
                        Prénom {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => handleSort('lastName')}>
                        Nom {sortField === 'lastName' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => handleSort('phone')}>
                        Téléphone {sortField === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => handleSort('city')}>
                        Ville {sortField === 'city' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => handleSort('province')}>
                        Province {sortField === 'province' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => handleSort('birthday')}>
                        Date de naissance {sortField === 'birthday' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => handleSort('status')}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          Statut inscription
                          <span style={styles.helpIcon} title="Indique si le dossier du patient a complété tous les formulaires requis">
                            <Icons.Question />
                          </span>
                        </span>
                      </th>
                      <th style={styles.th} onClick={() => handleSort('created_at')}>
                        Date d'inscription {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPatients.map(patient => (
                      <tr key={patient.id}>
                        <td style={styles.td}>
                          <span style={styles.link} onClick={() => onSelectPatient(patient)}>
                            {getFirstName(patient)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.link} onClick={() => onSelectPatient(patient)}>
                            {getLastName(patient)}
                          </span>
                        </td>
                        <td style={styles.td}>{getPhone(patient)}</td>
                        <td style={styles.td}>{getCity(patient)}</td>
                        <td style={styles.td}>{getProvince(patient)}</td>
                        <td style={styles.td}>{formatDate(getBirthday(patient))}</td>
                        <td style={styles.td}>
                          {isRegistrationComplete(patient) ? (
                            <span style={{ ...styles.badge, ...styles.badgeComplete }}>Complet</span>
                          ) : (
                            <span style={{ ...styles.badge, ...styles.badgeIncomplete }}>Incomplet</span>
                          )}
                        </td>
                        <td style={styles.td}>{formatDate(patient.created_at)}</td>
                        <td style={styles.td}>
                          <button 
                            style={{ ...styles.actionBtn, ...styles.actionBtnView }}
                            onClick={() => onSelectPatient(patient)}
                            title="Voir le profil"
                          >
                            <Icons.Eye />
                          </button>
                          <button 
                            style={{ ...styles.actionBtn, ...styles.actionBtnEdit }}
                            onClick={() => onEditPatient ? onEditPatient(patient) : onSelectPatient(patient)}
                            title="Modifier le profil"
                          >
                            <Icons.Edit />
                          </button>
                          <button 
                            style={{ ...styles.actionBtn, ...styles.actionBtnVisits }}
                            onClick={() => onViewVisits ? onViewVisits(patient) : onSelectPatient(patient)}
                            title="Voir les visites"
                          >
                            <Icons.Clipboard />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={styles.pagination}>
                <div style={styles.pageInfo}>
                  Affichage de {startIndex + 1} à {Math.min(endIndex, sortedPatients.length)} sur {sortedPatients.length} entrées
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
            </>
          ) : (
            <div style={styles.emptyState}>
              <Icons.Users />
              <h3 style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucun patient pour le moment'}
              </h3>
              <p style={{ marginTop: '0.5rem' }}>
                {searchTerm ? 'Essayez de modifier votre recherche' : 'Inscrivez votre premier patient pour commencer'}
              </p>
              {!searchTerm && (
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button style={styles.btn} onClick={onRegisterInOffice}>
                    Inscrire au bureau
                  </button>
                  <button style={styles.btn} onClick={onRegisterByEmail}>
                    Inscrire par courriel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
