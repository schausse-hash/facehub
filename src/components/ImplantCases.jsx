import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const STATUTS = {
  consultation_initiale: { label: 'Consultation initiale', color: '#6b7280', bg: '#f3f4f6' },
  plan_traitement:       { label: 'Plan de traitement',    color: '#1d4ed8', bg: '#dbeafe' },
  en_attente_reponse:    { label: 'En attente de réponse', color: '#92400e', bg: '#fef3c7' },
  chirurgie_programmee:  { label: 'Chirurgie programmée',  color: '#b45309', bg: '#fde68a' },
  post_operatoire:       { label: 'Post-opératoire',       color: '#92400e', bg: '#fed7aa' },
  fabrication_labo:      { label: 'Fabrication au labo',   color: '#7c3aed', bg: '#ede9fe' },
  prothese_finale:       { label: 'Prothèse finale',       color: '#5b21b6', bg: '#ddd6fe' },
  termine:               { label: 'Terminé',               color: '#065f46', bg: '#d1fae5' },
  annule:                { label: 'Annulé',                color: '#991b1b', bg: '#fee2e2' },
}

const TYPES = {
  unitaire:     'Implant unitaire',
  multiple:     'Implants multiples',
  all_on_4:     'All-on-4',
  all_on_6:     'All-on-6',
  all_on_8:     'All-on-8',
  zygomatique:  'Zygomatique',
  pont_implant: 'Pont sur implants',
  pont_naturel: 'Pont sur dents',
  autre:        'Autre',
}

const Icons = {
  Tooth: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
  Search: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14"/></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/><path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18"/></svg>,
  ChevronRight: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6"/></svg>,
  Filter: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M7 8h10M11 12h2M10 16h4"/></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
}

export default function ImplantCases({ userProfile, userRole, clinicId, onSelectCase, onNewCase }) {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterClinic, setFilterClinic] = useState(clinicId || 'all')
  const [clinics, setClinics] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchClinics()
    fetchCases()
  }, [filterClinic, filterStatut])

  const fetchClinics = async () => {
    const { data } = await supabase.from('clinics').select('id, name').eq('is_active', true).order('name')
    if (data) setClinics(data)
  }

  const fetchCases = async () => {
    setLoading(true)
    let query = supabase
      .from('implant_cases')
      .select(`
        id, statut, type_traitement, dents, date_consultation, date_rdv, note_prv, created_at,
        patients (id, name, phone),
        clinics (id, name)
      `)
      .order('date_rdv', { ascending: true, nullsFirst: false })

    if (filterClinic !== 'all') query = query.eq('clinic_id', filterClinic)
    if (filterStatut !== 'all') query = query.eq('statut', filterStatut)

    const { data, error } = await query
    if (!error && data) {
      setCases(data)
      // Calcul des stats
      const s = {}
      data.forEach(c => { s[c.statut] = (s[c.statut] || 0) + 1 })
      setStats(s)
    }
    setLoading(false)
  }

  const filteredCases = cases.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.patients?.name?.toLowerCase().includes(q) ||
      c.patients?.phone?.includes(q) ||
      c.dents?.some(d => d.includes(q)) ||
      TYPES[c.type_traitement]?.toLowerCase().includes(q)
    )
  })

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isUrgent = (c) => {
    if (!c.date_rdv) return false
    const days = (new Date(c.date_rdv) - new Date()) / (1000 * 60 * 60 * 24)
    return days <= 7 && days >= 0
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: '#111827' }}>Cas implantologie</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
            {filteredCases.length} cas {filterStatut !== 'all' ? `· ${STATUTS[filterStatut]?.label}` : 'au total'}
          </p>
        </div>
        <button onClick={onNewCase} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: '#111827', color: '#fff', border: 'none', borderRadius: 8,
          fontSize: 14, fontWeight: 500, cursor: 'pointer'
        }}>
          <Icons.Plus /> Nouveau cas
        </button>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { key: 'chirurgie_programmee', emoji: '🗓️' },
          { key: 'post_operatoire', emoji: '🩺' },
          { key: 'fabrication_labo', emoji: '🔬' },
          { key: 'plan_traitement', emoji: '📋' },
        ].map(({ key, emoji }) => (
          <button key={key} onClick={() => setFilterStatut(filterStatut === key ? 'all' : key)} style={{
            background: filterStatut === key ? STATUTS[key].bg : '#f9fafb',
            border: `1.5px solid ${filterStatut === key ? STATUTS[key].color + '40' : '#e5e7eb'}`,
            borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'left'
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>{stats[key] || 0}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{STATUTS[key].label}</div>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <Icons.Search />
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher patient, dent, traitement..."
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
              border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none',
              boxSizing: 'border-box', background: '#fff'
            }}
          />
        </div>

        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{
          padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
          fontSize: 14, background: '#fff', cursor: 'pointer', outline: 'none'
        }}>
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUTS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select value={filterClinic} onChange={e => setFilterClinic(e.target.value)} style={{
          padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
          fontSize: 14, background: '#fff', cursor: 'pointer', outline: 'none'
        }}>
          <option value="all">Toutes les cliniques</option>
          {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {(filterStatut !== 'all' || filterClinic !== 'all' || search) && (
          <button onClick={() => { setFilterStatut('all'); setFilterClinic('all'); setSearch('') }} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px',
            border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13,
            background: '#fff', cursor: 'pointer', color: '#6b7280'
          }}>
            <Icons.X /> Effacer
          </button>
        )}
      </div>

      {/* Liste des cas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Chargement...</div>
      ) : filteredCases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🦷</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#374151' }}>Aucun cas trouvé</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Crée un nouveau cas pour commencer</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredCases.map(cas => {
            const statut = STATUTS[cas.statut] || STATUTS.consultation_initiale
            const urgent = isUrgent(cas)
            return (
              <div key={cas.id} onClick={() => onSelectCase(cas)} style={{
                background: '#fff',
                border: `1px solid ${urgent ? '#fbbf24' : '#e5e7eb'}`,
                borderLeft: `4px solid ${urgent ? '#f59e0b' : statut.color}`,
                borderRadius: 10, padding: '14px 16px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 16, transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Avatar patient */}
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: statut.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 15, fontWeight: 600, color: statut.color
                }}>
                  {cas.patients?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                </div>

                {/* Info principale */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>
                      {cas.patients?.name || 'Patient inconnu'}
                    </span>
                    {urgent && (
                      <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                        ⚡ Cette semaine
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {cas.type_traitement && <span>{TYPES[cas.type_traitement]}</span>}
                    {cas.dents?.length > 0 && (
                      <span>Dent{cas.dents.length > 1 ? 's' : ''} {cas.dents.join(', ')}</span>
                    )}
                    {cas.clinics?.name && <span>· {cas.clinics.name}</span>}
                  </div>
                </div>

                {/* Dates */}
                <div style={{ textAlign: 'right', flexShrink: 0, fontSize: 12, color: '#9ca3af' }}>
                  {cas.date_rdv && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginBottom: 2 }}>
                      <Icons.Calendar />
                      <span style={{ color: urgent ? '#b45309' : '#374151', fontWeight: urgent ? 600 : 400 }}>
                        {formatDate(cas.date_rdv)}
                      </span>
                    </div>
                  )}
                  {cas.note_prv && (
                    <div style={{ color: '#9ca3af' }}>PRV: {cas.note_prv}</div>
                  )}
                </div>

                {/* Statut badge */}
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
                    background: statut.bg, color: statut.color, whiteSpace: 'nowrap'
                  }}>
                    {statut.label}
                  </span>
                </div>

                <Icons.ChevronRight />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
