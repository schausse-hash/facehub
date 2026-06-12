-- ============================================================
-- FaceHub — Phase 2.5 : colonnes d'historique médical dentaire
-- Appliqué le 12 juin 2026 (migration `add_patients_dental_history_columns`)
--
-- Complète les colonnes dentaires déjà présentes dans `patients` :
-- medicaments, conditions_medicales (text[]), allergies_dentaires,
-- fumeur, radiation_tete_cou, bisphosphonates, medecin_famille.
-- ============================================================

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS anticoagulants boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS maladies_chirurgies text;
