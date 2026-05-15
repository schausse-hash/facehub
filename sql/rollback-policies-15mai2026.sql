-- =====================================================================
-- FaceHub — ROLLBACK des policies (avant remédiation 15 mai 2026)
-- =====================================================================
-- À utiliser SI BESOIN pour revenir à l'état d'avant la remédiation.
-- Exécute toutes les commandes dans Supabase SQL Editor (projet pmgbwtngjjnjwhmjxeuc).
-- =====================================================================

-- D'abord supprimer les nouvelles policies (qu'on aurait créées)
-- (à adapter selon ce qu'on aura créé)

-- Puis recréer les anciennes :

CREATE POLICY "Allow all case_phases" ON public.case_phases FOR ALL TO public USING (true);
CREATE POLICY "Allow all case_photos" ON public.case_photos FOR ALL TO public USING (true);
CREATE POLICY "Allow all case_steps" ON public.case_steps FOR ALL TO public USING (true);
CREATE POLICY "allow all" ON public.clinic_module_settings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for clinics" ON public.clinics FOR ALL TO public USING (true);
CREATE POLICY "Allow all implant_cases" ON public.implant_cases FOR ALL TO public USING (true);
CREATE POLICY "Allow all portfolio_folders" ON public.portfolio_folders FOR ALL TO public USING (true);
CREATE POLICY "Allow all portfolio_photos" ON public.portfolio_photos FOR ALL TO public USING (true);
CREATE POLICY "Allow all pricing_grid" ON public.pricing_grid FOR ALL TO public USING (true);
CREATE POLICY "Allow all treatment_lines" ON public.treatment_lines FOR ALL TO public USING (true);
CREATE POLICY "Allow all treatment_plans" ON public.treatment_plans FOR ALL TO public USING (true);
CREATE POLICY "Allow all treatments" ON public.treatments FOR ALL TO public USING (true);
CREATE POLICY "Users can manage treatments" ON public.treatments FOR ALL TO public USING (true);
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage visits" ON public.visits FOR ALL TO public USING (true);
