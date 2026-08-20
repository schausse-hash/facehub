# FaceHub 2.0 — Pivot vers la plateforme dentaire connectée à Dentitek

**Date :** 12 juin 2026
**Décision :** abandon du volet esthétique (FaceTec) en production; FaceHub devient la plateforme de gestion multi-cliniques connectée à l'API Group V2 de Dentitek pour les flux Cabinet Dr Chaussé / Saint-Luc / Cité Rosemont.
**Vision (mise à jour 12 juin) :** FaceHub couvre **TOUTE la dentisterie**, pas seulement l'implantologie — Invisalign, couronnes et ponts sur dents naturelles, obturations, chirurgie, botox dentaire (bruxisme/ATM/esthétique), etc. L'implantologie reste le **module pilote** qui valide le patron des cas de traitement avant sa généralisation.

---

## 1. Ce qu'on GARDE (fondations solides)

| Élément | Pourquoi |
|---|---|
| Auth + rôles (super_admin / owner / user / assistant) | Déjà robuste, workflow d'approbation en place |
| Multi-cliniques (`clinics`) | Cœur du déploiement à 3 cliniques |
| Système de modules (`clinic_module_settings`) | Permet d'activer/désactiver par clinique |
| **Module Implantologie** (`implant_cases`, statuts du parcours) | Devient le module central |
| Patients (`patients`, fiche, recherche) | Sera enrichi par la synchro Dentitek |
| Grille tarifaire (`PricingGrid`) | Réutilisable pour codes ACDQ |
| Dictée vocale (`VoiceDictation`) | Notes cliniques |
| Documents, thème sombre, responsive mobile | Acquis |

## 2. Ce qu'on RETIRE / DÉSACTIVE (héritage FaceTec)

- `InjectionTemplates` (injections esthétiques)
- `Portfolio` / galerie avant-après esthétique
- `PublicBooking` esthétique (sera remplacé par les disponibilités Dentitek)
- `VisitDetail` / `VisitsList` version esthétique (à fusionner dans le dossier implanto)
- `PatientDetail_backup.jsx` (fichier mort)

**Stratégie :** ne pas supprimer le code tout de suite — désactiver les modules via `clinic_module_settings`, puis archiver dans une branche `legacy-facetec`. Zéro risque, retour en arrière possible.

**Nuance (12 juin) :** les sections botox/injections (consentement toxine botulinique,
`InjectionTemplates`, zones d'injection) ne seront **pas archivées** — elles seront
**réutilisées pour le botox dentaire** (bruxisme, ATM, esthétique péri-orale),
qui fait partie de l'offre dentaire de FaceHub.

## 3. Ce qu'on AJOUTE (le cœur du pivot)

### Phase 1 — Fondation Dentitek (FAIT aujourd'hui ✅)
- `src/services/dentitek/dentitekClient.js` — client complet (~30 endpoints, file d'attente 4 requêtes simultanées, gestion 429)
- `src/services/dentitek/mockData.js` — **mode simulation** : tout se développe et se démontre SANS clé, en attendant le portail (3-4 semaines)
- `sql/dentitek_migration.sql` — tables : config, mapping cliniques, mapping patients, journal de synchro, cache des rendez-vous
- `src/components/DentitekSettings.jsx` — page de config (mode, sous-domaine, clé) + test de connexion + correspondance des cliniques

### Phase 2 — Synchronisation patients (anti-double-saisie)
- Service de polling : `patients?modified=1` chaque nuit (pas de webhooks chez Dentitek)
- Bouton « Importer depuis Dentitek » dans la fiche patient (via `patientInfo`)
- Lien automatique patient FaceHub ↔ `idPatientDentitek`
- Pont vers Notion implantologie : création de la fiche Notion à partir des données Dentitek

### Phase 2.5 — Dossier médical dentaire et consentement (ajouté le 12 juin 2026)

À bâtir après le bouton d'import dans la fiche patient. Recycle l'infrastructure
d'auto-inscription en ligne (lien unique + QR + formulaires) héritée de l'esthétique.

- **Questionnaire médical dentaire obligatoire** pour les nouveaux patients :
  médicaments, bisphosphonates, allergies, conditions cardiaques, anticoagulants
  (les colonnes existent déjà dans `patients` : `medicaments`, `conditions_medicales`,
  `allergies_dentaires`, `bisphosphonates`, `radiation_tete_cou`, `fumeur`, `medecin_famille`)
- **Consentement éclairé avant chirurgie** : envoi au patient + signature en ligne
  (remplace les consentements Botox/Comblement par chirurgie implantaire, sédation, greffe, photo)
- **Blocage du parcours implanto** : un cas ne peut pas passer au statut
  « chirurgie_programmee » tant que le consentement n'est pas signé
- Note : depuis le 12 juin, le badge « Complet/Incomplet » de la liste des patients
  utilise des critères minimaux (nom + naissance + contact) et les patients liés
  portent un badge ⚡ Dentitek. Ce chantier raffinera la notion de « dossier complet ».

### Chantier — Généralisation des cas de traitement (cible documentée le 12 juin 2026)

**Objectif :** transformer le patron `implant_cases` en **cas de traitement multi-types**,
chaque type ayant son propre parcours de statuts. **On ne refactorise pas tout de suite** —
l'implantologie reste le module pilote qui valide le patron; ce chantier documente la cible.

Parcours par type (statuts propres à chacun) :

| Type | Parcours |
|---|---|
| **Implantologie** (pilote, existant) | consultation_initiale → plan_traitement → en_attente_reponse → chirurgie_programmee → post_operatoire → fabrication_labo → prothese_finale → termine/annule |
| **Invisalign** | scan → ClinCheck → aligneurs → suivis → contention |
| **Prothèse fixe** (couronnes/ponts sur dents naturelles) | prépa → empreinte → labo → cimentation |
| **Obturations** | diagnostic → traitement → suivi |
| **Chirurgie** (extractions, greffes…) | consultation → chirurgie_programmee → post_operatoire → termine |
| **Botox dentaire** (bruxisme/ATM/esthétique) | évaluation → consentement → injection → suivi (réutilise les sections botox esthétiques existantes) |

Principes de conception :
- Une table générique `treatment_cases` (ou extension d'`implant_cases`) avec
  `type_traitement` et un statut validé contre le parcours du type
- Les parcours de statuts définis en configuration (pas codés en dur par module)
- La timeline dentaire de la fiche patient (Phase 2.5) affiche tous les types
- Lien avec Dentitek : `idTypeTraitDentitek` des RDV permettra d'associer
  automatiquement un RDV au bon type de cas
- Pont Notion existant (bases implantologie ET Invisalign déjà gérées via claude.ai)

### Phase 3 — Rendez-vous et disponibilités
- Tableau de bord multi-cliniques des rendez-vous (`syncRdv` + cache Supabase)
- Recherche de disponibilités (`getAvailabilities`) depuis le dossier implanto → booking de la chirurgie en un clic (`makeAppointmentById`)
- Suivi des confirmations (`statusConfirmation`)

### Phase 4 — Plans de traitement et finances
- Intégration `treatment_plan` (demander la doc à jour à Christophe — la collection fournie est V2.0.17, le changelog est rendu à v2.2.06)
- Suivi transactions/paiements par cas d'implant
- KPI : taux d'occupation, comptes recevables, rendez-vous prioritaires

### Phase 5 — Production
- Bascule mode `mock` → `live` quand la clé du portail arrive
- Tests sur bac à sable + clinique de test Progitek
- Validation Loi 25 (les données restent au Canada côté Dentitek; vérifier le stockage Supabase)

## 4. Questions en suspens pour Christophe Pichon

1. Collection Postman **à jour** (v2.2.x) — il manque treatment_plan, getOccupancyRate, getPriorityAppointments, updateOperator
2. Documentation des **notes de rendez-vous** (il a admis qu'elle est incomplète)
3. Format de réponse exact des nouveaux endpoints KPI
4. Confirmation : une clé = plusieurs cliniques en production
5. Tarification finale (< 100 $/clinique/mois à confirmer)

## 5. Rappels techniques

- Auth : en-tête `x-api-key`; base `https://[groupe].dentitek.info/v1`
- Limites : 50 req/s, 4 requêtes simultanées (gérées par le client)
- Synchro incrémentale : `/patients` utilise `modified` (en jours), les autres
  endpoints utilisent `date_modified`. Un `date_modified` envoyé à `/patients` est
  ignoré en silence → toute la base est retournée sans erreur.
- `modified` / `date_modified` : max 30 jours; `date_from`/`date_to` : max 365 jours
  d'écart; `/schedules` : ~3 mois (v2.0.21)
- Pagination : `limit` (défaut ET max 2500), `offset`, `with_deleted` — exception :
  `/patients` en mode `modified` est documenté à 5000/5000 dans la collection
  (seul endpoint à déroger, comme pour `modified` vs `date_modified`)
- RDV avec `idPatientDentitek` = vrai rendez-vous; avec nom seulement = note de rendez-vous
