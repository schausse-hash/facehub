-- =====================================================
-- MIGRATION FACEHUB v8.1 - Support Multi-Cliniques
-- =====================================================
-- Version corrigée avec champs téléphone et date de naissance
-- =====================================================

-- 1. Créer la table des cliniques
CREATE TABLE IF NOT EXISTS clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- 2. Ajouter les colonnes clinic_id aux tables existantes
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);
ALTER TABLE user_requests ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);

-- 3. Ajouter les nouveaux champs à user_requests (téléphone et date de naissance)
ALTER TABLE user_requests ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE user_requests ADD COLUMN IF NOT EXISTS birthdate DATE;

-- 4. Ajouter le nom du praticien aux visites
ALTER TABLE visits ADD COLUMN IF NOT EXISTS practitioner_name VARCHAR(255);

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_clinic ON user_roles(clinic_id);
CREATE INDEX IF NOT EXISTS idx_visits_user ON visits(user_id);

-- 6. Activer RLS sur la table clinics
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- 7. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view their own clinic" ON clinics;
DROP POLICY IF EXISTS "Super admins can view all clinics" ON clinics;
DROP POLICY IF EXISTS "Users can view patients from their clinic" ON patients;
DROP POLICY IF EXISTS "Users can insert patients in their clinic" ON patients;
DROP POLICY IF EXISTS "Users can update patients in their clinic" ON patients;
DROP POLICY IF EXISTS "Allow all for clinics" ON clinics;

-- 8. Créer une policy simple pour clinics
CREATE POLICY "Allow all for clinics" ON clinics FOR ALL USING (true);

-- 9. Migration des données existantes
DO $$
DECLARE
  default_clinic_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM patients WHERE clinic_id IS NULL LIMIT 1) THEN
    INSERT INTO clinics (name, is_active)
    VALUES ('Clinique par défaut', true)
    RETURNING id INTO default_clinic_id;
    
    UPDATE patients SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    UPDATE user_roles SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    UPDATE user_profiles SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    
    RAISE NOTICE 'Migration effectuée. Clinique par défaut créée: %', default_clinic_id;
  END IF;
END $$;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
