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

const QUADRANTS = [
  { label: 'Haut droit',  dents: ['18','17','16','15','14','13','12','11'] },
  { label: 'Haut gauche', dents: ['21','22','23','24','25','26','27','28'] },
  { label: 'Bas gauche',  dents: ['31','32','33','34','35','36','37','38'] },
  { label: 'Bas droit',   dents: ['41','42','43','44','45','46','47','48'] },
]

export default function ImplantCaseForm({ caseData, onSave, onCancel, session }) {
  const isEdit = !!caseData?.id
  const [clinics, setClinics]           = useState([])
  const [patients, setPatients]         = useState([])
  const [patientSearch, setPatientSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [modePatient, setModePatient]   = useState('recherche') // 'recherche' | 'nouveau'
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')

  const [newPatient, setNewPatient] = useState({
    name: '', phone: '', email: '', birthdate: '',
  })

  const [form, setForm] = useState({
    patient_id: caseData?.patient_id || '',
    clinic_id:  caseData?.clinic_id  || '',
    statut:          caseData?.statut          || 'consultation_initiale',
    type_traitement: caseData?.type_traitement || '',
    dents:           caseData?.dents           || [],
    date_consultation: caseData?.date_consultation || new Date().toISOString().split('T')[0],
    date_rdv:   caseData?.date_rdv   || '',
    note_prv:   caseData?.note_prv   || '',
    notes:      caseData?.notes      || '',
  })

  useEffect(() => { fetchClinics(); fetchPatients(); }, [])

  const fetchClinics = async () => {
    const { data } = await supabase.from('clinics').select('id, name').eq('is_active', true).order('name')
    if (data) setClinics(data)
  }

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('id, name, phone').order('name')
    if (data) setPatients(data)
  }

  const filteredPatients = patients.filter(p =>
    !patientSearch ||
    p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone?.includes(patientSearch)
  ).slice(0, 8)

  const selectedPatientName = patients.find(p => p.id === form.patient_id)?.name || ''

  const toggleDent = (dent) => {
    setForm(f => ({
      ...f,
      dents: f.dents.includes(dent) ? f.dents.filter(d => d !== dent) : [...f.dents, dent].sort()
    }))
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)

    let patientId = form.patient_id

    // Créer nouveau patient si mode nouveau
    if (modePatient === 'nouveau') {
      if (!newPatient.name.trim()) { setError('Le nom du patient est requis'); setSaving(false); return }
      const { data: np, error: npErr } = await supabase
        .from('patients')
        .insert({
          name:      newPatient.name.trim(),
          phone:     newPatient.phone || null,
          email:     newPatient.email || null,
          birthdate: newPatient.birthdate || null,
          clinic_id: form.clinic_id || null,
          user_id:   session.user.id,
        })
        .select().single()
      if (npErr) { setError('Erreur création patient : ' + npErr.message); setSaving(false); return }
      patientId = np.id
    }

    if (!patientId) { setError('Sélectionne ou crée un patient'); setSaving(false); return }
    if (!form.clinic_id) { setError('Sélectionne une clinique'); setSaving(false); return }

    const payload = {
      ...form,
      patient_id:   patientId,
      chirurgien_id: session.user.id,
      updated_at:   new Date().toISOString(),
    }

    let result
    if (isEdit) {
      result = await supabase.from('implant_cases').update(payload).eq('id', caseData.id)
    } else {
      result = await supabase.from('implant_cases').insert(payload)
    }

    setSaving(false)
    if (result.error) { setError(result.error.message); return }
    onSave()
  }

  const inp = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff'
  }
  const lbl = { fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:640, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:600 }}>
            {isEdit ? 'Modifier le cas' : 'Nouveau cas implantaire'}
          </h2>
          <button onClick={onCancel} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#6b7280' }}>✕</button>
        </div>

        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>

          {/* ── PATIENT ── */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <label style={{ ...lbl, marginBottom:0 }}>Patient *</label>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => { setModePatient('recherche'); setNewPatient({name:'',phone:'',email:'',birthdate:''}) }}
                  style={{ padding:'4px 12px', border:'1px solid', borderColor: modePatient==='recherche'?'#111827':'#e5e7eb', borderRadius:20, fontSize:12, cursor:'pointer', background: modePatient==='recherche'?'#111827':'#fff', color: modePatient==='recherche'?'#fff':'#6b7280', fontWeight:500 }}>
                  Patient existant
                </button>
                <button onClick={() => { setModePatient('nouveau'); setForm(f=>({...f,patient_id:''})); setPatientSearch('') }}
                  style={{ padding:'4px 12px', border:'1px solid', borderColor: modePatient==='nouveau'?'#111827':'#e5e7eb', borderRadius:20, fontSize:12, cursor:'pointer', background: modePatient==='nouveau'?'#111827':'#fff', color: modePatient==='nouveau'?'#fff':'#6b7280', fontWeight:500 }}>
                  + Nouveau patient
                </button>
              </div>
            </div>

            {modePatient === 'recherche' ? (
              <div style={{ position:'relative' }}>
                <input
                  placeholder="Rechercher par nom ou téléphone..."
                  value={form.patient_id ? selectedPatientName : patientSearch}
                  onChange={e => { setPatientSearch(e.target.value); setForm(f=>({...f,patient_id:''})); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  style={inp}
                />
                {showDropdown && patientSearch && !form.patient_id && (
                  <div style={{ position:'absolute', top:'100%', left:0, right:0, border:'1px solid #e5e7eb', borderTop:'none', borderRadius:'0 0 8px 8px', background:'#fff', maxHeight:200, overflowY:'auto', zIndex:10, boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
                    {filteredPatients.length === 0 ? (
                      <div style={{ padding:'12px', fontSize:13, color:'#9ca3af', textAlign:'center' }}>
                        Aucun résultat — utilise "+ Nouveau patient"
                      </div>
                    ) : filteredPatients.map(p => (
                      <div key={p.id}
                        onClick={() => { setForm(f=>({...f,patient_id:p.id})); setPatientSearch(''); setShowDropdown(false) }}
                        style={{ padding:'10px 12px', cursor:'pointer', fontSize:14, borderBottom:'1px solid #f9fafb' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                        onMouseLeave={e=>e.currentTarget.style.background='#fff'}
                      >
                        <div style={{ fontWeight:500 }}>{p.name}</div>
                        {p.phone && <div style={{ fontSize:12, color:'#9ca3af' }}>{p.phone}</div>}
                      </div>
                    ))}
                  </div>
                )}
                {form.patient_id && (
                  <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:13, color:'#059669', fontWeight:500 }}>✓ {selectedPatientName}</span>
                    <button onClick={() => { setForm(f=>({...f,patient_id:''})); setPatientSearch('') }}
                      style={{ fontSize:11, color:'#9ca3af', background:'none', border:'none', cursor:'pointer' }}>Changer</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background:'#f9fafb', borderRadius:10, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={lbl}>Nom complet *</label>
                    <input value={newPatient.name} onChange={e=>setNewPatient(p=>({...p,name:e.target.value}))}
                      placeholder="Prénom Nom" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Téléphone</label>
                    <input value={newPatient.phone} onChange={e=>setNewPatient(p=>({...p,phone:e.target.value}))}
                      placeholder="514-555-1234" style={inp} />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={lbl}>Courriel</label>
                    <input type="email" value={newPatient.email} onChange={e=>setNewPatient(p=>({...p,email:e.target.value}))}
                      placeholder="patient@email.com" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Date de naissance</label>
                    <input type="date" value={newPatient.birthdate} onChange={e=>setNewPatient(p=>({...p,birthdate:e.target.value}))} style={inp} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── CLINIQUE + STATUT ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={lbl}>Clinique *</label>
              <select value={form.clinic_id} onChange={e=>setForm(f=>({...f,clinic_id:e.target.value}))} style={inp}>
                <option value="">Sélectionner...</option>
                {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Statut</label>
              <select value={form.statut} onChange={e=>setForm(f=>({...f,statut:e.target.value}))} style={inp}>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* ── TYPE DE TRAITEMENT ── */}
          <div>
            <label style={lbl}>Type de traitement</label>
            <select value={form.type_traitement} onChange={e=>setForm(f=>({...f,type_traitement:e.target.value}))} style={inp}>
              <option value="">Sélectionner...</option>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* ── SÉLECTEUR DE DENTS ── */}
          <div>
            <label style={lbl}>
              Dents concernées
              {form.dents.length > 0 && (
                <span style={{ marginLeft:8, fontSize:12, color:'#6b7280', fontWeight:400 }}>
                  → {form.dents.join(', ')}
                </span>
              )}
            </label>
            {QUADRANTS.map(q => (
              <div key={q.label} style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>{q.label}</div>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {q.dents.map(d => (
                    <button key={d} onClick={() => toggleDent(d)} style={{
                      width:36, height:36, border:'1px solid',
                      borderColor: form.dents.includes(d) ? '#111827' : '#e5e7eb',
                      borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer',
                      background: form.dents.includes(d) ? '#111827' : '#fff',
                      color: form.dents.includes(d) ? '#fff' : '#374151',
                      transition:'all 0.1s'
                    }}>{d}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── DATES ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={lbl}>Date de consultation</label>
              <input type="date" value={form.date_consultation} onChange={e=>setForm(f=>({...f,date_consultation:e.target.value}))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Prochain RDV</label>
              <input type="date" value={form.date_rdv} onChange={e=>setForm(f=>({...f,date_rdv:e.target.value}))} style={inp} />
            </div>
          </div>

          {/* ── NOTE PRV ── */}
          <div>
            <label style={lbl}>Note PRV</label>
            <input value={form.note_prv} onChange={e=>setForm(f=>({...f,note_prv:e.target.value}))}
              placeholder="Ex: 15-06-2026 à 10h00" style={inp} />
          </div>

          {/* ── NOTES CLINIQUES ── */}
          <div>
            <label style={lbl}>Notes cliniques</label>
            <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
              rows={3} placeholder="Notes sur le cas..." style={{ ...inp, resize:'vertical' }} />
          </div>

          {error && (
            <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:8, fontSize:14 }}>
              {error}
            </div>
          )}

          {/* ── ACTIONS ── */}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
            <button onClick={onCancel} style={{ padding:'10px 18px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', fontSize:14, cursor:'pointer', color:'#374151' }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding:'10px 22px', border:'none', borderRadius:8, background:saving?'#6b7280':'#111827', color:'#fff', fontSize:14, fontWeight:500, cursor:saving?'not-allowed':'pointer' }}>
              {saving ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer le cas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
