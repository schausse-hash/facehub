# FaceHub 2.0 — Résumé de session
*Dernière mise à jour : 15 mai 2026*

## 🔧 Stack technique
- **Frontend** : React + Vite (JSX)
- **Backend** : Supabase projet "Esthetic-clinic" (`pmgbwtngjjnjwhmjxeuc`)
- **Déploiement** : Vercel → **www.facehub.ca**
- **Repo GitHub** : schausse-hash/facehub
- **Supabase dentiste.com** : `bjxplcepfhwnwiuyovxw` (projet séparé — ne pas confondre)

---

## 🔒 SESSION SÉCURITÉ — 15 MAI 2026

### Contexte
Annonce Supabase du 30 octobre 2026 : nouvelles tables `public` nécessiteront des `GRANT` explicites pour la Data API. Audit complet effectué sur les 3 projets Supabase (LBMA, dentiste.com, FaceHub) → FaceHub était **le plus à risque** avec 14 tables médicales exposées via `USING(true)`.

### ✅ Sécurisation complète des 14 tables

Avant : la clé anon (publique côté navigateur) permettait à n'importe qui de lire/modifier toutes les données médicales (cas implants, traitements, photos, etc.) de TOUTES les cliniques.

Après : architecture hiérarchique de RLS basée sur `user_roles` :

```
user_roles (table racine pour filtrage)
├── implant_cases (clinic_id direct)
│   ├── case_phases, case_steps, case_photos, treatment_plans (via case_id)
│   └── treatment_lines (via plan_id)
├── patients
│   ├── treatments, visits (via patient_id)
├── pricing_grid, clinic_module_settings, clinics (clinic_id direct)
└── portfolio_folders → portfolio_photos (via folder_id)
```

### Fonctions SECURITY DEFINER créées

```sql
public.current_user_is_staff()    -- TRUE si admin/super_admin/owner/assistant
public.current_user_clinic_id()    -- UUID de la clinique du user courant
```

Utilisées dans `user_roles` policy pour éviter la récursion infinie.

### Hot fixes appliqués
- Suppression de "Allow all appointments" qui annulait les bonnes policies par clinique
- Suppression de "Allow all schedule_settings" idem

### Tests validés
- ✅ Connexion super_admin
- ✅ Affichage des 2 cas (Louise Lauzon + Lise Poulin)
- ✅ Détail cas avec phases, étapes, plan, lignes
- ✅ Tarifs (73 actes), modules, portfolio
- ✅ Section Admin accessible
- ✅ Aucune table avec USING(true) sur données médicales

### Concepts clés appris
- **Récursion RLS** : si une policy interroge la même table qu'elle protège, il y a un risque de récursion infinie. Solution : fonctions `SECURITY DEFINER` qui contournent RLS.
- **Policies en OR** : plusieurs policies sur la même opération = OR logique. Pour AND, mettre les conditions dans la même policy.
- **`auth.role()` vs `user_roles`** : le rôle Postgres (`anon`/`authenticated`/`service_role`) est différent du `role` métier (`super_admin`, `owner`, etc.) stocké dans `user_roles`.

### Fichiers créés ce jour (sql/)
- `SECURITE-15mai2026.md` — documentation complète de la remédiation
- `rollback-policies-15mai2026.sql` — rollback si besoin
- `dump-securite-15mai2026.sql` — dump complet (fonctions + policies) idempotent
- Mise à jour `.gitignore` (ignore `.env`, `node_modules`, `dist`)

### Préalable au sprint 3 (collaborateurs externes) ✅
La sécurisation est en place. Tu peux maintenant inviter Emilie, Theresa et Dr Youssef sans risque — chaque user n'aura accès qu'aux données de SA clinique.

---

## ✅ Ce qui avait été fait le 5 mai 2026 (historique)

### 1. Schéma réel des tables découvert
| Table | Colonnes importantes |
|---|---|
| `patients` | `name` (pas first_name/last_name), `user_id`, `clinic_id`, `phone`, `email`, `birthdate`, `allergies`, `notes`, `metadata` |
| `implant_cases` | `statut` (pas status), `type_traitement`, `dents` (array), `notes`, `date_consultation`, `date_rdv`, `note_prv`, `chirurgien_id` |
| `case_phases` | `phase_num`, `titre`, `statut`, `description` |
| `case_steps` | `description`, `ordre`, `completed`, `completed_at`, `completed_by`, `case_id` requis |
| `treatment_plans` | `case_id`, `template_type`, `notes`, `prix_total` |
| `treatment_lines` | `acte`, `code_acdq`, `prix_total`, `ordre`, `prix_honoraires`, `prix_labo`, `prix_materiaux` |
| `pricing_grid` | `acte`, `code_acdq`, `prix_total`, `prix_honoraires`, `prix_labo`, `prix_materiaux`, `notes`, `categorie` |
| `clinic_module_settings` | `clinic_id`, `module_key`, `is_visible` |

### 2. Composants créés / mis à jour
- `ImplantCaseDetail.jsx` (v2) — Fiche cas avec 4 onglets : Suivi / Plan / Infos / Patient
- `ImplantCaseForm.jsx` — Ajout mode "Nouveau patient" intégré
- `PricingGrid.jsx` — Grille tarifaire avec recherche, filtres, édition inline
- `ModuleSettings.jsx` — Admin toggles on/off modules
- `Dashboard.jsx` — Imports + nav Tarifs + nav Modules + isModuleVisible()

### 3. Données insérées
- **73 actes** dans `pricing_grid`
- **2 patients** : Louise Lauzon, Lise Poulin
- **Module settings** par défaut pour clinique Dr Chaussé

### 4. Protocoles disponibles
- Implant Postérieur (≥15, ≥25) — 3 phases
- Implant Antérieur (11–14, 21–24) — 4 phases avec temporaire
- All-on-X (4/6/8) — 4 phases
- Sinus Lift + Implant — 5 phases

---

## 🚧 À faire — Prochaine session (Priorité 1)

### Immédiat
- [ ] **Tester le formulaire "+ Nouveau cas"** avec création patient intégrée
- [ ] **Tester ImplantCaseDetail** — cliquer sur Louise Lauzon ou Lise Poulin → vérifier les 4 onglets
- [ ] **Appliquer protocoles** dans FaceHub pour Louise Lauzon (Sinus Lift) et Lise Poulin (Postérieur)
- [ ] **Tester Admin → Modules** — toggler des sections et vérifier que la sidebar se met à jour
- [ ] **Renommer l'app** : changer "FaceHub / Aesthetic Pro" → quelque chose de dentaire dans le branding

### Sprint 2 — Fonctionnalités restantes
- [ ] **Génération PDF** du plan de traitement (bouton "🖨 Imprimer" déjà dans l'UI, logique à brancher)
- [ ] **ImplantCases.jsx** — brancher le clic sur un cas → ouvre ImplantCaseDetail
- [ ] **Photos de cas** — utiliser `case_photos` table + réutiliser `PhotoGallery.jsx`
- [ ] **Agenda chirurgical** — vue calendrier des interventions planifiées

### Sprint 3 — Accès collaborateurs (prérequis RLS ✅ terminé)
- [ ] Emilie Lacasse (chamille83@gmail.com) — Dr Chaussé + St-Luc — coordinator
- [ ] Theresa (theresadcrgestion@gmail.com) — Cité Rosemont — coordinator
- [ ] Dr Rami Youssef (rami.yf@live.ca) — Cité Rosemont — collaborator
- [x] ~~Filtrage par rôle~~ (terminé 15 mai 2026 — RLS hiérarchique en place)

### Sprint 4 — Invisalign
- [ ] Nouveau type de cas : `invisalign` à ajouter dans la contrainte CHECK
- [ ] Protocole Invisalign : nombre d'aligneurs, % complété, rendez-vous d'ajustement
- [ ] Photos de suivi par série d'aligneurs

### Plus tard
- [ ] Migration complète Notion → FaceHub (patients St-Luc et Rosemont)
- [ ] Accès collaborateurs par lien (comme Notion)
- [x] ~~RLS policies restrictives par rôle~~ (terminé 15 mai 2026)
- [ ] Facturation reste dans le logiciel clinique — pas dans FaceHub

---

## 📌 IDs et références importants

| Élément | Valeur |
|---|---|
| Supabase projet | `pmgbwtngjjnjwhmjxeuc` |
| URL Vercel | `www.facehub.ca` |
| GitHub | `schausse-hash/facehub` |
| User admin | `schausse@gmail.com` |
| Clinique Dr Chaussé | chercher via `SELECT id FROM clinics WHERE name ILIKE '%chausse%'` |
| Documentation sécurité | `sql/SECURITE-15mai2026.md` |
| Dump complet sécurité | `sql/dump-securite-15mai2026.sql` |
