-- ====================================
-- PRICEBOX MVP - BASE DE DATOS COMPLETA
-- ====================================
-- Fecha: 2025-11-08
-- Base de datos: Supabase PostgreSQL
-- Propósito: Documentación para IAs
-- ====================================

-- ====================================
-- ÍNDICE
-- ====================================
-- 1. Tablas principales
-- 2. Triggers y funciones
-- 3. Row Level Security (RLS)
-- 4. Constraints y relaciones

-- ====================================
-- 1. TABLAS PRINCIPALES
-- ====================================

-- ========================================
-- Tabla: organizations
-- ========================================
-- Descripción: Una organización por usuario
-- Relación: owner_id → auth.users.id (UNIQUE)
-- Trigger: Se crea automáticamente cuando un usuario se registra
-- ========================================

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraint único para evitar duplicados
  CONSTRAINT unique_owner_id UNIQUE (owner_id)
);

COMMENT ON TABLE public.organizations IS 'Una organización por usuario. Creada automáticamente por trigger on_auth_user_created.';
COMMENT ON COLUMN public.organizations.owner_id IS 'FK a auth.users.id - UNIQUE garantiza 1 org por usuario';
COMMENT ON COLUMN public.organizations.slug IS 'Identificador único para URLs. Formato: email-uuid';

-- ========================================
-- Tabla: organization_profiles
-- ========================================
-- Descripción: Configuración económica de la organización
-- Relación: organization_id → organizations.id (UNIQUE)
-- Trigger: Se crea automáticamente cuando se crea una organización
-- ========================================

CREATE TABLE public.organization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  ideal_monthly_salary NUMERIC NOT NULL DEFAULT 0,
  fixed_costs NUMERIC NOT NULL DEFAULT 0,
  variable_costs NUMERIC NOT NULL DEFAULT 0,
  province TEXT NOT NULL DEFAULT 'Buenos Aires',
  socioeconomic_level TEXT NOT NULL DEFAULT 'medium' CHECK (socioeconomic_level IN ('low', 'medium', 'high')),
  is_setup_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraint único: 1 profile por organización
  CONSTRAINT unique_organization_profile UNIQUE (organization_id)
);

COMMENT ON TABLE public.organization_profiles IS 'Configuración económica de cada organización. Creada por trigger on_organization_created.';
COMMENT ON COLUMN public.organization_profiles.ideal_monthly_salary IS 'Sueldo mensual que el usuario necesita generar';
COMMENT ON COLUMN public.organization_profiles.fixed_costs IS 'Gastos fijos mensuales del negocio (alquiler, servicios, etc.)';
COMMENT ON COLUMN public.organization_profiles.variable_costs IS 'Gastos variables por unidad vendida (packaging, comisiones, etc.)';
COMMENT ON COLUMN public.organization_profiles.socioeconomic_level IS 'Nivel socioeconómico de la zona: low, medium, high';
COMMENT ON COLUMN public.organization_profiles.is_setup_complete IS 'TRUE cuando el usuario completó el onboarding';

-- ========================================
-- Tabla: products
-- ========================================
-- Descripción: Productos creados por la organización
-- Relación: organization_id → organizations.id
-- ========================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  final_price NUMERIC,
  profit_margin NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Productos de cada organización';
COMMENT ON COLUMN public.products.final_price IS 'Precio final calculado del producto';
COMMENT ON COLUMN public.products.profit_margin IS 'Margen de ganancia en porcentaje';

-- ========================================
-- Tabla: product_materials
-- ========================================
-- Descripción: Materiales/ingredientes de cada producto
-- Relación: product_id → products.id
-- ========================================

CREATE TABLE public.product_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cost NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.product_materials IS 'Materiales e ingredientes de cada producto';
COMMENT ON COLUMN public.product_materials.unit IS 'Unidad de medida: kg, litros, unidades, etc.';

-- ========================================
-- Tabla: product_overhead
-- ========================================
-- Descripción: Gastos indirectos asociados a cada producto
-- Relación: product_id → products.id
-- ========================================

CREATE TABLE public.product_overhead (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cost NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.product_overhead IS 'Gastos indirectos del producto (electricidad, gas, etc.)';

-- ========================================
-- Tabla: product_analysis
-- ========================================
-- Descripción: Análisis de rentabilidad de cada producto
-- Relación: product_id → products.id
-- ========================================

CREATE TABLE public.product_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  total_cost NUMERIC NOT NULL,
  suggested_price NUMERIC NOT NULL,
  profit_margin NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.product_analysis IS 'Análisis de costos y rentabilidad calculados';

-- ========================================
-- Tabla: price_history
-- ========================================
-- Descripción: Historial de cambios de precio
-- Relación: product_id → products.id
-- ========================================

CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.price_history IS 'Historial de precios del producto a lo largo del tiempo';

-- ====================================
-- 2. TRIGGERS Y FUNCIONES
-- ====================================

-- ========================================
-- Función: create_organization_on_signup
-- ========================================
-- Descripción: Crea automáticamente una organización cuando un usuario se registra
-- Trigger: on_auth_user_created (AFTER INSERT en auth.users)
-- ========================================

CREATE OR REPLACE FUNCTION public.create_organization_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  _slug VARCHAR(255);
BEGIN
  -- Generar slug único: email-base + primeros 8 chars del UUID
  _slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Insertar organización
  INSERT INTO public.organizations (owner_id, name, slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Mi Negocio'),
    _slug
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log warning pero no fallar el registro
  RAISE WARNING 'Error creating organization for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_organization_on_signup IS 'Trigger function: crea organización automáticamente al registrarse un usuario';

-- ========================================
-- Trigger: on_auth_user_created
-- ========================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_organization_on_signup();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Ejecuta create_organization_on_signup después de crear un usuario';

-- ========================================
-- Función: create_profile_on_organization
-- ========================================
-- Descripción: Crea automáticamente un profile cuando se crea una organización
-- Trigger: on_organization_created (AFTER INSERT en organizations)
-- ========================================

CREATE OR REPLACE FUNCTION public.create_profile_on_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar profile con valores por defecto
  INSERT INTO public.organization_profiles (
    organization_id,
    ideal_monthly_salary,
    fixed_costs,
    variable_costs,
    province,
    socioeconomic_level,
    is_setup_complete
  ) VALUES (
    NEW.id,
    0,
    0,
    0,
    'Buenos Aires',
    'medium',
    FALSE
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating profile for organization %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_profile_on_organization IS 'Trigger function: crea profile automáticamente al crear organización';

-- ========================================
-- Trigger: on_organization_created
-- ========================================

CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_on_organization();

COMMENT ON TRIGGER on_organization_created ON public.organizations IS 'Ejecuta create_profile_on_organization después de crear organización';

-- ====================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ====================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_overhead ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Políticas: organizations
-- ========================================

CREATE POLICY org_owner_select ON public.organizations
  FOR SELECT 
  USING (auth.uid() = owner_id);

COMMENT ON POLICY org_owner_select ON public.organizations IS 'Usuario solo puede ver sus propias organizaciones';

CREATE POLICY org_owner_update ON public.organizations
  FOR UPDATE 
  USING (auth.uid() = owner_id);

COMMENT ON POLICY org_owner_update ON public.organizations IS 'Usuario solo puede editar sus propias organizaciones';

-- ========================================
-- Políticas: organization_profiles
-- ========================================

CREATE POLICY profile_owner_select ON public.organization_profiles
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

COMMENT ON POLICY profile_owner_select ON public.organization_profiles IS 'Usuario solo ve profiles de sus organizaciones';

CREATE POLICY profile_owner_update ON public.organization_profiles
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

COMMENT ON POLICY profile_owner_update ON public.organization_profiles IS 'Usuario solo edita profiles de sus organizaciones';

-- ========================================
-- Políticas: products
-- ========================================

CREATE POLICY product_owner_select ON public.products
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY product_owner_insert ON public.products
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY product_owner_update ON public.products
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY product_owner_delete ON public.products
  FOR DELETE 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

COMMENT ON POLICY product_owner_select ON public.products IS 'Usuario solo ve productos de sus organizaciones';
COMMENT ON POLICY product_owner_insert ON public.products IS 'Usuario solo crea productos en sus organizaciones';
COMMENT ON POLICY product_owner_update ON public.products IS 'Usuario solo edita productos de sus organizaciones';
COMMENT ON POLICY product_owner_delete ON public.products IS 'Usuario solo elimina productos de sus organizaciones';

-- Políticas similares para product_materials, product_overhead, product_analysis, price_history
-- (Implementación similar a products, a través de JOIN con products → organizations)

-- ====================================
-- 4. CONSTRAINTS Y RELACIONES
-- ====================================

-- RESUMEN DE CONSTRAINTS ÚNICOS:
-- - organizations.owner_id (UNIQUE) → 1 organización por usuario
-- - organizations.slug (UNIQUE) → Slugs únicos para URLs
-- - organization_profiles.organization_id (UNIQUE) → 1 profile por organización

-- RESUMEN DE FOREIGN KEYS:
-- organizations.owner_id → auth.users.id (CASCADE)
-- organization_profiles.organization_id → organizations.id (CASCADE)
-- products.organization_id → organizations.id (CASCADE)
-- product_materials.product_id → products.id (CASCADE)
-- product_overhead.product_id → products.id (CASCADE)
-- product_analysis.product_id → products.id (CASCADE)
-- price_history.product_id → products.id (CASCADE)

-- ====================================
-- FIN DE DOCUMENTACIÓN
-- ====================================

-- NOTAS IMPORTANTES:
-- 1. Este archivo documenta la estructura actual de la BD
-- 2. Para crear una BD desde cero, ejecutar en Supabase SQL Editor
-- 3. RLS está HABILITADO en todas las tablas
-- 4. Los triggers se ejecutan automáticamente
-- 5. Service Role Key bypasea RLS (solo usar en servidor)
