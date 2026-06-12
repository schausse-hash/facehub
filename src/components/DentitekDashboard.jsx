import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { configureDentitek } from '../services/dentitek/dentitekClient'
import {
  syncAllClinics,
  getCachedAppointments,
  getSyncLogs,
  searchDentitekPatient,
  importPatient,
} from '../services/dentitek/syncService'

// ============================================================
// FaceHub — Tableau de bord Dentitek (Phase 2)
// - Rendez-vous multi-cliniques (cache Supabase, bouton Synchroniser)
// - Recherche d'un patient dans Dentitek + import en un clic
// ============================================================

export default function DentitekDashboard({ userClinic }) {
  const [maps, setMaps] = useState([])
  const [appointments, setAppointments] = useState([])
  const [filterClinic, setFilterClinic] = useState('all')
  const [syncing, setSyncing] = useState(false)
  const [syncResults, setSyncResults] = useState(null)
  const [logs, setLogs] = useState([])

  // Recherche patient
  const [searchName, setSearchName] = useState('')
  const [searchClinic, setSearchClinic] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [importMsg, setImportMsg] = useState('')

  useEffect(() => { init() }, [])

  const init = async () => {
    // Charger la config Dentitek pour configurer le client
    const { data: cfg } = await supabase.from('dentitek_config').select('*').limit(1).maybeSingle()
    if (cfg) configureDentitek({ mode: cfg.mode, subDomain: cfg.sub_domain, apiKey: cfg.api_key || '' })

    const { data: m } = await supabase.from('dentitek_clinic_map').select('*').eq('is_active', true)
    setMaps(m || [])
    if (m?.length) setSearchClinic(m[0].dentitek_clinic_uuid)
    await refresh()
  }

  const refresh = async () => {
    const appts = await getCachedAppointments({ from: new Date().toISOString() })
    setAppointments(appts)
    setLogs(await getSyncLogs(5))
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResults(null)
    try {
      const results = await syncAllClinics({ daysAhead: 30 })
      setSyncResults(results)
      await refresh()
    } catch (e) {
      setSyncResults([{ clinic: '—', ok: false, error: String(e.message || e) }])
    }
    setSyncing(false)
  }

  const handleSearch = async () => {
    if (!searchName.trim() || !searchClinic) return
    setSearching(true)
    setSearchResults(null)
    setImportMsg('')
    try {
      const res = await searchDentitekPatient(searchClinic, searchName.trim())
      setSearchResults(res)
    } catch (e) {
      setSearchResults([])
      setImportMsg('Erreur de recherche : ' + (e.message || e))
    }
    setSearching(false)
  }

  const handleImport = async (p) => {
    setImportMsg('')
    try {
      const map = maps.find(m => m.dentitek_clinic_uuid === searchClinic)
      const { created } = await importPatient(searchClinic, p, map?.clinic_id || userClinic?.id || null)
      setImportMsg(created
        ? `✓ ${p.firstName} ${p.lastName} importé dans FaceHub`
        : `${p.firstName} ${p.lastName} est déjà lié à un patient FaceHub`)
    } catch (e) {
      setImportMsg('Erreur d\'import : ' + (e.message || e))
    }
  }

  const clinicName = (uuid) =>
    maps.find(m => m.dentitek_clinic_uuid === uuid)?.dentitek_clinic_name || uuid

  const visibleAppts = filterClinic === 'all'
    ? appointments
    : appointments.filter(a => a.dentitek_clinic_uuid === filterClinic)

  const fmtDate = (d) => d ? new Date(d).toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  const S = {
    card: { background: 'var(--bg-card, #1f2430)', borderRadius: 12, padding: 24, marginBottom: 20 },
    input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #3a4050', background: 'transparent', color: 'inherit', fontSize: 14 },
    btn: (bg) => ({ padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: bg, color: 'white' }),
    th: { textAlign: 'left', fontSize: 12, opacity: 0.6, padding: '8px 10px', borderBottom: '1px solid #3a4050' },
    td: { fontSize: 13, padding: '10px', borderBottom: '1px solid #2a3040' },
    badge: (s) => ({
      display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
      background: s === 'CONFIRMED' ? '#065f4633' : '#92400e33',
      color: s === 'CONFIRMED' ? '#34d399' : '#fbbf24',
    }),
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 4 }}>⚡ Dentitek — Rendez-vous multi-cliniques</h2>
      <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 24 }}>
        Données synchronisées depuis l'API Group V2 (30 prochains jours).
      </p>

      {maps.length === 0 && (
        <div style={S.card}>
          Aucune clinique liée. Va dans <b>Dentitek → Paramètres</b>, teste la connexion
          puis associe tes cliniques.
        </div>
      )}

      {/* --- Synchronisation --- */}
      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button style={S.btn('#2563eb')} onClick={handleSync} disabled={syncing || maps.length === 0}>
            {syncing ? 'Synchronisation…' : '↻ Synchroniser maintenant'}
          </button>
          <select style={S.input} value={filterClinic} onChange={e => setFilterClinic(e.target.value)}>
            <option value="all">Toutes les cliniques</option>
            {maps.map(m => (
              <option key={m.dentitek_clinic_uuid} value={m.dentitek_clinic_uuid}>
                {m.dentitek_clinic_name || m.dentitek_clinic_uuid}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 13, opacity: 0.6 }}>{visibleAppts.length} rendez-vous à venir</span>
        </div>

        {syncResults && (
          <div style={{ marginTop: 12, fontSize: 13 }}>
            {syncResults.map((r, i) => (
              <div key={i} style={{ color: r.ok ? '#34d399' : '#f87171' }}>
                {r.ok ? `✓ ${r.clinic} : ${r.upserted} rendez-vous` : `✗ ${r.clinic} : ${r.error}`}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Tableau des rendez-vous --- */}
      <div style={{ ...S.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={S.th}>Date</th>
              <th style={S.th}>Patient</th>
              <th style={S.th}>Clinique</th>
              <th style={S.th}>Note</th>
              <th style={S.th}>Confirmation</th>
            </tr>
          </thead>
          <tbody>
            {visibleAppts.length === 0 && (
              <tr><td style={S.td} colSpan={5}>Aucun rendez-vous en cache — clique « Synchroniser maintenant ».</td></tr>
            )}
            {visibleAppts.map(a => (
              <tr key={a.id_hor_rdv_pat_dentitek}>
                <td style={S.td}>{fmtDate(a.date_from)}</td>
                <td style={S.td}>{a.patient_name || a.id_patient_dentitek || '—'}</td>
                <td style={S.td}>{clinicName(a.dentitek_clinic_uuid)}</td>
                <td style={S.td}>{a.note || ''}</td>
                <td style={S.td}><span style={S.badge(a.status_confirmation)}>{a.status_confirmation || 'PENDING'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Recherche / import patient --- */}
      <div style={S.card}>
        <h3 style={{ marginTop: 0 }}>🔍 Rechercher un patient dans Dentitek</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select style={S.input} value={searchClinic} onChange={e => setSearchClinic(e.target.value)}>
            {maps.map(m => (
              <option key={m.dentitek_clinic_uuid} value={m.dentitek_clinic_uuid}>
                {m.dentitek_clinic_name || m.dentitek_clinic_uuid}
              </option>
            ))}
          </select>
          <input
            style={{ ...S.input, flex: 1, minWidth: 200 }}
            placeholder="Nom du patient (ex: Baggar)"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button style={S.btn('#374151')} onClick={handleSearch} disabled={searching}>
            {searching ? 'Recherche…' : 'Rechercher'}
          </button>
        </div>

        {importMsg && <div style={{ marginTop: 12, fontSize: 13, color: '#34d399' }}>{importMsg}</div>}

        {searchResults && (
          <div style={{ marginTop: 16 }}>
            {searchResults.length === 0 && <div style={{ fontSize: 13, opacity: 0.6 }}>Aucun résultat.</div>}
            {searchResults.map(p => (
              <div key={p.idPatientDentitek} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #2a3040' }}>
                <div style={{ flex: 1, fontSize: 14 }}>
                  <b>{p.firstName} {p.lastName}</b>
                  <span style={{ opacity: 0.5, fontSize: 12, marginLeft: 8 }}>
                    #{p.idPatientDentitek} · {p.birthDate || ''} · {p.mobile || p.email || ''}
                  </span>
                </div>
                <button style={S.btn('#059669')} onClick={() => handleImport(p)}>
                  Importer dans FaceHub
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Journal de synchronisation --- */}
      {logs.length > 0 && (
        <div style={S.card}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Dernières synchronisations</h3>
          {logs.map(l => (
            <div key={l.id} style={{ fontSize: 12, opacity: 0.7, padding: '4px 0' }}>
              {new Date(l.started_at).toLocaleString('fr-CA')} · {l.endpoint} · {clinicName(l.dentitek_clinic_uuid)} ·{' '}
              {l.status === 'ok' ? `✓ ${l.items_upserted} éléments` : `✗ ${l.error_message}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
