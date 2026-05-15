-- =====================================================================
-- FaceHub — DUMP COMPLET SÉCURITÉ (policies + fonctions)
-- =====================================================================
-- Projet Supabase : pmgbwtngjjnjwhmjxeuc (Esthetic-clinic)
-- URL : https://pmgbwtngjjnjwhmjxeuc.supabase.co
-- Généré le : 15 mai 2026
--
-- Ce fichier permet de RECRÉER intégralement les policies RLS et
-- fonctions SECURITY DEFINER actuelles. À utiliser pour :
--   - Restaurer la sécurité sur une nouvelle instance Supabase
--   - Vérifier l'état actuel vs. cible
--   - Documentation et audit
--
-- ⚠️ AVANT d'exécuter ce script sur une autre BD : s'assurer que les
--    tables existent déjà (cf. sql/supabase_migration.sql).
-- =====================================================================


-- =====================================================================
-- SECTION 1 : FONCTIONS SECURITY DEFINER
-- =====================================================================

-- 1.1 — current_user_is_staff()
--      Retourne TRUE si l'utilisateur courant a un rôle staff
--      Utilisé pour éviter la récursion infinie dans les policies user_roles

CREATE OR REPLACE FUNCTION public.current_user_is_staff()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'owner', 'assistant')
  );
$function$;

GRANT EXECUTE ON FUNCTION public.current_user_is_staff() TO anon, authenticated, service_role;


-- 1.2 — current_user_clinic_id()
--      Retourne l'UUID de la clinique de l'utilisateur courant

CREATE OR REPLACE FUNCTION public.current_user_clinic_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT clinic_id FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$function$;

GRANT EXECUTE ON FUNCTION public.current_user_clinic_id() TO anon, authenticated, service_role;


-- =====================================================================
-- SECTION 2 : ENABLE RLS sur toutes les tables
-- =====================================================================

ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implant_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_grid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;


-- =====================================================================
-- SECTION 3 : POLICIES RLS
-- =====================================================================


-- ===== Table : appointment_types =====

DROP POLICY IF EXISTS "Clinic admins can manage appointment types" ON public.appointment_types;
CREATE POLICY "Clinic admins can manage appointment types"
  ON public.appointment_types
  FOR ALL
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));

DROP POLICY IF EXISTS "Anyone can view appointment types" ON public.appointment_types;
CREATE POLICY "Anyone can view appointment types"
  ON public.appointment_types
  FOR SELECT
  TO public
  USING (true);


-- ===== Table : appointments =====

DROP POLICY IF EXISTS "Users can delete appointments in their clinic" ON public.appointments;
CREATE POLICY "Users can delete appointments in their clinic"
  ON public.appointments
  FOR DELETE
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));

DROP POLICY IF EXISTS "Public can insert online bookings" ON public.appointments;
CREATE POLICY "Public can insert online bookings"
  ON public.appointments
  FOR INSERT
  TO public
  WITH CHECK ((booked_online = true));

DROP POLICY IF EXISTS "Users can insert appointments in their clinic" ON public.appointments;
CREATE POLICY "Users can insert appointments in their clinic"
  ON public.appointments
  FOR INSERT
  TO public
  WITH CHECK ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));

DROP POLICY IF EXISTS "Users can view appointments from their clinic" ON public.appointments;
CREATE POLICY "Users can view appointments from their clinic"
  ON public.appointments
  FOR SELECT
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));

DROP POLICY IF EXISTS "Users can update appointments in their clinic" ON public.appointments;
CREATE POLICY "Users can update appointments in their clinic"
  ON public.appointments
  FOR UPDATE
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));


-- ===== Table : case_phases =====

DROP POLICY IF EXISTS "Users can manage case_phases via cases" ON public.case_phases;
CREATE POLICY "Users can manage case_phases via cases"
  ON public.case_phases
  FOR ALL
  TO public
  USING ((case_id IN ( SELECT implant_cases.id
   FROM implant_cases)))
  WITH CHECK ((case_id IN ( SELECT implant_cases.id
   FROM implant_cases)));


-- ===== Table : case_photos =====

DROP POLICY IF EXISTS "Users can manage case_photos via cases" ON public.case_photos;
CREATE POLICY "Users can manage case_photos via cases"
  ON public.case_photos
  FOR ALL
  TO public
  USING ((case_id IN ( SELECT implant_cases.id
   FROM implant_cases)))
  WITH CHECK ((case_id IN ( SELECT implant_cases.id
   FROM implant_cases)));


-- ===== Table : case_steps =====

DROP POLICY IF EXISTS "Users can manage case_steps via cases" ON public.case_steps;
CREATE POLICY "Users can manage case_steps via cases"
  ON public.case_steps
  FOR ALL
  TO public
  USING ((case_id IN ( SELECT implant_cases.id
   FROM implant_cases)))
  WITH CHECK ((case_id IN ( SELECT implant_cases.id
   FROM implant_cases)));


-- ===== Table : clinic_module_settings =====

DROP POLICY IF EXISTS "Admins can manage module settings" ON public.clinic_module_settings;
CREATE POLICY "Admins can manage module settings"
  ON public.clinic_module_settings
  FOR ALL
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
  WITH CHECK ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));

DROP POLICY IF EXISTS "Users can view module settings for their clinic" ON public.clinic_module_settings;
CREATE POLICY "Users can view module settings for their clinic"
  ON public.clinic_module_settings
  FOR SELECT
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));


-- ===== Table : clinics =====

DROP POLICY IF EXISTS "Super admins can manage clinics" ON public.clinics;
CREATE POLICY "Super admins can manage clinics"
  ON public.clinics
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'super_admin'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'super_admin'::text)))));

DROP POLICY IF EXISTS "Users can view their clinics" ON public.clinics;
CREATE POLICY "Users can view their clinics"
  ON public.clinics
  FOR SELECT
  TO public
  USING ((id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));


-- ===== Table : implant_cases =====

DROP POLICY IF EXISTS "Users can delete implant_cases in their clinic" ON public.implant_cases;
CREATE POLICY "Users can delete implant_cases in their clinic"
  ON public.implant_cases
  FOR DELETE
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));

DROP POLICY IF EXISTS "Users can insert implant_cases in their clinic" ON public.implant_cases;
CREATE POLICY "Users can insert implant_cases in their clinic"
  ON public.implant_cases
  FOR INSERT
  TO public
  WITH CHECK ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));

DROP POLICY IF EXISTS "Users can view implant_cases in their clinic" ON public.implant_cases;
CREATE POLICY "Users can view implant_cases in their clinic"
  ON public.implant_cases
  FOR SELECT
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));

DROP POLICY IF EXISTS "Users can update implant_cases in their clinic" ON public.implant_cases;
CREATE POLICY "Users can update implant_cases in their clinic"
  ON public.implant_cases
  FOR UPDATE
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))))
  WITH CHECK ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));


-- ===== Table : patient_documents =====

DROP POLICY IF EXISTS "Users can delete documents" ON public.patient_documents;
CREATE POLICY "Users can delete documents"
  ON public.patient_documents
  FOR DELETE
  TO public
  USING (((patient_id IN ( SELECT patients.id
   FROM patients
  WHERE (patients.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['collaborator'::text, 'super_admin'::text])))))));

DROP POLICY IF EXISTS "Users can insert documents" ON public.patient_documents;
CREATE POLICY "Users can insert documents"
  ON public.patient_documents
  FOR INSERT
  TO public
  WITH CHECK (((patient_id IN ( SELECT patients.id
   FROM patients
  WHERE (patients.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['collaborator'::text, 'super_admin'::text])))))));

DROP POLICY IF EXISTS "Users can view documents" ON public.patient_documents;
CREATE POLICY "Users can view documents"
  ON public.patient_documents
  FOR SELECT
  TO public
  USING (((patient_id IN ( SELECT patients.id
   FROM patients
  WHERE (patients.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['collaborator'::text, 'super_admin'::text])))))));


-- ===== Table : patient_medical_history =====

DROP POLICY IF EXISTS "Users can insert medical history" ON public.patient_medical_history;
CREATE POLICY "Users can insert medical history"
  ON public.patient_medical_history
  FOR INSERT
  TO public
  WITH CHECK (((patient_id IN ( SELECT patients.id
   FROM patients
  WHERE (patients.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['collaborator'::text, 'super_admin'::text])))))));

DROP POLICY IF EXISTS "Users can view medical history" ON public.patient_medical_history;
CREATE POLICY "Users can view medical history"
  ON public.patient_medical_history
  FOR SELECT
  TO public
  USING (((patient_id IN ( SELECT patients.id
   FROM patients
  WHERE (patients.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['collaborator'::text, 'super_admin'::text])))))));

DROP POLICY IF EXISTS "Users can update medical history" ON public.patient_medical_history;
CREATE POLICY "Users can update medical history"
  ON public.patient_medical_history
  FOR UPDATE
  TO public
  USING (((patient_id IN ( SELECT patients.id
   FROM patients
  WHERE (patients.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['collaborator'::text, 'super_admin'::text])))))));


-- ===== Table : patients =====

DROP POLICY IF EXISTS "select_patients" ON public.patients;
CREATE POLICY "select_patients"
  ON public.patients
  FOR SELECT
  TO public
  USING ((auth.uid() IS NOT NULL));


-- ===== Table : photos =====

DROP POLICY IF EXISTS "Allow authenticated users to delete photos" ON public.photos;
CREATE POLICY "Allow authenticated users to delete photos"
  ON public.photos
  FOR DELETE
  TO public
  USING ((auth.role() = 'authenticated'::text));

DROP POLICY IF EXISTS "Allow authenticated users to insert photos" ON public.photos;
CREATE POLICY "Allow authenticated users to insert photos"
  ON public.photos
  FOR INSERT
  TO public
  WITH CHECK ((auth.role() = 'authenticated'::text));

DROP POLICY IF EXISTS "Allow authenticated users to view photos" ON public.photos;
CREATE POLICY "Allow authenticated users to view photos"
  ON public.photos
  FOR SELECT
  TO public
  USING ((auth.role() = 'authenticated'::text));

DROP POLICY IF EXISTS "Allow authenticated users to update photos" ON public.photos;
CREATE POLICY "Allow authenticated users to update photos"
  ON public.photos
  FOR UPDATE
  TO public
  USING ((auth.role() = 'authenticated'::text));


-- ===== Table : portfolio_folders =====

DROP POLICY IF EXISTS "Users can manage portfolio_folders for their clinic" ON public.portfolio_folders;
CREATE POLICY "Users can manage portfolio_folders for their clinic"
  ON public.portfolio_folders
  FOR ALL
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))))
  WITH CHECK ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));


-- ===== Table : portfolio_photos =====

DROP POLICY IF EXISTS "Users can manage portfolio_photos via folders" ON public.portfolio_photos;
CREATE POLICY "Users can manage portfolio_photos via folders"
  ON public.portfolio_photos
  FOR ALL
  TO public
  USING ((folder_id IN ( SELECT portfolio_folders.id
   FROM portfolio_folders)))
  WITH CHECK ((folder_id IN ( SELECT portfolio_folders.id
   FROM portfolio_folders)));


-- ===== Table : pricing_grid =====

DROP POLICY IF EXISTS "Admins can manage pricing" ON public.pricing_grid;
CREATE POLICY "Admins can manage pricing"
  ON public.pricing_grid
  FOR ALL
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
  WITH CHECK ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));

DROP POLICY IF EXISTS "Users can view pricing for their clinic" ON public.pricing_grid;
CREATE POLICY "Users can view pricing for their clinic"
  ON public.pricing_grid
  FOR SELECT
  TO public
  USING ((clinic_id IN ( SELECT user_roles.clinic_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));


-- ===== Table : profiles =====

DROP POLICY IF EXISTS "select_profiles" ON public.profiles;
CREATE POLICY "select_profiles"
  ON public.profiles
  FOR SELECT
  TO public
  USING ((auth.uid() IS NOT NULL));


-- ===== Table : registration_links =====

DROP POLICY IF EXISTS "select_registration_links" ON public.registration_links;
CREATE POLICY "select_registration_links"
  ON public.registration_links
  FOR SELECT
  TO public
  USING ((auth.uid() IS NOT NULL));


-- ===== Table : schedule_settings =====

DROP POLICY IF EXISTS "Users can insert their own schedule settings" ON public.schedule_settings;
CREATE POLICY "Users can insert their own schedule settings"
  ON public.schedule_settings
  FOR INSERT
  TO public
  WITH CHECK ((user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view schedule settings for booking" ON public.schedule_settings;
CREATE POLICY "Public can view schedule settings for booking"
  ON public.schedule_settings
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can view their own schedule settings" ON public.schedule_settings;
CREATE POLICY "Users can view their own schedule settings"
  ON public.schedule_settings
  FOR SELECT
  TO public
  USING ((user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own schedule settings" ON public.schedule_settings;
CREATE POLICY "Users can update their own schedule settings"
  ON public.schedule_settings
  FOR UPDATE
  TO public
  USING ((user_id = auth.uid()));


-- ===== Table : services =====

DROP POLICY IF EXISTS "Admins peuvent modifier les services" ON public.services;
CREATE POLICY "Admins peuvent modifier les services"
  ON public.services
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

DROP POLICY IF EXISTS "Services visibles publiquement" ON public.services;
CREATE POLICY "Services visibles publiquement"
  ON public.services
  FOR SELECT
  TO public
  USING ((is_active = true));


-- ===== Table : treatment_lines =====

DROP POLICY IF EXISTS "Users can manage treatment_lines via plans" ON public.treatment_lines;
CREATE POLICY "Users can manage treatment_lines via plans"
  ON public.treatment_lines
  FOR ALL
  TO public
  USING ((plan_id IN ( SELECT treatment_plans.id
   FROM treatment_plans)))
  WITH CHECK ((plan_id IN ( SELECT treatment_plans.id
   FROM treatment_plans)));


-- ===== Table : treatment_plans =====

DROP POLICY IF EXISTS "Users can manage treatment_plans via cases" ON public.treatment_plans;
CREATE POLICY "Users can manage treatment_plans via cases"
  ON public.treatment_plans
  FOR ALL
  TO public
  USING ((case_id IN ( SELECT implant_cases.id
   FROM implant_cases)))
  WITH CHECK ((case_id IN ( SELECT implant_cases.id
   FROM implant_cases)));


-- ===== Table : treatments =====

DROP POLICY IF EXISTS "Users can manage treatments via patients" ON public.treatments;
CREATE POLICY "Users can manage treatments via patients"
  ON public.treatments
  FOR ALL
  TO public
  USING ((patient_id IN ( SELECT patients.id
   FROM patients)))
  WITH CHECK ((patient_id IN ( SELECT patients.id
   FROM patients)));


-- ===== Table : user_profiles =====

DROP POLICY IF EXISTS "Super admin can manage profiles" ON public.user_profiles;
CREATE POLICY "Super admin can manage profiles"
  ON public.user_profiles
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'super_admin'::text)))));

DROP POLICY IF EXISTS "Staff can view all profiles" ON public.user_profiles;
CREATE POLICY "Staff can view all profiles"
  ON public.user_profiles
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['collaborator'::text, 'super_admin'::text]))))));

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO public
  USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO public
  USING ((auth.uid() = user_id));


-- ===== Table : user_requests =====

DROP POLICY IF EXISTS "Super admin can delete requests" ON public.user_requests;
CREATE POLICY "Super admin can delete requests"
  ON public.user_requests
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'super_admin'::text)))));

DROP POLICY IF EXISTS "Anyone can request access" ON public.user_requests;
CREATE POLICY "Anyone can request access"
  ON public.user_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view requests" ON public.user_requests;
CREATE POLICY "Staff can view requests"
  ON public.user_requests
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['collaborator'::text, 'super_admin'::text]))))));

DROP POLICY IF EXISTS "Staff can update requests" ON public.user_requests;
CREATE POLICY "Staff can update requests"
  ON public.user_requests
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['collaborator'::text, 'super_admin'::text]))))));


-- ===== Table : user_roles =====

DROP POLICY IF EXISTS "Super admin can delete" ON public.user_roles;
CREATE POLICY "Super admin can delete"
  ON public.user_roles
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM user_roles user_roles_1
  WHERE ((user_roles_1.user_id = auth.uid()) AND (user_roles_1.role = 'super_admin'::text)))));

DROP POLICY IF EXISTS "Super admin can insert" ON public.user_roles;
CREATE POLICY "Super admin can insert"
  ON public.user_roles
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles user_roles_1
  WHERE ((user_roles_1.user_id = auth.uid()) AND (user_roles_1.role = 'super_admin'::text)))));

DROP POLICY IF EXISTS "Users can view their own + clinic roles if staff" ON public.user_roles;
CREATE POLICY "Users can view their own + clinic roles if staff"
  ON public.user_roles
  FOR SELECT
  TO public
  USING (((user_id = auth.uid()) OR (current_user_is_staff() AND (clinic_id = current_user_clinic_id()))));

DROP POLICY IF EXISTS "Super admin can update" ON public.user_roles;
CREATE POLICY "Super admin can update"
  ON public.user_roles
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM user_roles user_roles_1
  WHERE ((user_roles_1.user_id = auth.uid()) AND (user_roles_1.role = 'super_admin'::text)))));


-- ===== Table : visits =====

DROP POLICY IF EXISTS "Users can manage visits via patients" ON public.visits;
CREATE POLICY "Users can manage visits via patients"
  ON public.visits
  FOR ALL
  TO public
  USING ((patient_id IN ( SELECT patients.id
   FROM patients)))
  WITH CHECK ((patient_id IN ( SELECT patients.id
   FROM patients)));


-- =====================================================================
-- SECTION 4 : VÉRIFICATION POST-EXÉCUTION
-- =====================================================================

-- Compter les policies créées (doit retourner ~58)
SELECT COUNT(*) AS nb_policies FROM pg_policies WHERE schemaname = 'public';

-- Lister les fonctions SECURITY DEFINER
SELECT proname FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND prosecdef = true
ORDER BY proname;

-- Identifier les éventuelles policies USING(true) restantes
SELECT tablename, policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND (qual = 'true' OR with_check = 'true');

-- Fin du dump