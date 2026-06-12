import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { configureDentitek } from '../services/dentitek/dentitekClient'
import {
  getPatientMapping,
  searchDentitekPatient,
  linkExistingPatient,
} from '../services/dentitek/syncService'

// ============================================================
// FaceHub — Carte « Dentitek » de la fiche patient (Phase 2)
// - Patient lié : affiche le no de dossier Dentitek et la clinique
// - Patient non lié : recherche dans Dentitek + liaison en un clic
//   (lie le patient FaceHub EXISTANT — ne crée pas de doublon)
// Rendue dans la colonne de droite de PatientDetail (classes pp-*).
// ============================================================

export default function DentitekPatientLink({ patient, onLinked }) {
  const [mapping, setMapping] = useState(null)
  const [maps, setMaps] = useState([])
  const [clinicUuid, setClinicUuid] = useState('')
  const [searchName, setSearchName] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState(null) // { ok, text }

  useEffect(() => { init() }, [patient.id])

  const init = async () => {
    const { data: cfg } = await supabase.from('dentitek_config').select('*').limit(1).maybeSingle()
    if (cfg) configureDentitek({ mode: cfg.mode, subDomain: cfg.sub_domain, apiKey: cfg.api_key || '' })

    const { data: m } = await supabase.from('dentitek_clinic_map').select('*').eq('is_active', true)
    setMaps(m || [])

    // Présélectionner la clinique Dentitek correspondant à celle du patient
    const own = (m || []).find(x => x.clinic_id && x.clinic_id === patient.clinic_id)
    setClinicUuid(own?.dentitek_clinic_uuid || m?.[0]?.dentitek_clinic_uuid || '')

    setSearchName(patient.name?.split(' ').slice(-1)[0] || '')
    setMapping(await getPatientMapping(patient.id))
  }

  const clinicName = (uuid) =>
    maps.find(m => m.dentitek_clinic_uuid === uuid)?.dentitek_clinic_name || uuid

  const handleSearch = async () => {
    if (!searchName.trim() || !clinicUuid) return
    setSearching(true)
    setResults(null)
    setMsg(null)
    try {
      setResults(await searchDentitekPatient(clinicUuid, searchName.trim()))
    } catch (e) {
      setResults([])
      setMsg({ ok: false, text: 'Erreur de recherche : ' + (e.message || e) })
    }
    setSearching(false)
  }

  const handleLink = async (p) => {
    setMsg(null)
    try {
      const { linked, updatedFields } = await linkExistingPatient(clinicUuid, p, patient.id)
      if (linked) {
        setMsg({
          ok: true,
          text: `✓ Lié au dossier Dentitek #${p.idPatientDentitek}` +
            (updatedFields?.length ? ' — coordonnées complétées' : ''),
        })
        setMapping(await getPatientMapping(patient.id))
        setOpen(false)
        setResults(null)
        onLinked?.()
      } else {
        setMsg({ ok: true, text: 'Ce patient est déjà lié à ce dossier Dentitek' })
      }
    } catch (e) {
      setMsg({ ok: false, text: e.message || String(e) })
    }
  }

  const S = {
    input: { width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '0.5rem' },
    btn: { padding: '0.5rem 0.9rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', background: 'var(--primary)', color: 'white' },
    btnGhost: { padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.8rem', background: 'transparent', color: 'var(--text-secondary)' },
  }

  return (
    <div className="pp-card">
      <h3 className="pp-section-title">⚡ Dentitek</h3>

      {mapping ? (
        <>
          <div className="pp-info-row">
            <div className="pp-info-label">Dossier Dentitek</div>
            <div className="pp-info-value">#{mapping.id_patient_dentitek}</div>
          </div>
          <div className="pp-info-row">
            <div className="pp-info-label">Clinique</div>
            <div className="pp-info-value">{clinicName(mapping.dentitek_clinic_uuid)}</div>
          </div>
          <div className="pp-info-row">
            <div className="pp-info-label">Dernière synchro</div>
            <div className="pp-info-value">
              {mapping.last_synced_at ? new Date(mapping.last_synced_at).toLocaleString('fr-CA') : '—'}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="pp-info-value" style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            Ce patient n'est pas lié à un dossier Dentitek.
          </div>

          {!open && (
            <button style={S.btn} onClick={() => setOpen(true)} disabled={maps.length === 0}>
              Lier depuis Dentitek
            </button>
          )}
          {maps.length === 0 && (
            <div className="pp-info-value" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Aucune clinique liée — voir Paramètres Dentitek.
            </div>
          )}

          {open && (
            <div>
              <select style={S.input} value={clinicUuid} onChange={e => setClinicUuid(e.target.value)}>
                {maps.map(m => (
                  <option key={m.dentitek_clinic_uuid} value={m.dentitek_clinic_uuid}>
                    {m.dentitek_clinic_name || m.dentitek_clinic_uuid}
                  </option>
                ))}
              </select>
              <input
                style={S.input}
                placeholder="Nom du patient"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={S.btn} onClick={handleSearch} disabled={searching}>
                  {searching ? 'Recherche…' : 'Rechercher'}
                </button>
                <button style={S.btnGhost} onClick={() => { setOpen(false); setResults(null); setMsg(null) }}>
                  Annuler
                </button>
              </div>

              {results && (
                <div style={{ marginTop: '0.75rem' }}>
                  {results.length === 0 && (
                    <div className="pp-info-value" style={{ color: 'var(--text-muted)' }}>Aucun résultat.</div>
                  )}
                  {results.map(p => (
                    <div key={p.idPatientDentitek} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1, fontSize: '0.85rem' }}>
                        <b>{p.firstName} {p.lastName}</b>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          #{p.idPatientDentitek} · {p.birthDate || '—'}
                        </div>
                      </div>
                      <button style={S.btnGhost} onClick={() => handleLink(p)}>Lier</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {msg && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: msg.ok ? 'var(--success)' : 'var(--danger)' }}>
          {msg.text}
        </div>
      )}
    </div>
  )
}
