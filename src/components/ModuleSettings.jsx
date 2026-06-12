import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MODULES = [
  { key: 'implantologie', label: '🦷 Implantologie',     desc: 'Gestion des cas implantaires' },
  { key: 'esthetique',    label: '💉 Esthétique (fiche patient)', desc: 'Sections esthétiques du dossier : peau, soleil, consentements botox/filler — masquées par défaut' },
  { key: 'tarifs',        label: '💰 Tarifs',            desc: 'Grille tarifaire' },
  { key: 'agenda',        label: '📅 Agenda',            desc: 'Calendrier des rendez-vous' },
  { key: 'patients',      label: '👥 Patients (esthétique)', desc: 'Module patients médecine esthétique' },
  { key: 'portfolio',     label: '🖼 Portfolio',         desc: 'Galerie avant/après' },
  { key: 'recherche_cas', label: '🔍 Recherche de cas',  desc: 'Recherche dans les dossiers' },
  { key: 'facturation',   label: '💳 Facturation',       desc: 'Module de facturation' },
  { key: 'templates',     label: '💉 Templates injection', desc: 'Gabarits injection botox/filler' },
  { key: 'disponibilites',label: '🕐 Disponibilités',    desc: 'Gestion des plages horaires' },
  { key: 'aide',          label: '❓ Aide',              desc: 'Documentation et aide' },
]

export default function ModuleSettings({ session, userClinic }) {
  const [settings, setSettings] = useState({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(null)
  const [notif, setNotif]       = useState(null)

  useEffect(() => { if (userClinic?.id) load() }, [userClinic])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('clinic_module_settings')
      .select('module_key, is_visible')
      .eq('clinic_id', userClinic.id)

    const map = {}
    MODULES.forEach(m => { map[m.key] = m.key !== 'esthetique' }) // défaut tout visible, sauf esthétique (pivot dentaire)
    ;(data || []).forEach(r => { map[r.module_key] = r.is_visible })
    setSettings(map)
    setLoading(false)
  }

  async function toggle(key) {
    const newVal = !settings[key]
    setSaving(key)
    setSettings(p => ({ ...p, [key]: newVal }))

    await supabase.from('clinic_module_settings').upsert({
      clinic_id:  userClinic.id,
      module_key: key,
      is_visible: newVal,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'clinic_id,module_key' })

    setSaving(null)
    setNotif(key)
    setTimeout(() => setNotif(null), 1500)
  }

  if (loading) return <div style={{ padding: 32, color: '#6b7280' }}>Chargement…</div>

  return (
    <div style={{ padding: '0 0 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#111827' }}>
          Visibilité des modules
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
          Active ou désactive les sections de l'application. Les modifications s'appliquent immédiatement.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MODULES.map(m => {
          const isOn = settings[m.key] !== false
          const isSaving = saving === m.key
          return (
            <div key={m.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px', borderRadius: 12,
              background: isOn ? '#f9fafb' : '#fff',
              border: `1px solid ${isOn ? '#e5e7eb' : '#f3f4f6'}`,
              transition: 'all 0.2s',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: isOn ? '#111827' : '#9ca3af' }}>
                  {m.label}
                  {notif === m.key && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#10b981', fontWeight: 400 }}>
                      ✓ Sauvegardé
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{m.desc}</div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => toggle(m.key)}
                disabled={isSaving}
                style={{
                  width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: isOn ? '#111827' : '#e5e7eb',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3,
                  left: isOn ? 25 : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}/>
              </button>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 20, padding: '12px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#92400e' }}>
          ⚠️ Désactiver un module le cache de la navigation mais ne supprime pas les données.
        </p>
      </div>
    </div>
  )
}
