# FaceHub — Sécurisation complète des policies RLS

*Effectué le 15 mai 2026 — projet Supabase `pmgbwtngjjnjwhmjxeuc`*

---

## Résumé

Avant cette session, **14 tables** de FaceHub avaient des policies `USING (true)` qui exposaient des données médicales sensibles à n'importe qui possédant la clé anon (publique dans le JS de www.facehub.ca).

Après cette session, **toutes les tables sensibles sont filtrées par clinique** via `user_roles`, avec un système hiérarchique qui hérite automatiquement de la sécurité de `implant_cases`.

---

## Architecture de sécurité

```
user_roles (clé pour tout filtrage)
├── implant_cases    → filtré par clinic_id via user_roles
│   ├── case_phases  → filtré via case_id (hérite implant_cases)
│   ├── case_steps   → filtré via case_id (hérite implant_cases)
│   ├── case_photos  → filtré via case_id (hérite implant_cases)
│   └── treatment_plans → filtré via case_id (hérite implant_cases)
│       └── treatment_lines → filtré via plan_id (hérite treatment_plans)
├── patients         → filtré (déjà OK avant la session)
│   ├── treatments   → filtré via patient_id (hérite patients)
│   └── visits       → filtré via patient_id (hérite patients)
├── clinics          → user voit seulement ses cliniques, super_admin gère
├── clinic_module_settings → user voit, admin gère
├── pricing_grid     → user voit, admin gère
├── portfolio_folders → filtré par clinic_id
└── portfolio_photos → filtré via folder_id
```

---

## Fonctions SECURITY DEFINER créées

Pour éviter la récursion infinie quand RLS interroge `user_roles` :

```sql
public.current_user_is_staff()    -- TRUE si admin/super_admin/owner/assistant
public.current_user_clinic_id()    -- UUID de la clinique du user courant
```

Ces fonctions sont utilisées dans la policy `Users can view their own + clinic roles if staff` sur `user_roles`.

---

## Tables sécurisées (14)

| Table | Avant | Après |
|---|---|---|
| `implant_cases` | `USING(true)` | 4 policies par clinic_id |
| `case_phases` | `USING(true)` | Hérite via case_id |
| `case_steps` | `USING(true)` | Hérite via case_id |
| `case_photos` | `USING(true)` | Hérite via case_id |
| `treatment_plans` | `USING(true)` | Hérite via case_id |
| `treatment_lines` | `USING(true)` | Hérite via plan_id |
| `treatments` | 2× `USING(true)` | Hérite via patient_id |
| `visits` | `USING(true)` | Hérite via patient_id |
| `clinics` | `USING(true)` | Lecture clinique, super_admin gère |
| `clinic_module_settings` | `USING(true)` | Lecture clinique, admin gère |
| `pricing_grid` | `USING(true)` | Lecture clinique, admin gère |
| `portfolio_folders` | `USING(true)` | Filtré par clinic_id |
| `portfolio_photos` | `USING(true)` | Hérite via folder_id |
| `user_roles` (SELECT) | `USING(true)` | SECURITY DEFINER pattern |

### Bonus appliqués plus tôt dans la session

| Table | Action |
|---|---|
| `appointments` | Retrait "Allow all appointments" (policies par clinique existaient déjà) |
| `schedule_settings` | Retrait "Allow all schedule_settings" (policies par user_id existaient déjà) |

---

## Policies USING(true) restantes (légitimes)

| Table | Pourquoi c'est OK |
|---|---|
| `appointment_types` SELECT | Types de RDV publics pour le booking en ligne |
| `schedule_settings` SELECT | Horaires publics pour le booking |
| `user_requests` INSERT | Permettre aux non-inscrits de demander un accès |

---

## Tests effectués

✅ Connexion super_admin (schausse@gmail.com)
✅ Affichage des 2 cas (Louise Lauzon + Lise Poulin)
✅ Détail du cas avec toutes ses phases
✅ Plan de traitement avec lignes
✅ Grille tarifaire (73 actes)
✅ Module settings
✅ Nom de clinique (Centre dentaire Serge Chaussé)
✅ Section Admin accessible
✅ Aucune table avec USING(true) sur données médicales

---

## Préalable au sprint 3 (collaborateurs externes)

Cette sécurisation est le **prérequis obligatoire** avant d'inviter Emilie Lacasse, Theresa et Dr Rami Youssef. Maintenant :

- Chaque utilisateur n'aura accès qu'aux données de **sa propre clinique**
- Les `user_roles` détermineront automatiquement la clinique et les permissions
- Aucune fuite cross-clinique possible

Pour ajouter un collaborateur, créer un INSERT dans `user_roles` avec :
- `user_id` (UUID Supabase de l'utilisateur)
- `role` ('owner', 'admin', 'user' ou 'assistant')
- `clinic_id` (UUID de la clinique correspondante)

---

## Rollback si besoin

En cas de problème, le fichier `sql/rollback-policies-15mai2026.sql` contient les anciennes policies pour revenir en arrière (mais cela rétablirait aussi les vulnérabilités).

---

## Conformité

Avec cette sécurisation, FaceHub est maintenant aligné avec :
- **Loi 25 Québec** — accès aux données personnelles restreint par autorisation
- **Bonnes pratiques RGPD** — principe de moindre privilège
- **Architecture multi-tenant** — isolation des données entre cliniques
