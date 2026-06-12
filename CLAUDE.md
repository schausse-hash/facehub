# CLAUDE.md — FaceHub / Pivot Dentitek

## Contexte du projet

FaceHub est en **pivot** : anciennement plateforme de médecine esthétique (FaceTec),
il devient la **plateforme de gestion dentaire multi-cliniques connectée à l'API
Dentitek Group V2** (Progitek), centrée sur l'implantologie.
Propriétaire : Dr Serge Chaussé, chirurgien-dentiste (implantologie), Montréal.
Trois cliniques : Cabinet Dr Chaussé, Centre Dentaire Saint-Luc (Saint-Jean-sur-Richelieu),
Cité Rosemont (Montréal).

Voir `PLAN_PIVOT_DENTITEK.md` pour le plan complet (phases 1 à 5).

## Stack

- React 18 + Vite 5 (pas de TypeScript)
- Supabase (auth, Postgres, Storage) — projet **Esthetic-clinic**, id `pmgbwtngjjnjwhmjxeuc`
- Déploiement : Vercel, auto-deploy branché sur GitHub (`schausse-hash/facehub`)
- Pas de Tailwind : styles inline + CSS custom properties (`var(--bg-card)`, etc.), thème sombre
- Navigation maison dans `Dashboard.jsx` via `currentView` (PAS react-router pour les vues internes)

## ⚠️ Règles critiques

1. **`main` = PRODUCTION (facehub.ca)** — Vercel déploie automatiquement chaque push.
   Tout le travail du pivot se fait sur la branche **`pivot-dentitek`** (preview Vercel).
   Ne jamais merger dans `main` sans demande explicite de Serge.
2. **Ne pas supprimer le code esthétique legacy** (InjectionTemplates, Portfolio,
   PublicBooking, VisitDetail/VisitsList) — il sera archivé dans une branche
   `legacy-facetec` plus tard. Pour l'instant on le désactive via les modules.
3. **Français partout** dans l'interface (Québec). Commits en français acceptés.
4. La clé API Dentitek est en base (`dentitek_config.api_key`) — jamais en dur dans le code,
   jamais dans un fichier committé.

## Architecture Dentitek (src/services/dentitek/)

- `dentitekClient.js` — client API complet (~30 endpoints).
  - Auth : en-tête `x-api-key`; base `https://{subDomain}.dentitek.info/v1`
  - Limites API : 50 req/s, **4 requêtes simultanées max** (file d'attente intégrée)
  - **Deux modes** : `mock` (simulation, défaut — aucune requête réseau) et `live`.
    La config vient de la table `dentitek_config` et se charge via `configureDentitek()`.
- `mockData.js` — données simulées (3 cliniques, patients, RDV, dispos, plans de traitement).
  Permet de TOUT développer sans clé API (portail partenaires Progitek pas encore ouvert).
- `syncService.js` — polling (pas de webhooks chez Dentitek) :
  `syncAppointments` (syncRdv → cache `dentitek_appointments`),
  `importPatient` (patientInfo → patient FaceHub + mapping anti-double-saisie),
  journalisation dans `dentitek_sync_log`.

### Tables Supabase Dentitek (migration `dentitek_integration_phase1` appliquée)

- `dentitek_config` (mode, sub_domain, api_key) — RLS : lecture/écriture super_admin/owner seulement
- `dentitek_clinic_map` — clinique FaceHub ↔ `dentitek_clinic_uuid`
- `dentitek_patient_map` — patient FaceHub ↔ `id_patient_dentitek` (unique des deux côtés)
- `dentitek_sync_log` — journal de chaque synchro
- `dentitek_appointments` — cache des RDV (clé : `id_hor_rdv_pat_dentitek`)

### Particularités API Dentitek à retenir

- RDV créé avec `idPatientDentitek` = vrai rendez-vous; avec nom seulement = note de rendez-vous
- `date_modified` : max 30 jours; `date_from`/`date_to` : écart max 365 jours; schedules : ~3 mois
- Pagination : `limit` (défaut 2500), `offset`, `with_deleted`
- La collection Postman fournie est **V2.0.17** — les endpoints v2.1+/v2.2
  (`treatment_plan`, `getOccupancyRate`, `getPriorityAppointments`) ont des signatures
  PROVISOIRES dans le client, à valider quand Progitek fournira la doc à jour.

## Tables FaceHub existantes (principales)

- `clinics` (id uuid), `patients` (id uuid), `user_roles` (user_id, role, clinic_id),
  `user_profiles`, `user_requests`, `clinic_module_settings`, `implant_cases`
- Rôles : `super_admin` > `owner` > `user` > `assistant`.
  Le rôle est dans **`user_roles.role`** (pas user_profiles).
- Super admin : schausse@gmail.com

## Module implantologie (cœur du pivot)

`ImplantCases.jsx` / `ImplantCaseForm.jsx` / `ImplantCaseDetail.jsx` — table `implant_cases`.
Statuts : consultation_initiale → plan_traitement → en_attente_reponse →
chirurgie_programmee → post_operatoire → fabrication_labo → prothese_finale → termine/annule.
Types : unitaire, multiple, all_on_4/6/8, zygomatique, ponts.

## Commandes

```bash
npm run dev      # serveur local
npm run build    # build de prod (toujours vérifier avant de committer)
```

## Écosystème connexe (hors repo)

- Notion : bases implantologie et Invisalign (gérées via claude.ai, pas ici)
- Documents cliniques Word : python-docx, A4, marges ~20mm (compatibilité Dentitek/Dentitek)
- Autres projets de Serge : LBMA (softball, repo LBMA), dentiste.com (repo dr-chausse-website)
  — ne pas confondre les projets Supabase.
