# FaceHub 2.0 — Pivot vers la plateforme dentaire connectée à Dentitek

**Date :** 12 juin 2026
**Décision :** abandon du volet esthétique (FaceTec) en production; FaceHub devient la plateforme de gestion multi-cliniques connectée à l'API Group V2 de Dentitek, centrée sur l'implantologie et les flux Cabinet Dr Chaussé / Saint-Luc / Cité Rosemont.

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
- `date_modified` : max 30 jours; `date_from`/`date_to` : max 365 jours d'écart
- Pagination : `limit` (défaut 2500), `offset`, `with_deleted`
- RDV avec `idPatientDentitek` = vrai rendez-vous; avec nom seulement = note de rendez-vous
