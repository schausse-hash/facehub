-- ============================================================
-- FaceHub — Ajout de la colonne patients.is_active
-- Appliqué le 12 juin 2026 (migration `add_patients_is_active`)
--
-- La fonctionnalité activer/désactiver un patient existait dans l'UI
-- (PatientEdit : bouton, PatientList : filtre actif/inactif,
-- PatientDetail : badge ACTIF/INACTIF) mais la colonne n'a jamais été
-- créée en base : l'update échouait silencieusement (erreur non vérifiée).
-- Défaut true = tous les patients existants restent « actifs »,
-- comportement identique à l'UI actuelle (is_active !== false).
-- ============================================================

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
