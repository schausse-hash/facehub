import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Search: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Eye: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Filter: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
}

// Options de filtres
const ETHNICITY_OPTIONS = [
  { value: 'caucasian', label: 'Caucasien' },
  { value: 'african', label: 'Africain/Noir' },
  { value: 'hispanic', label: 'Hispanique/Latino' },
  { value: 'asian', label: 'Asiatique' },
  { value: 'middle_eastern', label: 'Moyen-Oriental' },
  { value: 'pacific_islander', label: 'Insulaire du Pacifique' },
  { value: 'native_american', label: 'Autochtone' },
  { value: 'other', label: 'Autre' },
]

const GENDER_OPTIONS = [
  { value: 'female', label: 'Femme' },
  { value: 'male', label: 'Homme' },
  { value: 'transgender_female', label: 'Femme transgenre' },
  { value: 'transgender_male', label: 'Homme transgenre' },
  { value: 'non_binary', label: 'Non-binaire' },
  { value: 'other', label: 'Autre' },
]

const SEX_OPTIONS = [
  { value: 'female', label: 'Femme' },
  { value: 'male', label: 'Homme' },
  { value: 'other', label: 'Autre' },
]

const AGE_OPTIONS = [
  { value: '0-19', label: '0-19 ans' },
  { value: '20-29', label: '20-29 ans' },
  { value: '30-39', label: '30-39 ans' },
  { value: '40-49', label: '40-49 ans' },
  { value: '50-59', label: '50-59 ans' },
  { value: '60-69', label: '60-69 ans' },
  { value: '70-79', label: '70-79 ans' },
  { value: '80+', label: '80 ans et plus' },
]

const VISITS_OPTIONS = [
  { value: 1, label: '1 ou plus' },
  { value: 2, label: '2 ou plus' },
  { value: 3, label: '3 ou plus' },
  { value: 5, label: '5 ou plus' },
  { value: 10, label: '10 ou plus' },
]

const BOTOX_PRODUCTS = ['Botox', 'Botox Cosmetic', 'Dysport', 'Xeomin']

const FILLER_PRODUCTS = [
  'Belotero', 'Emervel', 'Juvederm Ultra', 'Juvederm Ultra Plus',
  'Perlane', 'Restylane', 'Revanesse', 'Revanesse Contour',
  'Revanesse Kiss', 'Revanesse Pure', 'Revanesse Ultra',
  'Sculptra', 'Teosal'
]

const TREATMENT_AREAS = [
  { value: 'frontalis', label: 'Frontalis' },
  { value: 'glabella', label: 'Glabelle' },
  { value: 'crows_feet', label: 'Pattes d\'oie' },
  { value: 'brow_lift', label: 'Lifting sourcils' },
  { value: 'mid_face', label: 'Milieu du visage' },
  { value: 'lower_face', label: 'Bas du visage' },
  { value: 'platysma', label: 'Platysma' },
  { value: 'masseter', label: 'Masséter' },
  { value: 'lips', label: 'Lèvres' },
  { value: 'chin', label: 'Menton' },
  { value: 'cheeks', label: 'Joues' },
  { value: 'nose', label: 'Nez' },
]

const CONSENT_TYPES = [
  { value: 'botox', label: 'Consentement toxine botulique' },
  { value: 'filler', label: 'Consentement agents de comblement' },
  { value: 'photo', label: 'Consentement photographie' },
]

export default function CaseSearch({ session, userClinic, onViewPatient }) {
  const [activeTab, setActiveTab] = useState('search')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [practitioners, setPractitioners] = useState([])
  
  // Filtres Patient
  const [filters, setFilters] = useState({
    ethnicity: '',
    gender: '',
    sex: '',
    ageRange: '',
    minVisits: '',
    consents: [],
  })
  
  // Filtres Visite
  const [visitFilters, setVisitFilters] = useState({
    visitDate: '',
    lotNumber: '',
    practitionerId: '',
    botoxProducts: [],
    fillerProducts: [],
    treatmentAreas: [],
    microneedling: false,
  })
  
  const [hideWithoutVisits, setHideWithoutVisits] = useState(true)

  useEffect(() => {
    fetchPractitioners()
  }, [userClinic])

  const fetchPractitioners = async () => {
    if (!userClinic?.id) return

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('clinic_id', userClinic.id)
      .in('role', ['practitioner', 'admin', 'super_admin'])

    if (rolesData?.length) {
      const userIds = rolesData.map(r => r.user_id)
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds)

      setPractitioners(profilesData?.map(p => ({
        id: p.user_id,
        name: `${p.last_name || ''}, ${p.first_name || ''}`.trim()
      })) || [])
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    
    let query = supabase
      .from('patients')
      .select(`
        *,
        visits(count)
      `)
      .eq('clinic_id', userClinic?.id)

    // Filtres démographiques
    if (filters.ethnicity) {
      query = query.eq('ethnicity', filters.ethnicity)
    }
    if (filters.gender) {
      query = query.eq('gender', filters.gender)
    }
    if (filters.sex) {
      query = query.eq('sex', filters.sex)
    }

    const { data, error } = await query.order('last_name', { ascending: true })

    if (!error && data) {
      let filteredData = data

      // Filtrer par âge
      if (filters.ageRange) {
        const [minAge, maxAge] = filters.ageRange.split('-').map(a => a === '+' ? 150 : parseInt(a))
        const today = new Date()
        
        filteredData = filteredData.filter(p => {
          if (!p.date_of_birth) return false
          const birth = new Date(p.date_of_birth)
          const age = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000))
          return age >= minAge && age <= (maxAge || 150)
        })
      }

      // Filtrer par nombre minimum de visites
      if (filters.minVisits) {
        filteredData = filteredData.filter(p => 
          (p.visits?.[0]?.count || 0) >= parseInt(filters.minVisits)
        )
      }

      // Cacher les patients sans visites correspondantes
      if (hideWithoutVisits) {
        filteredData = filteredData.filter(p => (p.visits?.[0]?.count || 0) > 0)
      }

      setResults(filteredData)
    }

    setLoading(false)
    setActiveTab('results')
  }

  const handleClear = () => {
    setFilters({
      ethnicity: '',
      gender: '',
      sex: '',
      ageRange: '',
      minVisits: '',
      consents: [],
    })
    setVisitFilters({
      visitDate: '',
      lotNumber: '',
      practitionerId: '',
      botoxProducts: [],
      fillerProducts: [],
      treatmentAreas: [],
      microneedling: false,
    })
    setResults([])
  }

  const toggleArrayFilter = (array, value, setter, key) => {
    if (array.includes(value)) {
      setter(prev => ({ ...prev, [key]: prev[key].filter(v => v !== value) }))
    } else {
      setter(prev => ({ ...prev, [key]: [...prev[key], value] }))
    }
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '-'
    const birth = new Date(dateOfBirth)
    const today = new Date()
    const age = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000))
    return age
  }

  const styles = {
    container: { padding: '1.5rem' },
    title: { fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' },
    tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
    tab: {
      padding: '0.75rem 1.5rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    tabActive: {
      background: 'var(--primary)',
      color: 'white',
      borderColor: 'var(--primary)'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '1.5rem'
    },
    card: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '1.25rem'
    },
    cardTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    sectionTitle: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'var(--primary)',
      marginTop: '1.25rem',
      marginBottom: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    formGroup: { marginBottom: '1rem' },
    label: {
      display: 'block',
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      marginBottom: '0.375rem'
    },
    select: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      color: 'var(--text-primary)',
      fontSize: '0.85rem'
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      color: 'var(--text-primary)',
      fontSize: '0.85rem'
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)',
      cursor: 'pointer'
    },
    checkboxGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem'
    },
    visitGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem'
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      marginTop: '1.5rem',
      paddingTop: '1rem',
      borderTop: '1px solid var(--border)'
    },
    btnSecondary: {
      padding: '0.625rem 1.5rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      fontWeight: '500'
    },
    btnPrimary: {
      padding: '0.625rem 1.5rem',
      background: 'var(--primary)',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      cursor: 'pointer',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem 1rem',
      borderBottom: '2px solid var(--border)',
      color: 'var(--text-muted)',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    td: {
      padding: '0.875rem 1rem',
      borderBottom: '1px solid var(--border)',
      color: 'var(--text-primary)',
      fontSize: '0.9rem'
    },
    row: {
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: 'var(--text-muted)'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      background: 'var(--primary)',
      color: 'white',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    optionCheckbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      marginBottom: '0.25rem'
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Recherche de cas</h1>

      {/* Onglets */}
      <div style={styles.tabs}>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'search' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('search')}
        >
          Recherche
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'results' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('results')}
        >
          Résultats {results.length > 0 && <span style={styles.badge}>{results.length}</span>}
        </button>
      </div>

      {/* Onglet Recherche */}
      {activeTab === 'search' && (
        <div style={styles.grid}>
          {/* Colonne gauche - Filtres Patient */}
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}><Icons.User /> Filtrer par patient</h2>
              
              <h3 style={styles.sectionTitle}>Démographique</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Ethnicité</label>
                <select 
                  style={styles.select}
                  value={filters.ethnicity}
                  onChange={(e) => setFilters({ ...filters, ethnicity: e.target.value })}
                >
                  <option value="">Tous</option>
                  {ETHNICITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Identité de genre</label>
                <select 
                  style={styles.select}
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                >
                  <option value="">Tous</option>
                  {GENDER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Sexe à la naissance</label>
                <select 
                  style={styles.select}
                  value={filters.sex}
                  onChange={(e) => setFilters({ ...filters, sex: e.target.value })}
                >
                  <option value="">Tous</option>
                  {SEX_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tranche d'âge</label>
                <select 
                  style={styles.select}
                  value={filters.ageRange}
                  onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
                >
                  <option value="">Tous</option>
                  {AGE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <h3 style={styles.sectionTitle}>Consentements</h3>
              <div style={styles.checkboxGroup}>
                {CONSENT_TYPES.map(consent => (
                  <label key={consent.value} style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={filters.consents.includes(consent.value)}
                      onChange={() => toggleArrayFilter(filters.consents, consent.value, setFilters, 'consents')}
                    />
                    {consent.label}
                  </label>
                ))}
              </div>

              <h3 style={styles.sectionTitle}>Visites passées</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre minimum de visites</label>
                <select 
                  style={styles.select}
                  value={filters.minVisits}
                  onChange={(e) => setFilters({ ...filters, minVisits: e.target.value })}
                >
                  <option value="">Tous</option>
                  {VISITS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Colonne droite - Filtres Visite */}
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}><Icons.Calendar /> Filtrer par visite</h2>
              
              <div style={styles.visitGrid}>
                {/* Détails visite */}
                <div>
                  <h3 style={styles.sectionTitle}>Détails de la visite</h3>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date de visite</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={visitFilters.visitDate}
                      onChange={(e) => setVisitFilters({ ...visitFilters, visitDate: e.target.value })}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Numéro de lot</label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Numéro de lot..."
                      value={visitFilters.lotNumber}
                      onChange={(e) => setVisitFilters({ ...visitFilters, lotNumber: e.target.value })}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Praticien</label>
                    <select 
                      style={styles.select}
                      value={visitFilters.practitionerId}
                      onChange={(e) => setVisitFilters({ ...visitFilters, practitionerId: e.target.value })}
                    >
                      <option value="">Tous</option>
                      {practitioners.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <h3 style={styles.sectionTitle}>Toxine Botulique</h3>
                  <div style={styles.checkboxGroup}>
                    {BOTOX_PRODUCTS.map(product => (
                      <label key={product} style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={visitFilters.botoxProducts.includes(product)}
                          onChange={() => toggleArrayFilter(visitFilters.botoxProducts, product, setVisitFilters, 'botoxProducts')}
                        />
                        {product}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Agents de comblement */}
                <div>
                  <h3 style={styles.sectionTitle}>Agents de comblement</h3>
                  <div style={styles.checkboxGroup}>
                    {FILLER_PRODUCTS.map(product => (
                      <label key={product} style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={visitFilters.fillerProducts.includes(product)}
                          onChange={() => toggleArrayFilter(visitFilters.fillerProducts, product, setVisitFilters, 'fillerProducts')}
                        />
                        {product}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Zones traitées */}
                <div>
                  <h3 style={styles.sectionTitle}>Zones traitées</h3>
                  <div style={styles.checkboxGroup}>
                    {TREATMENT_AREAS.map(area => (
                      <label key={area.value} style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={visitFilters.treatmentAreas.includes(area.value)}
                          onChange={() => toggleArrayFilter(visitFilters.treatmentAreas, area.value, setVisitFilters, 'treatmentAreas')}
                        />
                        {area.label}
                      </label>
                    ))}
                  </div>

                  <h3 style={styles.sectionTitle}>Microneedling</h3>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={visitFilters.microneedling}
                      onChange={(e) => setVisitFilters({ ...visitFilters, microneedling: e.target.checked })}
                    />
                    Générique
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '1rem' }}>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={hideWithoutVisits}
                  onChange={(e) => setHideWithoutVisits(e.target.checked)}
                />
                Afficher uniquement les patients avec au moins une visite correspondante
              </label>
            </div>

            <div style={styles.actions}>
              <button style={styles.btnSecondary} onClick={handleClear}>
                Effacer
              </button>
              <button style={styles.btnPrimary} onClick={handleSearch} disabled={loading}>
                <Icons.Search />
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Résultats */}
      {activeTab === 'results' && (
        <div style={styles.card}>
          {results.length === 0 ? (
            <div style={styles.emptyState}>
              <Icons.Search />
              <p style={{ marginTop: '1rem' }}>Aucun résultat. Effectuez une recherche pour voir les patients.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Visites</th>
                  <th style={styles.th}>Prénom</th>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Âge</th>
                  <th style={styles.th}>Genre</th>
                  <th style={styles.th}>Sexe</th>
                  <th style={styles.th}>Ethnicité</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map(patient => (
                  <tr 
                    key={patient.id} 
                    style={styles.row}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={styles.td}>
                      <span style={styles.badge}>{patient.visits?.[0]?.count || 0}</span>
                    </td>
                    <td style={styles.td}>{patient.first_name || '-'}</td>
                    <td style={styles.td}>{patient.last_name || '-'}</td>
                    <td style={styles.td}>{calculateAge(patient.date_of_birth)}</td>
                    <td style={styles.td}>
                      {GENDER_OPTIONS.find(g => g.value === patient.gender)?.label || patient.gender || '-'}
                    </td>
                    <td style={styles.td}>
                      {SEX_OPTIONS.find(s => s.value === patient.sex)?.label || patient.sex || '-'}
                    </td>
                    <td style={styles.td}>
                      {ETHNICITY_OPTIONS.find(e => e.value === patient.ethnicity)?.label || patient.ethnicity || '-'}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => onViewPatient && onViewPatient(patient)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          background: 'var(--primary)',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        <Icons.Eye /> Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
