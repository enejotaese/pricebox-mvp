# 🤖 DOCUMENTACIÓN COMPLETA PARA IA - PRICEBOX MVP

## 🎯 PROPÓSITO DE ESTE DOCUMENTO

Este README permite que **cualquier IA** (Claude, ChatGPT, Cursor, etc.) entienda el proyecto completo en una sola lectura, sin necesidad de hacer preguntas de contexto.

---

## 📚 ARCHIVOS A LEER EN ORDEN

**Estos 3 archivos contienen TODO el proyecto:**

1. **README_FOR_AI.md** (este archivo) → Guía de lectura y contexto general
2. **PROJECT_COMPLETE.md** → Todo el código fuente del frontend
3. **DATABASE_COMPLETE.sql** → Estructura completa de la base de datos

---

## 🏗️ RESUMEN EJECUTIVO

### ¿Qué es PriceBox?

SaaS para emprendedores argentinos que necesitan calcular precios de productos considerando:
- ✅ Costos de materiales e ingredientes
- ✅ Gastos operativos (fijos y variables)
- ✅ Ubicación geográfica y nivel socioeconómico
- ✅ Rentabilidad deseada
- ✅ Análisis de viabilidad

### Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui components

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security (RLS)
- Triggers automáticos

**Deploy:**
- Vercel (frontend)
- Supabase Cloud (backend)

---

## 📁 ESTRUCTURA DEL PROYECTO

pricebox-mvp/
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── auth/ # Sistema de autenticación
│ │ │ ├── login/page.tsx
│ │ │ └── signup/page.tsx
│ │ ├── onboarding/ # Setup inicial del usuario
│ │ │ └── setup-profile/page.tsx
│ │ ├── dashboard/ # Panel principal (WIP)
│ │ │ ├── page.tsx
│ │ │ ├── products/page.tsx
│ │ │ └── calculator/
│ │ └── api/ # API Routes
│ │ └── auth/
│ │ └── create-organization/route.ts
│ ├── components/ # Componentes React
│ │ ├── ui/ # Componentes UI base (shadcn)
│ │ │ ├── input.tsx
│ │ │ ├── button.tsx
│ │ │ ├── card.tsx
│ │ │ └── ...
│ │ └── calculator/ # Lógica de calculadora
│ ├── lib/ # Utilidades y servicios
│ │ ├── supabase/
│ │ │ ├── client.ts # Cliente browser (RLS activo)
│ │ │ ├── admin.ts # Cliente admin (bypass RLS)
│ │ │ └── profile.ts # Servicios de profile
│ │ └── utils.ts
│ ├── types/ # Tipos TypeScript
│ │ ├── index.d.ts
│ │ └── profile.ts
│ ├── hooks/ # Custom React hooks
│ │ └── useCalculator.ts
│ └── constants/ # Constantes del proyecto
│ └── calculator.ts
├── package.json # Dependencias
├── tsconfig.json # Configuración TypeScript
├── tailwind.config.js # Configuración Tailwind
└── .env.local # Variables de entorno (no en repo)
---

## 🔄 FLUJO COMPLETO DEL USUARIO

### 1. Registro (/auth/signup)

Usuario ingresa email + password
↓
Frontend: supabase.auth.signUp()
↓
Supabase Auth crea usuario en auth.users
↓
Trigger automático: on_auth_user_created
↓
Ejecuta función: create_organization_on_signup()
↓
Inserta en tabla: organizations
↓
Trigger automático: on_organization_created
↓
Ejecuta función: create_profile_on_organization()
↓
Inserta en tabla: organization_profiles
↓
API Route /api/auth/create-organization verifica
↓
Redirección a: /onboarding/setup-profile
**Archivos involucrados:**
- `src/app/auth/signup/page.tsx`
- `src/app/api/auth/create-organization/route.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/admin.ts`

---

### 2. Onboarding (/onboarding/setup-profile)

Usuario configura su perfil económico:
├── Sueldo ideal mensual ($ARS)
├── Gastos fijos mensuales ($ARS)
├── Gastos variables por producto ($ARS)
├── Provincia (dropdown)
└── Nivel socioeconómico (radio: bajo/medio/alto)
↓
Frontend: updateProfile() + completeSetup()
↓
Actualiza organization_profiles
↓
Campo is_setup_complete = TRUE
↓
Redirección a: /dashboard
**Archivos involucrados:**
- `src/app/onboarding/setup-profile/page.tsx`
- `src/lib/supabase/profile.ts`
- `src/types/profile.ts`

---

### 3. Dashboard (/dashboard)

**Estado:** 🚧 En desarrollo

**Funcionalidades planificadas:**
- Resumen de productos
- Análisis de rentabilidad
- Calculadora de precios
- Gestión de materiales

---

## 🗄️ ARQUITECTURA DE BASE DE DATOS

### Tablas Principales (Todas en schema `public`)

#### 1. `organizations`
- **Descripción:** Una organización por usuario
- **Relación:** `owner_id` → `auth.users.id` (UNIQUE)
- **Trigger:** Se crea automáticamente al registrarse un usuario
- **Campos clave:**
  - `owner_id` (UNIQUE) → garantiza 1 org por usuario
  - `slug` (UNIQUE) → identificador para URLs

#### 2. `organization_profiles`
- **Descripción:** Configuración económica de cada organización
- **Relación:** `organization_id` → `organizations.id` (UNIQUE)
- **Trigger:** Se crea automáticamente al crear una organización
- **Campos clave:**
  - `ideal_monthly_salary` → sueldo que el usuario necesita
  - `fixed_costs` → gastos fijos mensuales (alquiler, servicios)
  - `variable_costs` → gastos variables por unidad
  - `province` → ubicación geográfica
  - `socioeconomic_level` → 'low', 'medium', 'high'
  - `is_setup_complete` → TRUE cuando termina onboarding

#### 3. `products`
- **Descripción:** Productos de cada organización
- **Relación:** `organization_id` → `organizations.id`

#### 4. `product_materials`
- **Descripción:** Materiales/ingredientes de cada producto
- **Relación:** `product_id` → `products.id`

#### 5. `product_overhead`
- **Descripción:** Gastos indirectos del producto
- **Relación:** `product_id` → `products.id`

#### 6. `product_analysis`
- **Descripción:** Análisis de rentabilidad calculados
- **Relación:** `product_id` → `products.id`

#### 7. `price_history`
- **Descripción:** Historial de precios del producto
- **Relación:** `product_id` → `products.id`

---

## 🔐 SEGURIDAD (Row Level Security - RLS)

### ¿Qué es RLS?

Sistema de permisos a nivel de fila en PostgreSQL. Cada query automáticamente filtra datos según el usuario autenticado (`auth.uid()`).

### Políticas Implementadas

**organizations:**
- `org_owner_select` → SELECT solo si `owner_id = auth.uid()`
- `org_owner_update` → UPDATE solo si `owner_id = auth.uid()`

**organization_profiles:**
- `profile_owner_select` → SELECT a través de JOIN con organizations
- `profile_owner_update` → UPDATE a través de JOIN con organizations

**products:**
- `product_owner_select` → SELECT a través de JOIN
- `product_owner_insert` → INSERT a través de JOIN
- `product_owner_update` → UPDATE a través de JOIN
- `product_owner_delete` → DELETE a través de JOIN

**Tablas relacionadas (materials, overhead, analysis):**
- Políticas similares a través de JOIN: product → organization → user

---

## 🛠️ COMPONENTES CRÍTICOS

### 1. `src/lib/supabase/client.ts`

**Propósito:** Cliente Supabase para el navegador (frontend)

**Características:**
- Usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- RLS está ACTIVO
- Operaciones limitadas por permisos del usuario
- Usa cookies para mantener sesión

**Cuándo usar:** En componentes cliente, páginas, hooks

---

### 2. `src/lib/supabase/admin.ts`

**Propósito:** Cliente Supabase para el servidor (API Routes)

**Características:**
- Usa `SUPABASE_SERVICE_ROLE_KEY`
- RLS está DESHABILITADO (bypass total)
- Acceso completo a todas las tablas
- ⚠️ **CRÍTICO:** Solo usar en API Routes del servidor

**Cuándo usar:** 
- API Routes que necesitan crear datos en nombre del sistema
- Operaciones que requieren bypass de RLS
- Ejemplo: `/api/auth/create-organization/route.ts`

**⚠️ NUNCA:**
- Exponerlo en el cliente
- Importarlo en componentes React
- Incluir Service Role Key en variables públicas

---

### 3. `src/lib/supabase/profile.ts`

**Propósito:** Funciones helper para gestionar profiles

**Funciones:**
- `getOrCreateProfile(organizationId)` → Obtiene o crea profile
- `updateProfile(organizationId, updates)` → Actualiza profile
- `completeSetup(organizationId)` → Marca setup como completo

---

## 🐛 PROBLEMAS RESUELTOS (Documentación histórica)

### ❌ Problema 1: Recursión infinita en RLS

**Causa:** Políticas RLS que se referenciaban a sí mismas en JOINs complejos

**Solución:** 
- Políticas simples de 1 nivel de JOIN
- Evitar referencias circulares
- Ejemplo correcto:
CREATE POLICY product_owner_select ON products
FOR SELECT USING (
organization_id IN (
SELECT id FROM organizations WHERE owner_id = auth.uid()
)
);
---

### ❌ Problema 2: Organizaciones duplicadas

**Causa:** 
- Trigger `on_auth_user_created` creaba organización
- API Route también intentaba crearla
- Resultado: 2 organizaciones para 1 usuario

**Solución:**
- Constraint `UNIQUE(owner_id)` en tabla `organizations`
- API Route verifica si existe antes de crear
- Manejo de error `23505` (duplicate key)

---

### ❌ Problema 3: Sesión no sincronizada post-signup

**Causa:** Supabase tarda ~1-2 segundos en establecer la sesión después de `signUp()`

**Solución:**
- Retry logic con esperas de 500ms (hasta 15 intentos)
- Pasar `user_id` explícitamente desde signup a API Route
- No depender de `getUser()` inmediatamente después de signup

---

### ❌ Problema 4: Slug duplicado

**Causa:** Slugs generados solo con email base (colisiones posibles)

**Solución:**
- Slug incluye: `email-base` + `timestamp` + `random-string`
- Formato: `usuario-mhpp921u-48ac4e6b`
- Garantiza unicidad

---

## ✅ ESTADO ACTUAL DEL PROYECTO

### Completado y Funcionando

- ✅ Sistema de autenticación completo (signup/login)
- ✅ Triggers automáticos para crear organizations y profiles
- ✅ RLS policies implementadas correctamente
- ✅ Onboarding flow funcional
- ✅ API Routes para operaciones del sistema
- ✅ Backup en GitHub (`backup-2025-11-08-auth-working`)

### Pendiente de Implementación

- 🚧 Dashboard completo con métricas
- 🚧 CRUD de productos
- 🚧 Calculadora de precios avanzada
- 🚧 Gestión de materiales y overhead
- 🚧 Análisis de rentabilidad
- 🚧 Sistema de roles (admin/editor/viewer)
- �� Export/import de datos

---

## 🚀 VARIABLES DE ENTORNO

### Archivo: `.env.local`

Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY_HERE]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY_HERE] # ⚠️ Server-only
### ⚠️ Notas de Seguridad:

1. **NEXT_PUBLIC_*** → Expuesto en el cliente (navegador)
2. **SUPABASE_SERVICE_ROLE_KEY** → NUNCA exponer en cliente
3. Solo usar Service Role Key en API Routes del servidor
4. `.env.local` está en `.gitignore` (no se sube a GitHub)

---

## 🎓 CÓMO USAR ESTA DOCUMENTACIÓN

### Para Claude / ChatGPT / Cursor:

**Paso 1:** Sube estos 3 archivos al chat:
- `README_FOR_AI.md` (este archivo)
- `PROJECT_COMPLETE.md`
- `DATABASE_COMPLETE.sql`

**Paso 2:** Di:
> "Lee estos 3 archivos y entiende el proyecto completo. Luego, responde 'Entendido' cuando estés listo."

**Paso 3:** Pregunta:
> "Ahora necesito implementar [nueva funcionalidad]. ¿Cómo procedo?"

---

### Para IAs sin capacidad de upload:

**Opción A (Recomendada):** Copia y pega en partes:
1. Primero este README completo
2. Luego secciones relevantes de `PROJECT_COMPLETE.md`
3. Solo si es necesario, partes de `DATABASE_COMPLETE.sql`

**Opción B:** Resume tu pregunta con contexto:
> "Tengo un proyecto Next.js 14 + Supabase llamado PriceBox. Tiene autenticación, RLS, y un sistema de organizaciones. Archivo PROJECT_COMPLETE.md tiene todo el código. Necesito implementar [X]."

---

## 📊 MÉTRICAS DEL PROYECTO

- **Archivos TypeScript:** ~30
- **Líneas de código:** ~3,000
- **Tablas en BD:** 7
- **Triggers:** 2
- **Políticas RLS:** ~15
- **Componentes React:** ~20
- **API Routes:** 1

---

## �� RECURSOS EXTERNOS

- **Repositorio:** https://github.com/enejotaese/pricebox-mvp
- **Rama estable:** `backup-2025-11-08-auth-working`
- **Supabase:** https://supabase.com/dashboard
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind Docs:** https://tailwindcss.com/docs

---

## 📝 NOTAS FINALES

1. **Este proyecto está en desarrollo activo**
2. **La rama `main` puede tener cambios no documentados aquí**
3. **Usa la rama `backup-2025-11-08-auth-working` como referencia estable**
4. **Actualiza este README cuando agregues features importantes**

---

**Última actualización:** 2025-11-08 12:00 PM
**Estado:** ✅ Sistema de autenticación completo y funcionando
**Próximo milestone:** Dashboard completo + CRUD productos
