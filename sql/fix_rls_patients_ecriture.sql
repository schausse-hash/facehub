-- ============================================================
-- FaceHub — Correctif RLS : politiques d'écriture sur patients
-- Appliqué le 12 juin 2026 (migration `fix_patients_rls_write_policies`)
--
-- Régression du durcissement RLS du 15 mai 2026 : seule la politique
-- SELECT (`select_patients`) avait été créée sur public.patients.
-- Avec la RLS activée et aucune politique INSERT/UPDATE/DELETE,
-- TOUTE écriture était refusée :
--   - création de patient (Dashboard, ImplantCaseForm, import Dentitek)
--   - modification (PatientEdit, ImplantCaseDetail)
--   - suppression (PatientEdit)
-- ...y compris en production.
--
-- Posture retenue : identique à select_patients (utilisateur authentifié),
-- et la création exige user_id = auth.uid(), conforme à la convention
-- du code (user_id: session.user.id à chaque insert).
-- Un filtrage par clinique (comme implant_cases) serait plus strict mais
-- exige que clinic_id soit toujours renseigné — à envisager plus tard.
-- ============================================================

DROP POLICY IF EXISTS "insert_patients" ON public.patients;
CREATE POLICY "insert_patients"
  ON public.patients
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_patients" ON public.patients;
CREATE POLICY "update_patients"
  ON public.patients
  FOR UPDATE
  TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "delete_patients" ON public.patients;
CREATE POLICY "delete_patients"
  ON public.patients
  FOR DELETE
  TO public
  USING (auth.uid() IS NOT NULL);
