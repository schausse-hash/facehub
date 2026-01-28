import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { sendAccessApprovedEmail } from '../emailService'

const Icons = {
  Check: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Users: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Clock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Trash: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Shield: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Edit: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Plus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Phone: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Mail: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Building: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  UserPlus: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  Star: () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  Send: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Key: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  Refresh: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
}

const ROLES = {
  super_admin: { label: 'Super Admin', color: '#eab308', description: 'Contrôle total sur tout le système' },
  owner: { label: 'Propriétaire', color: '#3b82f6', description: 'Propriétaire de clinique - personne ressource' },
  user: { label: 'Injecteur', color: '#6b7280', description: 'Voit les patients de sa clinique' },
  assistant: { label: 'Assistant(e)', color: '#8b5cf6', description: 'Questionnaires, photos - même accès que propriétaire' }
}

const PROFESSION_TYPES = [
  { value: 'dentiste', label: 'Dentiste' },
  { value: 'medecin', label: 'Médecin' },
  { value: 'infirmier', label: 'Infirmier(ère)' },
  { value: 'pharmacien', label: 'Pharmacien(ne)' },
  { value: 'naturopathe', label: 'Naturopathe' },
  { value: 'estheticien', label: 'Esthéticien(ne)' },
  { value: 'autre', label: 'Autre' }
]

export default function Admin({ session, userClinic }) {
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [currentUserProfile, setCurrentUserProfile] = useState(null)
  const [currentUserClinicId, setCurrentUserClinicId] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [filter, setFilter] = useState('pending')
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showClinicModal, setShowClinicModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedClinicForInvite, setSelectedClinicForInvite] = useState(null)
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', profession: '', role: 'user' })
  const [clinicForm, setClinicForm] = useState({ name: '', address: '', phone: '', email: '' })
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    profession: '',
    profession_other: ''
  })
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    birthdate: '',
    profession: '',
    clinic_id: '',
    address: '',
    notes: '',
    is_primary_contact: false
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)

  useEffect(() => {
    checkUserRole()
  }, [])

  useEffect(() => {
    if (userRole && (userRole === 'owner' || userRole === 'super_admin')) {
      fetchRequests()
      fetchUsers()
      fetchClinics()
    }
  }, [userRole, filter])

  const checkUserRole = async () => {
    // Récupérer le rôle
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role, clinic_id')
      .eq('user_id', session.user.id)
      .single()

    setUserRole(roleData?.role || null)
    setCurrentUserClinicId(roleData?.clinic_id || null)

    // Récupérer le profil
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    setCurrentUserProfile(profileData)
    
    // Initialiser le formulaire de profil
    if (profileData) {
      setProfileForm({
        full_name: profileData.full_name || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || '',
        profession: profileData.profession || '',
        profession_other: ''
      })
    } else {
      // Utiliser les métadonnées de l'utilisateur si pas de profil
      const meta = session.user.user_metadata || {}
      setProfileForm({
        full_name: meta.full_name || '',
        first_name: meta.first_name || '',
        last_name: meta.last_name || '',
        phone: meta.phone || '',
        profession: meta.profession || '',
        profession_other: ''
      })
    }

    setLoading(false)
  }

  const fetchRequests = async () => {
    let query = supabase
      .from('user_requests')
      .select('*')
      .order('requested_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    // Les owners ne voient que les demandes/invitations pour leur clinique
    // Le super_admin voit TOUT (nouvelles inscriptions + invitations)
    if (userRole === 'owner' && currentUserClinicId) {
      query = query.eq('clinic_id', currentUserClinicId)
    }

    const { data } = await query
    setRequests(data || [])
  }

  const fetchUsers = async () => {
    let rolesQuery = supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false })

    // Les owners ne voient que les utilisateurs de leur clinique
    if (userRole === 'owner' && currentUserClinicId) {
      rolesQuery = rolesQuery.eq('clinic_id', currentUserClinicId)
    }

    const { data: rolesData } = await rolesQuery

    const { data: profilesData } = await supabase
      .from('user_profiles')
      .select('*')

    const { data: clinicsData } = await supabase
      .from('clinics')
      .select('id, name, primary_contact_id')

    const clinicsMap = {}
    clinicsData?.forEach(c => { 
      clinicsMap[c.id] = { name: c.name, primary_contact_id: c.primary_contact_id } 
    })

    const combined = (rolesData || []).map(role => {
      const profile = (profilesData || []).find(p => p.user_id === role.user_id)
      const clinicInfo = clinicsMap[role.clinic_id] || {}
      return { 
        ...role, 
        profile,
        clinic_name: clinicInfo.name || null,
        is_primary_contact: clinicInfo.primary_contact_id === role.user_id
      }
    })

    setUsers(combined)
  }

  const fetchClinics = async () => {
    let query = supabase
      .from('clinics')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    // Les owners ne voient que leur propre clinique
    if (userRole === 'owner' && currentUserClinicId) {
      query = query.eq('id', currentUserClinicId)
    }

    const { data } = await query
    setClinics(data || [])
  }

  // Sauvegarder le profil
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMessage(null)

    const fullName = profileForm.first_name && profileForm.last_name 
      ? `${profileForm.first_name} ${profileForm.last_name}` 
      : profileForm.full_name

    const profession = PROFESSION_TYPES.find(p => p.value === profileForm.profession)
      ? profileForm.profession 
      : profileForm.profession_other || profileForm.profession

    const profileData = {
      user_id: session.user.id,
      email: session.user.email,
      full_name: fullName,
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      phone: profileForm.phone,
      profession: profession,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' })

    if (error) {
      setProfileMessage({ type: 'error', text: 'Erreur: ' + error.message })
    } else {
      setProfileMessage({ type: 'success', text: 'Profil enregistré avec succès!' })
      setCurrentUserProfile(profileData)
    }

    setSavingProfile(false)
  }

  const handleCreateClinic = async (e) => {
    e.preventDefault()
    
    const { data, error } = await supabase
      .from('clinics')
      .insert([{
        ...clinicForm,
        created_by: session.user.id,
        primary_contact_id: session.user.id // Le créateur devient personne ressource
      }])
      .select()
      .single()

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      // Assigner automatiquement le créateur à cette clinique
      await supabase
        .from('user_roles')
        .update({ clinic_id: data.id })
        .eq('user_id', session.user.id)

      await supabase
        .from('user_profiles')
        .update({ clinic_id: data.id, is_primary_contact: true })
        .eq('user_id', session.user.id)

      setShowClinicModal(false)
      setClinicForm({ name: '', address: '', phone: '', email: '' })
      setCurrentUserClinicId(data.id)
      fetchClinics()
      fetchUsers()
    }
  }

  const handleSetPrimaryContact = async (clinicId, userId) => {
    const { error } = await supabase
      .from('clinics')
      .update({ primary_contact_id: userId })
      .eq('id', clinicId)

    if (!error) {
      fetchClinics()
      fetchUsers()
    }
  }

  const handleAssignClinic = async (userId, clinicId) => {
    await supabase
      .from('user_roles')
      .update({ clinic_id: clinicId || null })
      .eq('user_id', userId)

    await supabase
      .from('user_profiles')
      .update({ clinic_id: clinicId || null })
      .eq('user_id', userId)

    fetchUsers()
  }

  // Supprimer une clinique
  const handleDeleteClinic = async (clinic) => {
    const clinicUsers = users.filter(u => u.clinic_id === clinic.id)
    
    if (clinicUsers.length > 0) {
      const confirmMsg = `Cette clinique a ${clinicUsers.length} membre(s). Voulez-vous vraiment la supprimer?\n\nLes membres seront désassignés mais pas supprimés.`
      if (!window.confirm(confirmMsg)) return
      
      // Désassigner tous les membres de cette clinique
      for (const user of clinicUsers) {
        await handleAssignClinic(user.user_id, null)
      }
    } else {
      if (!window.confirm(`Supprimer la clinique "${clinic.name}"?`)) return
    }

    // Désactiver la clinique (soft delete)
    const { error } = await supabase
      .from('clinics')
      .update({ is_active: false })
      .eq('id', clinic.id)

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      // Si c'était ma clinique, la retirer
      if (currentUserClinicId === clinic.id) {
        setCurrentUserClinicId(null)
      }
      fetchClinics()
      fetchUsers()
    }
  }

  // Inviter un injecteur à une clinique
  const handleInvite = async (e) => {
    e.preventDefault()
    if (!selectedClinicForInvite) return

    setAdding(true)

    // Créer une demande pré-approuvée avec la clinique assignée
    const { error } = await supabase
      .from('user_requests')
      .insert([{
        email: inviteForm.email.toLowerCase().trim(),
        full_name: inviteForm.full_name,
        profession: inviteForm.profession,
        clinic_id: selectedClinicForInvite.id,
        company_name: selectedClinicForInvite.name,
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: session.user.id,
        invited_by: session.user.id
      }])

    if (error?.code === '23505') {
      alert('Cet email existe déjà dans le système')
    } else if (error) {
      alert('Erreur: ' + error.message)
    } else {
      // Envoyer email d'invitation
      await sendAccessApprovedEmail(
        inviteForm.email, 
        inviteForm.full_name || 'Nouveau membre',
        `Vous avez été invité(e) à rejoindre ${selectedClinicForInvite.name} sur FaceHub.`
      )
      
      setShowInviteModal(false)
      setInviteForm({ email: '', full_name: '', profession: '', role: 'user' })
      setSelectedClinicForInvite(null)
      fetchRequests()
    }

    setAdding(false)
  }

  const handleApprove = async (request) => {
    try {
      // 1. Créer la clinique si company_name existe et pas déjà de clinic_id
      let clinicId = request.clinic_id
      
      if (!clinicId && request.company_name) {
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .insert([{
            name: request.company_name,
            email: request.email,
            phone: request.phone || '',
            created_by: request.user_id,
            primary_contact_id: request.user_id,
            is_active: true
          }])
          .select()
          .single()

        if (clinicError) {
          console.error('Erreur création clinique:', clinicError)
        } else {
          clinicId = clinicData.id
        }
      }

      // 2. Créer ou mettre à jour le profil utilisateur
      if (request.user_id) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: request.user_id,
            email: request.email,
            full_name: request.full_name || `${request.first_name || ''} ${request.last_name || ''}`.trim(),
            first_name: request.first_name || '',
            last_name: request.last_name || '',
            phone: request.phone || '',
            profession: request.profession || '',
            clinic_id: clinicId,
            is_primary_contact: !request.clinic_id, // Primary si c'est sa propre clinique
            created_at: new Date().toISOString()
          }, { onConflict: 'user_id' })

        if (profileError) {
          console.error('Erreur création profil:', profileError)
        }

        // 3. Créer ou mettre à jour le rôle utilisateur
        const role = request.clinic_id ? 'user' : 'owner' // Si invité = injecteur, sinon = propriétaire
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: request.user_id,
            role: role,
            clinic_id: clinicId,
            created_at: new Date().toISOString()
          }, { onConflict: 'user_id' })

        if (roleError) {
          console.error('Erreur création rôle:', roleError)
        }
      }

      // 4. Mettre à jour la demande comme approuvée
      const { error } = await supabase
        .from('user_requests')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: session.user.id,
          clinic_id: clinicId
        })
        .eq('id', request.id)

      if (!error) {
        await sendAccessApprovedEmail(request.email, request.full_name || 'Utilisateur')
        fetchRequests()
        fetchUsers()
        fetchClinics()
        alert(`✅ ${request.full_name || request.email} a été approuvé!\n\nClinique créée: ${request.company_name || 'Aucune'}`)
      }
    } catch (err) {
      console.error('Erreur approbation:', err)
      alert('Erreur lors de l\'approbation: ' + err.message)
    }
  }

  const handleReject = async (request) => {
    if (!window.confirm(`Rejeter la demande de ${request.email}?`)) return

    const { error } = await supabase
      .from('user_requests')
      .update({ status: 'rejected' })
      .eq('id', request.id)

    if (!error) fetchRequests()
  }

  const handleDeleteRequest = async (request) => {
    if (userRole !== 'super_admin') return
    if (!window.confirm(`Supprimer définitivement ${request.email}?`)) return

    await supabase.from('user_requests').delete().eq('id', request.id)
    fetchRequests()
  }

  const handleAddEmail = async (e) => {
    e.preventDefault()
    if (!newEmail) return

    setAdding(true)
    const { error } = await supabase
      .from('user_requests')
      .insert([{
        email: newEmail.toLowerCase().trim(),
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: session.user.id
      }])

    if (error?.code === '23505') {
      alert('Cet email existe déjà')
    } else if (!error) {
      setNewEmail('')
      fetchRequests()
    }
    setAdding(false)
  }

  const handleChangeRole = async (userId, newRole) => {
    if (userRole !== 'super_admin') return
    if (userId === session.user.id && newRole !== 'super_admin') {
      alert('Vous ne pouvez pas réduire votre propre rôle!')
      return
    }

    await supabase
      .from('user_roles')
      .update({ role: newRole, updated_by: session.user.id })
      .eq('user_id', userId)

    fetchUsers()
  }

  const handleDeleteUser = async (user) => {
    if (userRole !== 'super_admin') return
    if (user.user_id === session.user.id) {
      alert('Vous ne pouvez pas vous supprimer!')
      return
    }
    if (!window.confirm(`Supprimer ${user.email}?`)) return

    await supabase.from('user_roles').delete().eq('user_id', user.user_id)
    await supabase.from('user_profiles').delete().eq('user_id', user.user_id)
    fetchUsers()
  }

  // Envoyer un lien de réinitialisation de mot de passe
  const handleSendPasswordReset = async (user) => {
    if (userRole !== 'super_admin') return
    
    const email = user.email || user.profile?.email
    if (!email) {
      alert('Aucune adresse courriel trouvée pour cet utilisateur.')
      return
    }

    if (!window.confirm(`Envoyer un lien de réinitialisation de mot de passe à ${email}?`)) return

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      alert('Erreur lors de l\'envoi: ' + error.message)
    } else {
      alert(`Un lien de réinitialisation a été envoyé à ${email}`)
    }
  }

  // Changer le mot de passe manuellement (Super Admin)
  const handleForcePasswordChange = async (user) => {
    if (userRole !== 'super_admin') return
    
    const newPassword = window.prompt(
      `Définir un nouveau mot de passe pour ${user.email || user.profile?.email}\n\n` +
      `Le mot de passe doit contenir au moins 6 caractères.\n` +
      `L'utilisateur devra changer son mot de passe à la prochaine connexion.`
    )

    if (!newPassword) return

    if (newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    // Note: Cette fonction nécessite des privilèges admin via Supabase Admin API
    // Pour l'instant, on simule avec une alerte
    alert(
      `Fonctionnalité de changement forcé de mot de passe:\n\n` +
      `Pour ${user.email || user.profile?.email}\n` +
      `Nouveau mot de passe: ${newPassword}\n\n` +
      `Note: Cette fonctionnalité nécessite une configuration serveur supplémentaire.`
    )
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setUserForm({
      full_name: user.profile?.full_name || '',
      email: user.email || '',
      phone: user.profile?.phone || '',
      birthdate: user.profile?.birthdate || '',
      profession: user.profile?.profession || '',
      clinic_id: user.clinic_id || '',
      address: user.profile?.address || '',
      notes: user.profile?.notes || '',
      is_primary_contact: user.is_primary_contact || false
    })
    setShowUserModal(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    
    const profileData = {
      user_id: editingUser.user_id,
      email: editingUser.email,
      full_name: userForm.full_name,
      phone: userForm.phone,
      birthdate: userForm.birthdate || null,
      profession: userForm.profession,
      address: userForm.address,
      notes: userForm.notes,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' })

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      // Mettre à jour la clinique si changée
      if (userForm.clinic_id !== editingUser.clinic_id) {
        await handleAssignClinic(editingUser.user_id, userForm.clinic_id || null)
      }
      
      setShowUserModal(false)
      setEditingUser(null)
      fetchUsers()
    }
  }

  // Obtenir la clinique actuelle de l'utilisateur
  const myClinic = clinics.find(c => c.id === currentUserClinicId)
  const myClinicMembers = users.filter(u => u.clinic_id === currentUserClinicId)

  // Non autorisé
  if (loading) {
    return <div className="card"><div className="card-body"><p>Chargement...</p></div></div>
  }

  if (!userRole || userRole === 'user') {
    return (
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Shield /></div>
            <h3>Accès refusé</h3>
            <p>Vous n'avez pas les droits pour accéder à cette section.</p>
          </div>
        </div>
      </div>
    )
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Administration</h1>
          <p className="page-subtitle">
            <span style={{ color: ROLES[userRole].color, fontWeight: '600' }}>{ROLES[userRole].label}</span>
            {myClinic && (
              <span style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>
                • {myClinic.name}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('profile')}
        >
          <Icons.User /> Mon profil
        </button>
        <button 
          className={`btn ${activeTab === 'myClinic' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('myClinic')}
        >
          <Icons.Building /> Ma clinique
        </button>
        <button 
          className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('requests')}
        >
          <Icons.Clock /> Demandes {pendingCount > 0 && <span style={{ marginLeft: '0.5rem', background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{pendingCount}</span>}
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('users')}
        >
          <Icons.Users /> Équipe ({users.length})
        </button>
        {userRole === 'super_admin' && (
          <button 
            className={`btn ${activeTab === 'clinics' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('clinics')}
          >
            <Icons.Building /> Toutes les cliniques ({clinics.length})
          </button>
        )}
      </div>

      {/* TAB: Mon profil */}
      {activeTab === 'profile' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Mon profil professionnel</h3>
          </div>
          <div className="card-body">
            {profileMessage && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                background: profileMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: profileMessage.type === 'success' ? '#22c55e' : '#ef4444',
                border: `1px solid ${profileMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Courriel</label>
                <input
                  type="email"
                  className="form-input"
                  value={session.user.email}
                  disabled
                  style={{ opacity: 0.6 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="514-555-1234"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profession</label>
                <select
                  className="form-input"
                  value={profileForm.profession}
                  onChange={(e) => setProfileForm({ ...profileForm, profession: e.target.value })}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Sélectionnez votre profession</option>
                  {PROFESSION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {profileForm.profession === 'autre' && (
                <div className="form-group">
                  <label className="form-label">Précisez votre profession</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.profession_other}
                    onChange={(e) => setProfileForm({ ...profileForm, profession_other: e.target.value })}
                    placeholder="Votre profession"
                  />
                </div>
              )}

              {/* Infos sur la clinique */}
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: 'var(--bg-dark)', 
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icons.Building /> Ma clinique
                </h4>
                {myClinic ? (
                  <div>
                    <p style={{ fontWeight: '600', color: 'var(--accent)' }}>{myClinic.name}</p>
                    {myClinic.primary_contact_id === session.user.id && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(234, 179, 8, 0.15)',
                        color: '#eab308',
                        borderRadius: '20px',
                        fontSize: '0.8rem'
                      }}>
                        <Icons.Star /> Personne ressource
                      </span>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>
                    Aucune clinique assignée. {userRole === 'super_admin' && 'Créez-en une dans l\'onglet "Ma clinique".'}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={savingProfile}
                style={{ marginTop: '1.5rem' }}
              >
                {savingProfile ? 'Enregistrement...' : 'Enregistrer mon profil'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB: Ma clinique */}
      {activeTab === 'myClinic' && (
        <div>
          {myClinic ? (
            <>
              {/* Infos de la clinique */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icons.Building /> {myClinic.name}
                  </h3>
                  {myClinic.primary_contact_id === session.user.id && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(234, 179, 8, 0.15)',
                      color: '#eab308',
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      <Icons.Star /> Personne ressource
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {myClinic.address && (
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adresse</div>
                        <div>📍 {myClinic.address}</div>
                      </div>
                    )}
                    {myClinic.phone && (
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Téléphone</div>
                        <div>📞 {myClinic.phone}</div>
                      </div>
                    )}
                    {myClinic.email && (
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                        <div>✉️ {myClinic.email}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Membres de ma clinique */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <h3 className="card-title">Membres de la clinique ({myClinicMembers.length})</h3>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedClinicForInvite(myClinic)
                      setShowInviteModal(true)
                    }}
                  >
                    <Icons.UserPlus /> Inviter un injecteur
                  </button>
                </div>
                <div className="card-body">
                  {myClinicMembers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {myClinicMembers.map(member => (
                        <div key={member.user_id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          background: 'var(--bg-dark)',
                          borderRadius: '12px',
                          border: member.user_id === session.user.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {member.profile?.full_name || member.email}
                              {member.user_id === session.user.id && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>(vous)</span>}
                              {member.is_primary_contact && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.15rem 0.5rem',
                                  background: 'rgba(234, 179, 8, 0.15)',
                                  color: '#eab308',
                                  borderRadius: '12px',
                                  fontSize: '0.7rem'
                                }}>
                                  <Icons.Star /> Ressource
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              {member.email}
                              {member.profile?.profession && (
                                <span style={{ marginLeft: '0.75rem' }}>
                                  • {PROFESSION_TYPES.find(p => p.value === member.profile.profession)?.label || member.profile.profession}
                                </span>
                              )}
                            </div>
                          </div>
                          <span style={{ 
                            color: ROLES[member.role]?.color || '#6b7280', 
                            fontWeight: '600', 
                            fontSize: '0.85rem',
                            padding: '0.25rem 0.75rem',
                            background: 'var(--bg-card)',
                            borderRadius: '8px'
                          }}>
                            {ROLES[member.role]?.label || 'Injecteur'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Users /></div>
                      <h3>Aucun membre</h3>
                      <p>Invitez des injecteurs à rejoindre votre clinique</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="empty-state">
                  <div style={{ width: 64, height: 64, color: 'var(--text-muted)' }}><Icons.Building /></div>
                  <h3>Aucune clinique</h3>
                  <p>Créez votre clinique pour commencer à gérer vos patients et votre équipe</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowClinicModal(true)} 
                    style={{ marginTop: '1rem' }}
                  >
                    <Icons.Plus /> Créer ma clinique
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Demandes */}
      {activeTab === 'requests' && (
        <>
          {/* Ajouter un email */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title">Ajouter un email autorisé</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddEmail} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@exemple.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ flex: 1, minWidth: '250px' }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? '...' : 'Ajouter'}
                </button>
              </form>
            </div>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button 
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'pending' && '⏳ En attente'}
                {f === 'approved' && '✓ Approuvés'}
                {f === 'rejected' && '✗ Rejetés'}
                {f === 'all' && '📋 Tous'}
              </button>
            ))}
          </div>

          {/* Liste */}
          <div className="card">
            <div className="card-body">
              {requests.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {requests.map(request => (
                    <div key={request.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'var(--bg-dark)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {request.full_name || 'Nom non fourni'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          ✉️ {request.email}
                        </div>
                        
                        {/* Infos supplémentaires */}
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '0.75rem', 
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)'
                        }}>
                          {request.phone && (
                            <span>📞 {request.phone}</span>
                          )}
                          {request.profession && (
                            <span>👤 {PROFESSION_TYPES.find(p => p.value === request.profession)?.label || request.profession}</span>
                          )}
                        </div>
                        
                        {/* Clinique souhaitée */}
                        {(request.company_name || request.clinic_name) && (
                          <div style={{ 
                            marginTop: '0.5rem',
                            padding: '0.35rem 0.6rem',
                            background: 'rgba(212, 175, 55, 0.1)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: 'var(--accent)',
                            display: 'inline-block'
                          }}>
                            🏥 {request.company_name || request.clinic_name}
                          </div>
                        )}

                        {request.is_primary_contact && (
                          <div style={{ 
                            marginTop: '0.5rem',
                            marginLeft: '0.5rem',
                            padding: '0.35rem 0.6rem',
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: '#eab308',
                            display: 'inline-block'
                          }}>
                            ⭐ Personne ressource
                          </div>
                        )}
                        
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          Demande du {new Date(request.requested_at).toLocaleDateString('fr-CA', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          background: request.status === 'approved' ? 'rgba(34, 197, 94, 0.2)' : 
                                      request.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                          color: request.status === 'approved' ? '#22c55e' : 
                                 request.status === 'rejected' ? '#ef4444' : '#eab308'
                        }}>
                          {request.status === 'approved' && '✓ Approuvé'}
                          {request.status === 'rejected' && '✗ Rejeté'}
                          {request.status === 'pending' && '⏳ En attente'}
                        </span>

                        {request.status === 'pending' && (
                          <>
                            <button className="btn btn-sm" style={{ background: '#22c55e', color: '#fff' }} onClick={() => handleApprove(request)}><Icons.Check /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(request)}><Icons.X /></button>
                          </>
                        )}

                        {request.status === 'rejected' && (
                          <button className="btn btn-sm" style={{ background: '#22c55e', color: '#fff' }} onClick={() => handleApprove(request)}><Icons.Check /></button>
                        )}

                        {userRole === 'super_admin' && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleDeleteRequest(request)}><Icons.Trash /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Users /></div>
                  <h3>Aucune demande</h3>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TAB: Équipe */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Membres de l'équipe</h3>
          </div>
          <div className="card-body">
            {users.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {users.map(user => (
                  <div key={user.user_id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-dark)',
                    borderRadius: '12px',
                    border: user.user_id === session.user.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {user.profile?.full_name || user.email}
                        {user.user_id === session.user.id && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>(vous)</span>}
                        {user.is_primary_contact && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.15rem 0.5rem',
                            background: 'rgba(234, 179, 8, 0.15)',
                            color: '#eab308',
                            borderRadius: '12px',
                            fontSize: '0.7rem'
                          }}>
                            <Icons.Star /> Ressource
                          </span>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginRight: '1rem' }}>
                          <Icons.Mail /> {user.email}
                        </span>
                        {user.profile?.phone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Icons.Phone /> {user.profile.phone}
                          </span>
                        )}
                      </div>

                      {user.profile?.profession && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          👤 {PROFESSION_TYPES.find(p => p.value === user.profile.profession)?.label || user.profile.profession}
                        </div>
                      )}

                      {/* Affichage de la clinique assignée */}
                      {user.clinic_name && (
                        <div style={{ 
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(212, 175, 55, 0.15)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: 'var(--accent)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Icons.Building /> {user.clinic_name}
                        </div>
                      )}
                      {!user.clinic_name && !user.clinic_id && (
                        <div style={{ 
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: '#ef4444'
                        }}>
                          ⚠️ Aucune clinique
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Sélecteur de clinique (Super Admin) */}
                      {userRole === 'super_admin' && (
                        <select
                          value={user.clinic_id || ''}
                          onChange={(e) => handleAssignClinic(user.user_id, e.target.value || null)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            color: user.clinic_id ? 'var(--accent)' : '#ef4444',
                            fontSize: '0.8rem',
                            minWidth: '150px'
                          }}
                        >
                          <option value="">⚠️ Aucune clinique</option>
                          {clinics.map(c => (
                            <option key={c.id} value={c.id}>🏥 {c.name}</option>
                          ))}
                        </select>
                      )}

                      {/* Sélecteur de rôle (Super Admin) */}
                      {userRole === 'super_admin' ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.user_id, e.target.value)}
                          disabled={user.user_id === session.user.id}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            color: ROLES[user.role]?.color || '#6b7280',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="user">👤 Injecteur</option>
                          <option value="assistant">👩‍💼 Assistant(e)</option>
                          <option value="owner">🏠 Propriétaire</option>
                          <option value="super_admin">⭐ Super Admin</option>
                        </select>
                      ) : (
                        <span style={{ color: ROLES[user.role].color, fontWeight: '600', fontSize: '0.85rem' }}>
                          {ROLES[user.role].label}
                        </span>
                      )}

                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleEditUser(user)}
                        title="Modifier le profil"
                      >
                        <Icons.Edit />
                      </button>

                      {userRole === 'super_admin' && user.user_id !== session.user.id && (
                        <>
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => handleSendPasswordReset(user)}
                            title="Envoyer lien de réinitialisation"
                            style={{ color: '#3b82f6' }}
                          >
                            <Icons.Key />
                          </button>
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => handleForcePasswordChange(user)}
                            title="Changer le mot de passe"
                            style={{ color: '#f59e0b' }}
                          >
                            <Icons.Refresh />
                          </button>
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => handleDeleteUser(user)}
                            style={{ color: '#ef4444' }}
                            title="Supprimer l'utilisateur"
                          >
                            <Icons.Trash />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Users /></div>
                <h3>Aucun membre</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal édition utilisateur */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Modifier le profil</h2>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editingUser?.email || ''}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                    placeholder="Prénom Nom"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="514-555-1234"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Profession</label>
                  <select
                    className="form-input"
                    value={userForm.profession}
                    onChange={(e) => setUserForm({ ...userForm, profession: e.target.value })}
                  >
                    <option value="">Sélectionnez</option>
                    {PROFESSION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {userRole === 'super_admin' && (
                  <div className="form-group">
                    <label className="form-label">Clinique</label>
                    <select
                      className="form-input"
                      value={userForm.clinic_id}
                      onChange={(e) => setUserForm({ ...userForm, clinic_id: e.target.value })}
                    >
                      <option value="">-- Aucune clinique --</option>
                      {clinics.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-input"
                    value={userForm.notes}
                    onChange={(e) => setUserForm({ ...userForm, notes: e.target.value })}
                    placeholder="Notes additionnelles..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowUserModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: Cliniques (Super Admin seulement) */}
      {activeTab === 'clinics' && userRole === 'super_admin' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gestion des cliniques</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowClinicModal(true)}>
              <Icons.Plus /> Nouvelle clinique
            </button>
          </div>
          <div className="card-body">
            {clinics.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {clinics.map(clinic => {
                  const clinicUsers = users.filter(u => u.clinic_id === clinic.id)
                  const primaryContact = clinicUsers.find(u => u.user_id === clinic.primary_contact_id)
                  return (
                    <div key={clinic.id} style={{
                      padding: '1rem',
                      background: 'var(--bg-dark)',
                      borderRadius: '10px',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icons.Building />
                            {clinic.name}
                          </div>
                          {clinic.address && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              📍 {clinic.address}
                            </div>
                          )}
                          {(clinic.phone || clinic.email) && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              {clinic.phone && <span>📞 {clinic.phone}</span>}
                              {clinic.phone && clinic.email && <span> • </span>}
                              {clinic.email && <span>✉️ {clinic.email}</span>}
                            </div>
                          )}
                          {primaryContact && (
                            <div style={{ 
                              marginTop: '0.5rem',
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(234, 179, 8, 0.1)',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              color: '#eab308',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <Icons.Star /> {primaryContact.profile?.full_name || primaryContact.email}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#3b82f6',
                            borderRadius: '12px',
                            fontSize: '0.8rem'
                          }}>
                            {clinicUsers.length} membre(s)
                          </span>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setSelectedClinicForInvite(clinic)
                              setShowInviteModal(true)
                            }}
                            title="Inviter un membre"
                          >
                            <Icons.UserPlus />
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleDeleteClinic(clinic)}
                            title="Supprimer la clinique"
                            style={{ color: '#ef4444' }}
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>
                      
                      {clinicUsers.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Membres:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {clinicUsers.map(u => (
                              <span key={u.user_id} style={{
                                padding: '0.25rem 0.5rem',
                                background: 'var(--bg-card)',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                {u.profile?.full_name || u.email}
                                {u.user_id === clinic.primary_contact_id && (
                                  <span style={{ color: '#eab308' }}><Icons.Star /></span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ width: 48, height: 48, color: 'var(--text-muted)' }}><Icons.Building /></div>
                <h3>Aucune clinique</h3>
                <p>Créez votre première clinique</p>
                <button className="btn btn-primary" onClick={() => setShowClinicModal(true)} style={{ marginTop: '1rem' }}>
                  <Icons.Plus /> Créer une clinique
                </button>
              </div>
            )}

            {/* Section: Assigner les utilisateurs */}
            {clinics.length > 0 && users.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Assigner les membres aux cliniques</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {users.map(user => (
                    <div key={user.user_id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--bg-dark)',
                      borderRadius: '8px',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <div style={{ fontWeight: '500' }}>{user.profile?.full_name || user.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      <select
                        value={user.clinic_id || ''}
                        onChange={(e) => handleAssignClinic(user.user_id, e.target.value || null)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-card)',
                          color: 'var(--text)',
                          minWidth: '200px'
                        }}
                      >
                        <option value="">-- Aucune clinique --</option>
                        {clinics.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal création clinique */}
      {showClinicModal && (
        <div className="modal-overlay" onClick={() => setShowClinicModal(false)}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nouvelle clinique</h2>
              <button className="modal-close" onClick={() => setShowClinicModal(false)}>
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleCreateClinic}>
              <div className="modal-body">
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#eab308'
                }}>
                  ⭐ Vous deviendrez automatiquement la personne ressource de cette clinique.
                </div>

                <div className="form-group">
                  <label className="form-label">Nom de la clinique *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                    placeholder="Ex: Clinique Esthétique Montréal"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input
                    type="text"
                    className="form-input"
                    value={clinicForm.address}
                    onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                    placeholder="123 rue Principale, Montréal"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={clinicForm.phone}
                    onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                    placeholder="514-555-1234"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={clinicForm.email}
                    onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                    placeholder="contact@clinique.com"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowClinicModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer la clinique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal invitation injecteur */}
      {showInviteModal && selectedClinicForInvite && (
        <div className="modal-overlay" onClick={() => { setShowInviteModal(false); setSelectedClinicForInvite(null); }}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Inviter un injecteur</h2>
              <button className="modal-close" onClick={() => { setShowInviteModal(false); setSelectedClinicForInvite(null); }}>
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="modal-body">
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <Icons.Building /> Clinique: <strong>{selectedClinicForInvite.name}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">Courriel *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="collegue@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className="form-input"
                    value={inviteForm.full_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                    placeholder="Prénom Nom"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Profession</label>
                  <select
                    className="form-input"
                    value={inviteForm.profession}
                    onChange={(e) => setInviteForm({ ...inviteForm, profession: e.target.value })}
                  >
                    <option value="">Sélectionnez</option>
                    {PROFESSION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                  La personne recevra un courriel d'invitation et pourra créer son compte.
                  Elle sera automatiquement ajoutée à votre clinique.
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowInviteModal(false); setSelectedClinicForInvite(null); }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  <Icons.Send /> {adding ? 'Envoi...' : 'Envoyer l\'invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
