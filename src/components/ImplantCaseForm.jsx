import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const STATUTS = [
  { value: 'consultation_initiale', label: 'Consultation initiale' },
  { value: 'plan_traitement',       label: 'Plan de traitement' },
  { value: 'en_attente_reponse',    label: 'En attente de réponse' },
  { value: 'chirurgie_programmee',  label: 'Chirurgie programmée' },
  { value: 'post_operatoire',       label: 'Post-opératoire' },
  { value: 'fabrication_labo',      label: 'Fabrication au labo' },
  { value: 'prothese_finale',       label: 'Prothèse finale' },
  { value: 'termine',               label: 'Terminé' },
  { value: 'annule',                label: 'Annulé' },
]

const TYPES = [
  { value: 'unitaire',     label: 'Implant unitaire' },
  { value: 'multiple',     label: 'Implants multiples' },
  { value: 'all_on_4',     label: 'All-on-4' },
  { value: 'all_on_6',     label: 'All-on-6' },
  { value: 'all_on_8',     label: 'All-on-8' },
  { value: 'zygomatique',  label: 'Zygomatique' },
  { value: 'pont_implant', label: 'Pont sur implants' },
  { value: 'pont_naturel', label: 'Pont sur dents naturelles' },
  { value: 'autre',        label: 'Autre' },
]

// Toutes les dents disponibles
const ALL_DENTS = [
  '11','12','13','14','15','16','17',
  '21','22','23','24','25','26','27',
  '31','32','33','34','35','36','37',
  '41','42','43','44','45','46','47',
]

const QUADRANTS = [
  { label: 'Haut droit', dents: ['11','12','13','14','15','16','17'] },
  { label: 'Haut gauche', dents: ['21','22','23','24','25','26','27'] },
  { label: 'Bas gauche', dents: ['31','32','33','34','35','36','37'] },
  { label: 'Bas droit', dents: ['41','42','43','44','45','46','47'] },
]

export default function ImplantCaseForm({ caseData, onSave, onCancel, session }) {
  const isEdit = !!caseData?.id
  const [clinics, setClinics] = useState([])
  const [patients, setPatients] = useState([])
  const [patientSearch, setPatientSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    patient_id: caseData?.patient_id || '',
    clinic_id: caseData?.clinic_id || '',
    statut: caseData?.statut || 'consultation_initiale',
    type_traitement: caseData?.type_traitement || '',
    dents: caseData?.dents || [],
    date_consultation: caseData?.date_consultation || new Date().toISOString().split('T')[0],
    date_rdv: caseData?.date_rdv || '',
    note_prv: caseData?.note_prv || '',
    notes: caseData?.notes || '',
  })

  useEffect(() => {
    fetchClinics()
    fetchPatients()
  }, [])

  const fetchClinics = async () => {
    const { data } = await supabase.from('clinics').select('id, name').eq('is_active', true).order('name')
    if (data) setClinics(data)
  }

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('id, name, phone').eq('is_active', true).order('name')
    if (data) setPatients(data)
  }

  const filteredPatients = patients.filter(p =>
    !patientSearch || p.name?.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone?.includes(patientSearch)
  ).slice(0, 8)

  const toggleDent = (dent) => {
    setForm(f => ({
      ...f,
      dents: f.dents.includes(dent) ? f.dents.filter(d => d !== dent) : [...f.dents, dent].sort()
    }))
  }

  const handleSave = async () => {
    if (!form.patient_id) return setError('Sélectionne un patient')
    if (!form.clinic_id) return setError('Sélectionne une clinique')
    setError('')
    setSaving(true)

    const payload = {
      ...form,
      chirurgien_id: session.user.id,
      updated_at: new Date().toISOString(),
    }

    let result
    if (isEdit) {
      result = await supabase.from('implant_cases').update(payload).eq('id', caseData.id)
    } else {
      result = await supabase.from('implant_cases').insert(payload)
    }

    setSaving(false)
    if (result.error) return setError(result.error.message)
    onSave()
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff'
  }
  const labelStyle = { fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {isEdit ? 'Modifier le cas' : 'Nouveau cas implantaire'}
          </h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280' }}>✕</button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Patient */}
          <div>
            <label style={labelStyle}>Patient *</label>
            <input
              placeholder="Rechercher un patient..."
              value={patientSearch || patients.find(p => p.id === form.patient_id)?.name || ''}
              onChange={e => { setPatientSearch(e.target.value); setForm(f => ({ ...f, patient_id: '' })) }}
              style={inputStyle}
            />
            {patientSearch && !form.patient_id && (
              <div style={{ border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', maxHeight: 200, overflowY: 'auto' }}>
                {filteredPatients.map(p => (
                  <div key={p.id} onClick={() => { setForm(f => ({ ...f, patient_id: p.id })); setPatientSearch('') }}
                    style={{ padding: '10px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f9fafb' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    {p.phone && <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.phone}</div>}
                  </div>
                ))}
                {filteredPatients.length === 0 && (
                  <div style={{ padding: '10px 12px', fontSize: 14, color: '#9ca3af' }}>Aucun résultat</div>
                )}
              </div>
            )}
          </div>

          {/* Clinique + Statut */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Clinique *</label>
              <select value={form.clinic_id} onChange={e => setForm(f => ({ ...f, clinic_id: e.target.value }))} style={inputStyle}>
                <option value="">Sélectionner...</option>
                {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Statut</label>
              <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))} style={inputStyle}>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Type de traitement */}
          <div>
            <label style={labelStyle}>Type de traitement</label>
            <select value={form.type_traitement} onChange={e => setForm(f => ({ ...f, type_traitement: e.target.value }))} style={inputStyle}>
              <option value="">Sélectionner...</option>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Sélecteur de dents */}
          <div>
            <label style={labelStyle}>
              Dents concernées
              {form.dents.length > 0 && (
                <span style={{ marginLeft: 8, fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
                  {form.dents.join(', ')}
                </span>
              )}
            </label>
            {QUADRANTS.map(q => (
              <div key={q.label} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{q.label}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {q.dents.map(d => (
                    <button key={d} onClick={() => toggleDent(d)} style={{
                      width: 36, height: 36, border: '1px solid',
                      borderColor: form.dents.includes(d) ? '#111827' : '#e5e7eb',
                      borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      background: form.dents.includes(d) ? '#111827' : '#fff',
                      color: form.dents.includes(d) ? '#fff' : '#374151',
                      transition: 'all 0.1s'
                    }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Date de consultation</label>
              <input type="date" value={form.date_consultation} onChange={e => setForm(f => ({ ...f, date_consultation: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date RDV (prochain)</label>
              <input type="date" value={form.date_rdv} onChange={e => setForm(f => ({ ...f, date_rdv: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          {/* Note PRV */}
          <div>
            <label style={labelStyle}>Note PRV</label>
            <input value={form.note_prv} onChange={e => setForm(f => ({ ...f, note_prv: e.target.value }))}
              placeholder="Ex: 15-06-2026 à 10h00" style={inputStyle} />
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes cliniques</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} placeholder="Notes sur le cas..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={onCancel} style={{
              padding: '10px 18px', border: '1px solid #e5e7eb', borderRadius: 8,
              background: '#fff', fontSize: 14, cursor: 'pointer', color: '#374151'
            }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 22px', border: 'none', borderRadius: 8,
              background: saving ? '#6b7280' : '#111827', color: '#fff',
              fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer'
            }}>
              {saving ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer le cas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
