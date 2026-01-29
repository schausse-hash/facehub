import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Icons = {
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  ArrowLeft: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Info: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

const DAYS_FR = [
  { key: 'sunday', label: 'Dimanche' },
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
]

const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation', duration: 30 },
  { value: 'botox', label: 'Toxine Botulique', duration: 45 },
  { value: 'filler', label: 'Injection Filler', duration: 60 },
  { value: 'microneedling', label: 'Microneedling', duration: 60 },
  { value: 'followup', label: 'Suivi', duration: 15 },
  { value: 'other', label: 'Autre', duration: 30 },
]

const DEFAULT_AVAILABILITY = {
  monday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  tuesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  wednesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  thursday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
  friday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] },
}

export default function ScheduleSettings({ onBack, session }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY)
  const [bookingSettings, setBookingSettings] = useState({
    enabled: true,
    allowedTypes: ['consultation', 'botox', 'filler', 'microneedling', 'followup'],
    minNoticeHours: 24,
    maxAdvanceDays: 60,
    slotDuration: 30,
    bufferTime: 0,
    requirePhone: true,
    requireEmail: true,
    confirmationMessage: 'Merci pour votre réservation! Vous recevrez une confirmation par courriel.',
  })
  const [blockedDates, setBlockedDates] = useState([])
  const [newBlockedDate, setNewBlockedDate] = useState('')
  const [activeTab, setActiveTab] = useState('availability')

  useEffect(() => {
    fetchSettings()
  }, [session])

  const fetchSettings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('schedule_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      if (data.availability) setAvailability(data.availability)
      if (data.booking_settings) setBookingSettings(data.booking_settings)
      if (data.blocked_dates) setBlockedDates(data.blocked_dates)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('schedule_settings')
      .upsert({
        user_id: session.user.id,
        availability,
        booking_settings: bookingSettings,
        blocked_dates: blockedDates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const toggleDayEnabled = (dayKey) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
        slots: !prev[dayKey].enabled ? [{ start: '09:00', end: '17:00' }] : prev[dayKey].slots
      }
    }))
  }

  const updateSlot = (dayKey, slotIndex, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.map((slot, i) => 
          i === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    }))
  }

  const addSlot = (dayKey) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: [...prev[dayKey].slots, { start: '14:00', end: '17:00' }]
      }
    }))
  }

  const removeSlot = (dayKey, slotIndex) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.filter((_, i) => i !== slotIndex)
      }
    }))
  }

  const toggleAppointmentType = (type) => {
    setBookingSettings(prev => ({
      ...prev,
      allowedTypes: prev.allowedTypes.includes(type)
        ? prev.allowedTypes.filter(t => t !== type)
        : [...prev.allowedTypes, type]
    }))
  }

  const addBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates(prev => [...prev, newBlockedDate].sort())
      setNewBlockedDate('')
    }
  }

  const removeBlockedDate = (date) => {
    setBlockedDates(prev => prev.filter(d => d !== date))
  }

  const styles = `
    .ss-container { background: var(--bg-main); min-height: 100%; padding: 1.5rem; }
    .ss-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .ss-back-btn { padding: 0.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); cursor: pointer; display: flex; }
    .ss-back-btn:hover { background: var(--bg-hover); }
    .ss-title { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); }
    .ss-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    .ss-tab { padding: 0.75rem 1.25rem; background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; font-weight: 500; border-radius: 6px 6px 0 0; }
    .ss-tab:hover { color: var(--text-primary); background: var(--bg-hover); }
    .ss-tab.active { color: var(--primary); background: var(--bg-card); border-bottom: 2px solid var(--primary); }
    .ss-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .ss-card-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .ss-card-desc { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem; }
    .ss-day-row { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border); }
    .ss-day-row:last-child { border-bottom: none; }
    .ss-day-toggle { display: flex; align-items: center; gap: 0.75rem; min-width: 140px; }
    .ss-toggle { position: relative; width: 44px; height: 24px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; }
    .ss-toggle.active { background: var(--primary); border-color: var(--primary); }
    .ss-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: white; border-radius: 50%; transition: transform 0.2s; }
    .ss-toggle.active::after { transform: translateX(20px); }
    .ss-day-name { font-weight: 500; color: var(--text-primary); font-size: 0.9rem; }
    .ss-slots { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .ss-slot { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .ss-time-input { padding: 0.5rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-size: 0.875rem; width: 100px; }
    .ss-time-input:focus { outline: none; border-color: var(--primary); }
    .ss-slot-sep { color: var(--text-muted); }
    .ss-slot-remove { padding: 0.4rem; background: rgba(239, 68, 68, 0.1); border: none; border-radius: 4px; color: #ef4444; cursor: pointer; display: flex; }
    .ss-slot-remove:hover { background: rgba(239, 68, 68, 0.2); }
    .ss-add-slot { padding: 0.4rem 0.75rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; color: var(--text-secondary); cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 0.25rem; width: fit-content; }
    .ss-add-slot:hover { background: var(--bg-hover); }
    .ss-disabled-msg { color: var(--text-muted); font-size: 0.85rem; font-style: italic; }
    .ss-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .ss-form-group { margin-bottom: 1rem; }
    .ss-label { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.5rem; }
    .ss-input, .ss-select { width: 100%; padding: 0.75rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-size: 0.875rem; }
    .ss-input:focus, .ss-select:focus { outline: none; border-color: var(--primary); }
    .ss-textarea { width: 100%; padding: 0.75rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-size: 0.875rem; min-height: 80px; resize: vertical; }
    .ss-checkbox-group { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .ss-checkbox { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 0.875rem; color: var(--text-secondary); }
    .ss-checkbox.checked { background: rgba(212, 175, 55, 0.15); border-color: var(--primary); color: var(--text-primary); }
    .ss-checkbox input { display: none; }
    .ss-checkbox-mark { width: 18px; height: 18px; border: 2px solid var(--border); border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    .ss-checkbox.checked .ss-checkbox-mark { background: var(--primary); border-color: var(--primary); }
    .ss-blocked-input { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .ss-blocked-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .ss-blocked-date { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; font-size: 0.85rem; color: var(--text-primary); }
    .ss-blocked-remove { padding: 0.25rem; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; }
    .ss-blocked-remove:hover { color: #ef4444; }
    .ss-footer { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
    .ss-btn-secondary { padding: 0.75rem 1.5rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); cursor: pointer; }
    .ss-btn-primary { padding: 0.75rem 1.5rem; background: var(--primary); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
    .ss-btn-primary:hover { background: var(--primary-dark); }
    .ss-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .ss-btn-primary.saved { background: #10b981; }
    .ss-info-box { display: flex; gap: 0.75rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; margin-bottom: 1rem; }
    .ss-info-box svg { flex-shrink: 0; color: #3b82f6; }
    .ss-info-text { font-size: 0.85rem; color: var(--text-secondary); }
    @media (max-width: 768px) { .ss-day-row { flex-direction: column; } .ss-day-toggle { min-width: auto; margin-bottom: 0.5rem; } .ss-form-row { grid-template-columns: 1fr; } }
  `

  if (loading) return <div className="ss-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}><p style={{ color: 'var(--text-muted)' }}>Chargement...</p></div>

  return (
    <div className="ss-container">
      <style>{styles}</style>
      <div className="ss-header">
        <button className="ss-back-btn" onClick={onBack}><Icons.ArrowLeft /></button>
        <h1 className="ss-title">Paramètres de l'agenda</h1>
      </div>

      <div className="ss-tabs">
        <button className={`ss-tab ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>Disponibilités</button>
        <button className={`ss-tab ${activeTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveTab('booking')}>Réservation en ligne</button>
        <button className={`ss-tab ${activeTab === 'blocked' ? 'active' : ''}`} onClick={() => setActiveTab('blocked')}>Dates bloquées</button>
      </div>

      {activeTab === 'availability' && (
        <div className="ss-card">
          <h2 className="ss-card-title"><Icons.Clock /> Horaires de disponibilité</h2>
          <p className="ss-card-desc">Définissez vos plages horaires pour chaque jour de la semaine.</p>
          {DAYS_FR.map(day => (
            <div key={day.key} className="ss-day-row">
              <div className="ss-day-toggle">
                <div className={`ss-toggle ${availability[day.key]?.enabled ? 'active' : ''}`} onClick={() => toggleDayEnabled(day.key)} />
                <span className="ss-day-name">{day.label}</span>
              </div>
              <div className="ss-slots">
                {availability[day.key]?.enabled ? (
                  <>
                    {availability[day.key].slots.map((slot, i) => (
                      <div key={i} className="ss-slot">
                        <input type="time" className="ss-time-input" value={slot.start} onChange={(e) => updateSlot(day.key, i, 'start', e.target.value)} />
                        <span className="ss-slot-sep">à</span>
                        <input type="time" className="ss-time-input" value={slot.end} onChange={(e) => updateSlot(day.key, i, 'end', e.target.value)} />
                        {availability[day.key].slots.length > 1 && <button className="ss-slot-remove" onClick={() => removeSlot(day.key, i)}><Icons.Trash /></button>}
                      </div>
                    ))}
                    <button className="ss-add-slot" onClick={() => addSlot(day.key)}><Icons.Plus /> Ajouter</button>
                  </>
                ) : <span className="ss-disabled-msg">Non disponible</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'booking' && (
        <div className="ss-card">
          <h2 className="ss-card-title"><Icons.Calendar /> Paramètres de réservation</h2>
          <div className="ss-form-group">
            <div className="ss-day-toggle" style={{ marginBottom: '1rem' }}>
              <div className={`ss-toggle ${bookingSettings.enabled ? 'active' : ''}`} onClick={() => setBookingSettings(prev => ({ ...prev, enabled: !prev.enabled }))} />
              <span className="ss-day-name">Autoriser les réservations en ligne</span>
            </div>
          </div>
          <div className="ss-form-group">
            <label className="ss-label">Types de rendez-vous disponibles</label>
            <div className="ss-checkbox-group">
              {APPOINTMENT_TYPES.map(type => (
                <label key={type.value} className={`ss-checkbox ${bookingSettings.allowedTypes.includes(type.value) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={bookingSettings.allowedTypes.includes(type.value)} onChange={() => toggleAppointmentType(type.value)} />
                  <span className="ss-checkbox-mark">{bookingSettings.allowedTypes.includes(type.value) && <Icons.Check />}</span>
                  {type.label}
                </label>
              ))}
            </div>
          </div>
          <div className="ss-form-row">
            <div className="ss-form-group">
              <label className="ss-label">Préavis minimum (heures)</label>
              <input type="number" className="ss-input" value={bookingSettings.minNoticeHours} onChange={(e) => setBookingSettings(prev => ({ ...prev, minNoticeHours: parseInt(e.target.value) || 0 }))} min="0" />
            </div>
            <div className="ss-form-group">
              <label className="ss-label">Réservation max (jours à l'avance)</label>
              <input type="number" className="ss-input" value={bookingSettings.maxAdvanceDays} onChange={(e) => setBookingSettings(prev => ({ ...prev, maxAdvanceDays: parseInt(e.target.value) || 30 }))} min="1" />
            </div>
          </div>
          <div className="ss-form-row">
            <div className="ss-form-group">
              <label className="ss-label">Durée des créneaux (minutes)</label>
              <select className="ss-select" value={bookingSettings.slotDuration} onChange={(e) => setBookingSettings(prev => ({ ...prev, slotDuration: parseInt(e.target.value) }))}>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
            <div className="ss-form-group">
              <label className="ss-label">Temps tampon entre RDV (min)</label>
              <input type="number" className="ss-input" value={bookingSettings.bufferTime} onChange={(e) => setBookingSettings(prev => ({ ...prev, bufferTime: parseInt(e.target.value) || 0 }))} min="0" step="5" />
            </div>
          </div>
          <div className="ss-form-group">
            <label className="ss-label">Informations requises</label>
            <div className="ss-checkbox-group">
              <label className={`ss-checkbox ${bookingSettings.requirePhone ? 'checked' : ''}`}>
                <input type="checkbox" checked={bookingSettings.requirePhone} onChange={(e) => setBookingSettings(prev => ({ ...prev, requirePhone: e.target.checked }))} />
                <span className="ss-checkbox-mark">{bookingSettings.requirePhone && <Icons.Check />}</span>
                Téléphone obligatoire
              </label>
              <label className={`ss-checkbox ${bookingSettings.requireEmail ? 'checked' : ''}`}>
                <input type="checkbox" checked={bookingSettings.requireEmail} onChange={(e) => setBookingSettings(prev => ({ ...prev, requireEmail: e.target.checked }))} />
                <span className="ss-checkbox-mark">{bookingSettings.requireEmail && <Icons.Check />}</span>
                Courriel obligatoire
              </label>
            </div>
          </div>
          <div className="ss-form-group">
            <label className="ss-label">Message de confirmation</label>
            <textarea className="ss-textarea" value={bookingSettings.confirmationMessage} onChange={(e) => setBookingSettings(prev => ({ ...prev, confirmationMessage: e.target.value }))} />
          </div>
        </div>
      )}

      {activeTab === 'blocked' && (
        <div className="ss-card">
          <h2 className="ss-card-title">Dates bloquées</h2>
          <p className="ss-card-desc">Bloquez des dates spécifiques (vacances, jours fériés, etc.)</p>
          <div className="ss-info-box">
            <Icons.Info />
            <span className="ss-info-text">Les dates bloquées s'appliquent en plus de vos disponibilités hebdomadaires.</span>
          </div>
          <div className="ss-blocked-input">
            <input type="date" className="ss-input" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            <button className="ss-btn-primary" onClick={addBlockedDate} disabled={!newBlockedDate}><Icons.Plus /> Ajouter</button>
          </div>
          {blockedDates.length > 0 ? (
            <div className="ss-blocked-list">
              {blockedDates.map(date => (
                <div key={date} className="ss-blocked-date">
                  {new Date(date + 'T12:00:00').toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  <button className="ss-blocked-remove" onClick={() => removeBlockedDate(date)}><Icons.Trash /></button>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucune date bloquée</p>}
        </div>
      )}

      <div className="ss-footer">
        <button className="ss-btn-secondary" onClick={onBack}>Annuler</button>
        <button className={`ss-btn-primary ${saved ? 'saved' : ''}`} onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : saved ? <><Icons.Check /> Enregistré!</> : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
