import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { dentitek, configureDentitek, DentitekError } from '../services/dentitek/dentitekClient'

// ============================================================
// FaceHub — Paramètres de l'intégration Dentitek
// Réservé aux rôles super_admin / owner.
// - Mode simulation (mock) tant que la clé du portail n'est pas reçue
// - Test de connexion (GET /version + /practices)
// - Mapping cliniques FaceHub ↔ cliniques Dentitek
// ============================================================

export default function DentitekSettings({ userRole }) {
  const [config, setConfig] = useState(null)
  const [clinics, setClinics] = useState([])
  const [mappings, setMappings] = useState([])
  const [dtkPractices, setDtkPractices] = useState([])
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const canEdit = userRole === 'super_admin' || userRole === 'owner'

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const [{ data: cfg }, { data: cls }, { data: maps }] = await Promise.all([
      supabase.from('dentitek_config').select('*').limit(1).maybeSingle(),
      supabase.from('clinics').select('id, name').eq('is_active', true).order('name'),
      supabase.from('dentitek_clinic_map').select('*'),
    ])
    if (cfg) {
      setConfig(cfg)
      configureDentitek({ mode: cfg.mode, subDomain: cfg.sub_domain, apiKey: cfg.api_key || '' })
    }
    if (cls) setClinics(cls)
    if (maps) setMappings(maps)
  }

  const saveConfig = async () => {
    if (!canEdit || !config) return
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('dentitek_config')
      .update({
        mode: config.mode,
        sub_domain: config.sub_domain,
        api_key: config.api_key,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id)
    setSaving(false)
    if (error) setMessage('Erreur de sauvegarde : ' + error.message)
    else {
      configureDentitek({ mode: config.mode, subDomain: config.sub_domain, apiKey: config.api_key || '' })
      setMessage('Configuration sauvegardée ✓')
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    setDtkPractices([])
    try {
      configureDentitek({ mode: config.mode, subDomain: config.sub_domain, apiKey: config.api_key || '' })
      const version = await dentitek.version()
      const practices = await dentitek.practices()
      setDtkPractices(practices || [])
      setTestResult({
        ok: true,
        text: `Connexion réussie — API ${version?.version || '?'} · ${practices?.length || 0} clinique(s) trouvée(s)` +
              (config.mode === 'mock' ? ' (mode simulation)' : ''),
      })
    } catch (e) {
      const status = e instanceof DentitekError ? e.status : ''
      setTestResult({ ok: false, text: `Échec ${status}: ${e.message}` })
    }
    setTesting(false)
  }

  const setMapping = async (clinicId, dtkUuid) => {
    const dtkClinic = dtkPractices.find(p => p.clinic_uuid === dtkUuid)
    if (!dtkUuid) {
      await supabase.from('dentitek_clinic_map').delete().eq('clinic_id', clinicId)
    } else {
      await supabase.from('dentitek_clinic_map').upsert({
        clinic_id: clinicId,
        dentitek_clinic_uuid: dtkUuid,
        dentitek_clinic_name: dtkClinic?.name || null,
        is_active: true,
      }, { onConflict: 'clinic_id' })
    }
    const { data } = await supabase.from('dentitek_clinic_map').select('*')
    if (data) setMappings(data)
  }

  if (!config) return <div style={{ padding: 24 }}>Chargement…</div>

  const S = {
    card: { background: 'var(--bg-card, #1f2430)', borderRadius: 12, padding: 24, marginBottom: 20, maxWidth: 720 },
    label: { display: 'block', fontSize: 13, opacity: 0.7, marginBottom: 6, marginTop: 14 },
    input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #3a4050', background: 'transparent', color: 'inherit', fontSize: 14 },
    btn: { padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    badge: (ok) => ({ display: 'inline-block', padding: '6px 12px', borderRadius: 8, fontSize: 13, marginTop: 12, background: ok ? '#065f4633' : '#991b1b33', color: ok ? '#34d399' : '#f87171' }),
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 4 }}>🔌 Intégration Dentitek</h2>
      <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 24 }}>
        Connexion à l'API Group V2 de Dentitek (portail partenaires Progitek).
      </p>

      <div style={S.card}>
        <h3 style={{ marginTop: 0 }}>Connexion</h3>

        <label style={S.label}>Mode</label>
        <select
          style={S.input}
          value={config.mode}
          disabled={!canEdit}
          onChange={e => setConfig({ ...config, mode: e.target.value })}
        >
          <option value="mock">Simulation (sans clé — données de démonstration)</option>
          <option value="live">Production (clé API requise)</option>
        </select>

        <label style={S.label}>Sous-domaine du groupe (https://[sous-domaine].dentitek.info/v1)</label>
        <input
          style={S.input}
          value={config.sub_domain || ''}
          disabled={!canEdit}
          placeholder="staging"
          onChange={e => setConfig({ ...config, sub_domain: e.target.value.trim() })}
        />

        <label style={S.label}>Clé API (x-api-key) — fournie par le portail partenaires</label>
        <input
          style={S.input}
          type="password"
          value={config.api_key || ''}
          disabled={!canEdit}
          placeholder={config.mode === 'mock' ? 'Non requise en mode simulation' : 'Coller la clé ici'}
          onChange={e => setConfig({ ...config, api_key: e.target.value.trim() })}
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {canEdit && (
            <button style={{ ...S.btn, background: '#2563eb', color: 'white' }} onClick={saveConfig} disabled={saving}>
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          )}
          <button style={{ ...S.btn, background: '#374151', color: 'white' }} onClick={testConnection} disabled={testing}>
            {testing ? 'Test en cours…' : 'Tester la connexion'}
          </button>
        </div>

        {testResult && <div style={S.badge(testResult.ok)}>{testResult.text}</div>}
        {message && <div style={S.badge(true)}>{message}</div>}
      </div>

      {dtkPractices.length > 0 && (
        <div style={S.card}>
          <h3 style={{ marginTop: 0 }}>Correspondance des cliniques</h3>
          <p style={{ opacity: 0.6, fontSize: 13 }}>
            Associe chaque clinique FaceHub à sa clinique Dentitek.
          </p>
          {clinics.map(c => {
            const map = mappings.find(m => m.clinic_id === c.id)
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, fontSize: 14 }}>{c.name}</div>
                <select
                  style={{ ...S.input, flex: 1 }}
                  value={map?.dentitek_clinic_uuid || ''}
                  disabled={!canEdit}
                  onChange={e => setMapping(c.id, e.target.value)}
                >
                  <option value="">— Non liée —</option>
                  {dtkPractices.map(p => (
                    <option key={p.clinic_uuid} value={p.clinic_uuid}>{p.name}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
